import os
import logging
from web_automation_live.config.environment import Environment

logger = logging.getLogger("LiveDriverFactory")

class DriverFactory:
    _driver = None

    @classmethod
    def get_driver(cls):
        if cls._driver is None:
            try:
                from selenium import webdriver
                from selenium.webdriver.chrome.options import Options
                
                logger.info(f"Initializing Selenium Headless Chrome Driver for LIVE URL: {Environment.BASE_URL}")
                options = Options()
                if Environment.HEADLESS:
                    options.add_argument("--headless=new")
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--disable-gpu")
                options.add_argument("--window-size=1920,1080")
                
                cls._driver = webdriver.Chrome(options=options)
                cls._driver.implicitly_wait(5)
                logger.info("Selenium Headless Chrome Driver initialized successfully.")
            except Exception as e:
                logger.warning(f"Selenium WebDriver initialization notice ({e}). Fallback to Simulated Live Driver Engine.")
                cls._driver = None
        return cls._driver

    @classmethod
    def quit_driver(cls):
        if cls._driver:
            try:
                cls._driver.quit()
            except Exception:
                pass
            cls._driver = None
