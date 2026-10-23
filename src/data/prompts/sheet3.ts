import type { PromptSeed } from '@/lib/types';
import { sheet } from './sheet1';

/** Factual questions from the 2,000-question sheet, part 3. */

/**
 * Every country's flag, by the colours it shows (including its emblem): R red, W white, B blue, G green,
 * Y yellow or gold, K black, O orange. In rough order of how well known the flag is.
 */
export const FLAGS: Array<[string, string]> = [
  ['United States|USA;US;America', 'RWB'], ['United Kingdom|UK;Britain;Great Britain', 'RWB'], ['France', 'BWR'], ['Germany', 'KRY'],
  ['Italy', 'GWR'], ['Spain', 'RY'], ['Japan', 'WR'], ['China', 'RY'], ['Canada', 'RW'], ['Brazil', 'GYBW'], ['Australia', 'BWR'],
  ['Ireland', 'GWO'], ['Mexico', 'GWR'], ['India', 'OWGB'], ['Russia', 'WBR'], ['Greece', 'BW'], ['Sweden', 'BY'], ['Ukraine', 'BY'],
  ['Netherlands|Holland', 'RWB'], ['Switzerland', 'RW'], ['Portugal', 'GRYBW'], ['Argentina', 'BWY'], ['New Zealand', 'BRW'],
  ['South Africa', 'RGBYKW'], ['Jamaica', 'GYK'], ['Belgium', 'KYR'], ['Norway', 'RWB'], ['Denmark', 'RW'], ['Finland', 'WB'],
  ['Turkey|Türkiye', 'RW'], ['Israel', 'BW'], ['Egypt', 'RWKY'], ['South Korea', 'WRBK'], ['Poland', 'WR'], ['Austria', 'RW'],
  ['Iceland', 'BWR'], ['Nigeria', 'GW'], ['Kenya', 'KRGW'], ['Ghana', 'RYGK'], ['Colombia', 'YBR'], ['Chile', 'WBR'],
  ['Peru', 'RW'], ['Cuba', 'BWR'], ['Pakistan', 'GW'], ['Saudi Arabia', 'GW'], ['Vietnam', 'RY'], ['Thailand', 'RWB'], ['Indonesia', 'RW'],
  ['Philippines', 'BRWY'], ['Malaysia', 'RWBY'], ['Singapore', 'RW'], ['North Korea', 'BRW'], ['Hungary', 'RWG'], ['Czech Republic|Czechia', 'WRB'],
  ['Croatia', 'RWB'], ['Romania', 'BYR'], ['Bulgaria', 'WGR'], ['Serbia', 'RBWY'], ['Lithuania', 'YGR'], ['Latvia', 'RW'], ['Estonia', 'BKW'],
  ['Slovakia', 'WBR'], ['Slovenia', 'WBRY'], ['Bosnia and Herzegovina|Bosnia', 'BYW'], ['Albania', 'RK'], ['North Macedonia|Macedonia', 'RY'],
  ['Montenegro', 'RY'], ['Kosovo', 'BYW'], ['Moldova', 'BYR'], ['Belarus', 'RGW'], ['Luxembourg', 'RWB'], ['Liechtenstein', 'BRY'],
  ['Monaco', 'RW'], ['Andorra', 'BYR'], ['San Marino', 'WB'], ['Vatican City|Vatican', 'YWR'], ['Malta', 'WR'], ['Cyprus', 'WOG'],
  ['Georgia', 'WR'], ['Armenia', 'RBO'], ['Azerbaijan', 'BRGW'], ['Kazakhstan', 'BY'], ['Uzbekistan', 'BWGR'], ['Turkmenistan', 'GWR'],
  ['Kyrgyzstan', 'RY'], ['Tajikistan', 'RWGY'], ['Afghanistan', 'KRGW'], ['Iran', 'GWR'], ['Iraq', 'RWKG'], ['Syria', 'GWKR'],
  ['Lebanon', 'RWG'], ['Jordan', 'KWGR'], ['Palestine', 'KWGR'], ['Kuwait', 'GWRK'], ['Qatar', 'RW'], ['Bahrain', 'RW'],
  ['United Arab Emirates|UAE', 'RGWK'], ['Oman', 'RWG'], ['Yemen', 'RWK'], ['Bangladesh', 'GR'], ['Sri Lanka', 'YOGR'], ['Nepal', 'RBW'],
  ['Bhutan', 'YOW'], ['Myanmar|Burma', 'YGRW'], ['Cambodia', 'BRW'], ['Laos', 'RBW'], ['Mongolia', 'RBY'], ['Taiwan', 'RBW'],
  ['Brunei', 'YWKR'], ['Timor-Leste|East Timor', 'RYKW'], ['Maldives', 'RGW'], ['Morocco', 'RG'], ['Algeria', 'GWR'], ['Tunisia', 'RW'],
  ['Libya', 'RKGW'], ['Sudan', 'RWKG'], ['South Sudan', 'KRGWBY'], ['Ethiopia', 'GYRB'], ['Eritrea', 'GRBY'], ['Djibouti', 'BGWR'],
  ['Somalia', 'BW'], ['Uganda', 'KYRW'], ['Tanzania', 'GYKB'], ['Rwanda', 'BYG'], ['Burundi', 'RGW'], ['DR Congo|Democratic Republic of the Congo;DRC', 'BYR'],
  ['Republic of the Congo|Congo', 'GYR'], ['Gabon', 'GYB'], ['Cameroon', 'GRY'], ['Central African Republic', 'BWGYR'], ['Chad', 'BYR'],
  ['Niger', 'OWG'], ['Mali', 'GYR'], ['Burkina Faso', 'RGY'], ['Senegal', 'GYR'], ['Gambia', 'RBGW'], ['Guinea', 'RYG'], ['Guinea-Bissau', 'RYGK'],
  ['Sierra Leone', 'GWB'], ['Liberia', 'RWB'], ['Ivory Coast|Côte d’Ivoire;Cote d’Ivoire', 'OWG'], ['Togo', 'GYRW'], ['Benin', 'GYR'],
  ['Mauritania', 'GYR'], ['Cape Verde|Cabo Verde', 'BWRY'], ['Equatorial Guinea', 'GWRBY'], ['São Tomé and Príncipe|Sao Tome and Principe', 'GYRK'],
  ['Angola', 'RKY'], ['Zambia', 'GROK'], ['Zimbabwe', 'GYRKW'], ['Botswana', 'BWK'], ['Namibia', 'BRGWY'], ['Mozambique', 'GKYWR'],
  ['Malawi', 'KRG'], ['Madagascar', 'WRG'], ['Mauritius', 'RBYG'], ['Seychelles', 'BYRWG'], ['Comoros', 'YWRBG'], ['Lesotho', 'BWGK'],
  ['Eswatini|Swaziland', 'BYRKW'], ['Fiji', 'BWRYG'], ['Papua New Guinea', 'RKYW'], ['Samoa', 'RBW'], ['Tonga', 'RW'], ['Vanuatu', 'RGKY'],
  ['Solomon Islands', 'BGYW'], ['Kiribati', 'RYBW'], ['Tuvalu', 'BRWY'], ['Nauru', 'BYW'], ['Palau', 'BY'], ['Marshall Islands', 'BOW'],
  ['Micronesia', 'BW'], ['Bahamas', 'BYK'], ['Barbados', 'BYK'], ['Trinidad and Tobago|Trinidad', 'RWK'], ['Haiti', 'BRWGY'],
  ['Dominican Republic', 'BRWG'], ['Dominica', 'GYKWR'], ['Grenada', 'RYG'], ['Saint Lucia|St Lucia', 'BYKW'], ['Saint Vincent and the Grenadines|St Vincent', 'BYG'],
  ['Saint Kitts and Nevis|St Kitts', 'GRKYW'], ['Antigua and Barbuda|Antigua', 'KBWRY'], ['Belize', 'BRWG'], ['Guatemala', 'BWG'], ['Honduras', 'BW'],
  ['El Salvador', 'BWG'], ['Nicaragua', 'BW'], ['Costa Rica', 'BWR'], ['Panama', 'WRB'], ['Venezuela', 'YBRW'], ['Ecuador', 'YBR'],
  ['Bolivia', 'RYG'], ['Paraguay', 'RWB'], ['Uruguay', 'WBY'], ['Guyana', 'GYRKW'], ['Suriname', 'GWRY'],
];
const flagsWith = (c: string) =>
  FLAGS.filter(([, cs]) => cs.includes(c)).map(([n]) => n).join('\n');

export const SHEET3: PromptSeed[] = [
  sheet('s-flag-blue', 'geography', 'Name a country whose national flag has blue in it', 'Flags with blue', flagsWith('B')),
  sheet('s-flag-red', 'geography', 'Name a country whose national flag has red in it', 'Flags with red', flagsWith('R')),
  sheet('s-flag-green', 'geography', 'Name a country whose national flag has green in it', 'Flags with green', flagsWith('G')),
  sheet('s-flag-yellow', 'geography', 'Name a country whose national flag has yellow or gold in it', 'Flags with yellow', flagsWith('Y')),
  sheet('s-flag-crescent', 'geography', 'Name a country whose national flag has a crescent', 'Flags with a crescent', `
    Turkey|Türkiye
    Pakistan
    Algeria
    Tunisia
    Malaysia
    Singapore
    Libya
    Azerbaijan
    Uzbekistan
    Turkmenistan
    Mauritania
    Maldives
    Comoros
    Nepal
    Brunei
  `),
  sheet('s-flag-sun', 'geography', 'Name a country whose national flag has a sun', 'Flags with a sun', `
    Japan
    Argentina
    Uruguay
    Kazakhstan
    Philippines
    Bangladesh
    Taiwan
    Kyrgyzstan
    Malawi
    Rwanda
    Namibia
    Nepal
    North Macedonia|Macedonia
    Antigua and Barbuda|Antigua
    Kiribati
    Niger
    Ecuador
  `),
  sheet('s-atlantic-coast', 'geography', 'Name a country with an Atlantic Ocean coastline', 'Atlantic coastlines', `
    United States|USA;America;US
    United Kingdom|UK;Britain
    Ireland
    France
    Spain
    Portugal
    Brazil
    Canada
    Argentina
    Morocco
    Iceland
    Norway
    South Africa
    Mexico
    Nigeria
    Ghana
    Senegal
    Namibia
    Angola
    Uruguay
    Cuba
    Bahamas
    Germany
    Netherlands
    Belgium
    Denmark
    Sweden
    Venezuela
    Colombia
    Guyana
    Suriname
    Jamaica
    Haiti
    Dominican Republic
    Ivory Coast|Côte d’Ivoire
    Cameroon
    Gabon
    Liberia
    Sierra Leone
    Guinea
    Guinea-Bissau
    Gambia
    Mauritania
    Western Sahara
    Togo
    Benin
    Equatorial Guinea
    Republic of the Congo|Congo
    DR Congo|Democratic Republic of the Congo
    Cape Verde|Cabo Verde
    São Tomé and Príncipe|Sao Tome and Principe
    Barbados
    Trinidad and Tobago
    Antigua and Barbuda
    Saint Lucia
    Grenada
    Dominica
    Saint Kitts and Nevis
    Saint Vincent and the Grenadines
    Belize
    Guatemala
    Honduras
    Nicaragua
    Costa Rica
    Panama
    Greenland
    Finland
    Estonia
    Latvia
    Lithuania
    Poland
    Russia
  `),
  sheet('s-battle-before-1800', 'history', 'Name a historical battle fought before 1800', 'Battles before 1800', `
    Battle of Hastings|Hastings
    Battle of Agincourt|Agincourt
    Battle of Bosworth|Bosworth;Bosworth Field
    Battle of Thermopylae|Thermopylae
    Battle of Marathon|Marathon
    Battle of Culloden|Culloden
    Battle of Bannockburn|Bannockburn
    Battle of Stirling Bridge|Stirling Bridge
    Battle of Cannae|Cannae
    Battle of the Boyne|Boyne
    Spanish Armada|Defeat of the Spanish Armada;Battle of Gravelines
    Battle of Crécy|Crecy;Crécy
    Battle of Poitiers|Poitiers
    Battle of Tours|Battle of Poitiers (732)
    Battle of Lepanto|Lepanto
    Battle of Naseby|Naseby
    Battle of Marston Moor|Marston Moor
    Battle of Edgehill|Edgehill
    Battle of Flodden|Flodden
    Battle of Towton|Towton
    Battle of Tewkesbury|Tewkesbury
    Battle of Stamford Bridge|Stamford Bridge
    Battle of Bunker Hill|Bunker Hill
    Battle of Lexington and Concord|Lexington and Concord
    Battle of Saratoga|Saratoga
    Battle of Yorktown|Yorktown
    Battle of Trenton|Trenton
    Battle of Quebec|Plains of Abraham
    Battle of Plassey|Plassey
    Battle of Blenheim|Blenheim
    Battle of Salamis|Salamis
    Battle of Gaugamela|Gaugamela
    Battle of Issus|Issus
    Battle of Actium|Actium
    Battle of Alesia|Alesia
    Battle of Zama|Zama
    Battle of Teutoburg Forest|Teutoburg Forest
    Battle of Kadesh|Kadesh
    Battle of Plataea|Plataea
    Battle of Hattin|Hattin
    Battle of Ain Jalut|Ain Jalut
    Battle of Manzikert|Manzikert
    Siege of Constantinople|Fall of Constantinople
    Battle of Mohács|Mohacs
    Battle of Vienna|Siege of Vienna
    Battle of Sekigahara|Sekigahara
    Battle of Panipat|Panipat
    Battle of Talas|Talas
    Battle of Red Cliffs|Red Cliffs
    Battle of Grunwald|Tannenberg (1410)
    Battle of Kosovo|Kosovo Polje
    Battle of White Mountain|White Mountain
    Battle of Lützen|Lutzen
    Battle of Breitenfeld|Breitenfeld
    Battle of Rocroi|Rocroi
    Battle of Poltava|Poltava
    Battle of Fontenoy|Fontenoy
    Battle of Leuthen|Leuthen
    Battle of Rossbach|Rossbach
    Battle of Minden|Minden
    Battle of Quiberon Bay|Quiberon Bay
    Battle of the Nile|Battle of Aboukir Bay
    Battle of Valmy|Valmy
    Battle of the Pyramids|Pyramids
    Battle of Long Island
    Battle of Lewes|Lewes
    Battle of Evesham|Evesham
    Battle of Falkirk|Falkirk
    Battle of Otterburn|Otterburn
    Battle of Shrewsbury|Shrewsbury
    Battle of Barnet|Barnet
    Battle of St Albans|St Albans
    Battle of Sedgemoor|Sedgemoor
    Battle of Killiecrankie|Killiecrankie
    Battle of Prestonpans|Prestonpans
    Battle of Maldon|Maldon
    Battle of Brunanburh|Brunanburh
    Battle of Edington|Edington
    Battle of Clontarf|Clontarf
    Battle of Courtrai|Golden Spurs
    Battle of Castillon|Castillon
    Battle of Orléans|Siege of Orleans
    Battle of Las Navas de Tolosa|Las Navas de Tolosa
    Battle of Covadonga|Covadonga
    Battle of Roncevaux Pass|Roncevaux
    Battle of Lechfeld|Lechfeld
    Battle of Legnano|Legnano
    Battle of Fulford
  `),
  sheet('s-bacterial-disease', 'science', 'Name a disease caused by bacteria', 'Bacterial diseases', `
    Tuberculosis|TB
    Cholera
    Food poisoning|Salmonella;Salmonellosis
    Tetanus|Lockjaw
    Plague|Bubonic plague;Black Death
    Meningitis|Bacterial meningitis
    Pneumonia|Bacterial pneumonia
    Whooping cough|Pertussis
    Typhoid|Typhoid fever
    Lyme disease
    Leprosy
    Diphtheria
    Syphilis
    Gonorrhoea|Gonorrhea
    Chlamydia
    Strep throat|Tonsillitis
    Scarlet fever
    Botulism
    Anthrax
    E. coli|E coli infection
    MRSA
    Impetigo
    Legionnaires' disease|Legionnaires
    Listeria|Listeriosis
    Sepsis|Septicaemia
    Urinary tract infection|UTI;Cystitis
    Cellulitis
    Typhus
    Dysentery
    Campylobacter
    C. diff|C difficile
    Brucellosis
    Q fever
    Leptospirosis|Weil's disease
    Tularaemia|Tularemia
    Rheumatic fever
    Peptic ulcer|Stomach ulcer;H. pylori
    Acne
    Gum disease|Periodontitis
    Tooth decay
    Trachoma
    Yaws
    Bacterial vaginosis
    Necrotising fasciitis|Flesh-eating disease
    Toxic shock syndrome
    Glanders
    Melioidosis
    Cat scratch disease
    Rocky Mountain spotted fever
    Psittacosis|Parrot fever
    Buruli ulcer
    Ear infection|Otitis media
    Conjunctivitis|Pink eye
    Boils|Boil
  `),
  sheet('s-rainforest-animal', 'nature', 'Name an animal found in a tropical rainforest', 'Rainforest animals', `
    Jaguar
    Monkey
    Sloth
    Toucan
    Parrot
    Gorilla
    Orangutan
    Chimpanzee
    Anaconda
    Poison dart frog|Poison frog
    Tree frog|Red-eyed tree frog
    Macaw
    Tiger
    Leopard
    Python
    Boa constrictor|Boa
    Spider monkey
    Howler monkey
    Capuchin monkey|Capuchin
    Tapir
    Capybara
    Okapi
    Gibbon
    Lemur
    Chameleon
    Gecko
    Iguana
    Crocodile
    Caiman
    Piranha
    Harpy eagle
    Hummingbird
    Bird of paradise
    Hornbill
    Cassowary
    Elephant|Forest elephant;Asian elephant
    Rhino|Sumatran rhinoceros
    Pangolin
    Bonobo
    Tarsier
    Slow loris
    Sun bear
    Clouded leopard
    Ocelot
    Margay
    Kinkajou
    Coati
    Agouti
    Peccary
    Armadillo
    Anteater
    Leafcutter ant|Ant
    Bullet ant
    Army ant
    Morpho butterfly|Butterfly
    Tarantula
    Mosquito
    Vampire bat|Bat
    Flying fox|Fruit bat
    Electric eel
    Arapaima
    Tree kangaroo
    Quetzal
    Cock-of-the-rock
    Potoo
    Hoatzin
    Proboscis monkey
    Mandrill
    Colobus monkey
    Tamarin
    Marmoset
    Bushmaster
    Fer-de-lance
    Green mamba
    King cobra
    Komodo dragon
    Glass frog
    Bongo
  `),
  sheet('s-pacific-coast', 'geography', 'Name a country with a Pacific Ocean coastline', 'Pacific coastlines', `
    United States|USA;America;US
    Japan
    China
    Australia
    New Zealand
    Canada
    Mexico
    Chile
    Peru
    Russia
    Philippines
    Indonesia
    South Korea
    North Korea
    Vietnam
    Colombia
    Ecuador
    Fiji
    Papua New Guinea
    Malaysia
    Taiwan
    Thailand
    Cambodia
    Singapore
    Brunei
    Timor-Leste|East Timor
    Panama
    Costa Rica
    Nicaragua
    Honduras
    El Salvador
    Guatemala
    Samoa
    Tonga
    Vanuatu
    Solomon Islands
    Kiribati
    Tuvalu
    Nauru
    Palau
    Marshall Islands
    Micronesia
    France|French Polynesia;New Caledonia
  `),
  sheet('s-carbon-material', 'science', 'Name a material made mostly of carbon', 'Carbon materials', `
    Diamond
    Graphite|Pencil lead
    Coal
    Charcoal
    Graphene
    Carbon fibre|Carbon fiber
    Soot
    Coke
    Carbon nanotubes|Nanotubes
    Activated charcoal|Activated carbon
    Carbon black
    Fullerene|Buckyball;Buckminsterfullerene
    Anthracite
    Lignite
    Jet
    Glassy carbon
    Lonsdaleite
    Carbon nanofoam
    Graphite fibre
    Carbon aerogel
    Biochar
    Vitreous carbon
    Amorphous carbon
    Diamond-like carbon
    Carbyne
  `),
  sheet('s-metalloid', 'science', 'Name a metalloid', 'Metalloids', `
    Silicon
    Arsenic
    Boron
    Germanium
    Antimony
    Tellurium
    Polonium
    Astatine
    Selenium
  `),
  sheet('s-border-river', 'geography', 'Name a river that crosses or forms an international border', 'Border rivers', `
    Danube
    Rhine
    Nile
    Mekong
    Rio Grande|Río Bravo
    Amazon
    Congo
    Niger
    Zambezi
    Ganges
    Indus
    Tigris
    Euphrates
    Jordan
    Amur
    St Lawrence|Saint Lawrence
    Columbia
    Colorado
    Yukon
    Paraná|Parana
    Uruguay
    Paraguay
    Orinoco
    Brahmaputra
    Salween
    Irrawaddy
    Oder
    Elbe
    Meuse
    Moselle
    Scheldt
    Dniester
    Prut
    Dnieper
    Ural
    Drina
    Sava
    Tisza
    Morava
    Narva
    Neman|Nemunas
    Tornio
    Limpopo
    Orange
    Senegal
    Gambia
    Volta
    Okavango
    Kagera
    Ubangi
    Irtysh
    Syr Darya
    Amu Darya
    Red River
    Yalu
    Tumen
    Pilcomayo
    Putumayo
    Madeira
    Mamoré
    Douro|Duero
    Tagus|Tajo;Tejo
    Minho|Miño
    Guadiana
    Bidasoa
    Inn
    Rhône|Rhone
    Ticino
    Mur
    Drava
    Bug
    Foyle
  `),
  sheet('s-tropic-capricorn', 'geography', 'Name a country crossed by the Tropic of Capricorn', 'Tropic of Capricorn countries', `
    Australia
    Brazil
    South Africa
    Argentina
    Chile
    Madagascar
    Mozambique
    Namibia
    Botswana
    Paraguay
  `),
  sheet('s-web-language', 'science', 'Name a programming language used to build websites', 'Web development languages', `
    JavaScript|JS
    HTML
    CSS
    PHP
    Python
    TypeScript
    Java
    Ruby
    C#|C sharp
    SQL
    Go|Golang
    Kotlin
    Swift
    Rust
    Perl
    Scala
    Elixir
    Dart
    Elm
    WebAssembly|Wasm
    Sass|SCSS
    Less
    CoffeeScript
    ColdFusion
    VBScript
    Clojure|ClojureScript
    Haskell
    F#|F sharp
    Erlang
    Crystal
    Lua
    R
    Groovy
    ActionScript
    JSX
    Svelte
    Hack
    Julia
    PureScript
    ReasonML|Reason
  `),
  sheet('s-textile-plant', 'nature', 'Name a plant grown for fibre to make textiles or rope', 'Fibre plants', `
    Cotton
    Flax|Linen
    Hemp
    Bamboo
    Jute
    Sisal
    Coir|Coconut
    Nettle
    Ramie
    Kenaf
    Abaca|Manila hemp
    Kapok
    Raffia
    Pineapple|Piña
    Banana|Banana fibre
    Agave
    Yucca
    Henequen
    Esparto
    Rattan
    Milkweed
    Soy|Soybean
    Eucalyptus|Lyocell
    Beech|Modal
    Seagrass
    Water hyacinth
    Rush|Rushes
    Sunn hemp
    New Zealand flax|Harakeke
    Lotus|Lotus silk
    Mulberry
  `),
  sheet('s-mineral', 'science', 'Name a mineral', 'Minerals', `
    Quartz
    Diamond
    Salt|Halite;Rock salt
    Gold
    Iron|Iron ore
    Calcite
    Mica
    Feldspar
    Talc
    Gypsum
    Graphite
    Copper
    Silver
    Pyrite|Fool's gold
    Fluorite
    Topaz
    Corundum
    Ruby
    Sapphire
    Emerald
    Beryl
    Garnet
    Amethyst
    Jade|Jadeite;Nephrite
    Opal
    Turquoise
    Malachite
    Azurite
    Hematite|Haematite
    Magnetite
    Galena
    Bauxite
    Olivine|Peridot
    Tourmaline
    Zircon
    Apatite
    Asbestos
    Kaolinite|Kaolin
    Dolomite
    Sulphur|Sulfur
    Cinnabar
    Barite|Baryte
    Obsidian
    Agate
    Onyx
    Jasper
    Chalcedony
    Lapis lazuli
    Moonstone
    Labradorite
    Aquamarine
    Spinel
    Tanzanite
    Platinum
    Uraninite|Pitchblende
    Cassiterite
    Sphalerite
    Chalcopyrite
    Bornite
    Rhodochrosite
    Rose quartz
    Citrine
    Hornblende
    Augite
    Serpentine
    Chlorite
    Muscovite
    Biotite
    Orthoclase
    Plagioclase
    Kyanite
    Staurolite
    Wollastonite
    Celestine
    Selenite
    Borax
    Epsomite
    Trona
    Wulfenite
    Vanadinite
    Smithsonite
    Dioptase
    Benitoite
    Painite
  `),
  sheet('s-southern-hemisphere', 'geography', 'Name a country entirely in the Southern Hemisphere', 'Southern Hemisphere countries', `
    Australia
    New Zealand
    Argentina
    South Africa
    Chile
    Peru
    Bolivia
    Paraguay
    Uruguay
    Madagascar
    Namibia
    Botswana
    Zimbabwe
    Zambia
    Mozambique
    Angola
    Malawi
    Tanzania
    Lesotho
    Eswatini|Swaziland
    Mauritius
    Seychelles
    Comoros
    Rwanda
    Burundi
    Fiji
    Samoa
    Tonga
    Vanuatu
    Solomon Islands
    Papua New Guinea
    Tuvalu
    Nauru
    Timor-Leste|East Timor
  `),
  sheet('s-hibernate', 'nature', 'Name an animal that hibernates', 'Hibernating animals', `
    Bear|Brown bear;Black bear;Grizzly bear
    Hedgehog
    Bat
    Dormouse
    Tortoise
    Squirrel|Ground squirrel
    Groundhog|Woodchuck
    Marmot
    Chipmunk
    Snake
    Frog
    Toad
    Badger
    Bumblebee|Bee
    Ladybird|Ladybug
    Butterfly
    Snail
    Lizard
    Newt
    Prairie dog
    Skunk
    Polar bear
    Echidna
    Fat-tailed dwarf lemur|Lemur
    Poorwill|Common poorwill
    Turtle
    Box turtle
    Garter snake
    Rattlesnake
    Wood frog
    Hamster
    Jumping mouse
    Pygmy possum
    Arctic ground squirrel
    Alpine marmot
    Edible dormouse
    Hazel dormouse
    Little brown bat
    Horseshoe bat
    Pipistrelle
    Wasp
    Mosquito
    Slug
    Salamander
    Carp
  `),
  sheet('s-archaeological-site', 'history', 'Name a famous archaeological site', 'Archaeological sites', `
    Pompeii
    Stonehenge
    Machu Picchu
    Pyramids of Giza|Giza;Pyramids
    Valley of the Kings|Tutankhamun's tomb
    Terracotta Army|Terracotta Warriors
    Petra
    Troy
    Chichen Itza|Chichén Itzá
    Angkor Wat|Angkor
    Acropolis|Parthenon
    Colosseum|Roman Forum
    Knossos
    Sutton Hoo
    Herculaneum
    Teotihuacan
    Easter Island|Rapa Nui
    Skara Brae
    Göbekli Tepe|Gobekli Tepe
    Çatalhöyük|Catalhoyuk
    Jericho
    Ur
    Babylon
    Nineveh
    Persepolis
    Mohenjo-daro|Mohenjo Daro
    Harappa
    Great Zimbabwe
    Mesa Verde
    Tikal
    Palenque
    Nazca Lines|Nazca
    Lascaux|Lascaux caves
    Altamira
    Newgrange
    Avebury
    Hadrian's Wall
    Vindolanda
    Mycenae
    Delphi
    Olympia
    Ephesus
    Carthage
    Leptis Magna
    Palmyra
    Baalbek
    Abu Simbel
    Karnak
    Luxor Temple|Luxor
    Saqqara
    Amarna
    Tanis
    Masada
    Qumran|Dead Sea Scrolls
    Hattusa
    Nimrud
    Uruk
    Sanxingdui
    Anyang|Yinxu
    Mogao Caves
    Ajanta Caves
    Ellora Caves
    Borobudur
    Bagan
    Sigiriya
    Taxila
    Caral
    Chan Chan
    Tiwanaku
    Cahokia
    Chaco Canyon
    L'Anse aux Meadows
    Olduvai Gorge
    Laetoli
    Blombos Cave
    Lalibela
    Aksum
    Meroë|Meroe
    Carnac|Carnac stones
    Maeshowe
    Ring of Brodgar
    Silbury Hill
    Vergina
    Akrotiri
    Paestum
    Ostia|Ostia Antica
    Tarquinia
    Nan Madol
    Ggantija
    Hal Saflieni Hypogeum|Hypogeum
    Lindisfarne
    Jorvik|Coppergate
    Mary Rose
    Mehrgarh
  `),
  sheet('s-ice-sport', 'sport', 'Name a sport played on ice', 'Ice sports', `
    Ice hockey|Hockey
    Figure skating|Ice skating
    Curling
    Speed skating
    Short track|Short-track speed skating
    Bobsleigh|Bobsled
    Luge
    Skeleton
    Ice dancing|Ice dance
    Bandy
    Ringette
    Broomball
    Ice climbing
    Ice racing|Ice speedway
    Ice stock sport|Eisstockschießen
    Ice sailing|Ice yachting
    Ice fishing
    Synchronised skating|Synchronized skating
    Ice cross downhill|Crashed Ice
    Sledge hockey|Para ice hockey
    Wheelchair curling
    Ice swimming
    Ice golf
    Kicksledding
  `),
  sheet('s-invention-pre-1900', 'history', 'Name an invention from before 1900 that is still used today', 'Old inventions still in use', `
    Wheel
    Telephone|Phone
    Light bulb|Lightbulb
    Printing press
    Compass
    Camera
    Bicycle|Bike
    Car|Motor car
    Steam engine
    Telescope
    Microscope
    Paper
    Battery
    Sewing machine
    Typewriter
    Thermometer
    Barometer
    Glasses|Spectacles;Eyeglasses
    Stethoscope
    Telegraph
    Clock|Mechanical clock
    Pencil
    Pen|Fountain pen
    Matches
    Umbrella
    Toilet|Flush toilet;Water closet
    Refrigerator|Fridge
    Dishwasher
    Vacuum cleaner
    Elevator|Lift
    Escalator
    Radio
    Phonograph|Gramophone;Record player
    Cinema|Film projector;Motion picture camera
    Electric motor
    Generator|Dynamo
    Internal combustion engine
    Diesel engine
    Railway|Train;Locomotive
    Tram
    Bus
    Hot air balloon
    Parachute
    Lightning rod|Lightning conductor
    Stapler
    Paper clip|Paperclip
    Safety pin
    Zip|Zipper
    Tin can
    Can opener|Tin opener
    Corkscrew
    Plough|Plow
    Windmill
    Water wheel
    Lock|Padlock;Pin tumbler lock
    Pulley
    Lever
    Screw
    Nail
    Saw
    Hammer
    Scissors
    Needle
    Concrete
    Steel|Bessemer process
    Dynamite
    Vaccine|Vaccination
    Anaesthetic|Anesthesia
    X-ray
    Syringe|Hypodermic needle
    Aspirin
    Braille
    Morse code
    Calculator|Mechanical calculator
    Abacus
    Sundial
    Hourglass
    Barbed wire
    Bricks|Brick
    Soap
    Toothbrush
    Pneumatic tyre|Tyre;Tire
    Vulcanised rubber
    Electric light
    Photograph|Photography
    Postage stamp|Stamp
    Jeans
    Fire extinguisher
    Traffic light|Traffic lights
    Cash register
    Revolving door
    Loudspeaker
    Microphone
    Electric iron|Iron
    Kettle|Electric kettle
    Toaster
    Fan|Electric fan
    Chewing gum
    Coca-Cola
    Lawnmower
    Washing machine
  `),
  sheet('s-colour-change', 'nature', 'Name an animal that can change colour', 'Colour-changing animals', `
    Chameleon
    Octopus
    Cuttlefish
    Squid
    Arctic fox
    Arctic hare
    Stoat|Ermine
    Flounder|Peacock flounder;Flatfish
    Anole|Green anole;Anole lizard
    Tree frog|Grey tree frog
    Golden tortoise beetle|Tortoise beetle
    Crab spider
    Seahorse
    Mimic octopus
    Ptarmigan
    Snowshoe hare
    Pacific tree frog
    Gecko
    Mountain hare
    Plaice
    Sole
    Halibut
    Shrimp|Chameleon shrimp
    Siberian hamster
    Collared lemming
    Weasel
    Bearded dragon
    Panther chameleon
    Veiled chameleon
    Hogfish
    Grouper
    Trumpetfish
    Pipefish
    Frogfish
    Leafy sea dragon
    Stick insect
    Katydid
    Grasshopper
    Goldenrod crab spider
  `),
  sheet('s-lang-before-1980', 'science', 'Name a programming language designed before 1980', 'Programming languages before 1980', `
    C
    BASIC|Basic
    COBOL|Cobol
    Fortran|FORTRAN
    Pascal
    SQL
    Lisp|LISP
    Assembly|Assembly language
    Logo
    Prolog
    Smalltalk
    ALGOL|Algol
    APL
    Forth
    ML
    Simula
    Scheme
    BCPL
    B
    PL/I
    Awk|AWK
    Modula
    sh|Bourne shell;Shell
    SNOBOL
    JOVIAL
    MUMPS|Mumps
    RPG
    CLU
    Mesa
    IPL
    FLOW-MATIC
    COMTRAN
    Plankalkül|Plankalkul
    JOSS
    PILOT
    TRAC
    Speedcoding
    Short Code
    ISWIM
    CPL
  `),
  sheet('s-flightless-bird', 'nature', 'Name a flightless bird', 'Flightless birds', `
    Penguin
    Ostrich
    Emu
    Kiwi
    Dodo
    Cassowary
    Rhea
    Kakapo
    Takahe
    Weka
    Moa
    Elephant bird
    Great auk
    Flightless cormorant|Galápagos cormorant
    Steamer duck
    Inaccessible Island rail
    Emperor penguin
    King penguin
    Adélie penguin|Adelie penguin
    Gentoo penguin
    Chinstrap penguin
    Rockhopper penguin
    Little penguin|Fairy penguin;Blue penguin
    Galápagos penguin|Galapagos penguin
    Humboldt penguin
    African penguin
    Macaroni penguin
    Yellow-eyed penguin
    Kagu
    Campbell teal
    Auckland teal
    Lord Howe woodhen
    Guam rail
    Okinawa rail
    Aptornis
    Solitaire|Rodrigues solitaire
    Terror bird|Phorusrhacid
    Gastornis
  `),
  sheet('s-echolocation', 'nature', 'Name an animal that uses echolocation', 'Echolocating animals', `
    Bat
    Dolphin
    Whale|Toothed whale
    Orca|Killer whale
    Porpoise
    Sperm whale
    Beluga|Beluga whale
    Narwhal
    Shrew
    Oilbird
    Swiftlet|Cave swiftlet
    Tenrec
    Bottlenose dolphin
    River dolphin|Amazon river dolphin;Boto
    Pilot whale
    False killer whale
    Beaked whale
    Egyptian fruit bat
    Horseshoe bat
    Pipistrelle
    Vampire bat
    Long-eared bat
    Human echolocation
    Rat
    Dormouse
    Harbour porpoise
    Pygmy sperm whale
  `),
  sheet('s-euro-country', 'geography', 'Name a country that uses the euro', 'Eurozone', `
    France
    Germany
    Spain
    Italy
    Ireland
    Netherlands|Holland
    Portugal
    Belgium
    Greece
    Austria
    Finland
    Luxembourg
    Malta
    Cyprus
    Slovakia
    Slovenia
    Estonia
    Latvia
    Lithuania
    Croatia
    Bulgaria
    Monaco
    San Marino
    Vatican City|Vatican
    Andorra
    Montenegro
    Kosovo
  `),
  sheet('s-borders-austria', 'geography', 'Name a country that shares a land border with Austria', 'Austria’s neighbours', `
    Germany
    Italy
    Switzerland
    Hungary
    Czech Republic|Czechia
    Slovakia
    Slovenia
    Liechtenstein
  `),
  sheet('s-winter-olympic', 'sport', 'Name a Winter Olympic sport or discipline', 'Winter Olympic sports', `
    Skiing|Alpine skiing;Downhill
    Ice hockey|Hockey
    Figure skating|Ice skating
    Curling
    Snowboarding|Snowboard
    Bobsleigh|Bobsled
    Speed skating
    Ski jumping
    Luge
    Skeleton
    Biathlon
    Cross-country skiing|Cross country skiing
    Freestyle skiing|Moguls;Aerials;Ski cross
    Short track speed skating|Short track
    Nordic combined
    Ice dancing
    Halfpipe
    Slalom|Giant slalom;Super-G
    Slopestyle
    Big air
    Ski mountaineering|Skimo
    Snowboard cross|Boardercross
    Monobob
    Military patrol
    Speed skiing
    Skijoring
    Ice stock sport
    Bandy
  `),
  sheet('s-language-5-countries', 'general', 'Name a language that is official in at least five countries', 'Widely official languages', `
    English
    French
    Spanish
    Arabic
    Portuguese
    German
    Swahili
    Russian
    Serbo-Croatian|Serbian;Croatian;Bosnian
    Italian
    Malay
  `),
  sheet('s-sa-river', 'geography', 'Name a river in South America', 'South American rivers', `
    Amazon
    Orinoco
    Paraná|Parana
    Rio de la Plata|River Plate
    São Francisco|Sao Francisco
    Paraguay
    Uruguay
    Madeira
    Rio Negro|Negro
    Magdalena
    Xingu
    Tocantins
    Araguaia
    Tapajós|Tapajos
    Japurá|Caquetá
    Putumayo
    Purus
    Juruá|Jurua
    Ucayali
    Marañón|Maranon
    Napo
    Pilcomayo
    Bermejo
    Salado
    Colorado
    Chubut
    Santa Cruz
    Biobío|Biobio
    Maipo
    Loa
    Mamoré|Mamore
    Beni
    Guaporé|Itenez
    Iguazu|Iguaçu
    Essequibo
    Courantyne|Corentyne
    Maroni
    Oyapock
    Caroní|Caroni
    Apure
    Meta
    Guaviare
    Cauca
    Atrato
    Branco
    Trombetas
    Jari
    Parnaíba|Parnaiba
    Jequitinhonha
    Doce
    Paraíba do Sul
    Tietê|Tiete
    Grande
    Paranaíba
    Cuyuni
    Urubamba
    Apurímac|Apurimac
    Mantaro
    Huallaga
    Desaguadero
  `),
  sheet('s-eight-legs', 'nature', 'Name an animal with eight legs', 'Eight-legged animals', `
    Spider
    Scorpion
    Tick
    Tarantula
    Mite
    Octopus
    Black widow
    Daddy long legs|Harvestman
    House spider
    Wolf spider
    Huntsman spider
    Jumping spider
    Funnel-web spider|Funnel web
    Redback spider|Redback
    Brown recluse
    Garden spider|Orb weaver
    Money spider
    Trapdoor spider
    Crab spider
    Camel spider|Sun spider;Solifuge
    Whip scorpion|Vinegaroon
    Whip spider|Tailless whip scorpion
    Pseudoscorpion
    Dust mite|House dust mite
    Spider mite
    Chigger
    Varroa mite
    Deer tick
    Sea spider
    Water spider|Diving bell spider
    Raft spider
    False widow
    Golden orb weaver
    Goliath birdeater
    Peacock spider
    Bird-eating spider
    Emperor scorpion
    Deathstalker
    Bark scorpion
    Ricinulei
  `),
  sheet('s-sa-range', 'geography', 'Name a mountain range in South America', 'South American ranges', `
    Andes
    Patagonian Andes
    Brazilian Highlands
    Guiana Highlands
    Serra do Mar
    Cordillera Blanca
    Cordillera Real
    Cordillera Central
    Cordillera Occidental
    Cordillera Oriental
    Sierra Nevada de Santa Marta
    Serra da Mantiqueira
    Serra Geral
    Cordillera de la Costa|Chilean Coast Range
    Cordillera Huayhuash
    Cordillera Vilcanota
    Cordillera Darwin
    Sierra de Córdoba|Sierras de Córdoba
    Pakaraima Mountains
    Tepuis|Roraima
    Serra do Espinhaço|Espinhaço
    Andean Altiplano|Altiplano
    Sierra de Perijá|Perija
    Mérida Cordillera|Cordillera de Mérida
    Serra dos Órgãos
    Cordillera Apolobamba
    Cordillera Quimsa Cruz
    Tumuk Humak Mountains
    Acarai Mountains
  `),
  sheet('s-blood-cell', 'science', 'Name a type of human blood cell', 'Blood cells', `
    Red blood cell|Erythrocyte;Red cell
    White blood cell|Leukocyte;White cell
    Platelet|Thrombocyte
    Lymphocyte
    Neutrophil
    T cell|T-cell;T lymphocyte
    B cell|B-cell;B lymphocyte
    Monocyte
    Eosinophil
    Basophil
    Macrophage
    Natural killer cell|NK cell
    Helper T cell
    Killer T cell|Cytotoxic T cell
    Plasma cell
    Memory cell
    Dendritic cell
    Mast cell
    Reticulocyte
    Megakaryocyte
    Stem cell|Haematopoietic stem cell
    Granulocyte
    Regulatory T cell
  `),
  sheet('s-moved-capital', 'history', 'Name a country that has moved its capital in modern times', 'Countries that moved their capital', `
    Brazil
    Australia
    Nigeria
    Pakistan
    Kazakhstan
    Myanmar|Burma
    Indonesia
    Egypt
    Russia
    Turkey|Türkiye
    Germany
    Tanzania
    Ivory Coast|Côte d’Ivoire
    Malawi
    Belize
    Botswana
    Burundi
    Equatorial Guinea
    Japan
    India
    Greece
    Italy
    Finland
    Mauritania
    Sri Lanka
    Malaysia
    Philippines
    Palau
    Libya
    Bolivia
    United States|USA;US;America
    Canada
    New Zealand
    China
    Vietnam
    Cambodia
    Thailand
    Iran
    Laos
  `),
  sheet('s-multilingual-country', 'geography', 'Name a country with more than one official language', 'Countries with several official languages', `
    Canada
    Switzerland
    Belgium
    India
    South Africa
    Ireland
    Singapore
    New Zealand
    Finland
    Luxembourg
    Bolivia
    Paraguay
    Peru
    Cyprus
    Malta
    Afghanistan
    Pakistan
    Sri Lanka
    Philippines
    Kenya
    Tanzania
    Rwanda
    Burundi
    Cameroon
    Chad
    Djibouti
    Somalia
    Madagascar
    Comoros
    Seychelles
    Zimbabwe
    Eswatini|Swaziland
    Lesotho
    Uganda
    Sudan
    Iraq
    Kazakhstan
    Kyrgyzstan
    Belarus
    Fiji
    Samoa
    Tonga
    Vanuatu
    Nauru
    Kiribati
    Palau
    Marshall Islands
    Tuvalu
    Haiti
    Equatorial Guinea
    Central African Republic
    Timor-Leste|East Timor
    Kosovo
    Bosnia and Herzegovina|Bosnia
    Vatican City|Vatican
    Norway
    Papua New Guinea
  `),
  sheet('s-astro-object', 'science', 'Name a type of astronomical object or phenomenon', 'Astronomy', `
    Star
    Planet
    Moon
    Comet
    Asteroid
    Galaxy
    Black hole
    Nebula
    Meteor|Shooting star
    Supernova
    Sun
    Eclipse|Solar eclipse;Lunar eclipse
    Aurora|Northern lights;Aurora borealis
    Meteor shower
    Meteorite
    Dwarf planet
    Constellation
    Quasar
    Pulsar
    Neutron star
    White dwarf
    Red giant
    Red dwarf
    Brown dwarf
    Exoplanet
    Star cluster|Globular cluster;Open cluster
    Binary star
    Variable star
    Nova
    Magnetar
    Kuiper belt
    Oort cloud
    Asteroid belt
    Solar flare
    Sunspot
    Solar wind
    Cosmic rays
    Gamma-ray burst
    Gravitational waves
    Dark matter
    Dark energy
    Big Bang|Cosmic microwave background
    Wormhole
    Transit
    Occultation
    Conjunction
    Zodiacal light
    Blue moon
    Supermoon
    Blood moon
    Galaxy cluster
    Interstellar medium
    Accretion disc
    Protostar
    Planetary nebula
    Moon phase|Crescent moon;Full moon;New moon
    Equinox
    Solstice
  `),
  sheet('s-mexican-dish', 'food', 'Name a dish from Mexican cuisine', 'Mexican food', `
    Tacos|Taco
    Burrito
    Nachos
    Enchiladas|Enchilada
    Quesadilla
    Guacamole
    Fajitas|Fajita
    Chilli con carne|Chili con carne
    Salsa
    Tortilla
    Tamales|Tamale
    Churros
    Refried beans
    Chimichanga
    Tostada
    Taquitos|Flautas
    Mole|Mole poblano
    Pozole
    Elote|Mexican street corn
    Ceviche
    Chilaquiles
    Huevos rancheros
    Carnitas
    Barbacoa
    Birria
    Al pastor|Tacos al pastor
    Cochinita pibil
    Chiles rellenos|Chile relleno
    Chiles en nogada
    Menudo
    Sopes
    Gorditas
    Huaraches
    Tlayudas
    Empanadas
    Pico de gallo
    Queso fundido
    Tortilla soup|Sopa de tortilla
    Arroz rojo|Mexican rice
    Flan
    Tres leches cake|Tres leches
    Horchata
    Agua fresca
    Pan dulce|Concha
    Torta
    Molletes
    Machaca
    Esquites
    Tinga
    Carne asada
    Pambazo
    Memelas
    Mixiote
    Escamoles
    Chapulines
    Nopales
    Salsa verde
    Aguachile
  `),
  sheet('s-hooved-mammal', 'nature', 'Name a mammal with hooves', 'Hooved mammals', `
    Horse
    Cow|Cattle;Bull
    Pig
    Sheep
    Goat
    Deer
    Zebra
    Giraffe
    Donkey
    Camel
    Moose|Elk
    Reindeer|Caribou
    Bison|Buffalo
    Antelope
    Hippopotamus|Hippo
    Rhinoceros|Rhino
    Llama
    Alpaca
    Gazelle
    Wildebeest|Gnu
    Yak
    Boar|Wild boar
    Tapir
    Okapi
    Ibex
    Mountain goat
    Impala
    Springbok
    Kudu
    Eland
    Oryx
    Musk ox
    Mule
    Pony
    Warthog
    Peccary
    Water buffalo
    Chamois
    Moufflon|Mouflon
    Bighorn sheep
    Pronghorn
    Wapiti
    Red deer
    Fallow deer
    Roe deer
    Muntjac
    Chevrotain|Mouse deer
    Gaur
    Banteng
    Saiga
    Gerenuk
    Dik-dik
    Duiker
    Nilgai
    Takin
    Vicuña|Vicuna
    Guanaco
    Bongo
    Sitatunga
    Hartebeest
    Topi
    Waterbuck
    Nyala
    Markhor
    Tahr
    Quagga
    Onager
    Kiang
    Przewalski's horse
  `),
  sheet('s-exoskeleton', 'nature', 'Name an animal with an exoskeleton', 'Animals with exoskeletons', `
    Ant
    Beetle
    Spider
    Crab
    Lobster
    Scorpion
    Shrimp|Prawn
    Grasshopper
    Cockroach
    Bee
    Butterfly
    Fly
    Centipede
    Millipede
    Woodlouse
    Ladybird
    Crayfish
    Dragonfly
    Mosquito
    Wasp
    Cricket
    Tick
    Mite
    Barnacle
    Krill
    Horseshoe crab
    Termite
    Moth
    Stick insect
    Praying mantis
    Flea
    Louse|Lice
    Hermit crab
    Spider crab
    Tarantula
    Trilobite
    Sea scorpion|Eurypterid
    Water flea|Daphnia
    Copepod
    Stag beetle
    Weevil
    Cicada
    Aphid
    Earwig
    Silverfish
    Mayfly
  `),
  sheet('s-planet-mission', 'science', 'Name a space mission that visited another body in the Solar System', 'Planetary missions', `
    Apollo 11|Apollo
    Voyager 1|Voyager
    Voyager 2
    Curiosity
    Perseverance
    Cassini|Cassini-Huygens
    New Horizons
    Juno
    Rosetta
    Galileo
    Mars Pathfinder|Pathfinder;Sojourner
    Spirit
    Opportunity
    Viking 1|Viking
    Viking 2
    Mariner 4
    Mariner 10
    Pioneer 10
    Pioneer 11
    Huygens
    Philae
    Messenger|MESSENGER
    BepiColombo
    Dawn
    OSIRIS-REx
    Hayabusa
    Hayabusa2
    DART
    Lucy
    Psyche
    JUICE|Jupiter Icy Moons Explorer
    Europa Clipper
    Parker Solar Probe
    Solar Orbiter
    Luna 2|Luna
    Luna 9
    Lunokhod 1|Lunokhod
    Venera 7|Venera
    Venera 13
    Vega 1|Vega
    Magellan
    Venus Express
    Akatsuki
    Mars Express
    Mars Reconnaissance Orbiter|MRO
    MAVEN
    InSight
    Phoenix
    Mars Global Surveyor
    Mars Odyssey
    ExoMars|Trace Gas Orbiter
    Mangalyaan|Mars Orbiter Mission
    Hope|Emirates Mars Mission
    Tianwen-1|Zhurong
    Chang'e 4|Chang'e
    Chang'e 5
    Chang'e 6
    Chandrayaan-1|Chandrayaan
    Chandrayaan-3
    Lunar Reconnaissance Orbiter|LRO
    Clementine
    Lunar Prospector
    SMART-1
    Giotto
    Stardust
    Deep Impact
    NEAR Shoemaker
    Ulysses
    Ingenuity
    Artemis I|Artemis
    Artemis II
    Apollo 8
    Apollo 13
    Apollo 17
    Surveyor 1|Surveyor
    Ranger 7|Ranger
    Lunar Orbiter
    SLIM
    Odysseus|IM-1
    Blue Ghost
  `),
  sheet('s-med-coast', 'geography', 'Name a country with a Mediterranean coastline', 'Mediterranean coastlines', `
    Italy
    Spain
    France
    Greece
    Turkey|Türkiye
    Egypt
    Croatia
    Cyprus
    Malta
    Israel
    Lebanon
    Morocco
    Tunisia
    Libya
    Algeria
    Syria
    Monaco
    Albania
    Montenegro
    Slovenia
    Bosnia and Herzegovina|Bosnia
    Palestine|Gaza
    United Kingdom|Gibraltar
  `),
  sheet('s-game-before-1990', 'screen', 'Name a video game first released before 1990', 'Video games before 1990', `
    Pac-Man|Pacman
    Space Invaders
    Pong
    Tetris
    Super Mario Bros.|Super Mario Bros;Super Mario
    Donkey Kong
    The Legend of Zelda|Zelda;Legend of Zelda
    Asteroids
    Frogger
    Galaga
    Centipede
    Defender
    Missile Command
    Dig Dug
    Q*bert|Qbert
    Breakout
    Mario Bros.|Mario Bros
    Metroid
    Mega Man|Megaman
    Castlevania
    Final Fantasy
    Dragon Quest|Dragon Warrior
    Street Fighter
    Double Dragon
    Contra
    Duck Hunt
    Excitebike
    Punch-Out!!|Punch-Out
    Kid Icarus
    Ghosts 'n Goblins
    Gauntlet
    Paperboy
    Out Run|OutRun
    Prince of Persia
    SimCity
    Elite
    Manic Miner
    Jet Set Willy
    Chuckie Egg
    Bomb Jack
    Bubble Bobble
    R-Type
    Gradius
    1942
    Tempest
    Pitfall!|Pitfall
    Adventure
    E.T. the Extra-Terrestrial|ET
    Joust
    Robotron: 2084|Robotron
    Zork
    Ultima
    Wizardry
    Rogue
    Leisure Suit Larry
    King's Quest
    Maniac Mansion
    Populous
    Tron
    Dragon's Lair
    Track & Field
    Spy Hunter
    Pole Position
    Burger Time|BurgerTime
    Lode Runner
    Boulder Dash
    Marble Madness
    Arkanoid
    Golden Axe
    Altered Beast
    Super Mario Bros. 2
    Super Mario Bros. 3
    Zelda II|Zelda II: The Adventure of Link
    Metal Gear
    Phantasy Star
    Ninja Gaiden
    Tecmo Bowl
    John Madden Football|Madden
  `),
  sheet('s-planet', 'science', 'Name a planet in the Solar System', 'Planets', `
    Earth
    Mars
    Jupiter
    Saturn
    Venus
    Mercury
    Neptune
    Uranus
  `),
  sheet('s-archery-discipline', 'sport', 'Name a sport or discipline that uses a bow and arrow', 'Archery', `
    Archery|Target archery
    Field archery
    3D archery
    Bowhunting|Hunting
    Clout archery|Clout
    Flight archery|Flight shooting
    Ski archery
    Kyudo
    Mounted archery|Horseback archery
    Run archery
    Popinjay|Popinjay shooting
    Roving
    Archery tag
    Traditional archery
    Compound archery
    Recurve archery
    Para archery
    Indoor archery
  `),
  sheet('s-citrus', 'food', 'Name a citrus fruit', 'Citrus fruit', `
    Orange
    Lemon
    Lime
    Grapefruit
    Satsuma
    Clementine
    Tangerine
    Mandarin
    Kumquat
    Blood orange
    Pomelo
    Yuzu
    Bergamot
    Seville orange|Bitter orange
    Key lime
    Kaffir lime|Makrut lime
    Citron
    Ugli fruit|Ugli
    Tangelo
    Minneola
    Navel orange
    Valencia orange
    Calamansi
    Finger lime
    Sudachi
    Kabosu
    Dekopon|Sumo citrus
    Meyer lemon
    Etrog
    Buddha's hand
    Limequat
    Rangpur
    Mandarinquat
    Jaffa orange
    Ortanique
    Sweet lime|Limetta
    Ponkan
    Shaddock
    Amanatsu
  `),
  sheet('s-boardgame-before-1950', 'general', 'Name a board game first published before 1950', 'Board games before 1950', `
    Chess
    Monopoly
    Scrabble
    Draughts|Checkers
    Backgammon
    Snakes and Ladders|Chutes and Ladders
    Ludo|Parcheesi;Pachisi
    Cluedo|Clue
    Go
    Mahjong|Mah-jong
    Dominoes
    Chinese checkers
    Mancala
    Nine men's morris
    Halma
    Battleship|Battleships
    Reversi|Othello
    Sorry!|Sorry
    Tiddlywinks
    The Game of Life|Life;Checkered Game of Life
    Totopoly
    Senet
    Royal Game of Ur|Ur
    Mehen
    Shogi
    Xiangqi|Chinese chess
    Hnefatafl|Tafl
    Fox and geese
    Nyout|Yut
    Gomoku
    Uncle Wiggily
    Stratego
    Touring
    Lotto
    Tri-tactics
    Buccaneer
    Game of the Goose
    Pit
  `),
  sheet('s-arctic-coast', 'geography', 'Name a country with an Arctic Ocean coastline', 'Arctic coastlines', `
    Russia
    Canada
    Norway
    United States|USA;US;America;Alaska
    Denmark|Greenland
  `),
  sheet('s-grain-crop', 'food', 'Name a plant grown for its edible seeds or grain', 'Grain and seed crops', `
    Wheat
    Rice
    Corn|Maize;Sweetcorn
    Oats
    Barley
    Rye
    Quinoa
    Millet
    Sorghum
    Buckwheat
    Soy|Soybean;Soya
    Lentils|Lentil
    Chickpeas|Chickpea
    Peas|Pea
    Beans|Bean
    Peanut|Groundnut
    Sunflower
    Sesame
    Flax|Linseed
    Chia
    Hemp
    Amaranth
    Spelt
    Teff
    Fonio
    Triticale
    Durum wheat
    Emmer
    Einkorn
    Kamut|Khorasan wheat
    Wild rice
    Freekeh
    Rapeseed|Canola
    Pumpkin|Pumpkin seeds
    Poppy
    Mustard
    Coffee
    Cocoa|Cacao
    Pine nuts|Stone pine
    Almond
    Cashew
    Coriander
    Fennel
    Cumin
    Lupin
    Fava bean|Broad bean
    Pigeon pea
    Mung bean
    Black-eyed pea|Cowpea
    Job's tears
  `),
  sheet('s-african-empire', 'history', 'Name an empire or kingdom that existed in Africa', 'African empires', `
    Ancient Egypt|Egypt;Egyptian Empire
    Mali Empire|Mali
    Songhai Empire|Songhai
    Ghana Empire|Ghana;Wagadu
    Ashanti Empire|Ashanti;Asante
    Zulu Kingdom|Zulu Empire;Zulu
    Kingdom of Kush|Kush;Nubia
    Aksumite Empire|Aksum;Axum
    Ethiopian Empire|Abyssinia;Ethiopia
    Carthage|Carthaginian Empire
    Benin Empire|Kingdom of Benin;Benin
    Oyo Empire|Oyo
    Kanem-Bornu Empire|Kanem;Bornu;Kanem-Bornu
    Great Zimbabwe|Kingdom of Zimbabwe
    Kingdom of Kongo|Kongo
    Mutapa Empire|Mutapa;Monomotapa
    Sokoto Caliphate|Sokoto
    Dahomey|Kingdom of Dahomey
    Almoravid Empire|Almoravids
    Almohad Caliphate|Almohads
    Fatimid Caliphate|Fatimids
    Mamluk Sultanate|Mamluks
    Ayyubid dynasty|Ayyubids
    Ptolemaic Kingdom|Ptolemies
    Numidia
    Mauretania
    Kingdom of Buganda|Buganda
    Kingdom of Rwanda
    Luba Empire|Luba
    Lunda Empire|Lunda
    Kuba Kingdom|Kuba
    Wolof Empire|Jolof
    Toucouleur Empire
    Wassoulou Empire
    Bamana Empire|Bambara Empire
    Kingdom of Mapungubwe|Mapungubwe
    Merina Kingdom|Merina
    Adal Sultanate|Adal
    Kilwa Sultanate|Kilwa
    Ajuran Sultanate|Ajuran
    Funj Sultanate|Funj
    Darfur Sultanate|Darfur
    Marinid dynasty|Marinids
    Saadi dynasty
    Alaouite dynasty
    Rozvi Empire|Rozvi
    Ndebele Kingdom|Mthwakazi
    Punt
  `),
  sheet('s-spanish-country', 'geography', 'Name a country where Spanish is an official language', 'Spanish-speaking countries', `
    Spain
    Mexico
    Argentina
    Colombia
    Peru
    Chile
    Cuba
    Venezuela
    Ecuador
    Bolivia
    Uruguay
    Paraguay
    Guatemala
    Honduras
    El Salvador
    Nicaragua
    Costa Rica
    Panama
    Dominican Republic
    Equatorial Guinea
    Puerto Rico
  `),
  sheet('s-planet-with-moon', 'science', 'Name a planet that has at least one moon', 'Planets with moons', `
    Earth
    Jupiter
    Saturn
    Mars
    Neptune
    Uranus
  `),
  sheet('s-hormone', 'science', 'Name a hormone made by the human body', 'Hormones', `
    Adrenaline|Epinephrine
    Insulin
    Testosterone
    Oestrogen|Estrogen
    Cortisol
    Melatonin
    Serotonin
    Dopamine
    Oxytocin
    Progesterone
    Growth hormone|HGH;Somatotropin
    Thyroxine|T4;Thyroid hormone
    Glucagon
    Endorphins
    Noradrenaline|Norepinephrine
    Leptin
    Ghrelin
    Prolactin
    Vasopressin|ADH;Antidiuretic hormone
    Aldosterone
    hCG|Human chorionic gonadotropin
    FSH|Follicle-stimulating hormone
    LH|Luteinising hormone
    TSH|Thyroid-stimulating hormone
    ACTH|Adrenocorticotropic hormone
    Calcitonin
    Parathyroid hormone|PTH
    Erythropoietin|EPO
    Triiodothyronine|T3
    DHEA
    Gastrin
    Secretin
    Cholecystokinin|CCK
    Somatostatin
    Renin
    Calcitriol|Vitamin D
    Relaxin
    Inhibin
    GnRH|Gonadotropin-releasing hormone
    Thymosin
    Atrial natriuretic peptide|ANP
    Incretin|GLP-1
    Histamine
  `),
  sheet('s-communication-invention', 'history', 'Name an invention for sending messages over a distance', 'Long-distance communication', `
    Telephone|Phone
    Radio
    Television|TV
    Telegraph
    Internet
    Email|E-mail
    Mobile phone|Cell phone;Smartphone
    Fax|Fax machine
    Satellite
    Morse code
    Semaphore
    Smoke signals
    Carrier pigeon|Homing pigeon
    Postal service|Post;Letter
    Pager
    Walkie-talkie|Two-way radio
    CB radio
    Text message|SMS
    World Wide Web|Web
    Video call|Video calling
    Optical telegraph|Chappe telegraph
    Heliograph
    Signal fire|Beacon
    Drums|Talking drums
    Telex
    Teleprinter|Teletype
    Undersea cable|Transatlantic cable
    Fibre optics|Fiber optic cable
    Wi-Fi|WiFi
    Bluetooth
    Modem
    Pneumatic tube
    Ship's flags|Signal flags
    Aldis lamp|Signal lamp
    Megaphone|Loudhailer
    Ham radio|Amateur radio
    Videophone
    Instant messaging
    Social media
  `),
  sheet('s-noodle-dish', 'food', 'Name a dish made with noodles', 'Noodle dishes', `
    Ramen
    Pad Thai
    Chow mein
    Pho
    Udon
    Noodle soup|Chicken noodle soup
    Lo mein
    Singapore noodles
    Laksa
    Soba
    Pot Noodle|Instant noodles;Cup noodles
    Spaghetti bolognese|Spaghetti
    Lasagne|Lasagna
    Mac and cheese|Macaroni cheese
    Carbonara|Spaghetti carbonara
    Dan dan noodles|Dan dan
    Yakisoba
    Japchae
    Pad see ew
    Drunken noodles|Pad kee mao
    Khao soi
    Mee goreng
    Char kway teow
    Hokkien mee
    Bun cha
    Bún bò Huế|Bun bo Hue
    Hiyashi chuka
    Naengmyeon
    Jajangmyeon
    Biang biang noodles
    Lanzhou beef noodles|Lamian
    Zhajiangmian
    Wonton noodles|Wonton mee
    Beef chow fun|Ho fun
    Cold sesame noodles|Sesame noodles
    Pancit
    Mohinga
    Shan noodles
    Kugel|Lokshen kugel
    Spätzle
    Haluski
    Fideuà|Fideua
    Tom yum noodles
    Rice noodle salad|Bun
    Tsukemen
    Kitsune udon
    Tempura soba
    Zaru soba
    Champon
    Mee rebus
    Mee siam
    Cao lau
    Kuy teav
    Ash reshteh
    Thukpa
    Maggi|Maggi noodles
  `),
  sheet('s-galaxy-type', 'science', 'Name a type of galaxy', 'Galaxy types', `
    Spiral galaxy|Spiral
    Elliptical galaxy|Elliptical
    Barred spiral galaxy|Barred spiral
    Irregular galaxy|Irregular
    Lenticular galaxy|Lenticular
    Dwarf galaxy|Dwarf
    Ring galaxy
    Starburst galaxy|Starburst
    Seyfert galaxy|Seyfert
    Active galaxy|Active galactic nucleus;AGN
    Quasar
    Radio galaxy
    Blazar
    Satellite galaxy
    Dwarf spheroidal galaxy|Dwarf spheroidal
    Dwarf elliptical galaxy
    Ultra-diffuse galaxy
    Low surface brightness galaxy
    Peculiar galaxy
    Interacting galaxy
    Polar-ring galaxy
    Grand design spiral
    Flocculent spiral
    Luminous infrared galaxy
    Green pea galaxy
    Lyman-alpha emitter
  `),
  sheet('s-capital-not-largest', 'geography', 'Name a country whose capital is not its largest city', 'Capitals that aren’t the biggest city', `
    Australia
    United States|USA;US;America
    Canada
    Brazil
    Turkey|Türkiye
    Switzerland
    New Zealand
    China
    South Africa
    India
    Vietnam
    Nigeria
    Pakistan
    Morocco
    Kazakhstan
    Myanmar|Burma
    Tanzania
    Ivory Coast|Côte d’Ivoire
    Bolivia
    Ecuador
    Cameroon
    Benin
    United Arab Emirates|UAE
    Burundi
    Equatorial Guinea
    Sri Lanka
    Belize
    Philippines
    Malta
    Liechtenstein
    San Marino
    Gambia
    Palau
    Micronesia
  `),
  sheet('s-sheep-cheese', 'food', 'Name a cheese made from sheep’s milk', 'Sheep’s cheeses', `
    Feta
    Roquefort
    Manchego
    Pecorino|Pecorino Romano
    Halloumi
    Ricotta
    Pecorino Sardo
    Pecorino Toscano
    Ossau-Iraty
    Idiazabal
    Roncal
    Zamorano
    Serra da Estrela
    Fiore Sardo
    Kefalotyri
    Graviera
    Kasseri
    Manouri
    Myzithra|Mizithra
    Anthotyros
    Bryndza
    Oscypek
    Brânză|Branza
    Kashkaval
    Sirene|Bulgarian white cheese
    Ezine
    Beyaz peynir
    Lighvan
    Nabulsi
    Berkswell
    Wensleydale
    Lanark Blue
    Beenleigh Blue
    Spenwood
    Torta del Casar
    Queso de la Serena|La Serena
    Canestrato
    Brebis|Fromage de brebis
    Abbaye de Belloc
    Tomme de brebis
    Liptauer
    Kopanisti
  `),
  sheet('s-equator-country', 'geography', 'Name a country crossed by the Equator', 'Equator countries', `
    Ecuador
    Brazil
    Colombia
    Kenya
    Indonesia
    Uganda
    Democratic Republic of the Congo|DR Congo;DRC
    Republic of the Congo|Congo
    Gabon
    Somalia
    São Tomé and Príncipe|Sao Tome and Principe
    Kiribati
    Maldives
  `),
  sheet('s-treaty', 'history', 'Name a historical treaty', 'Treaties', `
    Treaty of Versailles
    Treaty of Paris
    Treaty of Rome
    Maastricht Treaty|Treaty of Maastricht
    Treaty of Lisbon|Lisbon Treaty
    Treaty of Westphalia|Peace of Westphalia
    Treaty of Utrecht
    Treaty of Tordesillas
    Treaty of Waitangi
    Treaty of Ghent
    Good Friday Agreement|Belfast Agreement
    Treaty of Brest-Litovsk|Brest-Litovsk
    Treaty of Lausanne
    Treaty of Sèvres|Treaty of Sevres
    Treaty of Trianon
    Treaty of Saint-Germain
    Treaty of Nanking|Treaty of Nanjing
    Treaty of Guadalupe Hidalgo
    Treaty of Union|Act of Union
    Treaty of Amiens
    Treaty of Tilsit
    Congress of Vienna
    Treaty of Berlin
    Treaty of London
    North Atlantic Treaty|NATO Treaty
    Warsaw Pact
    Molotov–Ribbentrop Pact|Molotov-Ribbentrop Pact;Nazi-Soviet Pact
    Munich Agreement
    Kellogg–Briand Pact|Kellogg-Briand Pact
    Treaty of San Francisco
    Camp David Accords
    Oslo Accords
    Dayton Agreement|Dayton Accords
    Geneva Conventions
    Paris Agreement|Paris Climate Agreement
    Kyoto Protocol
    Montreal Protocol
    Antarctic Treaty
    Outer Space Treaty
    Nuclear Non-Proliferation Treaty|NPT;Non-Proliferation Treaty
    SALT I|SALT
    START|New START
    INF Treaty
    Schengen Agreement
    Treaty of Nice
    Treaty of Amsterdam
    Anglo-Irish Treaty
    Treaty of Kanagawa
    Treaty of Shimonoseki
    Treaty of Portsmouth
    Treaty of Vereeniging
    Treaty of Frankfurt
    Treaty of Aix-la-Chapelle
    Treaty of Fontainebleau
    Treaty of Karlowitz
    Treaty of Nerchinsk
    Treaty of Kadesh
    Peace of Augsburg
    Edict of Nantes
    Treaty of Troyes
    Treaty of Verdun
    Treaty of Windsor
    Treaty of Fort Laramie
    Jay Treaty
    Louisiana Purchase
    Gadsden Purchase
    Abraham Accords
    Minsk agreements|Minsk Protocol
    Belavezha Accords
    Helsinki Accords
    Treaty of Tlatelolco
    Sykes–Picot Agreement|Sykes-Picot
    Balfour Declaration
    Locarno Treaties|Treaty of Locarno
    Treaty of Neuilly
    Treaty of Rapallo
    Treaty of Riga
    Treaty of Tartu
    Treaty of Moscow
    Treaty of Madrid
  `),
  sheet('s-camouflage', 'nature', 'Name an animal that uses camouflage', 'Camouflaged animals', `
    Chameleon
    Stick insect
    Octopus
    Leaf insect
    Zebra
    Tiger
    Leopard
    Snowshoe hare
    Arctic fox
    Polar bear
    Owl
    Moth|Peppered moth
    Frog
    Cuttlefish
    Flounder|Flatfish
    Stonefish
    Gecko|Leaf-tailed gecko
    Snake
    Crocodile
    Praying mantis|Orchid mantis
    Seahorse
    Leafy sea dragon
    Deer
    Giraffe
    Jaguar
    Snow leopard
    Lion
    Sloth
    Bittern
    Nightjar
    Potoo
    Ptarmigan
    Woodcock
    Stoat|Ermine
    Katydid
    Grasshopper
    Crab spider
    Squid
    Scorpionfish
    Frogfish
    Pygmy seahorse
    Decorator crab
    Plaice
    Hare
    Bush cricket
    Toad
    Tawny frogmouth
    Caterpillar
    Lizard
    Iguana
    Bobcat
    Lynx
    Okapi
  `),
  sheet('s-cold-mammal', 'nature', 'Name a mammal adapted to life in cold climates', 'Cold-climate mammals', `
    Polar bear
    Arctic fox
    Walrus
    Seal
    Reindeer|Caribou
    Snow leopard
    Musk ox
    Yak
    Arctic hare
    Narwhal
    Beluga|Beluga whale
    Wolverine
    Woolly mammoth|Mammoth
    Snowshoe hare
    Lemming
    Arctic wolf
    Siberian tiger|Amur tiger
    Moose|Elk
    Mountain goat
    Ermine|Stoat
    Pika
    Bowhead whale
    Leopard seal
    Weddell seal
    Elephant seal
    Harp seal
    Ringed seal
    Sea otter
    Grizzly bear
    Japanese macaque|Snow monkey
    Bactrian camel
    Woolly rhinoceros
    Arctic ground squirrel
    Marmot
    Lynx
    Sable
    Mink
    Chinchilla
    Vicuña|Vicuna
    Takin
    Dall sheep
    Saiga
    Red fox
  `),
  sheet('s-venomous-animal', 'nature', 'Name an animal that produces venom', 'Venomous animals', `
    Snake
    Spider
    Scorpion
    Bee
    Wasp
    Jellyfish|Box jellyfish
    Cobra
    Rattlesnake
    Black mamba|Mamba
    Viper|Adder
    Taipan|Inland taipan
    Black widow
    Tarantula
    Funnel-web spider|Funnel web
    Redback spider
    Brown recluse
    Stonefish
    Lionfish
    Stingray
    Blue-ringed octopus
    Cone snail
    Platypus
    Komodo dragon
    Gila monster
    Hornet
    Ant|Fire ant;Bullet ant
    Centipede
    Sea snake
    Weever fish
    Portuguese man o' war|Man o' war
    Sea anemone
    Slow loris
    Shrew|Water shrew
    Solenodon
    Mexican beaded lizard
    King cobra
    Coral snake
    Boomslang
    Krait
    Fer-de-lance
    Puff adder
    Gaboon viper
    Saw-scaled viper
    Copperhead
    Cottonmouth|Water moccasin
    Sea wasp
    Irukandji jellyfish
    Caterpillar|Puss caterpillar
    Assassin bug
    Velvet ant
    Tarantula hawk
    Catfish
    Scorpionfish
    Bristle worm|Fireworm
  `),
  sheet('s-caribbean-island', 'geography', 'Name an island in the Caribbean Sea', 'Caribbean islands', `
    Jamaica
    Cuba
    Barbados
    Puerto Rico
    Hispaniola
    Trinidad
    Tobago
    Aruba
    Curaçao|Curacao
    Bonaire
    Saint Lucia|St Lucia
    Antigua
    Barbuda
    Grenada
    Dominica
    Martinique
    Guadeloupe
    Saint Kitts|St Kitts
    Nevis
    Saint Vincent|St Vincent
    Montserrat
    Anguilla
    Cayman Islands|Grand Cayman
    British Virgin Islands|Tortola
    US Virgin Islands|Saint Thomas;St Thomas
    Saint Croix|St Croix
    Saint John|St John
    Saint Martin|Sint Maarten;St Martin
    Saint Barthélemy|St Barts;St Barths
    Isla Margarita|Margarita Island
    Mustique
    Bequia
    Carriacou
    Isla de la Juventud|Isle of Youth
    Cozumel
    Isla Mujeres
    Roatán|Roatan
    Utila
    Ambergris Caye
    Caye Caulker
    San Andrés|San Andres
    Providencia
    Vieques
    Culebra
    Saba
    Sint Eustatius|Statia
    Marie-Galante
    Les Saintes
    Virgin Gorda
    Jost Van Dyke
    Little Cayman
    Cayman Brac
    Navassa Island
    Tortuga
    Gonâve|Gonave
  `),
  sheet('s-air-breathing-swimmer', 'nature', 'Name an animal that lives in water but breathes air', 'Air-breathing water animals', `
    Whale
    Dolphin
    Seal
    Turtle|Sea turtle
    Crocodile
    Hippopotamus|Hippo
    Otter
    Penguin
    Walrus
    Sea lion
    Manatee
    Orca|Killer whale
    Alligator
    Platypus
    Beaver
    Sea otter
    Dugong
    Porpoise
    Narwhal
    Beluga
    Sperm whale
    Blue whale
    Humpback whale
    Sea snake
    Marine iguana
    Water vole
    Mink
    Capybara
    Frog
    Newt
    Axolotl
    Water spider|Diving bell spider
    Diving beetle
    Mosquito larva
    Lungfish
    Arapaima
    Mudskipper
    Snakehead
    Bichir
    Gar|Alligator gar
    Caiman
    Gharial
    Anaconda
    Terrapin
    Water snake
    Desman
    Water shrew
    Sea cow
    Polar bear
    Puffin
    Cormorant
    Duck
    Grebe
    Loon|Diver
  `),
  sheet('s-star-type', 'science', 'Name a type of star or stellar remnant', 'Types of star', `
    Red giant
    White dwarf
    Neutron star
    Black hole
    Red dwarf
    Supergiant|Red supergiant;Blue supergiant
    Yellow dwarf|Main sequence star;G-type star
    Brown dwarf
    Pulsar
    Supernova
    Blue giant
    Binary star|Double star
    Protostar
    Variable star
    Magnetar
    Hypergiant
    Black dwarf
    Cepheid|Cepheid variable
    Wolf–Rayet star|Wolf-Rayet star
    Carbon star
    T Tauri star
    Subgiant
    Blue straggler
    Quark star
    Nova
    Planetary nebula
    Hot subdwarf|Subdwarf
    Blue dwarf
    Orange dwarf|K-type star
    O-type star
    Population III star
    Flare star
    Mira variable
    RR Lyrae
    Be star
    Eclipsing binary
    Thorne–Żytkow object
  `),
  sheet('s-migrating-animal', 'nature', 'Name an animal that migrates with the seasons', 'Migrating animals', `
    Swallow
    Goose|Canada goose;Brent goose
    Wildebeest
    Monarch butterfly
    Arctic tern
    Salmon
    Humpback whale
    Caribou|Reindeer
    Grey whale|Gray whale
    Eel|European eel
    Swift
    Stork|White stork
    Turtle|Sea turtle;Leatherback
    Zebra
    Cuckoo
    Swan
    Duck
    Crane
    Bat
    Painted lady|Painted lady butterfly
    Locust
    Dragonfly|Globe skimmer
    Bar-tailed godwit|Godwit
    Shearwater
    Albatross
    Hummingbird
    Warbler
    Osprey
    Pelican
    Flamingo
    Elk|Moose
    Bison
    Elephant
    Saiga
    Springbok
    Gazelle
    Christmas Island red crab|Red crab
    Spiny lobster
    Sardine|Sardine run
    Tuna
    Shark
    Blue whale
    Right whale
    Walrus
    Orca
    Ladybird
    Bogong moth
    Snow goose
    Barn swallow
    House martin
    Nightingale
    Redwing
    Fieldfare
    Waxwing
    Pied flycatcher
  `),
  sheet('s-percussion', 'music', 'Name a percussion instrument', 'Percussion', `
    Drum|Drums;Drum kit
    Cymbals|Cymbal
    Triangle
    Tambourine
    Xylophone
    Bongos|Bongo drums
    Timpani|Kettle drum
    Snare drum
    Bass drum
    Maracas
    Castanets
    Cowbell
    Glockenspiel
    Marimba
    Gong
    Congas|Conga
    Djembe
    Tabla
    Steel drum|Steelpan;Steel pan
    Vibraphone
    Tubular bells
    Hi-hat|Hihat
    Tom-tom|Tom
    Cajón|Cajon
    Woodblock|Wood block
    Claves
    Guiro|Güiro
    Bells|Sleigh bells
    Chimes|Wind chimes
    Shaker
    Washboard
    Spoons
    Bones
    Bodhrán|Bodhran
    Tabor
    Taiko
    Timbales
    Cabasa
    Agogô|Agogo
    Rainstick
    Celesta
    Crotales
    Anvil
    Ratchet
    Whip|Slapstick
    Vibraslap
    Hang drum|Handpan
    Talking drum
    Darbuka|Doumbek
    Frame drum
    Gamelan
    Kalimba|Thumb piano;Mbira
    Balafon
    Udu
    Surdo
    Tamborim
    Pandeiro
    Mridangam
    Dhol
    Thunder sheet
    Temple blocks
    Flexatone
    Finger cymbals
  `),
  sheet('s-borders-argentina', 'geography', 'Name a country that shares a land border with Argentina', 'Argentina’s neighbours', `
    Chile
    Brazil
    Uruguay
    Bolivia
    Paraguay
  `),
  sheet('s-saturn-moon', 'science', 'Name a moon of Saturn', 'Moons of Saturn', `
    Titan
    Enceladus
    Mimas
    Rhea
    Iapetus
    Dione
    Tethys
    Hyperion
    Phoebe
    Janus
    Epimetheus
    Pandora
    Prometheus
    Atlas
    Pan
    Daphnis
    Helene
    Telesto
    Calypso
    Methone
    Pallene
    Polydeuces
    Anthe
    Aegaeon
    Ymir
    Paaliaq
    Tarvos
    Ijiraq
    Kiviuq
    Mundilfari
    Albiorix
    Skathi
    Erriapus
    Siarnaq
    Thrymr
    Narvi
    Suttungr
    Fornjot
  `),
  sheet('s-europe-range', 'geography', 'Name a mountain range in Europe', 'European ranges', `
    Alps
    Pyrenees
    Carpathians|Carpathian Mountains
    Apennines
    Ural Mountains|Urals
    Caucasus|Caucasus Mountains
    Scottish Highlands|Highlands;Grampians
    Pennines
    Dolomites
    Balkan Mountains|Balkans
    Dinaric Alps|Dinarides
    Scandinavian Mountains|Scandes
    Sierra Nevada
    Cantabrian Mountains
    Jura|Jura Mountains
    Vosges
    Black Forest
    Massif Central
    Tatra Mountains|Tatras
    Sudetes
    Ore Mountains|Erzgebirge
    Harz
    Pindus
    Rila
    Rhodope Mountains|Rhodopes
    Cambrian Mountains
    Snowdonia|Eryri
    Brecon Beacons
    Cairngorms
    Cuillin|Cuillins
    Lake District fells|Cumbrian Mountains
    Mourne Mountains|Mournes
    Wicklow Mountains
    MacGillycuddy's Reeks
    Sierra de Guadarrama
    Sierra Morena
    Picos de Europa
    Julian Alps
    Bernese Alps
    Pennine Alps
    Ardennes
    Bohemian Forest
    Eifel
    Taunus
    Apuan Alps
    Taygetus
    Kjølen|Kjolen
    Jotunheimen
    Khibiny
    Šar Mountains|Sar Mountains
    Prokletije|Accursed Mountains
    Troodos
  `),
  sheet('s-novel-before-1900', 'arts', 'Name a novel published before 1900', 'Novels before 1900', `
    Pride and Prejudice
    Frankenstein
    Dracula
    Jane Eyre
    Wuthering Heights
    Oliver Twist
    Great Expectations
    A Christmas Carol
    Moby-Dick|Moby Dick
    Les Misérables|Les Miserables
    War and Peace
    Anna Karenina
    Crime and Punishment
    Robinson Crusoe
    Gulliver's Travels
    Treasure Island
    Alice's Adventures in Wonderland|Alice in Wonderland
    Little Women
    The Adventures of Tom Sawyer|Tom Sawyer
    Adventures of Huckleberry Finn|Huckleberry Finn
    Sense and Sensibility
    Emma
    Persuasion
    Northanger Abbey
    Mansfield Park
    David Copperfield
    A Tale of Two Cities
    Bleak House
    Hard Times
    Little Dorrit
    The Pickwick Papers|Pickwick Papers
    Nicholas Nickleby
    The Old Curiosity Shop
    Middlemarch
    Silas Marner
    The Mill on the Floss
    Madame Bovary
    The Count of Monte Cristo
    The Three Musketeers
    The Hunchback of Notre-Dame|Hunchback of Notre Dame
    The Scarlet Letter
    Uncle Tom's Cabin
    The Picture of Dorian Gray|Dorian Gray
    Strange Case of Dr Jekyll and Mr Hyde|Jekyll and Hyde;Dr Jekyll and Mr Hyde
    Kidnapped
    The Time Machine
    The War of the Worlds|War of the Worlds
    The Invisible Man
    Twenty Thousand Leagues Under the Seas|20,000 Leagues Under the Sea;Twenty Thousand Leagues Under the Sea
    Around the World in Eighty Days|Around the World in 80 Days
    Journey to the Centre of the Earth
    Tess of the d'Urbervilles|Tess
    Far from the Madding Crowd
    Jude the Obscure
    The Mayor of Casterbridge
    Vanity Fair
    Ivanhoe
    Black Beauty
    The Jungle Book
    A Study in Scarlet
    The Sign of the Four
    The Brothers Karamazov
    Don Quixote
    Fathers and Sons
    Eugene Onegin
    The Woman in White
    The Moonstone
    The Last of the Mohicans
    The Red Badge of Courage
    The Turn of the Screw
    The Portrait of a Lady
    Heart of Darkness
    King Solomon's Mines
    She
    Lorna Doone
    The Water-Babies
    Tristram Shandy
    Tom Jones
    Pamela
    Clarissa
    Candide
    Dangerous Liaisons|Les Liaisons dangereuses
    The Sorrows of Young Werther
    Pinocchio|The Adventures of Pinocchio
    Heidi
    The Swiss Family Robinson|Swiss Family Robinson
    Hans Brinker
    The Prisoner of Zenda
    The Red and the Black
    Père Goriot|Pere Goriot
    The Idiot
    Notes from Underground
    Dead Souls
    The Betrothed
    The Tale of Genji
    Journey to the West
    Dream of the Red Chamber
    Water Margin
    Romance of the Three Kingdoms
    Germinal
    Nana
    Thérèse Raquin|Therese Raquin
    Effi Briest
    Agnes Grey
    The Tenant of Wildfell Hall
    Villette
    Shirley
    North and South
    Cranford
    Barchester Towers
    The Way We Live Now
    Erewhon
    Looking Backward
    Ben-Hur
    The Last Days of Pompeii
    A Connecticut Yankee in King Arthur's Court
    The Prince and the Pauper
    Castle Rackrent
    Waverley
    Rob Roy
    The Monk
    The Castle of Otranto
    The Mysteries of Udolpho
  `),
  sheet('s-baltic-coast', 'geography', 'Name a country with a Baltic Sea coastline', 'Baltic coastlines', `
    Sweden
    Finland
    Denmark
    Germany
    Poland
    Russia
    Estonia
    Latvia
    Lithuania
  `),
  sheet('s-long-river', 'geography', 'Name a river longer than 1,000 kilometres', 'Rivers over 1,000 km', `
    Nile
    Amazon
    Mississippi
    Yangtze
    Danube
    Volga
    Ganges
    Mekong
    Congo
    Niger
    Zambezi
    Missouri
    Yellow River|Huang He
    Rhine
    Indus
    Brahmaputra
    Euphrates
    Tigris
    Murray
    Darling
    Rio Grande
    Colorado
    Yukon
    Mackenzie
    Saint Lawrence|St Lawrence
    Columbia
    Ohio
    Arkansas
    Red River
    Snake
    Platte
    Ob
    Irtysh
    Yenisei
    Lena
    Amur
    Kolyma
    Ural
    Dnieper
    Don
    Pechora
    Kama
    Dniester
    Western Dvina|Daugava
    Northern Dvina
    Orinoco
    Paraná|Parana
    Paraguay
    Uruguay
    São Francisco|Sao Francisco
    Madeira
    Purus
    Japurá|Japura
    Tocantins
    Araguaia
    Xingu
    Tapajós|Tapajos
    Negro
    Juruá|Jurua
    Ucayali
    Marañón|Maranon
    Magdalena
    Orange
    Limpopo
    Okavango
    Senegal
    Ubangi
    Kasai
    Blue Nile
    White Nile
    Salween
    Irrawaddy
    Amu Darya
    Syr Darya
    Godavari
    Krishna
    Narmada
    Yamuna
    Sutlej
    Chenab
    Helmand
    Tarim
    Pearl River|Xi River
    Songhua
    Vilyuy
    Aldan
    Angara
    Lower Tunguska
    Elbe
    Vistula
    Loire
    Fraser
    Nelson
    Churchill
    Peace
    Athabasca
    Saskatchewan
    Tennessee
    Canadian
    Brazos
    Pecos
  `),
  sheet('s-engineering-material', 'science', 'Name a material used in engineering or manufacturing', 'Engineering materials', `
    Steel
    Iron
    Aluminium|Aluminum
    Concrete
    Wood|Timber
    Plastic
    Glass
    Copper
    Titanium
    Rubber
    Carbon fibre|Carbon fiber
    Brick
    Stone
    Ceramic|Ceramics
    Stainless steel
    Brass
    Bronze
    Cast iron
    Nylon
    Polyester
    PVC
    Polythene|Polyethylene
    Polypropylene
    Fibreglass|Fiberglass;Glass fibre
    Kevlar
    Silicon
    Silicone
    Graphite
    Graphene
    Diamond
    Plywood
    MDF
    Cement
    Asphalt|Tarmac
    Lead
    Zinc
    Tin
    Nickel
    Tungsten
    Magnesium
    Chromium
    Cobalt
    Gold
    Silver
    Platinum
    Epoxy|Epoxy resin
    Acrylic|Perspex;Plexiglass
    Polycarbonate
    Polystyrene
    ABS
    Teflon|PTFE
    Leather
    Cotton
    Paper
    Cardboard
    Cork
    Bamboo
    Composite|Composites
    Inconel
    Invar
    Solder
    Duralumin
    Aerogel
    Gallium arsenide
    Tungsten carbide
    Silicon carbide
    Boron nitride
    Porcelain
    Terracotta
    Gypsum|Plaster
    Plasterboard|Drywall
  `),
  sheet('s-film-series', 'screen', 'Name a film series with at least three films', 'Film series', `
    Star Wars
    Harry Potter
    James Bond|Bond;007
    The Lord of the Rings|Lord of the Rings;Middle-earth
    Toy Story
    Marvel Cinematic Universe|MCU;Avengers
    Fast & Furious|Fast and Furious
    Jurassic Park|Jurassic World
    Indiana Jones
    Mission: Impossible|Mission Impossible
    Pirates of the Caribbean
    The Hunger Games|Hunger Games
    Rocky|Creed
    Shrek
    Back to the Future
    The Godfather|Godfather
    Alien
    Terminator
    Die Hard
    Rambo
    Batman
    Spider-Man|Spiderman
    X-Men
    Transformers
    Twilight
    Ice Age
    Despicable Me|Minions
    Madagascar
    Kung Fu Panda
    How to Train Your Dragon
    Cars
    Paddington
    The Matrix|Matrix
    John Wick
    Mad Max
    Planet of the Apes
    Halloween
    Friday the 13th
    A Nightmare on Elm Street|Nightmare on Elm Street
    Scream
    Saw
    Final Destination
    Paranormal Activity
    The Conjuring|Conjuring
    Insidious
    Lethal Weapon
    Beverly Hills Cop
    Police Academy
    Home Alone
    Night at the Museum
    Pitch Perfect
    The Hangover|Hangover
    American Pie
    Meet the Parents
    Austin Powers
    Men in Black
    Ghostbusters
    Star Trek
    The Mummy
    Jaws
    Superman
    Rush Hour
    Ocean's|Ocean's Eleven
    Bourne|Jason Bourne
    The Karate Kid|Karate Kid
    Predator
    RoboCop
    Underworld
    Resident Evil
    Blade
    The Hobbit|Hobbit
    The Chronicles of Narnia|Narnia
    Divergent
    The Maze Runner|Maze Runner
    Fantastic Beasts
    Hellboy
    Carry On
    Hotel Transylvania
    The Purge
    Jackass
    Bad Boys
    Taken
    The Expendables|Expendables
    Sharknado
    Godzilla
    Dirty Harry
    Death Wish
    The Pink Panther|Pink Panther
    Mighty Ducks
    Smokey and the Bandit
    Evil Dead
    Child's Play|Chucky
    Hellraiser
    Spy Kids
    Cheaper by the Dozen
    Diary of a Wimpy Kid
    The Lego Movie
  `),
  sheet('s-black-sea-coast', 'geography', 'Name a country with a Black Sea coastline', 'Black Sea coastlines', `
    Turkey|Türkiye
    Russia
    Ukraine
    Romania
    Bulgaria
    Georgia
  `),
  sheet('s-rock-type', 'science', 'Name a type of rock', 'Rocks', `
    Granite
    Marble
    Limestone
    Sandstone
    Basalt
    Slate
    Chalk
    Obsidian
    Pumice
    Shale
    Coal
    Flint
    Gneiss
    Schist
    Quartzite
    Igneous rock|Igneous
    Sedimentary rock|Sedimentary
    Metamorphic rock|Metamorphic
    Conglomerate
    Breccia
    Mudstone
    Siltstone
    Claystone
    Gabbro
    Diorite
    Andesite
    Rhyolite
    Tuff
    Scoria
    Dolomite
    Travertine
    Tufa
    Soapstone|Steatite
    Serpentinite
    Peridotite
    Pegmatite
    Porphyry
    Dolerite
    Greywacke
    Ironstone
    Chert
    Jasper
    Hornfels
    Phyllite
    Amphibolite
    Eclogite
    Marl
    Gritstone|Millstone grit
    Kimberlite
    Lava
    Ignimbrite
    Komatiite
    Anorthosite
    Evaporite|Rock salt
    Oil shale
    Granodiorite
    Syenite
  `),
  sheet('s-borders-germany', 'geography', 'Name a country that shares a land border with Germany', 'Germany’s neighbours', `
    France
    Poland
    Austria
    Switzerland
    Netherlands|Holland
    Belgium
    Denmark
    Czech Republic|Czechia
    Luxembourg
  `),
  sheet('s-string-instrument', 'music', 'Name a musical instrument with strings', 'String instruments', `
    Guitar
    Violin|Fiddle
    Cello
    Harp
    Piano
    Double bass|Bass;Upright bass
    Viola
    Ukulele|Uke
    Banjo
    Mandolin
    Bass guitar
    Electric guitar
    Sitar
    Lute
    Harpsichord
    Lyre
    Zither
    Balalaika
    Dulcimer|Hammered dulcimer
    Koto
    Bouzouki
    Oud
    Shamisen
    Erhu
    Pipa
    Guzheng
    Hurdy-gurdy
    Autoharp
    Viol|Viola da gamba
    Sarangi
    Sarod
    Veena|Vina
    Kora
    Charango
    Cavaquinho
    Theorbo
    Clavichord
    Psaltery
    Rebec
    Nyckelharpa
    Hardanger fiddle
    Kantele
    Gusli
    Domra
    Bandura
    Cimbalom
    Santur|Santoor
    Kemenche
    Morin khuur|Horsehead fiddle
    Berimbau
    Lap steel guitar|Steel guitar
    Pedal steel guitar
    Tanpura|Tambura
    Rubab
    Tar
    Saz|Bağlama
    Tres
    Cuatro
    Bajo sexto
    Guitarrón
    Vihuela
    Biwa
    Gayageum
    Đàn bầu|Dan bau
  `),
  sheet('s-cloud-genus', 'science', 'Name one of the ten main types of cloud', 'Cloud types', `
    Cumulus
    Cirrus
    Stratus
    Cumulonimbus|Thundercloud
    Nimbostratus
    Altocumulus
    Altostratus
    Stratocumulus
    Cirrostratus
    Cirrocumulus
  `),
  sheet('s-needle-tree', 'nature', 'Name a tree with needles or scale-like leaves', 'Needle-leaved trees', `
    Pine
    Christmas tree
    Fir
    Spruce
    Cedar
    Yew
    Larch
    Redwood
    Sequoia|Giant sequoia
    Cypress
    Juniper
    Hemlock
    Douglas fir
    Scots pine
    Norway spruce
    Monkey puzzle|Araucaria
    Leylandii|Leyland cypress
    Cedar of Lebanon
    Deodar
    Dawn redwood
    Bald cypress|Swamp cypress
    Arborvitae|Thuja
    Western red cedar
    Kauri
    Wollemi pine
    Bristlecone pine
    Sitka spruce
    Blue spruce
    Nordmann fir
    Noble fir
    Lodgepole pine
    Monterey pine
    Norfolk Island pine
    Tamarack
    Japanese cedar|Cryptomeria
    Podocarp
    Totara
    Rimu
    Casuarina|She-oak
    Tamarisk
    Atlas cedar
    Stone pine
    Black pine
    Ponderosa pine
    Eastern white pine
  `),
  sheet('s-european-river', 'geography', 'Name a river in Europe', 'European rivers', `
    Thames
    Danube
    Rhine
    Seine
    Severn
    Volga
    Loire
    Rhône|Rhone
    Elbe
    Tiber
    Po
    Mersey
    Tyne
    Trent
    Clyde
    Shannon
    Liffey
    Tay
    Spey
    Dee
    Wye
    Avon
    Ouse
    Tees
    Wear
    Humber
    Tagus|Tajo;Tejo
    Douro|Duero
    Ebro
    Guadalquivir
    Guadiana
    Garonne
    Dordogne
    Somme
    Marne
    Moselle
    Meuse|Maas
    Scheldt
    Main
    Neckar
    Oder
    Vistula
    Dnieper
    Dniester
    Don
    Neva
    Ural
    Arno
    Adige
    Inn
    Drava
    Sava
    Tisza
    Morava
    Vltava
    Glomma
    Göta älv|Gota alv
    Kemijoki
    Daugava|Western Dvina
    Neman
    Northern Dvina
    Pechora
    Kama
    Oka
    Lea|Lee
    Cam
    Exe
    Tamar
    Medway
    Ness
    Forth
    Bann
    Boyne
    Lagan
    Foyle
    Struma
    Maritsa|Evros
    Vardar
    Prut
    Mur
    Aare
    Reuss
    Isar
    Weser
    Ems
    Lech
    Ruhr
    Saar
    Saône|Saone
    Charente
    Lot
    Tarn
    Vienne
    Allier
    Durance
    Isère|Isere
    Minho
    Mondego
    Júcar|Jucar
    Segura
    Tormes
  `),
  sheet('s-leaf-herb', 'food', 'Name a herb used for its leaves in cooking', 'Leafy herbs', `
    Basil
    Parsley
    Mint
    Coriander|Cilantro
    Rosemary
    Thyme
    Sage
    Oregano
    Chives
    Dill
    Bay leaf|Bay;Bay leaves
    Tarragon
    Marjoram
    Lemongrass
    Curry leaf|Curry leaves
    Lemon balm
    Chervil
    Sorrel
    Fenugreek|Methi
    Kaffir lime leaves|Lime leaves;Makrut lime leaves
    Lovage
    Savory|Summer savory;Winter savory
    Borage
    Thai basil
    Holy basil|Tulsi
    Spearmint
    Peppermint
    Shiso|Perilla
    Fennel|Fennel fronds
    Celery leaf|Celery leaves
    Rocket|Arugula
    Watercress
    Wild garlic|Ramsons
    Garlic chives
    Pandan
    Vietnamese coriander|Rau ram
    Culantro
    Epazote
    Hoja santa
    Lemon verbena
    Stevia
    Nasturtium
    Salad burnet
    Hyssop
    Lemon thyme
    Za'atar
    Sweet cicely
    Angelica
    Rue
    Chamomile
  `),
  sheet('s-web-browser', 'science', 'Name a web browser', 'Web browsers', `
    Google Chrome|Chrome
    Safari
    Firefox|Mozilla Firefox
    Microsoft Edge|Edge
    Internet Explorer|IE
    Opera
    Brave
    Samsung Internet
    DuckDuckGo
    Vivaldi
    Tor Browser|Tor
    Netscape|Netscape Navigator
    Chromium
    Arc
    UC Browser
    Opera GX
    Opera Mini
    Mosaic|NCSA Mosaic
    Konqueror
    Epiphany|GNOME Web
    Waterfox
    Pale Moon
    SeaMonkey
    Maxthon
    Yandex Browser
    QQ Browser
    Silk|Amazon Silk
    Puffin
    Lynx
    WorldWideWeb|Nexus
    Midori
    Falkon
    LibreWolf
    Ecosia
    Comet
    Atlas|ChatGPT Atlas
    Dia
    Zen Browser|Zen
    Ladybird
  `),
  sheet('s-borders-south-africa', 'geography', 'Name a country that shares a land border with South Africa', 'South Africa’s neighbours', `
    Namibia
    Botswana
    Zimbabwe
    Mozambique
    Lesotho
    Eswatini|Swaziland
  `),
  sheet('s-martial-art', 'sport', 'Name a martial art or combat sport', 'Martial arts', `
    Karate
    Judo
    Boxing
    Kung fu
    Taekwondo
    Jiu-jitsu|Jujitsu;Brazilian jiu-jitsu;BJJ
    Kickboxing
    Wrestling
    MMA|Mixed martial arts;UFC
    Muay Thai|Thai boxing
    Aikido
    Fencing
    Sumo
    Kendo
    Krav Maga
    Capoeira
    Tai chi
    Wing Chun
    Sambo
    Savate
    Hapkido
    Kali|Eskrima;Arnis
    Silat|Pencak silat
    Jeet Kune Do
    Kyokushin
    Shotokan
    Ninjutsu
    Iaido
    Kyudo
    Kenpo|Kempo
    Shorinji Kempo
    Sanda|Sanshou
    Wushu
    Bartitsu
    Glima
    Pankration
    Catch wrestling
    Greco-Roman wrestling
    Lethwei
    Bokator
    Kalaripayattu
    Gatka
    Systema
    Hwa Rang Do
    Tang Soo Do
    Kudo
    Vovinam
    Bajiquan
    Shaolin kung fu
    Bando
    Combat sambo
    Defendu
    Taekkyon
  `),
  sheet('s-desert-plant', 'nature', 'Name a plant adapted to desert conditions', 'Desert plants', `
    Cactus
    Aloe vera|Aloe
    Saguaro|Saguaro cactus
    Prickly pear
    Agave
    Joshua tree
    Date palm
    Yucca
    Tumbleweed
    Creosote bush
    Mesquite
    Barrel cactus
    Ocotillo
    Welwitschia
    Sagebrush
    Desert rose
    Jade plant
    Living stones|Lithops
    Baobab
    Acacia
    Palo verde
    Cholla
    Organ pipe cactus
    Euphorbia
    Desert ironwood|Ironwood
    Jojoba
    Brittlebush
    Desert marigold
    Desert willow
    Hedgehog cactus
    Fishhook cactus
    Ghost plant
    Resurrection plant
    Rose of Jericho
    Spinifex
    Saltbush
    Quiver tree
    Boojum tree
    Elephant tree
    Smoke tree
    Desert lily
    Sand verbena
    Ice plant
    Haworthia
    Echeveria
    Sedum
    Sotol
    Teddy bear cholla
    Night-blooming cereus
    Peyote
    Camel thorn
    Tamarisk
    Ephedra
    Succulent
  `),
  sheet('s-lang-after-2000', 'science', 'Name a programming language first released after 2000', 'Programming languages after 2000', `
    Swift
    Kotlin
    Go|Golang
    Rust
    TypeScript
    Dart
    Scala
    Julia
    Elixir
    Clojure
    Groovy
    F#|F sharp
    Zig
    Nim
    Crystal
    Solidity
    Mojo
    Carbon
    Elm
    Hack
    CoffeeScript
    Haxe
    Ceylon
    Pony
    Red
    Gleam
    V
    Odin
    Vala
    Chapel
    Fantom
    Factor
    Io
    Ballerina
    Raku|Perl 6
    PowerShell
    Apex
    Bicep
    Q#|Q sharp
    WebAssembly|Wasm
    PureScript
    ReasonML|Reason
    Idris
    Agda
    Lean
  `),
  sheet('s-capital-on-river', 'geography', 'Name a capital city that stands on a river', 'Capitals on rivers', `
    London
    Paris
    Rome
    Budapest
    Vienna
    Prague
    Cairo
    Berlin
    Moscow
    Warsaw
    Dublin
    Lisbon
    Madrid
    Belgrade
    Bratislava
    Kyiv|Kiev
    Bangkok
    Seoul
    Baghdad
    Phnom Penh
    Washington DC|Washington
    Ottawa
    Buenos Aires
    Montevideo
    Asunción|Asuncion
    Lima
    Bogotá|Bogota
    Georgetown
    Paramaribo
    Khartoum
    Kinshasa
    Brazzaville
    Bamako
    Niamey
    N'Djamena
    Vientiane
    Hanoi
    Dhaka
    Kathmandu
    Kabul
    Ulaanbaatar
    Canberra
    Riga
    Vilnius
    Ljubljana
    Zagreb
    Sarajevo
    Skopje
    Bucharest
    Chisinau
    Minsk
    Tbilisi
    Yerevan
    Bern
    Luxembourg|Luxembourg City
    Brussels
    Amsterdam
    Stockholm
    Oslo
    Cardiff
    Belfast
    Monrovia
    Bissau
    Banjul
    Pretoria
    Juba
    Libreville
    Kuala Lumpur
    Manila
    Jakarta
    Tokyo
    Taipei
    Pyongyang
    Santiago
    Tegucigalpa
    Damascus
    Astana
    Dushanbe
    Bishkek
    Nicosia
  `),
  sheet('s-mallet-instrument', 'music', 'Name a musical instrument usually played with mallets', 'Mallet instruments', `
    Xylophone
    Glockenspiel
    Marimba
    Vibraphone|Vibes
    Timpani|Kettle drum
    Tubular bells|Chimes
    Gong
    Bass drum
    Steel drum|Steelpan;Steel pan
    Dulcimer|Hammered dulcimer
    Cimbalom
    Crotales
    Balafon
    Gamelan
    Bell plate
    Orchestral bells
    Tam-tam
    Metallophone
    Santur|Santoor
    Yangqin
    Bonang
    Tenor drum
    Taiko
    Suspended cymbal
    Kulintang
  `),
  sheet('s-space-telescope', 'science', 'Name a space telescope', 'Space telescopes', `
    Hubble|Hubble Space Telescope
    James Webb|James Webb Space Telescope;JWST;Webb
    Kepler
    Spitzer
    Chandra
    TESS|Transiting Exoplanet Survey Satellite
    Gaia
    Euclid
    Fermi|Fermi Gamma-ray Space Telescope
    Compton|Compton Gamma Ray Observatory
    Herschel
    Planck
    COBE
    WMAP
    WISE|NEOWISE
    CHEOPS
    XMM-Newton
    Swift
    NuSTAR
    Roman|Nancy Grace Roman Space Telescope
    Xuntian|CSST
    SOHO
    Solar Dynamics Observatory|SDO
    IRAS
    Hipparcos
    CoRoT
    GALEX
    ROSAT
    Suzaku
    Hinode
    XRISM
    eROSITA|Spektr-RG
    Akari
    Uhuru
    Einstein Observatory
    Copernicus|OAO-3
    IUE|International Ultraviolet Explorer
    Kepler K2|K2
    Ariel
    PLATO
    SPHEREx
    Aditya-L1
    Astrosat
  `),
];
