#!/usr/bin/env python3
"""Remove named entries from a list file:  python3 scripts/answers/prune.py <prompt-id>.hand.txt "Name" "Name" ..."""
import os, sys
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lists', sys.argv[1])
drop = {d.strip().lower() for d in sys.argv[2:]}
lines = open(path, encoding='utf-8').read().split('\n')
keep = [l for l in lines if l.split('|')[0].strip().lower() not in drop]
open(path, 'w', encoding='utf-8').write('\n'.join(keep))
print(f'{sys.argv[1]}: dropped {len(lines) - len(keep)}, {sum(1 for l in keep if l.strip() and not l.startswith("#"))} left')
