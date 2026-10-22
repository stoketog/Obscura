import type { PromptSeed } from '@/lib/types';
import { ranked } from '../atlas';

/**
 * Friday 23 October 2026, prompts set by hand. Each list is in order of how often people would say it (the most
 * obvious first), which becomes the rarity: the first few Everyday, the last one or two Obscure.
 */
const day = (seed: PromptSeed): PromptSeed => ({ ...seed, editorial: true });

export const DAY_2026_10_23: PromptSeed[] = [
  day(ranked('country-starts-c', 'geography', 'Name a country that starts with the letter C', 'Countries · starting with C', `
    Canada
    China
    Chile
    Cuba
    Colombia
    Croatia
    Czech Republic|Czechia
    Cyprus
    Costa Rica
    Cameroon
    Cambodia
    Chad
    Congo|Republic of the Congo;Congo-Brazzaville;Congo Brazzaville
    Central African Republic|CAR
    Cape Verde|Cabo Verde
    Côte d'Ivoire|Cote d'Ivoire;Cote dIvoire
    Comoros
    Congo-Kinshasa|DR Congo;DRC;Democratic Republic of the Congo;Congo Kinshasa
    Curaçao|Curacao
    Cook Islands
  `)),

  day(ranked('film-masked-character', 'screen', 'Name a film that features a character wearing a mask', 'Films with masked characters', `
    The Mask
    V for Vendetta
    Scream|Scream 2;Scream 3;Scream 4;Scream 5;Scream VI;Ghostface
    Halloween|Halloween Kills;Halloween Ends;Halloween II;Michael Myers
    Star Wars|A New Hope;Star Wars: A New Hope;Darth Vader
    The Dark Knight|Dark Knight
    The Phantom of the Opera|Phantom of the Opera
    Spider-Man|Spiderman;Spider-Man 2;Spider-Man 3
    Batman|The Batman;Batman Begins;Batman Returns;Batman Forever;Batman and Robin;Batman & Robin
    Friday the 13th|Friday the 13th Part III;Friday the Thirteenth;Jason X;Freddy vs. Jason;Freddy vs Jason;Jason Voorhees
    The Mask of Zorro|Zorro;The Legend of Zorro;Mask of Zorro
    Deadpool|Deadpool 2;Deadpool & Wolverine;Deadpool and Wolverine
    The Empire Strikes Back|Empire Strikes Back
    Return of the Jedi
    The Dark Knight Rises|Dark Knight Rises;Bane
    The Silence of the Lambs|Silence of the Lambs
    The Texas Chain Saw Massacre|Texas Chainsaw Massacre;The Texas Chainsaw Massacre;Leatherface
    Saw|Saw II;Saw III;Saw X
    The Incredibles|Incredibles;Incredibles 2
    Teenage Mutant Ninja Turtles|Ninja Turtles;TMNT
    Spider-Man: Into the Spider-Verse|Into the Spider-Verse;Spider-Verse;Across the Spider-Verse;Spider-Man: Across the Spider-Verse
    Spider-Man: No Way Home|No Way Home
    Spider-Man: Homecoming|Homecoming
    Spider-Man: Far From Home|Far From Home
    The Amazing Spider-Man|Amazing Spider-Man
    Black Panther|Black Panther: Wakanda Forever;Wakanda Forever
    Iron Man|Iron Man 2;Iron Man 3
    The Man in the Iron Mask|Man in the Iron Mask
    Mad Max: Fury Road|Fury Road;Mad Max
    Eyes Wide Shut
    The Purge|The Purge: Anarchy;The Purge: Election Year;The First Purge
    Kick-Ass|Kick Ass;Kick-Ass 2
    Watchmen
    Mission: Impossible|Mission Impossible
    Point Break
    A Clockwork Orange|Clockwork Orange
    Donnie Darko
    Pulp Fiction
    Kill Bill|Kill Bill: Volume 1;Kill Bill Vol. 1
    Joker
    Predator|The Predator;Predators;Prey
    Rogue One|Rogue One: A Star Wars Story
    Revenge of the Sith|Star Wars: Revenge of the Sith
    The Force Awakens|Star Wars: The Force Awakens
    The Last Jedi|Star Wars: The Last Jedi
    The Rise of Skywalker|Star Wars: The Rise of Skywalker
    Batman v Superman: Dawn of Justice|Batman v Superman
    Justice League|Zack Snyder's Justice League
    The Lego Batman Movie|Lego Batman
    Scooby-Doo|Scooby Doo
    Mortal Kombat
    The Black Phone|Black Phone
    The Lone Ranger|Lone Ranger
    The Green Hornet|Green Hornet
    Daredevil
    Green Lantern
    Dredd|Judge Dredd
    RoboCop
    Hannibal|Hannibal Rising;Red Dragon
    Romeo + Juliet|Romeo and Juliet
    The Strangers|Strangers
    You're Next
    Face/Off|Face Off
    Darkman
    Phantom of the Paradise
    The Phantom
    Son of the Mask
    Venom
    Contagion
    Outbreak
    Labyrinth
    Sinister
    Hellboy
    Dune|Dune: Part Two
    The Elephant Man|Elephant Man
    Top Gun|Top Gun: Maverick
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
    Washing line|Clothes line;Rotary washing line;Rotary dryer;Whirligig
    Barbecue|BBQ;Barbie
    Lawnmower|Mower;Lawn mower
    Wheelbarrow
    Bench|Garden bench
    Trampoline
    Robin
    Hedgehog
    Squirrel|Squirrels;Grey squirrel
    Slugs|Slug
    Snails|Snail
    Worms|Worm;Earthworm
    Bees|Bee;Bumblebee
    Fox|Foxes
    Cat|Cats;Neighbour's cat
    Daffodils|Daffodil
    Weeds|Weed
    Apple tree
    Butterflies|Butterfly
    Blackbird
    Dandelions|Dandelion
    Bird bath|Birdbath
    Compost heap|Compost;Compost bin
    Flower bed|Flowerbed;Border;Flower border
    Plant pots|Plant pot;Pots;Flower pot;Flowerpot
    Hose|Hosepipe;Garden hose
    Watering can
    Garden furniture|Table and chairs;Patio furniture;Garden table;Garden chairs
    Hanging basket
    Vegetable patch|Veg patch;Vegetable garden;Vegetables
    Water butt|Rain barrel
    Decking|Deck
    Swing|Swing set
    Slide
    Paddling pool
    Parasol|Umbrella;Garden umbrella
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
    Fountain|Water feature
    Statue|Garden statue
    Sundial
    Bird box|Nest box;Birdhouse
    Hedgehog house
    Bug hotel|Insect hotel
    Solar lights|Garden lights;Fairy lights;Festoon lights
    Wheelie bin|Bin;Bins;Recycling bin
    Bike|Bicycle
    Football|Ball
    Goalposts|Goal;Football goal
    Deckchair|Deck chair
    Sun lounger|Lounger
    Rake
    Spade
    Garden fork|Fork
    Trowel
    Shears
    Secateurs
    Strimmer|Trimmer
    Leaf blower
    Gardening gloves|Gloves
    Wellies|Wellington boots
    Rabbit hutch|Hutch
    Chicken coop|Chickens;Hens
    Kennel
    Cherry tree
    Tulips|Tulip
    Lavender
    Foxgloves|Foxglove
    Sweet peas|Sweet pea
    Sunflowers|Sunflower
    Daisies|Daisy
    Moss
    Nettles|Stinging nettles
    Ivy
    Holly
    Hydrangea
    Fuchsia
    Geraniums|Geranium;Pelargonium
    Buddleia|Butterfly bush
    Clematis
    Honeysuckle
    Wisteria
    Magnolia
    Rhododendron
    Leylandii|Conifer;Conifers
    Herbs|Herb garden
    Mint
    Rhubarb
    Strawberries|Strawberry
    Tomatoes|Tomato plants;Tomato
    Runner beans|Runner bean
    Potatoes|Potato
    Sparrows|Sparrow
    Blue tit|Blue tits
    Pigeons|Pigeon;Wood pigeon
    Dog
    Ladybirds|Ladybird
    Spiders|Spider;Spider web;Cobweb
    Ants|Ant
    Wasps|Wasp
    Frogs|Frog
    Molehill|Molehills;Mole
    Toad
    Newt
    Slow worm
  `)),

  day(ranked('has-battery', 'general', 'Name something that has a battery', 'Things with a battery', `
    Phone|Mobile phone;Mobile;Smartphone;Cell phone;iPhone
    Remote control|Remote;TV remote
    Laptop
    Car
    Watch|Wristwatch
    Torch|Flashlight
    Smoke alarm|Smoke detector
    Electric car|EV;Tesla;Electric vehicle
    Tablet|iPad
    Clock|Alarm clock;Wall clock
    Camera|Digital camera
    Toys|Toy;Remote control car;RC car
    Game controller|Controller;Xbox controller;PlayStation controller;Joypad
    Headphones|Wireless headphones
    Earbuds|AirPods;Earphones
    Electric toothbrush|Toothbrush
    Calculator
    Smartwatch|Apple Watch;Fitness tracker;Fitbit
    Hearing aid
    Pacemaker
    E-bike|Electric bike;Electric bicycle
    E-scooter|Electric scooter;Scooter
    Drone
    Wireless mouse|Mouse;Computer mouse
    Keyboard|Wireless keyboard
    Vape|E-cigarette
    Kindle|E-reader
    Power bank|Portable charger
    Radio|Portable radio
    Video doorbell|Ring doorbell;Doorbell
    Cordless drill|Drill;Power drill;Power tools
    Cordless vacuum|Dyson;Vacuum cleaner;Hoover
    Robot vacuum|Roomba;Robot hoover
    Nintendo Switch|Switch;Game Boy;Handheld console
    Bluetooth speaker|Speaker;Portable speaker
    Electric shaver|Shaver;Razor;Electric razor
    Hair clippers|Clippers;Beard trimmer;Trimmer
    Car key|Key fob;Car key fob
    Kitchen scales|Scales;Bathroom scales
    Thermometer|Digital thermometer
    Baby monitor
    Walkie-talkie|Walkie talkie;Two-way radio
    Hoverboard
    Mobility scooter
    Golf buggy|Golf cart
    Motorbike|Motorcycle
    Boat
    Forklift|Fork-lift truck
    Lawnmower|Robot lawnmower;Cordless lawnmower
    Leaf blower
    Satnav|Sat nav;GPS
    Dashcam|Dash cam
    GoPro|Action camera
    Laser pointer
    Defibrillator|AED;Defib
    Glucose monitor|Blood glucose meter;Glucometer
    Insulin pump
    Metal detector
    Tamagotchi
    Furby
    Fairy lights|Christmas lights;Battery lights
    Solar garden lights|Solar lights
    Tape measure|Laser measure
    Multimeter
    Garage door opener
    Home battery|Powerwall;Tesla Powerwall
    UPS|Uninterruptible power supply
    Plane|Aeroplane;Airplane
    Satellite
    Mars rover|Rover
    Submarine
    Electric guitar pedal|Guitar pedal;Tuner
    Microphone|Wireless microphone
    Heated gloves|Heated jacket
    Electric blanket
    Bike light|Bike lights
    Head torch
    Lantern|Camping lantern
    Pager
    Robot
  `)),

  day(ranked('tail-not-animal', 'general', 'Name something that has a tail but isn’t an animal', 'Tails that aren’t animals', `
    Kite
    Comet
    Plane|Aeroplane;Airplane;Aircraft
    Coin|Heads or tails
    Ponytail|Hair
    Tailcoat|Tails;Coat;Dinner jacket;Tuxedo;Swallowtail coat
    Shirt|Shirt tail
    Helicopter
    Mermaid
    Dragon
    Devil|Satan
    Shooting star|Meteor
    Grand piano|Piano
    Queue|Tail of a queue
    Pigtail|Pigtails
    Letter Q|Q
    Letter Y|Y;Letter G;G;Letter J;J
    Musical note|Note;Quaver;Crotchet;Minim
    Glider
    Rocket
    Missile
    Weathervane|Weather vane
    Arrow
    Sperm|Sperm cell;Spermatozoon
    Car|Tail light;Taillight;Tail lights
    Exhaust|Tailpipe;Tail pipe
    Tailgate|Pickup truck
    Dovetail|Dovetail joint
    Fishtail plait|Fishtail braid;Fishtail
    Rat-tail comb|Rat tail comb
    Oxtail|Oxtail soup
    Lobster tail
    Statistics|Distribution;Bell curve;Normal distribution
    Storm|Hurricane;Tornado;Weather front
    Pin the tail on the donkey|Donkey tail
    Teddy bear|Cuddly toy;Soft toy
    Bacteriophage|Virus;Phage
    Tadpole galaxy|Galaxy
    Horsetail|Horsetail plant
    Foxtail|Foxtail grass
    Cattail|Bulrush
    Bridal train|Wedding dress;Train
    Airship|Blimp;Zeppelin
    Wind sock|Windsock
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
    Yom Kippur War|Arab-Israeli War of 1973;October War
    Franco-Prussian War
    Spanish-American War|Spanish–American War
    Mexican-American War|Mexican War;Mexican–American War
    Russo-Japanese War
    Winter War
    Kosovo War
    Bosnian War
    Emu War|Great Emu War
    Football War|Soccer War;Hundred Hours' War
    Ten-Day War|Slovenian War of Independence
    Irish War of Independence|Anglo-Irish War
    Irish Civil War
    First Boer War|First Anglo-Boer War
    Anglo-Zulu War|Zulu War
    First Opium War|Opium War
    Second Opium War|Arrow War
    First Anglo-Afghan War
    Second Anglo-Afghan War
    Third Anglo-Afghan War
    Austro-Prussian War|Seven Weeks' War;Seven Weeks War
    Second Schleswig War
    First Schleswig War
    Balkan Wars|First Balkan War;Second Balkan War
    First Sino-Japanese War|Sino-Japanese War
    Russo-Turkish War
    Greco-Turkish War
    Polish-Soviet War|Polish–Soviet War
    Finnish Civil War
    Continuation War
    Chaco War
    Second Italo-Ethiopian War|Italo-Ethiopian War;Abyssinian War
    Soviet-Japanese War|Soviet–Japanese War
    Greek Civil War
    Indonesian War of Independence|Indonesian National Revolution
    First English Civil War|English Civil War
    Nigerian Civil War|Biafran War
    Bangladesh Liberation War
    Indo-Pakistani War of 1971|Indo-Pakistani War;Indo-Pakistan War
    Indo-Pakistani War of 1965
    Kargil War
    Sino-Indian War
    Sino-Vietnamese War
    Russo-Georgian War|Georgian War;2008 Georgia War
    Second Nagorno-Karabakh War|Nagorno-Karabakh War;44-Day War
    2006 Lebanon War|Lebanon War;Israel-Hezbollah War
    Suez Crisis|Suez War
    Ogaden War
    Uganda-Tanzania War|Uganda–Tanzania War
    Eritrean-Ethiopian War|Ethiopian-Eritrean War
    First Chechen War|Chechen War
    Croatian War of Independence|Homeland War
    Philippine-American War|Philippine–American War
    Texas Revolution
    Boxer Rebellion|Boxer Uprising
    Pig War
    Toledo War
    Invasion of Grenada|Grenada
    Cod Wars|Cod War
    War of the Bavarian Succession|Potato War
  `)),

  day(ranked('magnetic-substance', 'science', 'Name a substance that is naturally magnetic', 'Naturally magnetic substances', `
    Magnetite
    Iron
    Lodestone
    Nickel
    Cobalt
    Iron ore
    Hematite|Haematite
    Pyrrhotite
    Meteorite|Iron meteorite;Meteoric iron
    Gadolinium
    Maghemite
    Black sand|Iron sand;Ironsand
    Basalt|Lava;Volcanic rock
    Titanomagnetite
    Greigite
    Ilmenite
    Kamacite
    Taenite
    Awaruite
    Franklinite
    Jacobsite
    Goethite
    Earth's core|Earth;Earth's crust
    Magnetotactic bacteria
    Tetrataenite
  `)),
];
