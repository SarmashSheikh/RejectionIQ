import os
import datetime

class MarkdownSummaryGenerator:
    def __init__(self, test_results, output_dir):
        self.results = test_results
        self.output_dir = output_dir

    def generate_markdown_summary(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        total = len(self.results)
        passed_list = [r for r in self.results if r["status"] == "Passed"]
        failed_list = [r for r in self.results if r["status"] == "Failed"]
        skipped_list = [r for r in self.results if r["status"] == "Skipped"]
        
        passed_cnt = len(passed_list)
        failed_cnt = len(failed_list)
        skipped_cnt = len(skipped_list)
        pass_rate = (passed_cnt / total * 100.0) if total > 0 else 0.0
        fail_rate = (failed_cnt / total * 100.0) if total > 0 else 0.0

        md = f"""# Android Appium E2E Execution Summary

**Execution Date**: `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`  
**Target Device**: `Android Emulator / Physical Device`  
**Framework Engine**: `Appium UiAutomator2 (Python/Pytest Engine)`  

---

## 📊 Execution Metrics

| Metric Parameter | Value |
|---|---|
| **Total Executed Test Cases** | **{total}** |
| **Passed Tests** | 🟢 **{passed_cnt}** |
| **Failed Tests** | 🔴 **{failed_cnt}** |
| **Skipped Tests** | 🟡 **{skipped_cnt}** |
| **Pass Percentage** | **{pass_rate:.2f}%** |
| **Fail Percentage** | **{fail_rate:.2f}%** |

---

## 📋 VALID TEST CASE SUMMARY

### 🟢 PASSED TESTS ({passed_cnt})
"""
        for r in passed_list[:15]:
            md += f"- ✓ **{r['id']}** - {r['name']}\n"
        if len(passed_list) > 15:
            md += f"- *... and {len(passed_list) - 15} more passed test cases*\n"

        md += f"\n### 🔴 FAILED TESTS ({failed_cnt})\n"
        if failed_list:
            for r in failed_list:
                md += f"- ✗ **{r['id']}** - {r['name']}\n  **Reason**: `{r['actual']}`\n"
        else:
            md += "- *No failed test cases recorded.*\n"

        md += f"\n### 🟡 SKIPPED TESTS ({skipped_cnt})\n"
        if skipped_list:
            for r in skipped_list:
                md += f"- - **{r['id']}** - {r['name']}\n  **Reason**: `{r['actual']}`\n"
        else:
            md += "- *No skipped test cases recorded.*\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md)
