import type { PromptSeed } from '@/lib/types';
import { ranked } from '../atlas';

/**
 * Saturday 24 October 2026, prompts set by hand. Ordered from the answer most people give to the most unheard-of;
 * generous on purpose, rarity scoring does the work. (The European Cup finalists prompt is the library's own,
 * 'ucl-finalist', pinned in the schedule.)
 */
const day = (seed: PromptSeed): PromptSeed => ({ ...seed, editorial: true });

export const DAY_2026_10_24: PromptSeed[] = [
  day(ranked('friends-character', 'screen', 'Name a character from the US sitcom Friends', 'Friends characters', `
    Joey Tribbiani|Joey
    Rachel Green|Rachel;Rach
    Ross Geller|Ross
    Chandler Bing|Chandler
    Monica Geller|Monica;Mon
    Phoebe Buffay|Phoebe;Pheebs
    Gunther
    Janice Litman Goralnik|Janice
    Mike Hannigan|Mike
    Richard Burke|Richard;Dr Richard Burke
    Ben Geller|Ben
    Emma Geller-Green|Emma
    Carol Willick|Carol
    Susan Bunch|Susan
    Marcel|Marcel the monkey
    Ursula Buffay|Ursula
    Jack Geller|Jack
    Judy Geller|Judy
    Estelle Leonard|Estelle
    Emily Waltham|Emily
    Mr. Heckles|Heckles
    Ugly Naked Guy
    Frank Buffay Jr.|Frank Jr;Frank Buffay
    Alice Knight|Alice
    Charlie Wheeler|Charlie
    Tag Jones|Tag
    Paolo
    Barry Farber|Barry
    Mindy Hunter|Mindy
    Janine Lecroix|Janine
    Kathy
    Julie
    Pete Becker|Pete
    David|David the scientist
    Mr. Treeger|Treeger
    Eddie Menuek|Eddie
    Amy Green|Amy
    Jill Green|Jill
    Sandra Green
    Leonard Green|Dr Green
    Charles Bing|Helena Handbasket
    Nora Tyler Bing|Nora Bing
    Joey Tribbiani Sr.|Joe Tribbiani
    Gloria Tribbiani
    Joshua Burgin|Joshua
    Mark Robinson|Mark
    Paul Stevens|Paul
    Elizabeth Stevens|Elizabeth
    Gavin Mitchell|Gavin
    Phoebe Abbott|Phoebe Sr.
    Frank Buffay Sr.
    Fun Bobby
    Gary|Gary the cop
    Duncan
    Will Colbert|Will
    Erika Ford|Erika
    Bonnie
    Tim Burke|Timothy
    Dr. Drake Ramoray|Drake Ramoray
    Hugsy
    The chick and the duck|Chick;Duck
    Kip
    Terry|Mr Terry
    Mona
    Joanna
    Sophie
    Mr. Zelner|Zelner
    Ryan
    Roger
    Ethan
    Danny
    Eric
    Benjamin Hobart|Ben Hobart
    Kash Ford|Kash
    Leslie
    Frances|Phoebe's grandmother
    Mary Angela Tribbiani|Mary Angela
    Gina Tribbiani|Gina
    Dina Tribbiani|Dina
    Tina Tribbiani|Tina
    Cookie Tribbiani|Cookie
    Veronica Tribbiani
    Jake
    Rhonda
    Lowell
    Jasmine
    Precious
    Aurora
    Dr. Mitchell
    Professor Sherman
    Victor
    Steve|Stoned guy
    Lorraine
    Jessica Lockhart
    Dr. Long|Dr Oberman
    Noah
    Kristen Leigh|Kristen
    Molly
    Bobby Corso
    Sergei
    Dick Clark
  `)),

  day(ranked('music-streaming', 'general', 'Name a music streaming platform (Spotify etc.)', 'Music streaming', `
    Spotify
    Apple Music|iTunes
    Amazon Music|Amazon Music Unlimited;Amazon Prime Music
    YouTube Music|YouTube
    SoundCloud
    Tidal
    Deezer
    Pandora
    Napster|Rhapsody
    Google Play Music
    iHeartRadio
    Audiomack
    Qobuz
    Bandcamp
    TuneIn
    Shazam
    Last.fm|Last fm
    Mixcloud
    BBC Sounds
    SiriusXM|Sirius XM
    JioSaavn|Saavn
    Gaana
    Anghami
    Boomplay
    NetEase Cloud Music
    QQ Music
    Kugou
    Kuwo
    Melon
    Genie Music
    Bugs
    FLO
    Yandex Music
    VK Music
    Zvuk
    JOOX
    LINE Music
    AWA
    KKBOX
    Resso
    TikTok Music
    Groove Music|Xbox Music
    Rdio
    Grooveshark
    Beats Music
    MySpace
    Slacker Radio
    LiveOne|LiveXLive
    Idagio
    Apple Music Classical
    Primephonic
    Nugs.net|Nugs
    Beatport Streaming|Beatport
    Jamendo
    Audius
    Trebel
    Sonos Radio
    Mixcloud Select
    Absolute Radio
    Global Player
    Radioplayer
    Dash Radio
    Calm Radio
    Accuradio
    Plex|Plexamp
    Winamp
  `)),

  day(ranked('engineering-discipline', 'science', 'Name an engineering discipline (Mechanical etc.)', 'Engineering disciplines', `
    Mechanical engineering|Mechanical;Mechanic;Mechanics
    Civil engineering|Civil
    Electrical engineering|Electrical
    Chemical engineering|Chemical
    Software engineering|Software
    Aerospace engineering|Aerospace
    Electronic engineering|Electronics;Electronic
    Structural engineering|Structural
    Computer engineering|Computer
    Biomedical engineering|Biomedical
    Aeronautical engineering|Aeronautical
    Environmental engineering|Environmental
    Nuclear engineering|Nuclear
    Automotive engineering|Automotive
    Marine engineering|Marine
    Industrial engineering|Industrial
    Manufacturing engineering|Manufacturing
    Materials engineering|Materials;Materials science
    Petroleum engineering|Petroleum
    Mining engineering|Mining
    Agricultural engineering|Agricultural
    Mechatronics
    Robotics
    Systems engineering|Systems
    Geotechnical engineering|Geotechnical
    Transport engineering|Transportation engineering
    Control engineering|Control systems
    Telecommunications engineering|Telecommunications;Telecoms
    Building services engineering|Building services
    Naval architecture|Naval engineering
    Process engineering|Process
    Production engineering|Production
    Electrical and electronic engineering|EEE
    Network engineering|Network
    Data engineering
    Civil and structural engineering
    Fire engineering|Fire safety engineering
    Acoustic engineering|Acoustics
    Audio engineering|Sound engineering
    Optical engineering|Optics
    Geological engineering|Geological
    Metallurgical engineering|Metallurgy
    Ceramic engineering|Ceramics
    Polymer engineering|Plastics engineering
    Textile engineering
    Biochemical engineering
    Bioengineering|Biological engineering
    Genetic engineering
    Tissue engineering
    Food engineering
    Water engineering|Water resources engineering
    Coastal engineering
    Hydraulic engineering
    Highway engineering
    Railway engineering
    Traffic engineering
    Municipal engineering
    Military engineering
    Ocean engineering
    Offshore engineering
    Energy engineering
    Power engineering
    Renewable energy engineering
    Instrumentation engineering|Instrumentation
    Reliability engineering
    Safety engineering
    Quality engineering
    Cost engineering
    Lighting engineering
    Packaging engineering
    Paper engineering
    Surface engineering
    Nanoengineering|Nanotechnology
    Photonics engineering|Photonics
    Microelectronics
    RF engineering|Radio frequency engineering
    Avionics
    Astronautical engineering|Astronautics
    Space engineering
    Rocket engineering|Rocketry
    Architectural engineering
    Facade engineering
    Tunnel engineering
    Bridge engineering
    Earthquake engineering
    Wind engineering
    Corrosion engineering
    Welding engineering
    Tool engineering
    Maintenance engineering
    Plant engineering
    Field engineering
    Sales engineering
    Security engineering
    DevOps
    Site reliability engineering|SRE
    Reverse engineering
    Financial engineering
    Prompt engineering
    Social engineering
    Value engineering
    Explosives engineering|Ordnance engineering
    Agricultural and biosystems engineering|Biosystems engineering
    Pharmaceutical engineering
    Sustainable engineering
    Mineral engineering|Mineral processing
  `)),

  day(ranked('french-second-empire-colony', 'history', 'Name a territory of France’s Second Colonial Empire (1852–1870)', 'French colonies under Napoleon III', `
    Algeria
    Senegal
    Vietnam|Cochinchina;Cochin China;Saigon
    Cambodia
    Martinique
    Guadeloupe
    French Guiana|Guiana;Cayenne
    New Caledonia
    Tahiti|French Polynesia;Society Islands
    Réunion|Reunion;Île Bourbon
    Mexico|Second Mexican Empire
    Madagascar|Nosy Be;Sainte-Marie;Île Sainte-Marie
    Djibouti|Obock
    Gabon|Libreville
    Ivory Coast|Côte d'Ivoire;Grand-Bassam;Assinie
    Mayotte
    Comoros
    Saint-Pierre and Miquelon|Saint Pierre and Miquelon
    French India|India;Pondicherry;Puducherry
    Karikal|Karaikal
    Chandernagore|Chandannagar
    Mahé|Mahe
    Yanam
    Marquesas Islands|Marquesas
    Tuamotu
    Gambier Islands
    Austral Islands
    Clipperton Island|Clipperton
    Saint Barthélemy|Saint Barthelemy;St Barts
    Saint Martin
    Guinea|Boké;Boke
    Benin|Porto-Novo;Dahomey
    Lebanon|Mount Lebanon
    Kerguelen Islands|Kerguelen
    Amsterdam Island
    Saint-Paul Island
    Loyalty Islands
    Isle of Pines
    Wallis and Futuna
    Mauritania
  `)),

  day(ranked('element-in-sun', 'science', 'Name a chemical element found in the Sun’s atmosphere', 'Elements in the Sun’s atmosphere', `
    Hydrogen
    Helium
    Oxygen
    Carbon
    Iron
    Nitrogen
    Neon
    Magnesium
    Silicon
    Sulfur|Sulphur
    Calcium
    Sodium
    Nickel
    Aluminium|Aluminum
    Argon
    Chromium
    Manganese
    Potassium
    Titanium
    Cobalt
    Phosphorus
    Chlorine
    Lithium
    Copper
    Zinc
    Gold
    Silver
    Lead
    Platinum
    Tin
    Barium
    Strontium
    Vanadium
    Scandium
    Fluorine
    Beryllium
    Boron
    Gallium
    Germanium
    Rubidium
    Yttrium
    Zirconium
    Niobium
    Molybdenum
    Ruthenium
    Rhodium
    Palladium
    Cadmium
    Indium
    Antimony
    Lanthanum
    Cerium
    Praseodymium
    Neodymium
    Samarium
    Europium
    Gadolinium
    Terbium
    Dysprosium
    Holmium
    Erbium
    Thulium
    Ytterbium
    Lutetium
    Hafnium
    Tungsten
    Osmium
    Iridium
    Thallium
    Thorium
  `)),

  day(ranked('game-20k-players', 'screen', 'Name a video game averaging over 20,000 concurrent players (Oct 2026)', 'Games with 20,000+ players online', `
    Fortnite
    Minecraft
    Roblox
    Call of Duty|Warzone;Call of Duty: Warzone;Black Ops
    League of Legends|LoL
    Counter-Strike 2|CS2;Counter-Strike;CS:GO;CSGO
    Grand Theft Auto V|GTA V;GTA 5;GTA Online;Grand Theft Auto
    Valorant
    Dota 2|Dota
    Apex Legends|Apex
    PUBG|PUBG: Battlegrounds;PlayerUnknown's Battlegrounds
    Rocket League
    EA Sports FC 26|EA FC 26;EA FC;FIFA;FC 26
    Overwatch 2|Overwatch
    Rainbow Six Siege|Rainbow Six;R6
    Genshin Impact
    World of Warcraft|WoW
    Destiny 2|Destiny
    Marvel Rivals
    Rust
    The Sims 4|Sims 4;The Sims
    Elden Ring
    Red Dead Redemption 2|RDR2;Red Dead Redemption;Red Dead Online
    Cyberpunk 2077|Cyberpunk
    Skyrim|The Elder Scrolls V: Skyrim
    Stardew Valley
    Terraria
    Baldur's Gate 3|BG3
    Helldivers 2|Helldivers
    Team Fortress 2|TF2
    Dead by Daylight
    Left 4 Dead 2|Left 4 Dead
    The Witcher 3|Witcher 3;The Witcher 3: Wild Hunt
    Palworld
    Valheim
    Warframe
    PUBG Mobile
    Free Fire|Garena Free Fire
    Clash Royale
    Clash of Clans
    Brawl Stars
    Pokémon GO|Pokemon Go
    Mobile Legends|Mobile Legends: Bang Bang
    Honor of Kings
    Call of Duty: Mobile|COD Mobile
    Old School RuneScape|OSRS;RuneScape
    Final Fantasy XIV|FF14;FFXIV
    Escape from Tarkov|Tarkov
    World of Tanks
    Hearthstone
    EVE Online|Eve
    ARC Raiders
    Slay the Spire 2|Slay the Spire
    VRChat
    Project Zomboid
    Delta Force
    Geometry Dash
    The Binding of Isaac|Binding of Isaac;The Binding of Isaac: Rebirth
    War Thunder
    Total War: Warhammer III|Total War Warhammer 3;Total War
    RimWorld
    DayZ
    Civilization VI|Civ 6;Civilization
    Hearts of Iron IV|Hearts of Iron;HOI4
    Limbus Company
    Garry's Mod|Gmod
    Don't Starve Together|Don't Starve
    7 Days to Die
    Mount & Blade II: Bannerlord|Bannerlord;Mount and Blade
    The Outlast Trials|Outlast Trials
    Farming Simulator 25|Farming Simulator
    Euro Truck Simulator 2|Euro Truck Simulator
    Diablo IV|Diablo 4;Diablo
    Path of Exile 2|Path of Exile
    Honkai: Star Rail|Honkai Star Rail
    Zenless Zone Zero
    Wuthering Waves
  `)),
];
