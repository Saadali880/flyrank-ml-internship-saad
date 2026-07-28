import sys
import os

# Add the current directory to python path to ensure we can import mcp_server
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mcp_server import get_system_status, fetch_openmeteo_weather, find_local_files_containing_text

print("========================================")
print("TESTING MCP SERVER FUNCTIONS LOCALLY")
print("========================================\n")

print("--- 1. Testing get_system_status ---")
try:
    status_output = get_system_status()
    print(status_output)
    print("SUCCESS!\n")
except Exception as e:
    print(f"FAILED: {e}\n")

print("--- 2. Testing fetch_openmeteo_weather (London) ---")
try:
    weather_output = fetch_openmeteo_weather("London")
    print(weather_output)
    print("SUCCESS!\n")
except Exception as e:
    print(f"FAILED: {e}\n")

print("--- 3. Testing find_local_files_containing_text ('DraftingAgent') ---")
try:
    search_output = find_local_files_containing_text("DraftingAgent")
    print(search_output)
    print("SUCCESS!\n")
except Exception as e:
    print(f"FAILED: {e}\n")

print("========================================")
print("TEST COMPLETED")
print("========================================")
