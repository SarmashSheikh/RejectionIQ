import os
import json
import datetime

class JSONReportGenerator:
    def __init__(self, test_results, output_dir):
        self.results = test_results
        self.output_dir = output_dir

    def generate_json_report(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "Passed")
        failed = sum(1 for r in self.results if r["status"] == "Failed")
        skipped = sum(1 for r in self.results if r["status"] == "Skipped")
        
        payload = {
            "summary": {
                "timestamp": datetime.datetime.now().isoformat(),
                "total": total,
                "passed": passed,
                "failed": failed,
                "skipped": skipped,
                "pass_rate_pct": round((passed / total * 100.0) if total > 0 else 0, 2)
            },
            "test_cases": self.results
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
