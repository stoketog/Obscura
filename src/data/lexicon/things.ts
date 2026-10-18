import { ent } from './helpers';

const inv = ent('invention');
const obj = ent('object');

/** Inventions and objects: scale = era (1 ancient … 5 modern). */
export const INVENTIONS = [
  // — early electronic instruments —
  inv('ondes-martenot', 'Ondes Martenot', 'instrument', '20th-century,france,europe', 'electronic,musical,keyboard,ribbon,eerie', 5, 4, 350, 5, 0.85, 12, {
    f: 'early-electronic-instrument',
    aliases: ['martenot', 'ondes', 'ondes-martenot'],
  }),
  inv('theremin', 'Theremin', 'instrument', '20th-century,russia,soviet,europe', 'electronic,musical,touchless,eerie', 5, 55, 2500, 5, 0.1, 20, { f: 'early-electronic-instrument' }),
  inv('trautonium', 'Trautonium', 'instrument', '20th-century,germany,europe', 'electronic,musical,experimental', 5, 1, 100, 5, 0.95, 6, { f: 'early-electronic-instrument' }),
  inv('telharmonium', 'Telharmonium', 'instrument', '20th-century,usa', 'electronic,musical,huge,experimental,forgotten', 5, 2, 120, 5, 0.9, 6, { f: 'early-electronic-instrument', aliases: ['dynamophone'] }),
  inv('moog-synthesizer', 'Moog synthesizer', 'instrument', '20th-century,usa', 'electronic,musical,keyboard', 5, 55, 2500, 4, 0.05, 15, { f: 'early-electronic-instrument', aliases: ['moog', 'synthesizer', 'synthesiser'] }),
  inv('mellotron', 'Mellotron', 'instrument', '20th-century,uk,europe', 'electromechanical,musical,keyboard,tape', 5, 20, 700, 5, 0.5, 10, { f: 'early-electronic-instrument' }),
  inv('hammond-organ', 'Hammond organ', 'instrument', '20th-century,usa', 'electromechanical,musical,keyboard', 5, 60, 2000, 4, 0.1, 14, { aliases: ['hammond'] }),
  inv('glass-harmonica', 'Glass harmonica', 'instrument', '18th-century,usa,europe', 'musical,glass,eerie,forgotten', 3, 20, 600, 5, 0.55, 10, { aliases: ['glass armonica', 'armonica'] }),
  inv('hurdy-gurdy', 'Hurdy-gurdy', 'instrument', 'medieval,europe', 'musical,strings,wheel,drone', 2, 35, 1200, 5, 0.35, 12, { aliases: ['hurdy gurdy'] }),
  inv('stylophone', 'Stylophone', 'instrument', '20th-century,uk,europe', 'electronic,musical,toy,stylus', 5, 15, 600, 5, 0.5, 8),
  inv('didgeridoo', 'Didgeridoo', 'instrument', 'ancient,australia,oceania', 'musical,drone,wooden', 1, 90, 2500, 5, 0.05, 14),
  inv('instrument', 'Instrument', 'instrument', 'global', 'musical', 3, 100, 2000, 1, 0, 30, { cw: true }),

  // — odd vehicles —
  inv('ekranoplan', 'Ekranoplan', 'vehicle', '20th-century,russia,soviet,europe,caspian', 'ground-effect,experimental,military,huge,skims-water,fast', 5, 3, 900, 5, 0.8, 12, {
    f: 'unusual-aircraft',
    aliases: ['caspian sea monster', 'km ekranoplan', 'lun-class ekranoplan', 'lun ekranoplan', 'ground effect vehicle', 'wing in ground effect', 'wig craft', 'wing-in-ground-effect'],
  }),
  inv('spruce-goose', 'Spruce Goose', 'vehicle', '20th-century,usa', 'huge,wooden,flying-boat,experimental', 5, 55, 3000, 5, 0.15, 14, { f: 'unusual-aircraft', aliases: ['h-4 hercules', 'hughes h-4 hercules'] }),
  inv('tu-144', 'Tupolev Tu-144', 'vehicle', '20th-century,russia,soviet,europe', 'supersonic,experimental,military', 5, 5, 450, 5, 0.75, 9, { f: 'unusual-aircraft', aliases: ['tu-144', 'concordski', 'tupolev tu 144'] }),
  inv('concorde', 'Concorde', 'vehicle', '20th-century,uk,france,europe', 'supersonic,fast', 5, 95, 6000, 5, 0, 30, { f: 'unusual-aircraft' }),
  inv('aerotrain', 'Aérotrain', 'vehicle', '20th-century,france,europe', 'hovering,experimental,fast,forgotten', 5, 2, 150, 5, 0.9, 6, { aliases: ['aerotrain'] }),
  inv('hovercraft', 'Hovercraft', 'vehicle', '20th-century,uk,europe', 'hovering,skims-water', 5, 90, 2500, 4, 0.05, 15),
  inv('hydrofoil', 'Hydrofoil', 'vehicle', '20th-century,europe', 'skims-water,fast', 5, 60, 1200, 4, 0.15, 10),
  inv('zeppelin', 'Zeppelin', 'vehicle', '20th-century,germany,europe', 'airship,huge,flight', 5, 80, 3500, 4, 0.05, 20),
  inv('segway', 'Segway', 'vehicle', '20th-century,usa', 'self-balancing,scooter', 5, 80, 2500, 4, 0.05, 12),
  inv('monorail', 'Monorail', 'vehicle', '19th-century,20th-century,global', 'rail,transport', 4, 80, 2000, 3, 0.05, 15),
  inv('vehicle', 'Vehicle', 'vehicle', 'global', 'transport', 4, 100, 3000, 1, 0, 30, { cw: true }),

  // — machines & optical toys —
  inv('difference-engine', 'Difference engine', 'machine', '19th-century,uk,europe', 'mechanical,calculating,babbage,computing', 4, 25, 1200, 5, 0.3, 14),
  inv('antikythera-mechanism', 'Antikythera mechanism', 'machine', 'ancient,greece,europe,mediterranean', 'mechanical,astronomical,shipwreck,computing', 1, 40, 3500, 5, 0.15, 20, { aliases: ['antikythera'] }),
  inv('astrolabe', 'Astrolabe', 'machine', 'medieval,ancient,asia,europe', 'astronomical,navigation,brass', 2, 40, 2500, 5, 0.2, 18),
  inv('zoetrope', 'Zoetrope', 'machine', '19th-century,uk,europe', 'optical,animation,spinning,toy', 4, 25, 1500, 5, 0.3, 12),
  inv('phenakistoscope', 'Phenakistoscope', 'machine', '19th-century,belgium,europe', 'optical,animation,spinning,toy', 4, 4, 300, 5, 0.8, 7),
  inv('camera-obscura', 'Camera obscura', 'machine', 'ancient,global', 'optical,projection,darkened-room', 2, 40, 1800, 5, 0.1, 14),
  inv('magic-lantern', 'Magic lantern', 'machine', '17th-century,europe', 'optical,projection', 3, 25, 800, 5, 0.3, 10),
  inv('stirling-engine', 'Stirling engine', 'machine', '19th-century,uk,europe', 'heat-engine,mechanical,efficient', 4, 12, 900, 5, 0.5, 12),
  inv('tesla-coil', 'Tesla coil', 'machine', '19th-century,usa', 'electrical,sparks', 4, 70, 3500, 5, 0.1, 15),
  inv('orrery', 'Orrery', 'machine', '18th-century,uk,europe', 'mechanical,astronomical,model', 3, 20, 700, 5, 0.4, 10),
  inv('pneumatic-tube', 'Pneumatic tube', 'machine', '19th-century,uk,europe', 'mail,air-pressure,forgotten', 4, 30, 700, 5, 0.3, 10),
  inv('printing-press', 'Printing press', 'machine', 'medieval,germany,europe', 'revolutionary,books', 2, 99, 6000, 4, 0, 30),
  inv('machine', 'Machine', 'machine', 'global', 'mechanical', 3, 100, 2500, 1, 0, 30, { cw: true }),
];

export const OBJECTS = [
  // — undeciphered scripts & ancient artifacts —
  obj('phaistos-disc', 'Phaistos Disc', 'artifact', 'ancient,bronze-age,minoan,crete,greece,europe,mediterranean', 'undeciphered,clay,stamped-symbols,spiral', 1, 6, 600, 5, 0.7, 14, {
    f: 'undeciphered-script',
    aliases: ['phaistos disk', 'phaestos disc', 'phaistos', 'phaistos disc'],
  }),
  obj('linear-a', 'Linear A', 'script', 'ancient,bronze-age,minoan,crete,greece,europe,mediterranean', 'undeciphered,script,clay', 1, 6, 600, 5, 0.75, 10, { f: 'undeciphered-script' }),
  obj('rongorongo', 'Rongorongo', 'script', 'ancient,pacific,easter-island', 'undeciphered,script,wooden', 2, 5, 450, 5, 0.8, 9, { f: 'undeciphered-script' }),
  obj('indus-script', 'Indus script', 'script', 'ancient,bronze-age,asia,india', 'undeciphered,script,seals', 1, 6, 450, 5, 0.75, 9, { f: 'undeciphered-script', aliases: ['indus valley script'] }),
  obj('voynich-manuscript', 'Voynich manuscript', 'manuscript', 'medieval,europe', 'undeciphered,illustrated,mysterious', 2, 25, 2500, 5, 0.25, 16, { f: 'undeciphered-script', aliases: ['voynich'] }),
  obj('nebra-sky-disc', 'Nebra sky disc', 'artifact', 'ancient,bronze-age,germany,europe', 'astronomical,bronze,oldest-sky-depiction', 1, 4, 400, 5, 0.8, 9, { aliases: ['nebra disc', 'nebra sky disk'] }),
  obj('rosetta-stone', 'Rosetta Stone', 'artifact', 'ancient,egypt,africa', 'decipherment,stone,inscription', 1, 90, 5000, 5, 0.05, 25),
  obj('dead-sea-scrolls', 'Dead Sea Scrolls', 'manuscript', 'ancient,asia,middle-east', 'manuscript,found-in-caves,religious', 1, 90, 4500, 5, 0.05, 25),
  obj('piri-reis-map', 'Piri Reis map', 'map', 'medieval,turkey,asia,europe', 'map,mysterious,16th-century', 3, 6, 500, 5, 0.65, 9),
  obj('codex-gigas', 'Codex Gigas', 'manuscript', 'medieval,europe,sweden', 'huge,manuscript,devil-illustration', 2, 8, 700, 5, 0.6, 9, { aliases: ["devil's bible", 'devils bible'] }),
  obj('stonehenge', 'Stonehenge', 'monument', 'ancient,uk,europe', 'stone,astronomical,mysterious', 1, 100, 9000, 5, 0, 40),
  obj('lewis-chessmen', 'Lewis chessmen', 'artifact', 'medieval,uk,europe,island', 'carved,walrus-ivory', 2, 18, 800, 5, 0.4, 10),
  obj('artifact', 'Artifact', 'artifact', 'global', 'ancient', 2, 100, 1500, 1, 0, 30, { cw: true }),

  // — messages to the stars —
  obj('voyager-golden-record', 'Voyager Golden Record', 'space-artifact', '20th-century,usa,space', 'time-capsule,audio,gold-plated,sent-to-space,message-to-aliens', 5, 35, 2000, 5, 0.4, 14, {
    f: 'space-message',
    aliases: ['golden record', 'voyager record', 'voyager 1 golden record', 'voyager gold record', 'the golden record'],
  }),
  obj('pioneer-plaque', 'Pioneer plaque', 'space-artifact', '20th-century,usa,space', 'time-capsule,engraved,gold-anodised,sent-to-space,message-to-aliens', 5, 25, 1100, 5, 0.45, 10, { f: 'space-message', aliases: ['pioneer plaques'] }),
  obj('arecibo-message', 'Arecibo message', 'space-artifact', '20th-century,usa,space', 'radio-signal,binary,message-to-aliens', 5, 20, 1500, 5, 0.5, 10, { f: 'space-message' }),
  obj('voyager-1', 'Voyager 1', 'space-artifact', '20th-century,usa,space', 'space-probe,interstellar,farthest', 5, 75, 5000, 5, 0.05, 25, { aliases: ['voyager', 'voyager 2'] }),
  obj('wow-signal', 'Wow! signal', 'space-artifact', '20th-century,usa,space', 'radio-signal,unexplained,mysterious', 5, 10, 900, 5, 0.6, 9, { aliases: ['wow signal'] }),
  obj('time-capsule', 'Time capsule', 'space-artifact', 'global', 'sealed,message-to-the-future', 4, 90, 800, 2, 0, 20),
];
