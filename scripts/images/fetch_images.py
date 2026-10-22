#!/usr/bin/env python3
"""
Download the daily photographs from Wikimedia Commons, keeping ONLY files that are safe for a commercial site.

    python3 scripts/images/fetch_images.py              # fetch every pick in picks.json that is missing
    python3 scripts/images/fetch_images.py --refresh    # re-check and re-download everything

picks.json maps an image id (see src/data/images.ts) to a Commons file title. For each one this script:
  1. reads the file's Commons record (licence, author, source, licence templates);
  2. accepts it only if the licence is CC0, or public domain for a reason that holds worldwide
     (author dead 70+/100+ years, a US federal government work such as NASA, or released by the author),
     with no extra restrictions and no trademark/insignia warning; anything else is refused and reported;
  3. downloads a 1280px rendition, saves it as an optimised JPEG in public/daily/<id>.jpg;
  4. records the credit (author, licence, source page) in src/data/image-credits.json.

Commons rate-limits anonymous API use, so it identifies itself and backs off when told to.
"""
import hashlib, io, json, os, re, sys, time, html, urllib.parse, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PICKS = os.path.join(os.path.dirname(__file__), 'picks.json')
OUT_DIR = os.path.join(ROOT, 'public', 'daily')
CREDITS = os.path.join(ROOT, 'src', 'data', 'image-credits.json')
UA = 'ObscuraGame/1.0 (daily photo puzzle; https://github.com/stoketog/obscura)'

# Licence templates that make a file safe to use commercially with no conditions.
SAFE_TEMPLATES = re.compile(r'^Template:(Cc-zero|CC-zero|PD-old(-\d+)?(-expired|-auto.*)?|PD-USGov.*|PD-NASA|PD-self|PD-author|PD-user.*|PD-release|PD-because|PD-Art.*|PD-1923|PD-old-auto.*|PD-scan.*|PD-LOC.*|PD-Hubble|PD-Highsmith|PD-ineligible|PD-shape)$', re.I)
# Present on files whose public-domain status depends on US-only rules, or which carry other rights.
RISKY_TEMPLATES = re.compile(r'^Template:(PD-US-(expired|not[_ -]renewed|no[_ -]notice|unpublished)|Trademarked|Insignia|Non-free.*|ESA.*|ESO.*|Cc-by.*|FoP-.*|Copyrighted.*|Restricted.*)$', re.I)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(10):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                wait = int(e.headers.get('Retry-After') or 20) + 8
                print(f'    rate limited, waiting {wait}s', flush=True)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError('gave up after repeated rate limiting: ' + url)


def strip(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def check(page):
    """Return (ok, reasons, info) for one Commons page from the API."""
    ii = page['imageinfo'][0]
    meta = ii.get('extmetadata', {})
    lic = strip(meta.get('LicenseShortName', {}).get('value'))
    restrictions = strip(meta.get('Restrictions', {}).get('value'))
    templates = [t['title'] for t in page.get('templates', [])]
    safe = [t for t in templates if SAFE_TEMPLATES.match(t)]
    risky = [t for t in templates if RISKY_TEMPLATES.match(t)]
    reasons = []
    if not re.match(r'^(public domain|cc0)', lic, re.I):
        reasons.append(f'licence is "{lic}"')
    if restrictions:
        reasons.append(f'restrictions: {restrictions}')
    if not safe:
        reasons.append('no worldwide public-domain or CC0 template')
    if risky:
        reasons.append('carries ' + ', '.join(risky))
    author = strip(meta.get('Artist', {}).get('value')) or strip(meta.get('Credit', {}).get('value')) or 'Unknown'
    author = re.sub(r'\s+', ' ', author)[:120]
    info = {
        'license': 'CC0' if re.match('cc0', lic, re.I) else 'Public domain',
        'licenseUrl': meta.get('LicenseUrl', {}).get('value') or None,
        'author': author,
        'source': ii['descriptionurl'],
        # Thumbnails are served from upload.wikimedia.org at standard widths (1280 is one of them).
        'thumb': (ii.get('thumburl') or ii['url']).split('?')[0].replace('thumb.wikimedia.org', 'upload.wikimedia.org'),
        'templates': safe,
    }
    return (not reasons, reasons, info)


def main():
    refresh = '--refresh' in sys.argv
    picks = json.load(open(PICKS))
    credits = json.load(open(CREDITS)) if os.path.exists(CREDITS) else {}
    os.makedirs(OUT_DIR, exist_ok=True)
    todo = {k: v for k, v in picks.items() if refresh or k not in credits or not os.path.exists(os.path.join(OUT_DIR, credits[k]['file']))}
    refused = {}
    titles = list(todo.values())
    pages = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i:i + 40]
        params = {'action': 'query', 'format': 'json', 'titles': '|'.join(chunk), 'prop': 'imageinfo|templates',
                  'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1280, 'tlnamespace': 10, 'tllimit': 'max'}
        # The template list is shared across the whole batch and paged: keep asking until every page has all of its
        # templates, or a file's licence template could be missed and the file wrongly refused (or worse, accepted).
        cont = {}
        while True:
            d = get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({**params, **cont}))
            norm = {n['to']: n['from'] for n in d['query'].get('normalized', [])}
            for p in d['query']['pages'].values():
                key = norm.get(p['title'], p['title'])
                prev = pages.get(key)
                if prev:
                    prev['templates'] = prev.get('templates', []) + p.get('templates', [])
                    prev.setdefault('imageinfo', p.get('imageinfo'))
                else:
                    pages[key] = p
            if 'continue' not in d:
                break
            cont = d['continue']
            time.sleep(3)
        time.sleep(3)
    for key, title in todo.items():
        page = pages.get(title)
        if not page or 'imageinfo' not in page:
            refused[key] = ['file not found on Commons']
            continue
        ok, reasons, info = check(page)
        if not ok:
            refused[key] = reasons
            credits.pop(key, None)
            continue
        raw = get(info['thumb'], binary=True)
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        img.thumbnail((1280, 1280))
        # Hashed file names, so the answer is not sitting in the page's network log.
        name = hashlib.sha1(('obscura-daily:' + key).encode()).hexdigest()[:16] + '.jpg'
        img.save(os.path.join(OUT_DIR, name), 'JPEG', quality=82, optimize=True, progressive=True)
        credits[key] = {'file': name, 'width': img.width, 'height': img.height, 'title': title, 'author': info['author'],
                        'license': info['license'], **({'licenseUrl': info['licenseUrl']} if info['licenseUrl'] else {}),
                        'source': info['source'], 'templates': sorted({t[len('Template:'):].split('/')[0] for t in info['templates']})}
        # Save after every photo, so an interrupted run keeps what it already approved.
        json.dump(dict(sorted(credits.items())), open(CREDITS, 'w'), indent=2, ensure_ascii=False)
        print(f'  ✓ {key}: {title} [{info["license"]}; {", ".join(t[9:] for t in info["templates"])}]', flush=True)
        time.sleep(15)
    json.dump(dict(sorted(credits.items())), open(CREDITS, 'w'), indent=2, ensure_ascii=False)
    for key, why in refused.items():
        print(f'  ✗ {key}: {picks[key]} refused: {"; ".join(why)}')
    print(f'{len(credits)} images approved, {len(refused)} refused')
    return 1 if refused else 0


if __name__ == '__main__':
    sys.exit(main())
