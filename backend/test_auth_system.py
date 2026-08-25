import unittest
from fastapi.testclient import TestClient
from database.database import SessionLocal, Base, engine
from database import models
from utils.auth import get_password_hash
from main import app

class TestAuthenticationSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run database column migrations for is_active
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        if inspector.has_table("users"):
            columns = [col["name"] for col in inspector.get_columns("users")]
            with engine.connect() as conn:
                if "is_active" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;"))
                    conn.commit()

        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Seed test user
        cls.test_email = "authtest_active@gmail.com"
        cls.test_password = "SecurePassword123!"
        
        # Clean up existing test users if any
        cls.db.query(models.User).filter(
            models.User.email.in_([cls.test_email, "authtest_inactive@gmail.com"])
        ).delete(synchronize_session=False)
        cls.db.commit()

        # Active test user
        cls.active_user = models.User(
            full_name="Auth Test Active",
            email=cls.test_email,
            password_hash=get_password_hash(cls.test_password),
            is_verified=True,
            is_active=True
        )
        cls.db.add(cls.active_user)

        # Inactive test user
        cls.inactive_user = models.User(
            full_name="Auth Test Inactive",
            email="authtest_inactive@gmail.com",
            password_hash=get_password_hash("Secret456!"),
            is_verified=True,
            is_active=False
        )
        cls.db.add(cls.inactive_user)
        cls.db.commit()
        cls.db.refresh(cls.active_user)

    @classmethod
    def tearDownClass(cls):
        cls.db.query(models.User).filter(
            models.User.email.in_([cls.test_email, "authtest_inactive@gmail.com"])
        ).delete(synchronize_session=False)
        cls.db.commit()
        cls.db.close()

    def test_01_registered_email_correct_password(self):
        """Test 1: Registered email + correct password -> Login successful (HTTP 200)"""
        response = self.client.post(
            "/api/auth/login",
            data={"username": self.test_email, "password": self.test_password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.status_code, 200, f"Expected 200, got {response.status_code}: {response.text}")
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data.get("token_type"), "bearer")
        print("[PASS] Test 1: Registered email + correct password -> HTTP 200 & JWT issued")

    def test_02_registered_email_wrong_password(self):
        """Test 2: Registered email + wrong password -> Login rejected (HTTP 401)"""
        initial_hash = self.active_user.password_hash
        response = self.client.post(
            "/api/auth/login",
            data={"username": self.test_email, "password": "WrongPassword999!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.status_code, 401, f"Expected 401, got {response.status_code}: {response.text}")
        self.assertIn("Invalid email or password", response.json().get("detail", ""))
        
        # Verify password hash was NOT mutated in database
        self.db.refresh(self.active_user)
        self.assertEqual(self.active_user.password_hash, initial_hash, "Password hash must not be mutated on failed login!")
        print("[PASS] Test 2: Registered email + wrong password -> HTTP 401 & hash unmutated")

    def test_03_non_existing_email(self):
        """Test 3: Non-existing email -> Login rejected (HTTP 404) & NO user auto-created"""
        non_existent_email = "definitely_nonexistent_user_98765@gmail.com"
        response = self.client.post(
            "/api/auth/login",
            data={"username": non_existent_email, "password": "AnyPassword123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.status_code, 404, f"Expected 404, got {response.status_code}: {response.text}")
        self.assertIn("Account not found", response.json().get("detail", ""))

        # Verify user was NOT created in DB
        db_check = self.db.query(models.User).filter(models.User.email == non_existent_email).first()
        self.assertIsNone(db_check, "Non-existent user must NOT be auto-created in database during login!")
        print("[PASS] Test 3: Non-existing email -> HTTP 404 & no auto-user creation")

    def test_04_empty_email_or_password(self):
        """Test 4: Empty email/password -> Validation error (HTTP 400 or 422)"""
        # Empty email
        response1 = self.client.post(
            "/api/auth/login",
            data={"username": "", "password": "somepassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertIn(response1.status_code, [400, 422])

        # Empty password
        response2 = self.client.post(
            "/api/auth/login",
            data={"username": "valid@gmail.com", "password": ""},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertIn(response2.status_code, [400, 422])
        print("[PASS] Test 4: Empty email/password -> Validation error (HTTP 400/422)")

    def test_05_sql_injection_attempt(self):
        """Test 5: SQL injection attempt -> Safely rejected (HTTP 400 or HTTP 404)"""
        sqli_payload = "' OR '1'='1' -- @gmail.com"
        response = self.client.post(
            "/api/auth/login",
            data={"username": sqli_payload, "password": "' OR '1'='1"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertIn(response.status_code, [400, 404])
        print(f"[PASS] Test 5: SQL injection payload -> Safely rejected with HTTP {response.status_code}")

    def test_06_inactive_account(self):
        """Test 6: Inactive account -> Login rejected (HTTP 401)"""
        response = self.client.post(
            "/api/auth/login",
            data={"username": "authtest_inactive@gmail.com", "password": "Secret456!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("deactivated or disabled", response.json().get("detail", ""))
        print("[PASS] Test 6: Inactive account -> HTTP 401 rejected")

if __name__ == "__main__":
    unittest.main()
