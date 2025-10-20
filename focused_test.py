#!/usr/bin/env python3
"""
Focused testing for specific issues found
"""

import requests
import time
import json

BASE_URL = "https://socialmedia-app-7.preview.emergentagent.com/api"

def test_admin_protection():
    """Test admin route protection"""
    print("🔍 Testing Admin Route Protection...")
    
    # Test admin stats without admin_email parameter
    response = requests.get(f"{BASE_URL}/admin/stats")
    print(f"Admin stats without admin_email: {response.status_code}")
    
    # Test admin stats with wrong admin_email
    response = requests.get(f"{BASE_URL}/admin/stats?admin_email=wrong@email.com")
    print(f"Admin stats with wrong email: {response.status_code}")
    
    # Test admin stats with correct admin_email
    response = requests.get(f"{BASE_URL}/admin/stats?admin_email=admin@lupintr.com")
    print(f"Admin stats with correct email: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Stats data: {data}")

def test_rate_limiting_detailed():
    """Test rate limiting with more detail"""
    print("🔍 Testing Rate Limiting in Detail...")
    
    # Test registration rate limiting
    print("Testing registration rate limiting (5/min)...")
    for i in range(7):
        payload = {
            "username": f"ratetest_{int(time.time())}_{i}",
            "email": f"ratetest_{int(time.time())}_{i}@test.com",
            "password": "testpass123",
            "full_name": f"Rate Test User {i}"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        print(f"Request {i+1}: Status {response.status_code}")
        
        if response.status_code == 429:
            print(f"✅ Rate limit triggered on request {i+1}")
            return True
        elif response.status_code != 200:
            print(f"   Error: {response.text[:100]}")
        
        time.sleep(0.2)  # Small delay
    
    print("❌ Rate limiting not working for registration")
    return False

def test_withdrawal_issue():
    """Test withdrawal issue in detail"""
    print("🔍 Testing Withdrawal Issue...")
    
    # First create a test user
    payload = {
        "username": f"withdrawtest_{int(time.time())}",
        "email": f"withdrawtest_{int(time.time())}@test.com",
        "password": "testpass123",
        "full_name": "Withdrawal Test User"
    }
    
    reg_response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if reg_response.status_code != 200:
        print(f"Failed to create test user: {reg_response.status_code}")
        return False
    
    user_data = reg_response.json()
    user_id = user_data["user"]["id"]
    print(f"Created test user: {user_id}")
    
    # Update KYC
    kyc_payload = {
        "tc_id": "12345678901",
        "birth_date": "1990-01-01"
    }
    
    kyc_response = requests.put(f"{BASE_URL}/users/{user_id}/kyc", json=kyc_payload)
    print(f"KYC update: {kyc_response.status_code}")
    
    if kyc_response.status_code != 200:
        print(f"KYC error: {kyc_response.text}")
        return False
    
    # Try withdrawal request
    withdrawal_payload = {
        "user_id": user_id,
        "amount": 50.0,
        "method": "btc",
        "wallet_address": "test123wallet"
    }
    
    withdrawal_response = requests.post(f"{BASE_URL}/withdrawals/request", json=withdrawal_payload)
    print(f"Withdrawal request: {withdrawal_response.status_code}")
    
    if withdrawal_response.status_code != 200:
        print(f"Withdrawal error: {withdrawal_response.text}")
        return False
    
    print("✅ Withdrawal flow working")
    return True

if __name__ == "__main__":
    print("🔍 Running Focused Tests...")
    print("=" * 50)
    
    test_admin_protection()
    print()
    test_rate_limiting_detailed()
    print()
    test_withdrawal_issue()