import { ent } from './helpers';

const l = ent('place');

/** For places: scale = physical extent (1 tiny … 5 vast). */
export const PLACES = [
  // — deep holes & extremes —
  l('kola-superdeep-borehole', 'Kola Superdeep Borehole', 'structure', 'russia,europe,arctic,kola-peninsula', 'deepest,man-made,drilled,abandoned,scientific,record-holder', 2, 5, 800, 5, 0.7, 14, {
    f: 'deep-hole',
    aliases: ['kola borehole', 'kola superdeep', 'sg-3', 'kola well', 'kola superdeep well', 'kola'],
  }),
  l('mponeng-mine', 'Mponeng Gold Mine', 'structure', 'africa,south-africa', 'deepest,man-made,mine,hot', 2, 2, 120, 5, 0.9, 6, { f: 'deep-hole', aliases: ['mponeng'] }),
  l('mir-mine', 'Mir Mine', 'structure', 'russia,asia,siberia', 'man-made,mine,huge-hole,diamonds,abandoned', 3, 6, 600, 5, 0.75, 8, { f: 'deep-hole', aliases: ['mir diamond mine', 'mirny mine'] }),
  l('bingham-canyon-mine', 'Bingham Canyon Mine', 'structure', 'north-america,usa', 'man-made,mine,huge-hole,copper', 3, 8, 450, 5, 0.7, 7, { f: 'deep-hole', aliases: ['bingham canyon'] }),
  l('krubera-cave', 'Krubera Cave', 'cave-system', 'europe,georgia,caucasus,underground', 'deepest,natural,cave,record-holder', 2, 6, 450, 5, 0.75, 8, { f: 'deep-hole', aliases: ['voronya cave', 'krubera-voronja'] }),
  l('veryovkina-cave', 'Veryovkina Cave', 'cave-system', 'europe,georgia,caucasus,underground', 'deepest,natural,cave,record-holder', 2, 2, 100, 5, 0.9, 5, { f: 'deep-hole' }),
  l('challenger-deep', 'Challenger Deep', 'landscape', 'ocean,pacific,underwater', 'deepest,natural,record-holder', 2, 55, 2500, 5, 0.3, 14, { f: 'deep-hole' }),
  l('mariana-trench', 'Mariana Trench', 'landscape', 'ocean,pacific,underwater', 'deepest,natural,record-holder', 4, 85, 5000, 4, 0.1, 20),
  l('mount-everest', 'Mount Everest', 'landscape', 'asia,mountain,himalaya', 'highest,natural,record-holder', 4, 100, 12000, 4, 0, 40),
  l('death-valley', 'Death Valley', 'landscape', 'north-america,usa,desert,below-sea-level', 'hottest,natural,record-holder,salt', 4, 90, 5000, 4, 0.05, 25),

  // — hot, strange and alien landscapes —
  l('danakil-depression', 'Danakil Depression', 'landscape', 'africa,ethiopia,eritrea,desert,volcanic,below-sea-level,rift', 'hottest,acidic,sulphur,salt,volcanic,alien-looking', 3, 3, 450, 5, 0.75, 12, {
    f: 'extreme-landscape',
    aliases: ['dallol', 'afar depression', 'danakil desert', 'danakil', 'afar triangle'],
  }),
  l('lut-desert', 'Lut Desert', 'landscape', 'asia,iran,desert', 'hottest,natural,record-holder,sand', 4, 3, 300, 5, 0.75, 8, { f: 'extreme-landscape', aliases: ['dasht-e lut'] }),
  l('lake-natron', 'Lake Natron', 'landscape', 'africa,tanzania,rift,volcanic', 'alkaline,red-water,caustic,flamingos', 2, 8, 450, 5, 0.65, 9, { f: 'extreme-landscape' }),
  l('erta-ale', 'Erta Ale', 'landscape', 'africa,ethiopia,desert,volcanic', 'lava-lake,volcanic,remote', 2, 6, 450, 5, 0.7, 8, { f: 'extreme-landscape' }),
  l('kawah-ijen', 'Kawah Ijen', 'landscape', 'asia,indonesia,volcanic', 'acidic,sulphur,blue-flames,volcanic', 2, 12, 600, 5, 0.6, 8, { f: 'extreme-landscape', aliases: ['ijen'] }),
  l('salar-de-uyuni', 'Salar de Uyuni', 'landscape', 'south-america,bolivia,mountain,desert', 'salt,mirror-effect,natural', 4, 55, 2800, 5, 0.2, 14, { aliases: ['uyuni', 'uyuni salt flat'] }),
  l('dead-sea', 'Dead Sea', 'landscape', 'asia,middle-east,below-sea-level', 'salt,floating,lowest', 3, 99, 5000, 4, 0, 25),
  l('atacama-desert', 'Atacama Desert', 'landscape', 'south-america,chile,desert', 'driest,natural,record-holder', 4, 85, 3000, 4, 0.05, 20, { aliases: ['atacama'] }),
  l('sahara', 'Sahara', 'landscape', 'africa,desert', 'hot,vast,sand', 5, 100, 8000, 3, 0, 40, { aliases: ['sahara desert'] }),

  // — remote islands —
  l('tristan-da-cunha', 'Tristan da Cunha', 'island', 'ocean,atlantic,south-atlantic,remote,volcanic,british-territory', 'remote,inhabited,volcanic,british-territory,tiny-population', 2, 8, 1200, 5, 0.6, 12, {
    f: 'south-atlantic-island',
    aliases: ['tristan', 'tristan de cunha', 'tristan da cunha island'],
  }),
  l('saint-helena', 'Saint Helena', 'island', 'ocean,atlantic,south-atlantic,remote,volcanic,british-territory', 'remote,inhabited,volcanic,british-territory,napoleon-exile', 2, 50, 3000, 4, 0.2, 18, { f: 'south-atlantic-island', aliases: ['st helena'] }),
  l('ascension-island', 'Ascension Island', 'island', 'ocean,atlantic,south-atlantic,remote,volcanic,british-territory', 'remote,inhabited,volcanic,british-territory,military-base', 2, 12, 800, 5, 0.5, 10, { f: 'south-atlantic-island' }),
  l('gough-island', 'Gough Island', 'island', 'ocean,atlantic,south-atlantic,remote,volcanic,british-territory', 'remote,uninhabited,volcanic,british-territory,seabird-colony', 2, 2, 150, 5, 0.9, 6, { f: 'south-atlantic-island' }),
  l('bouvet-island', 'Bouvet Island', 'island', 'ocean,atlantic,south-atlantic,antarctic,remote,volcanic', 'remote,uninhabited,volcanic,most-remote', 1, 5, 600, 5, 0.8, 8),
  l('pitcairn-islands', 'Pitcairn Islands', 'island', 'ocean,pacific,remote,british-territory', 'remote,inhabited,british-territory,mutiny-descendants', 2, 40, 2500, 5, 0.3, 14, { aliases: ['pitcairn', 'pitcairn island'] }),
  l('easter-island', 'Easter Island', 'island', 'ocean,pacific,remote,chile', 'remote,inhabited,volcanic,statues', 2, 98, 6000, 5, 0, 25, { aliases: ['rapa nui'] }),
  l('falkland-islands', 'Falkland Islands', 'island', 'ocean,atlantic,south-atlantic,british-territory', 'inhabited,british-territory,disputed', 3, 75, 4500, 4, 0.1, 20, { f: 'south-atlantic-island', aliases: ['falklands', 'the falklands'] }),
  l('south-georgia', 'South Georgia', 'island', 'ocean,atlantic,south-atlantic,antarctic,british-territory,remote', 'remote,british-territory,wildlife,whaling-history', 3, 40, 1800, 5, 0.25, 12, { f: 'south-atlantic-island' }),
  l('saint-kilda', 'Saint Kilda', 'island', 'ocean,atlantic,uk,europe,remote', 'remote,abandoned,seabird-colony', 2, 18, 800, 5, 0.45, 10, { aliases: ['st kilda', 'hirta'] }),
  l('socotra', 'Socotra', 'island', 'ocean,indian-ocean,asia,remote', 'remote,alien-looking,endemic-species,dragon-blood-trees', 3, 12, 1100, 5, 0.55, 12),
  l('svalbard', 'Svalbard', 'island', 'arctic,europe,remote,norway', 'remote,inhabited,polar-bears,seed-vault', 4, 70, 3500, 4, 0.1, 18),
  l('galapagos', 'Galápagos Islands', 'island', 'ocean,pacific,south-america,remote', 'remote,endemic-species,volcanic,darwin', 3, 97, 5000, 4, 0, 25, { aliases: ['galapagos', 'galapagos islands'] }),
  l('madagascar', 'Madagascar', 'island', 'ocean,indian-ocean,africa', 'endemic-species,inhabited,large', 5, 99, 8000, 3, 0, 30),
  l('iceland', 'Iceland', 'island', 'ocean,atlantic,europe,arctic,volcanic', 'inhabited,volcanic,geothermal', 4, 100, 12000, 3, 0, 40),
  l('island', 'Island', 'island', 'ocean,global', 'surrounded-by-water', 3, 100, 4000, 1, 0, 30, { cw: true }),
  l('country', 'Country', 'region', 'global', 'nation', 4, 100, 3000, 1, 0, 40, { cw: true }),
  l('city', 'City', 'region', 'global', 'urban', 3, 100, 3000, 1, 0, 40, { cw: true }),
  l('desert', 'Desert', 'landscape', 'desert,global', 'dry,hot', 4, 100, 3000, 1, 0, 40, { cw: true }),
  l('mountain', 'Mountain', 'landscape', 'mountain,global', 'high', 4, 100, 3000, 1, 0, 40, { cw: true }),
];
