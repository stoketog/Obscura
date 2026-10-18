import { ent } from './helpers';

const p = ent('person');

/** For people: scale = era (1 ancient … 5 modern). Setting = era + place tags. */
export const PEOPLE = [
  // — astronomers & the Harvard computers —
  p('henrietta-swan-leavitt', 'Henrietta Swan Leavitt', 'astronomer', '20th-century,usa,harvard', 'woman,overlooked,pioneer,measured-distances,variable-stars', 5, 3, 700, 5, 0.75, 15, {
    f: 'harvard-computer',
    aliases: ['henrietta leavitt', 'henrietta s. leavitt', 'h. s. leavitt', 'leavitt'],
  }),
  p('annie-jump-cannon', 'Annie Jump Cannon', 'astronomer', '20th-century,usa,harvard', 'woman,pioneer,classified-stars,hearing-impaired', 5, 8, 500, 5, 0.6, 12, { f: 'harvard-computer', aliases: ['annie cannon'] }),
  p('williamina-fleming', 'Williamina Fleming', 'astronomer', '19th-century,usa,harvard', 'woman,pioneer,discovered-nebula', 4, 4, 250, 5, 0.7, 9, { f: 'harvard-computer', aliases: ['williamina paton fleming'] }),
  p('cecilia-payne', 'Cecilia Payne-Gaposchkin', 'astronomer', '20th-century,usa,uk,harvard', 'woman,pioneer,overlooked,stellar-composition', 5, 8, 600, 5, 0.6, 12, { f: 'harvard-computer', aliases: ['cecilia payne', 'cecilia payne gaposchkin'] }),
  p('edwin-hubble', 'Edwin Hubble', 'astronomer', '20th-century,usa', 'expanding-universe,telescope,pioneer', 5, 80, 3000, 5, 0, 25),
  p('vera-rubin', 'Vera Rubin', 'astronomer', '20th-century,usa', 'woman,pioneer,overlooked,dark-matter', 5, 22, 1800, 5, 0.25, 15),
  p('caroline-herschel', 'Caroline Herschel', 'astronomer', '18th-century,19th-century,germany,uk,europe', 'woman,pioneer,discovered-comets', 3, 10, 800, 5, 0.45, 10),
  p('jocelyn-bell-burnell', 'Jocelyn Bell Burnell', 'astronomer', '20th-century,uk,europe', 'woman,overlooked,discovered-pulsars', 5, 12, 1100, 5, 0.35, 12, { aliases: ['jocelyn bell', 'jocelyn bell burnell'] }),
  p('galileo', 'Galileo Galilei', 'astronomer', '17th-century,italy,europe', 'telescope,pioneer,heresy-trial', 3, 99, 7000, 5, 0, 40, { aliases: ['galileo'] }),
  p('copernicus', 'Nicolaus Copernicus', 'astronomer', '16th-century,poland,europe', 'heliocentrism,pioneer', 3, 90, 4500, 5, 0, 30, { aliases: ['copernicus'] }),
  p('johannes-kepler', 'Johannes Kepler', 'astronomer', '17th-century,germany,europe', 'planetary-laws,mathematician', 3, 80, 4000, 5, 0, 30, { aliases: ['kepler'] }),
  p('tycho-brahe', 'Tycho Brahe', 'astronomer', '16th-century,denmark,europe', 'precise-observations,metal-nose,eccentric', 3, 55, 2500, 5, 0.1, 20, { aliases: ['tycho'] }),
  p('edmond-halley', 'Edmond Halley', 'astronomer', '17th-century,18th-century,uk,europe', 'comet,pioneer', 3, 55, 2000, 5, 0.1, 18, { aliases: ['halley'] }),
  p('carl-sagan', 'Carl Sagan', 'astronomer', '20th-century,usa', 'science-communicator,cosmos', 5, 85, 6000, 5, 0, 30),

  // — women & overlooked scientists, inventors —
  p('katharine-burr-blodgett', 'Katharine Burr Blodgett', 'physicist', '20th-century,usa,general-electric', 'woman,pioneer,overlooked,inventor,thin-films,non-reflective-glass', 5, 2, 220, 5, 0.8, 10, {
    f: 'ge-lab',
    aliases: ['katharine blodgett', 'katherine blodgett', 'katherine burr blodgett', 'blodgett', 'katharine b. blodgett'],
  }),
  p('irving-langmuir', 'Irving Langmuir', 'chemist', '20th-century,usa,general-electric', 'nobel,thin-films,surface-chemistry', 5, 4, 300, 5, 0.65, 10, { f: 'ge-lab' }),
  p('william-coolidge', 'William D. Coolidge', 'physicist', '20th-century,usa,general-electric', 'inventor,x-ray-tube,tungsten', 5, 2, 120, 5, 0.85, 6, { f: 'ge-lab', aliases: ['william coolidge', 'coolidge'] }),
  p('hedy-lamarr', 'Hedy Lamarr', 'inventor', '20th-century,usa,austria', 'woman,inventor,actress,frequency-hopping', 5, 70, 5000, 5, 0.05, 20),
  p('stephanie-kwolek', 'Stephanie Kwolek', 'chemist', '20th-century,usa', 'woman,inventor,kevlar,pioneer', 5, 6, 600, 5, 0.6, 10),
  p('rosalind-franklin', 'Rosalind Franklin', 'chemist', '20th-century,uk,europe', 'woman,overlooked,dna-structure,pioneer', 5, 50, 3500, 5, 0.05, 20),
  p('lise-meitner', 'Lise Meitner', 'physicist', '20th-century,germany,europe', 'woman,overlooked,nuclear-fission,pioneer', 5, 20, 1500, 5, 0.25, 15),
  p('emmy-noether', 'Emmy Noether', 'mathematician', '20th-century,germany,europe', 'woman,pioneer,abstract-algebra,overlooked', 5, 12, 1800, 5, 0.3, 12),
  p('chien-shiung-wu', 'Chien-Shiung Wu', 'physicist', '20th-century,usa,china', 'woman,pioneer,overlooked,parity-experiment', 5, 10, 900, 5, 0.4, 10),
  p('barbara-mcclintock', 'Barbara McClintock', 'biologist', '20th-century,usa', 'woman,nobel,pioneer,jumping-genes', 5, 10, 1200, 5, 0.4, 12),
  p('marie-curie', 'Marie Curie', 'physicist', '20th-century,france,poland,europe', 'woman,nobel,pioneer,radioactivity', 5, 99, 9000, 5, 0, 40),
  p('ada-lovelace', 'Ada Lovelace', 'mathematician', '19th-century,uk,europe', 'woman,pioneer,first-programmer', 4, 70, 5000, 5, 0.05, 25),
  p('grace-hopper', 'Grace Hopper', 'computer-scientist', '20th-century,usa', 'woman,pioneer,compiler,navy', 5, 40, 3500, 5, 0.1, 20),
  p('katherine-johnson', 'Katherine Johnson', 'mathematician', '20th-century,usa', 'woman,pioneer,nasa,trajectories', 5, 25, 2500, 5, 0.15, 15),
  p('mary-anning', 'Mary Anning', 'paleontologist', '19th-century,uk,europe', 'woman,overlooked,fossil-collector,pioneer', 4, 35, 2500, 5, 0.1, 18),
  p('florence-nightingale', 'Florence Nightingale', 'physician', '19th-century,uk,europe', 'woman,pioneer,nursing,statistics', 4, 85, 3500, 5, 0, 25),

  // — other inventors & thinkers —
  p('nikola-tesla', 'Nikola Tesla', 'inventor', '19th-century,20th-century,usa,serbia', 'inventor,electricity,eccentric', 5, 97, 9000, 5, 0, 40, { aliases: ['tesla'] }),
  p('thomas-edison', 'Thomas Edison', 'inventor', '19th-century,20th-century,usa', 'inventor,electricity,lightbulb', 4, 99, 7000, 5, 0, 40, { aliases: ['edison'] }),
  p('alexander-graham-bell', 'Alexander Graham Bell', 'inventor', '19th-century,usa,uk', 'inventor,telephone', 4, 97, 5000, 5, 0, 30, { aliases: ['graham bell'] }),
  p('garrett-morgan', 'Garrett Morgan', 'inventor', '20th-century,usa', 'inventor,traffic-signal,safety-hood,overlooked', 5, 8, 450, 5, 0.6, 9),
  p('lewis-latimer', 'Lewis Latimer', 'inventor', '19th-century,usa', 'inventor,lightbulb-filament,overlooked', 4, 6, 500, 5, 0.6, 9),
  p('george-washington-carver', 'George Washington Carver', 'biologist', '20th-century,usa', 'inventor,agriculture,peanuts,pioneer', 5, 70, 3500, 5, 0.05, 20, { aliases: ['carver'] }),
  p('alan-turing', 'Alan Turing', 'computer-scientist', '20th-century,uk,europe', 'pioneer,codebreaker,computing', 5, 90, 6000, 5, 0, 30),
  p('ignaz-semmelweis', 'Ignaz Semmelweis', 'physician', '19th-century,hungary,austria,europe', 'pioneer,handwashing,overlooked,ridiculed', 4, 8, 1500, 5, 0.45, 14, { aliases: ['semmelweis'] }),
  p('leonardo-da-vinci', 'Leonardo da Vinci', 'artist', '16th-century,italy,europe', 'polymath,inventor,painter', 3, 100, 12000, 5, 0, 50, { aliases: ['leonardo', 'da vinci'] }),
  p('napoleon', 'Napoleon Bonaparte', 'ruler', '19th-century,france,europe', 'emperor,military,exile', 4, 100, 12000, 5, 0, 50, { aliases: ['napoleon'] }),
  p('cleopatra', 'Cleopatra', 'ruler', 'ancient,egypt,africa', 'woman,queen', 1, 100, 8000, 5, 0, 40),
  p('william-shakespeare', 'William Shakespeare', 'writer', '16th-century,uk,europe', 'playwright,poet', 3, 100, 12000, 5, 0, 60, { aliases: ['shakespeare'] }),
  p('mozart', 'Wolfgang Amadeus Mozart', 'composer', '18th-century,austria,europe', 'prodigy,composer', 3, 100, 9000, 5, 0, 50, { aliases: ['mozart', 'wolfgang mozart'] }),
  p('scientist', 'Scientist', 'scientist', 'global', 'researcher', 4, 100, 3000, 1, 0, 40, { cw: true }),
  p('astronomer', 'Astronomer', 'astronomer', 'global', 'stargazer', 4, 100, 1500, 2, 0, 30),
  p('inventor', 'Inventor', 'inventor', 'global', 'creator', 4, 100, 1500, 1, 0, 30),
  p('person', 'Person', 'scientist', 'global', 'human', 3, 100, 6000, 1, 0, 40, { cw: true }),
];
