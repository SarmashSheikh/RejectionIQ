from automation.pages.base_page import BasePage

class AuthPage(BasePage):
    EMAIL_INPUT = ("id", "com.rejectioniq.app:id/email_input")
    PASSWORD_INPUT = ("id", "com.rejectioniq.app:id/password_input")
    SIGN_IN_BTN = ("id", "com.rejectioniq.app:id/btn_login")
    REGISTER_LINK = ("id", "com.rejectioniq.app:id/register_link")

    def login(self, email, password):
        self.send_keys(*self.EMAIL_INPUT, email)
        self.send_keys(*self.PASSWORD_INPUT, password)
        self.click(*self.SIGN_IN_BTN)
