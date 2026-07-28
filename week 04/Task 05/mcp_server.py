import os
import httpx
import psutil
import platform
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("FlyRank-MCP-Server")

@mcp.tool()
def get_system_status() -> str:
    """Get the current system resource usage status (CPU, memory, disk, OS).
    Chat alone cannot inspect the local machine's resource utilization.
    """
    cpu = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return (
        f"System Status:\n"
        f"- OS: {platform.system()} {platform.release()} ({platform.machine()})\n"
        f"- CPU Usage: {cpu}%\n"
        f"- Memory: {mem.percent}% used ({(mem.total - mem.available) / (1024**3):.2f} GB / {mem.total / (1024**3):.2f} GB)\n"
        f"- Disk: {disk.percent}% used ({disk.used / (1024**3):.2f} GB / {disk.total / (1024**3):.2f} GB)"
    )

@mcp.tool()
def fetch_openmeteo_weather(city: str) -> str:
    """Fetch the real-time weather information for a city using Open-Meteo's public API.
    Chat alone cannot perform real-time network requests to check the live weather.
    """
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        geo_res = httpx.get(geo_url)
        geo_data = geo_res.json()
        if not geo_data.get("results"):
            return f"Error: City '{city}' not found."
        
        result = geo_data["results"][0]
        name = result["name"]
        country = result.get("country", "")
        lat = result["latitude"]
        lon = result["longitude"]
        
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
        weather_res = httpx.get(weather_url)
        weather_data = weather_res.json()
        
        current = weather_data["current"]
        temp = current["temperature_2m"]
        humidity = current["relative_humidity_2m"]
        wind = current["wind_speed_10m"]
        weather_code = current["weather_code"]
        
        weather_desc = {
            0: "Clear sky",
            1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Fog", 48: "Depositing rime fog",
            51: "Drizzle: Light", 53: "Drizzle: Moderate", 55: "Drizzle: Dense intensity",
            61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy intensity",
            71: "Snow fall: Slight", 73: "Snow fall: Moderate", 75: "Snow fall: Heavy intensity",
            77: "Snow grains",
            80: "Rain showers: Slight", 81: "Rain showers: Moderate", 82: "Rain showers: Violent",
            85: "Snow showers: Slight", 86: "Snow showers: Heavy",
            95: "Thunderstorm: Slight or moderate", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
        }
        desc = weather_desc.get(weather_code, f"Code {weather_code}")
        
        return (
            f"Current weather in {name}, {country} (Lat: {lat:.2f}, Lon: {lon:.2f}):\n"
            f"- Conditions: {desc}\n"
            f"- Temperature: {temp}°C\n"
            f"- Relative Humidity: {humidity}%\n"
            f"- Wind Speed: {wind} km/h"
        )
    except Exception as e:
        return f"Error fetching weather data: {str(e)}"

@mcp.tool()
def find_local_files_containing_text(search_text: str) -> str:
    """Search for text files in the FlyRank repository workspace that contain the specified text.
    Chat alone cannot search local repository files or read their contents.
    """
    search_dir = "d:/Flyrank"
    matches = []
    extensions = [".py", ".md", ".txt", ".json", ".js", ".css", ".html"]
    
    count = 0
    for root, dirs, files in os.walk(search_dir):
        if any(ignored in root.lower() for ignored in [".git", "runs", "node_modules", ".gemini"]):
            continue
            
        for file in files:
            if not any(file.endswith(ext) for ext in extensions):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if search_text.lower() in content.lower():
                        lines = content.splitlines()
                        matching_lines = []
                        for idx, line in enumerate(lines):
                            if search_text.lower() in line.lower():
                                matching_lines.append(f"  Line {idx+1}: {line.strip()[:100]}")
                                if len(matching_lines) >= 3:
                                    matching_lines.append("  (truncated...)")
                                    break
                        matches.append(
                            f"File: {os.path.relpath(file_path, search_dir)}\n" + 
                            "\n".join(matching_lines)
                        )
                        count += 1
                        if count >= 10:
                            break
            except Exception:
                pass
        if count >= 10:
            break
            
    if not matches:
        return f"No occurrences of '{search_text}' found in text files."
        
    return f"Found '{search_text}' in {len(matches)} files:\n\n" + "\n\n".join(matches)

if __name__ == "__main__":
    # Start the MCP server using stdio transport
    mcp.run(transport="stdio")
