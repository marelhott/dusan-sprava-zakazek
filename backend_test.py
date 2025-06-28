#!/usr/bin/env python3
import requests
import json
import os
import sys
from datetime import datetime
import uuid

# Get the backend URL from the frontend .env file
def get_backend_url():
    env_file_path = "/app/frontend/.env"
    with open(env_file_path, "r") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.strip().split("=")[1].strip('"')
    raise ValueError("REACT_APP_BACKEND_URL not found in frontend/.env")

# Main test function
def run_tests():
    backend_url = get_backend_url()
    api_url = f"{backend_url}/api"
    
    print(f"Testing Firebase backend API at: {api_url}")
    print("=" * 50)
    
    test_results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # Test 1: Root endpoint - Basic API connectivity
    test_results["total_tests"] += 1
    try:
        print("\nTest 1: Testing root endpoint (Basic API connectivity)...")
        response = requests.get(f"{api_url}/")
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Dušan - Správa zakázek API" and data.get("status") == "running" and data.get("firebase") == "connected":
                print("✅ Root endpoint test passed! Firebase backend is running.")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Root endpoint (Basic API connectivity)",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ Root endpoint test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Root endpoint (Basic API connectivity)",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Root endpoint test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Root endpoint (Basic API connectivity)",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Root endpoint test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Root endpoint (Basic API connectivity)",
            "passed": False,
            "error": str(e)
        })
    
    # Test 2: Create status check
    test_results["total_tests"] += 1
    try:
        print("\nTest 2: Testing POST /status endpoint...")
        client_name = f"Firebase Test Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        payload = {"client_name": client_name}
        response = requests.post(f"{api_url}/status", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("client_name") == client_name and "id" in data and "timestamp" in data:
                print("✅ Create status check test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Create status check",
                    "passed": True,
                    "response": data
                })
                # Save the created status ID for future reference if needed
                created_status_id = data.get("id")
            else:
                print(f"❌ Create status check test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Create status check",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Create status check test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Create status check",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Create status check test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Create status check",
            "passed": False,
            "error": str(e)
        })
    
    # Test 3: Get status checks
    test_results["total_tests"] += 1
    try:
        print("\nTest 3: Testing GET /status endpoint...")
        response = requests.get(f"{api_url}/status")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "message" in data and "timestamp" in data:
                print(f"✅ Get status checks test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Get status checks",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ Get status checks test failed! Unexpected response format: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Get status checks",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response format"
                })
        else:
            print(f"❌ Get status checks test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Get status checks",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Get status checks test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Get status checks",
            "passed": False,
            "error": str(e)
        })
    
    # Test 4: Get user data
    test_results["total_tests"] += 1
    user_id = "user_1"  # Test user ID as specified in the requirements
    try:
        print(f"\nTest 4: Testing GET /users/{user_id} endpoint...")
        response = requests.get(f"{api_url}/users/{user_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get user data test passed! Retrieved user data for user_id: {user_id}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"Get user data for {user_id}",
                "passed": True,
                "response": "User data retrieved successfully"
            })
        elif response.status_code == 404:
            print(f"⚠️ User {user_id} not found. This might be expected if the user doesn't exist yet.")
            # We'll create this user in the next test, so this is not a failure
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"Get user data for {user_id}",
                "passed": True,
                "response": "User not found (expected if user doesn't exist yet)"
            })
        else:
            print(f"❌ Get user data test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Get user data for {user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Get user data test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Get user data for {user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 5: Create user data
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 5: Testing POST /users/{user_id} endpoint...")
        user_data = {
            "name": "Test User",
            "email": "test.user@example.com",
            "pin": "1234",
            "created_at": datetime.now().isoformat()
        }
        response = requests.post(f"{api_url}/users/{user_id}", json=user_data)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "Uživatelská data úspěšně uložena" in data["message"]:
                print(f"✅ Create user data test passed! User data created for user_id: {user_id}")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": f"Create user data for {user_id}",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ Create user data test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Create user data for {user_id}",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Create user data test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Create user data for {user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Create user data test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Create user data for {user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 6: Get user zakazky
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 6: Testing GET /users/{user_id}/zakazky endpoint...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            if "zakazky" in data and isinstance(data["zakazky"], list):
                print(f"✅ Get user zakazky test passed! Retrieved {len(data['zakazky'])} zakazky for user_id: {user_id}")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": f"Get zakazky for {user_id}",
                    "passed": True,
                    "count": len(data["zakazky"])
                })
            else:
                print(f"❌ Get user zakazky test failed! Unexpected response format: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Get zakazky for {user_id}",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response format"
                })
        else:
            print(f"❌ Get user zakazky test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Get zakazky for {user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Get user zakazky test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Get zakazky for {user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 7: Create zakazka
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 7: Testing POST /users/{user_id}/zakazky endpoint...")
        zakazka_data = {
            "datum": datetime.now().strftime("%Y-%m-%d"),
            "druh": "Malování",
            "klient": "Test Klient",
            "idZakazky": f"ZAK-{uuid.uuid4().hex[:8].upper()}",
            "castka": 15000.0,
            "fee": 5000.0,
            "feeOff": 0.0,
            "palivo": 500.0,
            "material": 3000.0,
            "pomocnik": 2000.0,
            "zisk": 4500.0,
            "adresa": "Testovací 123, Praha",
            "soubory": []
        }
        response = requests.post(f"{api_url}/users/{user_id}/zakazky", json=zakazka_data)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "Zakázka úspěšně vytvořena" in data["message"] and "zakazka_id" in data:
                print(f"✅ Create zakazka test passed! Zakazka created with ID: {data['zakazka_id']}")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": f"Create zakazka for {user_id}",
                    "passed": True,
                    "zakazka_id": data["zakazka_id"]
                })
                # Save the created zakazka ID for future reference
                created_zakazka_id = data["zakazka_id"]
            else:
                print(f"❌ Create zakazka test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Create zakazka for {user_id}",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Create zakazka test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Create zakazka for {user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Create zakazka test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Create zakazka for {user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"Test Summary: {test_results['passed']}/{test_results['total_tests']} tests passed")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    return test_results

if __name__ == "__main__":
    run_tests()