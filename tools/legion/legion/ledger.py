"""SQLite ledger: every task, verdict and event is recorded so runs can be
audited afterwards and resumed after a crash or budget stop."""
from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path

from .models import Task, TaskResult

SCHEMA = """
CREATE TABLE IF NOT EXISTS run (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, seq INTEGER NOT NULL, data TEXT NOT NULL,
    status TEXT NOT NULL, result TEXT
);
CREATE TABLE IF NOT EXISTS events (
    ts REAL NOT NULL, task_id TEXT, kind TEXT NOT NULL, payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_task ON events(task_id);
"""


class Ledger:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(self.path)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=NORMAL")
        self.db.executescript(SCHEMA)
        self._pending = 0

    def set_meta(self, key: str, value) -> None:
        self.db.execute("INSERT OR REPLACE INTO run(k, v) VALUES (?, ?)", (key, json.dumps(value)))
        self.db.commit()

    def get_meta(self, key: str, default=None):
        row = self.db.execute("SELECT v FROM run WHERE k = ?", (key,)).fetchone()
        return json.loads(row[0]) if row else default

    def save_tasks(self, tasks: list[Task]) -> None:
        self.db.executemany(
            "INSERT OR IGNORE INTO tasks(id, seq, data, status) VALUES (?, ?, ?, 'PENDING')",
            [(t.id, i, json.dumps(t.to_dict())) for i, t in enumerate(tasks)],
        )
        self.db.commit()

    def load_tasks(self) -> list[Task]:
        rows = self.db.execute("SELECT data FROM tasks ORDER BY seq").fetchall()
        return [Task.from_dict(json.loads(r[0])) for r in rows]

    def save_result(self, result: TaskResult) -> None:
        self.db.execute(
            "UPDATE tasks SET status = ?, result = ? WHERE id = ?",
            (result.status, json.dumps(result.to_dict()), result.task_id),
        )
        self._tick()

    def load_results(self) -> dict[str, TaskResult]:
        rows = self.db.execute("SELECT id, result FROM tasks WHERE result IS NOT NULL").fetchall()
        return {r[0]: TaskResult.from_dict(json.loads(r[1])) for r in rows}

    def event(self, kind: str, task_id: str | None = None, **payload) -> None:
        self.db.execute(
            "INSERT INTO events(ts, task_id, kind, payload) VALUES (?, ?, ?, ?)",
            (time.time(), task_id, kind, json.dumps(payload, default=str)),
        )
        self._tick()

    def status_counts(self) -> dict[str, int]:
        return dict(self.db.execute("SELECT status, COUNT(*) FROM tasks GROUP BY status").fetchall())

    def _tick(self) -> None:
        self._pending += 1
        if self._pending >= 200:
            self.flush()

    def flush(self) -> None:
        self.db.commit()
        self._pending = 0

    def close(self) -> None:
        self.flush()
        self.db.close()
