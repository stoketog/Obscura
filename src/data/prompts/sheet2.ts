import type { PromptSeed } from '@/lib/types';
import { sheet } from './sheet1';

/** Factual questions from the 2,000-question sheet, part 2. */
export const SHEET2: PromptSeed[] = [
  sheet('s-lang-before-1990', 'science', 'Name a programming language first released before 1990', 'Programming languages before 1990', `
    C
    BASIC|Basic
    C++|C plus plus
    COBOL|Cobol
    Fortran|FORTRAN
    Pascal
    SQL
    Lisp|LISP
    Assembly|Assembly language;Assembler
    Perl
    Logo
    Ada
    Prolog
    Smalltalk
    Objective-C
    MATLAB|Matlab
    ALGOL|Algol;ALGOL 60
    APL
    Forth
    ML
    Simula
    Erlang
    PostScript
    Bash|Shell;sh
    Awk|AWK
    Scheme
    Eiffel
    Modula-2
    PL/I
    BCPL
    B
    HyperTalk
    Tcl
    Common Lisp
    S
    Miranda
    Clipper
    dBase
    RPG
    JOVIAL
    SNOBOL
    Mumps|MUMPS
    Turbo Pascal
    QuickBASIC
  `),
  sheet('s-dwarf-planet', 'science', 'Name an officially recognised dwarf planet', 'Dwarf planets', `
    Pluto
    Ceres
    Eris
    Haumea
    Makemake
  `),
  sheet('s-desktop-os', 'science', 'Name an operating system for desktop or server computers', 'Desktop and server operating systems', `
    Windows|Microsoft Windows
    macOS|Mac OS;OS X;Mac OS X
    Linux
    Ubuntu
    Unix
    ChromeOS|Chrome OS
    MS-DOS|DOS
    Windows Server
    Debian
    Fedora
    Red Hat|Red Hat Enterprise Linux;RHEL
    Linux Mint|Mint
    CentOS
    FreeBSD
    OpenBSD
    NetBSD
    Solaris|SunOS
    AIX
    HP-UX
    Arch Linux|Arch
    SUSE|openSUSE
    Gentoo
    Kali Linux|Kali
    Manjaro
    elementary OS
    Pop!_OS|Pop OS
    Zorin OS
    Haiku
    BeOS
    OS/2
    AmigaOS
    RISC OS
    NeXTSTEP
    Plan 9
    Rocky Linux
    AlmaLinux
    Slackware
    Windows NT
    Windows XP
    Windows 95
    Windows 10
    Windows 11
    Windows Vista
    Windows 7
    Classic Mac OS|System 7
    QNX
    z/OS
    ReactOS
  `),
  sheet('s-na-range', 'geography', 'Name a mountain range in North America', 'North American ranges', `
    Rocky Mountains|Rockies
    Appalachian Mountains|Appalachians
    Sierra Nevada
    Cascade Range|Cascades
    Sierra Madre|Sierra Madre Occidental
    Sierra Madre Oriental
    Sierra Madre del Sur
    Alaska Range
    Brooks Range
    Coast Mountains
    Coast Ranges
    Olympic Mountains
    Blue Ridge Mountains|Blue Ridge
    Great Smoky Mountains|Smoky Mountains;Smokies
    Adirondack Mountains|Adirondacks
    White Mountains
    Green Mountains
    Catskill Mountains|Catskills
    Ozark Mountains|Ozarks
    Black Hills
    Teton Range|Tetons
    Wasatch Range
    Bitterroot Range
    Sawtooth Range
    Wind River Range
    Bighorn Mountains
    Uinta Mountains
    San Juan Mountains
    Sangre de Cristo Mountains
    Front Range
    Laramie Mountains
    Absaroka Range
    Beartooth Mountains
    Klamath Mountains
    Transverse Ranges
    San Gabriel Mountains
    Santa Monica Mountains
    Chugach Mountains
    Saint Elias Mountains
    Wrangell Mountains
    Mackenzie Mountains
    Selkirk Mountains
    Purcell Mountains
    Columbia Mountains
    Laurentian Mountains|Laurentians
    Torngat Mountains
    Ouachita Mountains
    Allegheny Mountains
    Berkshires
    Pocono Mountains|Poconos
    Trans-Mexican Volcanic Belt
    Sierra Madre de Chiapas
  `),
  sheet('s-african-river', 'geography', 'Name a river in Africa', 'African rivers', `
    Nile
    Congo|Zaire River
    Niger
    Zambezi
    Limpopo
    Orange River|Orange
    Blue Nile
    White Nile
    Okavango
    Senegal
    Volta
    Gambia
    Ubangi
    Kasai
    Benue
    Juba
    Shebelle
    Ruvuma
    Rufiji
    Kagera
    Atbara
    Sobat
    Chari
    Logone
    Lualaba
    Cuanza|Kwanza
    Cunene|Kunene
    Vaal
    Tugela
    Sabi|Save
    Shire
    Luangwa
    Kafue
    Ogooué|Ogooue
    Sanaga
    Cross River
    Komoé|Komoe
    Bandama
    Sassandra
    Moulouya
    Sebou
    Draa
    Medjerda
    Chelif
    Omo
    Awash
    Tana
    Galana
    Pangani
    Mara
    Kwango
    Lomami
    Aruwimi
    Uele
    Black Volta
    White Volta
    Fish River
    Great Fish River
    Breede
  `),
  sheet('s-unesco-site', 'geography', 'Name a UNESCO World Heritage Site', 'World Heritage Sites', `
    Stonehenge
    Great Wall of China|Great Wall
    Taj Mahal
    Machu Picchu
    Pyramids of Giza|Giza;Pyramids;Memphis and its Necropolis
    Grand Canyon
    Statue of Liberty
    Great Barrier Reef
    Petra
    Acropolis|Acropolis of Athens;Parthenon
    Angkor Wat|Angkor
    Colosseum|Historic Centre of Rome;Rome
    Venice|Venice and its Lagoon
    Galápagos Islands|Galapagos;Galápagos
    Yellowstone
    Chichen Itza|Chichén Itzá
    Tower of London
    Palace of Westminster|Westminster Abbey;Houses of Parliament
    Kew Gardens|Royal Botanic Gardens, Kew
    Bath|City of Bath
    Edinburgh|Old and New Towns of Edinburgh
    Giant's Causeway
    Hadrian's Wall
    Canterbury Cathedral
    Blenheim Palace
    Ironbridge Gorge|Ironbridge
    Jurassic Coast
    Lake District
    Durham Cathedral
    Versailles|Palace of Versailles
    Mont-Saint-Michel|Mont Saint Michel
    Banks of the Seine|Paris
    Alhambra
    Sagrada Família|Sagrada Familia;Works of Antoni Gaudí
    Florence|Historic Centre of Florence
    Pompeii
    Leaning Tower of Pisa|Piazza del Duomo, Pisa;Pisa
    Vatican City|Vatican
    Dubrovnik|Old City of Dubrovnik
    Kremlin and Red Square|Kremlin;Red Square
    Auschwitz|Auschwitz-Birkenau
    Prague|Historic Centre of Prague
    Cologne Cathedral
    Sydney Opera House
    Uluru|Uluru-Kata Tjuta;Ayers Rock
    Easter Island|Rapa Nui
    Serengeti
    Kilimanjaro|Mount Kilimanjaro
    Victoria Falls
    Robben Island
    Great Zimbabwe
    Timbuktu
    Lalibela|Rock-Hewn Churches of Lalibela
    Abu Simbel|Nubian Monuments
    Valley of the Kings|Thebes;Luxor
    Mount Fuji|Fuji
    Kyoto|Historic Monuments of Ancient Kyoto
    Himeji Castle|Himeji
    Hiroshima Peace Memorial|Genbaku Dome
    Forbidden City
    Terracotta Army|Mausoleum of the First Qin Emperor
    Borobudur
    Ha Long Bay|Halong Bay
    Bagan
    Everest|Sagarmatha National Park
    Persepolis
    Babylon
    Göbekli Tepe|Gobekli Tepe
    Hagia Sophia|Historic Areas of Istanbul;Istanbul
    Cappadocia|Göreme National Park
    Ephesus
    Troy
    Jerusalem|Old City of Jerusalem
    Teotihuacan
    Rio de Janeiro|Christ the Redeemer
    Iguazu Falls|Iguazu National Park;Iguaçu
    Cartagena
    Yosemite
    Mesa Verde
    Independence Hall
    Everglades
    Redwood National Park|Redwoods
    Grand Pré
    Banff|Canadian Rocky Mountain Parks
    Head-Smashed-In Buffalo Jump
    L'Anse aux Meadows
    Okavango Delta
    Ngorongoro|Ngorongoro Conservation Area
    Mosi-oa-Tunya
    Skellig Michael
    Brú na Bóinne|Newgrange
    St Kilda
    Neolithic Orkney|Skara Brae
    Forth Bridge
    Pont du Gard
    Carcassonne
    Chartres Cathedral
    Loire Valley
    Cinque Terre
    Amalfi Coast
    Dolomites
    Matera
    Meteora
    Delphi
    Olympia
    Rhodes|Medieval City of Rhodes
    Plitvice Lakes|Plitvice
    Kotor
    Mostar|Stari Most
    Hallstatt
    Schönbrunn Palace|Schonbrunn
    Wadden Sea
    Rietveld Schröder House
    Kinderdijk
    Bruges|Historic Centre of Brugge
    Grand-Place|Grand Place
    Wieliczka Salt Mine|Wieliczka
    Kraków|Krakow
    Tallinn
    Riga
    Vilnius
    Bryggen
    Geirangerfjord|West Norwegian Fjords
    Suomenlinna
    Drottningholm Palace
    Røros|Roros
    Thingvellir|Þingvellir
    Surtsey
    Sintra
    Belém Tower|Belem Tower;Jerónimos Monastery
    Toledo
    Santiago de Compostela
    Córdoba|Mezquita;Cordoba
    Segovia|Aqueduct of Segovia
    Altamira
    Lascaux|Vézère Valley
    Chaco Canyon|Chaco Culture
    Cahokia|Cahokia Mounds
    Great Smoky Mountains
    Olympic National Park
    Hawaii Volcanoes
    Mammoth Cave
    Carlsbad Caverns
    Tikal
    Copán|Copan
    Palenque
    Old Havana|Havana
    Quito
    Cusco|Cuzco
    Nazca Lines|Nazca
    Potosí|Potosi
    Tiwanaku
    Valparaíso
    Los Glaciares|Perito Moreno
    Brasília|Brasilia
    Salvador
    Ouro Preto
    Pantanal
    Central Amazon|Amazon
    Cape Floral Region
    iSimangaliso
    Drakensberg|Maloti-Drakensberg
    Lake Malawi
    Rwenzori Mountains
    Bwindi
    Kakadu
    Shark Bay
    Fraser Island|K'gari
    Daintree|Wet Tropics of Queensland
    Tasmanian Wilderness
    Te Wahipounamu|Fiordland
    Tongariro
    Komodo
    Prambanan
    Angkor Thom
    Ayutthaya
    Sukhothai
    Luang Prabang
    Hoi An
    Hue|Huế
    My Son
    Ellora Caves|Ellora
    Ajanta Caves|Ajanta
    Khajuraho
    Hampi
    Qutb Minar
    Red Fort
    Fatehpur Sikri
    Agra Fort
    Sundarbans
    Kathmandu Valley
    Lumbini
    Potala Palace|Potala
    Summer Palace
    Temple of Heaven
    Mogao Caves
    Jiuzhaigou
    Zhangjiajie|Wulingyuan
    Mount Huangshan|Huangshan
    Mount Tai|Taishan
    Gyeongju
    Changdeokgung
    Nara
    Nikko|Nikkō
    Itsukushima|Miyajima
    Shirakawa-go
    Yakushima
    Ningaloo
    Socotra
    Old Town of Sana'a|Sanaa
    Shibam
    Hegra|Al-Hijr;Mada'in Salih
    Wadi Rum
    Baalbek
    Byblos
    Palmyra
    Krak des Chevaliers
    Carthage
    Kairouan
    Fez|Fes;Medina of Fez
    Marrakesh|Medina of Marrakesh
    Ait Benhaddou|Aït Benhaddou
    Leptis Magna
    Djenné|Djenne
    Aksum
    Stone Town|Zanzibar
    Lamu
    Mount Kenya
    Rock Islands
    Bikini Atoll
    Nan Madol
    Kyiv|Saint Sophia Cathedral
    Kizhi
    Lake Baikal|Baikal
    Golden Mountains of Altai
    Samarkand
    Bukhara
    Khiva|Itchan Kala
    Merv
    Bam
    Isfahan|Naqsh-e Jahan Square
    Pasargadae
    Mohenjo-daro
    Taxila
    Bamiyan
    Minaret of Jam
  `),
  sheet('s-alkaline-earth', 'science', 'Name an alkaline earth metal', 'Alkaline earth metals', `
    Calcium
    Magnesium
    Radium
    Barium
    Beryllium
    Strontium
  `),
  sheet('s-borders-china', 'geography', 'Name a country that shares a land border with China', 'China’s neighbours', `
    India
    Russia
    North Korea
    Mongolia
    Vietnam
    Pakistan
    Nepal
    Afghanistan
    Kazakhstan
    Myanmar|Burma
    Laos
    Bhutan
    Kyrgyzstan
    Tajikistan
  `),
  sheet('s-si-base-unit', 'science', 'Name an SI base unit', 'SI base units', `
    Metre|Meter
    Kilogram|Kilogramme
    Second
    Ampere|Amp
    Kelvin
    Mole
    Candela
  `),
  sheet('s-national-park', 'geography', 'Name a national park', 'National parks', `
    Yellowstone
    Yosemite
    Grand Canyon
    Lake District
    Peak District
    Snowdonia|Eryri
    Kruger
    Serengeti
    Dartmoor
    Banff
    Zion
    Everglades
    Brecon Beacons|Bannau Brycheiniog
    Cairngorms
    New Forest
    Yorkshire Dales
    North York Moors
    Exmoor
    Northumberland
    South Downs
    Pembrokeshire Coast
    Loch Lomond and the Trossachs|Loch Lomond
    The Broads|Norfolk Broads
    Glacier
    Rocky Mountain
    Great Smoky Mountains
    Arches
    Bryce Canyon
    Joshua Tree
    Death Valley
    Sequoia
    Olympic
    Mount Rainier
    Denali
    Acadia
    Grand Teton
    Canyonlands
    Capitol Reef
    Redwood
    Shenandoah
    Hawaii Volcanoes
    Mammoth Cave
    Carlsbad Caverns
    Badlands
    Jasper
    Kluane
    Torres del Paine
    Iguazú|Iguazu;Iguaçu
    Los Glaciares
    Galápagos|Galapagos
    Kakadu
    Uluru-Kata Tjuta|Uluru
    Daintree
    Blue Mountains
    Fiordland
    Tongariro
    Abel Tasman
    Komodo
    Plitvice Lakes|Plitvice
    Krka
    Durmitor
    Triglav
    Hohe Tauern
    Swiss National Park
    Gran Paradiso
    Cinque Terre
    Picos de Europa
    Ordesa
    Teide
    Peneda-Gerês
    Killarney
    Connemara
    Wicklow Mountains
    Thingvellir|Þingvellir
    Vatnajökull|Vatnajokull
    Jotunheimen
    Abisko
    Sarek
    Białowieża|Bialowieza
    Tatra
    Etosha
    Chobe
    Masai Mara
    Amboseli
    Tsavo
    Ngorongoro
    Bwindi Impenetrable
    Virunga
    Volcanoes
    South Luangwa
    Hwange
    Kaziranga
    Ranthambore
    Jim Corbett|Corbett
    Sagarmatha
    Chitwan
    Khao Sok
    Khao Yai
    Phong Nha-Ke Bang
    Fuji-Hakone-Izu|Fuji Hakone
    Nikko|Nikkō
    Zhangjiajie
    Jiuzhaigou
    Gobi Gurvansaikhan
    Wolong
    Table Mountain
    Addo Elephant
  `),
  sheet('s-borders-india', 'geography', 'Name a country that shares a land border with India', 'India’s neighbours', `
    Pakistan
    China
    Nepal
    Bangladesh
    Bhutan
    Myanmar|Burma
    Afghanistan
  `),
  sheet('s-operating-system', 'science', 'Name an operating system', 'Operating systems', `
    Windows|Microsoft Windows
    macOS|Mac OS;OS X
    Android
    iOS
    Linux
    Ubuntu
    ChromeOS|Chrome OS
    iPadOS
    watchOS
    tvOS
    visionOS
    Unix
    MS-DOS|DOS
    HarmonyOS
    Tizen
    Symbian
    BlackBerry OS
    Windows Phone
    Palm OS
    webOS
    Fire OS
    KaiOS
    Wear OS
    Debian
    Fedora
    Red Hat|RHEL
    Linux Mint
    FreeBSD
    OpenBSD
    Solaris
    AIX
    HP-UX
    Arch Linux
    SUSE|openSUSE
    Haiku
    BeOS
    OS/2
    AmigaOS
    RISC OS
    QNX
    FreeRTOS
    VxWorks
    z/OS
    Plan 9
    Fuchsia
    Raspberry Pi OS|Raspbian
    SteamOS
    Orbis OS
    Kali Linux
    Windows XP
  `),
  sheet('s-vitamin', 'science', 'Name a vitamin', 'Vitamins', `
    Vitamin C|C;Ascorbic acid
    Vitamin D|D;Vitamin D3;Cholecalciferol
    Vitamin A|A;Retinol
    Vitamin B12|B12;Cobalamin
    Vitamin E|E;Tocopherol
    Vitamin K|K
    Vitamin B6|B6;Pyridoxine
    Vitamin B1|B1;Thiamine;Thiamin
    Folic acid|Vitamin B9;B9;Folate
    Vitamin B2|B2;Riboflavin
    Vitamin B3|B3;Niacin
    Biotin|Vitamin B7;B7;Vitamin H
    Vitamin B5|B5;Pantothenic acid
    Vitamin D2|Ergocalciferol
    Vitamin K2|Menaquinone
    Vitamin K1|Phylloquinone
  `),
  sheet('s-force', 'science', 'Name a type of force studied in physics', 'Forces', `
    Gravity|Gravitational force;Weight
    Friction
    Magnetic force|Magnetism
    Air resistance|Drag
    Tension
    Electromagnetic force|Electromagnetism
    Upthrust|Buoyancy;Buoyant force
    Normal force|Normal reaction;Reaction force
    Thrust
    Lift
    Strong nuclear force|Strong force
    Weak nuclear force|Weak force
    Electrostatic force|Electric force;Coulomb force
    Centripetal force
    Centrifugal force
    Elastic force|Spring force;Restoring force
    Applied force|Push;Pull
    Torque
    Shear force|Shear
    Compression
    Impulse
    Coriolis force
    Lorentz force
    Van der Waals force
    Viscous force|Viscosity
    Surface tension
    Tidal force
    Contact force
    Non-contact force
    Pressure
  `),
  sheet('s-complete-metamorphosis', 'nature', 'Name an insect that undergoes complete metamorphosis', 'Insects with a pupa', `
    Butterfly
    Moth
    Beetle
    Bee|Honeybee;Bumblebee
    Fly|Housefly
    Mosquito
    Ant
    Wasp
    Ladybird|Ladybug
    Flea
    Hornet
    Silkworm|Silk moth
    Fruit fly
    Hoverfly
    Crane fly|Daddy long legs
    Firefly
    Weevil
    Stag beetle
    Dung beetle
    Caddisfly
    Lacewing
    Scorpionfly
    Sawfly
    Gnat
    Midge
    Horsefly
    Bluebottle
    Mealworm beetle|Mealworm
    Glow-worm|Glowworm
    Monarch butterfly
    Cabbage white
    Hawk moth
    Clothes moth
    Snakefly
    Alderfly
    Antlion
    Dobsonfly
    Bot fly
    Tsetse fly
    Sandfly
  `),
  sheet('s-treaty-before-1900', 'history', 'Name a historical treaty signed before 1900', 'Treaties before 1900', `
    Treaty of Paris|Treaty of Paris (1783);Treaty of Paris (1763)
    Treaty of Westphalia|Peace of Westphalia
    Treaty of Utrecht
    Treaty of Tordesillas
    Treaty of Waitangi
    Treaty of Ghent
    Treaty of Nanking|Treaty of Nanjing
    Treaty of Guadalupe Hidalgo
    Magna Carta
    Treaty of Union|Act of Union
    Congress of Vienna|Treaty of Vienna
    Treaty of Amiens
    Treaty of Tilsit
    Treaty of Troyes
    Treaty of Verdun
    Treaty of Kadesh|Egyptian–Hittite peace treaty
    Treaty of Aix-la-Chapelle
    Treaty of Berlin
    Treaty of Frankfurt
    Treaty of San Stefano
    Treaty of Shimonoseki
    Treaty of Kanagawa
    Treaty of Fontainebleau
    Treaty of Campo Formio
    Treaty of Lunéville|Treaty of Luneville
    Treaty of Pressburg
    Treaty of Schönbrunn|Treaty of Schonbrunn
    Treaty of Karlowitz
    Treaty of Nerchinsk
    Treaty of Zaragoza
    Treaty of Breda
    Treaty of Ryswick
    Treaty of Rastatt
    Treaty of Nystad
    Treaty of Hubertusburg
    Treaty of Kuchuk-Kainarji|Treaty of Küçük Kaynarca
    Treaty of Greenville
    Treaty of Fort Laramie
    Treaty of Fort Stanwix
    Jay Treaty
    Pinckney's Treaty
    Adams–Onís Treaty|Adams-Onis Treaty
    Louisiana Purchase
    Webster–Ashburton Treaty|Webster-Ashburton Treaty
    Oregon Treaty
    Gadsden Purchase
    Treaty of Tientsin|Treaty of Tianjin
    Treaty of Aigun
    Treaty of Prague
    Treaty of London
    Treaty of Windsor
    Treaty of Perpetual Peace
    Treaty of Northampton
    Treaty of Edinburgh–Northampton
    Treaty of Picquigny
    Treaty of Brétigny|Treaty of Bretigny
    Treaty of Wedmore
    Treaty of Alcáçovas|Treaty of Alcacovas
    Peace of Augsburg
    Edict of Nantes
    Treaty of the Pyrenees
    Treaty of Dover
    Treaty of Nijmegen
    Treaty of Seville
    Treaty of Madrid
    Treaty of Lodi
    Treaty of Constance
    Treaty of Worms|Concordat of Worms
    Treaty of Bucharest
    Treaty of Adrianople
    Treaty of Turkmenchay
    Treaty of Gulistan
    Treaty of Washington
    Treaty of Wanghia
    Treaty of Whampoa
    Treaty of Bardo
    Treaty of Wuchale
  `),
  sheet('s-landlocked-capital', 'geography', 'Name the capital of a landlocked country', 'Capitals of landlocked countries', `
    Vienna
    Prague
    Budapest
    Bern
    Kathmandu
    Kabul
    Luxembourg|Luxembourg City
    Belgrade
    Bratislava
    Minsk
    La Paz|Sucre
    Asunción|Asuncion
    Ulaanbaatar|Ulan Bator
    Addis Ababa
    Kampala
    Kigali
    Lusaka
    Harare
    Gaborone
    Vatican City
    San Marino
    Andorra la Vella
    Vaduz
    Chisinau|Chișinău
    Skopje
    Pristina
    Yerevan
    Baku
    Astana|Nur-Sultan
    Tashkent
    Bishkek
    Dushanbe
    Ashgabat
    Thimphu
    Vientiane
    Bamako
    Niamey
    N'Djamena|Ndjamena
    Ouagadougou
    Bangui
    Juba
    Lilongwe
    Maseru
    Mbabane|Lobamba
    Gitega|Bujumbura
  `),
  sheet('s-neurotransmitter', 'science', 'Name a neurotransmitter', 'Neurotransmitters', `
    Dopamine
    Serotonin
    Adrenaline|Epinephrine
    Noradrenaline|Norepinephrine
    Acetylcholine
    GABA|Gamma-aminobutyric acid
    Glutamate|Glutamic acid
    Endorphins|Endorphin
    Oxytocin
    Histamine
    Glycine
    Melatonin
    Substance P
    Enkephalin|Enkephalins
    Anandamide
    Adenosine
    ATP
    Aspartate
    Nitric oxide
    Vasopressin
    Neuropeptide Y
    Orexin|Hypocretin
    Tryptamine
    Octopamine
    Tyramine
    D-serine
    Dynorphin
    Galanin
    Cholecystokinin
    2-AG
  `),
  sheet('s-borders-kenya', 'geography', 'Name a country that shares a land border with Kenya', 'Kenya’s neighbours', `
    Tanzania
    Uganda
    Ethiopia
    Somalia
    South Sudan
  `),
  sheet('s-borders-russia', 'geography', 'Name a country that shares a land border with Russia', 'Russia’s neighbours', `
    China
    Ukraine
    Finland
    Kazakhstan
    Mongolia
    Belarus
    Norway
    Poland
    Georgia
    North Korea
    Estonia
    Latvia
    Lithuania
    Azerbaijan
  `),
  sheet('s-console-before-2000', 'screen', 'Name a video game console released before 2000', 'Consoles before 2000', `
    PlayStation|PS1;PlayStation 1;PSX
    Nintendo 64|N64
    Game Boy|Gameboy
    Super Nintendo|SNES;Super NES;Super Famicom
    NES|Nintendo Entertainment System;Famicom
    Sega Mega Drive|Mega Drive;Sega Genesis;Genesis
    Atari 2600|Atari;Atari VCS
    Sega Dreamcast|Dreamcast
    Sega Saturn|Saturn
    Sega Master System|Master System
    Game Boy Color|Gameboy Color
    Game Gear|Sega Game Gear
    Atari Lynx|Lynx
    Atari Jaguar|Jaguar
    Neo Geo
    3DO
    Virtual Boy
    ColecoVision
    Intellivision
    Magnavox Odyssey|Odyssey
    Atari 5200
    Atari 7800
    Sega 32X|32X
    Sega CD|Mega-CD
    TurboGrafx-16|PC Engine
    Vectrex
    Philips CD-i|CD-i
    Neo Geo Pocket
    WonderSwan
    Game & Watch|Game and Watch
    Fairchild Channel F|Channel F
    Amiga CD32|CD32
    PC-FX
    Pippin
    Microvision
    Commodore 64 Games System
    Home Pong
  `),
  sheet('s-marine-mammal', 'nature', 'Name a mammal that lives in the ocean', 'Marine mammals', `
    Whale
    Dolphin
    Blue whale
    Seal
    Orca|Killer whale
    Humpback whale
    Walrus
    Sea lion
    Sea otter
    Manatee|Sea cow
    Narwhal
    Beluga|Beluga whale
    Sperm whale
    Dugong
    Porpoise
    Polar bear
    Bottlenose dolphin
    Grey whale|Gray whale
    Minke whale
    Fin whale
    Right whale
    Bowhead whale
    Pilot whale
    Elephant seal
    Leopard seal
    Harbour seal|Harbor seal;Common seal
    Grey seal|Gray seal
    Fur seal
    Weddell seal
    Harp seal
    Ringed seal
    Bearded seal
    Hooded seal
    Monk seal
    Crabeater seal
    Sei whale
    Bryde's whale
    Beaked whale
    Cuvier's beaked whale
    Spinner dolphin
    Risso's dolphin
    Dusky dolphin
    Hector's dolphin
    Vaquita
    Harbour porpoise
    Dall's porpoise
    False killer whale
    Steller's sea cow
    Marine otter
    Sea mink
    Ross seal
    Steller sea lion
    California sea lion
  `),
  sheet('s-med-island', 'geography', 'Name an island in the Mediterranean Sea', 'Mediterranean islands', `
    Sicily
    Sardinia
    Corsica
    Crete
    Cyprus
    Malta
    Majorca|Mallorca
    Ibiza
    Menorca|Minorca
    Rhodes
    Corfu
    Capri
    Santorini|Thira
    Mykonos
    Kos
    Gozo
    Elba
    Lesbos|Lesvos
    Naxos
    Paros
    Zakynthos|Zante
    Kefalonia|Cephalonia
    Ischia
    Formentera
    Hvar
    Brač|Brac
    Korčula|Korcula
    Krk
    Djerba
    Samos
    Chios
    Ithaca
    Lampedusa
    Pantelleria
    Lipari
    Stromboli
    Vulcano
    Salina
    Patmos
    Skiathos
    Hydra
    Aegina
    Lefkada
    Karpathos
    Milos
    Ios
    Syros
    Tinos
    Andros
    Euboea|Evia
    Thassos
    Limnos|Lemnos
    Comino
    Giglio
    Procida
    Favignana
    Cres
    Lošinj|Losinj
    Rab
    Pag
    Vis
    Mljet
    Porquerolles
    Elafonisos
  `),
  sheet('s-brass', 'music', 'Name a brass instrument', 'Brass instruments', `
    Trumpet
    Trombone
    Tuba
    French horn|Horn
    Cornet
    Euphonium
    Sousaphone
    Flugelhorn
    Bugle
    Baritone horn|Baritone
    Tenor horn|Alto horn
    Bass trombone
    Piccolo trumpet
    Mellophone
    Wagner tuba
    Sackbut
    Serpent
    Ophicleide
    Alphorn
    Conch|Conch shell
    Didgeridoo
    Cimbasso
    Natural horn
    Post horn
    Hunting horn
    Vuvuzela
    Shofar
    Lur
    Carnyx
    Cornett
    Superbone
    Valve trombone
    Pocket trumpet
    Helicon
    Saxhorn
  `),
  sheet('s-pool-sport', 'sport', 'Name a sport played in a swimming pool', 'Pool sports', `
    Swimming
    Water polo
    Diving
    Synchronised swimming|Artistic swimming;Synchronized swimming
    Aqua aerobics|Aquarobics
    Underwater hockey|Octopush
    Underwater rugby
    Finswimming
    Canoe polo|Kayak polo
    Water volleyball
    Water basketball
    Freediving|Static apnea
    Lifesaving|Lifesaving sport
    Inner tube water polo
    Triathlon
    Modern pentathlon
    Aquathlon
  `),
  sheet('s-olympic-combat', 'sport', 'Name an Olympic combat sport', 'Olympic combat sports', `
    Boxing
    Judo
    Wrestling|Freestyle wrestling;Greco-Roman wrestling
    Fencing
    Taekwondo
    Karate
  `),
  sheet('s-shelled-animal', 'nature', 'Name an animal with a shell', 'Animals with shells', `
    Snail
    Tortoise
    Turtle
    Crab
    Lobster
    Oyster
    Clam
    Mussel
    Scallop
    Hermit crab
    Armadillo
    Prawn|Shrimp
    Cockle
    Whelk
    Limpet
    Periwinkle|Winkle
    Nautilus
    Sea turtle
    Terrapin
    Barnacle
    Crayfish|Crawfish
    Sea urchin
    Conch
    Abalone
    Cowrie
    Razor clam
    Tortoise beetle
    Beetle
    Woodlouse
    Pangolin
    Ammonite
    Cuttlefish
    Tellin
    Triton
    Murex
    Top shell
    Snapping turtle
    Leatherback
    Giant clam
    Horseshoe crab
    Krill
  `),
  sheet('s-rice-dish', 'food', 'Name a dish made with rice as a main ingredient', 'Rice dishes', `
    Risotto
    Paella
    Fried rice|Egg fried rice
    Sushi
    Biryani
    Rice pudding
    Jambalaya
    Pilaf|Pilau;Pulao;Plov
    Kedgeree
    Jollof rice|Jollof
    Nasi goreng
    Bibimbap
    Congee|Rice porridge;Jook
    Arancini
    Stuffed peppers
    Dolma|Stuffed vine leaves
    Rice and peas
    Gumbo
    Dirty rice
    Red beans and rice
    Arroz con pollo
    Onigiri|Rice ball
    Donburi|Katsudon;Oyakodon
    Chicken rice|Hainanese chicken rice
    Nasi lemak
    Kabsa
    Koshari
    Gallo pinto
    Mujaddara
    Khichdi|Kitchari
    Arroz negro
    Arroz a banda
    Sticky rice|Mango sticky rice
    Rice cakes|Tteok;Mochi
    Kimbap|Gimbap
    Omurice
    Curry and rice|Curry rice;Japanese curry
    Pongal
    Idli
    Dosa
    Lemon rice
    Zongzi
    Lo mai gai
    Claypot rice
    Khao pad
    Rice salad
    Stuffed cabbage|Cabbage rolls
    Arroz caldo
    Champorado
    Tahdig
    Chelow kabab
    Mansaf
    Maqluba
    Thieboudienne
    Waakye
    Arroz con gandules
    Moros y cristianos
    Calas
    Horchata
    Risi e bisi
    Supplì|Suppli
  `),
  sheet('s-fermented-food', 'food', 'Name a fermented food or drink', 'Fermented foods', `
    Yoghurt|Yogurt
    Cheese
    Kimchi
    Sauerkraut
    Bread|Sourdough
    Beer
    Wine
    Soy sauce
    Miso
    Kombucha
    Kefir
    Pickles|Gherkins
    Vinegar
    Salami
    Tempeh
    Natto
    Sour cream
    Buttermilk
    Crème fraîche|Creme fraiche
    Chocolate|Cocoa
    Coffee
    Tea|Black tea
    Olives
    Fish sauce
    Worcestershire sauce
    Tabasco|Hot sauce
    Cider
    Mead
    Sake
    Kvass
    Injera
    Idli
    Dosa
    Stinky tofu
    Pepperoni
    Chorizo
    Marmite|Yeast extract
    Vegemite
    Skyr
    Lassi
    Ayran
    Gochujang
    Doenjang
    Douchi|Black beans
    Garum
    Surströmming|Surstromming
    Hákarl|Hakarl
    Garri
    Ogi
    Poi
    Tepache
    Amazake
    Rakfisk
    Lutefisk
    Sour pickles|Dill pickles
    Crumpets
    Pumpernickel
    Kaymak
    Leben
    Labneh
  `),
  sheet('s-film-before-1980', 'screen', 'Name a film released before 1980', 'Films before 1980', `
    The Wizard of Oz|Wizard of Oz
    Star Wars|A New Hope
    The Godfather|Godfather
    Jaws
    Casablanca
    Gone with the Wind
    Psycho
    Citizen Kane
    Grease
    Rocky
    Mary Poppins
    The Sound of Music|Sound of Music
    It's a Wonderful Life
    Snow White and the Seven Dwarfs|Snow White
    Alien
    Taxi Driver
    The Exorcist|Exorcist
    One Flew Over the Cuckoo's Nest
    Apocalypse Now
    2001: A Space Odyssey|2001
    Breakfast at Tiffany's
    Some Like It Hot
    Singin' in the Rain|Singing in the Rain
    Ben-Hur|Ben Hur
    Lawrence of Arabia
    The Great Escape
    Dr. No|Dr No
    Goldfinger
    A Clockwork Orange|Clockwork Orange
    Halloween
    Saturday Night Fever
    Close Encounters of the Third Kind|Close Encounters
    Superman|Superman: The Movie
    The Godfather Part II|Godfather Part II
    Annie Hall
    The Deer Hunter
    Chinatown
    Vertigo
    Rear Window
    North by Northwest
    The Birds
    12 Angry Men|Twelve Angry Men
    Seven Samurai
    Metropolis
    Modern Times
    City Lights
    The Kid
    Nosferatu
    King Kong
    Frankenstein
    Dracula
    Bambi
    Pinocchio
    Fantasia
    Dumbo
    Cinderella
    Peter Pan
    Lady and the Tramp
    Sleeping Beauty
    101 Dalmatians|One Hundred and One Dalmatians
    The Jungle Book|Jungle Book
    The Aristocats|Aristocats
    Robin Hood
    Chitty Chitty Bang Bang
    Willy Wonka & the Chocolate Factory|Willy Wonka;Willy Wonka and the Chocolate Factory
    The Italian Job|Italian Job
    Zulu
    Bridge on the River Kwai|The Bridge on the River Kwai
    The Searchers
    High Noon
    The Good, the Bad and the Ugly|The Good the Bad and the Ugly
    Butch Cassidy and the Sundance Kid|Butch Cassidy
    Bonnie and Clyde
    The Graduate|Graduate
    Easy Rider
    Midnight Cowboy
    Planet of the Apes
    Night of the Living Dead
    Rosemary's Baby
    Dirty Harry
    The French Connection|French Connection
    The Sting
    Cabaret
    American Graffiti
    The Texas Chain Saw Massacre|Texas Chainsaw Massacre
    Carrie
    The Omen
    Network
    All the President's Men
    The Jazz Singer
    Sunset Boulevard
    All About Eve
    The Maltese Falcon
    Double Indemnity
    Rebecca
    The Third Man
    Brief Encounter
    Kind Hearts and Coronets
    The Ladykillers
    Battleship Potemkin
    Bicycle Thieves
    La Dolce Vita
    8½|8 1/2
    The Seventh Seal
    Breathless
    Rashomon
    Tokyo Story
    Godzilla
    Dr. Strangelove|Dr Strangelove
    West Side Story
    My Fair Lady
    Doctor Zhivago
    The Magnificent Seven|Magnificent Seven
    Spartacus
    To Kill a Mockingbird
    The Wicker Man|Wicker Man
    Don't Look Now
    Monty Python and the Holy Grail|Holy Grail
    Life of Brian|Monty Python's Life of Brian
    Mad Max
    Being There
    Kramer vs. Kramer|Kramer vs Kramer
    The Muppet Movie|Muppet Movie
    Moonraker
    The Spy Who Loved Me
    Live and Let Die
    Thunderball
    From Russia with Love
    You Only Live Twice
    Diamonds Are Forever
    The Man with the Golden Gun
    On Her Majesty's Secret Service
    Barbarella
    Bugsy Malone
    Watership Down
    The Railway Children|Railway Children
    Kes
    Get Carter
    Quadrophenia
  `),
  sheet('s-racket-sport', 'sport', 'Name a sport played with a racket or paddle', 'Racket sports', `
    Tennis
    Badminton
    Squash
    Table tennis|Ping pong
    Padel|Paddle
    Pickleball
    Racquetball
    Real tennis|Royal tennis;Court tennis
    Beach tennis
    Platform tennis|Paddle tennis
    Soft tennis
    Racketlon
    Rackets|Racquets
    Speedminton|Crossminton
    Frontenis
    Paleta
    Matkot
    Speedball
    Swingball
    Totem tennis
    Spec tennis
    Touchtennis
  `),
  sheet('s-japanese-dish', 'food', 'Name a dish from Japanese cuisine', 'Japanese food', `
    Sushi
    Ramen
    Tempura
    Sashimi
    Miso soup|Miso
    Teriyaki
    Udon
    Katsu curry|Katsu;Tonkatsu;Japanese curry
    Gyoza
    Yakitori
    Bento|Bento box
    Edamame
    Onigiri
    Soba
    Okonomiyaki
    Takoyaki
    Mochi
    Sukiyaki
    Shabu-shabu|Shabu shabu
    Donburi|Katsudon;Gyudon;Oyakodon
    Tamagoyaki
    Yakisoba
    Karaage
    Nigiri
    Maki|Maki rolls
    Temaki|Hand roll
    Chirashi
    Unagi|Unadon
    Natto
    Tofu|Agedashi tofu
    Wagyu|Kobe beef
    Dorayaki
    Taiyaki
    Dango
    Matcha|Matcha ice cream
    Wasabi
    Pickled ginger|Gari
    Nabe
    Oden
    Kaiseki
    Omurice
    Hayashi rice
    Korokke
    Chawanmushi
    Tsukemono
    Umeboshi
    Kare raisu|Curry rice
    Zaru soba
    Tsukemen
    Champon
    Monjayaki
    Kushikatsu
    Yakiniku
    Teppanyaki
    Robatayaki
    Ochazuke
    Tamago kake gohan
    Inarizushi|Inari
    Butadon
    Hiyashi chuka
    Nikujaga
    Kitsune udon
    Wagashi
    Castella
    Senbei
    Anmitsu
  `),
  sheet('s-indian-dish', 'food', 'Name a dish from Indian cuisine', 'Indian food', `
    Curry
    Chicken tikka masala|Tikka masala
    Biryani
    Korma
    Naan|Naan bread
    Samosa
    Bhaji|Onion bhaji
    Dal|Daal;Dhal;Lentil curry
    Butter chicken|Murgh makhani
    Vindaloo
    Tandoori chicken|Tandoori
    Jalfrezi
    Madras
    Rogan josh
    Dosa|Masala dosa
    Pakora
    Poppadom|Papadum;Poppadum
    Chapati|Roti
    Paratha
    Saag aloo|Saag
    Palak paneer
    Paneer tikka
    Aloo gobi
    Chana masala|Chole
    Bhuna
    Balti
    Dhansak
    Pasanda
    Pilau rice|Pulao
    Raita
    Chutney|Mango chutney
    Idli
    Vada
    Sambar
    Rasam
    Uttapam
    Pav bhaji
    Vada pav
    Pani puri|Golgappa
    Bhel puri
    Chaat
    Kulfi
    Gulab jamun
    Jalebi
    Rasgulla
    Kheer
    Lassi
    Masala chai|Chai
    Kebab|Seekh kebab;Shami kebab
    Tikka
    Keema
    Malai kofta|Kofta
    Dal makhani
    Rajma
    Chole bhature
    Kadhi
    Dhokla
    Khichdi
    Pongal
    Upma
    Poha
    Thali
    Haleem
    Nihari
    Shahi korma
    Matar paneer
    Baingan bharta
    Bhindi masala|Bhindi
    Goan fish curry|Xacuti
    Appam
    Puttu
    Avial
    Kathi roll
    Momos|Momo
    Thukpa
    Laddu|Ladoo
    Barfi
    Halwa|Gajar halwa
    Shrikhand
    Litti chokha
    Misal pav
    Dabeli
    Rasmalai
  `),
  sheet('s-river-civ', 'history', 'Name an ancient civilisation that grew up along a great river', 'River-valley civilisations', `
    Ancient Egypt|Egyptians;Egypt
    Mesopotamia
    Sumer|Sumerians
    Indus Valley Civilisation|Indus Valley;Harappa;Harappan civilisation
    Shang|Shang dynasty;Ancient China
    Babylon|Babylonians;Babylonia
    Assyria|Assyrians
    Akkad|Akkadian Empire;Akkadians
    Nubia|Kush;Kingdom of Kush;Nubians
    Norte Chico|Caral;Caral-Supe
    Xia dynasty|Xia
    Elam|Elamites
    Mississippian culture|Cahokia
    Khmer Empire|Angkor
    Hohokam
  `),
  sheet('s-organelle', 'science', 'Name an organelle found in eukaryotic cells', 'Organelles', `
    Nucleus
    Mitochondria|Mitochondrion
    Ribosome|Ribosomes
    Chloroplast|Chloroplasts
    Vacuole
    Golgi apparatus|Golgi body;Golgi
    Endoplasmic reticulum|ER;Rough ER;Smooth ER
    Lysosome
    Cell membrane|Plasma membrane
    Cytoplasm
    Cell wall
    Nucleolus
    Peroxisome
    Centriole|Centrioles
    Centrosome
    Cytoskeleton
    Vesicle
    Flagellum
    Cilia|Cilium
    Nuclear envelope|Nuclear membrane
    Microtubules
    Plastid
    Chromoplast
    Leucoplast
    Proteasome
    Endosome
    Contractile vacuole
    Glyoxysome
    Spindle
    Kinetochore
  `),
  sheet('s-dollar-country', 'geography', 'Name a country whose currency is called a dollar', 'Dollar countries', `
    United States|USA;US;America
    Canada
    Australia
    New Zealand
    Singapore
    Jamaica
    Hong Kong
    Taiwan
    Bahamas
    Barbados
    Belize
    Fiji
    Guyana
    Liberia
    Namibia
    Suriname
    Brunei
    Trinidad and Tobago|Trinidad
    Zimbabwe
    Solomon Islands
    Antigua and Barbuda|Antigua
    Dominica
    Grenada
    Saint Lucia|St Lucia
    Saint Kitts and Nevis|St Kitts
    Saint Vincent and the Grenadines|St Vincent
    Ecuador
    El Salvador
    Panama
    Timor-Leste|East Timor
    Marshall Islands
    Micronesia
    Palau
    Kiribati
    Tuvalu
    Nauru
    Bermuda
  `),
  sheet('s-flying-animal', 'nature', 'Name an animal that can fly under its own power', 'Fliers', `
    Bird
    Bat
    Eagle
    Butterfly
    Bee
    Pigeon
    Owl
    Seagull|Gull
    Fly|Housefly
    Dragonfly
    Hummingbird
    Mosquito
    Moth
    Wasp
    Parrot
    Crow
    Sparrow
    Robin
    Swan
    Duck
    Goose
    Hawk
    Falcon
    Albatross
    Swallow
    Swift
    Ladybird|Ladybug
    Beetle
    Locust
    Hornet
    Cicada
    Firefly
    Pterodactyl|Pterosaur
    Flying fox|Fruit bat
    Heron
    Stork
    Pelican
    Flamingo
    Kingfisher
    Woodpecker
    Magpie
    Starling
    Blackbird
    Wren
    Vulture
    Condor
    Kite
    Puffin
    Mayfly
    Damselfly
    Flying ant
    Crane fly
    Lacewing
    Grasshopper
    Cockroach
  `),
  sheet('s-noble-gas', 'science', 'Name a noble gas', 'Noble gases', `
    Helium
    Neon
    Argon
    Krypton
    Xenon
    Radon
    Oganesson
  `),
  sheet('s-arctic-animal', 'nature', 'Name an animal that lives in the Arctic', 'Arctic animals', `
    Polar bear
    Arctic fox
    Walrus
    Seal
    Reindeer|Caribou
    Snowy owl
    Narwhal
    Beluga|Beluga whale
    Arctic hare
    Musk ox
    Orca|Killer whale
    Arctic wolf|Wolf
    Lemming
    Puffin
    Arctic tern
    Ringed seal
    Bearded seal
    Harp seal
    Hooded seal
    Bowhead whale
    Wolverine
    Ermine|Stoat
    Ptarmigan
    Snow goose
    Eider|Eider duck
    Gyrfalcon
    Arctic char
    Greenland shark
    Arctic cod
    Snow bunting
    Raven
    Little auk|Dovekie
    Guillemot|Murre
    Kittiwake
    Ivory gull
    Brent goose
    Grizzly bear
    Moose
    Dall sheep
    Arctic ground squirrel
    Collared lemming
    Krill
    Arctic jellyfish|Lion's mane jellyfish
    Arctic woolly bear moth
    Mosquito
  `),
  sheet('s-latin-script-language', 'general', 'Name a language written in the Latin alphabet', 'Latin-script languages', `
    English
    French
    Spanish
    German
    Italian
    Portuguese
    Dutch
    Polish
    Swedish
    Welsh
    Irish|Irish Gaelic
    Scottish Gaelic|Gaelic
    Norwegian
    Danish
    Finnish
    Turkish
    Czech
    Latin
    Vietnamese
    Indonesian
    Malay
    Swahili
    Hungarian
    Romanian
    Croatian
    Slovak
    Slovenian
    Icelandic
    Estonian
    Latvian
    Lithuanian
    Albanian
    Maltese
    Basque
    Catalan
    Galician
    Filipino|Tagalog
    Esperanto
    Hawaiian
    Maori|Māori
    Samoan
    Tongan
    Fijian
    Hausa
    Yoruba
    Igbo
    Zulu
    Xhosa
    Afrikaans
    Somali
    Uzbek
    Azerbaijani|Azeri
    Turkmen
    Cornish
    Manx
    Breton
    Luxembourgish
    Faroese
    Frisian
    Romansh
    Sardinian
    Corsican
    Occitan
    Bosnian
    Montenegrin
    Serbian
    Quechua
    Guarani
    Aymara
    Nahuatl
    Haitian Creole
    Papiamento
    Kinyarwanda
    Kirundi
    Shona
    Chichewa|Nyanja
    Malagasy
    Wolof
    Fula|Fulani
    Lingala
    Oromo
    Sotho|Sesotho
    Tswana|Setswana
    Javanese
    Sundanese
    Cebuano
    Tok Pisin
    Bislama
    Greenlandic|Kalaallisut
    Sami|Sámi
    Kurmanji
  `),
  sheet('s-jupiter-moon', 'science', 'Name a moon of Jupiter', 'Moons of Jupiter', `
    Europa
    Io
    Ganymede
    Callisto
    Amalthea
    Himalia
    Thebe
    Elara
    Metis
    Adrastea
    Pasiphae
    Sinope
    Lysithea
    Carme
    Ananke
    Leda
    Callirrhoe
    Themisto
    Megaclite
    Taygete
    Chaldene
    Harpalyke
    Kalyke
    Iocaste
    Erinome
    Isonoe
    Praxidike
    Autonoe
    Thyone
    Hermippe
    Aitne
    Eurydome
    Euanthe
    Euporie
    Orthosie
    Sponde
    Kale
    Pasithee
    Hegemone
    Mneme
    Aoede
    Thelxinoe
    Arche
    Kallichore
    Helike
    Carpo
    Eukelade
    Cyllene
    Kore
    Herse
    Dia
    Eupheme
    Philophrosyne
    Ersa
    Pandia
    Valetudo
  `),
];
