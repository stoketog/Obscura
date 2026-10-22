#!/usr/bin/env python3
"""
Choose a Commons file for every subject in subjects.py that has no pick yet, and write it to picks.json.

    python3 scripts/images/autopick.py

For each subject it searches Commons, keeps only files whose full licence-template check passes (the same check
fetch_images.py makes before downloading), at least 1280px on the long side and not too narrow or too wide, and
picks the best-ranked one. Up to four runners-up are kept in alternates.json, so a pick that looks wrong when it is
reviewed can be swapped without searching again. Progress is saved after every subject.
"""
import json, os, sys, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from fetch_images import get, check  # noqa: E402
from subjects import S  # noqa: E402

PICKS = os.path.join(HERE, 'picks.json')
ALTS = os.path.join(HERE, 'alternates.json')
API = 'https://commons.wikimedia.org/w/api.php?'


def candidates(query, limit=20):
    """One request: search Commons and fetch every result's licence templates, then keep the safe, usable ones."""
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': 6, 'gsrlimit': limit,
              'gsrsearch': f'{query} filetype:bitmap', 'prop': 'imageinfo|templates',
              'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1280, 'tlnamespace': 10, 'tllimit': 'max'}
    pages, cont = {}, {}
    while True:
        d = get(API + urllib.parse.urlencode({**params, **cont}))
        for p in d.get('query', {}).get('pages', {}).values():
            prev = pages.get(p['title'])
            if prev:
                prev['templates'] = prev.get('templates', []) + p.get('templates', [])
                prev.setdefault('imageinfo', p.get('imageinfo'))
            else:
                pages[p['title']] = p
        if 'continue' not in d:
            break
        cont = d['continue']
        time.sleep(1)
    good = []
    for p in pages.values():
        ii = (p.get('imageinfo') or [None])[0]
        if not ii:
            continue
        w, h = ii.get('width', 0), ii.get('height', 0)
        if max(w, h) < 1280 or not h or not (0.5 <= w / h <= 2.2):
            continue
        if check(p)[0]:
            good.append((p.get('index', 999), p['title']))
    return [t for _, t in sorted(good)]


def main():
    picks = json.load(open(PICKS))
    alts = json.load(open(ALTS)) if os.path.exists(ALTS) else {}
    todo = [s for s in S if s[0] not in picks]
    print(f'{len(todo)} subjects to pick', flush=True)
    missing = []
    for sid, answer, _aliases, _kind, query, _blurb in todo:
        try:
            good = candidates(query)
            if not good and query != answer:
                time.sleep(2)
                good = candidates(answer)
        except Exception as e:  # keep going; report at the end
            print(f'  ! {sid}: {e}', flush=True)
            good = []
        if good:
            picks[sid] = good[0]
            alts[sid] = good[1:5]
            print(f'  ✓ {sid}: {good[0]}  (+{len(good) - 1})', flush=True)
        else:
            missing.append(sid)
            print(f'  ✗ {sid}: nothing safe for "{query}"', flush=True)
        json.dump(dict(sorted(picks.items())), open(PICKS, 'w'), indent=2, ensure_ascii=False)
        json.dump(dict(sorted(alts.items())), open(ALTS, 'w'), indent=2, ensure_ascii=False)
        time.sleep(2)
    print(f'done: {len(todo) - len(missing)} picked, {len(missing)} without a safe file: {", ".join(missing)}')


if __name__ == '__main__':
    main()
