#!/usr/bin/env python3
"""
Prompts over complete lists taken from Wikipedia, so every valid answer is accepted.

    python3 scripts/answers/wikilists.py           # download the pages (politely) and rebuild
    python3 scripts/answers/wikilists.py --cached  # rebuild from the pages already downloaded

Writes src/data/prompts/wikilists.ts. Each list is put in a rough order of fame (the most-known first) from
something in the table itself (Oscars won and nominations, titles won, passenger numbers, how recent), with a
few hand-picked famous answers pinned to the top; that order then becomes rarity, eight Everyday answers and
one or two Obscure, like the puzzle prompts. Sources are credited in README.md.
"""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, warnings
from io import StringIO
import pandas as pd

warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.path.join(HERE, '.wiki')
UA = 'ObscuraGame/1.0 (daily quiz; https://github.com/stoketog/obscura)'
OUT = os.path.join(ROOT, 'src', 'data', 'prompts', 'wikilists.ts')


def page(title):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, title.replace('/', '_') + '.html')
    if '--cached' not in sys.argv or not os.path.exists(path):
        req = urllib.request.Request('https://en.wikipedia.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')), headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            open(path, 'wb').write(r.read())
        time.sleep(2)
    text = open(path, encoding='utf-8').read()
    # Some pages have rowspan values like "5," which pandas can't read.
    return re.sub(r'(rowspan|colspan)="(\d+)[^"]*"', r'\1="\2"', text)


def tables(title):
    return pd.read_html(StringIO(page(title)))


def clean(s):
    s = re.sub(r'\[[^\]]*\]', '', str(s))
    s = re.sub(r'\s*\((?:[^()]*film|[^()]*\d{4}[^()]*|[^()]*band|[^()]*singer|[^()]*duo|[^()]*group|[^()]*novel)\)', '', s, flags=re.I)
    s = s.replace('†', '').replace('‡', '').replace('*', '').replace('§', '').replace('^', '').replace('¤', '')
    s = re.sub(r'\s+', ' ', s).strip(' "“”\'')
    return s


def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


def surname(name):
    parts = [p for p in re.split(r'\s+', name) if p.lower() not in ('jr.', 'jr', 'sr.', 'ii', 'iii')]
    return parts[-1] if len(parts) >= 2 else None


def rescore(ordered):
    """Fame order (most-known first) -> 'Name|score|aliases' strings, same scale as the puzzle prompts."""
    n = len(ordered)
    top = 2 if n >= 60 else 1
    everyday = min(8, max(3, round(n * 0.15)))
    middle = n - everyday - top
    out = []
    for i, (name, aliases) in enumerate(ordered):
        if i < everyday:
            score = 2 + round((i / max(1, everyday - 1)) * 14)
        elif i >= n - top:
            score = 95 + (i - (n - top))
        else:
            r = (i - everyday) / max(1, middle - 1)
            score = 18 + round((r / 0.3) * 19) if r < 0.3 else 38 + round(((r - 0.3) / 0.35) * 23) if r < 0.65 else 62 + round(((r - 0.65) / 0.35) * 29)
        al = [a for a in dict.fromkeys(aliases) if a and plain(a) != plain(name)]
        out.append(f'{name}|{score}' + (f'|{";".join(al)}' if al else ''))
    return out


def ordered(names, pinned=(), key=None):
    """Unique names, pinned ones first (in the given order), then by `key` (lower first)."""
    seen, rest = {}, []
    for nm, al in names:
        k = plain(nm)
        if k in seen:
            seen[k][1].extend(al)
            continue
        seen[k] = [nm, list(al)]
        rest.append(k)
    pin = [plain(p) for p in pinned if plain(p) in seen]
    missing = [p for p in pinned if plain(p) not in seen]
    if missing:
        print('    pinned but not found:', missing)
    order = pin + sorted([k for k in rest if k not in pin], key=(lambda k: key(seen[k][0])) if key else (lambda k: rest.index(k)))
    return [(seen[k][0], seen[k][1]) for k in order]


def people_aliases(names):
    """Accept a surname on its own when no one else on the list shares it."""
    counts = {}
    for nm, _ in names:
        s = surname(nm)
        if s:
            counts[plain(s)] = counts.get(plain(s), 0) + 1
    out = []
    for nm, al in names:
        s = surname(nm)
        extra = [s] if s and counts.get(plain(s)) == 1 and len(s) > 3 else []
        out.append((nm, list(al) + extra))
    return out


PROMPTS = []


def variants(name):
    """Other ways to write a name: without a bracketed part, the bracketed acronym, either side of a comma."""
    out = []
    m = re.match(r'^(.*?)\s*\(([^()]+)\)\s*(.*)$', name)
    if m:
        out.append(re.sub(r'\s+', ' ', f'{m.group(1)} {m.group(3)}').strip())
        out.append(re.sub(r'\s+', ' ', f'{m.group(1)} {m.group(2)} {m.group(3)}').strip())
        if re.match(r'^[A-Z]{2,8}$', m.group(2)):
            out.append(m.group(2))
    if ', ' in name and name.count(', ') == 1 and re.search(r'\d+(st|nd|rd|th) ', name):
        a, b = name.split(', ')
        out += [a, re.sub(r'^\d+(st|nd|rd|th)\s+', '', b)]
    return out


def key(s):
    """Roughly how answer matching sees a spelling (case, accents, spacing, punctuation, a plural s)."""
    k = re.sub(r'[^a-z0-9]', '', re.sub(r'^the\s+', '', plain(s)))
    return k[:-1] if k.endswith('s') and len(k) > 3 else k


def dedupe(entries):
    """Every spelling belongs to exactly one answer: the first (most famous) one to claim it."""
    names = {}
    out = []
    for n, a in entries:
        k = key(n)
        if k in names:
            continue
        names[k] = n
        out.append((n, a))
    claimed = set(names)
    result = []
    for n, a in out:
        keep = []
        for al in a:
            k = key(al)
            if not k or k in claimed:
                continue
            claimed.add(k)
            keep.append(al)
        result.append((n, keep))
    return result


def add(pid, group, text, category, entries):
    entries = dedupe([(n, list(a) + variants(n)) for n, a in entries if n and n.lower() != 'nan'])
    print(f'  {pid}: {len(entries)} answers · first: {", ".join(n for n, _ in entries[:10])}')
    PROMPTS.append({'id': pid, 'group': group, 'text': text, 'category': category, 'answers': rescore(entries)})


def oscar_films():
    t = tables('List of Academy Award–winning films')[0]
    rows = []
    for _, r in t.iterrows():
        film = clean(r['Film'])
        aw = int(re.match(r'\d+', str(r['Awards'])).group()) if re.match(r'\d+', str(r['Awards'])) else 0
        nom = int(re.match(r'\d+', str(r['Nominations'])).group()) if re.match(r'\d+', str(r['Nominations'])) else 0
        year = int(re.match(r'\d{4}', str(r['Year'])).group()) if re.match(r'\d{4}', str(r['Year'])) else 1950
        if film:
            al = [film[4:]] if film.lower().startswith('the ') else []
            if ': ' in film:
                al.append(film.split(': ', 1)[1])
            rows.append((film, al, aw, nom, year))
    fame = {plain(f): (-(aw * 3 + nom) - max(0, year - 1990) * 0.15) for f, _, aw, nom, year in rows}
    pinned = ['Titanic', 'The Lord of the Rings: The Return of the King', 'Ben-Hur', 'The Godfather', 'Forrest Gump', 'Gladiator', 'Frozen', 'The Lion King']
    add('oscar-winning-film', 'screen', 'Name a film that has won an Oscar', 'Oscar-winning films',
        ordered([(f, a) for f, a, *_ in rows], pinned, key=lambda n: fame[plain(n)]))


def ballon_dor():
    t = tables("Ballon d'Or")[3]
    rows = []
    for _, r in t.iterrows():
        nm = clean(r['Player'])
        wins = int(re.match(r'\d+', str(r['Winner'])).group()) if re.match(r'\d+', str(r['Winner'])) else 0
        if nm and wins > 0:
            rows.append((nm, wins))
    pinned = ['Lionel Messi', 'Cristiano Ronaldo', 'Johan Cruyff', 'Michel Platini', 'Marco van Basten', 'Zinedine Zidane', 'Ronaldo', 'Kaká']
    add('ballon-dor-winner', 'sport', "Name a winner of the men's Ballon d'Or", "Ballon d'Or winners",
        ordered(people_aliases([(n, []) for n, _ in rows]), pinned, key=lambda n: -dict(rows).get(n, 0)))


def f1_champions():
    t = tables("List of Formula One World Drivers' Champions")[3]
    rows = [(clean(r['Driver']), int(re.match(r'\d+', str(r['Titles'])).group()) if re.match(r'\d+', str(r['Titles'])) else 1) for _, r in t.iterrows()]
    rows = [(n, k) for n, k in rows if n and n.lower() not in ('driver', 'total')]
    pinned = ['Lewis Hamilton', 'Michael Schumacher', 'Ayrton Senna', 'Max Verstappen', 'Sebastian Vettel', 'Fernando Alonso', 'Niki Lauda', 'Alain Prost']
    add('f1-world-champion', 'sport', 'Name a Formula 1 World Champion', 'F1 world champions',
        ordered(people_aliases([(n, []) for n, _ in rows]), pinned, key=lambda n: -dict(rows).get(n, 0)))


def tube_stations():
    t = tables('List of London Underground stations')[0]
    use_col = [c for c in t.columns if 'sage' in str(c)]
    rows = []
    for _, r in t.iterrows():
        nm = clean(r['Station'])
        try:
            use = float(re.sub(r'[^\d.]', '', str(r[use_col[0]])) or 0) if use_col else 0
        except ValueError:
            use = 0
        al = []
        if ' & ' in nm:
            al.append(nm.replace(' & ', ' and '))
        if "'" in nm:
            al.append(nm.replace("'", ''))
        if 'St. ' in nm or 'St ' in nm:
            al.append(nm.replace('St. ', "St ").replace('St ', 'Saint '))
        rows.append((nm, al, use))
    use = {plain(n): u for n, _, u in rows}
    pinned = ["King's Cross St Pancras", 'Oxford Circus', 'Victoria', 'Waterloo', 'Baker Street', 'Paddington', 'Piccadilly Circus', 'Liverpool Street']
    add('tube-station', 'geography', 'Name a London Underground station', 'Tube stations',
        ordered([(n, a) for n, a, _ in rows], pinned, key=lambda n: -use.get(plain(n), 0)))


def eurovision():
    t = tables('List of Eurovision Song Contest winners')[0]
    rows = []
    for _, r in t.iterrows():
        artist = clean(r['Artist'])
        year = int(re.match(r'\d{4}', str(r['Year'])).group()) if re.match(r'\d{4}', str(r['Year'])) else 1960
        song = clean(r['Song'])
        if artist:
            rows.append((artist, [song] if song else [], year))
    pinned = ['ABBA', 'Céline Dion', 'Måneskin', 'Loreen', 'Bucks Fizz', 'Lordi', 'Conchita Wurst', 'Katrina and the Waves']
    yr = {plain(a): y for a, _, y in rows}
    add('eurovision-winner', 'music', 'Name a Eurovision winner (the act or the song)', 'Eurovision winners',
        ordered([(a, s) for a, s, _ in rows], pinned, key=lambda n: -yr.get(plain(n), 0)))


def best_new_artist():
    ts = tables('Grammy Award for Best New Artist')
    rows = []
    for x in ts:
        cols = [c for c in x.columns if 'Artist' in str(c)]
        if not cols or x.shape[0] < 8:
            continue
        for _, r in x.iterrows():
            nm = clean(r[cols[0]])
            year = re.match(r'\d{4}', str(r[x.columns[0]]))
            if nm and not re.match(r'^\d', nm) and len(nm) < 60:
                rows.append((nm, int(year.group()) if year else 1980))
    pinned = ['The Beatles', 'Adele', 'Billie Eilish', 'Dua Lipa', 'Amy Winehouse', 'Mariah Carey', 'Olivia Rodrigo', 'Taylor Swift',
              'Ed Sheeran', 'Justin Bieber', 'Sam Smith', 'Alicia Keys', 'Norah Jones', 'Christina Aguilera', 'Sabrina Carpenter', 'Chappell Roan']
    yr = {}
    for n, y in rows:
        yr[plain(n)] = max(yr.get(plain(n), 0), y)
    al = [(n, [n[4:]] if n.lower().startswith('the ') else []) for n, _ in rows]
    add('grammy-best-new-artist', 'music', 'Name a Grammy nominee for Best New Artist', 'Grammy Best New Artist nominees',
        ordered(al, pinned, key=lambda n: -yr.get(plain(n), 0)))


def booker():
    t = tables('Booker Prize')[1]
    rows = []
    for _, r in t.iterrows():
        title = clean(r['Title'])
        author = clean(r['Author'])
        year = int(re.match(r'\d{4}', str(r['Year'])).group()) if re.match(r'\d{4}', str(r['Year'])) else 1970
        if title and title.lower() != 'nan' and not re.search(r'announc|shortlist|to be', title, re.I):
            rows.append((title, [author] + ([title[4:]] if title.lower().startswith('the ') else []), year))
    pinned = ['Wolf Hall', 'Life of Pi', "Midnight's Children", 'The Remains of the Day', 'The God of Small Things', 'Schindler\'s Ark', 'The Blind Assassin', 'Bring Up the Bodies']
    yr = {plain(t): y for t, _, y in rows}
    add('booker-winner', 'arts', 'Name a Booker Prize-winning novel (or its author)', 'Booker Prize winners',
        ordered([(t, a) for t, a, _ in rows], pinned, key=lambda n: -yr.get(plain(n), 0)))


def nobel_peace():
    t = tables('List of Nobel Peace Prize laureates')[0]
    rows = []
    for _, r in t.iterrows():
        year = re.match(r'\d{4}', str(r['Year']))
        for col in ('Recipient(s)', 'Recipient(s).1'):
            nm = clean(r.get(col, ''))
            if nm and nm.lower() != 'nan' and not re.match(r'^(not awarded|none|\d)', nm, re.I) and len(nm) < 90:
                rows.append((nm, int(year.group()) if year else 1950))
    pinned = ['Martin Luther King Jr.', 'Nelson Mandela', 'Malala Yousafzai', 'Barack Obama', 'Mother Teresa', 'Desmond Tutu', 'Al Gore', 'Jimmy Carter',
              'Kofi Annan', 'Mikhail Gorbachev', 'Aung San Suu Kyi', 'Henry Kissinger', 'Woodrow Wilson', 'Theodore Roosevelt', 'Lech Wałęsa', 'European Union']
    yr = {}
    for n, y in rows:
        yr[plain(n)] = max(yr.get(plain(n), 0), y)
    add('nobel-peace-laureate', 'history', 'Name a Nobel Peace Prize winner (person or organisation)', 'Nobel Peace Prize laureates',
        ordered(people_aliases([(n, []) for n, _ in rows]), pinned, key=lambda n: -yr.get(plain(n), 0)))


for fn in (oscar_films, ballon_dor, f1_champions, tube_stations, eurovision, best_new_artist, booker, nobel_peace):
    try:
        fn()
    except Exception as e:  # one broken page must not stop the rest
        print(f'  ! {fn.__name__}: {e}')

body = "import type { PromptSeed } from '@/lib/types';\n\n/** GENERATED by scripts/answers/wikilists.py from Wikipedia lists. Do not edit by hand. */\nexport const WIKILISTS: PromptSeed[] = " + json.dumps(PROMPTS, ensure_ascii=False, indent=1) + ';\n'
open(OUT, 'w', encoding='utf-8').write(body)
print(f'{len(PROMPTS)} prompts written')
