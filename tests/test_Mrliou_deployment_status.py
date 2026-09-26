"""Regression for unconditional deployment checkmarks and lost history."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location(
    "deployment_status", Path(__file__).parents[1] / "tools/Mrliou_deployment_status.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class DeploymentStatusTests(unittest.TestCase):
    def test_failed_or_unobserved_run_never_claims_success(self):
        for result in ("failure", "skipped", "cancelled", "", "unexpected"):
            with self.subTest(result=result), tempfile.TemporaryDirectory() as tmp:
                path = Path(tmp) / "STATUS.md"
                MODULE.append_receipt(path, result, "a" * 40, "https://github.com/run/1")
                text = path.read_text()
                self.assertNotIn("DEPLOY_JOB_SUCCESS", text)
                self.assertNotIn("✅", text)
                self.assertIn("does not mean an existing deployment", text)

    def test_success_is_scoped_and_preserves_prior_observations(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "STATUS.md"
            original = "# 歷史紀錄\n原始 bytes\n".encode()
            path.write_bytes(original)
            MODULE.append_receipt(path, "failure", "a" * 40, "https://github.com/run/1")
            first = path.read_bytes()
            MODULE.append_receipt(path, "success", "b" * 40, "https://github.com/run/2")
            self.assertTrue(first.startswith(original))
            self.assertTrue(path.read_bytes().startswith(first))
            text = path.read_text()
            self.assertIn("DEPLOY_JOB_SUCCESS", text)
            self.assertIn("particle-auth-gateway: NOT_OBSERVED", text)
            self.assertIn("DL580 health: NOT_OBSERVED", text)
            self.assertIn("b" * 40, text)


if __name__ == "__main__":
    unittest.main()
