import type { PromptSeed } from '@/lib/types';
import { ranked } from '../atlas';

/**
 * Thursday 29 October 2026, prompts set by hand. Ordered from the answer most people give to the most unheard-of;
 * generous on purpose, rarity scoring does the work. Clackmannanshire is the only top answer for the county prompt.
 *
 * Rules each list follows (`rejecting` lists wrong answers that a typo would otherwise let in):
 *  - MCU hero: any hero (or anti-hero who leads a film or series) in a Marvel Studios film or series, up to
 *    Spider-Man: Brand New Day (2026). Unreleased films (Avengers: Doomsday) are not counted.
 *  - Pressurised: something sold in a container that holds its contents above atmospheric pressure (aerosols,
 *    fizzy drinks, gas cylinders, pressurised cans).
 *  - National holiday: a public holiday observed nationwide in at least one sovereign country.
 *  - One neighbour: a sovereign country with exactly one land neighbour (Wikipedia, "List of countries and
 *    territories by number of land borders", with the usual reading that causeways and overseas-territory
 *    enclaves do not count). Canada, Denmark and the UK are accepted although Hans Island (2022), Gibraltar
 *    and the Cyprus bases technically give them a second neighbour.
 *  - County: ceremonial and historic counties of England, preserved and historic counties of Wales, historic
 *    counties of Scotland and the six counties of Northern Ireland.
 *  - Currency: legal tender in at least one country or territory today (Bulgaria joined the euro on 1 Jan 2026,
 *    so the lev is not accepted; the Croatian kuna and Netherlands Antillean guilder are gone as well).
 */
const day = (seed: PromptSeed): PromptSeed => ({ ...seed, editorial: true });

/** Keeps `ranked` from giving a second answer the 100-point Obscure tier: only the last answer stays at the top. */
const soleTop = (seed: PromptSeed): PromptSeed => ({
  ...seed,
  answers: seed.answers.map((a, i) => {
    if (i === seed.answers.length - 1) return a;
    const [name, score, aliases] = a.split('|');
    return Number(score) >= 92 ? [name, '91', aliases].filter((x) => x !== undefined).join('|') : a;
  }),
});

/** Names wrong answers the typo allowance would otherwise take for a real one ("Iceland" for Ireland). */
const rejecting = (rejects: string[], seed: PromptSeed): PromptSeed => ({ ...seed, rejects });

export const DAY_2026_10_29: PromptSeed[] = [
  day(ranked('mcu-hero', 'screen', 'Name a hero from the MCU', 'MCU heroes', `
    Iron Man|Tony Stark;Ironman
    Spider-Man|Peter Parker;Spiderman
    Captain America|Steve Rogers;Cap
    Thor|Thor Odinson
    Hulk|Bruce Banner;The Hulk
    Black Widow|Natasha Romanoff;Natasha;Nat
    Black Panther|T'Challa;Tchalla
    Hawkeye|Clint Barton
    Doctor Strange|Stephen Strange;Dr Strange;Dr Stephen Strange
    Captain Marvel|Carol Danvers
    Ant-Man|Scott Lang;Antman
    Scarlet Witch|Wanda Maximoff;Wanda
    Star-Lord|Peter Quill;Starlord
    Groot
    Rocket|Rocket Raccoon
    Gamora
    Drax|Drax the Destroyer
    Falcon|Sam Wilson
    Winter Soldier|Bucky Barnes;Bucky;James Barnes;White Wolf
    War Machine|Rhodey;James Rhodes;Iron Patriot
    Vision
    Wasp|Hope van Dyne;Hope Pym
    Nick Fury|Fury;Samuel Fury
    Loki|Loki Laufeyson
    Deadpool|Wade Wilson
    Wolverine|Logan;James Howlett
    Shang-Chi|Shaun
    Moon Knight|Marc Spector;Steven Grant
    Ms. Marvel|Kamala Khan;Ms Marvel;Kamala
    She-Hulk|Jennifer Walters;Jen Walters;Jennifer
    Daredevil|Matt Murdock;Matthew Murdock
    Mantis
    Nebula
    Valkyrie
    Okoye
    Shuri
    Wong
    Peggy Carter|Agent Carter;Margaret Carter
    Mister Fantastic|Reed Richards;Mr Fantastic
    Invisible Woman|Sue Storm;Susan Storm
    Human Torch|Johnny Storm
    The Thing|Ben Grimm;Thing
    Yelena Belova|Yelena
    Red Guardian|Alexei Shostakov
    Ghost|Ava Starr
    U.S. Agent|John Walker;US Agent
    Kate Bishop
    Echo|Maya Lopez
    Ironheart|Riri Williams
    Quicksilver|Pietro Maximoff
    Maria Hill
    M'Baku|Mbaku;Jabari
    Korg
    Heimdall
    Sif
    Jane Foster|Mighty Thor;Lady Thor
    Pepper Potts|Rescue
    Phil Coulson|Coulson;Agent Coulson
    Punisher|Frank Castle
    Jessica Jones
    Luke Cage|Power Man
    Iron Fist|Danny Rand
    Monica Rambeau|Photon;Spectrum
    Cassie Lang|Stature
    America Chavez|Miss America
    Hank Pym|Henry Pym
    Janet van Dyne|Original Wasp
    Joaquin Torres
    Isaiah Bradley
    Ayo
    Nakia
    Yondu|Yondu Udonta
    Kraglin
    Adam Warlock
    Sersi
    Ikaris
    Thena
    Makkari
    Phastos
    Kingo
    Gilgamesh
    Druig
    Ajak
    Sprite
    Wiccan|Billy Maximoff;Billy Kaplan
    Speed|Tommy Maximoff
    Professor X|Charles Xavier
    Clea
    Hercules
    Blade|Eric Brooks
    Mobius|Mobius M. Mobius
    Sylvie
    Layla El-Faouly|Scarlet Scarab
    Cosmo|Cosmo the Spacedog
  `)),
  day(soleTop(ranked('pressurised-product', 'general', 'Name something you buy in a pressurised container (e.g. soda)', 'Pressurised packaging', `
    Soda|fizzy drink;pop;soft drink;fizzy pop;fizzy drinks
    Cola|coke;coca cola;pepsi;diet coke
    Sparkling water|fizzy water;soda water;club soda;seltzer
    Beer|lager;bottled beer;canned beer
    Deodorant|antiperspirant;spray deodorant;body spray
    Hairspray|hair spray
    Whipped cream|squirty cream;aerosol cream;reddi-wip;canned cream
    Shaving foam|shaving gel;shaving cream
    Champagne|bubbly
    Spray paint|aerosol paint;graffiti paint
    Air freshener|room spray;febreze
    Lemonade|fizzy lemonade
    Prosecco
    Sparkling wine|cava;cremant;sekt
    Cider
    Energy drink|red bull;monster
    Tonic water|indian tonic
    Ginger beer
    Ginger ale
    Root beer
    Cream soda
    Cooking spray|pan spray;oil spray
    Dry shampoo
    Hair mousse|styling mousse;hair foam
    Fly spray|insect spray;bug spray;raid
    Insect repellent spray|mosquito spray
    WD-40|wd40;lubricant spray
    Fire extinguisher
    Asthma inhaler|inhaler;ventolin;puffer
    Camping gas|gas canister;butane canister;gas cartridge
    Propane tank|propane cylinder;bbq gas;patio gas;calor gas
    Lighter|butane lighter;bic lighter;gas lighter
    Compressed air|canned air;air duster;dust remover
    Aerosol sunscreen|spray sunscreen;sun spray;suncream spray
    Oven cleaner|oven spray
    Furniture polish|pledge
    Kombucha
    Hard seltzer|white claw
    Alcopop|wkd;smirnoff ice
    Sparkling juice|sparkling apple juice;appletiser
    Tyre sealant|tyre inflator;fix a flat;puncture repair spray
    Expanding foam|spray foam;insulation foam;great stuff;gap filler foam
    Spray adhesive|spray glue
    Spray starch|ironing spray
    Anti-bacterial spray|disinfectant spray;dettol spray;lysol
    Carpet cleaner foam|upholstery foam
    Bathroom foam cleaner|mousse cleaner
    Aerosol butter|spray butter
    Spray cheese|easy cheese;cheese in a can
    Silly String|party string
    Fake snow spray|snow spray;artificial snow
    Air horn|boat horn;marine horn
    Windscreen de-icer|de-icer;deicer;screen de-icer
    Lock de-icer
    Starter fluid|engine starter spray
    Brake cleaner
    Spray lubricant|chain spray;bike lube spray
    Fake tan spray|spray tan;tanning mist
    Nitro cold brew|nitro coffee;nitro
    Guinness|stout;draught stout;widget can
    Sparkling mineral water|perrier;san pellegrino;badoit
    Fanta|sprite;7up;orange soda;lemon lime soda
    Confetti cannon|streamer cannon;party cannon
    Soda syphon|soda siphon;seltzer bottle;sparkling water syphon
    Sodastream CO2 cylinder|sodastream gas;co2 canister;soda maker gas
    Beer keg|party keg;mini keg;barrel keg
    Helium canister|balloon helium;party helium
    CO2 cartridge|bike inflator;tyre inflator cartridge;airgun cartridge
    Paintball CO2 tank|paintball gas
    Blowtorch gas|cooking torch gas;butane torch
    Pepper spray|self defence spray;mace
    Bear spray
    Spray bandage|new skin;liquid bandage spray
    Cream chargers|whipped cream chargers;nitrous oxide chargers;whippits
    Cold spray|ice spray;freeze spray;sports spray
    Muscle spray|pain relief spray;deep heat spray
    Boost Oxygen|canned oxygen;oxygen can;portable oxygen
    Tennis balls|tennis ball can;tennis ball tube;pressurised tennis balls
  `))),
  day(ranked('national-holiday', 'general', 'Name a national holiday', 'National holidays', `
    Christmas Day|Christmas;Xmas;Christmas holiday
    New Year's Day|New Year;New Years Day;New Year Day;1 January
    Independence Day|4th of July;Fourth of July;July 4th;July 4
    Easter Sunday|Easter
    Thanksgiving|Thanksgiving Day
    Boxing Day
    Good Friday
    Easter Monday
    Labour Day|Labor Day;May Day;International Workers' Day;Workers' Day
    Bank Holiday|Bank holiday Monday;Early May bank holiday;Spring bank holiday;Summer bank holiday;August bank holiday
    Martin Luther King Jr. Day|MLK Day;Martin Luther King Day;Martin Luther King Jr Day
    Memorial Day
    Veterans Day
    Presidents' Day|Presidents Day;Washington's Birthday
    Juneteenth
    Columbus Day
    Canada Day|Dominion Day
    Remembrance Day|Armistice Day
    Bastille Day|14 July;French National Day
    Australia Day
    Anzac Day|ANZAC Day
    Waitangi Day
    St Patrick's Day|Saint Patricks Day;Paddys Day;St Paddy's Day
    St Andrew's Day|Saint Andrews Day
    Christmas Eve
    Diwali|Deepavali;Festival of Lights
    Chinese New Year|Lunar New Year;Spring Festival
    Eid al-Fitr|Eid;Eid ul-Fitr;Eid al Fitr
    Eid al-Adha|Eid ul-Adha;Bakrid;Bakri Eid
    Holi
    Victoria Day
    Ascension Day
    Whit Monday|Pentecost Monday
    Pentecost|Whit Sunday;Whitsun
    Corpus Christi
    Epiphany|Three Kings' Day;Three Kings Day
    Assumption Day|Feast of the Assumption;Ferragosto
    All Saints' Day|All Saints Day;Toussaint
    All Souls' Day|Day of the Dead;Dia de los Muertos
    Immaculate Conception
    St Stephen's Day|Saint Stephen's Day
    Maundy Thursday|Holy Thursday
    Holy Saturday|Easter Saturday
    Orthodox Christmas|Russian Christmas;Eastern Orthodox Christmas
    Orthodox Easter
    Republic Day
    National Day
    Constitution Day
    Victory Day
    Liberation Day
    Unity Day
    Flag Day
    Heroes' Day|National Heroes Day;Heroes Day
    Emancipation Day
    Youth Day
    Women's Day|International Women's Day
    Children's Day
    German Unity Day|Day of German Unity;Tag der Deutschen Einheit
    King's Birthday|Queen's Birthday;Kings Birthday;Queens Birthday
    King's Day|Koningsdag;Kings Day
    Swiss National Day|1 August;Swiss National Holiday
    Syttende Mai|17th of May;Norwegian Constitution Day;Constitution Day Norway
    Midsummer|Midsummer Day;Midsommar;Juhannus
    Oxi Day|Ohi Day;Ochi Day
    Gandhi Jayanti|Gandhi's Birthday
    Dussehra|Dasara;Vijayadashami
    Janmashtami|Krishna Janmashtami
    Ram Navami
    Guru Nanak Jayanti|Guru Nanak's Birthday;Gurpurab
    Mahavir Jayanti|Mahavir Janma Kalyanak
    Vesak|Wesak;Buddha Day;Buddha Purnima;Buddha's Birthday
    Songkran|Thai New Year
    Nowruz|Persian New Year;Norooz;Nowrouz
    Rosh Hashanah|Jewish New Year
    Yom Kippur|Day of Atonement
    Passover|Pesach
    Sukkot
    Shavuot
    Mawlid|Mawlid al-Nabi;Prophet's Birthday;Milad un Nabi
    Ashura
    Islamic New Year|Hijri New Year;Muharram;Al Hijra
    Day of Arafah|Arafat Day
    Isra and Mi'raj|Isra Mi'raj;Isra Miraj
    Mid-Autumn Festival|Moon Festival;Mooncake Festival
    Dragon Boat Festival|Duanwu
    Qingming|Tomb-Sweeping Day;Qingming Festival;Ching Ming
    Chuseok|Korean Thanksgiving
    Seollal|Korean New Year
    Hangul Day
    Tet|Tết;Vietnamese New Year
    Reformation Day
    St George's Day|Saint Georges Day
    Matariki
    Madaraka Day
    Jamhuri Day
    Freedom Day
    Heritage Day
    Human Rights Day
    Day of Reconciliation
    National Day for Truth and Reconciliation|Orange Shirt Day
    Defender of the Fatherland Day
    Russia Day
    Mashujaa Day
    Coming of Age Day
    Respect for the Aged Day
    Culture Day
    Showa Day
    Greenery Day
    Marine Day
    Mountain Day
    Vernal Equinox Day
    Autumnal Equinox Day
    National Foundation Day
    Emperor's Birthday
    Nyepi|Day of Silence
    Khmer New Year|Choul Chnam Thmey
    Thingyan|Burmese New Year
    Simchat Torah
    Pakistan Day|Pakistan Resolution Day
    Hung Kings' Festival|Hung Kings Festival
    Pchum Ben
  `)),
  day(rejecting(['Iceland', 'Zambia', 'North Korea'], ranked('one-border-country', 'geography', 'Name a country that borders only one other country', 'Countries with one land neighbour', `
    Canada
    Portugal
    Ireland
    South Korea|Korea;Republic of Korea
    Denmark
    United Kingdom|UK;Britain;Great Britain
    Monaco
    Vatican City|Vatican;Holy See
    San Marino
    Qatar
    Lesotho
    Haiti
    Dominican Republic
    Gambia|The Gambia
    Brunei
    Papua New Guinea|PNG
    Timor-Leste|East Timor
  `))),
  day(rejecting(['Scotland'], soleTop(ranked('uk-county', 'geography', 'Name a county within the United Kingdom', 'UK counties', `
    Yorkshire
    Kent
    Cornwall
    Devon
    Essex
    Surrey
    Lancashire|Lancs
    Norfolk
    Sussex
    Suffolk
    Cumbria
    Somerset
    Dorset
    Hampshire|Hants
    Oxfordshire|Oxon
    Cambridgeshire|Cambs
    Derbyshire
    Lincolnshire|Lincs
    Northumberland
    Cheshire
    Gloucestershire|Glos
    Wiltshire|Wilts
    Berkshire|Berks
    Buckinghamshire|Bucks
    Hertfordshire|Herts
    Bedfordshire|Beds
    Staffordshire|Staffs
    Shropshire|Salop
    Worcestershire|Worcs
    Warwickshire|Warks
    Herefordshire
    Leicestershire|Leics
    Nottinghamshire|Notts
    Northamptonshire|Northants
    Rutland
    County Durham|Durham
    Greater London|London
    Greater Manchester
    Merseyside
    West Midlands
    Tyne and Wear|Tyne & Wear
    South Yorkshire
    West Yorkshire
    North Yorkshire
    East Sussex
    West Sussex
    Isle of Wight
    Middlesex
    Antrim|County Antrim;Co Antrim
    Down|County Down;Co Down
    Armagh|County Armagh;Co Armagh
    Tyrone|County Tyrone;Co Tyrone
    Fermanagh|County Fermanagh;Co Fermanagh
    Londonderry|Derry;County Londonderry;County Derry;Derry Londonderry
    Fife
    Aberdeenshire
    Argyll|Argyllshire
    Ayrshire
    Lanarkshire
    Perthshire
    Midlothian|Edinburghshire
    East Lothian|Haddingtonshire
    West Lothian|Linlithgowshire
    Stirlingshire
    Inverness-shire
    Dunbartonshire|Dumbartonshire
    Renfrewshire
    Angus|Forfarshire
    Moray|Elginshire
    Caithness
    Sutherland
    Orkney
    Shetland|Zetland
    Pembrokeshire
    Anglesey|Isle of Anglesey;Ynys Mon
    Carmarthenshire
    Glamorgan
    Gwent
    Gwynedd
    Powys
    Monmouthshire
    Ceredigion|Cardiganshire
    Denbighshire
    Flintshire
    Breconshire|Brecknockshire;Brecon
    Montgomeryshire
    Radnorshire
    Merionethshire|Merioneth;Meirionnydd
    Caernarfonshire|Carnarvonshire;Caernarvonshire
    Clwyd
    Dyfed
    Mid Glamorgan
    South Glamorgan
    West Glamorgan
    Bristol
    City of London
    East Riding of Yorkshire|East Riding;East Yorkshire
    Cumberland
    Westmorland
    Huntingdonshire|Hunts
    Dumfriesshire
    Ross-shire|Ross and Cromarty;Ross
    Banffshire
    Berwickshire
    Roxburghshire
    Selkirkshire
    Peeblesshire
    Wigtownshire
    Kirkcudbrightshire
    Bute|Buteshire
    Nairnshire
    Kincardineshire
    Kinross-shire|Kinross
    Cromartyshire|Cromarty
    Clackmannanshire|Clackmannan;Clacks
  `)))),
  day(ranked('streaming-service', 'screen', 'Name an online streaming service (e.g. Netflix)', 'Streaming services', `
    Netflix
    YouTube
    Amazon Prime Video|Prime Video;Amazon Prime;Prime
    Disney+|Disney Plus;Disney
    Spotify
    BBC iPlayer|iPlayer
    Hulu
    HBO Max|Max;HBO
    Apple TV+|Apple TV;Apple TV Plus
    Paramount+|Paramount Plus
    Peacock
    ITVX|ITV Hub;ITV Player
    Twitch
    Apple Music
    Channel 4|All 4;4oD
    NOW|Now TV;NOW Entertainment
    Sky Go
    Amazon Music|Prime Music
    YouTube Music
    Tidal
    Deezer
    SoundCloud
    Pandora
    Tubi
    Pluto TV
    Crunchyroll
    DAZN
    Discovery+|Discovery Plus
    My5|Channel 5;5 Player
    BritBox|Brit Box
    Roku Channel|The Roku Channel
    YouTube TV
    Sling TV
    Fubo|FuboTV
    Philo
    ESPN|ESPN+;ESPN Plus
    Starz
    AMC+|AMC Plus
    Shudder
    Mubi
    Criterion Channel|The Criterion Channel
    Kanopy
    Plex
    Vudu|Fandango at Home
    Rakuten TV
    Viki|Rakuten Viki
    Kick
    Vimeo
    Dailymotion
    Rumble
    Vevo
    iHeartRadio|iHeart
    TuneIn
    Napster
    Qobuz
    Mixcloud
    Audiomack
    JioHotstar|Hotstar;Disney+ Hotstar;JioCinema
    ZEE5|Zee5
    SonyLIV|Sony Liv
    MX Player
    Crave
    Stan
    Binge
    Neon
    ThreeNow
    TVNZ+|TVNZ OnDemand
    iQIYI|iQiyi;Aiqiyi
    Youku
    Tencent Video|Tencent
    WeTV
    GeForce Now|Nvidia GeForce Now
    Xbox Cloud Gaming|xCloud;Project xCloud
    Amazon Luna|Luna
    Anghami
    JioSaavn|Saavn
    Boomplay
    Shahid|MBC Shahid
    Bilibili
    Viu
    Canal+|Canal Plus;MyCanal
    Joyn
    RTL+|RTL Plus;TVNOW
    RaiPlay
    Mediaset Infinity
    Movistar+|Movistar Plus
    ATRESplayer|Atresplayer
    RTVE Play
    NPO Start|NPO
    Videoland
    Viaplay
    SVT Play
    NRK TV
    DR TV
    Yle Areena|Areena
    RTÉ Player|RTE Player
    Virgin Media Player
    STV Player
    S4C Clic|S4C
    Hayu
    Sky Showtime|SkyShowtime
    Acorn TV
    CuriosityStream|Curiosity Stream
    Dropout
    Nebula
    Floatplane
  `)),
  day(ranked('current-currency', 'general', 'Name a currency still in use today', 'Currencies in use', `
    US dollar|dollar;united states dollar;american dollar;usd;dollars
    Euro|eur;euros
    Pound sterling|pound;sterling;british pound;gbp;pounds
    Japanese yen|yen;jpy
    Chinese yuan|yuan;renminbi;rmb;cny
    Swiss franc|franc;chf;francs
    Canadian dollar|cad;loonie
    Australian dollar|aud
    Indian rupee|rupee;inr;rupees
    Mexican peso|peso;pesos
    Russian rouble|rouble;ruble;russian ruble
    South African rand|rand;zar
    Brazilian real|real;reais
    Swedish krona
    Norwegian krone
    Danish krone
    South Korean won|won;korean won;krw
    Turkish lira|lira
    New Zealand dollar|nzd;kiwi dollar
    Hong Kong dollar|hkd
    Singapore dollar|sgd
    Thai baht|baht;thb
    Polish zloty|zloty;złoty
    Czech koruna|koruna
    Hungarian forint|forint
    Israeli shekel|new israeli shekel;shekel;new shekel
    UAE dirham|emirati dirham;united arab emirates dirham;aed
    Saudi riyal|saudi rial;sar
    Egyptian pound
    Nigerian naira|naira;ngn
    Kenyan shilling
    Argentine peso
    Chilean peso
    Colombian peso
    Peruvian sol|sol;nuevo sol
    Philippine peso
    Indonesian rupiah|rupiah
    Malaysian ringgit|ringgit
    Vietnamese dong|dong;đồng
    Pakistani rupee
    Bangladeshi taka|taka
    Sri Lankan rupee
    Nepalese rupee|nepali rupee
    Ukrainian hryvnia|hryvnia
    Romanian leu|leu
    Icelandic krona|icelandic króna
    Moroccan dirham|dirham
    Qatari riyal|qatari rial
    Kuwaiti dinar
    Bahraini dinar
    Omani rial|omani riyal
    Jordanian dinar
    Iraqi dinar
    Iranian rial|iranian riyal
    Serbian dinar
    Algerian dinar
    Tunisian dinar
    Libyan dinar
    Dinar
    Riyal|rial
    Shilling
    Krone|krona;kroner;kronor
    Ghanaian cedi|cedi
    Ethiopian birr|birr
    Tanzanian shilling
    Ugandan shilling
    Rwandan franc
    Botswana pula|pula
    Zambian kwacha|kwacha
    Malawian kwacha
    Angolan kwanza|kwanza
    Mozambican metical|metical
    Namibian dollar
    Mauritian rupee
    Seychellois rupee
    Malagasy ariary|ariary
    West African CFA franc|cfa franc;xof;cfa
    Central African CFA franc|xaf
    Congolese franc
    Burundian franc
    Djiboutian franc
    Guinean franc
    Comorian franc
    CFP franc|pacific franc;cfp;xpf
    Gambian dalasi|dalasi
    Sierra Leonean leone|leone
    Liberian dollar
    Somali shilling
    Eritrean nakfa|nakfa
    Sudanese pound
    South Sudanese pound
    Syrian pound
    Lebanese pound|lebanese lira
    Yemeni rial
    Afghan afghani|afghani
    Armenian dram|dram
    Georgian lari|lari
    Azerbaijani manat|manat
    Turkmenistani manat
    Kazakhstani tenge|tenge
    Uzbekistani som|uzbek som;uzbekistani sum;sum;som
    Kyrgyzstani som|kyrgyz som
    Tajikistani somoni|somoni
    Mongolian tugrik|tugrik;tögrög;togrog
    Belarusian rouble|belarusian ruble
    Moldovan leu
    Albanian lek|lek
    Macedonian denar|denar;north macedonian denar
    Bosnia and Herzegovina convertible mark|convertible mark;bosnian mark
    Cambodian riel|riel
    Lao kip|kip;laotian kip
    Burmese kyat|kyat;myanmar kyat
    Bhutanese ngultrum|ngultrum
    Maldivian rufiyaa|rufiyaa
    Brunei dollar
    New Taiwan dollar|taiwan dollar
    North Korean won
    Macanese pataca|pataca
    Fijian dollar
    Papua New Guinean kina|kina
    Solomon Islands dollar
    Vanuatu vatu|vatu
    Samoan tala|tala;tālā
    Tongan paʻanga|paanga;pa'anga;tongan pa'anga
    Guatemalan quetzal|quetzal
    Honduran lempira|lempira
    Nicaraguan cordoba|cordoba;córdoba;nicaraguan córdoba
    Costa Rican colon|colon;colón
    Panamanian balboa|balboa
    Belize dollar
    Cuban peso
    Dominican peso
    Haitian gourde|gourde
    Jamaican dollar
    Bahamian dollar
    Barbadian dollar
    Trinidad and Tobago dollar
    Eastern Caribbean dollar|ec dollar
    Cayman Islands dollar
    Bermudian dollar
    Aruban florin|florin
    Caribbean guilder|guilder
    Venezuelan bolivar|bolívar;bolivar;venezuelan bolívar
    Uruguayan peso
    Paraguayan guarani|guarani;guaraní
    Bolivian boliviano|boliviano
    Guyanese dollar
    Surinamese dollar
    Lesotho loti|loti
    Swazi lilangeni|lilangeni;eswatini lilangeni
    Mauritanian ouguiya|ouguiya
    Sao Tome and Principe dobra|dobra;são tomé and príncipe dobra
    Cape Verdean escudo|escudo
    Zimbabwe Gold|zig;zimbabwean gold
    Faroese krona|faroese króna
    Jersey pound
    Guernsey pound
    Manx pound|isle of man pound
    Gibraltar pound
    Falkland Islands pound
    Saint Helena pound
    Cook Islands dollar
    Tuvaluan dollar|tuvalu dollar
    Transnistrian rouble|transnistrian ruble
    Somaliland shilling
  `)),
];
