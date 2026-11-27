"""Isolated negative controls for the product identity gate."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("identity_gate", ROOT / "scripts/verify_product_identity.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class ProductIdentityTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.meta = self.root / "desktop_suite/app_meta.json"
        self.meta.parent.mkdir()
        self.contract = self.root / "product-identity.json"
        self.meta.write_bytes((ROOT / "desktop_suite/app_meta.json").read_bytes())
        self.contract.write_bytes((ROOT / "product-identity.json").read_bytes())
        self.ui = self.root / "desktop_suite/ui/index.html"
        self.ui.parent.mkdir(exist_ok=True)
        self.ui.write_bytes((ROOT / "desktop_suite/ui/index.html").read_bytes())

    def test_current_source(self):
        self.assertEqual(gate.verify(ROOT), 4)

    def test_old_name(self):
        data = json.loads(self.meta.read_text())
        data["title"] = "Ultimate SoulCodex"
        self.meta.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Identity mismatch"):
            gate.verify(self.root)

    def test_changed_slug(self):
        data = json.loads(self.meta.read_text())
        data["slug"] = "new-slug"
        self.meta.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Identity mismatch"):
            gate.verify(self.root)

    def test_missing_source(self):
        self.meta.unlink()
        with self.assertRaisesRegex(ValueError, "Missing metadata"):
            gate.verify(self.root)

    def test_missing_check(self):
        data = json.loads(self.contract.read_text())
        data["checks"].pop()
        self.contract.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Required identity checks missing"):
            gate.verify(self.root)

    def test_duplicate_key(self):
        self.meta.write_text('{"title":"Legacy","title":"Soul Codex"}')
        with self.assertRaisesRegex(ValueError, "Duplicate JSON key"):
            gate.verify(self.root)

    def test_contract_rename(self):
        data = json.loads(self.contract.read_text())
        data["public_name"] = "Ultimate SoulCodex"
        self.contract.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, "Unresolved or changed"):
            gate.verify(self.root)

    def test_old_ui_title(self):
        self.ui.write_text("<title>Ultimate SoulCodex</title>")
        with self.assertRaisesRegex(ValueError, "Desktop UI title mismatch"):
            gate.verify(self.root)

    def test_missing_ui(self):
        self.ui.unlink()
        with self.assertRaisesRegex(ValueError, "Missing or unsafe"):
            gate.verify(self.root)


if __name__ == "__main__":
    unittest.main()
