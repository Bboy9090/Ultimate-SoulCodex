"""Unified Native Next Wave Desktop Launcher — ZIES v1.0 Compliant (Failure Transparency).

Never swallows backend startup failures or WebView initialization errors silently.
If startup fails, displays an explicit native OS error dialog with the failure cause and log path, then exits non-zero.
"""

from __future__ import annotations

import argparse
import ctypes
import json
import os
import socket
import sys
import threading
import time
import traceback
import urllib.request
from pathlib import Path

if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
    BUNDLE_ROOT = Path(sys._MEIPASS)
else:
    BUNDLE_ROOT = Path(__file__).resolve().parent

if str(BUNDLE_ROOT) not in sys.path:
    sys.path.insert(0, str(BUNDLE_ROOT))

import platform_exclusive  # noqa: E402


def _setup_windowed_stdio(app_slug: str) -> Path:
    log_dir = platform_exclusive.local_data_dir(app_slug)
    log_path = log_dir / "launch.log"
    if sys.stdout is None or sys.stderr is None:
        log_fp = open(log_path, "a", encoding="utf-8", buffering=1)
        if sys.stdout is None:
            sys.stdout = log_fp
        if sys.stderr is None:
            sys.stderr = log_fp
    return log_path


def _show_fatal_error(title: str, message: str) -> None:
    if platform_exclusive.current_os() == "windows":
        try:
            ctypes.windll.user32.MessageBoxW(0, message, f"{title} — Startup Error", 0x10)
        except Exception:
            pass
    print(f"[FATAL] {title}: {message}", file=sys.stderr)


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def load_meta() -> dict:
    return json.loads((BUNDLE_ROOT / "app_meta.json").read_text(encoding="utf-8"))


def wait_for_server(port: int, timeout: float = 12.0) -> tuple[bool, str | None]:
    deadline = time.time() + timeout
    url = f"http://127.0.0.1:{port}/api/health"
    last_err = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.5) as resp:
                if resp.status == 200:
                    return True, None
                last_err = f"HTTP {resp.status}"
        except Exception as exc:
            last_err = str(exc)
            time.sleep(0.15)
    return False, last_err


class NativeBridge:
    def __init__(self, window_ref):
        self._win_ref = window_ref

    def open_data_folder(self, app_slug: str) -> str:
        d = platform_exclusive.local_data_dir(app_slug)
        if platform_exclusive.current_os() == "windows":
            os.startfile(str(d))
        elif platform_exclusive.current_os() == "macos":
            os.system(f'open "{d}"')
        else:
            os.system(f'xdg-open "{d}" &')
        return str(d)

    def pick_file(self) -> str:
        import webview
        w = self._win_ref[0]
        res = w.create_file_dialog(webview.OPEN_DIALOG)
        if res and len(res) > 0:
            return str(res[0])
        return ""

    def toggle_fullscreen(self) -> bool:
        self._win_ref[0].toggle_fullscreen()
        return True


def run_self_test(port: int, meta: dict, server_error: list[str], out_path: str | None = None) -> int:
    ok, err = wait_for_server(port, timeout=12.0)
    if not ok or server_error:
        payload = {"ok": False, "error": server_error[0] if server_error else f"Server failed to start: {err}"}
        if out_path:
            Path(out_path).write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(json.dumps(payload))
        return 1
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=5) as r:
        health = json.loads(r.read().decode("utf-8"))
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/platform", timeout=5) as r:
        plat = json.loads(r.read().decode("utf-8"))
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=5) as r:
        html_bytes = r.read()
        html_len = len(html_bytes)
        html_valid = html_len > 100 and b"<html" in html_bytes.lower()
    icon_ok = (BUNDLE_ROOT / "assets" / "icon_256.png").exists()
    splash_ok = (BUNDLE_ROOT / "assets" / "splash_1280x720.jpg").exists()
    result = {
        "ok": bool(health.get("ok")) and icon_ok and splash_ok and html_valid,
        "app": meta.get("title"),
        "slug": meta.get("slug"),
        "os": plat.get("os"),
        "html_bytes": html_len,
        "icon_bundled": icon_ok,
        "splash_bundled": splash_ok,
        "health": health,
    }
    txt = json.dumps(result, indent=2)
    if out_path:
        Path(out_path).write_text(txt, encoding="utf-8")
    print(txt)
    return 0 if result["ok"] else 2


def main():
    meta = load_meta()
    title = meta.get("title", "Next Wave App")
    log_path = _setup_windowed_stdio(meta.get("slug", "nextwave-app"))

    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true", help="Run automated headless verification and exit")
    parser.add_argument("--self-test-out", type=str, default=None, help="Write self-test JSON output to file")
    args, _ = parser.parse_known_args()

    import app_engine

    port = find_free_port()
    server_error: list[str] = []

    def _run_srv():
        try:
            app_engine.start_server(port, BUNDLE_ROOT, meta)
        except Exception:
            tb = traceback.format_exc()
            server_error.append(tb)
            with open(log_path, "a", encoding="utf-8") as lf:
                lf.write(f"\n[SERVER FATAL]\n{tb}\n")

    srv_thread = threading.Thread(target=_run_srv, daemon=True)
    srv_thread.start()

    if args.self_test:
        sys.exit(run_self_test(port, meta, server_error, args.self_test_out))

    ready, err = wait_for_server(port, timeout=14.0)
    if not ready or server_error:
        detail = server_error[0] if server_error else f"Local backend did not respond on port {port}: {err}"
        _show_fatal_error(title, f"Backend failed to start truthfully.\n\n{detail[:600]}\n\nFull log: {log_path}")
        sys.exit(1)

    url = f"http://127.0.0.1:{port}/"
    try:
        import webview

        win_ref = [None]
        bridge = NativeBridge(win_ref)
        theme = meta.get("theme", {})
        bg_color = theme.get("bg", "#0A0F1E")
        icon_file = str(BUNDLE_ROOT / "assets" / "icon_256.png")

        win = webview.create_window(
            title=title,
            url=url,
            width=int(meta.get("width", 1360)),
            height=int(meta.get("height", 860)),
            min_size=(960, 620),
            background_color=bg_color,
            js_api=bridge,
        )
        win_ref[0] = win
        if platform_exclusive.current_os() == "windows":
            webview.start(gui="edgechromium")
        else:
            webview.start(icon=icon_file if os.path.exists(icon_file) else None)
    except Exception:
        tb = traceback.format_exc()
        with open(log_path, "a", encoding="utf-8") as lf:
            lf.write(f"\n[WEBVIEW FATAL]\n{tb}\n")
        _show_fatal_error(title, f"Native desktop window (Edge WebView2) failed to initialize.\n\n{tb[:600]}\n\nFull log: {log_path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
