import http.server
import json
import urllib.request
from urllib.parse import urlparse, parse_qs

API_KEY = 'ee795cb5-1bac-4402-baa2-12008649f65e'

class SimpleHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        lat = params.get('lat', [None])[0]
        lon = params.get('lon', [None])[0]
        if not lat or not lon:
            self.send_response(400)
            self.send_header("Content-type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"Missing lat or lon parameter")
            return
        weather_url = f"https://api.weather.yandex.ru/v2/forecast?lat={lat}&lon={lon}"
        req = urllib.request.Request(
            weather_url,
            headers={'X-Yandex-Weather-Key': API_KEY}
        )
        try:
            with urllib.request.urlopen(req) as response:
                weather_data = response.read()
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                print(type(weather_data))
                self.wfile.write(weather_data)

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Content-type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(f"Error: {e.reason}".encode())
        
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(f"Internal Server Error: {str(e)}".encode())

if __name__ == "__main__":
    server_address = ('', 8080)
    httpd = http.server.HTTPServer(server_address, SimpleHTTPRequestHandler)
    print("Starting server on port 8080...")
    httpd.serve_forever()