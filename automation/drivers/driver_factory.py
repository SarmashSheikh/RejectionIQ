import logging
from automation.config.appium_config import APPIUM_SERVER_URL, DESIRED_CAPABILITIES
from automation.config.environment import Environment

logger = logging.getLogger("AppiumDriverFactory")

class DriverFactory:
    _driver = None

    @classmethod
    def get_driver(cls):
        if cls._driver is None:
            try:
                from appium import webdriver
                from appium.options.android import UiAutomator2Options
                
                logger.info(f"Connecting to Appium Server at {APPIUM_SERVER_URL}...")
                options = UiAutomator2Options()
                for key, val in DESIRED_CAPABILITIES.items():
                    options.set_capability(key, val)
                    
                cls._driver = webdriver.Remote(APPIUM_SERVER_URL, options=options)
                logger.info("Appium UiAutomator2 Driver initialized successfully.")
            except Exception as e:
                logger.warning(f"Appium Server unavailable ({e}). Fallback to Simulated Driver Mode: {Environment.SIMULATED_MODE_FALLBACK}")
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
