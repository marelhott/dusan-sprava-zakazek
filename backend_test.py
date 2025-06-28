#!/usr/bin/env python3
import requests
import json
import os
import sys
from datetime import datetime

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
    
    print(f"Testing backend API at: {api_url}")
    print("=" * 50)
    
    test_results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "tests": []
    }
    
    # Test 1: Root endpoint
    test_results["total_tests"] += 1
    try:
        print("\nTest 1: Testing root endpoint...")
        response = requests.get(f"{api_url}/")
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Root endpoint test passed!")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Root endpoint",
                    "passed": True,
                    "response": data
                })
            else:
                print(f"❌ Root endpoint test failed! Unexpected response: {data}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Root endpoint",
                    "passed": False,
                    "response": data,
                    "error": "Unexpected response content"
                })
        else:
            print(f"❌ Root endpoint test failed! Status code: {response.status_code}")
            test_results["failed"] += 1
            test_results["tests"].append({
                "name": "Root endpoint",
                "passed": False,
                "status_code": response.status_code,
                "error": "Unexpected status code"
            })
    except Exception as e:
        print(f"❌ Root endpoint test failed with exception: {str(e)}")
        test_results["failed"] += 1
        test_results["tests"].append({
            "name": "Root endpoint",
            "passed": False,
            "error": str(e)
        })
    
    # Test 2: Create status check
    test_results["total_tests"] += 1
    try:
        print("\nTest 2: Testing POST /status endpoint...")
        client_name = f"PaintPro Test Client {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
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
            if isinstance(data, list):
                print(f"✅ Get status checks test passed! Retrieved {len(data)} status checks.")
                test_results["passed"] += 1
                test_results["tests"].append({
                    "name": "Get status checks",
                    "passed": True,
                    "count": len(data)
                })
            else:
                print(f"❌ Get status checks test failed! Expected list but got: {type(data)}")
                test_results["failed"] += 1
                test_results["tests"].append({
                    "name": "Get status checks",
                    "passed": False,
                    "response": data,
                    "error": "Expected list response"
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
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"Test Summary: {test_results['passed']}/{test_results['total_tests']} tests passed")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    return test_results

if __name__ == "__main__":
    run_tests()