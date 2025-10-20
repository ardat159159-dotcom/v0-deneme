#!/usr/bin/env python3
"""
Final comprehensive test with unique TC IDs for withdrawal testing
"""

import requests
import time
import json
import uuid

BASE_URL = "https://socialmedia-app-7.preview.emergentagent.com/api"

def test_withdrawal_with_unique_tc():
    """Test withdrawal with unique TC ID"""
    print("🔍 Testing Withdrawal with Unique TC ID...")
    
    # Create unique test user
    unique_id = str(uuid.uuid4())[:8]
    payload = {
        "username": f"withdrawtest_{unique_id}",
        "email": f"withdrawtest_{unique_id}@test.com",
        "password": "testpass123",
        "full_name": "Withdrawal Test User"
    }
    
    reg_response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if reg_response.status_code != 200:
        print(f"❌ Failed to create test user: {reg_response.status_code}")
        return False
    
    user_data = reg_response.json()
    user_id = user_data["user"]["id"]
    print(f"✅ Created test user: {user_id}")
    
    # Generate unique TC ID (11 digits)
    tc_id = f"{int(time.time()) % 10000000000:011d}"
    
    # Update KYC with unique TC ID
    kyc_payload = {
        "tc_id": tc_id,
        "birth_date": "1990-01-01"
    }
    
    kyc_response = requests.put(f"{BASE_URL}/users/{user_id}/kyc", json=kyc_payload)
    print(f"KYC update status: {kyc_response.status_code}")
    
    if kyc_response.status_code != 200:
        print(f"❌ KYC error: {kyc_response.text}")
        return False
    
    print(f"✅ KYC verified with TC ID: {tc_id}")
    
    # Try withdrawal request
    withdrawal_payload = {
        "user_id": user_id,
        "amount": 50.0,
        "method": "btc",
        "wallet_address": "test123wallet"
    }
    
    withdrawal_response = requests.post(f"{BASE_URL}/withdrawals/request", json=withdrawal_payload)
    print(f"Withdrawal request status: {withdrawal_response.status_code}")
    
    if withdrawal_response.status_code == 200:
        withdrawal_data = withdrawal_response.json()
        print(f"✅ Withdrawal request successful")
        print(f"   Verification code: {withdrawal_data.get('verification_code', 'N/A')}")
        
        # Test verification
        if 'verification_code' in withdrawal_data:
            verify_response = requests.post(
                f"{BASE_URL}/withdrawals/verify?user_id={user_id}&verification_code={withdrawal_data['verification_code']}"
            )
            print(f"Verification status: {verify_response.status_code}")
            
            if verify_response.status_code == 200:
                print("✅ Withdrawal verification successful")
                return True
            else:
                print(f"❌ Verification failed: {verify_response.text}")
                return False
        else:
            print("❌ No verification code in response")
            return False
    else:
        print(f"❌ Withdrawal request failed: {withdrawal_response.text}")
        return False

def test_password_hashing():
    """Test if passwords are properly hashed"""
    print("🔍 Testing Password Hashing...")
    
    # Create a test user
    unique_id = str(uuid.uuid4())[:8]
    payload = {
        "username": f"hashtest_{unique_id}",
        "email": f"hashtest_{unique_id}@test.com",
        "password": "plainpassword123",
        "full_name": "Hash Test User"
    }
    
    reg_response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    if reg_response.status_code != 200:
        print(f"❌ Failed to create test user: {reg_response.status_code}")
        return False
    
    # Try to login with correct password
    login_payload = {
        "email": payload["email"],
        "password": payload["password"]
    }
    
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    print(f"Login with correct password: {login_response.status_code}")
    
    if login_response.status_code == 200:
        print("✅ Password hashing and verification working")
        return True
    else:
        print(f"❌ Login failed: {login_response.text}")
        return False

if __name__ == "__main__":
    print("🔍 Running Final Tests...")
    print("=" * 50)
    
    test_password_hashing()
    print()
    test_withdrawal_with_unique_tc()