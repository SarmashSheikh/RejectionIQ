const path = require('path');

// Selenium Configuration Settings
const TARGET_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';
const BROWSER = 'chrome';

// File Paths
const BASE_DIR = __dirname;
const WORKSPACE_DIR = path.dirname(BASE_DIR);
const EXCEL_REPORT_PATH = path.join(WORKSPACE_DIR, 'Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx');
const LOCAL_EXCEL_REPORT_PATH = path.join(BASE_DIR, 'Selenium_Web_E2E_Test_Report_RejectionIQ.xlsx');

module.exports = {
  TARGET_URL,
  BACKEND_URL,
  BROWSER,
  BASE_DIR,
  WORKSPACE_DIR,
  EXCEL_REPORT_PATH,
  LOCAL_EXCEL_REPORT_PATH
};
