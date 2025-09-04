#!/usr/bin/env python3
"""
Comprehensive Backend API Test for Content Strategy Planner
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

class BackendTester:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.token = None
        self.user_id = None
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@melaninbank.com"
        self.content_idea_id = None
        self.post_id = None
        self.results = {"passed": 0, "failed": 0, "total": 0}
    
    def log_result(self, test_name, success, details=""):
        self.results["total"] += 1
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["failed"] += 1
            print(f"❌ {test_name}: {details}")
    
    def make_request(self, method, endpoint, data=None, expected_status=200):
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=15)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=15)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=15)
            
            return response
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def test_authentication(self):
        print("\n🔐 Authentication Tests")
        
        # 1. User Registration
        user_data = {
            "email": self.test_email,
            "name": "Content Creator Test",
            "password": "SecurePassword123!"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.user_id = data["user"]["id"]
            self.log_result("User Registration", True)
        else:
            self.log_result("User Registration", False, f"Status: {response.status_code if response else 'No response'}")
            return False
        
        # 2. Duplicate Registration
        response = self.make_request("POST", "/auth/register", user_data)
        if response and response.status_code == 400:
            self.log_result("Duplicate Registration Prevention", True)
        else:
            self.log_result("Duplicate Registration Prevention", False, f"Expected 400, got {response.status_code if response else 'No response'}")
        
        # 3. Login
        login_data = {"email": self.test_email, "password": "SecurePassword123!"}
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            self.log_result("User Login", True)
        else:
            self.log_result("User Login", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Invalid Login
        invalid_login = {"email": self.test_email, "password": "WrongPassword"}
        response = self.make_request("POST", "/auth/login", invalid_login)
        if response and response.status_code == 401:
            self.log_result("Invalid Login Rejection", True)
        else:
            self.log_result("Invalid Login Rejection", False, f"Expected 401, got {response.status_code if response else 'No response'}")
        
        # 5. Token Verification
        response = self.make_request("GET", "/auth/verify")
        if response and response.status_code == 200:
            self.log_result("Token Verification", True)
        else:
            self.log_result("Token Verification", False, f"Status: {response.status_code if response else 'No response'}")
        
        return True
    
    def test_monthly_data(self):
        print("\n📅 Monthly Data Tests")
        
        # 1. Get Default Monthly Data
        response = self.make_request("GET", "/months/2025-01")
        if response and response.status_code == 200:
            data = response.json()
            if data["month_key"] == "2025-01" and data["user_id"] == self.user_id:
                self.log_result("Get Default Monthly Data", True)
            else:
                self.log_result("Get Default Monthly Data", False, "Invalid data structure")
        else:
            self.log_result("Get Default Monthly Data", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 2. Create Monthly Data
        monthly_data = {
            "month_key": "2025-01",
            "goals": "Increase engagement by 25%",
            "themes": "Digital Course Creation, Instagram Growth",
            "content_pillars": ["Education", "Behind the Scenes", "Community Building"]
        }
        
        response = self.make_request("POST", "/months/2025-01", monthly_data)
        if response and response.status_code == 200:
            self.log_result("Create Monthly Data", True)
        else:
            self.log_result("Create Monthly Data", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get Created Monthly Data
        response = self.make_request("GET", "/months/2025-01")
        if response and response.status_code == 200:
            data = response.json()
            if data["goals"] == "Increase engagement by 25%":
                self.log_result("Get Created Monthly Data", True)
            else:
                self.log_result("Get Created Monthly Data", False, "Data not persisted correctly")
        else:
            self.log_result("Get Created Monthly Data", False, f"Status: {response.status_code if response else 'No response'}")
    
    def test_content_ideas(self):
        print("\n💡 Content Ideas Tests")
        
        # 1. Create Content Idea
        idea_data = {
            "month_key": "2025-01",
            "text": "How to create your first digital course in 30 days",
            "pillar": "Education",
            "category": "Course Creation"
        }
        
        response = self.make_request("POST", "/content-ideas", idea_data)
        if response and response.status_code == 200:
            data = response.json()
            self.content_idea_id = data.get("id")
            self.log_result("Create Content Idea", True)
        else:
            self.log_result("Create Content Idea", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 2. Get Content Ideas
        response = self.make_request("GET", "/content-ideas")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                self.log_result("Get Content Ideas", True)
            else:
                self.log_result("Get Content Ideas", False, "No ideas returned")
        else:
            self.log_result("Get Content Ideas", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Update Content Idea
        if self.content_idea_id:
            update_data = {
                "text": "How to create and launch your first digital course in 30 days",
                "category": "Advanced Course Creation"
            }
            
            response = self.make_request("PUT", f"/content-ideas/{self.content_idea_id}", update_data)
            if response and response.status_code == 200:
                self.log_result("Update Content Idea", True)
            else:
                self.log_result("Update Content Idea", False, f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Update Content Idea", False, "No content idea ID available")
    
    def test_posts(self):
        print("\n📱 Posts Tests")
        
        # 1. Create Post
        post_data = {
            "month_key": "2025-01",
            "date_key": "2025-01-15",
            "type": "Post",
            "category": "Education",
            "pillar": "Course Creation",
            "topic": "Digital Course Planning",
            "caption": "Ready to create your first digital course? Here's your step-by-step guide! 🚀"
        }
        
        response = self.make_request("POST", "/posts", post_data)
        if response and response.status_code == 200:
            data = response.json()
            self.post_id = data.get("id")
            self.log_result("Create Post", True)
        else:
            self.log_result("Create Post", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 2. Get Posts by Date
        response = self.make_request("GET", "/posts/2025-01/2025-01-15")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                self.log_result("Get Posts by Date", True)
            else:
                self.log_result("Get Posts by Date", False, "No posts returned")
        else:
            self.log_result("Get Posts by Date", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get Posts by Month
        response = self.make_request("GET", "/posts/2025-01")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                self.log_result("Get Posts by Month", True)
            else:
                self.log_result("Get Posts by Month", False, "No posts returned")
        else:
            self.log_result("Get Posts by Month", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Update Post
        if self.post_id:
            update_data = {
                "type": "Carousel",
                "caption": "Ready to create your first digital course? Here's your complete step-by-step guide! Swipe for all the details 👉"
            }
            
            response = self.make_request("PUT", f"/posts/{self.post_id}", update_data)
            if response and response.status_code == 200:
                self.log_result("Update Post", True)
            else:
                self.log_result("Update Post", False, f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Update Post", False, "No post ID available")
    
    def test_cleanup(self):
        print("\n🗑️ Cleanup Tests")
        
        # 1. Delete Content Idea
        if self.content_idea_id:
            response = self.make_request("DELETE", f"/content-ideas/{self.content_idea_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Content Idea", True)
            else:
                self.log_result("Delete Content Idea", False, f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Delete Content Idea", False, "No content idea ID available")
        
        # 2. Delete Post
        if self.post_id:
            response = self.make_request("DELETE", f"/posts/{self.post_id}")
            if response and response.status_code == 200:
                self.log_result("Delete Post", True)
            else:
                self.log_result("Delete Post", False, f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Delete Post", False, "No post ID available")
    
    def run_all_tests(self):
        print(f"🚀 Comprehensive Backend API Tests")
        print(f"Testing: {self.base_url}")
        print("=" * 60)
        
        if not self.test_authentication():
            print("❌ Authentication failed, stopping tests")
            return
        
        self.test_monthly_data()
        self.test_content_ideas()
        self.test_posts()
        self.test_cleanup()
        
        # Results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total']}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        success_rate = (self.results['passed'] / self.results['total']) * 100 if self.results['total'] > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 95:
            print("🎉 EXCELLENT! Backend API is working perfectly!")
        elif success_rate >= 85:
            print("👍 GOOD! Backend API is working well with minor issues.")
        elif success_rate >= 70:
            print("⚠️  MODERATE! Backend API has some issues.")
        else:
            print("🚨 CRITICAL! Backend API has major issues.")

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()