import os
import json
import datetime

class HTMLReportGenerator:
    def __init__(self, test_results, output_dir):
        self.results = test_results
        self.output_dir = output_dir

    def generate_all_html_reports(self):
        os.makedirs(self.output_dir, exist_ok=True)
        self.generate_execution_report(os.path.join(self.output_dir, "execution-report.html"))
        self.generate_dashboard_report(os.path.join(self.output_dir, "dashboard.html"))
        self.generate_trends_report(os.path.join(self.output_dir, "trends.html"))

    def generate_execution_report(self, filepath):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "Passed")
        failed = sum(1 for r in self.results if r["status"] == "Failed")
        skipped = sum(1 for r in self.results if r["status"] == "Skipped")
        pass_rate = (passed / total * 100.0) if total > 0 else 0.0

        rows_html = ""
        for r in self.results:
            st = r["status"]
            badge_cls = "bg-green-100 text-green-800" if st == "Passed" else ("bg-red-100 text-red-800" if st == "Failed" else "bg-yellow-100 text-yellow-800")
            rows_html += f"""
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RejectionIQ - Appium Mobile E2E Execution Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Outfit', sans-serif; }}</style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
        <header class="mb-8 border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <span class="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Enterprise Automation</span>
                <h1 class="text-3xl font-extrabold text-white mt-2">Android Appium E2E Automation Report</h1>
                <p class="text-slate-400 text-sm mt-1">Execution Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Target: RejectionIQ Android APK</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="dashboard.html" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition">View Dashboard</a>
                <a href="trends.html" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-lg transition border border-slate-700">Execution Trends</a>
            </div>
        </header>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div class="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
                <p class="text-xs font-bold uppercase text-slate-400">Total Executed</p>
                <p class="text-3xl font-extrabold text-white mt-1">{total}</p>
            </div>
            <div class="bg-slate-800/80 border border-emerald-500/30 p-5 rounded-xl">
                <p class="text-xs font-bold uppercase text-emerald-400">Passed Tests</p>
                <p class="text-3xl font-extrabold text-emerald-400 mt-1">{passed}</p>
            </div>
            <div class="bg-slate-800/80 border border-rose-500/30 p-5 rounded-xl">
                <p class="text-xs font-bold uppercase text-rose-400">Failed Tests</p>
                <p class="text-3xl font-extrabold text-rose-400 mt-1">{failed}</p>
            </div>
            <div class="bg-slate-800/80 border border-amber-500/30 p-5 rounded-xl">
                <p class="text-xs font-bold uppercase text-amber-400">Skipped Tests</p>
                <p class="text-3xl font-extrabold text-amber-400 mt-1">{skipped}</p>
            </div>
            <div class="bg-slate-800/80 border border-indigo-500/30 p-5 rounded-xl">
                <p class="text-xs font-bold uppercase text-indigo-400">Pass Rate %</p>
                <p class="text-3xl font-extrabold text-indigo-400 mt-1">{pass_rate:.1f}%</p>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div class="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <h2 class="text-lg font-bold text-white">Full Test Execution Log ({total} Test Cases)</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                    <thead class="bg-slate-900/90 text-slate-400 uppercase text-xs">
                        <tr>
                            <th class="px-4 py-3">Test ID</th>
                            <th class="px-4 py-3">Module</th>
                            <th class="px-4 py-3">Scenario Name</th>
                            <th class="px-4 py-3 text-center">Priority</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-center">Duration</th>
                            <th class="px-4 py-3">Actual Result</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/50 bg-slate-800/40">
                        {rows_html}
                    </tbody>
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
        skipped = sum(1 for r in self.results if r["status"] == "Skipped")
        pass_rate = (passed / total * 100.0) if total > 0 else 0.0

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RejectionIQ - Automation Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 p-8 font-sans">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-extrabold text-white mb-6">Executive Test Automation Dashboard</h1>
        <div class="grid grid-cols-4 gap-6 mb-8">
            <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700"><p class="text-slate-400 text-xs font-bold uppercase">Total Test Cases</p><p class="text-4xl font-extrabold text-white mt-2">{total}</p></div>
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

    def generate_trends_report(self, filepath):
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RejectionIQ - Automation Execution Trends</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 p-8 font-sans">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-extrabold text-white mb-6">Historical Automation Execution Trends</h1>
        <div class="bg-slate-800 p-8 rounded-2xl border border-slate-700">
            <p class="text-slate-300">Tracking execution stability, pass rates, and build history over time.</p>
        </div>
        <a href="execution-report.html" class="inline-block mt-6 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 border border-slate-700 transition">Back to Main Report</a>
    </div>
</body>
</html>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)
