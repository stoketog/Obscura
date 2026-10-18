import { ent } from './helpers';

const food = ent('food');
const sci = ent('science');
const evt = ent('event');
const mic = ent('microbe');
const plant = ent('plant');

/** Food and science carry no meaningful "scale"; it is fixed at 3 and hidden in feedback. */
export const FOODS = [
  food('casu-marzu', 'Casu marzu', 'cheese', 'italy,sardinia,europe,mediterranean,island', 'live-larvae,banned,fermented,sheep-milk,pungent,controversial', 3, 8, 1100, 5, 0.6, 12, {
    f: 'bug-cheese',
    aliases: ['casu martzu', 'maggot cheese', 'casu marzo', 'rotten cheese', 'sardinian maggot cheese'],
  }),
  food('milbenkase', 'Milbenkäse', 'cheese', 'germany,europe', 'cheese-mites,fermented,pungent,aged', 3, 2, 120, 5, 0.9, 6, { f: 'bug-cheese', aliases: ['milbenkase', 'mite cheese', 'milben kase'] }),
  food('mimolette', 'Mimolette', 'cheese', 'france,europe', 'cheese-mites,aged,orange,hard', 3, 8, 350, 5, 0.65, 8, { f: 'bug-cheese' }),
  food('pecorino-sardo', 'Pecorino Sardo', 'cheese', 'italy,sardinia,europe,mediterranean,island', 'sheep-milk,aged', 3, 5, 150, 5, 0.75, 6),
  food('pecorino-romano', 'Pecorino Romano', 'cheese', 'italy,europe,mediterranean', 'sheep-milk,aged,salty', 3, 40, 900, 5, 0.1, 10),
  food('roquefort', 'Roquefort', 'cheese', 'france,europe', 'sheep-milk,blue-mould,aged,pungent', 3, 60, 2500, 5, 0.1, 15),
  food('gorgonzola', 'Gorgonzola', 'cheese', 'italy,europe', 'blue-mould,aged,pungent', 3, 65, 1800, 5, 0.05, 12),
  food('limburger', 'Limburger', 'cheese', 'germany,belgium,europe', 'pungent,washed-rind', 3, 35, 900, 5, 0.2, 10),
  food('epoisses', 'Époisses', 'cheese', 'france,europe', 'pungent,washed-rind,banned-on-public-transport', 3, 12, 600, 5, 0.5, 8, { aliases: ['epoisses'] }),
  food('surstromming', 'Surströmming', 'fermented-fish', 'sweden,europe,scandinavia', 'fermented,pungent,canned,controversial', 3, 35, 1800, 5, 0.3, 12, { aliases: ['surstromming'] }),
  food('hakarl', 'Hákarl', 'fermented-fish', 'iceland,europe,scandinavia,island', 'fermented,pungent,shark,controversial', 3, 30, 1100, 5, 0.35, 10, { aliases: ['hakarl'] }),
  food('natto', 'Natto', 'fermented-food', 'japan,asia', 'fermented,pungent,sticky', 3, 70, 2500, 5, 0.1, 12),
  food('stinky-tofu', 'Stinky tofu', 'fermented-food', 'china,taiwan,asia', 'fermented,pungent,street-food', 3, 55, 1500, 5, 0.15, 10),
  food('century-egg', 'Century egg', 'preserved-food', 'china,asia', 'preserved,pungent,dark', 3, 55, 1800, 5, 0.15, 10, { aliases: ['thousand year egg', 'century eggs'] }),
  food('balut', 'Balut', 'delicacy', 'philippines,asia', 'egg,controversial,street-food', 3, 45, 1500, 5, 0.2, 10),
  food('fugu', 'Fugu', 'delicacy', 'japan,asia', 'toxic,dangerous,delicacy,raw', 3, 70, 1800, 4, 0.1, 12),
  food('durian', 'Durian', 'fruit', 'asia,tropical', 'pungent,controversial,banned-in-hotels', 3, 90, 3000, 4, 0.05, 15),
  food('haggis', 'Haggis', 'dish', 'uk,scotland,europe', 'offal,traditional,controversial', 3, 95, 3500, 4, 0, 18),
  food('vegemite', 'Vegemite', 'spread', 'australia,oceania', 'yeast,salty,controversial', 3, 90, 3000, 4, 0, 14),
  food('kimchi', 'Kimchi', 'fermented-food', 'korea,asia', 'fermented,spicy,pungent', 3, 97, 5000, 4, 0, 20),
  food('cheese', 'Cheese', 'cheese', 'global', 'fermented,dairy', 3, 100, 6000, 1, 0, 40, { cw: true }),
  food('food', 'Food', 'dish', 'global', 'edible', 3, 100, 8000, 1, 0, 50, { cw: true }),
];

export const SCIENCE = [
  sci('mpemba-effect', 'Mpemba effect', 'effect', 'physics,thermodynamics,water,tanzania', 'counterintuitive,disputed,schoolboy-discovery,freezing,unexplained', 3, 5, 900, 5, 0.75, 12, {
    f: 'thermal-curiosity',
    aliases: ['mpemba', 'mpemba paradox', 'hot water freezes faster', 'hot water freezing faster', 'mpemba effect'],
  }),
  sci('leidenfrost-effect', 'Leidenfrost effect', 'effect', 'physics,thermodynamics,water', 'counterintuitive,droplets,named-after-person,heat', 3, 15, 900, 5, 0.55, 10, { f: 'thermal-curiosity' }),
  sci('supercooling', 'Supercooling', 'effect', 'physics,thermodynamics,water', 'counterintuitive,freezing,liquid-below-freezing', 3, 25, 700, 4, 0.35, 10, { f: 'thermal-curiosity', aliases: ['supercooled water'] }),
  sci('brazil-nut-effect', 'Brazil nut effect', 'effect', 'physics,granular', 'counterintuitive,named-after-nut,separation', 3, 6, 300, 5, 0.7, 8),
  sci('coanda-effect', 'Coandă effect', 'effect', 'physics,fluid-dynamics', 'counterintuitive,named-after-person,airflow', 3, 8, 500, 5, 0.6, 9, { aliases: ['coanda effect'] }),
  sci('magnus-effect', 'Magnus effect', 'effect', 'physics,fluid-dynamics', 'named-after-person,spin,curving-balls', 3, 25, 700, 5, 0.4, 10),
  sci('casimir-effect', 'Casimir effect', 'effect', 'physics,quantum', 'quantum,named-after-person,vacuum', 3, 12, 800, 5, 0.55, 10),
  sci('doppler-effect', 'Doppler effect', 'effect', 'physics,waves', 'named-after-person,sound,pitch-shift', 3, 90, 4500, 5, 0.05, 20),
  sci('coriolis-effect', 'Coriolis effect', 'effect', 'physics,earth-science', 'named-after-person,rotation,weather', 3, 60, 3000, 5, 0.1, 18),
  sci('butterfly-effect', 'Butterfly effect', 'effect', 'math,chaos-theory', 'counterintuitive,chaos', 3, 95, 3500, 5, 0, 20),
  sci('placebo-effect', 'Placebo effect', 'effect', 'medicine,psychology', 'counterintuitive,mind-body', 3, 98, 5000, 5, 0, 25),
  sci('streisand-effect', 'Streisand effect', 'effect', 'internet,psychology', 'counterintuitive,named-after-person', 3, 80, 2500, 5, 0.05, 12),
  sci('petrichor', 'Petrichor', 'phenomenon', 'earth-science,chemistry,rain', 'smell,named-word', 3, 30, 1500, 5, 0.3, 10),
  sci('syzygy', 'Syzygy', 'phenomenon', 'astronomy', 'alignment,named-word', 3, 20, 800, 4, 0.35, 10, { cw: true }),
  sci('neutrino', 'Neutrino', 'particle', 'physics,quantum', 'elusive,tiny', 3, 55, 2500, 5, 0.15, 18),
  sci('effect', 'Effect', 'effect', 'physics', 'scientific', 3, 100, 1500, 1, 0, 30, { cw: true }),
];

/** For events: scale = era (1 ancient … 5 modern). */
export const EVENTS = [
  evt('halifax-explosion', 'Halifax Explosion', 'disaster', '20th-century,canada,north-america,atlantic,wartime,harbour', 'explosion,ship-collision,man-made-disaster,largest-non-nuclear-explosion,accidental', 5, 18, 1800, 5, 0.5, 20, {
    f: 'harbour-explosion',
    aliases: ['halifax harbour explosion', '1917 halifax explosion', 'halifax disaster', 'the halifax explosion'],
  }),
  evt('texas-city-disaster', 'Texas City disaster', 'disaster', '20th-century,usa,north-america,harbour', 'explosion,ship-explosion,man-made-disaster,accidental,fertiliser', 5, 6, 500, 5, 0.75, 10, { f: 'harbour-explosion' }),
  evt('port-chicago-disaster', 'Port Chicago disaster', 'disaster', '20th-century,usa,north-america,wartime,harbour', 'explosion,ammunition,man-made-disaster,accidental,racial-injustice', 5, 6, 500, 5, 0.75, 9, { f: 'harbour-explosion' }),
  evt('black-tom-explosion', 'Black Tom explosion', 'disaster', '20th-century,usa,north-america,wartime,harbour', 'explosion,sabotage,man-made-disaster', 5, 5, 400, 5, 0.8, 8, { f: 'harbour-explosion' }),
  evt('beirut-explosion', 'Beirut explosion', 'disaster', '21st-century,lebanon,asia,harbour', 'explosion,man-made-disaster,accidental,ammonium-nitrate,largest-non-nuclear-explosion', 5, 80, 4500, 5, 0.05, 20, { f: 'harbour-explosion', aliases: ['2020 beirut explosion', 'beirut blast'] }),
  evt('great-molasses-flood', 'Great Molasses Flood', 'disaster', '20th-century,usa,north-america,boston', 'flood,man-made-disaster,accidental,sticky', 5, 40, 3500, 5, 0.2, 14, { aliases: ['boston molasses disaster', 'molasses flood'] }),
  evt('hindenburg-disaster', 'Hindenburg disaster', 'disaster', '20th-century,usa,north-america,germany', 'fire,airship,man-made-disaster,accidental', 5, 90, 5000, 5, 0, 25, { aliases: ['hindenburg'] }),
  evt('titanic', 'Sinking of the Titanic', 'disaster', '20th-century,atlantic,uk,europe', 'ship,iceberg,man-made-disaster', 5, 100, 12000, 5, 0, 50, { aliases: ['titanic'] }),
  evt('chernobyl-disaster', 'Chernobyl disaster', 'disaster', '20th-century,ukraine,europe,soviet', 'nuclear,man-made-disaster,accidental', 5, 98, 9000, 5, 0, 40, { aliases: ['chernobyl'] }),
  evt('tunguska-event', 'Tunguska event', 'disaster', '20th-century,russia,asia,siberia', 'explosion,natural,meteor,mysterious', 5, 40, 2500, 5, 0.2, 18, { aliases: ['tunguska'] }),
  evt('krakatoa-eruption', 'Krakatoa eruption', 'disaster', '19th-century,indonesia,asia', 'eruption,natural,volcanic,loud', 4, 70, 3000, 5, 0.1, 18, { aliases: ['krakatoa', '1883 eruption of krakatoa'] }),
  evt('great-emu-war', 'Great Emu War', 'war', '20th-century,australia,oceania', 'military,absurd,birds', 5, 50, 4000, 5, 0.1, 15, { aliases: ['emu war'] }),
  evt('dancing-plague', 'Dancing plague of 1518', 'epidemic', 'early-modern,europe,france,strasbourg', 'mysterious,dancing,unexplained', 3, 40, 2000, 5, 0.2, 14, { aliases: ['dancing plague', 'dancing mania', 'dancing plague of strasbourg'] }),
  evt('year-without-a-summer', 'Year Without a Summer', 'disaster', '19th-century,global', 'volcanic,natural,famine,cold', 4, 30, 1800, 5, 0.25, 12, { aliases: ['1816 year without a summer'] }),
  evt('defenestration-of-prague', 'Defenestration of Prague', 'political', 'early-modern,czechia,europe', 'political,windows,religious-conflict', 3, 25, 1200, 5, 0.3, 12),
  evt('great-fire-of-london', 'Great Fire of London', 'disaster', 'early-modern,uk,europe', 'fire,city', 3, 95, 5000, 5, 0, 25),
  evt('disaster', 'Disaster', 'disaster', 'global', 'catastrophe', 4, 100, 2000, 1, 0, 30, { cw: true }),
  evt('explosion', 'Explosion', 'disaster', 'global', 'explosion', 4, 100, 2000, 1, 0, 30, { cw: true }),
];

export const MICROBES = [
  mic('deinococcus-radiodurans', 'Deinococcus radiodurans', 'bacterium', 'global,soil,extreme-environments', 'radiation-resistant,extremophile,polyextremophile,red-pigmented,survives-desiccation', 1, 3, 250, 5, 0.85, 12, {
    f: 'extremophile',
    aliases: ['d. radiodurans', 'd radiodurans', 'conan the bacterium', 'deinococcus', 'conan the bacteria', 'deinococcus radiodurans'],
  }),
  mic('thermus-aquaticus', 'Thermus aquaticus', 'bacterium', 'global,hot-springs,extreme-environments', 'heat-loving,extremophile,pcr-enzyme', 1, 8, 220, 5, 0.7, 9, { f: 'extremophile', aliases: ['taq', 't. aquaticus'] }),
  mic('halobacterium', 'Halobacterium', 'archaeon', 'global,salt-lakes,extreme-environments', 'salt-loving,extremophile,pink', 1, 4, 150, 4, 0.85, 7, { f: 'extremophile', aliases: ['halobacteria'] }),
  mic('e-coli', 'E. coli', 'bacterium', 'global,gut', 'common,lab-workhorse', 1, 70, 6000, 4, 0.05, 25, { aliases: ['escherichia coli', 'e coli'] }),
  mic('staphylococcus-aureus', 'Staphylococcus aureus', 'bacterium', 'global,skin', 'pathogen,antibiotic-resistant', 1, 55, 3500, 5, 0.1, 18, { aliases: ['staph', 'mrsa', 'staph aureus'] }),
  mic('cyanobacteria', 'Cyanobacteria', 'bacterium', 'global,ocean,freshwater', 'photosynthetic,oxygen-producer,ancient', 1, 30, 2000, 4, 0.2, 14, { aliases: ['blue-green algae'] }),
  mic('lactobacillus', 'Lactobacillus', 'bacterium', 'global,gut', 'fermenter,probiotic', 1, 55, 1800, 4, 0.1, 12),
  mic('helicobacter-pylori', 'Helicobacter pylori', 'bacterium', 'global,gut', 'pathogen,stomach-dweller', 1, 30, 2200, 5, 0.15, 12, { aliases: ['h. pylori', 'h pylori'] }),
  mic('amoeba', 'Amoeba', 'protist', 'global,freshwater', 'shapeshifting,single-celled', 1, 85, 2500, 3, 0.05, 15, { aliases: ['ameba'] }),
  mic('paramecium', 'Paramecium', 'protist', 'global,freshwater', 'cilia,single-celled', 1, 70, 1800, 4, 0.1, 12),
  mic('euglena', 'Euglena', 'protist', 'global,freshwater', 'photosynthetic,single-celled,flagellum', 1, 35, 1200, 4, 0.2, 10),
  mic('diatom', 'Diatom', 'protist', 'global,ocean,freshwater', 'glass-shell,photosynthetic,single-celled', 1, 25, 1100, 4, 0.3, 10),
  mic('slime-mold', 'Slime mold', 'protist', 'global,forest,soil', 'brainless-problem-solver,single-celled', 1, 40, 1500, 4, 0.2, 12, { aliases: ['slime mould', 'physarum', 'physarum polycephalum'] }),
  mic('dinoflagellate', 'Dinoflagellate', 'protist', 'global,ocean', 'bioluminescent,single-celled', 1, 12, 700, 4, 0.5, 9),
  mic('radiolarian', 'Radiolarian', 'protist', 'global,ocean', 'glass-skeleton,single-celled', 1, 4, 300, 4, 0.8, 7),
  mic('bacteriophage', 'Bacteriophage', 'virus', 'global', 'virus,bacteria-killer', 1, 20, 1800, 4, 0.3, 14, { aliases: ['phage'] }),
  mic('bacteria', 'Bacteria', 'bacterium', 'global', 'single-celled', 1, 100, 6000, 1, 0, 40, { cw: true }),
  mic('microbe', 'Microbe', 'bacterium', 'global', 'microscopic', 1, 100, 2000, 1, 0, 30, { aliases: ['microorganism', 'microorganisms', 'microbes'] }),
];

export const PLANTS = [
  plant('welwitschia', 'Welwitschia', 'gymnosperm', 'desert,africa,namibia,coastal-fog', 'two-leaves,long-lived,living-fossil,desert-adapted,slow-growing', 3, 2, 120, 5, 0.85, 10, {
    f: 'gnetophyte',
    aliases: ['welwitschia mirabilis', 'tumboa', 'tree tumbo', 'onyanga'],
  }),
  plant('ephedra', 'Ephedra', 'gymnosperm', 'desert,asia,americas', 'medicinal,desert-adapted,shrub', 2, 15, 300, 4, 0.5, 9, { f: 'gnetophyte', aliases: ['ma huang', 'joint-fir'] }),
  plant('ginkgo', 'Ginkgo', 'gymnosperm', 'asia,china,temperate', 'living-fossil,long-lived,fan-leaves', 4, 60, 2500, 4, 0.1, 18, { aliases: ['ginkgo biloba', 'maidenhair tree'] }),
  plant('cycad', 'Cycad', 'gymnosperm', 'tropical,global', 'living-fossil,slow-growing', 2, 30, 700, 4, 0.3, 12),
  plant('bristlecone-pine', 'Bristlecone pine', 'gymnosperm', 'mountain,north-america,usa,desert', 'long-lived,slow-growing,oldest-living', 4, 25, 800, 5, 0.35, 12, { aliases: ['great basin bristlecone pine', 'methuselah'] }),
  plant('giant-sequoia', 'Giant sequoia', 'gymnosperm', 'mountain,north-america,usa', 'giant,long-lived,fire-adapted', 5, 85, 2500, 4, 0.05, 20, { aliases: ['sequoia', 'redwood'] }),
  plant('baobab', 'Baobab', 'tree', 'savanna,africa,madagascar', 'long-lived,giant,water-storing', 5, 85, 1500, 4, 0.1, 14),
  plant('dragon-blood-tree', 'Dragon blood tree', 'tree', 'island,asia,socotra,desert', 'red-sap,umbrella-shaped,long-lived', 4, 15, 600, 5, 0.6, 10, { aliases: ["dragon's blood tree", 'dragons blood tree', 'dracaena cinnabari'] }),
  plant('venus-flytrap', 'Venus flytrap', 'flowering-plant', 'wetland,north-america,usa', 'carnivorous,snapping', 1, 98, 4000, 4, 0, 20, { aliases: ['venus fly trap'] }),
  plant('rafflesia', 'Rafflesia', 'flowering-plant', 'rainforest,asia,tropical', 'giant,parasitic,foul-smelling', 3, 40, 1500, 4, 0.3, 12, { aliases: ['corpse lily'] }),
  plant('titan-arum', 'Titan arum', 'flowering-plant', 'rainforest,asia,tropical', 'giant,foul-smelling,rarely-blooms', 4, 55, 1800, 5, 0.2, 12, { aliases: ['corpse flower'] }),
  plant('lithops', 'Lithops', 'flowering-plant', 'desert,africa', 'pebble-mimic,camouflage,desert-adapted', 1, 15, 400, 5, 0.55, 8, { aliases: ['living stones', 'living stone'] }),
  plant('saguaro', 'Saguaro', 'flowering-plant', 'desert,north-america,usa', 'giant,long-lived,desert-adapted', 4, 85, 1800, 4, 0.1, 12),
  plant('plant', 'Plant', 'flowering-plant', 'global', 'green', 3, 100, 8000, 1, 0, 40, { cw: true }),
  plant('tree', 'Tree', 'tree', 'forest,global', 'woody', 4, 100, 6000, 1, 0, 40, { cw: true }),
  plant('flower', 'Flower', 'flowering-plant', 'global', 'blooming', 2, 100, 4000, 1, 0, 30, { cw: true }),
];
