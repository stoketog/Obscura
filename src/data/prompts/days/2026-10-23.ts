import type { PromptSeed } from '@/lib/types';
import { ranked } from '../atlas';

/**
 * Friday 23 October 2026, prompts set by hand and widened with research (Wikipedia war lists, RSPB Big Garden
 * Birdwatch, mineralogy references). Each list runs from the answer most people give to the most unheard-of, which
 * becomes the rarity: the first few Everyday, the last one or two Obscure. Lists are deliberately generous; rarity
 * scoring does the work. Countries: current sovereign states only.
 */
const day = (seed: PromptSeed): PromptSeed => ({ ...seed, editorial: true });

export const DAY_2026_10_23: PromptSeed[] = [
  day(ranked('country-starts-c', 'geography', 'Name a country that starts with the letter C', 'Countries · starting with C', `
    Canada
    China|People's Republic of China;PRC
    Chile
    Cuba
    Colombia|Columbia
    Croatia|Hrvatska
    Czech Republic|Czechia;Cesko
    Cyprus
    Costa Rica
    Cameroon|Cameroun
    Cambodia|Kampuchea
    Chad|Tchad
    Congo|Republic of the Congo;Congo-Brazzaville;Congo Brazzaville;Congo Republic
    Central African Republic|CAR;Centrafrique
    Côte d'Ivoire|Cote d'Ivoire;Cote dIvoire;Ivory Coast;The Ivory Coast
    Cape Verde|Cabo Verde
    Comoros|Comores;Union of the Comoros
    Congo-Kinshasa|DR Congo;DRC;Democratic Republic of the Congo;Congo Kinshasa;Congo DR
  `)),

  day(ranked('film-masked-character', 'screen', 'Name a film that features a character wearing a mask', 'Films with masked characters', `
    Scream|Scream 2;Scream 3;Scream 4;Scream 5;Scream VI;Scream 7;Ghostface
    Halloween|Halloween II;Halloween 4;Halloween 5;Halloween H20;Halloween Kills;Halloween Ends;Halloween Resurrection;Michael Myers
    The Mask|Stanley Ipkiss
    V for Vendetta|Guy Fawkes mask
    Batman|Batman 1989;Batman Begins;Batman Returns;Batman Forever;Batman and Robin;Batman & Robin;Bruce Wayne;Riddler
    Star Wars|A New Hope;Star Wars: A New Hope;Darth Vader;Stormtrooper;Stormtroopers
    Friday the 13th|Friday the 13th Part III;Friday the 13th Part 3;Friday the Thirteenth;Jason Voorhees;Jason
    The Dark Knight|Dark Knight
    Spider-Man|Spiderman;Spider-Man 2;Spider-Man 3;Peter Parker;Green Goblin
    The Phantom of the Opera|Phantom of the Opera;The Phantom
    The Texas Chain Saw Massacre|Texas Chainsaw Massacre;The Texas Chainsaw Massacre;Leatherface
    The Mask of Zorro|Zorro;The Legend of Zorro;Mask of Zorro;The Mark of Zorro
    Deadpool|Deadpool 2;Deadpool & Wolverine;Deadpool and Wolverine;Wade Wilson
    Saw|Saw II;Saw III;Saw IV;Saw X;Jigsaw;Spiral;Billy the Puppet
    The Purge|The Purge: Anarchy;The Purge: Election Year;The First Purge;The Forever Purge
    The Empire Strikes Back|Empire Strikes Back;Boba Fett
    Return of the Jedi
    The Dark Knight Rises|Dark Knight Rises;Bane
    Black Panther|Black Panther: Wakanda Forever;Wakanda Forever;T'Challa
    The Incredibles|Incredibles;Incredibles 2
    Teenage Mutant Ninja Turtles|Ninja Turtles;TMNT;Mutant Mayhem;Shredder
    Eyes Wide Shut
    The Silence of the Lambs|Silence of the Lambs;Hannibal Lecter
    The Force Awakens|Star Wars: The Force Awakens;Kylo Ren;Captain Phasma
    The Last Jedi|Star Wars: The Last Jedi
    The Rise of Skywalker|Star Wars: The Rise of Skywalker
    Rogue One|Rogue One: A Star Wars Story
    Revenge of the Sith|Star Wars: Revenge of the Sith
    Iron Man|Iron Man 2;Iron Man 3
    Spider-Man: Into the Spider-Verse|Into the Spider-Verse;Spider-Verse;Across the Spider-Verse;Spider-Man: Across the Spider-Verse;Miles Morales
    Spider-Man: No Way Home|No Way Home
    Spider-Man: Homecoming|Homecoming
    Spider-Man: Far From Home|Far From Home;Mysterio
    The Amazing Spider-Man|Amazing Spider-Man;The Amazing Spider-Man 2
    The Man in the Iron Mask|Man in the Iron Mask
    Mad Max: Fury Road|Fury Road;Immortan Joe
    Mad Max 2|The Road Warrior;Lord Humungus
    Furiosa
    Watchmen|Rorschach
    Kick-Ass|Kick Ass;Kick-Ass 2;Hit-Girl
    Mission: Impossible|Mission Impossible;Ghost Protocol;Rogue Nation;Fallout;Dead Reckoning;The Final Reckoning
    Predator|The Predator;Predators;Prey;Predator 2;Predator: Badlands
    Point Break|Ex-Presidents
    Baby Driver
    The Town
    Heat
    Inside Man
    Den of Thieves
    Joker|Joker: Folie à Deux
    Mortal Kombat|Sub-Zero;Scorpion
    Kill Bill|Kill Bill: Volume 1;Kill Bill Vol. 1;Crazy 88
    A Clockwork Orange|Clockwork Orange
    Donnie Darko|Frank the rabbit
    Pulp Fiction
    Gladiator|Tigris of Gaul
    Captain America: The Winter Soldier|The Winter Soldier;Winter Soldier
    Captain America: Civil War|Civil War
    Black Widow|Taskmaster
    The Avengers|Avengers;Avengers: Endgame;Avengers: Infinity War
    Ant-Man|Ant-Man and the Wasp
    Guardians of the Galaxy|Star-Lord
    Shang-Chi|Shang-Chi and the Legend of the Ten Rings
    Daredevil
    Elektra
    Green Lantern
    Birds of Prey|Black Mask
    Suicide Squad|The Suicide Squad;Peacemaker;Bloodsport
    Batman v Superman: Dawn of Justice|Batman v Superman
    Justice League|Zack Snyder's Justice League
    The Lego Batman Movie|Lego Batman
    Batman: Mask of the Phantasm|Mask of the Phantasm
    The Lone Ranger|Lone Ranger
    The Green Hornet|Green Hornet;Kato
    The Phantom (1996)|The Phantom 1996
    The Spirit
    Darkman
    Mystery Men
    Super
    Speed Racer|Racer X
    Iron Monkey
    G.I. Joe|GI Joe;Snake Eyes;Cobra Commander
    Spaceballs|Dark Helmet
    Hellboy|Kroenen
    Wonder Woman|Doctor Poison
    300|Immortals
    Kingdom of Heaven
    The Last Samurai|Last Samurai
    Willow|General Kael
    Nacho Libre
    Avatar|Avatar: The Way of Water
    Total Recall
    Face/Off|Face Off
    Mrs. Doubtfire|Mrs Doubtfire
    The Strangers|Strangers;The Strangers: Prey at Night
    You're Next
    Hush
    Happy Death Day|Happy Death Day 2U;Babyface
    Trick 'r Treat|Trick r Treat
    Halloween III: Season of the Witch|Season of the Witch;Halloween III
    The Black Phone|Black Phone;Black Phone 2;The Grabber
    My Bloody Valentine
    Valentine
    Thanksgiving
    Hell Fest
    Haunt
    Fear Street|Fear Street Part One: 1994;Fear Street Part Two: 1978
    Freaky
    Totally Killer
    The Final Girls
    Behind the Mask: The Rise of Leslie Vernon|Behind the Mask
    The Town That Dreaded Sundown
    The Funhouse
    The Prowler
    Motel Hell
    Slaughter High
    Terror Train
    Prom Night
    Cry Wolf
    Sick
    Vacancy
    The Collector|The Collection
    Kill List
    The Wicker Man|Wicker Man
    Hannibal|Hannibal Rising
    Red Dragon|Manhunter
    The Shining
    Silent Hill|Pyramid Head
    The Cabin in the Woods|Cabin in the Woods
    Five Nights at Freddy's
    The Elephant Man|Elephant Man
    Brazil
    Eyes Without a Face
    The Orphanage
    House of Wax
    The Abominable Dr. Phibes|Dr Phibes
    The Masque of the Red Death|Masque of the Red Death
    Blood and Black Lace
    Black Sunday|The Mask of Satan
    Onibaba
    The Face of Another
    StageFright|Deliria
    Nightbreed
    Alice, Sweet Alice
    Phantom of the Paradise
    Romeo + Juliet|Romeo and Juliet
    Amadeus
    Labyrinth
    Marie Antoinette
    A Cinderella Story
    Iron Mask
    Scaramouche
    Fantômas|Fantomas
    Judex
    Les Vampires
    Danger: Diabolik|Diabolik
    E.T. the Extra-Terrestrial|ET
    Snatch
    Triple 9
    Killing Them Softly
    Hell or High Water
    Plunkett & Macleane|Plunkett and Macleane
    Django Unchained
    Dead Presidents
    From Russia with Love
    Live and Let Die|Baron Samedi
    Spectre
    No Time to Die|Safin
    Thunderball
    Goldfinger
    Octopussy
    Die Another Day
    The Nightmare Before Christmas|Nightmare Before Christmas
    Big Hero 6|Yokai
    Despicable Me 2|El Macho
    Kubo and the Two Strings
    Princess Mononoke
    Spirited Away|No-Face
    Nausicaä of the Valley of the Wind|Nausicaa
    Moana
    The Lego Ninjago Movie|Lego Ninjago
    The Lego Movie|Lego Movie
    Fantastic Mr. Fox|Fantastic Mr Fox
    Scooby-Doo|Scooby Doo
    Son of the Mask
    Venom
    Dredd|Judge Dredd
    RoboCop
    Contagion
    Outbreak
    Songbird
    M*A*S*H|MASH
    All Quiet on the Western Front
    Airplane!|Airplane
    Top Gun|Top Gun: Maverick
    Dune|Dune: Part Two
    Tenet
  `)),

  day(ranked('british-garden', 'general', 'Name something commonly found in a British garden', 'In a British garden', `
    Shed|Garden shed
    Lawn|Grass
    Gnome|Garden gnome
    Flowers|Flower
    Roses|Rose;Rose bush
    Fence|Fencing;Garden fence
    Bird feeder|Bird table;Birdfeeder
    Pond
    Trees|Tree
    Hedge|Hedges;Hedgerow
    Greenhouse
    Patio
    Washing line|Clothes line;Clothesline;Rotary washing line;Rotary dryer;Whirligig;Rotary airer
    Barbecue|BBQ;Barbie
    Lawnmower|Mower;Lawn mower;Ride-on mower;Robot mower
    Trampoline
    Robin
    Hedgehog
    Squirrel|Squirrels;Grey squirrel
    Slugs|Slug
    Snails|Snail
    Worms|Worm;Earthworm;Earthworms
    Bees|Bee;Bumblebee;Honeybee
    Fox|Foxes;Urban fox
    Cat|Cats;Neighbour's cat
    Daffodils|Daffodil
    Weeds|Weed
    Apple tree
    Butterflies|Butterfly
    Blackbird
    Dandelions|Dandelion
    Wheelbarrow
    Bench|Garden bench
    Bird bath|Birdbath
    Compost heap|Compost;Compost bin
    Flower bed|Flowerbed;Border;Flower border
    Plant pots|Plant pot;Pots;Flower pot;Flowerpot
    Hose|Hosepipe;Garden hose;Hose reel
    Watering can
    Garden furniture|Table and chairs;Patio furniture;Garden table;Garden chairs;Patio set
    Hanging basket
    Vegetable patch|Veg patch;Vegetable garden;Vegetables
    Water butt|Rain barrel
    Decking|Deck
    Swing|Swing set
    Slide
    Paddling pool
    Parasol|Umbrella;Garden umbrella
    Mud
    Soil|Dirt;Earth
    Leaves|Leaf;Autumn leaves
    Fire pit|Firepit
    Hot tub|Jacuzzi
    Summerhouse|Summer house
    Gazebo
    Pergola
    Trellis
    Arch|Rose arch
    Path|Garden path;Paving;Paving slabs
    Gravel
    Stepping stones
    Rockery
    Rocks|Stones;Pebbles
    Fountain|Water feature
    Statue|Garden statue;Cherub
    Sundial
    Bird box|Nest box;Birdhouse
    Hedgehog house
    Bug hotel|Insect hotel
    Bat box
    Solar lights|Garden lights;Fairy lights;Festoon lights;Lanterns
    Wheelie bin|Bin;Bins;Recycling bin;Green bin;Food caddy
    Bike|Bicycle
    Football|Ball
    Goalposts|Goal;Football goal
    Deckchair|Deck chair
    Sun lounger|Lounger
    Rake
    Spade
    Garden fork|Fork
    Trowel
    Hoe
    Shears
    Secateurs|Pruners
    Loppers
    Strimmer|Trimmer
    Hedge trimmer
    Leaf blower
    Pressure washer|Jet wash
    Gardening gloves|Gloves
    Wellies|Wellington boots
    Kneeler|Kneeling pad
    Ladder
    Broom|Yard brush
    Bucket
    Canes|Bamboo canes;Plant supports
    Netting|Fleece
    Slug pellets
    Fertiliser|Manure;Plant feed
    Mulch|Bark chippings
    Grow bags|Growbag
    Seed trays|Seeds
    Bulbs
    Raised bed|Raised beds
    Cold frame
    Polytunnel
    Cloche
    Window box
    Planter|Trough
    Wall|Garden wall
    Gate|Garden gate
    Garage
    Driveway
    Outside tap|Outdoor tap
    Drain|Drainpipe;Manhole cover
    Log store|Logs;Firewood;Woodpile
    Chiminea
    Patio heater
    Wind chimes|Wind chime
    Scarecrow
    Climbing frame
    Sandpit|Sand pit
    Playhouse|Wendy house
    Treehouse|Tree house
    Tent
    Hammock
    Swingball
    Basketball hoop
    Water pistol|Super Soaker
    Scooter
    Bubbles
    Rabbit hutch|Hutch
    Chicken coop|Chickens;Hens
    Kennel
    Dog
    Guinea pigs|Guinea pig
    Tortoise
    Pond fish|Goldfish;Koi
    Frogs|Frog;Frogspawn;Tadpoles
    Toad
    Newt
    Slow worm
    Lizard
    Grass snake
    Mole|Molehill;Molehills
    Mouse|Mice;Wood mouse
    Rat|Rats
    Vole
    Shrew
    Rabbit
    Badger
    Bat|Bats;Pipistrelle
    Deer|Muntjac
    House sparrow|Sparrow;Sparrows
    Blue tit|Blue tits;Tit
    Wood pigeon|Woodpigeon;Pigeon;Pigeons
    Starling|Starlings
    Great tit
    Goldfinch
    Magpie
    Long-tailed tit
    Chaffinch
    Dunnock|Hedge sparrow
    Collared dove|Dove
    Jackdaw
    Crow|Carrion crow
    Coal tit
    Wren
    Greenfinch
    Song thrush|Thrush
    Mistle thrush
    Blackcap
    Nuthatch
    Woodpecker|Great spotted woodpecker;Green woodpecker
    Jay
    Rook
    Siskin
    Bullfinch
    Pied wagtail|Wagtail
    Redwing
    Fieldfare
    Sparrowhawk
    Red kite
    Buzzard
    Seagull|Gull;Herring gull
    Pheasant
    Goldcrest
    Waxwing
    Swallow
    House martin
    Swift
    Tawny owl|Owl
    Heron
    Parakeet|Ring-necked parakeet
    Ladybirds|Ladybird
    Spiders|Spider;Spider web;Cobweb;Money spider
    Ants|Ant
    Wasps|Wasp
    Aphids|Greenfly;Blackfly
    Flies|Fly;Bluebottle;Hoverfly
    Crane fly|Daddy long legs
    Moths|Moth
    Caterpillars|Caterpillar
    Woodlice|Woodlouse
    Earwigs|Earwig
    Beetles|Beetle;Stag beetle
    Centipede
    Millipede
    Grasshopper
    Cricket
    Dragonfly
    Damselfly
    Cabbage white
    Red admiral
    Mosquitoes|Mosquito;Gnats;Midges
    Vine weevil
    Cuckoo spit|Froghopper
    Shield bug
    Leatherjackets
    Lacewing
    Tulips|Tulip
    Lavender
    Foxgloves|Foxglove
    Sweet peas|Sweet pea
    Sunflowers|Sunflower
    Daisies|Daisy
    Bluebells|Bluebell
    Snowdrops|Snowdrop
    Crocuses|Crocus
    Pansies|Pansy;Violas
    Geraniums|Geranium;Pelargonium
    Fuchsia
    Petunias|Petunia
    Marigolds|Marigold
    Poppies|Poppy
    Hydrangea
    Dahlias|Dahlia
    Lupins|Lupin
    Delphiniums|Delphinium
    Hollyhocks|Hollyhock
    Peonies|Peony
    Lilies|Lily
    Irises|Iris
    Alliums|Allium
    Hyacinths|Hyacinth
    Primroses|Primrose;Primula
    Busy lizzies|Busy lizzie;Impatiens
    Begonias|Begonia
    Lobelia
    Nasturtiums|Nasturtium
    Cornflowers|Cornflower
    Cosmos
    Snapdragons|Snapdragon;Antirrhinum
    Carnations|Carnation;Pinks;Dianthus
    Chrysanthemums|Chrysanthemum
    Asters|Michaelmas daisies
    Forget-me-nots|Forget-me-not
    Wallflowers|Wallflower
    Honeysuckle
    Clematis
    Jasmine
    Wisteria
    Sweet William
    Salvia
    Penstemon
    Heuchera
    Hostas|Hosta
    Ferns|Fern
    Sedum
    Echinacea
    Rudbeckia
    Crocosmia
    Agapanthus
    Hardy geraniums|Cranesbill
    Aquilegia|Columbine;Granny's bonnet
    Campanula
    Euphorbia
    Phlox
    Red hot poker|Kniphofia
    Buttercups|Buttercup
    Clover
    Heather
    Cyclamen
    Hellebores|Hellebore;Christmas rose
    Grape hyacinths|Muscari
    Anemones|Anemone
    Gladioli|Gladiolus
    Catmint|Nepeta
    Ivy
    Virginia creeper
    Ornamental grasses|Pampas grass
    Bamboo
    Buddleia|Butterfly bush
    Rhododendron
    Azalea
    Camellia
    Magnolia
    Forsythia
    Lilac
    Hebe
    Box|Buxus;Box hedge
    Privet
    Laurel
    Leylandii|Conifer;Conifers
    Holly
    Yew
    Pyracantha|Firethorn
    Cotoneaster
    Berberis
    Mahonia
    Viburnum
    Mock orange|Philadelphus
    Ceanothus
    Photinia|Red Robin
    Skimmia
    Dogwood|Cornus
    Elder
    Japanese maple|Acer
    Cherry tree|Ornamental cherry
    Silver birch|Birch
    Oak
    Beech
    Sycamore
    Horse chestnut|Conkers
    Rowan|Mountain ash
    Hawthorn
    Crab apple
    Willow
    Eucalyptus
    Monkey puzzle tree|Monkey puzzle
    Palm|Cordyline;Palm tree
    Fig tree
    Bay tree
    Laburnum
    Pear tree
    Plum tree
    Strawberries|Strawberry
    Raspberries|Raspberry
    Blackberries|Brambles;Bramble
    Gooseberries|Gooseberry
    Blackcurrants|Blackcurrant;Redcurrants
    Rhubarb
    Blueberries|Blueberry
    Grapevine|Grapes
    Tomatoes|Tomato;Tomato plants
    Potatoes|Potato
    Runner beans|Runner bean
    Broad beans|Broad bean
    Peas|Pea
    Carrots|Carrot
    Lettuce
    Onions|Onion
    Garlic
    Leeks|Leek
    Cabbages|Cabbage
    Courgettes|Courgette;Marrow
    Pumpkins|Pumpkin;Squash
    Cucumbers|Cucumber
    Chillies|Chilli;Peppers
    Beetroot
    Radishes|Radish
    Sweetcorn
    Herbs|Herb garden
    Mint
    Parsley
    Basil
    Thyme
    Rosemary
    Sage
    Chives
    Nettles|Stinging nettles
    Dock leaves|Dock
    Bindweed
    Ground elder
    Thistles|Thistle
    Moss
    Lichen
    Japanese knotweed
    Couch grass
    Cleavers|Sticky willy;Goosegrass
    Mushrooms|Toadstools;Fungi
    Algae|Pond weed;Duckweed
    Puddles|Puddle
    Rain
    Snowman
    Satellite dish
    Security light
    CCTV|Security camera
    Oil tank
    Coal bunker
    Beehive
    Bunting
    Plant labels
    Dog poo
  `)),

  day(ranked('has-battery', 'general', 'Name something that has a battery', 'Things with a battery', `
    Phone|Mobile phone;Mobile;Smartphone;Cell phone;iPhone
    Remote control|Remote;TV remote
    Laptop|MacBook
    Car
    Watch|Wristwatch
    Torch|Flashlight
    Smoke alarm|Smoke detector
    Electric car|EV;Tesla;Electric vehicle
    Tablet|iPad
    Clock|Alarm clock;Wall clock
    Camera|Digital camera
    Toys|Toy;Kids' toys
    Remote control car|RC car;Remote controlled car;Radio controlled car
    Game controller|Controller;Xbox controller;PlayStation controller;Joypad
    Headphones|Wireless headphones
    Earbuds|AirPods;Earphones
    Electric toothbrush|Toothbrush
    Calculator
    Smartwatch|Apple Watch
    Fitness tracker|Fitbit
    Hearing aid
    Pacemaker
    E-bike|Electric bike;Electric bicycle
    E-scooter|Electric scooter;Scooter
    Drone|Quadcopter
    Wireless mouse|Mouse;Computer mouse
    Keyboard|Wireless keyboard
    Vape|E-cigarette
    Kindle|E-reader
    Power bank|Portable charger
    Radio|Portable radio;Transistor radio
    Video doorbell|Ring doorbell;Doorbell;Wireless doorbell
    Cordless drill|Drill;Power drill;Power tools
    Cordless vacuum|Dyson;Vacuum cleaner;Hoover
    Robot vacuum|Roomba;Robot hoover
    Nintendo Switch|Switch
    Game Boy|Nintendo DS;PSP;Handheld console
    Steam Deck
    Bluetooth speaker|Speaker;Portable speaker
    Electric shaver|Shaver;Razor;Electric razor
    Hair clippers|Clippers;Beard trimmer;Trimmer
    Car key|Key fob;Car key fob
    Kitchen scales|Scales
    Bathroom scales
    Thermometer|Digital thermometer;Meat thermometer
    Baby monitor
    Walkie-talkie|Walkie talkie;Two-way radio
    Hoverboard
    Segway
    Mobility scooter
    Electric wheelchair|Wheelchair
    Golf buggy|Golf cart
    Motorbike|Motorcycle;Moped
    Boat
    Jet ski
    Forklift|Fork-lift truck
    Lawnmower|Robot lawnmower;Cordless lawnmower
    Leaf blower
    Hedge trimmer
    Strimmer
    Chainsaw
    Satnav|Sat nav;GPS
    Dashcam|Dash cam
    GoPro|Action camera
    Camcorder
    Polaroid camera|Instant camera
    Laser pointer
    Defibrillator|AED;Defib
    Glucose monitor|Blood glucose meter;Glucometer;CGM;Libre;Dexcom
    Insulin pump
    Cochlear implant
    Blood pressure monitor
    Pulse oximeter
    Metal detector
    Tamagotchi
    Furby
    Fairy lights|Christmas lights;Battery lights
    LED candles|Battery candles;Tea lights
    Solar garden lights|Solar lights
    Tape measure|Laser measure
    Laser level
    Multimeter
    Stud finder
    Garage door opener|Garage remote
    Home battery|Powerwall;Tesla Powerwall;Solar battery
    UPS|Uninterruptible power supply
    Plane|Aeroplane;Airplane;Aircraft
    Helicopter
    Satellite
    Mars rover|Rover;Curiosity;Perseverance
    International Space Station|ISS
    Rocket
    Submarine
    Electric guitar pedal|Guitar pedal;Guitar tuner;Tuner
    Microphone|Wireless microphone
    Karaoke machine
    Electronic keyboard
    Metronome
    Heated gloves|Heated jacket;Heated socks;Heated clothing
    Hand warmer
    Bike light|Bike lights
    Bike computer
    Head torch|Headlamp
    Lantern|Camping lantern
    Pager
    Robot
    Smart lock|Door lock
    Security camera|CCTV
    Burglar alarm|Alarm system;Alarm panel
    Carbon monoxide detector|CO alarm
    Thermostat|Smart thermostat;Nest;Hive
    Smart meter
    Weather station
    Kitchen timer|Egg timer
    Milk frother
    Pepper grinder|Electric pepper mill
    Electric wine opener
    Handheld vacuum|Dustbuster
    Robot mop
    Window vacuum
    Water flosser
    Automatic soap dispenser
    Air freshener|Automatic air freshener
    Handheld fan|Portable fan;Fan
    Hair straighteners|Cordless straighteners
    Epilator
    Massage gun|Massager;Vibrator
    Facial cleansing brush
    LED face mask
    Electric nail file
    Night light
    Emergency light|Exit sign
    Cordless phone|Landline phone
    MP3 player|iPod
    Walkman|Discman
    Portable DVD player
    VR headset|Meta Quest;Oculus
    Smart glasses|Ray-Ban Meta
    AirTag|Tile tracker;Key finder;Bluetooth tracker
    GPS tracker|Pet tracker;GPS dog collar
    Digital photo frame
    Label maker
    Translator|Digital translator
    Stylus|Apple Pencil
    Presentation clicker
    Camera flash
    Gimbal
    Ring light
    Trail camera
    Light-up trainers|Light-up shoes
    Musical birthday card|Singing card;Musical card
    Talking doll
    Toy robot
    Nerf gun|Nerf blaster
    Toy lightsaber|Lightsaber
    Buzz Lightyear
    Bubble machine
    Ride-on car|Kids' electric car
    Go-kart|Electric go-kart
    Train set|Electric train set
    Bop It
    Speak & Spell|Speak and Spell
    LeapFrog
    VTech
    Electric skateboard
    Electric unicycle
    Electric surfboard|eFoil
    Underwater scooter
    Dive computer
    Avalanche transceiver|Avalanche beacon
    Fish finder
    Bite alarm
    Golf trolley|Electric golf trolley
    Golf rangefinder
    Pedometer|Step counter
    Impact driver
    Circular saw
    Jigsaw|Cordless jigsaw
    Angle grinder
    Sander
    Nail gun
    Glue gun
    Cordless screwdriver|Electric screwdriver
    Dremel|Rotary tool
    Tyre inflator
    Jump starter
    Work light
    Pruning shears|Electric secateurs
    Robot pool cleaner
    Electric fence
    Fox repeller|Cat repeller
    Chicken coop door|Automatic coop door
    Watering timer
    Hybrid car|Hybrid
    Van
    Lorry|Truck
    Bus|Electric bus
    Tractor
    Milk float
    Caravan
    Motorhome|Campervan
    Narrowboat
    Yacht
    Electric boat
    Train
    Tram
    Glider
    Electric aircraft|Air taxi;eVTOL
    Space shuttle
    Lunar rover
    Space probe|Voyager
    Airport tug
    Electric excavator|Digger
    Grid battery|Battery storage
    Data centre
    Phone mast|Mobile mast
    Fire alarm|Fire alarm panel
    Card reader|Card machine;PDQ machine
    Barcode scanner|Handheld scanner
    Warehouse robot
    Humanoid robot
    Robot dog|Boston Dynamics Spot
    Parking meter
    Ticket machine
    Buoy
    Lighthouse
    Weather balloon|Radiosonde
    Black box|Flight recorder
    Emergency beacon|EPIRB;PLB
    Life jacket light
    Body camera|Bodycam
    Police radio
    Taser
    Night-vision goggles|Night vision goggles
    Missile
    Torpedo
    Wildlife tracking collar|Tracking collar
    Ankle tag|Electronic tag
    Stairlift
    Prosthetic limb|Bionic arm;Prosthetic arm
    Neurostimulator|Deep brain stimulator;Spinal cord stimulator
    Capsule endoscope|Camera pill
    TENS machine
    Personal alarm|Panic alarm;Careline
    Fall detector
    Oxygen concentrator
    Nebuliser|Nebulizer
    Infusion pump
    Hospital bed
    Surgical robot
    Motherboard|CMOS battery
    Desktop computer|Computer;PC
    Portable hard drive
    Chromebook|Netbook
    Satellite phone
    PDA
    Graphing calculator|Scientific calculator
    Etch A Sketch
    Lemon battery|Potato battery
    Electric eel
    Energizer Bunny|Duracell Bunny
  `)),

  day(ranked('tail-not-animal', 'general', 'Name something that has a tail but isn’t an animal', 'Tails that aren’t animals', `
    Kite
    Comet
    Plane|Aeroplane;Airplane;Aircraft;Jet
    Coin|Heads or tails
    Ponytail|Hair
    Tailcoat|Tails;Coat;Dinner jacket;White tie and tails;Coat tails
    Shirt|Shirt tail;Shirt tails
    Mermaid|Merman
    Dragon
    Devil|Satan;Lucifer
    Rocking horse
    Hobby horse
    Helicopter|Tail rotor
    Pigtails|Pigtail
    Shooting star|Meteor;Fireball
    Rocket
    Letter Q|Q
    Letter Y|Y;Letter G;G;Letter J;J;Letter P;P
    Musical note|Note;Quaver;Semiquaver;Crotchet;Minim
    Grand piano|Piano
    Queue|Tail of a queue
    Glider
    Missile
    Dart
    Paper aeroplane|Paper plane
    Arrow|Fletching
    Weathervane|Weather vane
    Teddy bear|Cuddly toy;Soft toy;Stuffed animal
    Pin the tail on the donkey|Donkey tail
    Fancy dress|Costume;Cat costume;Devil costume;Dinosaur costume;Onesie
    Car|Tail light;Taillight;Tail lights
    Exhaust|Tailpipe;Tail pipe
    Tailgate|Pickup truck
    Lorry|Tail lift
    Train|Tail lamp
    Traffic jam|Tailback
    Dovetail|Dovetail joint
    Fishtail plait|Fishtail braid;Fishtail
    Rat tail|Rat tail hairstyle
    Rat-tail comb|Rat tail comb
    Rat-tail file|Rat tail file
    Oxtail|Oxtail soup
    Lobster tail
    Prawn tail|Shrimp tail
    Monkfish tail
    BeaverTails|Beaver tail pastry
    Sugar mouse|Sugar mice;Jelly mice
    Sperm|Sperm cell;Spermatozoon
    Bacteria|Flagellum
    Galaxy|Tadpole Galaxy;Tidal tail
    Mare's tails|Mare's tail clouds;Cirrus
    Storm|Hurricane;Tornado
    Statistics|Distribution;Bell curve;Normal distribution;Long tail;Fat tail
    Tail command|tail
    Linked list|Tail node
    Tail recursion
    Foxtail|Foxtail grass;Foxtail palm;Foxtail lily;Foxtail millet
    Horsetail|Horsetail plant
    Cattail|Bulrush;Reed mace
    Ponytail palm
    Bunny tail grass|Hare's tail grass
    Lamb's tails|Catkins
    Rat's tail cactus
    Lizard's tail
    Lion's tail
    Donkey's tail|Burro's tail
    Mouse plant|Mouse-tail plant
    Monkey tail cactus
    Turkey tail|Turkey tail fungus
    Dog's-tail grass|Crested dog's-tail
    Squirrel-tail barley
    Love-lies-bleeding
    Wedding dress|Bridal train
    Morning coat|Swallowtail coat
    Fishtail dress|Fishtail skirt
    Fishtail parka
    Davy Crockett hat
    Belt|Belt tail
    Tie|Necktie
    Pokémon|Pokemon;Pikachu
    Goku|Saiyan
    Kurama|Nine-Tailed Fox;Kitsune
    Imp|Demon;Demons
    Satyr|Faun;Pan
    Centaur
    Krampus
    Xenomorph|Alien
    Godzilla
    Toothless
    Wyvern
    Basilisk
    Manticore
    Chimera
    Gargoyle
    Sea serpent|Loch Ness Monster;Nessie
    Na'vi
    Nightcrawler
    Ariel|The Little Mermaid
    Wookiee
    Lamia
    My Little Pony
    Toy dinosaur
    Sock monkey
    Slinky dog
    Furby
    Tadpole sweets
    Comma
    Cedilla
    Ogonek
    Greek letter|Zeta;Xi;Rho
    Swash
    Kite string
    Banner tail|Aerial banner
    Airship|Blimp;Zeppelin
    Space shuttle
    Bomb
    Torpedo
    Drone
    Wind turbine
    Windmill|Fantail
    Windsock|Wind sock
    Shuttlecock
    Tailplane|Tail fin;Empennage
    Tail wheel
    Tail hook
    Tailstock|Lathe
    Tailpiece|Violin;Guitar
    Swallowtail joint
    Tail vice
    Fishtail chisel
    Pigtail connector|Pigtail cable
    Cat-o'-nine-tails
    Whip
    Fly whisk
    Bell rope|Sally
    Mop
    Broom
    Procession|Parade
    Convoy
    Peloton
    Magnetotail
    Ion tail
    Mullet
    Duck's arse|Ducktail
    Manchu queue
    Hair extensions
    Tail of a river|River
    Tail risk
    Two-tailed test
  `)),

  day(ranked('short-war', 'history', 'Name a war that lasted less than 5 years', 'Wars under five years', `
    World War I|World War One;World War 1;First World War;WW1;WWI;The Great War;Great War
    Falklands War|Falklands;Falklands Conflict
    American Civil War|US Civil War;Civil War
    Six-Day War|Six Day War
    Gulf War|First Gulf War;Operation Desert Storm;Desert Storm;Persian Gulf War
    Korean War
    Spanish Civil War
    Crimean War
    Boer War|Second Boer War;Anglo-Boer War;South African War
    War of 1812
    Anglo-Zanzibar War|Zanzibar War
    Yom Kippur War|October War
    Franco-Prussian War
    Spanish–American War|Spanish-American War
    Mexican–American War|Mexican-American War;Mexican War
    Russo-Japanese War
    Winter War
    Kosovo War
    Bosnian War
    Emu War|Great Emu War
    Football War|Soccer War;Hundred Hours' War;100 Hours War
    Pig War
    Pastry War
    Anglo-Zulu War|Zulu War
    First Boer War|First Anglo-Boer War
    Jacobite rising of 1745|The Forty-Five;Jacobite Rebellion;1745 Rising
    First English Civil War|English Civil War
    Second English Civil War
    Third English Civil War
    Russo-Georgian War|Georgian War;2008 Georgia War
    2003 invasion of Iraq|Iraq invasion
    Hundred Days|War of the Seventh Coalition;100 Days;Hundred Days War;100 Day War
    Ten-Day War|Slovenian War of Independence
    Irish War of Independence|Anglo-Irish War
    Irish Civil War
    Easter Rising
    First Opium War|Opium War
    Second Opium War|Arrow War
    First Anglo-Afghan War
    Second Anglo-Afghan War
    Third Anglo-Afghan War
    Austro-Prussian War|Seven Weeks' War;Seven Weeks War
    Second Schleswig War
    First Schleswig War
    First Balkan War|Balkan Wars
    Second Balkan War
    First Sino-Japanese War|Sino-Japanese War
    Russo-Turkish War (1877–78)|Russo-Turkish War
    Greco-Turkish War (1897)|Thirty Days' War
    Greco-Turkish War (1919–22)|Greco-Turkish War
    Polish–Soviet War|Polish-Soviet War
    Finnish Civil War
    Continuation War
    Lapland War
    Chaco War
    First Italo-Ethiopian War
    Second Italo-Ethiopian War|Italo-Ethiopian War;Abyssinian War
    Soviet–Japanese War|Soviet-Japanese War
    Greek Civil War
    Indonesian War of Independence|Indonesian National Revolution
    Nigerian Civil War|Biafran War
    Bangladesh Liberation War
    Indo-Pakistani War of 1971|Indo-Pakistani War;Indo-Pakistan War
    Indo-Pakistani War of 1965
    Indo-Pakistani War of 1947–48|First Kashmir War
    Kargil War
    Sino-Indian War
    Sino-Vietnamese War
    Second Nagorno-Karabakh War|Nagorno-Karabakh War;44-Day War
    2006 Lebanon War|Israel-Hezbollah War
    1982 Lebanon War|Lebanon War
    1948 Arab–Israeli War|1948 Arab-Israeli War;War of Independence (Israel)
    War of Attrition
    Suez Crisis|Suez War
    Gaza War (2008–09)|Gaza War
    Ogaden War
    Uganda–Tanzania War|Uganda-Tanzania War
    Eritrean–Ethiopian War|Ethiopian-Eritrean War
    First Chechen War|Chechen War
    Croatian War of Independence|Homeland War
    Philippine–American War|Philippine-American War
    Texas Revolution
    Boxer Rebellion|Boxer Uprising
    Toledo War
    Invasion of Grenada|Grenada
    Invasion of Panama|Panama invasion
    Bay of Pigs|Bay of Pigs Invasion
    US invasion of Afghanistan|2001 invasion of Afghanistan
    Cod Wars|Cod War
    War of the Bavarian Succession|Potato War
    Twelve-Day War|Israel-Iran War
    2025 India–Pakistan conflict|India-Pakistan conflict 2025
    First Anglo-Dutch War|Anglo-Dutch War
    Second Anglo-Dutch War
    Third Anglo-Dutch War
    Fourth Anglo-Dutch War
    Bishops' Wars|Bishops Wars
    Monmouth Rebellion
    Williamite War in Ireland|Williamite War
    Jacobite rising of 1715|The Fifteen
    Jacobite rising of 1719
    Jacobite rising of 1689
    Anglo-Scottish War (1650–52)|Anglo-Scottish War
    Pilgrimage of Grace
    Prayer Book Rebellion
    Kett's Rebellion
    Wyatt's Rebellion
    Rising of the North
    Peasants' Revolt
    Jack Cade's Rebellion
    First Barons' War
    Second Barons' War
    Irish Rebellion of 1798|1798 Rebellion
    Norman Conquest|Battle of Hastings
    First Anglo-Burmese War
    Second Anglo-Burmese War
    Third Anglo-Burmese War
    First Anglo-Sikh War|Anglo-Sikh War
    Second Anglo-Sikh War
    Second Anglo-Maratha War
    Third Anglo-Maratha War
    Anglo-Nepalese War|Gurkha War
    First Anglo-Mysore War
    Third Anglo-Mysore War
    Fourth Anglo-Mysore War
    Indian Rebellion of 1857|Indian Mutiny
    Anglo-Egyptian War
    Second Anglo-Ashanti War
    Third Anglo-Ashanti War|Anglo-Ashanti War
    Fourth Anglo-Ashanti War
    War of the Golden Stool
    First Matabele War|Matabele War
    Second Matabele War
    Anglo-Aro War
    British Expedition to Abyssinia|Abyssinian Expedition
    Benin Expedition
    Bambatha Rebellion
    Basuto Gun War
    Eighth Xhosa War|Xhosa War
    Ninth Xhosa War
    Seventh Xhosa War
    Sixth Xhosa War
    Fifth Xhosa War
    Fourth Xhosa War
    Anglo-Persian War
    Anglo-Turkish War
    Bhutan War|Duar War
    Anglo-Manipur War
    British expedition to Tibet
    Gallipoli|Gallipoli campaign
    Aden Emergency
    Indonesia–Malaysia confrontation|Konfrontasi;Borneo Confrontation
    Brunei revolt
    Quasi-War
    First Barbary War|Tripolitan War;Barbary War
    Second Barbary War
    Tecumseh's War
    Creek War
    First Seminole War|Seminole War
    Black Hawk War
    Winnebago War
    Utah War
    Dakota War
    Red Cloud's War
    Modoc War
    Red River War
    Great Sioux War
    Nez Perce War
    Shays' Rebellion|Shays Rebellion
    Whiskey Rebellion
    Pequot War
    King Philip's War
    Bacon's Rebellion
    Pontiac's War
    Occupation of Veracruz
    War of the Pacific
    Colombia–Peru War|Leticia War
    Ecuadorian–Peruvian War
    Cenepa War
    Paquisha War
    Cisplatine War
    Brazilian War of Independence
    Gran Colombia–Peru War
    War of the Confederation
    Platine War
    Uruguayan War
    Chincha Islands War
    Ecuadorian–Colombian War
    Chilean Civil War of 1891|Chilean Civil War
    Thousand Days' War
    Acre War
    Reform War
    Federal War
    Filibuster War
    Coto War
    Constitutionalist Revolution
    Cristero War
    Costa Rican Civil War
    Dominican Civil War
    Rebellions of 1837–38|Upper Canada Rebellion;Lower Canada Rebellion
    North-West Rebellion
    Cuban War of Independence
    Italian War of 1494–1498
    War of the League of Cognac
    Italian War of 1536–1538
    Italian War of 1542–1546
    Schmalkaldic War
    War of the Mantuan Succession
    Smolensk War
    Torstenson War
    Dano-Swedish War (1657–58)
    War of Devolution
    Scanian War
    War of the Reunions
    Russo-Persian War (1722–23)
    Anglo-Spanish War (1727–29)
    War of the Quadruple Alliance
    War of the Polish Succession
    First Silesian War
    Second Silesian War
    Russo-Swedish War (1788–90)
    Russo-Turkish War (1787–92)
    War of the Second Coalition
    War of the Oranges
    War of the Third Coalition
    War of the Fourth Coalition
    War of the Fifth Coalition
    War of the Sixth Coalition
    French invasion of Russia|Napoleon's invasion of Russia
    Neapolitan War
    Finnish War
    Dano-Swedish War (1808–09)
    Swedish–Norwegian War
    Hundred Thousand Sons of Saint Louis
    Russo-Turkish War (1828–29)
    Russo-Persian War (1826–28)
    Belgian Revolution
    November Uprising
    Sonderbund War
    First Italian War of Independence
    Hungarian Revolution of 1848|Hungarian War of Independence
    Second Carlist War
    Second Italian War of Independence
    Expedition of the Thousand
    January Uprising
    Third Italian War of Independence
    Cretan Revolt
    Paris Commune
    Third Carlist War
    Montenegrin–Ottoman War
    Serbo-Bulgarian War
    Italo-Turkish War
    Georgian–Armenian War
    Polish–Ukrainian War
    Hungarian–Czechoslovak War
    Estonian War of Independence
    Latvian War of Independence
    Armenian–Azerbaijani War
    Polish–Czechoslovak War
    Hungarian–Romanian War
    Turkish War of Independence
    Polish–Lithuanian War
    Turkish–Armenian War
    Franco-Syrian War
    Red Army invasion of Georgia
    Kronstadt rebellion
    Corfu incident
    War of the Stray Dog
    Austrian Civil War
    Italian invasion of Albania
    Slovak–Hungarian War
    Italian Civil War
    Boshin War
    Satsuma Rebellion
    Sino-French War
    Xinhai Revolution
    Northern Expedition
    Central Plains War
    Sino-Soviet conflict of 1929
    Japanese invasion of Manchuria|Mukden Incident
    Sino-Sikh War
    Egyptian–Ottoman War
    Saudi–Yemeni War
    Great Syrian Revolt
    Iraqi Revolt of 1920
    Anglo-Iraqi War
    Franco-Thai War
    Arab Revolt
    Afghan Civil War (1928–29)
    Franco-Siamese War
    Ethiopian–Egyptian War
    Hispano-Moroccan War
    Franco-Moroccan War
    Franco-Dahomean War
    Congo–Arab War
    Maji Maji Rebellion
    Herero Wars
    Maritz Rebellion
    Fulani War
    Flagstaff War
    First Taranaki War
    Franco-Tahitian War
    United States expedition to Korea
    Philippine Revolution
    First Kandyan War
    Second Kandyan War
    Invasion of Java (1811)
    British invasions of the River Plate
    Bombardment of Algiers
    Black September
    Yemenite War of 1979
    Yemeni Civil War (1994)
    Egyptian–Libyan War
    Annexation of Goa
    Operation Polo|Annexation of Hyderabad
    Battle of the Paracel Islands
    Indonesian invasion of East Timor
    Operation Trikora
    First Taiwan Strait Crisis
    Second Taiwan Strait Crisis
    Battle of Chamdo
    Sino-Soviet border conflict
    Korean DMZ Conflict
    Chinese Civil War (1945–49)
    Ethiopian–Somali Border War
    Sand War
    Ifni War
    Bizerte crisis
    Zanzibar Revolution
    Shifta War
    Shaba I
    Chadian–Nigerian War
    Toyota War
    Agacher Strip War
    Mauritania–Senegal Border War
    Djiboutian Civil War
    First Congo War
    Second Congo War
    Guinea-Bissau Civil War
    Republic of the Congo Civil War
    Rwandan Civil War
    Second Liberian Civil War
    Six-Day War (2000)|Kisangani war
    Second Ivorian Civil War
    Libyan Civil War (2011)|Libyan Civil War
    Heglig Crisis
    Operation Linda Nchi
    Djiboutian–Eritrean border conflict
    Invasion of Anjouan
    Tigray War
    Al-Fashaga conflict
    Central African Republic Bush War
    Hungarian Revolution of 1956
    Invasion of Czechoslovakia|Prague Spring invasion
    Turkish invasion of Cyprus
    Transnistria War
    South Ossetia War
    War in Abkhazia
    Georgian Civil War
    War of Dagestan
    Albanian civil unrest of 1997
    Insurgency in the Preševo Valley
    East Prigorodny conflict
    Batken conflict
    Al-Wadiah War
    Iran crisis of 1946
    1958 Lebanon crisis
    Hanish Islands conflict
    Iraqi Kurdish Civil War
    Second Iraqi–Kurdish War
    Iranian Revolution
    Iraqi Civil War (2006–08)
    Eelam War IV
    First Persian invasion of Greece|Battle of Marathon
    Second Persian invasion of Greece|Battle of Thermopylae
    Social War (Athens)
    Lamian War
    Mercenary War|Truceless War
    Second Macedonian War
    Roman–Seleucid War
    Third Macedonian War
    Third Punic War
    Social War (Rome)|Social War
    Third Servile War|Spartacus revolt
    Caesar's Civil War
    Liberators' civil war
    Final War of the Roman Republic|Battle of Actium
    Boudica's revolt|Boudican revolt
    Year of the Four Emperors
    First Dacian War
    Second Dacian War
    Kitos War
    Bar Kokhba revolt
    First Crusade
    Second Crusade
    Third Crusade
    Fourth Crusade
    Fifth Crusade
    Sixth Crusade
    Eighth Crusade
    Ninth Crusade
    War of Saint-Sardos
    War of the Eight Saints
    War of Chioggia
  `)),

  day(ranked('magnetic-substance', 'science', 'Name a substance that is naturally magnetic', 'Naturally magnetic substances', `
    Iron
    Lodestone|Loadstone;Natural magnet
    Magnetite
    Nickel
    Cobalt
    Iron ore
    Meteorite|Iron meteorite;Meteoric iron
    Earth|Earth's core
    Hematite|Haematite
    Black sand|Iron sand;Ironsand
    Basalt|Lava;Volcanic rock
    Gadolinium
    Native iron|Telluric iron
    Taconite
    Banded iron formation|BIF
    Ironstone
    Pyrrhotite|Magnetic pyrites
    Oxygen|Liquid oxygen
    Gabbro
    Serpentinite|Serpentine
    Peridotite
    Obsidian
    Scoria|Volcanic ash
    Laterite
    Bog iron
    Limonite
    Goethite
    Garnet
    Biotite
    Olivine
    Siderite
    Chromite
    Ilmenite
    Maghemite
    Titanomagnetite
    Greigite
    Pallasite
    Mesosiderite
    Chondrite|Ordinary chondrite
    Micrometeorite|Cosmic spherules
    Fulgurite|Lightning-struck rock
    Magnetotactic bacteria
    Magnetosomes
    Chiton teeth|Chiton
    Brain|Human brain
    Pigeon|Homing pigeon
    Salmon
    Honeybee|Honeybees
    Sea turtle|Turtle
    Terbium
    Dysprosium
    Holmium
    Erbium
    Thulium
    Manganese
    Platinum|Ferroan platinum
    Kimberlite
    Diorite
    Andesite
    Magnetite skarn
    Red clay
    Magnetic soil
    Hornblende
    Augite|Pyroxene
    Staurolite
    Tourmaline|Schorl
    Chlorite
    Lepidocrocite
    Ferrihydrite
    Jacobsite
    Magnesioferrite
    Franklinite
    Trevorite
    Titanohematite|Hemo-ilmenite
    Titanomaghemite
    Ulvöspinel|Ulvospinel
    Smythite
    Troilite
    Awaruite|Josephinite;Souesite
    Wairauite
    Kamacite
    Taenite
    Plessite
    Cohenite
    Schreibersite
    Native nickel
    Native cobalt
    Antitaenite
    Tetrataenite
    Magnetofossils
    Scaly-foot snail|Scaly-foot gastropod
  `)),
];
