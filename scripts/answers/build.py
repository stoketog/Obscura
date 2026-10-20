#!/usr/bin/env python3
"""
Build src/data/prompts/extra/generated.ts from the plain answer lists in scripts/answers/lists.

    npx tsx --tsconfig tsconfig.json scripts/answers/dump-core.ts   # what each prompt already accepts
    python3 scripts/answers/build.py                                 # score the lists and write generated.ts

LISTS
  lists/<prompt-id>.<anything>.txt, one answer per line:  Name   or   Name|alias;alias
  Blank lines and lines starting with # are ignored. A prompt may have several list files.

SCORING
  Nothing in a list says how rare it is. Each prompt's new answers are ranked by how often the name turns up in
  everyday English (wordfreq's Zipf scale, the best of the name and its aliases), then spread over the tiers by rank:
  the best-known 30% are Uncommon, the next 35% Rare, the rest Mythic. Answers a prompt already has are skipped, so
  the ranking is only among the new ones. Everyday (at most 8 a prompt) and Obscure (1–2 a prompt) stay hand-picked.
"""
import json, os, re, sys, unicodedata
from wordfreq import zipf_frequency

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
LISTS = os.path.join(HERE, 'lists')
CORE = os.path.join(HERE, '.core.json')
OUT = os.path.join(ROOT, 'src', 'data', 'prompts', 'extra', 'generated.ts')


def normalize(s):
    """Same idea as src/lib/text.ts normalize: lower case, no accents or punctuation, no leading article."""
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace('&', ' and ')
    s = re.sub(r"[^a-z0-9 ]+", ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'^(the|a|an) ', '', s)
    return s


def keys(s):
    t = normalize(s).replace(' ', '')
    if not t:
        return set()
    out = {t}
    if t.endswith('ies') and len(t) > 4: out.add(t[:-3] + 'y')
    if t.endswith('es') and len(t) > 4: out.add(t[:-2])
    if t.endswith('s') and len(t) > 3: out.add(t[:-1])
    return out


def variants_of(name):
    """Extra ways to type a listed name: 'Gasteiz / Vitoria' → both halves; 'Belgian Shepherd Dog (Malinois)' →
    'Malinois' and the name without brackets; 'Michael E. Brown' → 'Michael Brown'."""
    out = []
    if ' / ' in name:
        out += [p.strip() for p in name.split(' / ') if p.strip()]
    m = re.match(r'^(.*?)\s*\(([^)]+)\)\s*(.*)$', name)
    if m:
        outer = (m.group(1) + ' ' + m.group(3)).strip()
        if outer: out.append(outer)
        if len(m.group(2)) > 3 and not re.search(r'\d', m.group(2)): out.append(m.group(2).strip())
    no_initials = re.sub(r'\s+[A-Z]\.(?=\s)', '', name)
    if no_initials != name: out.append(no_initials)
    return [o for o in out if o and o != name]


CHARACTER_PROMPTS = {'star-wars-character', 'simpsons-character', 'harry-potter-character', 'superhero', 'cartoon-character'}
TITLE = re.compile(r'^(grand admiral|vice admiral|grand moff|supreme leader|allegiant general|general|admiral|captain|commander|'
                   r'moff|count|master|doctor|dr\.?|professor|prof\.?|mr\.?|mrs\.?|ms\.?|miss|madam|madame|lord|lady|sir|'
                   r'uncle|aunt|agent|emperor|king|queen|prince|princess|chief|principal|reverend|father|sister|brother|nurse|'
                   r'officer|detective|sergeant|lieutenant|major|colonel|grandpa|grandma|baby|little|old|the)\s+', re.I)


def character_forms(name):
    """'Grand Admiral Rae Sloane' → 'Rae Sloane'; 'Professor Sprout' → 'Sprout'."""
    out, cur = [], name
    while True:
        nxt = TITLE.sub('', cur, count=1)
        if nxt == cur or not nxt.strip():
            break
        cur = nxt.strip()
        out.append(cur)
    return out


def zipf(s):
    return zipf_frequency(re.sub(r'[^\w\s\'-]', ' ', s), 'en')


# Geographic prompts whose answers are often typed with or without the feature word ("Tay", "River Tay").
FEATURE = {
    'river': (r'^(river|rio|río) |\s+(river|rio)$', ['River {}', '{} River']),
    'lake': (r'^(lake|loch|lough|lac|lago) |\s+(lake|loch)$', ['Lake {}', '{} Lake']),
    'mountain': (r'^(mount|mt|mont|monte) |\s+(mountain|volcano)$', ['Mount {}', 'Mt {}']),
}
COMMON_WORD = 3.2


def base_of(pid, name):
    if pid not in FEATURE:
        return name
    return re.sub(FEATURE[pid][0], '', name.strip(), flags=re.I).strip() or name


def feature_forms(pid, name, al):
    """For river, lake and mountain prompts: accept the base name and the usual 'River X' / 'X River' forms. The base
    name on its own is only accepted when it is not an everyday English word ('Green River' needs the 'River')."""
    if pid not in FEATURE:
        return name, al
    base = base_of(pid, name)
    forms = [t.format(base) for t in FEATURE[pid][1]] + al
    if base.lower() != name.lower() and zipf(base) >= COMMON_WORD and ' ' not in base:
        return name, [f for f in forms if f.lower() != name.lower()]
    return base, [f for f in forms + [name] if f.lower() != base.lower()]


def score_for(rank, n):
    p = rank / max(1, n - 1)
    if p < 0.30: return round(22 + (p / 0.30) * 14)
    if p < 0.65: return round(40 + ((p - 0.30) / 0.35) * 20)
    return round(64 + ((p - 0.65) / 0.35) * 24)


def main():
    if not os.path.exists(CORE):
        sys.exit('Run scripts/answers/dump-core.ts first.')
    core = json.load(open(CORE))
    files = sorted(f for f in os.listdir(LISTS) if f.endswith('.txt'))
    by_prompt = {}
    for f in files:
        pid = f.split('.')[0]
        if pid not in core:
            sys.exit(f'{f}: no prompt with id "{pid}"')
        for line in open(os.path.join(LISTS, f), encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            name, _, aliases = line.partition('|')
            name = name.strip()
            al = [a.strip() for a in aliases.split(';') if a.strip()] if aliases else []
            al += variants_of(name)
            if pid in CHARACTER_PROMPTS:
                al += character_forms(name)
            if name:
                by_prompt.setdefault(pid, []).append((name, al))
    out = {}
    report = []
    for pid, items in sorted(by_prompt.items()):
        taken = set()
        for s in core[pid]['spellings']:
            taken |= keys(s) | keys(base_of(pid, s))
        fresh = []
        for name, al in items:
            if keys(base_of(pid, name)) & taken:
                continue
            # An alternative name that already belongs to an answer means this is that answer again ("Attack on
            # Pearl Harbor|pearl harbor" when "Pearl Harbor" is accepted), so the whole entry is skipped.
            if any(keys(a) & taken for a in al):
                continue
            name, al = feature_forms(pid, name, al)
            k = keys(name)
            if not k or k & taken:
                continue
            # 'Kraken (Norse)' when Kraken is already accepted: the bracket only names a variant, so skip it.
            outer = re.sub(r'\s*\([^)]*\)\s*', ' ', name).strip()
            if outer != name and keys(outer) & taken:
                continue
            taken |= k
            al = [a for a in dict.fromkeys(al) if len(normalize(a).replace(' ', '')) >= 2 and keys(a) and not (keys(a) & taken) and not (keys(a) & k)]
            for a in al: taken |= keys(a)
            fresh.append((name, al, max([zipf(name)] + [zipf(a) for a in al])))
        fresh.sort(key=lambda x: (-x[2], x[0].lower()))
        lines = []
        for i, (name, al, z) in enumerate(fresh):
            sc = score_for(i, len(fresh))
            clean = lambda s: s.replace('|', ' ').replace(';', ',')
            lines.append(f"{clean(name)}|{sc}" + (f"|{';'.join(clean(a) for a in al)}" if al else ''))
        out[pid] = lines
        report.append(f'{pid}: +{len(lines)} (of {len(items)} listed)')
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write("import type { ExtraAnswers } from './merge';\n\n")
        fh.write('/** GENERATED by scripts/answers/build.py from scripts/answers/lists. Do not edit by hand. */\n')
        fh.write('export const GENERATED_EXTRA: ExtraAnswers = {\n')
        for pid, lines in out.items():
            fh.write(f'  {json.dumps(pid)}: [\n')
            for i in range(0, len(lines), 8):
                fh.write('    ' + ', '.join(json.dumps(x, ensure_ascii=False) for x in lines[i:i + 8]) + ',\n')
            fh.write('  ],\n')
        fh.write('};\n')
    print('\n'.join(report))


if __name__ == '__main__':
    main()
