#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime

# Get the backend URL from the frontend .env file
def get_backend_url():
    return "https://fe7b677f-9b06-4e7e-9b49-e59343a6061b.preview.emergentagent.com"

def add_24_orders():
    backend_url = get_backend_url()
    api_url = f"{backend_url}/api"
    
    print(f"Adding 24 orders to the database")
    print(f"Using API URL: {api_url}")
    print("=" * 50)
    
    # Use the specific user ID from the review request
    user_id = "999888"  # PIN for testing as specified in the request
    print(f"Using user ID: {user_id}")
    
    # Define the 24 orders to add
    orders = [
        # 1
        {
            "datum": "11. 4. 2025",
            "druh": "MvČ",
            "castka": 10000,
            "pomocnik": 2000,
            "klient": "Gabriela Hajduchová",
            "adresa": "Letohradská, Praha 7",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 2
        {
            "datum": "14. 4. 2025",
            "druh": "Adam - minutost",
            "castka": 14000,
            "pomocnik": 2000,
            "klient": "Tereza Pochobradská",
            "adresa": "Cimburkova 9, Praha 3",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 3
        {
            "datum": "17. 4. 2025",
            "druh": "MvČ",
            "castka": 15000,
            "pomocnik": 2000,
            "klient": "Katka Szcepaniková",
            "adresa": "Nad aleji 23, Praha 6",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 4
        {
            "datum": "18. 4. 2025",
            "druh": "Adam - Albert",
            "castka": 3000,
            "pomocnik": 0,
            "klient": "Jan Novák",
            "adresa": "U Průhonu, Praha 7",
            "typ": "byt",
            "dobaRealizace": 1,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 5
        {
            "datum": "21. 4. 2025",
            "druh": "MvČ",
            "castka": 25000,
            "pomocnik": 4000,
            "klient": "Marek Rucki",
            "adresa": "Národní obrany 49, Praha 6",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 6
        {
            "datum": "22. 4. 2025",
            "druh": "MvČ",
            "castka": 18000,
            "pomocnik": 3000,
            "klient": "Petr Novotný",
            "adresa": "Vinohradská 112, Praha 3",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 7
        {
            "datum": "24. 4. 2025",
            "druh": "Adam - minutost",
            "castka": 12000,
            "pomocnik": 2000,
            "klient": "Jana Svobodová",
            "adresa": "Korunní 98, Praha 2",
            "typ": "byt",
            "dobaRealizace": 1,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 8
        {
            "datum": "25. 4. 2025",
            "druh": "MvČ",
            "castka": 22000,
            "pomocnik": 3500,
            "klient": "Martin Kovář",
            "adresa": "Dejvická 55, Praha 6",
            "typ": "byt",
            "dobaRealizace": 3,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 9
        {
            "datum": "28. 4. 2025",
            "druh": "Adam - Albert",
            "castka": 4500,
            "pomocnik": 0,
            "klient": "Lucie Malá",
            "adresa": "Italská 34, Praha 2",
            "typ": "byt",
            "dobaRealizace": 1,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 10
        {
            "datum": "29. 4. 2025",
            "druh": "MvČ",
            "castka": 30000,
            "pomocnik": 5000,
            "klient": "Tomáš Veselý",
            "adresa": "Bělohorská 142, Praha 6",
            "typ": "dům",
            "dobaRealizace": 4,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 11
        {
            "datum": "2. 5. 2025",
            "druh": "MvČ",
            "castka": 16000,
            "pomocnik": 2500,
            "klient": "Kateřina Dvořáková",
            "adresa": "Slezská 78, Praha 3",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 12
        {
            "datum": "5. 5. 2025",
            "druh": "Adam - minutost",
            "castka": 13000,
            "pomocnik": 2000,
            "klient": "Jiří Procházka",
            "adresa": "Sokolovská 45, Praha 8",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 13
        {
            "datum": "7. 5. 2025",
            "druh": "MvČ",
            "castka": 28000,
            "pomocnik": 4500,
            "klient": "Eva Černá",
            "adresa": "Vršovická 103, Praha 10",
            "typ": "byt",
            "dobaRealizace": 3,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 14
        {
            "datum": "9. 5. 2025",
            "druh": "Adam - Albert",
            "castka": 5000,
            "pomocnik": 0,
            "klient": "Michal Kučera",
            "adresa": "Nuselská 56, Praha 4",
            "typ": "byt",
            "dobaRealizace": 1,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 15
        {
            "datum": "12. 5. 2025",
            "druh": "MvČ",
            "castka": 20000,
            "pomocnik": 3000,
            "klient": "Lenka Pokorná",
            "adresa": "Kodaňská 82, Praha 10",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 16
        {
            "datum": "14. 5. 2025",
            "druh": "MvČ",
            "castka": 35000,
            "pomocnik": 6000,
            "klient": "Pavel Horák",
            "adresa": "Nad Kajetánkou 17, Praha 6",
            "typ": "dům",
            "dobaRealizace": 5,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 17
        {
            "datum": "16. 5. 2025",
            "druh": "Adam - minutost",
            "castka": 15000,
            "pomocnik": 2500,
            "klient": "Hana Marková",
            "adresa": "Francouzská 25, Praha 2",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 18
        {
            "datum": "19. 5. 2025",
            "druh": "MvČ",
            "castka": 24000,
            "pomocnik": 4000,
            "klient": "Jakub Beneš",
            "adresa": "Seifertova 65, Praha 3",
            "typ": "byt",
            "dobaRealizace": 3,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 19
        {
            "datum": "21. 5. 2025",
            "druh": "Adam - Albert",
            "castka": 4000,
            "pomocnik": 0,
            "klient": "Zuzana Králová",
            "adresa": "Bubenská 12, Praha 7",
            "typ": "byt",
            "dobaRealizace": 1,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 20
        {
            "datum": "23. 5. 2025",
            "druh": "MvČ",
            "castka": 26000,
            "pomocnik": 4500,
            "klient": "Ondřej Novák",
            "adresa": "Pplk. Sochora 28, Praha 7",
            "typ": "byt",
            "dobaRealizace": 3,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 21
        {
            "datum": "26. 5. 2025",
            "druh": "MvČ",
            "castka": 19000,
            "pomocnik": 3000,
            "klient": "Barbora Tichá",
            "adresa": "Milady Horákové 116, Praha 6",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 22
        {
            "datum": "28. 5. 2025",
            "druh": "Adam - minutost",
            "castka": 16000,
            "pomocnik": 2500,
            "klient": "Daniel Šimek",
            "adresa": "Křižíkova 55, Praha 8",
            "typ": "byt",
            "dobaRealizace": 2,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 23
        {
            "datum": "30. 5. 2025",
            "druh": "MvČ",
            "castka": 32000,
            "pomocnik": 5500,
            "klient": "Veronika Němcová",
            "adresa": "Koněvova 148, Praha 3",
            "typ": "dům",
            "dobaRealizace": 4,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        },
        # 24
        {
            "datum": "2. 6. 2025",
            "druh": "MvČ",
            "castka": 23000,
            "pomocnik": 4000,
            "klient": "Radek Doležal",
            "adresa": "Uruguayská 17, Praha 2",
            "typ": "byt",
            "dobaRealizace": 3,
            "poznamky": "",
            "cislo": "",
            "fee": 0,
            "material": 800,
            "palivo": 250
        }
    ]
    
    # Add each order one by one
    added_orders = []
    for i, order in enumerate(orders, 1):
        print(f"\nAdding order {i}/24: {order['klient']} - {order['druh']}")
        
        # Convert the order data to match the API expectations
        api_order = {
            "datum": order["datum"],
            "druh": order["druh"],
            "klient": order["klient"],
            "idZakazky": order.get("cislo", ""),  # Use empty string if not provided
            "castka": order["castka"],
            "fee": order.get("fee", 0),  # Default to 0 if not provided
            "feeOff": 0,  # Default value
            "palivo": order.get("palivo", 250),  # Default to 250 if not provided
            "material": order.get("material", 800),  # Default to 800 if not provided
            "pomocnik": order["pomocnik"],
            "zisk": order["castka"] - order.get("fee", 0) - order.get("palivo", 250) - order.get("material", 800) - order["pomocnik"],  # Calculate zisk
            "adresa": order["adresa"],
            "telefon": "",  # Default empty
            "doba_realizace": order.get("dobaRealizace", 1),  # Default to 1 if not provided
            "poznamky": order.get("poznamky", ""),  # Default to empty string if not provided
            "soubory": []  # Default empty array
        }
        
        try:
            response = requests.post(f"{api_url}/users/{user_id}/zakazky", json=api_order)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Order added successfully! Response: {data}")
                added_orders.append(data)
            else:
                print(f"❌ Failed to add order! Status code: {response.status_code}")
                print(f"Response: {response.text}")
            
            # Add a small delay between requests to avoid overwhelming the server
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Error adding order: {str(e)}")
    
    # Verify that all orders were added
    print("\n" + "=" * 50)
    print("Verifying all orders were added...")
    
    try:
        response = requests.get(f"{api_url}/users/{user_id}/zakazky")
        
        if response.status_code == 200:
            data = response.json()
            zakazky = data.get("zakazky", [])
            
            print(f"Found {len(zakazky)} orders in the database")
            
            if len(zakazky) >= 24:
                print("✅ Verification successful! At least 24 orders found in the database.")
            else:
                print(f"❌ Verification failed! Expected at least 24 orders, but found {len(zakazky)}.")
        else:
            print(f"❌ Failed to verify orders! Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error verifying orders: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"Summary: Added {len(added_orders)}/24 orders")
    print("=" * 50)

if __name__ == "__main__":
    add_24_orders()