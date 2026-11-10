"""Pure classification tests; run: python3 -m unittest discover -s tests -p 'test_branch_salvage.py'."""
from pathlib import Path
import importlib.util
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "audit_branch_salvage.py"
spec = importlib.util.spec_from_file_location("audit_branch_salvage", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class BranchSalvageClassificationTests(unittest.TestCase):
    def test_equal_or_behind(self):
        self.assertEqual(module.classify(0, 200, None), "ancestor_or_equal")
        self.assertEqual(module.classify(0, 0, 0), "ancestor_or_equal")

    def test_patch_equivalent(self):
        self.assertEqual(module.classify(9, 200, 0), "patch_equivalent_review")

    def test_merge_commits_are_not_silently_called_patch_equivalent(self):
        # git cherry omits merge commits even when they change the tree.
        self.assertEqual(module.classify(3, 10, 0, merge_count=1), "manual_review")
        self.assertEqual(module.classify(1, 0, 0, merge_count=1), "manual_review")
        self.assertEqual(module.classify(3, 10, 1, merge_count=1), "diverged_unique_review")

    def test_real_inspection_records_merge_only_uncertainty(self):
        # Simulate git rev-list ancestry, exclusive merges, and a cherry
        # output containing only a patch-equivalent non-merge commit.
        with patch.object(module, "git", side_effect=["1 2", "1", "- abcd1234"]):
            result = module.inspect_branch("origin/main", "origin/example")
        self.assertEqual(result["ahead"], 2)
        self.assertEqual(result["exclusive_merge_commits"], 1)
        self.assertEqual(result["unrepresented_patch_ids"], 0)
        self.assertEqual(result["status"], "manual_review")

    def test_missing_patch_id_data_must_not_be_accepted(self):
        self.assertEqual(module.classify(1, 5, None), "manual_review")

    def test_diverged_unique(self):
        self.assertEqual(module.classify(2, 50, 1), "diverged_unique_review")

    def test_ahead_unique(self):
        self.assertEqual(module.classify(1, 0, 1), "ahead_unique_review")


if __name__ == "__main__":
    unittest.main()
