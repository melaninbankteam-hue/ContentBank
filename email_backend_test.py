#!/usr/bin/env python3
"""
Email Functionality Tests for Content Strategy Planner Backend
Tests email configuration, user registration with pending approval, admin approval workflow, and email templates
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing email functionality at: {API_BASE_URL}")

class EmailFunctionalityTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.admin_token = None
        self.test_user_id = None
        
        # Admin credentials from review request
        self.admin_email = "admin@contentstrategyplanner.com"
        self.admin_password = "Admin123!"
        
        # Test user data with realistic information
        self.test_user_email = f"sarah.johnson.{uuid.uuid4().hex[:6]}@gmail.com"
        self.test_user_name = "Sarah Johnson"
        self.test_user_social = "@sarahjohnson_creator"
        self.test_password = "CreativePassword2025!"
        
        # Results tracking
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log_test(self, test_name, success, details=""):
        """Log test results"""
        self.results["total_tests"] += 1
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {details}")
            print(f"❌ {test_name}: {details}")

    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {}
        
        if self.admin_token:
            headers["Authorization"] = f"Bearer {self.admin_token}"
        
        headers["Content-Type"] = "application/json"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=60)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=60)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=60)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=headers, timeout=60)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=60)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.Timeout as e:
            print(f"Request timeout: {e}")
            return None
        except requests.exceptions.ConnectionError as e:
            print(f"Connection error: {e}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_email_configuration_verification(self):
        """Test 1: Email configuration verification - check if EMAIL_PROVIDER_API_KEY is properly set"""
        # First login as admin to access health endpoint
        login_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if not response or response.status_code != 200:
            self.log_test("Email Configuration - Admin Login", False, f"Admin login failed: {response.status_code if response else 'No response'}")
            return False
        
        login_result = response.json()
        if "token" not in login_result:
            self.log_test("Email Configuration - Admin Login", False, "No token in admin login response")
            return False
        
        self.admin_token = login_result["token"]
        
        # Check health endpoint for email service status
        response = self.make_request("GET", "/admin/health")
        
        if response and response.status_code == 200:
            health_data = response.json()
            if health_data.get("email") == True:
                self.log_test("Email Configuration Verification", True, "EMAIL_PROVIDER_API_KEY properly configured")
                return True
            else:
                self.log_test("Email Configuration Verification", False, f"Email service not healthy: {health_data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Email Configuration Verification", False, f"Health check failed: {status}")
            return False

    def test_user_registration_with_pending_approval(self):
        """Test 2: User registration with pending approval - verify email is sent correctly"""
        user_data = {
            "email": self.test_user_email,
            "name": self.test_user_name,
            "socialHandle": self.test_user_social,
            "password": self.test_password
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ["message", "approval_status", "email_sent"]
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test("User Registration with Pending Approval", False, f"Missing keys in response: {missing_keys}")
                return False
            
            # Verify approval status is pending
            if data["approval_status"] != "pending":
                self.log_test("User Registration with Pending Approval", False, f"Expected pending status, got: {data['approval_status']}")
                return False
            
            # Verify email was sent
            if data["email_sent"] != True:
                self.log_test("User Registration with Pending Approval", False, f"Email not sent: email_sent = {data['email_sent']}")
                return False
            
            # Verify message content
            if "pending approval" not in data["message"].lower():
                self.log_test("User Registration with Pending Approval", False, f"Unexpected message: {data['message']}")
                return False
            
            self.log_test("User Registration with Pending Approval", True, "Registration successful with pending status and email sent")
            return True
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Registration with Pending Approval", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_get_pending_users(self):
        """Helper: Get all users to find our test user"""
        response = self.make_request("GET", "/admin/users")
        
        if response and response.status_code == 200:
            users = response.json()
            for user in users:
                if user["email"] == self.test_user_email:
                    self.test_user_id = user["id"]
                    return user
            return None
        return None

    def test_user_approval_workflow(self):
        """Test 3: User approval workflow - test approve user endpoint and email notification"""
        # First, find our test user
        test_user = self.test_get_pending_users()
        
        if not test_user:
            self.log_test("User Approval Workflow - Find User", False, "Test user not found in admin users list")
            return False
        
        if test_user["approval_status"] != "pending":
            self.log_test("User Approval Workflow - User Status", False, f"User not in pending status: {test_user['approval_status']}")
            return False
        
        # Approve the user
        response = self.make_request("PATCH", f"/admin/users/{self.test_user_id}/approve")
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ["message", "email_sent"]
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test("User Approval Workflow", False, f"Missing keys in approval response: {missing_keys}")
                return False
            
            # Verify email was sent
            if data["email_sent"] != True:
                self.log_test("User Approval Workflow", False, f"Approval email not sent: email_sent = {data['email_sent']}")
                return False
            
            # Verify message content
            if "approved successfully" not in data["message"].lower():
                self.log_test("User Approval Workflow", False, f"Unexpected approval message: {data['message']}")
                return False
            
            self.log_test("User Approval Workflow", True, "User approved successfully with email notification")
            return True
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Approval Workflow", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_user_denial_workflow(self):
        """Test 4: User denial workflow - test deny user endpoint and email notification"""
        # Create another test user for denial testing
        denial_user_email = f"john.smith.{uuid.uuid4().hex[:6]}@gmail.com"
        denial_user_name = "John Smith"
        
        user_data = {
            "email": denial_user_email,
            "name": denial_user_name,
            "socialHandle": "@johnsmith_content",
            "password": "TestPassword2025!"
        }
        
        # Register the user
        response = self.make_request("POST", "/auth/register", user_data)
        
        if not response or response.status_code != 200:
            self.log_test("User Denial Workflow - Registration", False, "Failed to register test user for denial")
            return False
        
        # Wait a moment for registration to complete
        time.sleep(1)
        
        # Find the user in admin list
        response = self.make_request("GET", "/admin/users")
        denial_user_id = None
        
        if response and response.status_code == 200:
            users = response.json()
            for user in users:
                if user["email"] == denial_user_email:
                    denial_user_id = user["id"]
                    break
        
        if not denial_user_id:
            self.log_test("User Denial Workflow - Find User", False, "Denial test user not found")
            return False
        
        # Deny the user
        response = self.make_request("PATCH", f"/admin/users/{denial_user_id}/deny")
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ["message", "email_sent"]
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test("User Denial Workflow", False, f"Missing keys in denial response: {missing_keys}")
                return False
            
            # Verify email was sent
            if data["email_sent"] != True:
                self.log_test("User Denial Workflow", False, f"Denial email not sent: email_sent = {data['email_sent']}")
                return False
            
            # Verify message content
            if "denied successfully" not in data["message"].lower():
                self.log_test("User Denial Workflow", False, f"Unexpected denial message: {data['message']}")
                return False
            
            self.log_test("User Denial Workflow", True, "User denied successfully with email notification")
            return True
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Denial Workflow", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_approved_user_login(self):
        """Test 5: Verify approved user can now login successfully"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_password
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            
            # Check response structure
            expected_keys = ["message", "token", "user"]
            missing_keys = [key for key in expected_keys if key not in data]
            
            if missing_keys:
                self.log_test("Approved User Login", False, f"Missing keys in login response: {missing_keys}")
                return False
            
            # Verify user data
            user_data = data["user"]
            if user_data["email"] != self.test_user_email:
                self.log_test("Approved User Login", False, f"Email mismatch: expected {self.test_user_email}, got {user_data['email']}")
                return False
            
            if user_data["approval_status"] != "approved":
                self.log_test("Approved User Login", False, f"User not approved: {user_data['approval_status']}")
                return False
            
            if not user_data["is_active"]:
                self.log_test("Approved User Login", False, "User not active after approval")
                return False
            
            self.log_test("Approved User Login", True, "Approved user can login successfully")
            return True
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Approved User Login", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_health_check_email_service(self):
        """Test 6: Health check endpoint - ensure email service shows as healthy"""
        response = self.make_request("GET", "/admin/health")
        
        if response and response.status_code == 200:
            health_data = response.json()
            
            # Check all health components
            expected_services = ["mongo", "jwt", "cloudinary", "email", "cors"]
            
            for service in expected_services:
                if service not in health_data:
                    self.log_test("Health Check Email Service", False, f"Missing service in health check: {service}")
                    return False
            
            # Specifically check email service
            if health_data["email"] != True:
                self.log_test("Health Check Email Service", False, f"Email service not healthy: {health_data['email']}")
                return False
            
            # Check overall health
            all_healthy = all(health_data[service] for service in expected_services)
            
            if all_healthy:
                self.log_test("Health Check Email Service", True, "All services including email are healthy")
                return True
            else:
                unhealthy_services = [service for service in expected_services if not health_data[service]]
                self.log_test("Health Check Email Service", False, f"Unhealthy services: {unhealthy_services}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Health Check Email Service", False, f"Health check failed: {status}")
            return False

    def run_all_email_tests(self):
        """Run all email functionality tests in sequence"""
        print("📧 Starting Email Functionality Tests for Content Strategy Planner")
        print("=" * 80)
        print(f"🔑 Using Resend API Key: re_ZSrSKJHQ_Asz5o3MwsmuRRYvsFhnBhkKJ")
        print(f"👤 Admin Credentials: {self.admin_email}")
        print(f"📧 Test User: {self.test_user_email}")
        print("=" * 80)
        
        # Test 1: Email Configuration Verification
        print("\n🔧 Test 1: Email Configuration Verification")
        self.test_email_configuration_verification()
        
        # Test 2: User Registration with Pending Approval
        print("\n📝 Test 2: User Registration with Pending Approval")
        self.test_user_registration_with_pending_approval()
        
        # Test 3: User Approval Workflow
        print("\n✅ Test 3: User Approval Workflow")
        self.test_user_approval_workflow()
        
        # Test 4: User Denial Workflow
        print("\n❌ Test 4: User Denial Workflow")
        self.test_user_denial_workflow()
        
        # Test 5: Approved User Login
        print("\n🔐 Test 5: Approved User Login")
        self.test_approved_user_login()
        
        # Test 6: Health Check Email Service
        print("\n🏥 Test 6: Health Check Email Service")
        self.test_health_check_email_service()
        
        # Print final results
        print("\n" + "=" * 80)
        print("📊 EMAIL FUNCTIONALITY TEST RESULTS")
        print("=" * 80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results['failed'] > 0:
            print(f"\n🔍 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 PERFECT! Email functionality is working flawlessly!")
            print("📧 All email templates are being sent correctly")
            print("✅ User registration, approval, and denial workflows are functional")
        elif success_rate >= 80:
            print("👍 GOOD! Email functionality is mostly working with minor issues.")
        elif success_rate >= 60:
            print("⚠️  MODERATE! Email functionality has some issues that need attention.")
        else:
            print("🚨 CRITICAL! Email functionality has major issues that need immediate attention.")
        
        return self.results

if __name__ == "__main__":
    tester = EmailFunctionalityTester()
    results = tester.run_all_email_tests()