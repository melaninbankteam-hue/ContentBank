#!/usr/bin/env python3
"""
Simple Backend API Test to verify endpoints are working
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

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Test a single endpoint"""
    url = f"{API_BASE_URL}{endpoint}"
    
    if headers is None:
        headers = {"Content-Type": "application/json"}
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        
        print(f"{method} {endpoint}: Status {response.status_code} (Expected: {expected_status})")
        
        if response.status_code == expected_status:
            return True, response
        else:
            print(f"  Response: {response.text[:200]}")
            return False, response
            
    except Exception as e:
        print(f"{method} {endpoint}: ERROR - {e}")
        return False, None

def main():
    print("🚀 Simple Backend API Test")
    print("=" * 50)
    
    # Test 1: Health check
    success, response = test_endpoint("GET", "/")
    
    # Test 2: User registration
    test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": test_email,
        "name": "Test User",
        "password": "TestPass123!"
    }
    success, response = test_endpoint("POST", "/auth/register", user_data)
    
    if success:
        data = response.json()
        token = data.get("token")
        print(f"  Got token: {token[:20]}...")
        
        # Test 3: Duplicate registration (should fail)
        success, response = test_endpoint("POST", "/auth/register", user_data, expected_status=400)
        
        # Test 4: Login
        login_data = {"email": test_email, "password": "TestPass123!"}
        success, response = test_endpoint("POST", "/auth/login", login_data)
        
        # Test 5: Invalid login (should fail)
        invalid_login = {"email": test_email, "password": "WrongPassword"}
        success, response = test_endpoint("POST", "/auth/login", invalid_login, expected_status=401)
        
        # Test 6: Token verification
        auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        success, response = test_endpoint("GET", "/auth/verify", headers=auth_headers)
        
        # Test 7: Protected endpoint without token (should fail)
        success, response = test_endpoint("GET", "/content-ideas", expected_status=403)
        
        # Test 8: Monthly data
        success, response = test_endpoint("GET", "/months/2025-01", headers=auth_headers)
        
        print("\n✅ All basic tests completed!")
    else:
        print("❌ Registration failed, skipping other tests")

if __name__ == "__main__":
    main()