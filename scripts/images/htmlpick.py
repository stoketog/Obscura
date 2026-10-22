#!/usr/bin/env python3
"""
Find, licence-check and download a photograph for every subject in subjects.py, using Commons' ordinary web pages
instead of its API (the API rate-limits shared networks hard; the website does not, at a polite pace).

    python3 scripts/images/htmlpick.py              # every subject without a photograph yet
    python3 scripts/images/htmlpick.py moai sphinx  # just these

For each subject:
  1. search Commons (Special:Search, files only) for the subject;
  2. for each result in order, read the file's wikitext (action=raw) and accept it only if it carries a licence
     template that is safe worldwide for commercial use (CC0, or public domain for a reason that holds everywhere)
     and nothing risky (any CC BY licence, US-only public domain, trademark or insignia warnings, freedom of
     panorama notes, non-free content): the same rules as fetch_images.py;
  3. download the original, keep it only if it is at least 1280px on the long side and not too narrow or wide,
     save a 1280px JPEG under a hashed name in public/daily/, and record the credit in image-credits.json.
Progress is saved after every subject, so it can be stopped and restarted.
"""
import hashlib, html, io, json, os, re, sys, time, urllib.parse, urllib.request, urllib.error
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from subjects import S  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT_DIR = os.path.join(ROOT, 'public', 'daily')
CREDITS = os.path.join(ROOT, 'src', 'data', 'image-credits.json')
PICKS = os.path.join(HERE, 'picks.json')
MISSES = os.path.join(HERE, 'no-safe-photo.json')
UA = 'ObscuraGame/1.0 (daily photo puzzle; https://github.com/stoketog/obscura)'
SITE = 'https://commons.wikimedia.org'
PAUSE = 3.0

SAFE = re.compile(r'^(cc-zero|cc0|pd-old(-\d+)?(-expired|-auto.*)?|pd-usgov.*|pd-nasa|pd-self|pd-author|pd-user.*|pd-release|pd-because|pd-art.*|pd-1923|pd-scan.*|pd-loc.*|pd-hubble|pd-highsmith|pd-ineligible|pd-shape|pd-old-auto.*)$', re.I)
RISKY = re.compile(r'^(pd-us-(expired|not[_ -]renewed|no[_ -]notice|unpublished).*|trademarked|insignia|non-free.*|esa.*|eso.*|cc-by.*|fop-.*|copyrighted.*|restricted.*|gfdl.*|attribution.*|copyright.*)$', re.I)


def fetch(url, binary=False, tries=6):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
                time.sleep(PAUSE)
                return data if binary else data.decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                wait = int(e.headers.get('Retry-After') or 20) + 5
                print(f'    busy ({e.code}), waiting {wait}s', flush=True)
                time.sleep(wait)
                continue
            if e.code == 404:
                return None
            raise
    return None


def search(query, limit=20):
    url = f'{SITE}/w/index.php?' + urllib.parse.urlencode({'search': f'{query} filetype:bitmap', 'title': 'Special:Search', 'ns6': 1, 'fulltext': 1, 'limit': limit})
    page = fetch(url) or ''
    titles = re.findall(r'<div class="mw-search-result-heading"><a href="/wiki/(File:[^"#?]+)"', page)
    return [urllib.parse.unquote(t).replace('_', ' ') for t in titles]


def templates(wikitext):
    """Every template name used, plus the licences given inside {{self|...}} and {{PD-Art|...}}."""
    names = []
    for m in re.finditer(r'\{\{\s*([^{}|]+?)\s*(\|[^{}]*)?\}\}', wikitext):
        name = m.group(1).strip().replace('_', ' ').replace(' ', '-')
        names.append(name)
        if name.lower() in ('self', 'pd-art', 'pd-scan', 'licensed-pd-art', 'licensed-pd-art-two') and m.group(2):
            for part in m.group(2).split('|')[1:]:
                part = part.strip()
                if part and '=' not in part:
                    names.append(part.replace(' ', '-'))
    return names


def author_of(wikitext):
    m = re.search(r'\|\s*[Aa]uthor\s*=\s*(.+)', wikitext)
    if not m:
        return 'Unknown'
    a = m.group(1)
    a = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', a)
    a = re.sub(r'\[https?://\S+\s*([^\]]*)\]', r'\1', a)
    a = re.sub(r'\{\{[^{}]*\|([^{}|]*)\}\}', r'\1', a)
    a = re.sub(r'\{\{[^{}]*\}\}|<[^>]+>|\'\'+', '', a)
    a = html.unescape(re.sub(r'\s+', ' ', a)).strip(' .,;:')
    return a[:120] or 'Unknown'


def licence_ok(title):
    raw = fetch(f'{SITE}/w/index.php?' + urllib.parse.urlencode({'title': title, 'action': 'raw'}))
    if not raw:
        return None
    names = templates(raw)
    safe = [n for n in names if SAFE.match(n)]
    risky = [n for n in names if RISKY.match(n)]
    if not safe or risky:
        return None
    cc0 = any(n.lower() in ('cc-zero', 'cc0') for n in safe)
    return {'license': 'CC0' if cc0 else 'Public domain', 'author': author_of(raw), 'templates': sorted({n for n in safe})}


def original_url(title):
    name = title[len('File:'):].replace(' ', '_')
    h = hashlib.md5(name.encode('utf-8')).hexdigest()
    return f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(name)}'


def main():
    only = set(sys.argv[1:])
    credits = json.load(open(CREDITS))
    picks = json.load(open(PICKS))
    misses = json.load(open(MISSES)) if os.path.exists(MISSES) else {}
    todo = [s for s in S if s[0] in only] if only else [s for s in S if s[0] not in credits and s[0] not in misses]
    print(f'{len(todo)} subjects', flush=True)
    for sid, answer, _al, _kind, query, _blurb in todo:
        got = None
        tried = 0
        for q in dict.fromkeys([query, answer]):
            for title in search(q):
                if not re.search(r'\.(jpe?g|png)$', title, re.I):
                    continue
                tried += 1
                if tried > 8:
                    break
                lic = licence_ok(title)
                if not lic:
                    continue
                data = fetch(original_url(title), binary=True)
                if not data or len(data) > 60_000_000:
                    continue
                try:
                    img = Image.open(io.BytesIO(data))
                    img.load()
                except Exception:
                    continue
                w, h = img.size
                if max(w, h) < 1280 or not (0.5 <= w / h <= 2.2):
                    continue
                img = img.convert('RGB')
                img.thumbnail((1280, 1280))
                name = hashlib.sha1(('obscura-daily:' + sid).encode()).hexdigest()[:16] + '.jpg'
                img.save(os.path.join(OUT_DIR, name), 'JPEG', quality=82, optimize=True, progressive=True)
                got = {'file': name, 'width': img.width, 'height': img.height, 'title': title, 'author': lic['author'],
                       'license': lic['license'], 'source': f'{SITE}/wiki/' + urllib.parse.quote(title.replace(' ', '_')),
                       'templates': lic['templates']}
                break
            if got:
                break
        if got:
            credits[sid] = got
            picks[sid] = got['title']
            misses.pop(sid, None)
            print(f'  ✓ {sid}: {got["title"]} [{got["license"]}]', flush=True)
        else:
            misses[sid] = query
            print(f'  ✗ {sid}: nothing safe', flush=True)
        json.dump(dict(sorted(credits.items())), open(CREDITS, 'w'), indent=2, ensure_ascii=False)
        json.dump(dict(sorted(picks.items())), open(PICKS, 'w'), indent=2, ensure_ascii=False)
        json.dump(dict(sorted(misses.items())), open(MISSES, 'w'), indent=2, ensure_ascii=False)
    print(f'done: {sum(1 for s in S if s[0] in credits)} subjects have photographs, {len(misses)} have none')


if __name__ == '__main__':
    main()
