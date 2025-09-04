#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for The Melanin Bank Content Planner
Tests all authentication, monthly data, content ideas, and posts endpoints
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class ContentPlannerAPITester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.auth_token = None
        self.user_id = None
        self.test_user_email = f"test_user_{uuid.uuid4().hex[:8]}@melaninbank.com"
        self.test_user_name = "Content Creator Test"
        self.test_password = "SecurePassword123!"
        
        # Test data
        self.test_month_key = "2025-01"
        self.test_date_key = "2025-01-15"
        self.content_idea_id = None
        self.post_id = None
        
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
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        headers["Content-Type"] = "application/json"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=60)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=60)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=60)
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

    def test_health_check(self):
        """Test basic API health check"""
        response = self.make_request("GET", "/")
        
        if response and response.status_code == 200:
            data = response.json()
            if "Melanin Bank" in data.get("message", ""):
                self.log_test("Health Check", True)
                return True
            else:
                self.log_test("Health Check", False, f"Unexpected message: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Health Check", False, f"Status: {status}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            "email": self.test_user_email,
            "name": self.test_user_name,
            "password": self.test_password
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                self.auth_token = data["token"]
                self.user_id = data["user"]["id"]
                self.log_test("User Registration", True)
                return True
            else:
                self.log_test("User Registration", False, f"Missing token or user in response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Registration", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_duplicate_registration(self):
        """Test duplicate email registration should fail"""
        user_data = {
            "email": self.test_user_email,
            "name": "Another User",
            "password": "AnotherPassword123!"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response and response.status_code == 400:
            data = response.json()
            if "already registered" in data.get("detail", "").lower():
                self.log_test("Duplicate Registration Prevention", True)
                return True
            else:
                self.log_test("Duplicate Registration Prevention", False, f"Unexpected error: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Duplicate Registration Prevention", False, f"Expected 400, got: {status}")
            return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_password
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                # Update token for subsequent tests
                self.auth_token = data["token"]
                self.log_test("User Login", True)
                return True
            else:
                self.log_test("User Login", False, f"Missing token or user in response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Login", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": self.test_user_email,
            "password": "WrongPassword123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 401:
            data = response.json()
            if "invalid" in data.get("detail", "").lower():
                self.log_test("Invalid Login Rejection", True)
                return True
            else:
                self.log_test("Invalid Login Rejection", False, f"Unexpected error: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Invalid Login Rejection", False, f"Expected 401, got: {status}")
            return False

    def test_token_verification(self):
        """Test JWT token verification"""
        response = self.make_request("GET", "/auth/verify")
        
        if response and response.status_code == 200:
            data = response.json()
            if "user" in data and data["user"]["email"] == self.test_user_email:
                self.log_test("Token Verification", True)
                return True
            else:
                self.log_test("Token Verification", False, f"Invalid user data: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Token Verification", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_protected_endpoint_without_token(self):
        """Test that protected endpoints require authentication"""
        # Temporarily remove token
        temp_token = self.auth_token
        self.auth_token = None
        
        response = self.make_request("GET", "/content-ideas")
        
        # Restore token
        self.auth_token = temp_token
        
        if response and response.status_code == 403:
            self.log_test("Protected Endpoint Security", True)
            return True
        else:
            status = response.status_code if response else "No response"
            self.log_test("Protected Endpoint Security", False, f"Expected 403, got: {status}")
            return False

    def test_get_monthly_data_default(self):
        """Test retrieving monthly data (should return default if none exists)"""
        response = self.make_request("GET", f"/months/{self.test_month_key}")
        
        if response and response.status_code == 200:
            data = response.json()
            if data["month_key"] == self.test_month_key and data["user_id"] == self.user_id:
                self.log_test("Get Default Monthly Data", True)
                return True
            else:
                self.log_test("Get Default Monthly Data", False, f"Invalid data structure: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Default Monthly Data", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_create_monthly_data(self):
        """Test creating/updating monthly data"""
        monthly_data = {
            "month_key": self.test_month_key,
            "goals": "Increase engagement by 25%",
            "themes": "Digital Course Creation, Instagram Growth",
            "content_pillars": ["Education", "Behind the Scenes", "Community Building"],
            "analytics": {
                "followers": 5000,
                "views": 25000,
                "reach": 15000,
                "profile_visits": 800,
                "interactions": 1200
            }
        }
        
        response = self.make_request("POST", f"/months/{self.test_month_key}", monthly_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "successfully" in data.get("message", "").lower():
                self.log_test("Create Monthly Data", True)
                return True
            else:
                self.log_test("Create Monthly Data", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Monthly Data", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_get_monthly_data_after_creation(self):
        """Test retrieving monthly data after creation"""
        response = self.make_request("GET", f"/months/{self.test_month_key}")
        
        if response and response.status_code == 200:
            data = response.json()
            if (data["month_key"] == self.test_month_key and 
                data["goals"] == "Increase engagement by 25%" and
                "Education" in data["content_pillars"]):
                self.log_test("Get Created Monthly Data", True)
                return True
            else:
                self.log_test("Get Created Monthly Data", False, f"Data not persisted correctly: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Created Monthly Data", False, f"Status: {status}")
            return False

    def test_create_content_idea(self):
        """Test creating content ideas"""
        idea_data = {
            "month_key": self.test_month_key,
            "text": "How to create your first digital course in 30 days",
            "pillar": "Education",
            "category": "Course Creation"
        }
        
        response = self.make_request("POST", "/content-ideas", idea_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "successfully" in data.get("message", "").lower():
                self.content_idea_id = data["id"]
                self.log_test("Create Content Idea", True)
                return True
            else:
                self.log_test("Create Content Idea", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Content Idea", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_get_content_ideas(self):
        """Test retrieving all content ideas"""
        response = self.make_request("GET", "/content-ideas")
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check if our created idea is in the list
                found_idea = any(idea["text"] == "How to create your first digital course in 30 days" for idea in data)
                if found_idea:
                    self.log_test("Get Content Ideas", True)
                    return True
                else:
                    self.log_test("Get Content Ideas", False, "Created idea not found in list")
                    return False
            else:
                self.log_test("Get Content Ideas", False, f"Expected list with items, got: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Content Ideas", False, f"Status: {status}")
            return False

    def test_update_content_idea(self):
        """Test updating content ideas"""
        if not self.content_idea_id:
            self.log_test("Update Content Idea", False, "No content idea ID available")
            return False
        
        update_data = {
            "text": "How to create and launch your first digital course in 30 days",
            "category": "Advanced Course Creation"
        }
        
        response = self.make_request("PUT", f"/content-ideas/{self.content_idea_id}", update_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "successfully" in data.get("message", "").lower():
                self.log_test("Update Content Idea", True)
                return True
            else:
                self.log_test("Update Content Idea", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Update Content Idea", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_create_post(self):
        """Test creating posts"""
        post_data = {
            "month_key": self.test_month_key,
            "date_key": self.test_date_key,
            "type": "Post",
            "category": "Education",
            "pillar": "Course Creation",
            "topic": "Digital Course Planning",
            "caption": "Ready to create your first digital course? Here's your step-by-step guide! 🚀 #DigitalCourse #OnlineEducation #ContentCreator"
        }
        
        response = self.make_request("POST", "/posts", post_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "id" in data and "successfully" in data.get("message", "").lower():
                self.post_id = data["id"]
                self.log_test("Create Post", True)
                return True
            else:
                self.log_test("Create Post", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Post", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_get_posts_by_date(self):
        """Test retrieving posts for specific date"""
        response = self.make_request("GET", f"/posts/{self.test_month_key}/{self.test_date_key}")
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check if our created post is in the list
                found_post = any(post["topic"] == "Digital Course Planning" for post in data)
                if found_post:
                    self.log_test("Get Posts by Date", True)
                    return True
                else:
                    self.log_test("Get Posts by Date", False, "Created post not found in date list")
                    return False
            else:
                self.log_test("Get Posts by Date", False, f"Expected list with items, got: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Posts by Date", False, f"Status: {status}")
            return False

    def test_get_posts_by_month(self):
        """Test retrieving all posts for a month"""
        response = self.make_request("GET", f"/posts/{self.test_month_key}")
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check if our created post is in the list
                found_post = any(post["topic"] == "Digital Course Planning" for post in data)
                if found_post:
                    self.log_test("Get Posts by Month", True)
                    return True
                else:
                    self.log_test("Get Posts by Month", False, "Created post not found in month list")
                    return False
            else:
                self.log_test("Get Posts by Month", False, f"Expected list with items, got: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            self.log_test("Get Posts by Month", False, f"Status: {status}")
            return False

    def test_update_post(self):
        """Test updating posts"""
        if not self.post_id:
            self.log_test("Update Post", False, "No post ID available")
            return False
        
        update_data = {
            "type": "Carousel",
            "caption": "Ready to create your first digital course? Here's your complete step-by-step guide! Swipe for all the details 👉 #DigitalCourse #OnlineEducation #ContentCreator #CourseCreation"
        }
        
        response = self.make_request("PUT", f"/posts/{self.post_id}", update_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "successfully" in data.get("message", "").lower():
                self.log_test("Update Post", True)
                return True
            else:
                self.log_test("Update Post", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Update Post", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_delete_content_idea(self):
        """Test deleting content ideas"""
        if not self.content_idea_id:
            self.log_test("Delete Content Idea", False, "No content idea ID available")
            return False
        
        response = self.make_request("DELETE", f"/content-ideas/{self.content_idea_id}")
        
        if response and response.status_code == 200:
            data = response.json()
            if "successfully" in data.get("message", "").lower():
                self.log_test("Delete Content Idea", True)
                return True
            else:
                self.log_test("Delete Content Idea", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Delete Content Idea", False, f"Status: {status}, Error: {error_detail}")
            return False

    def test_delete_post(self):
        """Test deleting posts"""
        if not self.post_id:
            self.log_test("Delete Post", False, "No post ID available")
            return False
        
        response = self.make_request("DELETE", f"/posts/{self.post_id}")
        
        if response and response.status_code == 200:
            data = response.json()
            if "successfully" in data.get("message", "").lower():
                self.log_test("Delete Post", True)
                return True
            else:
                self.log_test("Delete Post", False, f"Invalid response: {data}")
                return False
        else:
            status = response.status_code if response else "No response"
            error_detail = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Delete Post", False, f"Status: {status}, Error: {error_detail}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Tests for The Melanin Bank Content Planner")
        print("=" * 80)
        
        # Health check
        self.test_health_check()
        
        # Authentication tests
        print("\n📝 Authentication Tests:")
        self.test_user_registration()
        self.test_duplicate_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_token_verification()
        self.test_protected_endpoint_without_token()
        
        # Monthly data tests
        print("\n📅 Monthly Data Tests:")
        self.test_get_monthly_data_default()
        self.test_create_monthly_data()
        self.test_get_monthly_data_after_creation()
        
        # Content ideas tests
        print("\n💡 Content Ideas Tests:")
        self.test_create_content_idea()
        self.test_get_content_ideas()
        self.test_update_content_idea()
        
        # Posts tests
        print("\n📱 Posts Tests:")
        self.test_create_post()
        self.test_get_posts_by_date()
        self.test_get_posts_by_month()
        self.test_update_post()
        
        # Cleanup tests
        print("\n🗑️ Cleanup Tests:")
        self.test_delete_content_idea()
        self.test_delete_post()
        
        # Print final results
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
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
        
        if success_rate >= 90:
            print("🎉 EXCELLENT! Backend API is working very well!")
        elif success_rate >= 75:
            print("👍 GOOD! Backend API is mostly working with minor issues.")
        elif success_rate >= 50:
            print("⚠️  MODERATE! Backend API has some significant issues.")
        else:
            print("🚨 CRITICAL! Backend API has major issues that need attention.")
        
        return self.results

if __name__ == "__main__":
    tester = ContentPlannerAPITester()
    results = tester.run_all_tests()