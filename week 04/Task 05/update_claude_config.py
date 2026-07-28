import json
import os

config_path = os.path.expandvars(
    r"%USERPROFILE%\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json"
)

if not os.path.exists(config_path):
    print(f"Error: Configuration file not found at {config_path}")
    exit(1)

# Read existing configuration
with open(config_path, "r", encoding="utf-8") as f:
    config = json.load(f)

# Define our MCP Server config
mcp_servers = config.get("mcpServers", {})
mcp_servers["flyrank-mcp"] = {
    "command": r"C:\Users\hassa\AppData\Local\Programs\Python\Python313\python.exe",
    "args": [
        "d:/Flyrank/week 04/Task 05/mcp_server.py"
    ]
}

config["mcpServers"] = mcp_servers

# Write back the updated configuration
with open(config_path, "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2)

print("SUCCESS: Claude Desktop configuration has been successfully updated!")
print(f"File updated: {config_path}")
