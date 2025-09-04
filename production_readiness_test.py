#!/usr/bin/env python3
"""
Production Readiness Test for Content Strategy Planner Backend
Tests all critical functionality for deployment readiness
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
API_BASE_URL = f"{BACKEND_URL}/api"

def test_production_readiness():
    print("🚀 PRODUCTION READINESS TEST")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE_URL}")
    print()
    
    results = {"passed": 0, "failed": 0, "critical_issues": []}
    
    def log_test(name, success, details="", critical=False):
        if success:
            results["passed"] += 1
            print(f"✅ {name}")
        else:
            results["failed"] += 1
            print(f"❌ {name}: {details}")
            if critical:
                results["critical_issues"].append(f"{name}: {details}")
    
    # 1. Environment Configuration
    print("🔧 Environment Configuration")
    log_test("Backend URL configured", bool(BACKEND_URL), "REACT_APP_BACKEND_URL not set", critical=True)
    log_test("API URL accessible", API_BASE_URL.startswith("https://"), "Should use HTTPS in production", critical=True)
    
    # 2. API Health Check
    print("\n🏥 API Health Check")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        log_test("API Health Check", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        if response.status_code == 200:
            data = response.json()
            log_test("API Response Format", "message" in data, "Invalid response format")
    except Exception as e:
        log_test("API Health Check", False, f"Connection failed: {e}", critical=True)
        return results
    
    # 3. Authentication System
    print("\n🔐 Authentication System")
    test_email = f"prod_test_{uuid.uuid4().hex[:8]}@melaninbank.com"
    user_data = {
        "email": test_email,
        "name": "Production Test User",
        "password": "SecurePassword123!"
    }
    
    try:
        # Registration
        response = requests.post(f"{API_BASE_URL}/auth/register", json=user_data, timeout=10)
        log_test("User Registration", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        if response.status_code != 200:
            return results
        
        token_data = response.json()
        token = token_data.get("token")
        user_id = token_data["user"]["id"]
        
        log_test("JWT Token Generation", bool(token), "No token in response", critical=True)
        log_test("User Data Structure", "user" in token_data and "id" in token_data["user"], "Invalid user data", critical=True)
        
        # Login
        login_data = {"email": test_email, "password": "SecurePassword123!"}
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data, timeout=10)
        log_test("User Login", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        # Token Verification
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.get(f"{API_BASE_URL}/auth/verify", headers=headers, timeout=10)
        log_test("Token Verification", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
    except Exception as e:
        log_test("Authentication System", False, f"Error: {e}", critical=True)
        return results
    
    # 4. Database Operations
    print("\n🗄️ Database Operations")
    try:
        # Monthly Data
        response = requests.get(f"{API_BASE_URL}/months/2025-01", headers=headers, timeout=10)
        log_test("Monthly Data Retrieval", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        monthly_data = {
            "month_key": "2025-01",
            "goals": "Production Test Goals",
            "themes": "Testing, Deployment",
            "content_pillars": ["Testing", "Quality Assurance"]
        }
        response = requests.post(f"{API_BASE_URL}/months/2025-01", json=monthly_data, headers=headers, timeout=10)
        log_test("Monthly Data Creation", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        # Content Ideas CRUD
        idea_data = {
            "month_key": "2025-01",
            "text": "Production readiness test idea",
            "pillar": "Testing",
            "category": "Quality Assurance"
        }
        response = requests.post(f"{API_BASE_URL}/content-ideas", json=idea_data, headers=headers, timeout=10)
        log_test("Content Ideas Creation", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        if response.status_code == 200:
            idea_id = response.json()["id"]
            
            # Update
            update_data = {"text": "Updated production test idea"}
            response = requests.put(f"{API_BASE_URL}/content-ideas/{idea_id}", json=update_data, headers=headers, timeout=10)
            log_test("Content Ideas Update", response.status_code == 200, f"Status: {response.status_code}", critical=True)
            
            # Delete
            response = requests.delete(f"{API_BASE_URL}/content-ideas/{idea_id}", headers=headers, timeout=10)
            log_test("Content Ideas Deletion", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        # Posts CRUD
        post_data = {
            "month_key": "2025-01",
            "date_key": "2025-01-15",
            "type": "Post",
            "category": "Testing",
            "pillar": "Quality Assurance",
            "topic": "Production Readiness",
            "caption": "Testing production readiness of the Content Strategy Planner! 🚀"
        }
        response = requests.post(f"{API_BASE_URL}/posts", json=post_data, headers=headers, timeout=10)
        log_test("Posts Creation", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
        if response.status_code == 200:
            post_id = response.json()["id"]
            
            # Update
            update_data = {"caption": "Updated: Production ready! ✅"}
            response = requests.put(f"{API_BASE_URL}/posts/{post_id}", json=update_data, headers=headers, timeout=10)
            log_test("Posts Update", response.status_code == 200, f"Status: {response.status_code}", critical=True)
            
            # Retrieve by date
            response = requests.get(f"{API_BASE_URL}/posts/2025-01/2025-01-15", headers=headers, timeout=10)
            log_test("Posts Retrieval by Date", response.status_code == 200, f"Status: {response.status_code}")
            
            # Retrieve by month
            response = requests.get(f"{API_BASE_URL}/posts/2025-01", headers=headers, timeout=10)
            log_test("Posts Retrieval by Month", response.status_code == 200, f"Status: {response.status_code}")
            
            # Delete
            response = requests.delete(f"{API_BASE_URL}/posts/{post_id}", headers=headers, timeout=10)
            log_test("Posts Deletion", response.status_code == 200, f"Status: {response.status_code}", critical=True)
        
    except Exception as e:
        log_test("Database Operations", False, f"Error: {e}", critical=True)
    
    # 5. Security Tests
    print("\n🔒 Security Tests")
    try:
        # Test protected endpoint without token
        response = requests.get(f"{API_BASE_URL}/content-ideas", timeout=10)
        log_test("Protected Endpoint Security", response.status_code == 403, f"Expected 403, got {response.status_code}", critical=True)
        
        # Test duplicate registration prevention
        response = requests.post(f"{API_BASE_URL}/auth/register", json=user_data, timeout=10)
        log_test("Duplicate Registration Prevention", response.status_code == 400, f"Expected 400, got {response.status_code}")
        
        # Test invalid login
        invalid_login = {"email": test_email, "password": "WrongPassword"}
        response = requests.post(f"{API_BASE_URL}/auth/login", json=invalid_login, timeout=10)
        log_test("Invalid Login Rejection", response.status_code == 401, f"Expected 401, got {response.status_code}")
        
    except Exception as e:
        log_test("Security Tests", False, f"Error: {e}")
    
    # 6. CORS Configuration
    print("\n🌐 CORS Configuration")
    try:
        response = requests.options(f"{API_BASE_URL}/", timeout=10)
        log_test("CORS Preflight", response.status_code in [200, 204], f"Status: {response.status_code}")
    except Exception as e:
        log_test("CORS Configuration", False, f"Error: {e}")
    
    # Results Summary
    print("\n" + "=" * 60)
    print("📊 PRODUCTION READINESS SUMMARY")
    print("=" * 60)
    
    total_tests = results["passed"] + results["failed"]
    success_rate = (results["passed"] / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if results["critical_issues"]:
        print(f"\n🚨 CRITICAL ISSUES ({len(results['critical_issues'])}):")
        for issue in results["critical_issues"]:
            print(f"   • {issue}")
    
    print(f"\n🎯 DEPLOYMENT READINESS:")
    if success_rate >= 95 and not results["critical_issues"]:
        print("🟢 READY FOR PRODUCTION DEPLOYMENT")
        print("   All critical systems are working correctly!")
    elif success_rate >= 90 and len(results["critical_issues"]) <= 1:
        print("🟡 MOSTLY READY - Minor issues to address")
        print("   Can deploy with monitoring for minor issues")
    else:
        print("🔴 NOT READY FOR PRODUCTION")
        print("   Critical issues must be resolved before deployment")
    
    return results

if __name__ == "__main__":
    test_production_readiness()