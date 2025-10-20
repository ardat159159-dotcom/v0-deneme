#!/usr/bin/env python3
"""
Backend Security Testing for Lupintr Social Media App
Tests JWT tokens, rate limiting, earnings logging, admin routes, and pagination
"""

import requests
import time
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://socialmedia-app-7.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@lupintr.com"
ADMIN_PASSWORD = "myworktest1"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.admin_token = None
        self.test_user_id = None
        self.test_post_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def test_user_registration_with_jwt(self):
        """Test 1: User Registration with JWT tokens"""
        test_name = "User Registration with JWT"
        
        # Generate unique test data
        test_username = f"testuser_{int(time.time())}"
        test_email = f"test_{int(time.time())}@test.com"
        
        payload = {
            "username": test_username,
            "email": test_email,
            "password": "securepass123",
            "full_name": "Test User Security"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["access_token", "refresh_token", "user", "token_type"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing fields: {missing_fields}", {"response": data})
                    return False
                
                # Store test user ID for later tests
                self.test_user_id = data["user"]["id"]
                
                # Verify token type
                if data["token_type"] != "bearer":
                    self.log_result(test_name, False, f"Wrong token type: {data['token_type']}")
                    return False
                
                self.log_result(test_name, True, "Registration successful with JWT tokens", {
                    "user_id": self.test_user_id,
                    "has_access_token": bool(data["access_token"]),
                    "has_refresh_token": bool(data["refresh_token"])
                })
                return True
            else:
                self.log_result(test_name, False, f"Registration failed: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during registration: {str(e)}")
            return False
    
    def test_admin_login_with_jwt(self):
        """Test 2: Admin Login with JWT tokens"""
        test_name = "Admin Login with JWT"
        
        payload = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["access_token", "refresh_token", "user"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing fields: {missing_fields}")
                    return False
                
                # Check admin flag
                if not data["user"].get("is_admin", False):
                    self.log_result(test_name, False, "User is not marked as admin", {"user": data["user"]})
                    return False
                
                # Store admin token for later tests
                self.admin_token = data["access_token"]
                
                self.log_result(test_name, True, "Admin login successful with JWT tokens", {
                    "is_admin": data["user"]["is_admin"],
                    "email": data["user"]["email"]
                })
                return True
            else:
                self.log_result(test_name, False, f"Admin login failed: {response.status_code}", {"response": response.text})
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during admin login: {str(e)}")
            return False
    
    def test_rate_limiting_register(self):
        """Test 3: Rate Limiting on Registration (5/min limit)"""
        test_name = "Rate Limiting - Registration"
        
        try:
            # Try to register 6 times quickly
            failed_requests = 0
            
            for i in range(6):
                payload = {
                    "username": f"ratetest_{int(time.time())}_{i}",
                    "email": f"ratetest_{int(time.time())}_{i}@test.com",
                    "password": "testpass123",
                    "full_name": f"Rate Test User {i}"
                }
                
                response = self.session.post(f"{BASE_URL}/auth/register", json=payload)
                
                if response.status_code == 429:
                    failed_requests += 1
                    self.log_result(test_name, True, f"Rate limit triggered on request {i+1}", {
                        "request_number": i+1,
                        "status_code": response.status_code
                    })
                    return True
                elif response.status_code != 200:
                    # Some other error, not rate limiting
                    pass
                
                # Small delay between requests
                time.sleep(0.1)
            
            # If we get here, rate limiting didn't work
            self.log_result(test_name, False, "Rate limiting not triggered after 6 requests")
            return False
            
        except Exception as e:
            self.log_result(test_name, False, f"Exception during rate limit test: {str(e)}")
            return False
    
    def test_rate_limiting_login(self):
        """Test 4: Rate Limiting on Login (10/min limit)"""
        test_name = "Rate Limiting - Login"
        
        try:
            # Try to login 11 times quickly with wrong credentials
            for i in range(11):
                payload = {
                    "email": "nonexistent@test.com",
                    "password": "wrongpassword"
                }
                
                response = self.session.post(f"{BASE_URL}/auth/login", json=payload)
                
                if response.status_code == 429:
                    self.log_result(test_name, True, f"Rate limit triggered on login request {i+1}", {
                        "request_number": i+1,
                        "status_code": response.status_code
                    })
                    return True
                
                # Small delay between requests
                time.sleep(0.1)
            
            # If we get here, rate limiting didn't work
            self.log_result(test_name, False, "Login rate limiting not triggered after 11 requests")
            return False
            
        except Exception as e:
            self.log_result(test_name, False, f"Exception during login rate limit test: {str(e)}")
            return False
    
    def test_earnings_logging_with_ip(self):
        """Test 5: Earnings Logging with IP Address"""
        test_name = "Earnings Logging with IP"
        
        if not self.test_user_id:
            self.log_result(test_name, False, "No test user available for earnings test")
            return False
        
        try:
            # First create a post
            post_payload = {
                "user_id": self.test_user_id,
                "content": "Test post for earnings logging",
                "image_url": None
            }
            
            post_response = self.session.post(f"{BASE_URL}/posts", json=post_payload)
            
            if post_response.status_code != 200:
                self.log_result(test_name, False, f"Failed to create test post: {post_response.status_code}")
                return False
            
            post_data = post_response.json()
            self.test_post_id = post_data["id"]
            
            # Now like the post to trigger earnings logging
            like_response = self.session.post(f"{BASE_URL}/posts/{self.test_post_id}/like?user_id={self.test_user_id}")
            
            if like_response.status_code != 200:
                self.log_result(test_name, False, f"Failed to like post: {like_response.status_code}")
                return False
            
            # Wait a moment for logging to complete
            time.sleep(1)
            
            # Check if earnings_logs collection has entries (we can't directly access DB, but we can check admin earnings)
            # This is indirect verification - we'll check if earnings were created
            earnings_response = self.session.get(f"{BASE_URL}/earnings/{self.test_user_id}")
            
            if earnings_response.status_code == 200:
                earnings_data = earnings_response.json()
                if earnings_data.get("earnings") and len(earnings_data["earnings"]) > 0:
                    self.log_result(test_name, True, "Earnings logged successfully after like action", {
                        "total_earnings": earnings_data.get("total", 0),
                        "earnings_count": len(earnings_data["earnings"])
                    })
                    return True
                else:
                    self.log_result(test_name, False, "No earnings found after like action")
                    return False
            else:
                self.log_result(test_name, False, f"Failed to fetch earnings: {earnings_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during earnings logging test: {str(e)}")
            return False
    
    def test_comment_earnings_logging(self):
        """Test 6: Comment Earnings Logging"""
        test_name = "Comment Earnings Logging"
        
        if not self.test_user_id or not self.test_post_id:
            self.log_result(test_name, False, "No test user or post available for comment test")
            return False
        
        try:
            # Create a comment to trigger earnings logging
            comment_payload = {
                "post_id": self.test_post_id,
                "user_id": self.test_user_id,
                "content": "Test comment for earnings logging"
            }
            
            comment_response = self.session.post(f"{BASE_URL}/comments", json=comment_payload)
            
            if comment_response.status_code != 200:
                self.log_result(test_name, False, f"Failed to create comment: {comment_response.status_code}")
                return False
            
            # Wait a moment for logging to complete
            time.sleep(1)
            
            # Check earnings again
            earnings_response = self.session.get(f"{BASE_URL}/earnings/{self.test_user_id}")
            
            if earnings_response.status_code == 200:
                earnings_data = earnings_response.json()
                if earnings_data.get("earnings") and len(earnings_data["earnings"]) >= 2:
                    self.log_result(test_name, True, "Comment earnings logged successfully", {
                        "total_earnings": earnings_data.get("total", 0),
                        "earnings_count": len(earnings_data["earnings"])
                    })
                    return True
                else:
                    self.log_result(test_name, False, "Expected at least 2 earnings entries (like + comment)")
                    return False
            else:
                self.log_result(test_name, False, f"Failed to fetch earnings: {earnings_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during comment earnings test: {str(e)}")
            return False
    
    def test_admin_stats_access(self):
        """Test 7: Admin Stats Access Protection"""
        test_name = "Admin Stats Access Protection"
        
        try:
            # Test with admin email parameter
            admin_response = self.session.get(f"{BASE_URL}/admin/stats?admin_email={ADMIN_EMAIL}")
            
            if admin_response.status_code == 200:
                admin_data = admin_response.json()
                required_fields = ["total_users", "total_posts", "total_streams", "total_earnings_paid", "active_users_today"]
                missing_fields = [field for field in required_fields if field not in admin_data]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing admin stats fields: {missing_fields}")
                    return False
                
                # Test without admin email parameter
                no_admin_response = self.session.get(f"{BASE_URL}/admin/stats")
                
                if no_admin_response.status_code == 403:
                    self.log_result(test_name, True, "Admin stats properly protected", {
                        "with_admin_email": "200 OK",
                        "without_admin_email": "403 Forbidden",
                        "active_users_today": admin_data.get("active_users_today")
                    })
                    return True
                else:
                    self.log_result(test_name, False, f"Admin stats not properly protected, got {no_admin_response.status_code} instead of 403")
                    return False
            else:
                self.log_result(test_name, False, f"Admin stats access failed: {admin_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during admin stats test: {str(e)}")
            return False
    
    def test_admin_users_list(self):
        """Test 8: Admin Users List Access"""
        test_name = "Admin Users List Access"
        
        try:
            # Test with admin email
            admin_response = self.session.get(f"{BASE_URL}/admin/users?admin_email={ADMIN_EMAIL}")
            
            if admin_response.status_code == 200:
                users_data = admin_response.json()
                
                if not isinstance(users_data, list):
                    self.log_result(test_name, False, "Admin users response is not a list")
                    return False
                
                # Check that passwords are not included
                if users_data:
                    first_user = users_data[0]
                    if "password" in first_user:
                        self.log_result(test_name, False, "Password field found in user data - security issue!")
                        return False
                
                # Test without admin email
                no_admin_response = self.session.get(f"{BASE_URL}/admin/users")
                
                if no_admin_response.status_code == 403:
                    self.log_result(test_name, True, "Admin users list properly protected", {
                        "users_count": len(users_data),
                        "passwords_excluded": True
                    })
                    return True
                else:
                    self.log_result(test_name, False, f"Admin users not properly protected, got {no_admin_response.status_code}")
                    return False
            else:
                self.log_result(test_name, False, f"Admin users access failed: {admin_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during admin users test: {str(e)}")
            return False
    
    def test_earnings_pagination(self):
        """Test 9: Earnings Pagination"""
        test_name = "Earnings Pagination"
        
        try:
            # Test earnings pagination
            page1_response = self.session.get(f"{BASE_URL}/admin/earnings?page=1&limit=50&admin_email={ADMIN_EMAIL}")
            
            if page1_response.status_code == 200:
                page1_data = page1_response.json()
                
                required_fields = ["earnings", "total", "page", "pages"]
                missing_fields = [field for field in required_fields if field not in page1_data]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing pagination fields: {missing_fields}")
                    return False
                
                # Verify data types
                if not isinstance(page1_data["earnings"], list):
                    self.log_result(test_name, False, "Earnings field is not a list")
                    return False
                
                if not isinstance(page1_data["total"], int):
                    self.log_result(test_name, False, "Total field is not an integer")
                    return False
                
                if page1_data["page"] != 1:
                    self.log_result(test_name, False, f"Page field should be 1, got {page1_data['page']}")
                    return False
                
                self.log_result(test_name, True, "Earnings pagination working correctly", {
                    "total_earnings": page1_data["total"],
                    "current_page": page1_data["page"],
                    "total_pages": page1_data["pages"],
                    "earnings_on_page": len(page1_data["earnings"])
                })
                return True
            else:
                self.log_result(test_name, False, f"Earnings pagination failed: {page1_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during earnings pagination test: {str(e)}")
            return False
    
    def test_earnings_config(self):
        """Test 10: Earnings Configuration Access"""
        test_name = "Earnings Configuration"
        
        try:
            # Test earnings config access
            config_response = self.session.get(f"{BASE_URL}/admin/earnings-config?admin_email={ADMIN_EMAIL}")
            
            if config_response.status_code == 200:
                config_data = config_response.json()
                
                required_fields = ["like_rate", "comment_rate", "min_withdrawal_amount"]
                missing_fields = [field for field in required_fields if field not in config_data]
                
                if missing_fields:
                    self.log_result(test_name, False, f"Missing config fields: {missing_fields}")
                    return False
                
                # Test without admin email
                no_admin_response = self.session.get(f"{BASE_URL}/admin/earnings-config")
                
                if no_admin_response.status_code == 403:
                    self.log_result(test_name, True, "Earnings config properly protected", {
                        "like_rate": config_data.get("like_rate"),
                        "comment_rate": config_data.get("comment_rate"),
                        "min_withdrawal_amount": config_data.get("min_withdrawal_amount")
                    })
                    return True
                else:
                    self.log_result(test_name, False, f"Earnings config not properly protected, got {no_admin_response.status_code}")
                    return False
            else:
                self.log_result(test_name, False, f"Earnings config access failed: {config_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during earnings config test: {str(e)}")
            return False
    
    def test_withdrawal_verification_flow(self):
        """Test 11: Withdrawal Verification Flow"""
        test_name = "Withdrawal Verification Flow"
        
        if not self.test_user_id:
            self.log_result(test_name, False, "No test user available for withdrawal test")
            return False
        
        try:
            # First, update user KYC to verified status
            kyc_payload = {
                "tc_id": "12345678901",
                "birth_date": "1990-01-01"
            }
            
            kyc_response = self.session.put(f"{BASE_URL}/users/{self.test_user_id}/kyc", json=kyc_payload)
            
            if kyc_response.status_code != 200:
                self.log_result(test_name, False, f"Failed to update KYC: {kyc_response.status_code}")
                return False
            
            # Now try withdrawal request
            withdrawal_payload = {
                "user_id": self.test_user_id,
                "amount": 50.0,
                "method": "btc",
                "wallet_address": "test123wallet"
            }
            
            request_response = self.session.post(f"{BASE_URL}/withdrawals/request", json=withdrawal_payload)
            
            if request_response.status_code == 200:
                request_data = request_response.json()
                
                if "verification_code" not in request_data:
                    self.log_result(test_name, False, "No verification code in withdrawal request response")
                    return False
                
                verification_code = request_data["verification_code"]
                
                # Now verify the withdrawal
                verify_response = self.session.post(
                    f"{BASE_URL}/withdrawals/verify?user_id={self.test_user_id}&verification_code={verification_code}"
                )
                
                if verify_response.status_code == 200:
                    self.log_result(test_name, True, "Withdrawal verification flow working", {
                        "request_status": "success",
                        "verification_status": "success",
                        "amount": withdrawal_payload["amount"]
                    })
                    return True
                else:
                    self.log_result(test_name, False, f"Withdrawal verification failed: {verify_response.status_code}")
                    return False
            else:
                self.log_result(test_name, False, f"Withdrawal request failed: {request_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception during withdrawal test: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all security tests"""
        print("🔒 Starting Backend Security Tests for Lupintr Social Media App")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Run tests in order
        tests = [
            self.test_user_registration_with_jwt,
            self.test_admin_login_with_jwt,
            self.test_rate_limiting_register,
            self.test_rate_limiting_login,
            self.test_earnings_logging_with_ip,
            self.test_comment_earnings_logging,
            self.test_admin_stats_access,
            self.test_admin_users_list,
            self.test_earnings_pagination,
            self.test_earnings_config,
            self.test_withdrawal_verification_flow
        ]
        
        passed = 0
        failed = 0
        
        for test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ CRITICAL ERROR in {test_func.__name__}: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        print("\n" + "=" * 80)
        print(f"🏁 Test Summary: {passed} passed, {failed} failed")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['message']}")
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    passed, failed, results = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/test_results_detailed.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📊 Detailed results saved to: /app/test_results_detailed.json")
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)