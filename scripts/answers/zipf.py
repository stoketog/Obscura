#!/usr/bin/env python3
"""Word frequency (Zipf scale, wordfreq) for the names csvpool.ts asks about; cached in scripts/answers/.zipf.json."""
import json, os
from wordfreq import zipf_frequency
HERE = os.path.dirname(os.path.abspath(__file__))
cache_path = os.path.join(HERE, '.zipf.json')
cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
for name in json.load(open(os.path.join(HERE, '.zipf-wanted.json'))):
    cache[name] = round(zipf_frequency(name, 'en'), 2)
json.dump(cache, open(cache_path, 'w'))
print(len(cache), 'names cached')
