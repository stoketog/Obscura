import type { PromptSeed } from '@/lib/types';
import { sheet } from './sheet1';
import { SHEET1 } from './sheet1';
import { FLAGS } from './sheet3';

/** Factual questions from the 2,000-question sheet, part 4: those built from a fuller list. */

/** All 118 elements, in rough order of how well known they are, with their symbols. */
const ELEMENTS: Array<[string, string]> = [
  ['Oxygen', 'O'], ['Hydrogen', 'H'], ['Gold', 'Au'], ['Iron', 'Fe'], ['Carbon', 'C'], ['Silver', 'Ag'], ['Helium', 'He'], ['Copper', 'Cu'],
  ['Nitrogen', 'N'], ['Sodium', 'Na'], ['Lead', 'Pb'], ['Aluminium|Aluminum', 'Al'], ['Calcium', 'Ca'], ['Mercury', 'Hg'], ['Zinc', 'Zn'],
  ['Uranium', 'U'], ['Tin', 'Sn'], ['Neon', 'Ne'], ['Platinum', 'Pt'], ['Potassium', 'K'], ['Chlorine', 'Cl'], ['Magnesium', 'Mg'],
  ['Silicon', 'Si'], ['Lithium', 'Li'], ['Sulfur|Sulphur', 'S'], ['Titanium', 'Ti'], ['Nickel', 'Ni'], ['Plutonium', 'Pu'], ['Iodine', 'I'],
  ['Phosphorus', 'P'], ['Fluorine', 'F'], ['Argon', 'Ar'], ['Cobalt', 'Co'], ['Chromium', 'Cr'], ['Tungsten', 'W'], ['Radium', 'Ra'],
  ['Radon', 'Rn'], ['Krypton', 'Kr'], ['Xenon', 'Xe'], ['Arsenic', 'As'], ['Manganese', 'Mn'], ['Boron', 'B'], ['Bromine', 'Br'],
  ['Barium', 'Ba'], ['Beryllium', 'Be'], ['Cadmium', 'Cd'], ['Caesium|Cesium', 'Cs'], ['Strontium', 'Sr'], ['Neodymium', 'Nd'],
  ['Cobalt (dup)', ''], ['Palladium', 'Pd'], ['Polonium', 'Po'], ['Thorium', 'Th'], ['Selenium', 'Se'], ['Bismuth', 'Bi'],
  ['Antimony', 'Sb'], ['Germanium', 'Ge'], ['Vanadium', 'V'], ['Molybdenum', 'Mo'], ['Osmium', 'Os'], ['Iridium', 'Ir'], ['Rhodium', 'Rh'],
  ['Gallium', 'Ga'], ['Indium', 'In'], ['Americium', 'Am'], ['Einsteinium', 'Es'], ['Francium', 'Fr'], ['Rubidium', 'Rb'],
  ['Zirconium', 'Zr'], ['Tantalum', 'Ta'], ['Niobium', 'Nb'], ['Tellurium', 'Te'], ['Astatine', 'At'], ['Technetium', 'Tc'],
  ['Scandium', 'Sc'], ['Yttrium', 'Y'], ['Lanthanum', 'La'], ['Cerium', 'Ce'], ['Europium', 'Eu'], ['Gadolinium', 'Gd'],
  ['Hafnium', 'Hf'], ['Rhenium', 'Re'], ['Ruthenium', 'Ru'], ['Thallium', 'Tl'], ['Curium', 'Cm'], ['Californium', 'Cf'],
  ['Nobelium', 'No'], ['Mendelevium', 'Md'], ['Fermium', 'Fm'], ['Berkelium', 'Bk'], ['Neptunium', 'Np'], ['Protactinium', 'Pa'],
  ['Actinium', 'Ac'], ['Lawrencium', 'Lr'], ['Samarium', 'Sm'], ['Promethium', 'Pm'], ['Praseodymium', 'Pr'], ['Terbium', 'Tb'],
  ['Dysprosium', 'Dy'], ['Holmium', 'Ho'], ['Erbium', 'Er'], ['Thulium', 'Tm'], ['Ytterbium', 'Yb'], ['Lutetium', 'Lu'],
  ['Rutherfordium', 'Rf'], ['Dubnium', 'Db'], ['Seaborgium', 'Sg'], ['Bohrium', 'Bh'], ['Hassium', 'Hs'], ['Meitnerium', 'Mt'],
  ['Darmstadtium', 'Ds'], ['Roentgenium', 'Rg'], ['Copernicium', 'Cn'], ['Nihonium', 'Nh'], ['Flerovium', 'Fl'], ['Moscovium', 'Mc'],
  ['Livermorium', 'Lv'], ['Tennessine', 'Ts'], ['Oganesson', 'Og'],
].filter(([, s]) => s) as Array<[string, string]>;

const NON_METALS = new Set(['H', 'He', 'C', 'N', 'O', 'F', 'Ne', 'P', 'S', 'Cl', 'Ar', 'Se', 'Br', 'Kr', 'I', 'Xe', 'Rn', 'Og', 'At', 'Ts', 'B', 'Si', 'Ge', 'As', 'Sb', 'Te']);

/** Countries whose capital is not their largest city (as in sheet3's list). */
const CAPITAL_NOT_LARGEST = /^(Australia|United States|Canada|Brazil|Turkey|Switzerland|New Zealand|China|South Africa|India|Vietnam|Nigeria|Pakistan|Morocco|Kazakhstan|Myanmar|Tanzania|Ivory Coast|Bolivia|Ecuador|Cameroon|Benin|United Arab Emirates|Burundi|Equatorial Guinea|Sri Lanka|Belize|Philippines|Malta|Liechtenstein|San Marino|Gambia|Palau|Micronesia|Malawi|Syria)$/;
/** Countries whose only official (or national) language is English. */
const ENGLISH_ONLY = /^(United States|United Kingdom|Australia|Antigua and Barbuda|Bahamas|Barbados|Belize|Dominica|Grenada|Guyana|Jamaica|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Trinidad and Tobago|Liberia|Sierra Leone|Nigeria|Ghana|Gambia|Zambia|Micronesia)$/;
const name = (row: string) => row.split('|')[0];

const AFTER_2000 = /^(Orange Revolution|Arab Spring|Egyptian Revolution|Tunisian Revolution|Euromaidan|Rose Revolution|Saffron Revolution|Sudanese Revolution|Digital Revolution|Bolivarian Revolution)$/;

export const SHEET4: PromptSeed[] = [
  sheet('s-us-state-11', 'geography', 'Name a US state whose name has exactly 11 letters', 'US states · 11 letters', `
    Mississippi
    Connecticut
    Rhode Island
    North Dakota
    South Dakota
  `),
  sheet('s-two-letter-symbol', 'science', 'Name a chemical element with a two-letter symbol', 'Two-letter element symbols',
    ELEMENTS.filter(([, s]) => s.length === 2).map(([n]) => n).join('\n')),
  sheet('s-metal-element', 'science', 'Name a metallic element', 'Metals', ELEMENTS.filter(([, s]) => !NON_METALS.has(s)).map(([n]) => n).join('\n')),
  sheet('s-capital-largest', 'geography', 'Name a country whose capital is also its largest city', 'Capitals that are the biggest city',
    FLAGS.map(([n]) => n).filter((n) => !CAPITAL_NOT_LARGEST.test(name(n)) && !/^(DR Congo|Republic of the Congo)/.test(n)).join('\n')),
  sheet('s-non-english-official', 'geography', 'Name a country with an official language other than English', 'Countries with a non-English official language',
    FLAGS.map(([n]) => n).filter((n) => !ENGLISH_ONLY.test(name(n))).join('\n')),
  sheet('s-revolution-before-2000', 'history', 'Name a revolution that happened before 2000', 'Revolutions before 2000',
    SHEET1.find((p) => p.id === 's-revolution')!.answers.map((a) => a.split('|')).filter(([n]) => !AFTER_2000.test(n)).map(([n, , al]) => (al ? `${n}|${al}` : n)).join('\n')),
];
