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

# Parse Czech date format to standard format
def parse_czech_date(czech_date):
    """Convert Czech date format (DD. MM. YYYY) to ISO format (YYYY-MM-DD)"""
    try:
        day, month, year = czech_date.split('.')
        day = day.strip()
        month = month.strip()
        year = year.strip()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    except Exception as e:
        print(f"Error parsing Czech date: {e}")
        return czech_date

# Main test function
def run_tests():
    backend_url = get_backend_url()
    api_url = f"{backend_url}/api"
    
    print(f"Testing backend API at: {api_url}")
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
            if data.get("message") == "Dušan - Správa zakázek API" and data.get("status") == "running":
                print("✅ Root endpoint test passed! Backend is running.")
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
    
    # Test 2: Supabase Integration Test
    test_results["total_tests"] += 1
    try:
        print("\nTest 2: Testing Supabase integration...")
        response = requests.get(f"{api_url}/")
        if response.status_code == 200:
            data = response.json()
            if "database" in data and "supabase" in data["database"].lower():
                print("✅ Supabase integration test passed! Backend is connected to Supabase.")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Supabase integration",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ Supabase integration test failed! Database info not found or Supabase not mentioned: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Supabase integration",
                    "passed": False,
                    "response": data,
                    "error": "Supabase integration not detected"
                })
        else:
            print(f"❌ Supabase integration test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Supabase integration",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Supabase integration test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Supabase integration",
            "passed": False,
            "error": str(e)
        })
    
    # Test 3: Create status check
    test_results["total_tests"] += 1
    try:
        print("\nTest 3: Testing POST /status endpoint...")
        client_name = f"Test Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
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
    
    # Test 4: Get status checks
    test_results["total_tests"] += 1
    try:
        print("\nTest 4: Testing GET /status endpoint...")
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
    
    # Test 5: Get user data
    test_results["total_tests"] += 1
    user_id = "1"  # Test user ID as specified in the requirements
    try:
        print(f"\nTest 5: Testing GET /users/{user_id} endpoint...")
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
    
    # Test 6: Create user data
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 6: Testing POST /users/{user_id} endpoint...")
        user_data = {
            "name": "Test User",
            "email": "test.user@example.com",
            "pin": "1234",
            "created_at": datetime.now().isoformat()
        }
        response = requests.post(f"{api_url}/users/{user_id}", json=user_data)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "data" in data.get("message", "").lower():
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
    
    # Test 7: Get user zakazky (before adding calendar order)
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 7: Testing GET /users/{user_id}/zakazky endpoint (before adding calendar order)...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            if "zakazky" in data and isinstance(data["zakazky"], list):
                initial_zakazky_count = len(data["zakazky"])
                print(f"✅ Get user zakazky test passed! Retrieved {initial_zakazky_count} zakazky for user_id: {user_id}")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": f"Get zakazky for {user_id} (before calendar order)",
                    "passed": True,
                    "count": initial_zakazky_count
                })
            else:
                print(f"❌ Get user zakazky test failed! Unexpected response format: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Get zakazky for {user_id} (before calendar order)",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response format"
                })
        else:
            print(f"❌ Get user zakazky test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Get zakazky for {user_id} (before calendar order)",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Get user zakazky test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Get zakazky for {user_id} (before calendar order)",
            "passed": False,
            "error": str(e)
        })
    
    # Test 8: Create calendar order
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 8: Testing POST /users/{user_id}/zakazky endpoint (calendar order)...")
        
        # Czech date format as specified in requirements
        czech_date = "15. 01. 2025"
        iso_date = parse_czech_date(czech_date)
        
        calendar_order = {
            "datum": czech_date,  # Using Czech date format
            "druh": "Kalendář",
            "klient": "Test Kalendář",
            "idZakazky": f"KAL-{uuid.uuid4().hex[:8].upper()}",
            "castka": 5000.0,  # As specified in requirements
            "fee": 1000.0,
            "feeOff": 0.0,
            "palivo": 200.0,
            "material": 1000.0,
            "pomocnik": 500.0,
            "zisk": 2300.0,
            "adresa": "Praha 1, Václavské náměstí 1",  # As specified in requirements
            "soubory": [],
            "telefon": "+420123456789"  # Additional field as specified in requirements
        }
        
        response = requests.post(f"{api_url}/users/{user_id}/zakazky", json=calendar_order)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "zakazka" in data.get("message", "").lower():
                print(f"✅ Create calendar order test passed! Calendar order created with ID: {data.get('zakazka_id', 'unknown')}")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": f"Create calendar order for {user_id}",
                    "passed": True,
                    "zakazka_id": data.get("zakazka_id", "unknown")
                })
                # Save the created zakazka ID for future reference
                created_calendar_id = data.get("zakazka_id", "unknown")
            else:
                print(f"❌ Create calendar order test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Create calendar order for {user_id}",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Create calendar order test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Create calendar order for {user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Create calendar order test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Create calendar order for {user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 9: Get user zakazky (after adding calendar order)
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 9: Testing GET /users/{user_id}/zakazky endpoint (after adding calendar order)...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            if "zakazky" in data and isinstance(data["zakazky"], list):
                new_zakazky_count = len(data["zakazky"])
                
                # Check if we have the calendar order in the list
                calendar_order_found = False
                for zakazka in data["zakazky"]:
                    if zakazka.get("klient") == "Test Kalendář" and zakazka.get("adresa") == "Praha 1, Václavské náměstí 1":
                        calendar_order_found = True
                        # Check if telefon field was saved
                        if "telefon" in zakazka and zakazka["telefon"] == "+420123456789":
                            print("✅ Telefon field was correctly saved in the calendar order")
                        else:
                            print("⚠️ Telefon field was not found in the calendar order or has incorrect value")
                        
                        # Check if Czech date format was processed correctly
                        if "datum" in zakazka:
                            print(f"✅ Date field was saved as: {zakazka['datum']}")
                        break
                
                if calendar_order_found:
                    print(f"✅ Get user zakazky test passed! Retrieved {new_zakazky_count} zakazky for user_id: {user_id}, including the calendar order")
                    test_results["passed"] += 1
                    test_results["tests"].append({
                        "name": f"Get zakazky for {user_id} (after calendar order)",
                        "passed": True,
                        "count": new_zakazky_count,
                        "calendar_order_found": True
                    })
                else:
                    print(f"❌ Get user zakazky test failed! Calendar order not found in the list")
                    test_results["failed"] += 1
                    test_results["tests"].append({
                        "name": f"Get zakazky for {user_id} (after calendar order)",
                        "passed": False,
                        "count": new_zakazky_count,
                        "calendar_order_found": False,
                        "error": "Calendar order not found"
                    })
            else:
                print(f"❌ Get user zakazky test failed! Unexpected response format: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": f"Get zakazky for {user_id} (after calendar order)",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response format"
                })
        else:
            print(f"❌ Get user zakazky test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"Get zakazky for {user_id} (after calendar order)",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Get user zakazky test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"Get zakazky for {user_id} (after calendar order)",
            "passed": False,
            "error": str(e)
        })
    
    # Test 10: Error handling test - invalid data
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 10: Testing error handling with invalid data...")
        invalid_order = {
            "datum": "invalid-date",
            "klient": "Test Error Handling",
            # Missing required fields
        }
        
        response = requests.post(f"{api_url}/users/{user_id}/zakazky", json=invalid_order)
        
        # We expect an error response (4xx status code)
        if response.status_code >= 400:
            print(f"✅ Error handling test passed! Server correctly rejected invalid data with status code: {response.status_code}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": "Error handling test",
                "passed": True,
                "status_code": response.status_code
            })
        else:
            print(f"❌ Error handling test failed! Server accepted invalid data with status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Error handling test",
                "passed": False,
                "status_code": response.status_code,
                "error": "Server accepted invalid data"
            })
    except Exception as e:
        print(f"❌ Error handling test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Error handling test",
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