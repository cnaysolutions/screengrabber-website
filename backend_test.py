import requests
import sys
import json
from datetime import datetime

class ScreenGrabberAPITester:
    def __init__(self, base_url="https://screengrab-login-fix.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "Test123!"
        self.test_name = "Test User"
        self.reset_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_register(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password,
                "name": self.test_name
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Registered user: {response.get('user', {}).get('email')}")
            return True
        return False

    def test_login(self):
        """Test user login"""
        # Clear token to test fresh login
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Logged in user: {response.get('user', {}).get('email')}")
            return True
        else:
            self.token = old_token  # Restore token if login failed
            return False

    def test_get_me(self):
        """Test get current user endpoint"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   User info: {response.get('email')} - Pro: {response.get('is_pro')}")
            return True
        return False

    def test_forgot_password(self):
        """Test forgot password functionality"""
        success, response = self.run_test(
            "Forgot Password",
            "POST",
            "auth/forgot-password",
            200,
            data={"email": self.test_user_email}
        )
        if success and 'debug_token' in response:
            self.reset_token = response['debug_token']
            print(f"   Reset token received: {self.reset_token[:20]}...")
            return True
        return False

    def test_reset_password(self):
        """Test password reset functionality"""
        if not self.reset_token:
            print("❌ No reset token available for password reset test")
            return False
            
        new_password = "NewTest123!"
        success, response = self.run_test(
            "Reset Password",
            "POST",
            "auth/reset-password",
            200,
            data={
                "token": self.reset_token,
                "new_password": new_password
            }
        )
        if success:
            # Update password for future tests
            self.test_password = new_password
            print(f"   Password reset successful")
            return True
        return False

    def test_login_with_new_password(self):
        """Test login with new password after reset"""
        # Clear token to test fresh login
        self.token = None
        
        success, response = self.run_test(
            "Login with New Password",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Login with new password successful")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={
                "email": "invalid@example.com",
                "password": "wrongpassword"
            }
        )
        return success  # Success means we got the expected 401 status

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401
        )
        
        self.token = old_token  # Restore token
        return success  # Success means we got the expected 401 status

def main():
    print("🚀 Starting ScreenGrabber API Tests")
    print("=" * 50)
    
    tester = ScreenGrabberAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_api_root),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Forgot Password", tester.test_forgot_password),
        ("Reset Password", tester.test_reset_password),
        ("Login with New Password", tester.test_login_with_new_password),
        ("Invalid Login", tester.test_invalid_login),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())