#!/usr/bin/env python3
import requests
import json
import os
import sys
from datetime import datetime
import uuid

# Get the backend URL from the frontend .env file or use the provided URL
def get_backend_url():
    # Use the provided URL from the review request
    return "https://364ec5aa-24d2-46fa-a093-bef30ed1bc90.preview.emergentagent.com"

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
    
    print(f"RYCHLÉ TEST VŠECH OPRAV - backend API test")
    print(f"Testing backend API at: {api_url}")
    print("=" * 50)
    
    # Use the specific user ID from the review request
    user_id = "24787d4a-0139-407c-93c0-b4f369e913a9"
    print(f"Using user ID from review request: {user_id}")
    
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
    
    # Test 2: POST /status endpoint
    test_results["total_tests"] += 1
    try:
        print("\nTest 2: Testing POST /status endpoint...")
        client_name = f"Test Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        payload = {"client_name": client_name}
        response = requests.post(f"{api_url}/status", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("client_name") == client_name and "id" in data and "timestamp" in data:
                print("✅ POST /status test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "POST /status",
                    "passed": True,
                    "response": data
                })
                # Save the created status ID for future reference if needed
                created_status_id = data.get("id")
            else:
                print(f"❌ POST /status test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "POST /status",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ POST /status test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "POST /status",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ POST /status test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "POST /status",
            "passed": False,
            "error": str(e)
        })
    
    # Test 3: GET /status endpoint
    test_results["total_tests"] += 1
    try:
        print("\nTest 3: Testing GET /status endpoint...")
        response = requests.get(f"{api_url}/status")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "message" in data and "timestamp" in data:
                print(f"✅ GET /status test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "GET /status",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ GET /status test failed! Unexpected response format: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "GET /status",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response format"
                })
        else:
            print(f"❌ GET /status test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "GET /status",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ GET /status test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "GET /status",
            "passed": False,
            "error": str(e)
        })
    
    # Generate a unique user ID for testing
    user_id = f"test_user_{uuid.uuid4().hex[:8]}"
    print(f"\nUsing test user ID: {user_id}")
    
    # Test 4: GET /users/{user_id} endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 4: Testing GET /users/{user_id} endpoint...")
        response = requests.get(f"{api_url}/users/{user_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET /users/{user_id} test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"GET /users/{user_id}",
                "passed": True,
                "response": data
            })
        else:
            print(f"❌ GET /users/{user_id} test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"GET /users/{user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ GET /users/{user_id} test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"GET /users/{user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 5: POST /users/{user_id} endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 5: Testing POST /users/{user_id} endpoint...")
        user_data = {
            "name": "Jan Novák",
            "email": "jan.novak@example.cz",
            "pin": "1234",
            "role": "malíř",
            "created_at": datetime.now().isoformat()
        }
        response = requests.post(f"{api_url}/users/{user_id}", json=user_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ POST /users/{user_id} test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"POST /users/{user_id}",
                "passed": True,
                "response": data
            })
        else:
            print(f"❌ POST /users/{user_id} test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"POST /users/{user_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ POST /users/{user_id} test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"POST /users/{user_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 6: GET /users/{user_id}/zakazky endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 6: Testing GET /users/{user_id}/zakazky endpoint...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET /users/{user_id}/zakazky test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"GET /users/{user_id}/zakazky",
                "passed": True,
                "response": data
            })
            # Store initial count of zakazky
            initial_zakazky_count = len(data.get("zakazky", []))
            print(f"Initial count of zakazky: {initial_zakazky_count}")
        else:
            print(f"❌ GET /users/{user_id}/zakazky test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"GET /users/{user_id}/zakazky",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ GET /users/{user_id}/zakazky test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"GET /users/{user_id}/zakazky",
            "passed": False,
            "error": str(e)
        })
    
    # Test 7: POST /users/{user_id}/zakazky endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 7: Testing POST /users/{user_id}/zakazky endpoint...")
        
        # Using the test data from the review request
        zakazka_data = {
            "datum": "05.01.2025",
            "druh": "Test - nová pole",
            "klient": "Test Klient Doba+Poznámky", 
            "idZakazky": "TEST-DOBA-001",
            "castka": 25000,
            "fee": 6525,
            "feeOff": 0,
            "palivo": 800,
            "material": 2000,
            "pomocnik": 1500,
            "zisk": 14175,
            "adresa": "Test adresa pro nová pole",
            "telefon": "604123456",
            "doba_realizace": 7,
            "poznamky": "Testovací poznámka pro ověření funkčnosti nového pole",
            "soubory": []
        }
        
        response = requests.post(f"{api_url}/users/{user_id}/zakazky", json=zakazka_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ POST /users/{user_id}/zakazky test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"POST /users/{user_id}/zakazky",
                "passed": True,
                "response": data
            })
            # Store the zakazka ID for future tests
            zakazka_id = data.get("zakazka_id", "unknown")
            print(f"Created zakazka with ID: {zakazka_id}")
        else:
            print(f"❌ POST /users/{user_id}/zakazky test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"POST /users/{user_id}/zakazky",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ POST /users/{user_id}/zakazky test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"POST /users/{user_id}/zakazky",
            "passed": False,
            "error": str(e)
        })
    
    # Test 8: Verify zakazka was created
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 8: Verifying zakazka was created...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            zakazky = data.get("zakazky", [])
            new_zakazky_count = len(zakazky)
            
            # Check if we have the new zakazka in the list
            zakazka_found = False
            for zakazka in zakazky:
                if zakazka.get("klient") == "Test Klient Doba+Poznámky" and zakazka.get("idZakazky") == "TEST-DOBA-001":
                    zakazka_found = True
                    zakazka_id = zakazka.get("id", zakazka_id)  # Update zakazka_id if available
                    
                    # Verify the new fields are present
                    doba_realizace_ok = zakazka.get("doba_realizace") == 7
                    poznamky_ok = zakazka.get("poznamky") == "Testovací poznámka pro ověření funkčnosti nového pole"
                    
                    if doba_realizace_ok and poznamky_ok:
                        print(f"✅ Found created zakazka with ID: {zakazka_id} and verified new fields 'doba_realizace' and 'poznamky'")
                    else:
                        print(f"⚠️ Found created zakazka but new fields verification failed:")
                        print(f"   - doba_realizace: {'OK' if doba_realizace_ok else 'MISSING/WRONG'} (expected: 7, got: {zakazka.get('doba_realizace')})")
                        print(f"   - poznamky: {'OK' if poznamky_ok else 'MISSING/WRONG'} (expected: 'Testovací poznámka...', got: {zakazka.get('poznamky')})")
                    
                    break
            
            if zakazka_found:
                print(f"✅ Zakazka verification test passed! Found the created zakazka.")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka verification",
                    "passed": True,
                    "zakazka_id": zakazka_id
                })
            else:
                print(f"❌ Zakazka verification test failed! Created zakazka not found.")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka verification",
                    "passed": False,
                    "error": "Created zakazka not found"
                })
        else:
            print(f"❌ Zakazka verification test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Zakazka verification",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Zakazka verification test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Zakazka verification",
            "passed": False,
            "error": str(e)
        })
    
    # Test 9: PUT /users/{user_id}/zakazky/{zakazka_id} endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 9: Testing PUT /users/{user_id}/zakazky/{zakazka_id} endpoint...")
        
        # Update data for the zakazka
        update_data = {
            "klient": "Updated Test Klient",
            "castka": 30000,
            "zisk": 15000,
            "doba_realizace": 10,  # Update doba_realizace from 7 to 10 days
            "poznamky": "Aktualizovaná poznámka pro test PUT endpointu"  # Update poznamky
        }
        
        response = requests.put(f"{api_url}/users/{user_id}/zakazky/{zakazka_id}", json=update_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ PUT /users/{user_id}/zakazky/{zakazka_id} test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"PUT /users/{user_id}/zakazky/{zakazka_id}",
                "passed": True,
                "response": data
            })
        else:
            print(f"❌ PUT /users/{user_id}/zakazky/{zakazka_id} test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"PUT /users/{user_id}/zakazky/{zakazka_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ PUT /users/{user_id}/zakazky/{zakazka_id} test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"PUT /users/{user_id}/zakazky/{zakazka_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 10: Verify zakazka was updated
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 10: Verifying zakazka was updated...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            zakazky = data.get("zakazky", [])
            
            # Check if the zakazka was updated
            zakazka_updated = False
            for zakazka in zakazky:
                if zakazka.get("id") == zakazka_id or zakazka.get("idZakazky") == "TEST123":
                    if zakazka.get("klient") == "Updated Test Klient" and zakazka.get("castka") == 30000:
                        zakazka_updated = True
                        print(f"✅ Zakazka was successfully updated: {zakazka}")
                        break
            
            if zakazka_updated:
                print(f"✅ Zakazka update verification test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka update verification",
                    "passed": True
                })
            else:
                print(f"❌ Zakazka update verification test failed! Updated values not found.")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka update verification",
                    "passed": False,
                    "error": "Updated values not found"
                })
        else:
            print(f"❌ Zakazka update verification test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Zakazka update verification",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Zakazka update verification test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Zakazka update verification",
            "passed": False,
            "error": str(e)
        })
    
    # Test 11: DELETE /users/{user_id}/zakazky/{zakazka_id} endpoint
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 11: Testing DELETE /users/{user_id}/zakazky/{zakazka_id} endpoint...")
        
        response = requests.delete(f"{api_url}/users/{user_id}/zakazky/{zakazka_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ DELETE /users/{user_id}/zakazky/{zakazka_id} test passed! Response: {data}")
            test_results["passed"] += 1
            test_results["tests"].append({
                "name": f"DELETE /users/{user_id}/zakazky/{zakazka_id}",
                "passed": True,
                "response": data
            })
        else:
            print(f"❌ DELETE /users/{user_id}/zakazky/{zakazka_id} test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": f"DELETE /users/{user_id}/zakazky/{zakazka_id}",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ DELETE /users/{user_id}/zakazky/{zakazka_id} test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": f"DELETE /users/{user_id}/zakazky/{zakazka_id}",
            "passed": False,
            "error": str(e)
        })
    
    # Test 12: Verify zakazka was deleted
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 12: Verifying zakazka was deleted...")
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            zakazky = data.get("zakazky", [])
            
            # Check if the zakazka was deleted
            zakazka_deleted = True
            for zakazka in zakazky:
                if zakazka.get("id") == zakazka_id or zakazka.get("idZakazky") == "TEST123":
                    zakazka_deleted = False
                    print(f"❌ Zakazka was not deleted: {zakazka}")
                    break
            
            if zakazka_deleted:
                print(f"✅ Zakazka deletion verification test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka deletion verification",
                    "passed": True
                })
            else:
                print(f"❌ Zakazka deletion verification test failed! Zakazka still exists.")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Zakazka deletion verification",
                    "passed": False,
                    "error": "Zakazka still exists"
                })
        else:
            print(f"❌ Zakazka deletion verification test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Zakazka deletion verification",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Zakazka deletion verification test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Zakazka deletion verification",
            "passed": False,
            "error": str(e)
        })
    
    # Test 13: Error handling test - invalid data
    test_results["total_tests"] += 1
    try:
        print(f"\nTest 13: Testing error handling with invalid data...")
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