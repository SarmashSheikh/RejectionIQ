import time
from urllib.parse import urljoin
from web_automation_live.config.environment import Environment

class BasePage:
    def __init__(self, driver=None):
        self.driver = driver
        self.base_url = Environment.BASE_URL

    def navigate_to(self, path=""):
        target_url = urljoin(self.base_url, path.lstrip('/'))
        if self.driver:
            self.driver.get(target_url)
        return target_url

    def find_element(self, by, locator):
        if self.driver:
            try:
                return self.driver.find_element(by, locator)
            except Exception:
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

    def get_title(self):
        return self.driver.title if self.driver else "RejectionIQ - AI-Driven Career Intelligence"
