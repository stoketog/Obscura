#!/usr/bin/env python3
"""
Write the names, accepted spellings and stories of the subjects in subjects.py to src/data/images-more.json, which
src/data/images.ts adds to its hand-written list. Only subjects whose photograph passed the licence check and was
downloaded (they have a credit) are ever shown, so it is safe to export every subject.

    python3 scripts/images/export_editorial.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from subjects import S  # noqa: E402

OUT = os.path.join(HERE, '..', '..', 'src', 'data', 'images-more.json')
REJECTED = os.path.join(HERE, 'rejected.json')

# Subjects whose downloaded photograph was looked at and turned down (wrong subject, unrecognisable, poor).
rejected = set(json.load(open(REJECTED))) if os.path.exists(REJECTED) else set()
rows = [{'id': i, 'answer': a, 'aliases': al, 'kind': k, 'blurb': b} for i, a, al, k, _q, b in S if i not in rejected]
json.dump(rows, open(OUT, 'w'), indent=1, ensure_ascii=False)
print(f'{len(rows)} subjects exported ({len(rejected)} rejected)')
