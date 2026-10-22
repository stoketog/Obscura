#!/usr/bin/env python3
"""
Find a photograph for each subject in subjects.py in the Metropolitan Museum of Art's Open Access collection.
Everything the Met marks `isPublicDomain` is released under CC0, so it is safe for commercial use worldwide.

    python3 scripts/images/metpick.py              # every subject without a photograph yet
    python3 scripts/images/metpick.py taj-mahal    # just these

For each subject: search the Met (v1.1 search, objects with images), keep only public-domain objects whose title
names the subject (the answer or one of its aliases), prefer photographs for places, people and nature, download
the original, keep it if it is at least 1280px on the long side and not too narrow or wide, save a 1280px JPEG
under a hashed name in public/daily/ and record the credit in image-credits.json. Every pick is then reviewed by
eye (contact sheets) before it is used. Progress is saved after every subject.
"""
import hashlib, io, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, urllib.error
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from subjects import S  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT_DIR = os.path.join(ROOT, 'public', 'daily')
CREDITS = os.path.join(ROOT, 'src', 'data', 'image-credits.json')
PICKS = os.path.join(HERE, 'picks.json')
MISSES = os.path.join(HERE, 'no-met-photo.json')
API = 'https://collectionapi.metmuseum.org/public/collection'
UA = 'ObscuraGame/1.0 (daily photo puzzle; https://github.com/stoketog/obscura)'
PAUSE = 0.3


def fetch(url, binary=False, tries=5):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for _ in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
                time.sleep(PAUSE)
                return data if binary else json.loads(data.decode('utf-8', 'replace'))
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504):
                time.sleep(10)
                continue
            return None
        except Exception:
            time.sleep(3)
    return None


def plain(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', ' ', s.replace('’', "'").replace("'", '')).strip()


def names_subject(text, names):
    t = f' {plain(text)} '
    return any(f' {plain(n)} ' in t for n in names if len(plain(n)) >= 4)


def search(q, limit=40):
    url = f'{API}/v1.1/search?' + urllib.parse.urlencode({'q': q, 'hasImages': 'true', 'limit': limit})
    d = fetch(url) or {}
    return d.get('objectIDs') or []


PHOTO_KINDS = {'place', 'person', 'nature', 'space'}


def main():
    only = set(sys.argv[1:])
    credits = json.load(open(CREDITS))
    picks = json.load(open(PICKS))
    misses = json.load(open(MISSES)) if os.path.exists(MISSES) else {}
    todo = [s for s in S if s[0] in only] if only else [s for s in S if s[0] not in credits and s[0] not in misses]
    print(f'{len(todo)} subjects', flush=True)
    for sid, answer, aliases, kind, query, _blurb in todo:
        names = [answer] + list(aliases)
        cands = []
        for q in dict.fromkeys([answer, query]):
            for oid in search(q):
                if oid in [c['objectID'] for c in cands]:
                    continue
                o = fetch(f'{API}/v1/objects/{oid}')
                if not o or not o.get('isPublicDomain') or not o.get('primaryImage'):
                    continue
                if not names_subject(o.get('title', ''), names):
                    continue
                photo = (o.get('classification') or '').lower().startswith('photograph') or 'photograph' in (o.get('objectName') or '').lower()
                if kind in ('place', 'space', 'nature') and not photo:
                    continue  # paintings of a place are too loose (the bridge is a speck on the horizon)
                if kind == 'artwork':
                    # the right work: the artist named in the search ("Water Lilies Monet") must be the Met's artist
                    extra = [w for w in plain(query).split() if w not in plain(' '.join(names)).split() and len(w) > 3]
                    artist = plain(o.get('artistDisplayName') or '')
                    if extra and not any(w in artist.split() for w in extra):
                        continue
                cands.append(o)
                if len(cands) >= 12:
                    break
            if len(cands) >= 12:
                break
        # Photographs first for things you'd photograph; for artworks the object itself is the subject.
        def rank(o):
            photo = (o.get('classification') or '').lower().startswith('photograph')
            return (0 if (photo == (kind in PHOTO_KINDS)) else 1, len(o.get('title', '')))
        cands.sort(key=rank)
        got = None
        for o in cands:
            data = fetch(o['primaryImage'], binary=True)
            if not data:
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
            artist = o.get('artistDisplayName') or 'Unknown'
            got = {'file': name, 'width': img.width, 'height': img.height, 'title': o.get('title', ''), 'author': artist,
                   'license': 'CC0', 'source': o.get('objectURL') or f'https://www.metmuseum.org/art/collection/search/{o["objectID"]}',
                   'templates': ['Met Open Access'], 'date': o.get('objectDate', ''), 'classification': o.get('classification', '')}
            break
        if got:
            credits[sid] = got
            picks[sid] = 'met:' + got['source']
            print(f'  ✓ {sid}: {got["title"]} ({got["classification"]}, {got["date"]})', flush=True)
        else:
            misses[sid] = query
            print(f'  ✗ {sid}', flush=True)
        json.dump(dict(sorted(credits.items())), open(CREDITS, 'w'), indent=2, ensure_ascii=False)
        json.dump(dict(sorted(picks.items())), open(PICKS, 'w'), indent=2, ensure_ascii=False)
        json.dump(dict(sorted(misses.items())), open(MISSES, 'w'), indent=2, ensure_ascii=False)
    print(f'done: {sum(1 for s in S if s[0] in credits)} subjects have photographs')


if __name__ == '__main__':
    main()
