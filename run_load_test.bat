@echo off
echo ===================================================
echo   RejectionIQ - 100 Virtual Users Baseline Load Test
echo ===================================================
echo Target: 100 Concurrent Virtual Users
echo Duration: 60 Seconds (1 Minute continuous)
echo.

python load_tester.py --host http://127.0.0.1:8000 --users 100 --duration 60

echo.
echo Load testing complete. Review Load_Test_Report.md and load_test_results.json.
pause
