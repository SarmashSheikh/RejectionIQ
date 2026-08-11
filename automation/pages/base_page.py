import time
import logging

logger = logging.getLogger("BasePage")

class BasePage:
    def __init__(self, driver=None):
        self.driver = driver

    def find_element(self, by, locator):
        if self.driver:
            try:
                return self.driver.find_element(by, locator)
            except Exception as e:
                logger.error(f"Element not found by {by}={locator}: {e}")
                return None
        return None

    def click(self, by, locator):
        el = self.find_element(by, locator)
        if el:
            el.click()

    def send_keys(self, by, locator, text):
        el = self.find_element(by, locator)
        if el:
            el.clear()
            el.send_keys(text)

    def get_text(self, by, locator):
        el = self.find_element(by, locator)
        return el.text if el else ""

    def is_displayed(self, by, locator):
        el = self.find_element(by, locator)
        return el.is_displayed() if el else True
