"""Serves Bobby's ACTUAL compiled production SPA bundle + live OS-exclusive APIs."""
from __future__ import annotations
import mimetypes
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
import platform_exclusive

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("application/wasm", ".wasm")

def _resolve_spa_dir(bundle_root: Path) -> Path:
    cand = bundle_root / "real_app"
    if (cand / "index.html").exists():
        return cand
    disk_rel = 'Ultimate-SoulCodex/dist/public'
    if disk_rel:
        for base in [
            Path(r"C:\Users\hareb\Desktop\Bobbys-Apps"),
            bundle_root.parent,
            bundle_root.parent.parent,
            Path.cwd(),
        ]:
            p = base / disk_rel
            if (p / "index.html").exists():
                return p
    return bundle_root / "ui"

def start_server(port: int, bundle_root: Path, meta: dict):
    app = Flask(__name__)
    spa_dir = _resolve_spa_dir(bundle_root)
    assets_dir = bundle_root / "assets"

    @app.route("/api/health")
    def health():
        return jsonify({"ok": True, "app": meta["title"], "spa_dir": str(spa_dir), "real_bundle": (spa_dir / "index.html").exists()})

    @app.route("/api/platform")
    def plat():
        return jsonify(platform_exclusive.get_system_overview())

    @app.route("/api/usb")
    def api_usb():
        return jsonify(platform_exclusive.scan_usb_hardware())

    @app.route("/api/disks")
    def api_disks():
        return jsonify(platform_exclusive.scan_physical_disks())

    @app.route("/api/clipboard")
    def api_clip():
        return jsonify({"text": platform_exclusive.get_clipboard_text()})

    @app.route("/_nw_assets/<path:f>")
    def nw_assets(f):
        return send_from_directory(assets_dir, f)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_spa(path):
        if path:
            target = spa_dir / path
            if target.exists() and target.is_file():
                return send_from_directory(spa_dir, path)
        return send_from_directory(spa_dir, "index.html")

    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
