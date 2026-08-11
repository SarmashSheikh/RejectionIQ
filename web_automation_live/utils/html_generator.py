import os
import datetime
from web_automation_live.config.environment import Environment

class HTMLReportGenerator:
    def __init__(self, test_results, output_dir):
        self.results = test_results
        self.output_dir = output_dir

    def generate_all_html_reports(self):
        os.makedirs(self.output_dir, exist_ok=True)
        self.generate_execution_report(os.path.join(self.output_dir, "execution-report.html"))
        self.generate_dashboard_report(os.path.join(self.output_dir, "dashboard.html"))

    def generate_execution_report(self, filepath):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "Passed")
        failed = sum(1 for r in self.results if r["status"] == "Failed")
        skipped = sum(1 for r in self.results if r["status"] == "Skipped")
        pass_rate = (passed / total * 100.0) if total > 0 else 0.0

        rows_html = ""
        for r in self.results:
            st = r["status"]
            badge_cls = "bg-green-100 text-green-800" if st == "Passed" else "bg-red-100 text-red-800"
            rows_html += f"""
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                <td class="px-4 py-3 font-mono font-bold text-slate-800">{r['id']}</td>
                <td class="px-4 py-3 text-slate-600 font-medium">{r['module']}</td>
                <td class="px-4 py-3 text-slate-900 font-semibold">{r['name']}</td>
                <td class="px-4 py-3 text-center"><span class="px-2 py-1 text-xs font-bold rounded bg-slate-100 text-slate-700">{r['priority']}</span></td>
                <td class="px-4 py-3 text-center"><span class="px-3 py-1 text-xs font-extrabold rounded-full {badge_cls}">{st}</span></td>
                <td class="px-4 py-3 text-center text-slate-500 font-mono">{r['duration_ms']}ms</td>
                <td class="px-4 py-3 text-xs text-slate-500">{r['actual']}</td>
            </tr>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Live GitHub Pages Selenium E2E Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-8 font-sans">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
            <div>
                <span class="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Live E2E Pipeline</span>
                <h1 class="text-3xl font-extrabold text-white mt-2">Live GitHub Pages Selenium E2E Execution Report</h1>
                <p class="text-slate-400 text-sm mt-1">Target Base URL: <a href="{Environment.BASE_URL}" target="_blank" class="text-indigo-400 underline">{Environment.BASE_URL}</a> | Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            <a href="dashboard.html" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition">View Dashboard</a>
        </header>

        <div class="grid grid-cols-4 gap-4 mb-8">
            <div class="bg-slate-800 p-5 rounded-xl border border-slate-700"><p class="text-xs font-bold text-slate-400 uppercase">Total Tests</p><p class="text-3xl font-extrabold text-white mt-1">{total}</p></div>
            <div class="bg-slate-800 p-5 rounded-xl border border-emerald-500/30"><p class="text-xs font-bold text-emerald-400 uppercase">Passed</p><p class="text-3xl font-extrabold text-emerald-400 mt-1">{passed}</p></div>
            <div class="bg-slate-800 p-5 rounded-xl border border-rose-500/30"><p class="text-xs font-bold text-rose-400 uppercase">Failed</p><p class="text-3xl font-extrabold text-rose-400 mt-1">{failed}</p></div>
            <div class="bg-slate-800 p-5 rounded-xl border border-indigo-500/30"><p class="text-xs font-bold text-indigo-400 uppercase">Pass Rate %</p><p class="text-3xl font-extrabold text-indigo-400 mt-1">{pass_rate:.1f}%</p></div>
        </div>

        <div class="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-4 bg-slate-800 border-b border-slate-700"><h2 class="text-lg font-bold text-white">Live Execution Log ({total} Test Cases)</h2></div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-slate-300">
                    <thead class="bg-slate-900 text-slate-400 uppercase text-xs">
                        <tr>
                            <th class="px-4 py-3">Test ID</th>
                            <th class="px-4 py-3">Module</th>
                            <th class="px-4 py-3">Scenario</th>
                            <th class="px-4 py-3 text-center">Priority</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-center">Duration</th>
                            <th class="px-4 py-3">Actual Result</th>
                        </tr>
                    </thead>
                    <tbody class="bg-slate-800/40">{rows_html}</tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)

    def generate_dashboard_report(self, filepath):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "Passed")
        failed = sum(1 for r in self.results if r["status"] == "Failed")
        pass_rate = (passed / total * 100.0) if total > 0 else 0.0

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Live E2E Automation Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 p-8 font-sans">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-extrabold text-white mb-2">Live GitHub Pages E2E Dashboard</h1>
        <p class="text-slate-400 text-sm mb-6">Target: {Environment.BASE_URL}</p>
        <div class="grid grid-cols-4 gap-6 mb-8">
            <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700"><p class="text-slate-400 text-xs font-bold uppercase">Total Tests</p><p class="text-4xl font-extrabold text-white mt-2">{total}</p></div>
            <div class="bg-slate-800 p-6 rounded-2xl border border-emerald-500/30"><p class="text-emerald-400 text-xs font-bold uppercase">Passed</p><p class="text-4xl font-extrabold text-emerald-400 mt-2">{passed}</p></div>
            <div class="bg-slate-800 p-6 rounded-2xl border border-rose-500/30"><p class="text-rose-400 text-xs font-bold uppercase">Failed</p><p class="text-4xl font-extrabold text-rose-400 mt-2">{failed}</p></div>
            <div class="bg-slate-800 p-6 rounded-2xl border border-indigo-500/30"><p class="text-indigo-400 text-xs font-bold uppercase">Pass Rate</p><p class="text-4xl font-extrabold text-indigo-400 mt-2">{pass_rate:.1f}%</p></div>
        </div>
        <a href="execution-report.html" class="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition">View Detailed Test Log</a>
    </div>
</body>
</html>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)
