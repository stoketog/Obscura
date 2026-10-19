import type { DailyImage, ImageKind } from '@/lib/types';
import CREDITS from './image-credits.json';

/**
 * THE PHOTOGRAPH LIBRARY
 * ----------------------
 * One photograph is developed each day. Every file is a real photograph (or a photograph of a public-domain
 * artwork), downloaded from Wikimedia Commons by `scripts/images/fetch_images.py`, which only accepts files
 * whose Commons record is public domain or CC0 with no extra restrictions, so they are safe to use on a
 * commercial site. `image-credits.json` holds what that check found (author, licence, source page) and is
 * shown under every reveal.
 *
 * To add an image: add its entry here, add a search to `scripts/images/subjects.json`, run the script, look
 * at the result, then `npm test` (which checks every entry has an approved licence and a file).
 *
 * Guessing is forgiving (case, accents, small typos, "the"), but the name is the answer: list every common
 * name in `aliases`, never a generic word that would describe many things ("lighthouse", "castle").
 */
interface Editorial {
  id: string;
  answer: string;
  aliases: string[];
  kind: ImageKind;
  blurb: string;
}

const EDITORIAL: Editorial[] = [
  { id: 'bell-rock', answer: 'Bell Rock Lighthouse', aliases: ['Bell Rock', 'Inchcape Rock Lighthouse', 'Inchcape Lighthouse', 'Inchcape Rock'], kind: 'place', blurb: 'Built by Robert Stevenson between 1807 and 1810 on a reef off the Angus coast of Scotland, it is the oldest surviving sea-washed lighthouse in the world. Painted here in a storm by J. M. W. Turner.' },
  { id: 'stonehenge', answer: 'Stonehenge', aliases: [], kind: 'place', blurb: 'A prehistoric stone circle on Salisbury Plain in Wiltshire, England, raised in stages from around 3000 BC.' },
  { id: 'hagia-sophia', answer: 'Hagia Sophia', aliases: ['Ayasofya', 'Aya Sofya', 'Hagia Sofia', 'Aya Sofia', 'Saint Sophia', 'Sancta Sophia', 'Haghia Sophia'], kind: 'place', blurb: 'Completed in Constantinople in 537 under the emperor Justinian, it was the largest cathedral in the world for nearly a thousand years.' },
  { id: 'machu-picchu', answer: 'Machu Picchu', aliases: ['Machu Pichu', 'Machupicchu'], kind: 'place', blurb: 'A 15th-century Inca citadel on a ridge high in the Andes of Peru, brought to the wider world’s attention in 1911.' },
  { id: 'moai', answer: 'Moai', aliases: ['Easter Island statues', 'Easter Island heads', 'Rapa Nui statues', 'Moai statues', 'Easter Island'], kind: 'place', blurb: 'Monolithic figures carved by the Rapa Nui people of Easter Island, most of them between about 1250 and 1500.' },
  { id: 'taj-mahal', answer: 'Taj Mahal', aliases: ['Taj'], kind: 'place', blurb: 'A white marble mausoleum in Agra, India, commissioned in 1632 by the Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal.' },
  { id: 'sphinx', answer: 'Great Sphinx of Giza', aliases: ['Sphinx', 'Great Sphinx', 'Sphinx of Giza', 'Giza Sphinx'], kind: 'place', blurb: 'Carved from the limestone bedrock of the Giza plateau in Egypt, most likely for the pharaoh Khafre around 2500 BC.' },
  { id: 'golden-gate', answer: 'Golden Gate Bridge', aliases: ['Golden Gate'], kind: 'place', blurb: 'Opened in 1937, it spans the strait between San Francisco Bay and the Pacific Ocean.' },
  { id: 'mont-saint-michel', answer: 'Mont-Saint-Michel', aliases: ['Mont St Michel', 'Mont Saint Michel', 'Le Mont-Saint-Michel', 'Saint Michel'], kind: 'place', blurb: 'A tidal island off the coast of Normandy, France, crowned by a medieval abbey.' },
  { id: 'neuschwanstein', answer: 'Neuschwanstein Castle', aliases: ['Neuschwanstein', 'Schloss Neuschwanstein'], kind: 'place', blurb: 'A 19th-century palace in the Bavarian Alps, begun in 1869 for King Ludwig II of Bavaria.' },
  { id: 'petra', answer: 'Petra', aliases: ['Al-Khazneh', 'Al Khazneh', 'Khazneh', 'Treasury at Petra', 'Petra Treasury'], kind: 'place', blurb: 'Al-Khazneh, the Treasury, carved into rose-red sandstone cliffs by the Nabataeans in what is now Jordan around the 1st century AD.' },
  { id: 'angkor-wat', answer: 'Angkor Wat', aliases: ['Angkor', 'Angkor Vat'], kind: 'place', blurb: 'A 12th-century temple complex in Cambodia, built for King Suryavarman II and the largest religious monument in the world.' },
  { id: 'pisa', answer: 'Leaning Tower of Pisa', aliases: ['Tower of Pisa', 'Pisa Tower', 'Leaning Tower', 'Torre di Pisa', 'Pisa'], kind: 'place', blurb: 'The bell tower of Pisa Cathedral in Italy began to lean while it was still being built, in the 12th century.' },
  { id: 'colosseum', answer: 'Colosseum', aliases: ['Coliseum', 'Colosseo', 'Flavian Amphitheatre', 'Flavian Amphitheater', 'Roman Colosseum'], kind: 'place', blurb: 'Completed in AD 80, Rome’s great amphitheatre is thought to have held between 50,000 and 80,000 spectators.' },
  { id: 'giants-causeway', answer: 'Giant’s Causeway', aliases: ['Giants Causeway', 'Giant Causeway'], kind: 'nature', blurb: 'About 40,000 interlocking basalt columns on the coast of County Antrim, Northern Ireland, left by an ancient volcanic eruption.' },
  { id: 'rosetta-stone', answer: 'Rosetta Stone', aliases: ['Rosetta'], kind: 'object', blurb: 'A stone slab from 196 BC carrying one decree in three scripts. It became the key to reading Egyptian hieroglyphs.' },
  { id: 'enigma', answer: 'Enigma machine', aliases: ['Enigma', 'Enigma cipher machine', 'Enigma code machine'], kind: 'object', blurb: 'The German cipher machine of the Second World War, whose messages were broken at Bletchley Park.' },
  { id: 'saturn-v', answer: 'Saturn V', aliases: ['Saturn 5', 'Saturn five', 'Saturn rocket', 'Apollo 11', 'Apollo 11 launch'], kind: 'space', blurb: 'The rocket that carried the Apollo astronauts to the Moon, still one of the most powerful ever flown.' },
  { id: 'earthrise', answer: 'Earthrise', aliases: ['Earth rise', 'Earthrise photo', 'Apollo 8'], kind: 'space', blurb: 'Taken by astronaut William Anders on Christmas Eve 1968, from Apollo 8 in orbit around the Moon.' },
  { id: 'pillars-of-creation', answer: 'Pillars of Creation', aliases: ['Eagle Nebula', 'Pillars of Creation nebula', 'Eagle Nebula pillars'], kind: 'space', blurb: 'Columns of gas and dust in the Eagle Nebula, thousands of light years away, made famous by the Hubble Space Telescope.' },
  { id: 'penny-farthing', answer: 'Penny-farthing', aliases: ['Penny farthing', 'High wheeler', 'High-wheel bicycle', 'Ordinary bicycle', 'Penny farthing bicycle'], kind: 'object', blurb: 'The high-wheeled bicycle of the 1870s and 1880s: the bigger the front wheel, the further each turn of the pedals went.' },
  { id: 'gramophone', answer: 'Gramophone', aliases: ['Phonograph', 'Record player', 'Victrola', 'Graphophone'], kind: 'object', blurb: 'Patented by Emile Berliner in 1887, it played flat discs instead of the cylinders of Edison’s phonograph.' },
  { id: 'abacus', answer: 'Abacus', aliases: ['Counting frame', 'Soroban', 'Suanpan'], kind: 'object', blurb: 'A frame of beads on rods, used for arithmetic for thousands of years and still taught in parts of Asia.' },
  { id: 'axolotl', answer: 'Axolotl', aliases: ['Mexican walking fish', 'Axolotyl'], kind: 'nature', blurb: 'A salamander from the lakes of Mexico City that keeps its gills and larval body for life, and can regrow lost limbs.' },
  { id: 'pangolin', answer: 'Pangolin', aliases: ['Scaly anteater'], kind: 'nature', blurb: 'The only mammals covered in scales. When threatened, they roll up into a ball.' },
  { id: 'shoebill', answer: 'Shoebill', aliases: ['Shoebill stork', 'Whalehead', 'Whale-headed stork', 'Shoe-billed stork'], kind: 'nature', blurb: 'A huge bird of the swamps of East Africa, named for its shoe-shaped bill.' },
  { id: 'narwhal', answer: 'Narwhal', aliases: ['Narwhale'], kind: 'nature', blurb: 'An Arctic whale. The males grow a long spiral tusk, which is really a tooth.' },
  { id: 'mount-fuji', answer: 'Mount Fuji', aliases: ['Fuji', 'Mt Fuji', 'Fujisan', 'Fuji-san', 'Fujiyama', 'Fuji yama'], kind: 'nature', blurb: 'Japan’s highest mountain at 3,776 metres, an active volcano that last erupted in 1707.' },
  { id: 'aurora', answer: 'Aurora borealis', aliases: ['Northern lights', 'Aurora', 'Polar lights', 'Aurora australis', 'Southern lights', 'Auroras'], kind: 'nature', blurb: 'Light in the polar sky, made when charged particles from the Sun strike the upper atmosphere.' },
  { id: 'venus-flytrap', answer: 'Venus flytrap', aliases: ['Venus fly trap', 'Flytrap', 'Fly trap', 'Dionaea'], kind: 'nature', blurb: 'A carnivorous plant that grows wild only in the wetlands of North and South Carolina. Its leaves snap shut on insects.' },
  { id: 'ada-lovelace', answer: 'Ada Lovelace', aliases: ['Lovelace', 'Ada King', 'Augusta Ada King', 'Countess of Lovelace', 'Ada Byron'], kind: 'person', blurb: 'A mathematician who in 1843 published what is often called the first computer program, for Charles Babbage’s Analytical Engine.' },
  { id: 'lincoln', answer: 'Abraham Lincoln', aliases: ['Lincoln', 'Abe Lincoln', 'President Lincoln'], kind: 'person', blurb: 'The 16th President of the United States, who led the Union through the Civil War and was assassinated in 1865.' },
  { id: 'darwin', answer: 'Charles Darwin', aliases: ['Darwin'], kind: 'person', blurb: 'The naturalist whose 1859 book On the Origin of Species set out the theory of evolution by natural selection.' },
  { id: 'marie-curie', answer: 'Marie Curie', aliases: ['Curie', 'Madame Curie', 'Marie Sklodowska-Curie', 'Maria Sklodowska'], kind: 'person', blurb: 'The first person to win two Nobel Prizes, in physics in 1903 and chemistry in 1911, for her work on radioactivity.' },
  { id: 'brunel', answer: 'Isambard Kingdom Brunel', aliases: ['Brunel', 'IK Brunel', 'Isambard Brunel'], kind: 'person', blurb: 'The Victorian engineer of the Great Western Railway, photographed in 1857 in front of the launching chains of his ship the Great Eastern.' },
  { id: 'great-wave', answer: 'The Great Wave off Kanagawa', aliases: ['Great Wave', 'The Great Wave', 'Wave off Kanagawa', 'Under the Wave off Kanagawa', 'Great Wave of Kanagawa', 'Hokusai'], kind: 'artwork', blurb: 'A woodblock print by Katsushika Hokusai, published around 1831 in his series Thirty-six Views of Mount Fuji.' },
  { id: 'mona-lisa', answer: 'Mona Lisa', aliases: ['La Gioconda', 'La Joconde', 'Gioconda', 'Monalisa'], kind: 'artwork', blurb: 'Leonardo da Vinci’s portrait of Lisa Gherardini, begun around 1503 and now in the Louvre, Paris.' },
  { id: 'hubble', answer: 'Hubble Space Telescope', aliases: ['Hubble', 'Hubble Telescope', 'HST'], kind: 'space', blurb: 'Launched in 1990 and repaired and upgraded by astronauts five times, it orbits about 540 kilometres above the Earth.' },
  { id: 'cutty-sark', answer: 'Cutty Sark', aliases: ['The Cutty Sark'], kind: 'object', blurb: 'A British tea clipper launched in 1869, one of the fastest sailing ships of her time, now preserved at Greenwich in London.' },
];

interface Credit {
  file: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
}

const credits = CREDITS as Record<string, Credit>;

/** Only images that passed the licence check and were downloaded are ever used. */
export const IMAGES: DailyImage[] = EDITORIAL.filter((e) => credits[e.id]).map((e) => {
  const c = credits[e.id];
  return {
    ...e,
    src: `/daily/${c.file}`,
    width: c.width,
    height: c.height,
    credit: { author: c.author, license: c.license, licenseUrl: c.licenseUrl, source: c.source },
  };
});

/** Every editorial entry, including any whose photograph has not been fetched yet (for the admin tools and tests). */
export const IMAGE_EDITORIAL = EDITORIAL;
