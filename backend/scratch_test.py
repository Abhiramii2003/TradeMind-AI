import urllib.request
import re
req = urllib.request.Request('https://en.wikipedia.org/wiki/NIFTY_50', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
matches = set(re.findall(r'<td><a rel="nofollow" class="external text" href="[^>]+>([^<]+)</a></td>', html))
print(matches)
