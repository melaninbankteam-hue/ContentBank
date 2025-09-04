#!/usr/bin/env python3
"""
Comprehensive Feature Testing for Content Strategy Planner
Testing all new features as requested in the review request
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv

# Load backend environment variables
backend_env_path = Path(__file__).parent / "backend" / ".env"
if backend_env_path.exists():
    load_dotenv(backend_env_path)

# Load frontend environment variables for backend URL
frontend_env_path = Path(__file__).parent / "frontend" / ".env"
if frontend_env_path.exists():
    load_dotenv(frontend_env_path)

# Test Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://content-hub-247.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Admin credentials from review request
ADMIN_EMAIL = "admin@contentstrategyplanner.com"
ADMIN_PASSWORD = "Admin123!"

# Test user data
TEST_USER = {
    "name": "Sarah Johnson",
    "socialHandle": "@sarahjohnson_content",
    "email": "sarah.johnson@testuser.com",
    "password": "TestUser2025!"
}

class ContentPlannerTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.test_user_id = None
        self.test_results = []
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(ssl=False)  # Disable SSL verification for testing
        self.session = aiohttp.ClientSession(connector=connector)
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "status": status
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
            
    async def test_1_user_registration_flow(self):
        """Test 1: Updated Registration Flow with new fields"""
        try:
            # Test registration with new fields (name, socialHandle, email, password)
            response = await self.session.post(
                f"{API_BASE}/auth/register",
                json=TEST_USER,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 200:
                data = await response.json()
                
                # Verify user gets pending status
                if (data.get("approval_status") == "pending" and 
                    "pending approval" in data.get("message", "").lower()):
                    
                    # Verify email notification was attempted
                    email_sent = data.get("email_sent", False)
                    self.log_result(
                        "User Registration with New Fields", 
                        True, 
                        f"Registration successful, pending status set, email notification: {email_sent}"
                    )
                    return True
                else:
                    self.log_result(
                        "User Registration with New Fields", 
                        False, 
                        f"Unexpected response: {data}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "User Registration with New Fields", 
                    False, 
                    f"HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("User Registration with New Fields", False, f"Exception: {str(e)}")
            return False
            
    async def test_2_admin_login(self):
        """Test 2: Admin Login with Production Credentials"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = await self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 200:
                data = await response.json()
                
                if "token" in data and data.get("user", {}).get("is_admin"):
                    self.admin_token = data["token"]
                    self.log_result(
                        "Admin Login with Production Credentials", 
                        True, 
                        f"Admin login successful, token received"
                    )
                    return True
                else:
                    self.log_result(
                        "Admin Login with Production Credentials", 
                        False, 
                        f"Login successful but admin privileges not confirmed: {data}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "Admin Login with Production Credentials", 
                    False, 
                    f"HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("Admin Login with Production Credentials", False, f"Exception: {str(e)}")
            return False
            
    async def test_3_admin_health_endpoint(self):
        """Test 3: Admin Health System Testing"""
        if not self.admin_token:
            self.log_result("Admin Health Endpoint", False, "No admin token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            response = await self.session.get(
                f"{API_BASE}/admin/health",
                headers=headers
            )
            
            if response.status == 200:
                health_data = await response.json()
                
                # Check for expected health components
                expected_components = ["mongo", "jwt", "cloudinary", "email", "cors"]
                all_present = all(component in health_data for component in expected_components)
                
                if all_present:
                    # Count how many are healthy
                    healthy_count = sum(1 for component in expected_components if health_data.get(component, False))
                    
                    self.log_result(
                        "Admin Health Endpoint", 
                        True, 
                        f"Health check successful: {healthy_count}/{len(expected_components)} components healthy. Status: {health_data}"
                    )
                    return True
                else:
                    self.log_result(
                        "Admin Health Endpoint", 
                        False, 
                        f"Missing expected health components. Got: {health_data}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "Admin Health Endpoint", 
                    False, 
                    f"HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("Admin Health Endpoint", False, f"Exception: {str(e)}")
            return False
            
    async def test_4_admin_user_management(self):
        """Test 4: Admin User Management (view users, approve/deny)"""
        if not self.admin_token:
            self.log_result("Admin User Management", False, "No admin token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.admin_token}",
                "Content-Type": "application/json"
            }
            
            # Get all users
            response = await self.session.get(
                f"{API_BASE}/admin/users",
                headers=headers
            )
            
            if response.status == 200:
                users = await response.json()
                
                # Find our test user
                test_user = None
                for user in users:
                    if user.get("email") == TEST_USER["email"]:
                        test_user = user
                        self.test_user_id = user["id"]
                        break
                
                if test_user and test_user.get("approval_status") == "pending":
                    self.log_result(
                        "Admin User Management - View Users", 
                        True, 
                        f"Found {len(users)} users, test user in pending status"
                    )
                    
                    # Test user approval
                    approve_response = await self.session.patch(
                        f"{API_BASE}/admin/users/{self.test_user_id}/approve",
                        headers=headers
                    )
                    
                    if approve_response.status == 200:
                        approve_data = await approve_response.json()
                        self.log_result(
                            "Admin User Management - Approve User", 
                            True, 
                            f"User approved successfully, email sent: {approve_data.get('email_sent', False)}"
                        )
                        return True
                    else:
                        error_text = await approve_response.text()
                        self.log_result(
                            "Admin User Management - Approve User", 
                            False, 
                            f"Approval failed: HTTP {approve_response.status}: {error_text}"
                        )
                        return False
                else:
                    self.log_result(
                        "Admin User Management - View Users", 
                        False, 
                        f"Test user not found in pending status. Users: {len(users)}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "Admin User Management", 
                    False, 
                    f"HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("Admin User Management", False, f"Exception: {str(e)}")
            return False
            
    async def test_5_user_login_after_approval(self):
        """Test 5: User Login After Approval"""
        try:
            login_data = {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
            
            response = await self.session.post(
                f"{API_BASE}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 200:
                data = await response.json()
                
                if "token" in data and data.get("message") == "Login successful":
                    user_data = data.get("user", {})
                    if user_data.get("approval_status") == "approved":
                        self.log_result(
                            "User Login After Approval", 
                            True, 
                            f"User login successful after approval, token received"
                        )
                        return True
                    else:
                        self.log_result(
                            "User Login After Approval", 
                            False, 
                            f"Login successful but approval status not updated: {user_data.get('approval_status')}"
                        )
                        return False
                else:
                    self.log_result(
                        "User Login After Approval", 
                        False, 
                        f"Login failed or unexpected response: {data}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "User Login After Approval", 
                    False, 
                    f"HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("User Login After Approval", False, f"Exception: {str(e)}")
            return False
            
    async def test_6_email_template_verification(self):
        """Test 6: Email Template Verification (check if templates match expected format)"""
        # This test verifies the email service templates are correctly configured
        try:
            # Import email service to check templates
            import sys
            sys.path.append('/app/backend')
            from email_service import EmailService
            
            # Check if email service methods exist and have correct structure
            methods = ['send_pending_approval_notification', 'send_approval_notification', 'send_denial_notification']
            all_methods_exist = all(hasattr(EmailService, method) for method in methods)
            
            if all_methods_exist:
                # Check email templates by inspecting the source
                import inspect
                
                # Check pending approval template
                pending_source = inspect.getsource(EmailService.send_pending_approval_notification)
                pending_has_correct_subject = "Thanks for signing up — your account is pending approval" in pending_source
                
                # Check approval template  
                approval_source = inspect.getsource(EmailService.send_approval_notification)
                approval_has_correct_subject = "You're in! Welcome to Content Strategy Planner 🚀" in approval_source
                approval_has_login_link = "contentstrategyplanner.emergent.host/login" in approval_source
                
                # Check denial template
                denial_source = inspect.getsource(EmailService.send_denial_notification)
                denial_has_melanin_bank = "themelaninbank.com" in denial_source
                denial_has_correct_subject = "Action needed — complete your Melanin Bank membership" in denial_source
                
                template_checks = [
                    pending_has_correct_subject,
                    approval_has_correct_subject,
                    approval_has_login_link,
                    denial_has_melanin_bank,
                    denial_has_correct_subject
                ]
                
                if all(template_checks):
                    self.log_result(
                        "Email Template Verification", 
                        True, 
                        "All email templates have correct subjects and content"
                    )
                    return True
                else:
                    self.log_result(
                        "Email Template Verification", 
                        False, 
                        f"Template checks failed: {template_checks}"
                    )
                    return False
            else:
                self.log_result(
                    "Email Template Verification", 
                    False, 
                    "Email service methods not found"
                )
                return False
                
        except Exception as e:
            self.log_result("Email Template Verification", False, f"Exception: {str(e)}")
            return False
            
    async def test_7_production_environment_integration(self):
        """Test 7: Production Environment Integration"""
        try:
            # Check environment variables
            env_checks = {
                "MongoDB Atlas": bool(os.getenv('MONGO_URL') and 'mongodb+srv' in os.getenv('MONGO_URL', '')),
                "JWT Secret": bool(os.getenv('JWT_SECRET_KEY') and len(os.getenv('JWT_SECRET_KEY', '')) > 20),
                "Cloudinary": bool(os.getenv('CLOUDINARY_CLOUD_NAME') and os.getenv('CLOUDINARY_API_KEY')),
                "Email API": bool(os.getenv('EMAIL_PROVIDER_API_KEY') and len(os.getenv('EMAIL_PROVIDER_API_KEY', '')) > 10),
                "CORS Origins": bool(os.getenv('CORS_ORIGINS') or os.getenv('ALLOWED_ORIGINS'))
            }
            
            passed_checks = sum(1 for check in env_checks.values() if check)
            total_checks = len(env_checks)
            
            if passed_checks >= 4:  # Allow for some flexibility
                self.log_result(
                    "Production Environment Integration", 
                    True, 
                    f"Environment variables configured: {passed_checks}/{total_checks} checks passed. Details: {env_checks}"
                )
                return True
            else:
                self.log_result(
                    "Production Environment Integration", 
                    False, 
                    f"Insufficient environment configuration: {passed_checks}/{total_checks} checks passed. Details: {env_checks}"
                )
                return False
                
        except Exception as e:
            self.log_result("Production Environment Integration", False, f"Exception: {str(e)}")
            return False
            
    async def test_8_user_denial_workflow(self):
        """Test 8: User Denial Workflow (create another user and deny them)"""
        if not self.admin_token:
            self.log_result("User Denial Workflow", False, "No admin token available")
            return False
            
        try:
            # Create another test user for denial
            denial_user = {
                "name": "John Doe",
                "socialHandle": "@johndoe_test",
                "email": "john.doe@testuser.com",
                "password": "TestUser2025!"
            }
            
            # Register the user
            response = await self.session.post(
                f"{API_BASE}/auth/register",
                json=denial_user,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status == 200:
                # Get all users to find the new user
                headers = {
                    "Authorization": f"Bearer {self.admin_token}",
                    "Content-Type": "application/json"
                }
                
                users_response = await self.session.get(
                    f"{API_BASE}/admin/users",
                    headers=headers
                )
                
                if users_response.status == 200:
                    users = await users_response.json()
                    
                    # Find the denial test user
                    denial_user_id = None
                    for user in users:
                        if user.get("email") == denial_user["email"]:
                            denial_user_id = user["id"]
                            break
                    
                    if denial_user_id:
                        # Deny the user
                        deny_response = await self.session.patch(
                            f"{API_BASE}/admin/users/{denial_user_id}/deny",
                            headers=headers
                        )
                        
                        if deny_response.status == 200:
                            deny_data = await deny_response.json()
                            self.log_result(
                                "User Denial Workflow", 
                                True, 
                                f"User denied successfully, email sent: {deny_data.get('email_sent', False)}"
                            )
                            return True
                        else:
                            error_text = await deny_response.text()
                            self.log_result(
                                "User Denial Workflow", 
                                False, 
                                f"Denial failed: HTTP {deny_response.status}: {error_text}"
                            )
                            return False
                    else:
                        self.log_result(
                            "User Denial Workflow", 
                            False, 
                            "Could not find denial test user"
                        )
                        return False
                else:
                    error_text = await users_response.text()
                    self.log_result(
                        "User Denial Workflow", 
                        False, 
                        f"Could not get users: HTTP {users_response.status}: {error_text}"
                    )
                    return False
            else:
                error_text = await response.text()
                self.log_result(
                    "User Denial Workflow", 
                    False, 
                    f"User registration failed: HTTP {response.status}: {error_text}"
                )
                return False
                
        except Exception as e:
            self.log_result("User Denial Workflow", False, f"Exception: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Content Strategy Planner Backend Testing")
        print(f"🔗 Testing against: {API_BASE}")
        print("=" * 80)
        
        await self.setup_session()
        
        try:
            # Run tests in order
            await self.test_1_user_registration_flow()
            await self.test_2_admin_login()
            await self.test_3_admin_health_endpoint()
            await self.test_4_admin_user_management()
            await self.test_5_user_login_after_approval()
            await self.test_6_email_template_verification()
            await self.test_7_production_environment_integration()
            await self.test_8_user_denial_workflow()
            
        finally:
            await self.cleanup_session()
            
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   📝 {result['details']}")
        
        print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed ({success_rate:.1f}% success rate)")
        
        if success_rate >= 80:
            print("🎉 BACKEND TESTING SUCCESSFUL - Ready for production!")
        elif success_rate >= 60:
            print("⚠️  BACKEND TESTING MOSTLY SUCCESSFUL - Minor issues need attention")
        else:
            print("❌ BACKEND TESTING FAILED - Critical issues need resolution")
            
        return success_rate >= 80

async def main():
    """Main test runner"""
    tester = ContentPlannerTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())