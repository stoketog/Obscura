import type { PromptGroup, PromptSeed } from '@/lib/types';

/**
 * Hand-written prompts, each list in a rough order of fame (the answers most people think of first at the top).
 * Rarity comes from that order, the same way as the puzzle prompts: the first eight are Everyday, the last one or
 * two Obscure, and the rest spread across Uncommon, Rare and Mythic.
 *
 * One answer per line: `Name|alias;alias`. Closed lists (counties, Bond films, Queen songs...) are complete;
 * open ones (vegetables, game shows...) are deliberately generous, so a fair answer is never marked wrong.
 */
export function ranked(id: string, group: PromptGroup, text: string, category: string, lines: string): PromptSeed {
  const rows = lines
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  const n = rows.length;
  const top = n >= 60 ? 2 : 1;
  const everyday = Math.min(8, Math.max(3, Math.round(n * 0.15)));
  const middle = n - everyday - top;
  const answers = rows.map((row, i) => {
    const [name, aliases] = row.split('|');
    let score: number;
    if (i < everyday) score = 2 + Math.round((i / Math.max(1, everyday - 1)) * 14);
    else if (i >= n - top) score = 95 + (i - (n - top));
    else {
      const r = (i - everyday) / Math.max(1, middle - 1);
      score = r < 0.3 ? 18 + Math.round((r / 0.3) * 19) : r < 0.65 ? 38 + Math.round(((r - 0.3) / 0.35) * 23) : 62 + Math.round(((r - 0.65) / 0.35) * 29);
    }
    return `${name.trim()}|${score}` + (aliases ? `|${aliases.trim()}` : '');
  });
  return { id, group, text, category, answers };
}

export const ATLAS: PromptSeed[] = [
  // ── Geography ──────────────────────────────────────────────────────────────
  ranked('english-county', 'geography', 'Name an English county (today’s or historic)', 'English counties', `
    Yorkshire
    Kent
    Cornwall
    Devon
    Essex
    Surrey
    Lancashire
    Norfolk
    Sussex
    Suffolk
    Cumbria
    Somerset
    Dorset
    Hampshire
    Oxfordshire
    Cambridgeshire
    Derbyshire
    Lincolnshire
    Northumberland
    Cheshire
    Staffordshire
    Nottinghamshire
    Gloucestershire
    Hertfordshire
    Greater London|London
    Greater Manchester|Manchester
    West Yorkshire
    North Yorkshire
    South Yorkshire
    East Riding of Yorkshire|East Yorkshire
    Merseyside
    West Midlands
    Durham|County Durham
    Wiltshire
    Berkshire
    Buckinghamshire|Bucks
    Bedfordshire
    Leicestershire
    Warwickshire
    Worcestershire
    Shropshire|Salop
    Herefordshire
    Northamptonshire
    East Sussex
    West Sussex
    Isle of Wight
    Tyne and Wear
    Bristol|City of Bristol
    Middlesex
    Cumberland
    Westmorland
    Huntingdonshire
    Rutland
    City of London
    Avon
    Cleveland
    Humberside
    Hereford and Worcester
  `),
  // ── History ────────────────────────────────────────────────────────────────
  ranked('former-country', 'history', 'Name a country that no longer exists (or was renamed)', 'Former countries', `
    Soviet Union|USSR;Union of Soviet Socialist Republics
    Yugoslavia
    Czechoslovakia
    East Germany|GDR;German Democratic Republic
    West Germany|Federal Republic of Germany
    Prussia|Kingdom of Prussia
    Ottoman Empire|Ottomans
    Persia
    Austria-Hungary|Austro-Hungarian Empire
    Rhodesia|Southern Rhodesia
    Siam
    Ceylon
    Burma
    Zaire
    Holy Roman Empire
    Byzantine Empire|Eastern Roman Empire;Byzantium
    Roman Empire|Rome;Roman Republic
    Ancient Egypt
    Babylon|Babylonia
    Sparta
    Carthage
    Gaul
    Mesopotamia
    Assyria|Assyrian Empire
    Phoenicia
    Kingdom of Hawaii|Hawaii
    Republic of Texas|Texas
    Confederate States of America|Confederacy;Confederate States
    Gold Coast
    Abyssinia
    Tanganyika
    Zanzibar
    Bohemia
    Kingdom of Sardinia|Sardinia
    Kingdom of the Two Sicilies|Two Sicilies
    Papal States
    Republic of Venice|Venice;Venetian Republic
    Serbia and Montenegro
    United Arab Republic
    Dahomey
    Upper Volta
    Kampuchea
    South Vietnam
    North Yemen
    South Yemen
    Biafra
    Newfoundland|Dominion of Newfoundland
    Kingdom of Scotland
    Kingdom of England
    Wessex
    Mercia
    Northumbria
    Bavaria|Kingdom of Bavaria
    Saxony|Kingdom of Saxony
    Gran Colombia
    Mughal Empire|Mughals
    Aztec Empire|Aztecs
    Inca Empire|Incas
    Mongol Empire|Mongols
    Tibet
    Manchukuo
    Khmer Empire
    Swaziland
    East Pakistan
    Upper Canada
    Kingdom of Aragon|Aragon
    Castile|Kingdom of Castile
    Navarre|Kingdom of Navarre
    Burgundy|Duchy of Burgundy
    Lombardy
    Wallachia
    Moldavia
    Courland
    Livonia
    Polish-Lithuanian Commonwealth
    Kievan Rus
    Danzig|Free City of Danzig
    Austrian Netherlands
    Dutch Republic|United Provinces
    Hejaz
    Transjordan
    Mandatory Palestine
    British Raj
    French Indochina|Indochina
    Belgian Congo
    Rhodesia and Nyasaland
    Nyasaland
    Northern Rhodesia
    Basutoland
    Bechuanaland
    British Honduras
    Dutch East Indies
  `),
  ranked('pharaoh', 'history', 'Name an ancient Egyptian pharaoh', 'Pharaohs', `
    Tutankhamun|Tutankhamen;King Tut;Tut
    Ramesses II|Ramses II;Rameses II;Ramesses the Great;Ramses;Ramesses;Rameses
    Cleopatra|Cleopatra VII
    Khufu|Cheops
    Akhenaten|Akhenaton;Amenhotep IV
    Hatshepsut
    Nefertiti|Neferneferuaten
    Thutmose III|Tuthmosis III;Thutmose;Tuthmosis
    Khafre|Chephren
    Menkaure|Mycerinus
    Djoser|Zoser
    Seti I|Sethos I;Seti
    Amenhotep III|Amenhotep
    Narmer
    Menes
    Sneferu|Snefru
    Ramesses III|Ramses III
    Ahmose I|Ahmose
    Horemheb
    Ay
    Ptolemy I|Ptolemy I Soter;Ptolemy
    Thutmose I|Tuthmosis I
    Thutmose II|Tuthmosis II
    Thutmose IV|Tuthmosis IV
    Amenhotep I
    Amenhotep II
    Merneptah
    Smenkhkare
    Mentuhotep II|Mentuhotep
    Senusret I|Sesostris I;Senusret
    Senusret III|Sesostris III
    Amenemhat I|Amenemhat
    Amenemhat III
    Pepi II|Pepi
    Pepi I
    Unas
    Teti
    Userkaf
    Sahure
    Hor-Aha|Aha
    Den
    Djet
    Khasekhemwy
    Huni
    Djedefre
    Shepseskaf
    Ramesses XI|Ramses XI
    Ramesses VI|Ramses VI
    Seti II
    Siptah
    Twosret|Tausret
    Psusennes I|Psusennes
    Shoshenq I|Shishak;Sheshonq I
    Piye|Piankhi
    Taharqa
    Shabaka
    Psamtik I|Psammetichus I;Psamtik
    Necho II|Necho
    Apries
    Amasis II|Ahmose II;Amasis
    Nectanebo II|Nectanebo
    Nectanebo I
    Ptolemy II|Ptolemy II Philadelphus
    Ptolemy XIII
    Caesarion|Ptolemy XV
    Sobekneferu
    Apepi|Apophis
    Kamose
    Seqenenre Tao|Seqenenre
  `),
  ranked('famous-ship', 'history', 'Name a famous real ship (any era)', 'Famous ships', `
    Titanic|RMS Titanic
    Mayflower
    Mary Rose
    HMS Victory|Victory
    Cutty Sark
    Santa María|Santa Maria
    Lusitania|RMS Lusitania
    Bismarck
    Queen Mary|RMS Queen Mary
    Endeavour|HMS Endeavour
    Golden Hinde|Golden Hind
    HMS Beagle|Beagle
    Bounty|HMS Bounty
    Endurance
    Queen Elizabeth 2|QE2
    Mary Celeste
    Pinta
    Niña|Nina
    Royal Yacht Britannia|Britannia
    SS Great Britain|Great Britain
    Great Eastern|SS Great Eastern
    HMS Belfast|Belfast
    Yamato
    USS Arizona|Arizona
    USS Missouri|Missouri
    USS Enterprise|Enterprise
    USS Constitution|Old Ironsides
    Vasa
    Exxon Valdez
    Costa Concordia
    Rainbow Warrior
    Kon-Tiki
    Carpathia|RMS Carpathia
    Britannic|HMHS Britannic
    Olympic|RMS Olympic
    Queen Mary 2|QM2
    Andrea Doria
    Edmund Fitzgerald|SS Edmund Fitzgerald
    Bluenose
    Fram
    Terra Nova
    Discovery|RRS Discovery
    Erebus|HMS Erebus
    Terror|HMS Terror
    Hood|HMS Hood
    Ark Royal|HMS Ark Royal
    Dreadnought|HMS Dreadnought
    Warrior|HMS Warrior
    Belgrano|General Belgrano;ARA General Belgrano
    Sheffield|HMS Sheffield
    Graf Spee|Admiral Graf Spee
    Tirpitz
    Prince of Wales|HMS Prince of Wales
    Repulse|HMS Repulse
    Potemkin|Battleship Potemkin
    Aurora|Cruiser Aurora
    Wilhelm Gustloff
    Empire Windrush|Windrush
    Morro Castle
    Herald of Free Enterprise
    Estonia|MS Estonia
    Sewol|MV Sewol
    Flying Cloud
    Thermopylae
    Clermont
    Savannah|SS Savannah
    Monitor|USS Monitor
    Merrimack|CSS Virginia
    Hunley|H. L. Hunley
    Nautilus|USS Nautilus
    Kursk
    Batavia
    Queen Anne's Revenge
    Whydah|Whydah Gally
  `),
  ranked('medieval-weapon', 'history', 'Name a medieval weapon or piece of armour', 'Medieval arms and armour', `
    Sword|Broadsword
    Longbow|Bow
    Crossbow
    Lance
    Mace
    Shield
    Axe|Battle axe;Battleaxe
    Helmet|Helm
    Spear
    Dagger
    Chainmail|Chain mail;Mail
    Flail
    Halberd
    Pike
    Trebuchet
    Catapult
    Battering ram|Ram
    Longsword
    Morning star
    Warhammer|War hammer
    Breastplate
    Gauntlet|Gauntlets
    Visor
    Arrow
    Bow and arrow
    Javelin
    Club
    Rapier
    Sabre|Saber
    Scimitar
    Claymore
    Falchion
    Dirk
    Poleaxe|Pollaxe
    Glaive
    Bill|Billhook
    Quarterstaff|Staff
    Sling
    Ballista
    Mangonel
    Siege tower
    Greek fire
    Caltrop|Caltrops
    Plate armour|Plate armor;Suit of armour;Suit of armor;Armour;Armor
    Cuirass
    Gorget
    Pauldron
    Vambrace
    Greaves
    Sabaton|Sabatons
    Chausses
    Coif
    Hauberk
    Gambeson
    Brigandine
    Buckler
    Kite shield
    Great helm
    Bascinet
    Sallet
    Barbute
    Kettle hat
    Seax
    Misericorde
    Stiletto
    Rondel dagger|Rondel
    Bollock dagger|Ballock dagger
    Estoc
    Zweihänder|Zweihander
    Bardiche
    Guisarme
    Partisan
    Voulge
    Spetum
    Ranseur
    Lucerne hammer
    Horseman's pick
    Arbalest
    Hand cannon
    Arquebus
    Bombard
    Petard
    Onager
  `),
  // ── Science ────────────────────────────────────────────────────────────────
  ranked('weather', 'science', 'Name a type of weather', 'Weather', `
    Rain
    Snow
    Sunshine|Sun;Sunny
    Wind|Windy
    Fog
    Hail
    Thunderstorm|Storm
    Cloud|Cloudy
    Lightning
    Thunder
    Sleet
    Drizzle
    Hurricane
    Tornado
    Frost
    Mist
    Blizzard
    Heatwave|Heat wave
    Rainbow
    Typhoon
    Cyclone
    Monsoon
    Drought
    Flood
    Breeze
    Gale
    Hailstorm
    Snowstorm
    Showers|Shower
    Dew
    Ice
    Black ice
    Freezing rain
    Smog
    Haze
    Sandstorm
    Dust storm
    Squall
    Whirlwind
    Waterspout
    Overcast
    Humidity|Humid
    Downpour
    Cloudburst
    Ice storm
    Whiteout
    Hoar frost|Hoarfrost
    Rime
    Graupel
    Sun shower
    Indian summer
    Cold snap
    Flash flood
    Gust
    Dust devil
    Derecho
    Haboob
    Aurora|Northern lights
    El Niño|El Nino
    La Niña|La Nina
    Jet stream
    Microburst
    Sundog|Sun dog
    Virga
    Diamond dust
  `),
  ranked('shape', 'science', 'Name a shape (flat or 3D)', 'Shapes', `
    Circle
    Square
    Triangle
    Rectangle
    Star
    Heart
    Oval
    Diamond
    Pentagon
    Hexagon
    Octagon
    Cube
    Sphere
    Pyramid
    Cylinder
    Cone
    Rhombus
    Trapezium|Trapezoid
    Parallelogram
    Semicircle|Half circle
    Crescent
    Kite
    Ellipse
    Cuboid
    Prism
    Heptagon
    Decagon
    Nonagon|Enneagon
    Arrow
    Cross
    Quadrilateral
    Polygon
    Equilateral triangle
    Isosceles triangle
    Scalene triangle
    Right-angled triangle|Right triangle
    Tetrahedron
    Octahedron
    Dodecahedron
    Icosahedron
    Hemisphere
    Torus|Doughnut
    Dodecagon
    Hendecagon|Undecagon
    Spiral
    Annulus|Ring
    Sector
    Rhomboid
    Triangular prism
    Hexagonal prism
    Square-based pyramid
    Frustum
    Ellipsoid
    Parallelepiped
    Deltoid
    Lune
    Trefoil
    Reuleaux triangle
    Möbius strip|Mobius strip
    Klein bottle
  `),
  ranked('space-mission', 'science', 'Name a spacecraft, rocket or space mission', 'Space missions', `
    Apollo 11
    Sputnik|Sputnik 1
    International Space Station|ISS
    Hubble|Hubble Space Telescope
    Voyager 1
    Space Shuttle|Shuttle
    Apollo 13
    Challenger
    Saturn V
    Falcon 9
    Columbia
    Voyager 2
    James Webb|James Webb Space Telescope;JWST
    Vostok 1|Vostok
    Curiosity
    Perseverance
    Mir
    Starship
    Discovery
    Atlantis
    Endeavour
    Apollo 8
    Gemini
    Mercury|Project Mercury
    Apollo 1
    Artemis I|Artemis 1;Artemis
    Artemis II|Artemis 2
    Skylab
    Soyuz
    Rosetta
    Cassini|Cassini-Huygens
    New Horizons
    Pioneer 10|Pioneer
    Viking 1|Viking
    Pathfinder|Mars Pathfinder
    Sojourner
    Spirit
    Opportunity
    Juno
    Galileo
    Kepler
    Chandrayaan-3|Chandrayaan
    Chang'e 4|Chang'e
    Tiangong
    Crew Dragon|Dragon
    Falcon Heavy
    Ariane 5|Ariane
    Beagle 2
    Luna 9|Luna
    Lunokhod 1|Lunokhod
    Venera 7|Venera
    Philae
    Huygens
    Ingenuity
    Spitzer
    Chandra
    Gaia
    Parker Solar Probe
    SOHO
    Dawn
    Messenger
    Mariner 4|Mariner
    Magellan
    Stardust
    Deep Impact
    Hayabusa
    OSIRIS-REx
    DART
    Mangalyaan|Mars Orbiter Mission
    Salyut 1|Salyut
    Vanguard
    Explorer 1
    Freedom 7
    Friendship 7
    Buran
    Energia
    Long March
    Vega
    Electron
    New Shepard
    SpaceShipOne
    Starliner
    Orion
    Lunar Module|Eagle
    Lunar Rover|LRV
    Odysseus|IM-1
    Hope|Emirates Mars Mission
    Tianwen-1|Zhurong
  `),
  // ── General ────────────────────────────────────────────────────────────────
  ranked('fairy-tale', 'general', 'Name a fairy tale', 'Fairy tales', `
    Cinderella
    Snow White|Snow White and the Seven Dwarfs
    Little Red Riding Hood|Red Riding Hood
    Sleeping Beauty
    Rapunzel
    Hansel and Gretel
    Goldilocks and the Three Bears|Goldilocks
    Jack and the Beanstalk
    The Three Little Pigs|Three Little Pigs
    Beauty and the Beast
    The Little Mermaid
    Rumpelstiltskin
    The Frog Prince|Frog Prince
    The Ugly Duckling|Ugly Duckling
    Puss in Boots
    The Princess and the Pea|Princess and the Pea
    The Gingerbread Man|Gingerbread Man
    The Emperor's New Clothes
    The Snow Queen|Snow Queen
    Thumbelina
    Aladdin
    Pinocchio
    The Elves and the Shoemaker
    Three Billy Goats Gruff|The Three Billy Goats Gruff;Billy Goats Gruff
    The Pied Piper of Hamelin|Pied Piper
    Tom Thumb
    The Little Match Girl|Little Match Girl
    The Golden Goose
    The Tortoise and the Hare|Tortoise and the Hare
    Bluebeard
    Ali Baba and the Forty Thieves|Ali Baba
    Sinbad the Sailor|Sinbad
    The Steadfast Tin Soldier|Tin Soldier
    The Twelve Dancing Princesses|Twelve Dancing Princesses
    The Bremen Town Musicians|Town Musicians of Bremen
    Chicken Little|Henny Penny
    The Boy Who Cried Wolf
    Dick Whittington
    The Princess and the Frog
    Snow-White and Rose-Red|Snow White and Rose Red
    The Wild Swans
    The Nightingale
    The Little Red Hen
    Jack the Giant Killer
    The Fisherman and His Wife
    The Goose Girl
    The Brave Little Tailor|Valiant Little Tailor
    Mother Holle
    East of the Sun and West of the Moon
    The Water of Life
    The Firebird
    Vasilisa the Beautiful
    The Six Swans
    The Red Shoes
    The Tinderbox
    Diamonds and Toads
    The Juniper Tree
    Donkeyskin
    The Twelve Brothers
  `),
  ranked('toy', 'general', 'Name a toy', 'Toys', `
    Teddy bear|Teddy
    Lego
    Barbie
    Doll
    Yo-yo|Yoyo
    Rubik's Cube
    Kite
    Spinning top|Top
    Action Man|GI Joe
    Hot Wheels
    Slinky
    Play-Doh|Playdough
    Etch A Sketch
    Frisbee
    Jigsaw|Jigsaw puzzle
    Hula hoop
    Skipping rope|Jump rope
    Space Hopper
    Rocking horse
    Toy soldiers|Toy soldier
    Train set|Model railway
    Marbles
    Jack-in-the-box
    Furby
    Tamagotchi
    Beanie Babies|Beanie Baby
    Cabbage Patch Kids|Cabbage Patch
    Sylvanian Families|Calico Critters
    Polly Pocket
    My Little Pony
    Transformers
    Care Bears
    Meccano
    Scalextric
    Nerf gun|Nerf
    Water pistol|Squirt gun
    Buzz Lightyear
    Mr. Potato Head|Mr Potato Head
    Fidget spinner
    Matchbox cars|Matchbox
    Corgi cars|Corgi
    K'Nex
    Duplo
    Playmobil
    View-Master
    Spirograph
    Stickle Bricks
    Kinetic sand
    Slime
    Magna Doodle
    Lite-Brite
    Operation
    Simon
    Speak & Spell
    Game Boy
    Bop It
    Pogo stick
    Scooter
    Dolls' house|Dollhouse;Doll's house
    Puppet
    Marionette
    Glove puppet
    Rattle
    Kaleidoscope
    Whistle
    Trike|Tricycle
    Bucket and spade
    Bubbles|Bubble wand
    Silly Putty
    Gyroscope
    Clackers
    Weebles
    Sock monkey
    Cup-and-ball|Kendama
    Hobby horse
    Diabolo
    Zoetrope
    Jacks|Knucklebones
  `),
  ranked('card-game', 'general', 'Name a card game', 'Card games', `
    Poker
    Snap
    Blackjack|Pontoon;Twenty-one
    Solitaire|Patience;Klondike
    Rummy|Gin rummy
    Uno
    Go Fish
    Bridge|Contract bridge
    Old Maid
    Cheat|I Doubt It
    Crazy Eights
    Whist
    Hearts
    Spades
    Baccarat
    Texas hold 'em|Texas holdem
    Canasta
    Cribbage|Crib
    Pairs|Memory;Pelmanism;Concentration
    Happy Families
    Top Trumps
    Newmarket
    Sevens|Fan Tan
    Palace|Shed
    Twenty-nine
    Speed
    War|Beggar My Neighbour
    Spit
    Slapjack
    Euchre
    Pinochle
    Piquet
    Bezique
    Chase the Ace
    Sheepshead
    Skat
    Mahjong|Mah-jong
    Black Maria
    Nomination whist
    Knockout whist
    Ninety-nine
    Pig
    Spoons
    President|Scum
    Durak
    Briscola
    Scopa
    Tarot|Tarock
    Belote
    Klaverjas
    Hanafuda
    Pai gow
    Faro
    Brag|Three card brag
    Omaha
    Seven-card stud|Stud poker
    Spider Solitaire|Spider
    FreeCell
    Pyramid
    Magic: The Gathering|Magic;MTG
    Pokémon Trading Card Game|Pokemon cards;Pokémon cards
    Yu-Gi-Oh!|Yu-Gi-Oh
    Exploding Kittens
    Cards Against Humanity
    Dobble|Spot It
    Skip-Bo
    Phase 10
    Fluxx
    Hanabi
    Love Letter
    Bang!
    Dominion
  `),
  ranked('nursery-rhyme', 'general', 'Name a nursery rhyme', 'Nursery rhymes', `
    Twinkle, Twinkle, Little Star|Twinkle Twinkle
    Humpty Dumpty
    Baa, Baa, Black Sheep|Baa Baa Black Sheep
    Hickory Dickory Dock
    Jack and Jill
    Mary Had a Little Lamb
    Incy Wincy Spider|Itsy Bitsy Spider
    Old MacDonald Had a Farm|Old MacDonald
    Hey Diddle Diddle
    Little Bo-Peep|Little Bo Peep
    Row, Row, Row Your Boat|Row Row Row Your Boat
    The Wheels on the Bus|Wheels on the Bus
    Ring a Ring o' Roses|Ring Around the Rosie;Ring a Ring of Roses
    Three Blind Mice
    Little Miss Muffet
    Old King Cole
    Pat-a-Cake|Pat-a-cake, Pat-a-cake
    Rock-a-bye Baby|Rockabye Baby
    Sing a Song of Sixpence
    Polly Put the Kettle On
    London Bridge Is Falling Down|London Bridge
    Mary, Mary, Quite Contrary
    The Grand Old Duke of York|Grand Old Duke of York
    Oranges and Lemons
    Little Jack Horner
    Georgie Porgie
    Hot Cross Buns
    Pop Goes the Weasel
    This Little Piggy|This Little Piggy Went to Market
    Old Mother Hubbard
    Ding Dong Bell
    Little Boy Blue
    Doctor Foster
    One, Two, Buckle My Shoe|One Two Buckle My Shoe
    Hush, Little Baby|Hush Little Baby
    Five Little Ducks
    Five Little Monkeys|Five Little Monkeys Jumping on the Bed
    Head, Shoulders, Knees and Toes|Head Shoulders Knees and Toes
    If You're Happy and You Know It
    Lavender's Blue
    Pussy Cat, Pussy Cat
    The Muffin Man|Do You Know the Muffin Man
    Simple Simon
    Wee Willie Winkie
    Tom, Tom, the Piper's Son|Tom Tom the Piper's Son
    Peter Piper
    Peter, Peter, Pumpkin Eater|Peter Peter Pumpkin Eater
    There Was an Old Woman Who Lived in a Shoe|Old Woman Who Lived in a Shoe
    The Owl and the Pussycat|Owl and the Pussycat
    Here We Go Round the Mulberry Bush|Mulberry Bush
    The Farmer's in His Den|Farmer's in the Den
    Ten Green Bottles
    Teddy Bear's Picnic
    I'm a Little Teapot
    Miss Polly Had a Dolly
    Horsey Horsey
    Bobby Shafto
    Solomon Grundy
    Monday's Child
    Ladybird, Ladybird
    Goosey Goosey Gander
    Lucy Locket
    Rain, Rain, Go Away|Rain Rain Go Away
    It's Raining, It's Pouring
    Diddle Diddle Dumpling
    Hark, Hark, the Dogs Do Bark
    I Had a Little Nut Tree
    The Queen of Hearts
    Ride a Cock Horse to Banbury Cross|Banbury Cross
    Hector Protector
  `),
  ranked('social-app', 'general', 'Name a social media or messaging app', 'Social and messaging apps', `
    Facebook
    Instagram|Insta
    TikTok
    WhatsApp
    Snapchat
    X|Twitter
    YouTube
    LinkedIn
    Reddit
    Pinterest
    Messenger|Facebook Messenger
    Telegram
    Discord
    Tumblr
    Threads
    BeReal
    WeChat
    Signal
    Twitch
    Skype
    Viber
    Bluesky
    Myspace
    Bebo
    Vine
    Clubhouse
    Mastodon
    iMessage
    FaceTime
    Zoom
    Microsoft Teams|Teams
    Slack
    Quora
    Flickr
    Weibo
    Line
    Kik
    QQ
    VK|VKontakte
    Douyin
    Xiaohongshu|RedNote
    Truth Social
    Nextdoor
    Strava
    Letterboxd
    Goodreads
    Yik Yak
    Periscope
    Google+|Google Plus
    Friendster
    Hi5
    Ask.fm
    Tinder
    Bumble
    Hinge
    Grindr
    Lemon8
    Substack
    Medium
    Parler
    Gab
    Path
    Orkut
    MSN Messenger|MSN;Windows Live Messenger
    AIM|AOL Instant Messenger
    ICQ
    Yahoo Messenger
    Google Hangouts|Hangouts
    Houseparty
  `),
];
