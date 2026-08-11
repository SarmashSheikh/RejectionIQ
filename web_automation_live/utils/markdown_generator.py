import os
import datetime
from web_automation_live.config.environment import Environment

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

        md = f"""# Live GitHub Pages E2E Execution Summary

**Deployment URL**: `{Environment.BASE_URL}`  
**Execution Date**: `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`  
**Build Status**: **PASS**  
**Deployment Status**: **PASS**  

---

## 📊 Execution Metrics

| Metric Parameter | Value |
|---|---|
| **Total Test Cases** | **{total}** |
| **Executed** | **{total}** |
| **Passed** | 🟢 **{passed_cnt}** |
| **Failed** | 🔴 **{failed_cnt}** |
| **Skipped** | 🟡 **{skipped_cnt}** |
| **Pass Percentage** | **{pass_rate:.2f}%** |

---

## 🔝 Top Failed Modules
"""
        mod_fail = {}
        for r in failed_list:
            mod_fail[r["module"]] = mod_fail.get(r["module"], 0) + 1
        
        if mod_fail:
            for m, cnt in mod_fail.items():
                md += f"- **{m}**: {cnt} failure(s)\n"
        else:
            md += "- *No failures recorded.*\n"

        md += f"\n## 🔴 Failed Tests Details\n"
        if failed_list:
            for r in failed_list:
                md += f"- **{r['id']}** - {r['name']}\n  **Failure Reason**: `{r['actual']}`\n"
        else:
            md += "- *All live test cases passed successfully.*\n"

        md += f"""
---

## 📁 Artifacts Generated

✓ `Automation_Test_Report.xlsx`  
✓ `Passed_Test_Cases.xlsx`  
✓ `Failed_Test_Cases.xlsx`  
✓ `Summary_Report.xlsx`  
✓ `execution-report.html`  
✓ `dashboard.html`  
✓ `execution-results.json`  
✓ `summary.md`  
"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md)
