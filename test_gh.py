import urllib.request
import json

def test_gh(email):
    url = f'https://api.github.com/search/users?q={email}+in:email'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode('utf-8'))
        print(f'{email}: Found {len(data.get("items", []))} items')
    except Exception as e:
        print(f'{email}: Error {e}')

test_gh('torvalds@linux-foundation.org')
test_gh('suhani.gupta@example.com')
