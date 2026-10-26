import type { PromptSeed } from '@/lib/types';
import { ranked } from '../atlas';

/**
 * Monday 26 October 2026, prompts set by hand. Ordered from the answer most people give to the most unheard-of;
 * generous on purpose, rarity scoring does the work. Royal Engineers is the only top answer for the FA Cup.
 */
const day = (seed: PromptSeed): PromptSeed => ({ ...seed, editorial: true });

export const DAY_2026_10_26: PromptSeed[] = [
  day(ranked('astronaut', 'science', 'Name an astronaut (anyone who has been to space)', 'Astronauts', `
    Neil Armstrong|Armstrong
    Buzz Aldrin|Aldrin;Edwin Aldrin
    Yuri Gagarin|Gagarin
    Tim Peake|Peake;Major Tim
    Helen Sharman|Sharman
    Chris Hadfield|Hadfield
    Sally Ride
    Valentina Tereshkova|Tereshkova
    John Glenn
    Alan Shepard
    Michael Collins
    William Shatner|Shatner;Captain Kirk
    Jeff Bezos|Bezos
    Richard Branson|Branson
    Katy Perry
    Jim Lovell|Lovell
    Gayle King
    Lauren Sánchez|Lauren Sanchez
    Scott Kelly
    Mark Kelly
    Peggy Whitson|Whitson
    Sunita Williams|Suni Williams
    Butch Wilmore|Barry Wilmore
    Christina Koch
    Reid Wiseman|Wiseman
    Victor Glover
    Jeremy Hansen
    Alexei Leonov|Leonov;Alexey Leonov
    Gene Cernan|Eugene Cernan;Cernan
    Michael Foale|Foale
    Mae Jemison|Jemison
    Eileen Collins
    Kalpana Chawla|Chawla
    Gus Grissom|Grissom
    Ed White
    Pete Conrad
    Alan Bean
    Charlie Duke
    John Young
    Jim Irwin|James Irwin
    Dave Scott|David Scott
    Harrison Schmitt|Jack Schmitt
    Edgar Mitchell
    Fred Haise
    Jack Swigert
    Frank Borman
    Bill Anders|William Anders
    Ken Mattingly
    Samantha Cristoforetti|Cristoforetti
    Thomas Pesquet|Pesquet
    Alexander Gerst
    Yang Liwei
    Wally Funk
    Michael Strahan
    Dennis Tito
    Yusaku Maezawa|Maezawa
    Jared Isaacman|Isaacman
    Hayley Arceneaux
    Rakesh Sharma
    Ilan Ramon
    Dick Gordon|Richard Gordon
    Stuart Roosa
    Al Worden|Alfred Worden
    Ron Evans|Ronald Evans
    Rusty Schweickart
    Jim McDivitt
    Tom Stafford|Thomas Stafford
    Wally Schirra
    Gordon Cooper
    Scott Carpenter
    Deke Slayton
    Gherman Titov|German Titov
    Vladimir Komarov
    Svetlana Savitskaya
    Valery Polyakov
    Sergei Krikalev
    Gennady Padalka
    Oleg Kononenko
    Guion Bluford
    Ellen Ochoa
    Shannon Lucid
    Kathryn Sullivan
    Bruce McCandless
    Story Musgrave
    Mike Massimino
    Don Pettit
    Bob Behnken
    Doug Hurley
    Kate Rubins
    Jessica Meir
    Anne McClain
    Nick Hague
    Jessica Watkins
    Frank Rubio
    Jasmin Moghbeli
    Zena Cardman
    Jonny Kim
    Dick Scobee
    Judith Resnik
    Ronald McNair
    Ellison Onizuka
    Rick Husband
    Laurel Clark
    William McCool
    José Hernández|Jose Hernandez
    Leland Melvin
    Terry Virts
    Piers Sellers
    Nicholas Patrick
    Jake Garn
    Bill Nelson
    Sian Proctor
    Chris Sembroski
    Sarah Gillis
    Anna Menon
    Scott Poteet
    Marc Garneau
    Roberta Bondar
    Julie Payette
    David Saint-Jacques
    Joshua Kutryk
    Luca Parmitano
    Paolo Nespoli
    André Kuipers|Andre Kuipers
    Pedro Duque
    Ulf Merbold
    Thomas Reiter
    Matthias Maurer
    Jean-Loup Chrétien|Jean-Loup Chretien
    Claudie Haigneré|Claudie Haignere
    Sophie Adenot
    Andreas Mogensen
    Frank De Winne
    Christer Fuglesang
    Marcus Wandt
    Claude Nicollier
    Wubbo Ockels
    Sławosz Uznański-Wiśniewski|Slawosz Uznanski;Slawosz Uznanski-Wisniewski
    Tibor Kapu
    Mamoru Mohri
    Chiaki Mukai
    Koichi Wakata
    Soichi Noguchi
    Akihiko Hoshide
    Naoko Yamazaki
    Toyohiro Akiyama
    Liu Yang
    Wang Yaping
    Zhai Zhigang
    Nie Haisheng
    Jing Haipeng
    Fei Junlong
    Li Jiaying|Lai Ka-ying
    Shubhanshu Shukla|Shux
    Vladimír Remek|Vladimir Remek
    Mirosław Hermaszewski|Miroslaw Hermaszewski
    Sigmund Jähn|Sigmund Jahn
    Bertalan Farkas
    Phạm Tuân|Pham Tuan
    Arnaldo Tamayo Méndez|Arnaldo Tamayo Mendez
    Dumitru Prunariu
    Muhammed Faris
    Rodolfo Neri Vela
    Sultan bin Salman Al Saud|Sultan bin Salman
    Leonid Kadeniuk
    Andy Thomas
    Mark Shuttleworth
    Marcos Pontes
    Yi So-yeon
    Hazzaa Al Mansoori
    Sultan Al Neyadi
    Rayyanah Barnawi
    Alper Gezeravcı|Alper Gezeravci
    Anousheh Ansari
    Charles Simonyi
    Richard Garriott
    Guy Laliberté|Guy Laliberte
    Yulia Peresild
    Klim Shipenko
    Chun Wang
    Jannicke Mikkelsen
    Rabea Rogge
    Eric Philips
    Gopi Thotakura
    Aisha Bowe
    Amanda Nguyen
    Kerianne Flynn
    Mark Bezos
    Oliver Daemen
    Audrey Powers
    Laura Shepard Churchley
    Hamish Harding
    Victor Vescovo
    Coby Cotton
    Vanessa O'Brien
    Ed Dwight
    Emily Calandrelli
    Michaela Benthaus
    Sirisha Bandla
    Beth Moses
    Jon Goodwin
    Mike Melvill
    Brian Binnie
    Joe Walker
    Konstantin Feoktistov
    Georgy Beregovoy
    Valentin Lebedev
    Musa Manarov
    Yuri Romanenko
    Anatoly Solovyev
    Yelena Kondakova
    Yelena Serova
    Anna Kikina
    Georgy Dobrovolsky
    Viktor Patsayev
    Vladislav Volkov
    Jügderdemidiin Gürragchaa|Jugderdemidiin Gurragchaa;Gurragchaa
    Abdul Ahad Mohmand
    Toktar Aubakirov
  `)),
  day(ranked('sea-animal', 'nature', 'Name a sea animal', 'Sea animals', `
    Shark
    Dolphin
    Whale
    Octopus
    Jellyfish|jelly fish
    Crab
    Starfish|sea star
    Seal
    Lobster
    Sea turtle|turtle
    Squid
    Clownfish|clown fish;Nemo
    Killer whale|orca
    Blue whale
    Great white shark|great white
    Seahorse|sea horse
    Sea lion
    Walrus
    Shrimp|prawn
    Stingray|sting ray
    Penguin
    Coral
    Humpback whale|humpback
    Sperm whale
    Hammerhead shark|hammerhead
    Whale shark
    Manta ray|manta
    Eel
    Moray eel|moray
    Swordfish
    Tuna
    Cod
    Mackerel
    Sardine
    Herring
    Anchovy
    Plaice
    Haddock
    Halibut
    Oyster
    Mussel
    Clam
    Scallop
    Cockle
    Whelk
    Periwinkle|winkle
    Limpet
    Barnacle
    Sea urchin|urchin
    Sea anemone|anemone
    Sea cucumber
    Sea otter
    Narwhal
    Beluga|beluga whale
    Manatee|sea cow
    Dugong
    Pufferfish|puffer fish;blowfish
    Angelfish
    Lionfish
    Barracuda
    Marlin
    Sailfish
    Flying fish
    Anglerfish|angler fish
    Blobfish
    Portuguese man o' war|man o war;portuguese man of war
    Krill
    Hermit crab
    Spider crab
    King crab
    Cuttlefish
    Nautilus
    Leatherback turtle
    Puffin
    Albatross
    Seagull|gull
    Polar bear
    Tiger shark
    Bull shark
    Basking shark
    Mako shark
    Nurse shark
    Grey whale|gray whale
    Minke whale
    Bottlenose dolphin
    Porpoise
    Sea snake
    Sponge|sea sponge
    Sea slug
    Nudibranch
    Vaquita
    Oarfish
    Frogfish
    Gulper eel
    Goblin shark
    Megamouth shark
    Greenland shark
    Thresher shark
    Dogfish
    Sawfish
    Skate
    Ocean sunfish|mola mola;sunfish
    Viperfish
    Fangtooth
    Lanternfish
    Coelacanth
    Grouper
    Snapper
    Sea bass
    Wrasse
    Parrotfish
    Blue tang|tang;dory
    Triggerfish
    Boxfish
    Leafy sea dragon|sea dragon
    Stonefish
    Remora
    Mahi-mahi|mahi mahi;dorado
    John Dory
    Monkfish
    Turbot
    Flounder
    Hake
    Pollock
    Mullet
    Conger eel
    Giant squid
    Colossal squid
    Vampire squid
    Blue-ringed octopus
    Mimic octopus
    Dumbo octopus
    Sea butterfly
    Sea angel
    Sea hare
    Cone snail
    Conch
    Abalone
    Cowrie
    Sea pen
    Sea fan
    Box jellyfish
    Lion's mane jellyfish
    Moon jellyfish
    Comb jelly
    Siphonophore
    Salp
    Sea squirt
    Brittle star
    Feather star
    Sand dollar
    Horseshoe crab
    Mantis shrimp
    Pistol shrimp
    Japanese spider crab
    Langoustine
    Isopod|giant isopod
    Sea spider
    Christmas tree worm
    Lugworm
    Elephant seal
    Leopard seal
    Fur seal
    Monk seal
    Fin whale
    Bowhead whale
    Right whale
    Pilot whale
    Hawksbill turtle
    Marine iguana
    Gannet
    Pyrosome
    Blue dragon|glaucus
    Giant tube worm
    Sea pig
    Cookiecutter shark
    Frilled shark
    Chimaera|ghost shark;ratfish
    Hagfish
    Lamprey
    Wolf eel
    Lumpsucker|lumpfish
    Opah|moonfish
    Weever fish|weever
    Garden eel
    Mandarinfish
    Crown-of-thorns starfish
    Immortal jellyfish
    Giant clam
    Geoduck
    Shipworm
    Chiton
    Sea mouse
    Lancelet
  `)),
  day(ranked('licence-type', 'general', 'Name a type of licence you can hold', 'Licences', `
    Driving licence|driving license;drivers licence;driver's license;driving
    Provisional licence|provisional;learner's permit
    TV licence|tv license;television licence
    Fishing licence|rod licence;fishing
    Pilot's licence|pilot licence;pilots licence;pilot
    Marriage licence|marriage
    Alcohol licence|liquor licence;alcohol;liquor
    Gun licence|firearms licence;firearms certificate;gun
    Motorcycle licence|motorbike licence;bike licence;motorcycle
    HGV licence|lorry licence;hgv;lgv
    Taxi licence|hackney carriage licence;taxi
    Shotgun certificate|shotgun licence;shotgun
    Premises licence|premises
    Personal licence
    Gambling licence|betting licence;gambling
    Software licence|software
    Music licence|music
    Hunting licence|hunting
    PCV licence|bus licence;pcv
    Private hire licence|minicab licence;phv licence
    Boating licence|boat licence
    Real estate licence|estate agent licence
    Medical licence|licence to practise
    Law licence|practising certificate
    Teaching licence
    Dog licence
    Forklift licence|forklift
    SIA licence|door supervisor licence;security licence
    Broadcasting licence|broadcast licence
    Export licence
    Import licence
    Business licence
    Street trading licence|market trader licence
    Entertainment licence
    Licence to kill
    Drone licence|drone
    Commercial pilot licence|cpl
    Private pilot licence|ppl
    Amateur radio licence|ham radio licence
    Operator's licence|o licence;operators licence
    International driving permit|idp
    Tractor licence
    Moped licence|moped
    Late-night refreshment licence|late night refreshment licence
    Pharmacy licence
    Nursing licence
    Firearms dealer licence
    Explosives licence
    Fireworks licence
    Wildlife licence|bat licence;badger licence
    Felling licence
    Waste carrier licence
    Scrap metal licence|scrap metal dealer licence
    HMO licence
    Landlord licence
    Pet shop licence
    Dog breeding licence
    Dangerous wild animal licence
    Zoo licence
    Pavement licence
    Skip licence
    Scaffolding licence
    Temporary event notice|ten
    Lottery licence
    Casino licence
    Bingo licence
    ATOL licence|atol
    Banking licence
    Energy supply licence
    Telecoms licence
    Insurance licence
    Copyright licence
    Open-source licence|open source licence
    Creative Commons licence
    Cinema licence
    Busking licence
    Distiller's licence|distillers licence
    Tobacco licence
    Asbestos licence
    Electrician's licence|electrical licence
    Plumbing licence
    Contractor's licence
    Cosmetology licence
    Tattoo licence
    Massage licence
    Private investigator licence
    Concealed carry licence|concealed carry permit
    Commercial fishing licence
    Boatmaster's licence
    Coaching licence|uefa pro licence
    Boxing licence
    Jockey licence
    Racing licence|super licence
    Referee licence
    Football agent licence
    Glider licence
    Hot-air balloon licence|balloon licence
    Helicopter licence
    Microlight licence
    Air traffic controller licence
    Marine radio licence|vhf licence
    Pesticide licence
    Crane licence
    Poetic licence|artistic licence
    Wireless telegraphy licence
    Peddler's certificate|pedlar's certificate
  `)),
  day(ranked('euro-national-flower', 'nature', 'Name a national flower in Europe', 'European national flowers', `
    Rose|red rose;tudor rose;damask rose;dog rose
    Thistle|scotch thistle
    Daffodil
    Shamrock|clover
    Tulip
    Edelweiss
    Poppy|red poppy;corn poppy
    Cornflower
    Lily of the valley
    Iris|fleur-de-lis;fleur de lis;yellow iris
    Carnation
    Lavender
    Daisy
    Sunflower
    Heather
    Peony
    Marguerite|ox-eye daisy;oxeye daisy
    Cyclamen
    Chamomile|camomile
    Harebell|bluebell
    Linden|lime blossom;lime tree
    Flax
    Mountain avens
    Twinflower
    Rue
    Saxifrage|pyramidal saxifrage
    Guelder rose|viburnum;kalyna
    Bosnian lily|golden lily
    Orange lily
    Madonna lily
    Basil
    Mimosa
    Acanthus
    Poet's daffodil|narcissus
    Strawberry tree
    Rock-centaury|maltese rock-centaury;rock centaury
    Natalie's ramonda|ramonda
  `)),
  day(ranked('breaking-bad-character', 'screen', 'Name a character from Breaking Bad', 'Breaking Bad characters', `
    Walter White|walt;heisenberg;mr white
    Jesse Pinkman|jesse;pinkman
    Saul Goodman|saul;jimmy mcgill
    Gus Fring|gustavo fring;gus;fring
    Skyler White|skyler
    Hank Schrader|hank
    Mike Ehrmantraut|mike
    Walter White Jr.|flynn;walt jr;walter jr
    Marie Schrader|marie
    Todd Alquist|todd
    Jane Margolis|jane
    Tuco Salamanca|tuco
    Hector Salamanca|hector;tio
    Badger|brandon mayhew
    Skinny Pete
    Gale Boetticher|gale
    Lydia Rodarte-Quayle|lydia
    Holly White|holly
    Krazy-8|krazy 8;crazy 8;domingo molina
    Leonel Salamanca|leonel
    Marco Salamanca|marco
    Huell Babineaux|huell
    Steven Gomez|gomez;gomie
    Combo|christian ortega
    Andrea Cantillo|andrea
    Brock Cantillo|brock
    Ted Beneke|ted
    Gretchen Schwartz|gretchen
    Elliott Schwartz|elliott
    Jack Welker|uncle jack
    Kenny
    Donald Margolis|donald
    Tyrus Kitt|tyrus
    Victor
    Patrick Kuby|kuby
    Francesca Liddy|francesca
    Emilio Koyama|emilio
    Tortuga
    Don Eladio|eladio
    Juan Bolsa
    Max Arciniega|max
    Declan
    Drew Sharp
    Spooge
    Wendy
    Clovis
    Bogdan Wolynetz|bogdan
    Ed Galbraith|the disappearer;ed
    Carmen Molina
    Hugo Archuleta|hugo
    Gonzo
    No-Doze|no doze
    Tomás Cantillo|tomas
    Kaylee Ehrmantraut|kaylee
    Gaff
    George Merkert|merkert
    Dr. Delcavoli|delcavoli
    Tim Roberts
    Detective Kalanchoe|kalanchoe
    Detective Munn|munn
    Stephanie Doswell
    Louis Corbett|louis
    Jake Pinkman
    Adam Pinkman
    Diane Pinkman
    Old Joe
    Lawson
    Duane Chow
    Dennis Markowski|dennis
    Peter Schuler|herr schuler
    Chris Mara
    Frankie
    Lester
    Matt
    Ken|ken wins
  `)),
  day(ranked('fa-cup-champion', 'sport', 'Name a team who has won the FA Cup', 'FA Cup winners', `
    Manchester United|man utd;man united;man u
    Arsenal
    Chelsea
    Liverpool
    Manchester City|man city
    Tottenham Hotspur|spurs;tottenham
    Aston Villa|villa
    Newcastle United|newcastle
    Everton
    West Ham United|west ham
    Crystal Palace|palace
    Leicester City|leicester
    Wigan Athletic|wigan
    Leeds United|leeds
    Wolverhampton Wanderers|wolves
    West Bromwich Albion|west brom;wba
    Nottingham Forest|forest
    Portsmouth|pompey
    Southampton
    Sunderland
    Blackburn Rovers|blackburn
    Wimbledon
    Coventry City|coventry
    Ipswich Town|ipswich
    Sheffield Wednesday|the wednesday
    Sheffield United
    Bolton Wanderers|bolton
    Cardiff City|cardiff
    Preston North End|preston
    Derby County|derby
    Blackpool
    Burnley
    Charlton Athletic|charlton
    Huddersfield Town|huddersfield
    Barnsley
    Bradford City
    Notts County
    Bury
    Old Etonians
    Blackburn Olympic
    Oxford University
    Old Carthusians
    Clapham Rovers
    Wanderers|the wanderers
    Royal Engineers
  `)),
  day(ranked('natural-phenomenon', 'science', 'Name a natural phenomenon (e.g. Lightning)', 'Natural phenomena', `
    Lightning
    Rainbow
    Earthquake
    Tornado|twister
    Northern Lights|aurora borealis;aurora
    Volcano|volcanic eruption;eruption
    Tsunami|tidal wave
    Hurricane|typhoon;cyclone
    Thunder
    Eclipse|solar eclipse;lunar eclipse
    Snow
    Hail|hailstorm
    Fog
    Flood
    Drought
    Tide|tides
    Avalanche
    Landslide
    Thunderstorm|storm
    Rain
    Wind
    Southern Lights|aurora australis
    Monsoon
    Blizzard
    Heatwave|heat wave
    Sandstorm|dust storm
    Whirlpool
    Geyser
    Waterspout
    Shooting star|meteor
    Meteor shower
    Comet
    Wildfire|bushfire;forest fire
    Mudslide
    Sinkhole
    Erosion
    Mist
    Frost
    Dew
    Sleet
    Blood moon
    Supermoon
    Solar flare
    Bioluminescence
    Migration
    Hibernation
    El Niño|el nino
    La Niña|la nina
    Iceberg
    Glacier
    Red tide|algal bloom
    Solstice
    Equinox
    Midnight sun
    Polar night
    Sunset|sunrise
    Mirage
    St Elmo's fire|saint elmo's fire
    Ball lightning
    Halo
    Sundog|sun dog;parhelion
    Moonbow|lunar rainbow
    Fogbow
    Brocken spectre
    Green flash
    Fata morgana
    Crepuscular rays|god rays
    Light pillar|light pillars
    Noctilucent clouds
    Mammatus clouds
    Lenticular clouds
    Roll cloud|morning glory cloud
    Fallstreak hole|hole punch cloud
    Virga
    Petrichor
    Zodiacal light
    Sprites|red sprites
    Derecho
    Haboob
    Dust devil
    Fire whirl|fire tornado;firenado
    Microburst
    Polar vortex
    Föhn wind|foehn;chinook
    Temperature inversion
    Freezing rain
    Thundersnow
    Rogue wave|freak wave
    Tidal bore|severn bore
    Rip current|rip tide
    Storm surge
    Upwelling
    Maelstrom
    Seiche
    Sea foam
    Brinicle
    Hot spring
    Lava flow
    Pyroclastic flow
    Lahar
    Continental drift
    Quicksand
    Murmuration
    Coral spawning
    Salmon run
    Sardine run
    Fireflies|synchronous fireflies
    Locust swarm
    Fairy ring
    Superbloom
    Frost flowers
    Needle ice
    Hair ice
    Penitentes
    Ice circle|ice disc
    Frost quake|cryoseism
    Snow roller
    Watermelon snow
    Sailing stones
    Catatumbo lightning
    Firefall
    Blood Falls
    Limnic eruption
    Mud volcano
    Earthquake lights
    Jökulhlaup|jokulhlaup
    Will-o'-the-wisp|will o the wisp
    Geomagnetic storm
    Coronal mass ejection
    Atmospheric river
    Bomb cyclone
    Milky seas
    Gegenschein
  `)),
];
