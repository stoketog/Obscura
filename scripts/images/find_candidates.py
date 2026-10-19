#!/usr/bin/env python3
"""
Find public-domain / CC0 photographs on Wikimedia Commons for a subject, to choose a pick for picks.json.

    python3 scripts/images/find_candidates.py "Bell Rock Lighthouse" "Taj Mahal"

Lists files whose Commons licence is Public domain or CC0, at least 1280px on the long side, best first.
This is only a shortlist: fetch_images.py still checks every pick's licence templates before using it.
"""
import json, re, sys, time, html, urllib.parse, urllib.request, urllib.error

UA = 'ObscuraGame/1.0 (daily photo puzzle; https://github.com/stoketog/obscura)'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for _ in range(10):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                time.sleep(int(e.headers.get('Retry-After') or 20) + 2)
                continue
            raise
    raise RuntimeError('rate limited: ' + url)


def strip(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def candidates(subject, limit=40):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': 6, 'gsrlimit': limit,
              'gsrsearch': f'{subject} filetype:bitmap', 'prop': 'imageinfo', 'iiprop': 'size|extmetadata'}
    d = get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params))
    out = []
    for p in d.get('query', {}).get('pages', {}).values():
        ii = p['imageinfo'][0]
        m = ii.get('extmetadata', {})
        lic = strip(m.get('LicenseShortName', {}).get('value'))
        if not re.match(r'^(public domain|cc0)', lic, re.I) or strip(m.get('Restrictions', {}).get('value')):
            continue
        if max(ii['width'], ii['height']) < 1280:
            continue
        out.append((p.get('index', 999), p['title'], lic, f"{ii['width']}x{ii['height']}", strip(m.get('Artist', {}).get('value'))[:60]))
    return sorted(out)


if __name__ == '__main__':
    for subject in sys.argv[1:]:
        print(f'\n## {subject}')
        for _, title, lic, size, artist in candidates(subject):
            print(f'  {title} | {lic} | {size} | {artist}')
        time.sleep(3)
