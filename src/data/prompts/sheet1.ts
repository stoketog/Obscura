import type { PromptGroup, PromptSeed } from '@/lib/types';
import { ranked } from './atlas';

/**
 * The factual questions from the 2,000-question sheet (scripts/answers/csv/questions-2000.csv), each with a full
 * answer list written by hand in order of how well known each answer is. Closed lists are complete; open ones are
 * deliberately generous. A list with fewer than 12 possible answers is marked `closed`.
 */
export function sheet(id: string, group: PromptGroup, text: string, category: string, lines: string): PromptSeed {
  const seed = ranked(id, group, text, category, lines);
  return seed.answers.length < 12 ? { ...seed, closed: true } : seed;
}

export const SHEET1: PromptSeed[] = [
  sheet('s-8000m-peak', 'geography', 'Name a mountain higher than 8,000 metres', 'Eight-thousanders', `
    Mount Everest|Everest;Sagarmatha;Chomolungma
    K2|Mount Godwin-Austen;Chhogori
    Kangchenjunga|Kanchenjunga
    Annapurna|Annapurna I
    Lhotse
    Makalu
    Nanga Parbat
    Cho Oyu
    Dhaulagiri|Dhaulagiri I
    Manaslu
    Broad Peak
    Gasherbrum I|Hidden Peak
    Gasherbrum II
    Shishapangma|Shisha Pangma;Xixabangma
  `),
  sheet('s-borders-brazil', 'geography', 'Name a country that shares a land border with Brazil', 'Brazil’s neighbours', `
    Argentina
    Colombia
    Peru
    Venezuela
    Bolivia
    Paraguay
    Uruguay
    Guyana
    Suriname
    France|French Guiana
  `),
  sheet('s-bird-of-prey', 'nature', 'Name a bird of prey', 'Birds of prey', `
    Eagle
    Hawk
    Falcon
    Owl
    Vulture
    Golden eagle
    Bald eagle
    Buzzard
    Peregrine falcon|Peregrine
    Osprey
    Kestrel
    Red kite|Kite
    Barn owl
    Condor|Andean condor;California condor
    Sparrowhawk
    Harrier|Hen harrier;Marsh harrier
    Goshawk
    Hobby
    Merlin
    Harpy eagle
    Secretary bird|Secretarybird
    Caracara
    Snowy owl
    Tawny owl
    Eagle owl|Eurasian eagle-owl
    White-tailed eagle|Sea eagle
    Red-tailed hawk
    Gyrfalcon
    Lammergeier|Bearded vulture
    Griffon vulture
    Black kite
    Philippine eagle
    Fish eagle|African fish eagle
    Honey buzzard
    Steppe eagle
    Short-eared owl
    Long-eared owl
    Little owl
    Shikra
    Crested caracara
    Lanner falcon
    Saker falcon
    Turkey vulture
    King vulture
    Laughing falcon
    Bateleur
    Martial eagle
    Crowned eagle
  `),
  sheet('s-alkali-metal', 'science', 'Name an alkali metal', 'Alkali metals', `
    Sodium
    Potassium
    Lithium
    Caesium|Cesium
    Rubidium
    Francium
  `),
  sheet('s-indian-ocean-island', 'geography', 'Name an island in the Indian Ocean', 'Indian Ocean islands', `
    Madagascar
    Sri Lanka|Ceylon
    Maldives
    Mauritius
    Seychelles
    Zanzibar
    Réunion|Reunion
    Comoros
    Socotra
    Mahé|Mahe
    Praslin
    La Digue
    Rodrigues
    Mayotte
    Pemba
    Lamu
    Andaman Islands|Andamans
    Nicobar Islands
    Christmas Island
    Cocos (Keeling) Islands|Cocos Islands;Keeling Islands
    Diego Garcia
    Chagos Islands|Chagos Archipelago
    Kerguelen Islands|Kerguelen
    Heard Island
    Amsterdam Island
    Prince Edward Islands
    Crozet Islands
    Mafia Island
    Nosy Be
    Male|Malé
    Grande Comore|Ngazidja
    Anjouan
    Mohéli|Moheli
    Aldabra
    Agaléga|Agalega
    Lakshadweep
    Sumatra
    Java
  `),
  sheet('s-gymnosperm', 'science', 'Name a seed-bearing plant that is not a flowering plant', 'Conifers and other gymnosperms', `
    Pine|Pine tree
    Fir|Fir tree
    Spruce
    Yew
    Cedar
    Larch
    Redwood|Coast redwood
    Sequoia|Giant sequoia
    Juniper
    Ginkgo|Ginkgo biloba;Maidenhair tree
    Cycad|Sago palm
    Cypress
    Douglas fir
    Scots pine
    Norway spruce
    Monkey puzzle|Monkey puzzle tree;Araucaria
    Hemlock|Hemlock tree
    Christmas tree
    Leylandii|Leyland cypress
    Dawn redwood
    Kauri
    Welwitschia
    Ephedra
    Gnetum
    Podocarp|Podocarpus
    Wollemi pine
    Bristlecone pine
    Norfolk Island pine
    Cedar of Lebanon
    Deodar
    Arborvitae|Thuja
    Bald cypress|Swamp cypress
    Plum yew
    Totara
    Rimu
    Monterey pine
    Lodgepole pine
    Stone pine
    Sitka spruce
    Blue spruce
    Noble fir
    Nordmann fir
  `),
  sheet('s-summer-olympic-sport', 'sport', 'Name a Summer Olympic sport or discipline', 'Summer Olympic sports', `
    Athletics|Track and field
    Swimming
    Gymnastics
    Football|Soccer
    Basketball
    Tennis
    Boxing
    Cycling
    Rowing
    Diving
    Archery
    Hockey|Field hockey
    Volleyball
    Judo
    Fencing
    Sailing|Yachting
    Table tennis|Ping pong
    Badminton
    Weightlifting
    Wrestling
    Equestrian|Show jumping;Dressage;Eventing
    Golf
    Handball
    Water polo
    Shooting
    Taekwondo
    Triathlon
    Beach volleyball
    Canoeing|Canoe sprint;Canoe slalom;Kayaking
    Modern pentathlon
    Rugby sevens|Rugby
    Skateboarding
    Surfing
    Sport climbing|Climbing
    Breaking|Breakdancing
    Karate
    Baseball
    Softball
    BMX
    Mountain biking
    Artistic swimming|Synchronised swimming
    Trampoline
    Rhythmic gymnastics
    Marathon swimming|Open water swimming
    Track cycling
    Road cycling
    3x3 basketball
    Cricket
    Lacrosse
    Polo
    Tug of war
    Rugby union
    Croquet
    Jeu de paume
    Rackets
    Pelota|Basque pelota
    Motorboating|Powerboating
    Roque
    Art competitions
  `),
  sheet('s-em-radiation', 'science', 'Name a type of electromagnetic radiation', 'The electromagnetic spectrum', `
    Light|Visible light
    X-rays|X-ray;Xray
    Ultraviolet|UV;Ultraviolet light;Ultraviolet radiation
    Infrared|IR;Infrared radiation
    Radio waves|Radio;Radio wave
    Microwaves|Microwave
    Gamma rays|Gamma ray;Gamma radiation
    Terahertz radiation|Terahertz;T-rays
    Extreme ultraviolet|EUV
    UVA
    UVB
    UVC
    Near infrared
    Far infrared
    Shortwave|Short wave
    Long wave|Longwave
    VHF
    UHF
    Millimetre waves|Millimeter waves
  `),
  sheet('s-borders-turkey', 'geography', 'Name a country that shares a land border with Türkiye', 'Türkiye’s neighbours', `
    Greece
    Syria
    Iran
    Iraq
    Bulgaria
    Georgia
    Armenia
    Azerbaijan|Nakhchivan
  `),
  sheet('s-metamorphosis', 'nature', 'Name an animal that undergoes metamorphosis', 'Animals that metamorphose', `
    Butterfly|Caterpillar
    Frog|Tadpole
    Moth
    Toad
    Beetle
    Bee|Honeybee;Honey bee
    Ladybird|Ladybug
    Dragonfly
    Mosquito
    Fly|Housefly
    Newt
    Salamander
    Ant
    Wasp
    Grasshopper
    Axolotl
    Flea
    Mayfly
    Damselfly
    Cicada
    Cockroach
    Lacewing
    Caddisfly
    Silkworm|Silk moth
    Crab
    Lobster
    Barnacle
    Starfish|Sea star
    Sea urchin
    Eel
    Flounder|Flatfish
    Lamprey
    Jellyfish
    Coral
    Tunicate|Sea squirt
    Hoverfly
    Crane fly
    Termite
    Praying mantis|Mantis
    Earwig
    Aphid
    Stick insect
    Locust
    Weevil
    Sawfly
  `),
  sheet('s-radioactive-element', 'science', 'Name a radioactive chemical element', 'Radioactive elements', `
    Uranium
    Plutonium
    Radium
    Radon
    Polonium
    Thorium
    Americium
    Francium
    Technetium
    Promethium
    Astatine
    Actinium
    Protactinium
    Neptunium
    Curium
    Berkelium
    Californium
    Einsteinium
    Fermium
    Mendelevium
    Nobelium
    Lawrencium
    Rutherfordium
    Dubnium
    Seaborgium
    Bohrium
    Hassium
    Meitnerium
    Darmstadtium
    Roentgenium
    Copernicium
    Nihonium
    Flerovium
    Moscovium
    Livermorium
    Tennessine
    Oganesson
    Bismuth
  `),
  sheet('s-nocturnal-mammal', 'nature', 'Name a nocturnal mammal', 'Nocturnal mammals', `
    Bat
    Hedgehog
    Fox|Red fox
    Badger
    Owl monkey|Night monkey
    Raccoon
    Possum|Opossum
    Mouse
    Rat
    Hamster
    Bushbaby|Galago
    Aye-aye
    Slow loris|Loris
    Tarsier
    Sugar glider
    Wombat
    Pangolin
    Aardvark
    Armadillo
    Skunk
    Porcupine
    Hyena
    Leopard
    Lion
    Bilby
    Quoll
    Tasmanian devil
    Koala
    Fennec fox
    Kinkajou
    Flying squirrel
    Dormouse
    Jerboa
    Gerbil
    Tapir
    Hippopotamus|Hippo
    Ocelot
    Serval
    Genet
    Civet
    Mongoose
    Polecat
    Pine marten|Marten
    Mink
    Ferret
    Vole
    Shrew
    Mole
    Flying fox|Fruit bat
    Bandicoot
    Numbat
    Potoroo
    Brushtail possum
    Honey badger
    Aardwolf
    Caracal
    Lynx
    Bobcat
    Coyote
    Jackal
    Moon rat
  `),
  sheet('s-cyrillic-language', 'general', 'Name a language commonly written in the Cyrillic alphabet', 'Cyrillic languages', `
    Russian
    Ukrainian
    Bulgarian
    Serbian
    Belarusian|Belarussian
    Macedonian
    Kazakh
    Mongolian
    Kyrgyz|Kirghiz
    Tajik
    Montenegrin
    Bosnian
    Rusyn
    Chechen
    Tatar
    Bashkir
    Chuvash
    Yakut|Sakha
    Ossetian
    Avar
    Abkhaz
    Buryat
    Kalmyk
    Komi
    Udmurt
    Mari
    Moksha
    Erzya
    Tuvan
    Church Slavonic|Old Church Slavonic
    Uzbek
    Turkmen
    Azerbaijani|Azeri
    Moldovan|Romanian
    Dungan
    Nenets
    Chukchi
    Evenki
  `),
  sheet('s-keyboard-instrument', 'music', 'Name a keyboard instrument', 'Keyboard instruments', `
    Piano
    Organ|Pipe organ
    Keyboard|Electric keyboard
    Synthesizer|Synth;Synthesiser
    Harpsichord
    Accordion
    Grand piano
    Electric piano
    Hammond organ
    Celesta|Celeste
    Clavichord
    Harmonium
    Spinet
    Virginals|Virginal
    Upright piano
    Melodica
    Fortepiano
    Pianola|Player piano
    Keytar
    Mellotron
    Carillon
    Clavinet
    Fender Rhodes|Rhodes
    Wurlitzer
    Moog
    Ondes Martenot
    Reed organ|Pump organ
    Keyboard glockenspiel
    Hurdy-gurdy
    Concertina
    Melodeon
    Toy piano
    Digital piano
    Calliope
    Regal
    Claviorgan
  `),
  sheet('s-indian-ocean-coast', 'geography', 'Name a country with an Indian Ocean coastline', 'Indian Ocean coastlines', `
    India
    Australia
    South Africa
    Kenya
    Sri Lanka
    Indonesia
    Madagascar
    Maldives
    Mozambique
    Tanzania
    Somalia
    Pakistan
    Thailand
    Malaysia
    Bangladesh
    Myanmar|Burma
    Mauritius
    Seychelles
    Iran
    Oman
    Yemen
    Saudi Arabia
    United Arab Emirates|UAE
    Egypt
    Sudan
    Eritrea
    Djibouti
    Comoros
    Timor-Leste|East Timor
    Qatar
    Bahrain
    Kuwait
    Iraq
    Israel
    Jordan
    France|Réunion;Mayotte
    United Kingdom|British Indian Ocean Territory
  `),
  sheet('s-tropic-cancer', 'geography', 'Name a country crossed by the Tropic of Cancer', 'Tropic of Cancer countries', `
    Mexico
    India
    China
    Egypt
    Saudi Arabia
    Bahamas
    Algeria
    Libya
    Bangladesh
    Myanmar|Burma
    Taiwan
    Oman
    United Arab Emirates|UAE
    Mali
    Mauritania
    Niger
    Chad
    Western Sahara
    United States|USA;Hawaii
  `),
  sheet('s-chinese-dynasty', 'history', 'Name a historical dynasty in China', 'Chinese dynasties', `
    Ming|Ming dynasty
    Qing|Qing dynasty;Manchu dynasty
    Han|Han dynasty
    Tang|Tang dynasty
    Qin|Qin dynasty
    Song|Song dynasty
    Yuan|Yuan dynasty;Mongol dynasty
    Zhou|Zhou dynasty
    Shang|Shang dynasty
    Sui|Sui dynasty
    Xia|Xia dynasty
    Jin|Jin dynasty
    Northern Song
    Southern Song
    Western Han
    Eastern Han
    Western Zhou
    Eastern Zhou
    Liao|Liao dynasty
    Western Xia
    Northern Wei
    Northern Qi
    Northern Zhou
    Liu Song
    Southern Qi
    Liang|Liang dynasty
    Chen|Chen dynasty
    Later Liang
    Later Tang
    Later Jin
    Later Han
    Later Zhou
    Xin|Xin dynasty
    Wu Zhou
    Shu Han
    Cao Wei|Wei
    Eastern Wu|Wu
  `),
  sheet('s-marsupial', 'nature', 'Name a marsupial', 'Marsupials', `
    Kangaroo
    Koala
    Wallaby
    Wombat
    Tasmanian devil
    Possum|Opossum
    Sugar glider
    Quokka
    Bandicoot
    Numbat
    Bilby
    Quoll
    Tasmanian tiger|Thylacine
    Wallaroo
    Pademelon
    Potoroo
    Bettong
    Cuscus
    Tree kangaroo
    Red kangaroo
    Grey kangaroo
    Glider
    Brushtail possum
    Ringtail possum
    Honey possum
    Dunnart
    Antechinus
    Planigale
    Marsupial mole
    Kowari
    Mulgara
    Phascogale
    Virginia opossum
    Shrew opossum
    Monito del monte
    Woylie
    Quolls
    Rock wallaby
    Hare-wallaby
    Nail-tail wallaby
    Musky rat-kangaroo
    Diprotodon
  `),
  sheet('s-alps-mountain', 'geography', 'Name a mountain in the Alps', 'Alpine peaks', `
    Mont Blanc|Monte Bianco
    Matterhorn|Cervino;Monte Cervino
    Eiger
    Jungfrau
    Zugspitze
    Mönch|Monch
    Grossglockner|Großglockner
    Dom
    Monte Rosa|Dufourspitze
    Weisshorn
    Dent Blanche
    Piz Bernina
    Gran Paradiso
    Barre des Écrins|Barre des Ecrins
    Aiguille du Midi
    Grandes Jorasses
    Aiguille Verte
    Titlis
    Pilatus
    Rigi
    Säntis|Santis
    Wildspitze
    Ortler
    Triglav
    Marmolada
    Monte Viso|Monviso
    Piz Palü|Piz Palu
    Finsteraarhorn
    Aletschhorn
    Schreckhorn
    Lyskamm|Liskamm
    Breithorn
    Täschhorn|Taschhorn
    Dent d'Hérens
    Meije|La Meije
    Dachstein
    Watzmann
    Großvenediger|Grossvenediger
    Tödi|Todi
    Dents du Midi
    Mont Blanc du Tacul
    Gross Fiescherhorn
    Nordend
    Signalkuppe
    Zinalrothorn
  `),
  sheet('s-precolumbian', 'history', 'Name a civilisation of the Americas before European colonisation', 'Pre-Columbian civilisations', `
    Aztecs|Aztec;Aztec Empire;Mexica
    Incas|Inca;Inca Empire;Tawantinsuyu
    Maya|Mayans;Mayan;Maya civilisation
    Olmecs|Olmec
    Toltecs|Toltec
    Zapotecs|Zapotec
    Mixtecs|Mixtec
    Teotihuacan|Teotihuacán
    Moche|Mochica
    Nazca|Nasca
    Chimú|Chimu;Chimor
    Wari|Huari;Wari Empire
    Tiwanaku|Tiahuanaco
    Chavín|Chavin
    Paracas
    Norte Chico|Caral;Caral-Supe
    Muisca|Chibcha
    Taíno|Taino
    Mississippian culture|Mississippians;Cahokia
    Ancestral Puebloans|Anasazi;Puebloans
    Hohokam
    Mogollon
    Hopewell|Hopewell culture
    Adena|Adena culture
    Iroquois Confederacy|Haudenosaunee;Iroquois
    Purépecha|Tarascan;Tarascans;Purepecha
    Totonac|Totonacs
    Huastec|Huastecs
    Tlaxcala|Tlaxcaltecs
    Mapuche
    Arawak|Arawaks
    Caribs|Kalinago
    Valdivia culture|Valdivia
    Tairona
    Quimbaya
    Calusa
    Powhatan Confederacy|Powhatan
    Chachapoya|Chachapoyas
    Cañari|Canari
    Marajoara
    Clovis culture|Clovis
    Thule
    Dorset culture
    Inuit
  `),
  sheet('s-asian-river', 'geography', 'Name a river in Asia', 'Asian rivers', `
    Yangtze|Chang Jiang;Yangtze River
    Ganges|Ganga
    Yellow River|Huang He
    Mekong
    Indus
    Tigris
    Euphrates
    Brahmaputra
    Jordan
    Amur
    Irrawaddy|Ayeyarwady
    Ob
    Yenisei
    Lena
    Salween
    Pearl River|Zhujiang
    Chao Phraya
    Red River|Song Hong
    Amu Darya|Oxus
    Syr Darya
    Yamuna|Jumna
    Godavari
    Krishna
    Narmada
    Kaveri|Cauvery
    Mahanadi
    Ural
    Irtysh
    Kolyma
    Indigirka
    Tarim
    Han
    Sutlej
    Chenab
    Jhelum
    Ravi
    Beas
    Kura
    Aras|Araxes
    Helmand
    Kabul
    Shinano
    Tone
    Kiso
    Ishikari
    Tonle Sap
    Pasig
    Kapuas
    Mahakam
    Rajang
    Barito
    Musi
    Orontes
    Litani
    Kızılırmak|Kizilirmak
    Sakarya
    Selenga
    Angara
    Lower Tunguska
    Vilyuy
    Aldan
    Tobol
    Ishim
    Padma
    Meghna
    Teesta
    Karun
    Hooghly
  `),
  sheet('s-renewable-energy', 'science', 'Name a renewable energy source', 'Renewable energy', `
    Solar|Solar power;Solar energy;Sun;Sunlight
    Wind|Wind power;Wind energy
    Hydroelectric|Hydropower;Hydro;Water power;Hydroelectricity
    Tidal|Tidal power;Tidal energy;Tides
    Geothermal|Geothermal energy;Geothermal power
    Wave|Wave power;Wave energy
    Biomass|Biomass energy
    Biofuel|Biofuels;Biodiesel;Bioethanol;Ethanol
    Biogas
    Wood|Firewood
    Solar thermal
    Hydrogen|Green hydrogen
    Ocean thermal energy|OTEC
    Osmotic power|Salinity gradient
    Landfill gas
    Heat pump|Heat pumps;Air source heat pump;Ground source heat pump
    Pumped storage
    Animal power|Muscle power
  `),
  sheet('s-plucked-string', 'music', 'Name a plucked string instrument', 'Plucked string instruments', `
    Guitar|Acoustic guitar
    Harp
    Banjo
    Ukulele|Uke
    Mandolin
    Electric guitar
    Bass guitar|Bass
    Sitar
    Lute
    Lyre
    Harpsichord
    Zither
    Balalaika
    Koto
    Oud
    Bouzouki
    Double bass
    Dulcimer|Appalachian dulcimer;Mountain dulcimer
    Autoharp
    Pipa
    Guzheng
    Shamisen
    Charango
    Cavaquinho
    Cittern
    Theorbo
    Vihuela
    Kora
    Veena|Vina
    Sarod
    Tanpura|Tambura
    Bağlama|Saz;Baglama
    Domra
    Kantele
    Bandura
    Psaltery
    Biwa
    Yueqin
    Ruan
    Tres
    Cuatro
    Mandola
    Mandocello
    Lap steel guitar|Steel guitar
    Pedal steel guitar
    Twelve-string guitar|12-string guitar
    Classical guitar|Spanish guitar
    Guitarrón|Guitarron
    Bajo sexto
    Gusli
    Kanun|Qanun
    Ngoni
    Valiha
  `),
  sheet('s-halogen', 'science', 'Name a halogen', 'Halogens', `
    Chlorine
    Fluorine
    Iodine
    Bromine
    Astatine
    Tennessine
  `),
  sheet('s-fossil-fuel', 'science', 'Name a fossil fuel', 'Fossil fuels', `
    Coal
    Oil|Crude oil;Petroleum
    Natural gas|Gas;Methane
    Petrol|Gasoline
    Diesel
    Kerosene|Paraffin;Jet fuel
    Propane
    Butane
    LPG|Liquefied petroleum gas
    Lignite|Brown coal
    Anthracite
    Bituminous coal
    Peat
    Shale oil|Oil shale
    Shale gas
    Tar sands|Oil sands
    Coke
    Fuel oil|Heating oil
    Coal gas|Town gas
    Bitumen|Asphalt
    LNG|Liquefied natural gas
    Sub-bituminous coal
    Naphtha
  `),
  sheet('s-regenerating-animal', 'nature', 'Name an animal that can regenerate part of its body', 'Animals that regrow parts', `
    Starfish|Sea star
    Lizard
    Axolotl
    Gecko
    Salamander
    Earthworm|Worm
    Newt
    Planarian|Flatworm
    Sea cucumber
    Hydra
    Crab
    Lobster
    Octopus
    Deer|Antlers
    Spider
    Crayfish
    Zebrafish
    Shark|Teeth
    Brittle star
    Sea urchin
    Sponge
    Jellyfish|Immortal jellyfish
    Tadpole
    Skink
    Anole
    Iguana
    African spiny mouse|Spiny mouse
    Human|Liver
    Ribbon worm
    Sea anemone
    Snail
    Cockroach
    Stick insect
    Shrimp
    Coral
  `),
  sheet('s-caribbean-coast', 'geography', 'Name a country with a coastline on the Caribbean Sea', 'Caribbean coastlines', `
    Jamaica
    Cuba
    Mexico
    Colombia
    Venezuela
    Haiti
    Dominican Republic
    Belize
    Panama
    Costa Rica
    Honduras
    Nicaragua
    Guatemala
    Barbados
    Trinidad and Tobago|Trinidad
    Grenada
    Saint Lucia|St Lucia
    Saint Vincent and the Grenadines|St Vincent
    Dominica
    Antigua and Barbuda|Antigua
    Saint Kitts and Nevis|St Kitts
    Netherlands|Aruba;Curaçao;Bonaire
    United States|Puerto Rico;US Virgin Islands
    France|Martinique;Guadeloupe
    United Kingdom|Cayman Islands;Anguilla;Montserrat;British Virgin Islands
  `),
  sheet('s-revolution', 'history', 'Name a historical revolution', 'Revolutions', `
    French Revolution
    American Revolution|American War of Independence;American Revolutionary War
    Russian Revolution|October Revolution;Bolshevik Revolution
    Industrial Revolution
    Cuban Revolution
    Glorious Revolution
    Iranian Revolution|Islamic Revolution
    Chinese Revolution|Communist Revolution;Chinese Communist Revolution
    Mexican Revolution
    Haitian Revolution
    Velvet Revolution
    Cultural Revolution
    Xinhai Revolution|1911 Revolution
    February Revolution
    Revolutions of 1848|1848 Revolutions;Springtime of Nations
    Hungarian Revolution|Hungarian Revolution of 1956
    Carnation Revolution
    Romanian Revolution
    Orange Revolution
    Arab Spring
    Egyptian Revolution|Egyptian Revolution of 2011
    Tunisian Revolution|Jasmine Revolution
    Euromaidan|Revolution of Dignity;Maidan Revolution
    Rose Revolution
    Singing Revolution
    July Revolution
    Nicaraguan Revolution|Sandinista Revolution
    Philippine Revolution
    People Power Revolution|EDSA Revolution
    Texas Revolution
    Scientific Revolution
    Agricultural Revolution|Neolithic Revolution
    Green Revolution
    Digital Revolution
    Sexual revolution
    German Revolution|German Revolution of 1918
    Young Turk Revolution
    Meiji Restoration
    English Revolution
    Saffron Revolution
    Bolivarian Revolution
    Peaceful Revolution
    Hungarian Revolution of 1848
    Belgian Revolution
    Greek War of Independence|Greek Revolution
    Latin American wars of independence
    Algerian Revolution|Algerian War
    Iraqi Revolution|14 July Revolution
    Ethiopian Revolution
    Sudanese Revolution
  `),
  sheet('s-australian-mammal', 'nature', 'Name a mammal native to Australia', 'Australian mammals', `
    Kangaroo
    Koala
    Wombat
    Platypus
    Wallaby
    Tasmanian devil
    Echidna
    Dingo
    Quokka
    Sugar glider
    Possum
    Bandicoot
    Numbat
    Bilby
    Quoll
    Wallaroo
    Tasmanian tiger|Thylacine
    Flying fox|Fruit bat
    Pademelon
    Potoroo
    Bettong
    Dunnart
    Antechinus
    Tree kangaroo
    Cuscus
    Dugong
    Marsupial mole
    Hopping mouse
    Water rat|Rakali
    Brushtail possum
    Ringtail possum
    Honey possum
    Rock wallaby
    Red kangaroo
    Eastern grey kangaroo
    Planigale
    Mulgara
    Kowari
    Phascogale
    Australian sea lion
    Ghost bat
    Woylie
    Greater glider
    Feathertail glider
    Short-beaked echidna
    Long-nosed potoroo
    Southern hairy-nosed wombat
    Northern hairy-nosed wombat
  `),
  sheet('s-neptune-moon', 'science', 'Name a moon of Neptune', 'Moons of Neptune', `
    Triton
    Nereid
    Proteus
    Larissa
    Galatea
    Despina
    Thalassa
    Naiad
    Hippocamp
    Halimede
    Sao
    Laomedeia
    Psamathe
    Neso
  `),
  sheet('s-flag-star', 'geography', 'Name a country whose national flag has a star on it', 'Flags with a star', `
    United States|USA;America;US
    China
    Australia
    Brazil
    New Zealand
    Vietnam
    Turkey|Türkiye
    Israel
    Pakistan
    Chile
    Cuba
    North Korea
    Morocco
    Ghana
    Singapore
    Malaysia
    Somalia
    Algeria
    Tunisia
    Panama
    Venezuela
    Honduras
    Liberia
    Philippines
    Myanmar|Burma
    Syria
    Jordan
    Ethiopia
    Senegal
    Cameroon
    Burkina Faso
    Togo
    Guinea-Bissau
    Cape Verde|Cabo Verde
    São Tomé and Príncipe|Sao Tome and Principe
    Equatorial Guinea
    Democratic Republic of the Congo|DR Congo;DRC
    Central African Republic
    Djibouti
    Mozambique
    Zimbabwe
    Angola
    Bosnia and Herzegovina|Bosnia
    Kosovo
    Azerbaijan
    Uzbekistan
    Turkmenistan
    Tajikistan
    Mauritania
    Libya
    Comoros
    Solomon Islands
    Papua New Guinea
    Samoa
    Tuvalu
    Marshall Islands
    Micronesia
    Nauru
    Grenada
    Saint Kitts and Nevis
    Dominica
    Suriname
    Timor-Leste|East Timor
    South Sudan
  `),
  sheet('s-danube-city', 'geography', 'Name a city on the River Danube', 'Danube cities', `
    Vienna
    Budapest
    Belgrade
    Bratislava
    Linz
    Ulm
    Regensburg
    Passau
    Ingolstadt
    Novi Sad
    Ruse
    Galați|Galati
    Brăila|Braila
    Vidin
    Győr|Gyor
    Esztergom
    Komárno|Komarno
    Vukovar
    Smederevo
    Krems
    Melk
    Donaueschingen
    Tulcea
    Izmail
    Drobeta-Turnu Severin
    Calafat
    Svishtov
    Silistra
    Mohács|Mohacs
    Paks
    Dunaújváros|Dunaujvaros
    Vác|Vac
    Szentendre
    Neu-Ulm
    Straubing
    Deggendorf
    Tuttlingen
    Sigmaringen
    Dillingen
    Donauwörth|Donauworth
    Kelheim
    Tulln
    Hainburg
    Apatin
    Bačka Palanka|Backa Palanka
    Pančevo|Pancevo
    Kladovo
    Lom
    Nikopol
    Oltenița|Oltenita
    Cernavodă|Cernavoda
    Reni
    Vilkovo
  `),
  sheet('s-woodwind', 'music', 'Name a woodwind instrument', 'Woodwind instruments', `
    Flute
    Clarinet
    Saxophone|Sax
    Recorder
    Oboe
    Bassoon
    Piccolo
    Cor anglais|English horn
    Bass clarinet
    Contrabassoon|Double bassoon
    Alto saxophone
    Tenor saxophone
    Soprano saxophone
    Baritone saxophone
    Pan pipes|Panpipes;Pan flute
    Bagpipes
    Tin whistle|Penny whistle
    Fife
    Ocarina
    Harmonica
    Melodica
    Shakuhachi
    Duduk
    Didgeridoo
    Bansuri
    Oboe d'amore
    Basset horn
    E-flat clarinet
    Alto flute
    Bass flute
    Sarrusophone
    Crumhorn
    Shawm
    Rackett
    Heckelphone
    Contrabass clarinet
    Zurna
    Dizi
    Suona
    Kaval
    Ney
    Quena
    Fujara
    Tárogató|Tarogato
    Chalumeau
    Flageolet
    Whistle
  `),
  sheet('s-viral-disease', 'science', 'Name a disease caused by a virus', 'Viral diseases', `
    Flu|Influenza
    COVID-19|Covid;Coronavirus
    Common cold|Cold
    Chickenpox
    Measles
    Mumps
    HIV|AIDS
    Rabies
    Ebola
    Polio
    Smallpox
    Rubella|German measles
    Hepatitis B
    Hepatitis A
    Hepatitis C
    Herpes|Cold sores
    Shingles
    Glandular fever|Mononucleosis;Mono
    Dengue fever|Dengue
    Zika
    Yellow fever
    HPV|Human papillomavirus
    Warts|Verruca
    Norovirus|Winter vomiting bug
    Rotavirus
    SARS
    MERS
    Bird flu|Avian flu
    Swine flu
    Mpox|Monkeypox
    West Nile fever|West Nile virus
    Lassa fever
    Marburg|Marburg virus disease
    Chikungunya
    Hand, foot and mouth disease|Hand foot and mouth
    Foot-and-mouth disease
    Croup
    Bronchiolitis|RSV
    Viral meningitis
    Encephalitis|Japanese encephalitis
    Tick-borne encephalitis
    Hantavirus
    Fifth disease|Slapped cheek
    Roseola
    Molluscum contagiosum
    Tobacco mosaic
    Myxomatosis
    Distemper
    Parvovirus|Parvo
    Hepatitis E
    Hepatitis D
    Rift Valley fever
    Crimean-Congo haemorrhagic fever
    Kuru
  `),
  sheet('s-greenhouse-gas', 'science', 'Name a greenhouse gas', 'Greenhouse gases', `
    Carbon dioxide|CO2
    Methane|CH4
    Water vapour|Water vapor;Steam
    Nitrous oxide|N2O;Laughing gas
    Ozone
    CFCs|Chlorofluorocarbons;CFC
    HFCs|Hydrofluorocarbons;HFC
    Sulphur hexafluoride|Sulfur hexafluoride;SF6
    PFCs|Perfluorocarbons
    HCFCs|Hydrochlorofluorocarbons
    Nitrogen trifluoride|NF3
    Carbon tetrachloride
    Freon
    Halons|Halon
    Sulfuryl fluoride
    Carbon monoxide
  `),
  sheet('s-computer-hardware', 'science', 'Name a computer hardware component', 'Computer hardware', `
    CPU|Processor;Central processing unit
    RAM|Memory
    Motherboard
    Hard drive|Hard disk;HDD;Hard disk drive
    Graphics card|GPU;Video card
    Keyboard
    Mouse
    Monitor|Screen;Display
    SSD|Solid state drive
    Power supply|PSU;Power supply unit
    Fan|Cooling fan
    Heat sink|Heatsink
    Sound card
    Network card|NIC;Network interface card
    USB port|USB
    Case|Computer case;Tower
    Speakers
    Webcam
    Microphone
    Printer
    Scanner
    Modem
    Router
    DVD drive|CD drive;Optical drive
    BIOS chip|BIOS
    Chipset
    Battery|CMOS battery
    Trackpad|Touchpad
    Cables|Cable
    Floppy disk|Floppy drive
    Expansion card
    PCIe slot|PCI slot
    Ethernet port
    Wi-Fi card|WiFi adapter
    Bluetooth adapter
    Liquid cooling|Water cooling
    Thermal paste
    ROM
    Cache
    Northbridge
    Southbridge
    VRAM
    M.2 drive|NVMe
    Flash drive|USB stick;Memory stick
    Memory card|SD card
    Docking station
    KVM switch
    Joystick
    Graphics tablet
    Capture card
    Server rack
  `),
  sheet('s-one-letter-symbol', 'science', 'Name a chemical element with a one-letter symbol', 'One-letter element symbols', `
    Hydrogen
    Oxygen
    Carbon
    Nitrogen
    Potassium
    Iodine
    Sulfur|Sulphur
    Uranium
    Fluorine
    Phosphorus
    Boron
    Tungsten
    Vanadium
    Yttrium
  `),
  sheet('s-length-unit', 'science', 'Name a unit used to measure length', 'Units of length', `
    Metre|Meter;m
    Centimetre|Centimeter;cm
    Inch|Inches
    Foot|Feet
    Mile|Miles
    Kilometre|Kilometer;km
    Millimetre|Millimeter;mm
    Yard|Yards
    Light year|Light-year
    Nautical mile
    Micrometre|Micrometer;Micron
    Nanometre|Nanometer
    Furlong
    Hand
    Chain
    League
    Fathom
    Astronomical unit|AU
    Parsec
    Rod|Pole;Perch
    Cubit
    Angstrom|Ångström
    Picometre|Picometer
    Decimetre|Decimeter
    Hectometre
    Decametre
    Megametre
    Gigametre
    Femtometre|Fermi
    Link
    Span
    Thou|Mil
    Point
    Pica
    Cable
    Rack unit
    Planck length
    Barleycorn
    Ell
    Li
    Verst
    Shaku
  `),
  sheet('s-bioluminescent', 'nature', 'Name an animal that can produce its own light', 'Bioluminescent animals', `
    Firefly|Lightning bug
    Glow-worm|Glowworm
    Anglerfish
    Jellyfish
    Lanternfish
    Squid|Vampire squid
    Comb jelly|Ctenophore
    Plankton|Dinoflagellates
    Krill
    Octopus
    Dragonfish
    Hatchetfish
    Flashlight fish
    Cookiecutter shark
    Lantern shark
    Click beetle
    Railroad worm
    Sea pansy
    Brittle star
    Sea pen
    Ostracod|Sea firefly
    Shrimp
    Pyrosome
    Siphonophore
    Firefly squid
    Hawaiian bobtail squid
    Crystal jelly
    Gulper eel
    Viperfish
    Loosejaw
    Ponyfish
    Midshipman fish
    Fungus gnat
    Glowing millipede
    Piddock
    Sea cucumber
    Copepod
    Bristle worm
    Coral
    Sea gooseberry
    Atolla jellyfish
  `),
  sheet('s-flag-cross', 'geography', 'Name a country whose national flag has a cross on it', 'Flags with a cross', `
    Switzerland
    United Kingdom|UK;Britain;Great Britain
    Denmark
    Sweden
    Norway
    Finland
    Iceland
    Greece
    Australia
    New Zealand
    Georgia
    Malta
    Dominican Republic
    Slovakia
    Tonga
    Fiji
    Tuvalu
    Burundi
    Jamaica
    Serbia
    Montenegro
    Moldova
    Dominica
  `),
  sheet('s-borders-france', 'geography', 'Name a country that borders France in Europe', 'France’s European neighbours', `
    Spain
    Germany
    Italy
    Belgium
    Switzerland
    Luxembourg
    Monaco
    Andorra
  `),
  sheet('s-si-derived-unit', 'science', 'Name an SI derived unit', 'SI derived units', `
    Newton
    Joule
    Watt
    Volt
    Ohm
    Hertz|Hz
    Pascal|Pa
    Coulomb
    Farad
    Tesla
    Weber
    Henry
    Lumen
    Lux
    Becquerel
    Gray
    Sievert
    Katal
    Siemens
    Radian
    Steradian
    Degree Celsius|Celsius
    Square metre|Square meter
    Cubic metre|Cubic meter
    Metre per second|Meters per second
    Newton metre
    Watt per square metre
  `),
  sheet('s-egg-layer', 'nature', 'Name an animal that lays eggs', 'Egg-laying animals', `
    Chicken|Hen
    Duck
    Snake
    Turtle
    Platypus
    Fish
    Frog
    Bird
    Ostrich
    Crocodile
    Goose
    Lizard
    Echidna
    Penguin
    Tortoise
    Alligator
    Salmon
    Butterfly
    Spider
    Ant
    Bee
    Shark
    Octopus
    Toad
    Emu
    Turkey
    Quail
    Swan
    Eagle
    Owl
    Robin
    Pigeon
    Gecko
    Iguana
    Komodo dragon
    Python
    Cobra
    Mosquito
    Fly
    Snail
    Slug
    Cockroach
    Ladybird
    Dragonfly
    Starfish
    Squid
    Crab
    Lobster
    Newt
    Salamander
    Seahorse
    Sea turtle
    Cod
    Tuna
    Trout
    Herring
    Stingray
    Skate
    Hummingbird
    Flamingo
    Kiwi
    Cassowary
    Peacock
    Cuckoo
    Termite
    Moth
    Tick
    Louse|Lice
    Flea
    Worm
    Tapeworm
    Sea urchin
    Coral
  `),
];
