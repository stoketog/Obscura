import type { PromptSeed } from '@/lib/types';
import { ranked } from './atlas';

/** More hand-written prompts (food, sport, screen, music, arts), in the same format as atlas.ts. */
export const ATLAS2: PromptSeed[] = [
  // ── Food ───────────────────────────────────────────────────────────────────
  ranked('vegetable', 'food', 'Name a vegetable', 'Vegetables', `
    Carrot
    Potato
    Broccoli
    Pea|Peas
    Onion
    Cabbage
    Lettuce
    Cauliflower
    Tomato
    Cucumber
    Sweetcorn|Corn;Maize;Corn on the cob
    Spinach
    Pepper|Bell pepper;Capsicum;Sweet pepper
    Mushroom
    Courgette|Zucchini
    Aubergine|Eggplant
    Brussels sprout|Sprout;Brussel sprout
    Leek
    Celery
    Garlic
    Parsnip
    Sweet potato
    Yam
    Green bean|French bean;String bean
    Runner bean
    Broad bean|Fava bean
    Kale
    Asparagus
    Beetroot|Beet
    Turnip
    Swede|Rutabaga
    Radish
    Pumpkin
    Butternut squash|Squash
    Artichoke|Globe artichoke
    Avocado
    Spring onion|Scallion;Green onion
    Shallot
    Chilli|Chili;Chilli pepper
    Rocket|Arugula
    Watercress|Cress
    Pak choi|Bok choy
    Okra|Ladies' fingers
    Fennel
    Celeriac
    Kohlrabi
    Chard|Swiss chard
    Mangetout|Snow pea
    Sugar snap pea|Sugar snap
    Edamame
    Chickpea|Garbanzo
    Lentil|Lentils
    Kidney bean
    Jerusalem artichoke
    Endive|Chicory
    Radicchio
    Marrow
    Gherkin
    Olive
    Cassava|Yuca;Manioc
    Taro
    Plantain
    Daikon|Mooli
    Bamboo shoot|Bamboo shoots
    Bean sprout|Beansprouts
    Water chestnut
    Lotus root
    Samphire
    Salsify
    Romanesco
    Tomatillo
    Jicama
    Kalettes
    Broccolini|Tenderstem
    Cavolo nero
    Collard greens|Collards
    Mustard greens
    Seaweed|Kelp;Nori
    Sorrel
    Purslane
    Celtuce
    Fiddlehead
    Nettle
    Cardoon
    Burdock
  `),
  ranked('dessert', 'food', 'Name a dessert or pudding', 'Desserts', `
    Ice cream
    Cheesecake
    Apple pie
    Chocolate cake
    Tiramisu
    Brownie
    Trifle
    Crème brûlée|Creme brulee
    Sticky toffee pudding
    Apple crumble|Crumble
    Banoffee pie|Banoffee
    Pavlova
    Eton mess
    Bread and butter pudding
    Rice pudding
    Jelly|Jell-O
    Mousse|Chocolate mousse
    Panna cotta
    Profiteroles
    Lemon meringue pie
    Key lime pie
    Black Forest gateau|Black Forest cake
    Spotted dick
    Jam roly-poly|Roly-poly
    Treacle tart
    Bakewell tart
    Christmas pudding|Plum pudding
    Carrot cake
    Victoria sponge
    Arctic roll
    Knickerbocker glory
    Banana split
    Sundae
    Sorbet
    Gelato
    Fruit salad
    Pecan pie
    Pumpkin pie
    Cobbler|Peach cobbler
    Baked Alaska
    Crêpes|Crepes;Pancakes
    Waffles
    Churros
    Doughnut|Donut
    Cupcake
    Macaron
    Éclair|Eclair
    Cannoli
    Baklava
    Strudel|Apple strudel
    Tarte Tatin
    Soufflé|Souffle
    Clafoutis
    Crème caramel|Flan
    Mille-feuille|Vanilla slice
    Gulab jamun
    Kulfi
    Mochi
    Affogato
    Semifreddo
    Zabaglione
    Syllabub
    Fool|Gooseberry fool
    Summer pudding
    Cranachan
    Sticky date pudding
    Queen of puddings
    Tapioca
    Semolina
    Blancmange
    Angel Delight
    Bread pudding
    Sachertorte
    Tres leches
    Pastel de nata|Custard tart
    Mango sticky rice
    Halva
    Kheer
    Knafeh
    Basbousa
    Malva pudding
    Lamington
    Cendol
  `),
  ranked('breakfast-cereal', 'food', 'Name a breakfast cereal', 'Breakfast cereals', `
    Corn Flakes|Cornflakes
    Weetabix
    Rice Krispies|Rice Bubbles
    Coco Pops|Cocoa Puffs
    Cheerios
    Frosties|Frosted Flakes
    Shreddies
    Porridge|Oatmeal;Oats
    Muesli
    Granola
    Special K
    Shredded Wheat
    Crunchy Nut|Crunchy Nut Cornflakes
    Bran Flakes
    Lucky Charms
    Froot Loops
    Cinnamon Toast Crunch|Curiously Cinnamon
    Cap'n Crunch|Captain Crunch
    Golden Nuggets
    Sugar Puffs|Honey Monster Puffs
    Golden Grahams
    Cookie Crisp
    Ready Brek
    Alpen
    All-Bran
    Raisin Bran
    Fruit 'n Fibre
    Oatibix
    Krave
    Honey Nut Cheerios
    Lion
    Nesquik
    Cini Minis
    Chocapic
    Crunchy Bran
    Grape-Nuts
    Honey Loops|Honey Hoops
    Puffed Wheat
    Puffed Rice
    Frosted Shreddies
    Start
    Golden Crisp
    Trix
    Kix
    Wheaties
    Chex
    Corn Pops
    Apple Jacks
    Honey Smacks|Smacks
    Fruity Pebbles|Pebbles
    Cocoa Pebbles
    Count Chocula
    Reese's Puffs
    Mini Wheats|Frosted Mini-Wheats
    Life
    Quaker Oat Squares
    Ricicles
    Puffa Puffa Rice
    Weetos
    Optivita
    Fitness
    Crunchy Nut Clusters
    Clusters
  `),
  ranked('soup', 'food', 'Name a soup', 'Soups', `
    Tomato soup|Tomato
    Chicken noodle soup|Chicken noodle
    Minestrone
    Leek and potato|Potato and leek
    French onion soup|French onion;Onion soup
    Pea and ham|Pea soup
    Mushroom soup|Cream of mushroom
    Broth
    Chicken soup
    Gazpacho
    Butternut squash soup
    Carrot and coriander
    Vegetable soup
    Lentil soup
    Oxtail soup|Oxtail
    Mulligatawny
    Scotch broth
    Cullen skink
    Cock-a-leekie
    Clam chowder|Chowder
    Bouillabaisse
    Borscht|Beetroot soup
    Miso soup|Miso
    Ramen
    Pho
    Tom yum
    Laksa
    Wonton soup
    Hot and sour soup
    Bisque|Lobster bisque
    Vichyssoise
    Goulash
    Gumbo
    Consommé|Consomme
    Cream of tomato
    Broccoli and stilton
    Pumpkin soup
    Watercress soup
    Celery soup
    Asparagus soup
    Parsnip soup
    Tortilla soup
    Matzo ball soup|Matzah ball soup
    Egg drop soup
    Avgolemono
    Harira
    Ribollita
    Pozole
    Menudo
    Caldo verde
    Cawl
    Callaloo
    Sopa de ajo|Garlic soup
    Solyanka
    Shchi
    Okroshka
    Tom kha|Tom kha gai
    Sinigang
    Soto
    Bird's nest soup
    Shark fin soup
    Kimchi jjigae
    Mohinga
    Pepper pot
    Cioppino
    Stracciatella
    Zuppa toscana
    Bread soup
  `),
  ranked('sauce', 'food', 'Name a sauce or condiment', 'Sauces and condiments', `
    Ketchup|Tomato ketchup;Tomato sauce;Catsup
    Mayonnaise|Mayo
    Mustard
    Brown sauce|HP Sauce;HP
    Gravy
    Barbecue sauce|BBQ sauce
    Soy sauce|Soya sauce
    Salsa
    Pesto
    Worcestershire sauce|Worcester sauce
    Hot sauce|Chilli sauce
    Sriracha
    Tabasco
    Mint sauce
    Horseradish
    Apple sauce
    Cranberry sauce
    Bread sauce
    Tartare sauce|Tartar sauce
    Hollandaise
    Béarnaise|Bearnaise
    Béchamel|Bechamel;White sauce
    Bolognese|Ragu
    Carbonara
    Peppercorn sauce|Pepper sauce
    Cheese sauce
    Custard
    Chocolate sauce
    Toffee sauce|Caramel sauce
    Sweet chilli sauce
    Teriyaki
    Hoisin
    Oyster sauce
    Fish sauce|Nam pla
    Curry sauce
    Salad cream
    Vinegar|Malt vinegar
    Balsamic vinegar|Balsamic
    Piccalilli
    Chutney|Mango chutney
    Branston Pickle|Pickle
    Relish
    Guacamole
    Hummus
    Tzatziki
    Aioli|Garlic mayo
    Ranch
    Thousand Island
    Caesar dressing
    Vinaigrette|French dressing
    Marie Rose|Seafood sauce
    Peri-peri|Piri piri
    Harissa
    Chimichurri
    Romesco
    Salsa verde
    Marinara
    Arrabbiata
    Puttanesca
    Alfredo
    Satay|Peanut sauce
    Tahini
    Sambal
    Gochujang
    Ponzu
    Tonkatsu sauce
    Mole
    Enchilada sauce
    Buffalo sauce
    XO sauce
    Plum sauce
    Black bean sauce
    Raita
    Velouté|Veloute
    Espagnole
    Beurre blanc
    Remoulade
    Gribiche
    Cumberland sauce
    Reform sauce
  `),
  ranked('fast-food-chain', 'food', 'Name a fast-food or restaurant chain', 'Restaurant chains', `
    McDonald's|McDonalds;Maccies;Mcdonald's
    KFC|Kentucky Fried Chicken
    Burger King
    Subway
    Pizza Hut
    Domino's|Dominos
    Nando's|Nandos
    Greggs
    Starbucks
    Costa|Costa Coffee
    Wendy's
    Taco Bell
    Five Guys
    Pret A Manger|Pret
    Wagamama
    PizzaExpress|Pizza Express
    Papa John's|Papa Johns
    Leon
    Wimpy
    Frankie & Benny's|Frankie and Benny's
    TGI Fridays|TGI Friday's;Fridays
    Harvester
    Toby Carvery
    Wetherspoons|JD Wetherspoon;Spoons
    Bella Italia
    Zizzi
    Prezzo
    ASK Italian|Ask
    Itsu
    Yo! Sushi|Yo Sushi
    Wingstop
    Popeyes
    Chick-fil-A
    Chipotle
    In-N-Out|In-N-Out Burger
    Shake Shack
    Dunkin'|Dunkin Donuts;Dunkin
    Krispy Kreme
    Tim Hortons
    Arby's
    Dairy Queen
    Sonic
    Jack in the Box
    Carl's Jr.|Carl's Jr;Hardee's
    White Castle
    Little Caesars
    Panda Express
    Panera Bread|Panera
    Applebee's
    Denny's
    IHOP
    Olive Garden
    Outback Steakhouse|Outback
    Red Lobster
    Hooters
    Cracker Barrel
    The Cheesecake Factory|Cheesecake Factory
    Hard Rock Cafe
    Rainforest Cafe
    Harry Ramsden's
    Little Chef
    Beefeater
    Bill's
    Byron
    Honest Burgers
    GBK|Gourmet Burger Kitchen
    Tortilla
    Barburrito
    German Doner Kebab|GDK
    Chicken Cottage
    Morley's
    Dixy Chicken|Dixy
    Caffè Nero|Caffe Nero;Nero
    Pizza Pilgrims
    Franco Manca
    Côte|Cote
    Las Iguanas
    Giraffe
    Carluccio's
    Jollibee
    Mos Burger
    Max Burgers|Max
    Hesburger
    Quick
    Nordsee
    Telepizza
  `),
  // ── Sport ──────────────────────────────────────────────────────────────────
  ranked('football-stadium', 'sport', 'Name a football stadium (any country)', 'Football stadiums', `
    Wembley|Wembley Stadium
    Old Trafford
    Anfield
    Camp Nou|Nou Camp;Spotify Camp Nou
    Santiago Bernabéu|Bernabeu;Bernabéu
    San Siro|Giuseppe Meazza
    Emirates Stadium|The Emirates;Emirates
    Stamford Bridge
    Etihad Stadium|The Etihad;Etihad;City of Manchester Stadium
    Allianz Arena
    Maracanã|Maracana
    St James' Park|St James Park
    Celtic Park|Parkhead
    Ibrox
    Hampden Park|Hampden
    Goodison Park|Goodison
    Villa Park
    Tottenham Hotspur Stadium|Tottenham Stadium
    White Hart Lane
    Highbury
    Signal Iduna Park|Westfalenstadion
    Stade de France
    Parc des Princes
    Estadio Azteca|Azteca;Estadio Banorte
    La Bombonera|Bombonera
    Elland Road
    Hillsborough
    Molineux
    Selhurst Park
    Craven Cottage
    London Stadium|Olympic Stadium
    Upton Park|Boleyn Ground
    Maine Road
    Turf Moor
    Bramall Lane
    Stadium of Light
    Riverside Stadium|Riverside
    City Ground
    King Power Stadium
    Carrow Road
    Portman Road
    St Mary's Stadium|St Mary's
    Amex Stadium|Amex;Falmer Stadium
    Vitality Stadium|Dean Court
    Gtech Community Stadium|Brentford Community Stadium
    The Hawthorns
    Ewood Park
    Hill Dickinson Stadium|Bramley-Moore Dock;Everton Stadium
    Pride Park
    Fratton Park
    The Den
    Kenilworth Road
    Vicarage Road
    Loftus Road
    Ashton Gate
    Ninian Park
    Cardiff City Stadium
    Principality Stadium|Millennium Stadium
    Windsor Park
    Aviva Stadium|Lansdowne Road
    Croke Park
    Tynecastle
    Easter Road
    Pittodrie
    Juventus Stadium|Allianz Stadium
    Stadio Olimpico|Olimpico
    Diego Armando Maradona Stadium|San Paolo
    Metropolitano|Wanda Metropolitano;Riyadh Air Metropolitano
    Mestalla
    Ramón Sánchez Pizjuán|Sanchez Pizjuan
    San Mamés|San Mames
    Estádio da Luz|Estadio da Luz;Da Luz
    Estádio do Dragão|Estadio do Dragao
    Johan Cruyff Arena|Amsterdam Arena;Amsterdam ArenA
    De Kuip|Feijenoord Stadion
    Philips Stadion
    Olympiastadion|Olympiastadion Berlin
    Veltins-Arena|Veltins Arena;Arena AufSchalke
    Red Bull Arena
    Stade Vélodrome|Velodrome;Stade Velodrome
    Türk Telekom Stadium|Turk Telekom
    Luzhniki
    Estadio Monumental|El Monumental;Monumental
    Morumbi|MorumBIS
    Centenario|Estadio Centenario
    Soccer City|FNB Stadium
    Lusail Stadium|Lusail
    Khalifa International Stadium
    MetLife Stadium|MetLife
    Rose Bowl
    SoFi Stadium|SoFi
    AT&T Stadium
    Mercedes-Benz Stadium
    Hard Rock Stadium
    BC Place
    BMO Field
  `),
  ranked('sporting-event', 'sport', 'Name a famous sporting event or tournament', 'Sporting events', `
    World Cup|FIFA World Cup
    Olympics|Olympic Games;Summer Olympics
    Super Bowl
    Wimbledon
    Tour de France
    Grand National
    Champions League final|Champions League
    FA Cup final|FA Cup
    Euros|European Championship
    Ryder Cup
    The Masters|Masters;US Masters
    Ashes|The Ashes
    Six Nations
    Rugby World Cup
    Winter Olympics
    Paralympics|Paralympic Games
    Commonwealth Games
    US Open
    French Open|Roland Garros
    Australian Open
    The Open|Open Championship;British Open
    Monaco Grand Prix
    Indianapolis 500|Indy 500
    Daytona 500
    Kentucky Derby
    Cheltenham Festival|Cheltenham
    Royal Ascot|Ascot
    Epsom Derby|The Derby
    Melbourne Cup
    Boat Race|The Boat Race
    London Marathon
    Boston Marathon
    New York Marathon|New York City Marathon
    Stanley Cup
    World Series
    NBA Finals
    Copa América|Copa America
    Africa Cup of Nations|AFCON
    Asian Cup
    Gold Cup
    Club World Cup
    Europa League
    Cricket World Cup
    T20 World Cup
    IPL|Indian Premier League
    PGA Championship
    Le Mans|24 Hours of Le Mans
    Dakar Rally|Paris-Dakar
    Isle of Man TT|TT
    Davis Cup
    Billie Jean King Cup|Fed Cup
    Solheim Cup
    America's Cup
    World Snooker Championship|Crucible
    World Darts Championship
    Calcutta Cup
    Giro d'Italia|Giro
    Vuelta a España|Vuelta
    Asian Games
    Pan American Games
    X Games
    Ironman|Ironman World Championship
    Tour Down Under
    Grey Cup
    Super Rugby
    Heineken Cup|Champions Cup
    State of Origin
    AFL Grand Final
    Hong Kong Sevens
    Masters snooker|The Masters snooker
    UK Championship
    World Athletics Championships
    Diamond League
    Laver Cup
    King George VI Chase
    Breeders' Cup
    Preakness Stakes
    Belmont Stakes
    Prix de l'Arc de Triomphe|Arc
    Dubai World Cup
    Japan Cup
    Royal Rumble
    WrestleMania
    March Madness
    Rose Bowl Game
    Pro Bowl
    All-Star Game
    Vendée Globe|Vendee Globe
    Sydney to Hobart
    Fastnet Race
    Henley Royal Regatta|Henley
    Highland Games
    Tour of Britain
    Paris–Roubaix|Paris-Roubaix
    Milan–San Remo|Milan-San Remo
    Iditarod
  `),
  // ── Screen ─────────────────────────────────────────────────────────────────
  ranked('bond-film', 'screen', 'Name a James Bond film or a Bond actor', 'James Bond', `
    Skyfall
    Goldfinger
    Casino Royale
    GoldenEye|Golden Eye
    Sean Connery|Connery
    Daniel Craig|Craig
    Roger Moore|Moore
    Pierce Brosnan|Brosnan
    Dr. No|Dr No;Doctor No
    Spectre
    No Time to Die
    From Russia with Love
    Live and Let Die
    The Spy Who Loved Me
    Moonraker
    Thunderball
    You Only Live Twice
    Diamonds Are Forever
    Quantum of Solace
    Die Another Day
    Tomorrow Never Dies
    The World Is Not Enough
    Timothy Dalton|Dalton
    The Man with the Golden Gun
    For Your Eyes Only
    Octopussy
    A View to a Kill
    The Living Daylights
    Licence to Kill|License to Kill
    On Her Majesty's Secret Service|OHMSS
    George Lazenby|Lazenby
    Never Say Never Again
    David Niven|Niven
  `),
  ranked('pixar-film', 'screen', 'Name a Pixar film', 'Pixar films', `
    Toy Story
    Finding Nemo
    Monsters, Inc.|Monsters Inc
    The Incredibles|Incredibles
    Up
    Cars
    Inside Out
    Ratatouille
    WALL-E|Wall-E;Wall E
    Toy Story 2
    Toy Story 3
    Coco
    Finding Dory
    Inside Out 2
    Monsters University
    A Bug's Life|Bugs Life
    Incredibles 2
    Toy Story 4
    Brave
    Cars 2
    Cars 3
    Soul
    Luca
    Turning Red
    Onward
    The Good Dinosaur|Good Dinosaur
    Lightyear
    Elemental
    Elio
    Hoppers
    Toy Story 5
  `),
  ranked('soap-opera', 'screen', 'Name a TV soap opera', 'Soap operas', `
    EastEnders
    Coronation Street|Corrie
    Emmerdale|Emmerdale Farm
    Neighbours
    Home and Away
    Hollyoaks
    Dallas
    Dynasty
    Brookside
    Doctors
    Days of Our Lives
    The Bold and the Beautiful|Bold and the Beautiful
    The Young and the Restless|Young and the Restless
    General Hospital
    Crossroads
    Knots Landing
    Melrose Place
    Falcon Crest
    Peyton Place
    The Archers|Archers
    River City
    Fair City
    Pobol y Cwm
    Shortland Street
    Prisoner: Cell Block H|Prisoner Cell Block H;Prisoner
    Sons and Daughters
    A Country Practice
    The Sullivans
    Family Affairs
    Eldorado
    Guiding Light
    As the World Turns
    All My Children
    One Life to Live
    Santa Barbara
    Passions
    Sunset Beach
    Another World
    Ryan's Hope
    Dark Shadows
    Port Charles
    Beverly Hills, 90210|90210
    The O.C.|The OC
    Grange Hill
    Byker Grove
    Casualty
    Holby City
    Albion Market
    Families
    Gute Zeiten, schlechte Zeiten|GZSZ
    Lindenstraße|Lindenstrasse
    Goede tijden, slechte tijden|GTST
    Plus belle la vie
    Un posto al sole
    Amar es para siempre
    Acacias 38
  `),
  ranked('game-show', 'screen', 'Name a TV game show or quiz show', 'Game shows', `
    Who Wants to Be a Millionaire?|Who Wants to Be a Millionaire;Millionaire
    The Chase|Chase
    Countdown
    Pointless
    Wheel of Fortune
    Jeopardy!|Jeopardy
    Family Fortunes|Family Feud
    Deal or No Deal
    University Challenge
    Mastermind
    The Price Is Right|Price Is Right
    Blankety Blank|Match Game
    Catchphrase
    Blockbusters
    The Weakest Link|Weakest Link
    Tipping Point
    Eggheads
    Only Connect
    Bullseye
    Supermarket Sweep
    The Crystal Maze|Crystal Maze
    Gladiators
    Total Wipeout|Wipeout
    Takeshi's Castle
    Fifteen to One|15 to 1
    Golden Balls
    The Cube
    Tenable
    Richard Osman's House of Games|House of Games
    The 1% Club|1% Club
    The Wall
    Taskmaster
    Celebrity Squares|Hollywood Squares
    Generation Game|The Generation Game
    3-2-1|3 2 1
    Play Your Cards Right|Card Sharks
    Strike It Lucky
    Going for Gold
    Big Break
    Telly Addicts
    The Krypton Factor|Krypton Factor
    Treasure Hunt
    Fort Boyard
    Interceptor
    Win, Lose or Draw
    Sale of the Century
    Bob's Full House
    Mr and Mrs
    Through the Keyhole
    Can't Cook, Won't Cook
    The Million Pound Drop|Million Pound Drop
    Who Dares Wins
    Impossible
    Lingo
    The Floor
    Beat the Chasers
    Michael McIntyre's The Wheel|The Wheel
    In for a Penny
    Bridge of Lies
    The Link
    Bargain Hunt
    Dog Eat Dog
    Shafted
    The Enemy Within
    Jet Set
    Hole in the Wall
    Minute to Win It
    Fear Factor
    Survivor
    Name That Tune
    Pyramid|The $100,000 Pyramid
    Press Your Luck
    The Newlywed Game|Newlywed Game
    The Dating Game|Blind Date
  `),
  ranked('christmas-film', 'screen', 'Name a Christmas film', 'Christmas films', `
    Home Alone
    Elf
    Love Actually
    It's a Wonderful Life
    The Polar Express|Polar Express
    Die Hard
    The Grinch|How the Grinch Stole Christmas
    A Christmas Carol|Scrooge
    The Muppet Christmas Carol|Muppet Christmas Carol
    Miracle on 34th Street
    The Holiday
    Home Alone 2|Home Alone 2: Lost in New York
    The Snowman|Snowman
    Arthur Christmas
    Nativity!|Nativity
    Klaus
    Jingle All the Way
    National Lampoon's Christmas Vacation|Christmas Vacation
    The Santa Clause|Santa Clause
    Bad Santa
    The Nightmare Before Christmas|Nightmare Before Christmas
    White Christmas
    Gremlins
    A Christmas Story
    Scrooged
    Fred Claus
    The Christmas Chronicles|Christmas Chronicles
    Last Christmas
    Four Christmases
    Deck the Halls
    Noelle
    Jack Frost
    Santa Claus: The Movie|Santa Claus the Movie
    Holiday Inn
    The Bishop's Wife
    Christmas with the Kranks
    Surviving Christmas
    The Family Stone
    Krampus
    Office Christmas Party
    Daddy's Home 2
    A Bad Moms Christmas
    Get Santa
    The Night Before
    Happiest Season
    Spirited
    Violent Night
    Red One
    The Man Who Invented Christmas
    The Princess Switch
    A Christmas Prince
    The Snowman and the Snowdog
    Father Christmas
    Stick Man
    Mickey's Christmas Carol
    Prep & Landing
    Rudolph the Red-Nosed Reindeer|Rudolph
    Frosty the Snowman
    A Charlie Brown Christmas|Charlie Brown Christmas
    Joyeux Noël|Joyeux Noel
    Tokyo Godfathers
    Edward Scissorhands
    Batman Returns
    Trading Places
    Eyes Wide Shut
    Kiss Kiss Bang Bang
    The Lion in Winter
    Little Women
  `),
  // ── Music ──────────────────────────────────────────────────────────────────
  ranked('queen-song', 'music', 'Name a song by Queen', 'Queen songs', `
    Bohemian Rhapsody
    We Will Rock You
    We Are the Champions
    Don't Stop Me Now
    Another One Bites the Dust
    Radio Ga Ga|Radio Gaga
    I Want to Break Free
    Under Pressure
    Killer Queen
    Somebody to Love
    Crazy Little Thing Called Love
    Fat Bottomed Girls
    Bicycle Race
    Who Wants to Live Forever
    The Show Must Go On|Show Must Go On
    A Kind of Magic|Kind of Magic
    You're My Best Friend
    Seven Seas of Rhye
    I Want It All
    Flash|Flash's Theme
    Love of My Life
    Innuendo
    These Are the Days of Our Lives
    Hammer to Fall
    One Vision
    Friends Will Be Friends
    It's a Hard Life
    Princes of the Universe
    Now I'm Here
    Tie Your Mother Down
    Spread Your Wings
    Good Old-Fashioned Lover Boy
    '39
    Save Me
    Play the Game
    Breakthru
    The Miracle
    Headlong
    I'm Going Slightly Mad
    Too Much Love Will Kill You
    Heaven for Everyone
    A Winter's Tale
    Let Me Live
    You Don't Fool Me
    Thank God It's Christmas
    Keep Yourself Alive
    Liar
    Stone Cold Crazy
    Brighton Rock
    Body Language
    Las Palabras de Amor
    Back Chat
    Scandal
    Mustapha
    Death on Two Legs
    Bring Back That Leroy Brown
    Lazing on a Sunday Afternoon
    Ogre Battle
    The Prophet's Song
    Sleeping on the Sidewalk
    Dreamer's Ball
    Jealousy
    It's Late
    Calling All Girls
    Need Your Loving Tonight
    Dragon Attack
    Staying Power
    Was It All Worth It
    Rain Must Fall
    Mother Love
    No-One but You|No One but You
  `),
  ranked('christmas-song', 'music', 'Name a Christmas song or carol', 'Christmas songs and carols', `
    Jingle Bells
    Last Christmas
    All I Want for Christmas Is You
    Silent Night
    Fairytale of New York
    Rudolph the Red-Nosed Reindeer|Rudolph
    White Christmas
    Merry Xmas Everybody
    Do They Know It's Christmas?|Do They Know It's Christmas
    Santa Claus Is Comin' to Town|Santa Claus Is Coming to Town
    Let It Snow!|Let It Snow
    Frosty the Snowman
    Deck the Halls
    O Come, All Ye Faithful|O Come All Ye Faithful;Adeste Fideles
    Away in a Manger
    Hark! The Herald Angels Sing|Hark the Herald Angels Sing
    We Wish You a Merry Christmas
    Joy to the World
    Little Drummer Boy|The Little Drummer Boy
    Driving Home for Christmas
    Step into Christmas
    I Wish It Could Be Christmas Everyday|I Wish It Could Be Christmas Every Day
    Merry Christmas Everyone
    Wonderful Christmastime
    Happy Xmas (War Is Over)|Happy Xmas;War Is Over
    Mistletoe and Wine
    Stop the Cavalry
    Walking in the Air
    Jingle Bell Rock
    Rockin' Around the Christmas Tree|Rocking Around the Christmas Tree
    Feliz Navidad
    It's Beginning to Look a Lot Like Christmas
    Have Yourself a Merry Little Christmas
    The Christmas Song|Chestnuts Roasting on an Open Fire
    Winter Wonderland
    Sleigh Ride
    Santa Baby
    Baby, It's Cold Outside|Baby It's Cold Outside
    Blue Christmas
    Christmas (Baby Please Come Home)
    Underneath the Tree
    Mistletoe
    Santa Tell Me
    One More Sleep
    Lonely This Christmas
    Merry Christmas
    Christmas Lights
    2000 Miles
    Thank God It's Christmas
    Saviour's Day
    When a Child Is Born
    Mary's Boy Child
    Stay Another Day
    O Holy Night
    O Little Town of Bethlehem
    The First Noel|The First Nowell
    Good King Wenceslas
    God Rest Ye Merry, Gentlemen|God Rest Ye Merry Gentlemen
    In the Bleak Midwinter
    Once in Royal David's City
    While Shepherds Watched Their Flocks|While Shepherds Watched
    The Holly and the Ivy
    We Three Kings
    It Came Upon the Midnight Clear
    Ding Dong Merrily on High
    O Christmas Tree|O Tannenbaum
    The Twelve Days of Christmas|Twelve Days of Christmas
    Angels from the Realms of Glory
    Silver Bells
    I Saw Mommy Kissing Santa Claus
    Here Comes Santa Claus
    Do You Hear What I Hear?
    Carol of the Bells
    Coventry Carol
    In Dulci Jubilo
    Gaudete
    Personent Hodie
    Tomorrow Shall Be My Dancing Day
  `),
  // ── Arts ───────────────────────────────────────────────────────────────────
  ranked('shakespeare-character', 'arts', 'Name a Shakespeare character', 'Shakespeare characters', `
    Hamlet
    Romeo
    Juliet
    Macbeth
    Lady Macbeth
    Othello
    King Lear|Lear
    Ophelia
    Iago
    Puck|Robin Goodfellow
    Shylock
    Falstaff|Sir John Falstaff
    Julius Caesar|Caesar
    Cleopatra
    Prospero
    Desdemona
    Mercutio
    Tybalt
    Brutus
    Mark Antony|Antony
    Portia
    Bottom|Nick Bottom
    Oberon
    Titania
    Caliban
    Ariel
    Miranda
    Banquo
    Macduff
    Polonius
    Gertrude
    Claudius
    Horatio
    Laertes
    Yorick
    Rosencrantz
    Guildenstern
    Cordelia
    Goneril
    Regan
    Richard III
    Henry V|Prince Hal;Hal
    Viola
    Malvolio
    Olivia
    Orsino
    Beatrice
    Benedick
    Rosalind
    Orlando
    Petruchio
    Katherina|Kate;Katharina
    Bianca
    Benvolio
    Friar Laurence|Friar Lawrence
    Lysander
    Hermia
    Helena
    Demetrius
    Cassius
    Antonio
    Bassanio
    Jessica
    Cassio
    Emilia
    Duncan
    Malcolm
    Fleance
    Edmund
    Edgar
    Gloucester
    Kent
    The Fool|Fool
    Touchstone
    Jaques
    Feste
    Sir Toby Belch|Toby Belch
    Sir Andrew Aguecheek|Andrew Aguecheek
    Hotspur|Harry Percy
    Dogberry
    Mistress Quickly
    Bardolph
    Pistol
    Fortinbras
    Coriolanus
    Titus Andronicus|Titus
    Lavinia
    Tamora
    Aaron
    Timon
    Pericles
    Imogen|Innogen
    Cymbeline
    Leontes
    Hermione
    Perdita
    Autolycus
    Troilus
    Cressida
    Pandarus
    Theseus
    Hippolyta
    Egeus
    Ferdinand
    Sebastian
    Trinculo
    Stephano
    Gonzalo
    Octavius|Octavius Caesar
    Enobarbus
    Charmian
    Lady Anne
    Richard II
    Bolingbroke|Henry IV
    Henry VI
    Henry VIII
    Cardinal Wolsey|Wolsey
    Katherine of Aragon
    Joan la Pucelle|Joan of Arc
    Moth
    Costard
    Holofernes
    Launce
    Proteus
    Valentine
    Silvia
    Julia
    Isabella
    Angelo
    Mariana
    Lucio
    Parolles
    Bertram
    Paulina
    Antigonus
  `),
];
