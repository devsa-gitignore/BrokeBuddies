import urllib.request
import json

def fetch_ig(username):
    url = f'https://www.instagram.com/{username}/'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'})
    try:
        resp = urllib.request.urlopen(req)
        return resp.read().decode('utf-8')
    except Exception as e:
        return ""

body1 = fetch_ig('instagram')
body2 = fetch_ig('thisuserdoesnotexist_123456789')

print("Length valid:", len(body1))
print("Length invalid:", len(body2))
if len(body1) == len(body2):
    print("Exact same length! Likely impossible to distinguish without executing JS or using API")
else:
    print("Different lengths!")
    # Save bodies for comparison
    with open('ig_valid.html', 'w', encoding='utf-8') as f:
        f.write(body1)
    with open('ig_invalid.html', 'w', encoding='utf-8') as f:
        f.write(body2)
