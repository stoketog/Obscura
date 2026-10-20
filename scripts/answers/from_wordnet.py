#!/usr/bin/env python3
"""
Write answer lists from Princeton WordNet into scripts/answers/lists/<prompt-id>.wordnet.txt (then run build.py).

    python3 scripts/answers/from_wordnet.py              # every prompt in SPECS
    python3 scripts/answers/from_wordnet.py mammal fish  # just these
    python3 scripts/answers/from_wordnet.py --show bird.n.01   # explore: a synset's hyponyms with their sizes

WordNet 3.0 (Princeton University, https://wordnet.princeton.edu) is a curated English dictionary that files every
noun under the kinds of thing it is: every "kind of bird", every "kind of hat", and named instances such as every
philosopher or lake it knows. Its licence allows commercial use with the copyright notice kept (see the README).
Data: the NLTK packaging (raw.githubusercontent.com/nltk/nltk_data, corpora/wordnet.zip) in ~/nltk_data.

For each prompt, every synset under its roots becomes one answer: the first lemma is the name, the other lemmas are
accepted spellings. Left out: subtrees in `skip` (e.g. young or female animals), group labels (a synset with kinds
under it whose name ends in the category word: "bird of prey", "game bird"), scientific binomials as spellings,
and anything in `drop`. Everything is still checked by build.py against what the prompt already accepts.
"""
import os, re, sys
from nltk.corpus import wordnet as wn
from wordfreq import zipf_frequency

HERE = os.path.dirname(os.path.abspath(__file__))
LISTS = os.path.join(HERE, 'lists')

# roots: synsets whose whole subtree is in. instances: also take named instances (people, places).
# heads: words that, ending a name with kinds under it, mark a group label rather than one thing.
# skip: synsets whose whole subtree is left out. drop: names (lower case) left out.
SPECS = {
    'mammal': dict(roots=['mammal.n.01'], heads=['mammal', 'animal', 'carnivore', 'herbivore', 'primate', 'rodent', 'ungulate', 'placental', 'marsupial', 'cetacean', 'bovid', 'ruminant', 'equine', 'feline', 'canine', 'monkey', 'ape', 'bat', 'whale', 'dolphin', 'deer', 'cattle', 'sheep', 'goat', 'pig', 'dog', 'cat', 'horse'],
                   skip=['young_mammal.n.01', 'female_mammal.n.01', 'pup.n.01', 'dog.n.01', 'domestic_cat.n.01', 'horse.n.01', 'cattle.n.01', 'domestic_sheep.n.01', 'pet.n.01', 'stray.n.01', 'homo.n.02', 'tusker.n.01', 'pachyderm.n.01', 'game.n.04'],
                   extra_roots=['dog.n.01:self', 'domestic_cat.n.01:self', 'horse.n.01:self', 'cattle.n.01:self', 'domestic_sheep.n.01:self']),
    'fish': dict(roots=['fish.n.01'], heads=['fish', 'food fish', 'game fish', 'teleost', 'ganoid', 'shark', 'ray', 'eel'],
                 skip=['young_fish.n.01', 'fingerling.n.01', 'fry.n.01', 'mouthbreeder.n.01']),
    'bug': dict(roots=['insect.n.01', 'arachnid.n.01', 'myriapod.n.01', 'worm.n.01', 'woodlouse.n.01', 'slug.n.07', 'snail.n.01'], heads=['insect', 'arachnid', 'bug', 'beetle', 'fly', 'moth', 'butterfly', 'wasp', 'bee', 'ant', 'spider', 'mite', 'tick', 'worm', 'cricket', 'grasshopper'],
                skip=['larva.n.01', 'nymph.n.04', 'pupa.n.01', 'imago.n.02', 'queen.n.09', 'drone.n.01', 'worker.n.03', 'soldier.n.03', 'pest.n.04', 'social_insect.n.01', 'parasitic_worm.n.01']),
    'reptile-amphibian': dict(roots=['reptile.n.01', 'amphibian.n.03'], heads=['reptile', 'amphibian', 'lizard', 'snake', 'turtle', 'tortoise', 'frog', 'toad', 'salamander', 'newt', 'dinosaur', 'crocodilian', 'saurian'],
                              skip=['dinosaur.n.01', 'archosaur.n.01:keep-self', 'pterosaur.n.01', 'ichthyosaur.n.01', 'plesiosaur.n.01', 'synapsid.n.01', 'tadpole.n.01']),
    'sea-creature': dict(roots=['mollusk.n.01', 'crustacean.n.01', 'coelenterate.n.01', 'echinoderm.n.01', 'sponge.n.04', 'cetacean.n.01', 'pinniped_mammal.n.01', 'sea_cow.n.01', 'sea_otter.n.01', 'sea_turtle.n.01', 'sea_snake.n.01', 'tunicate.n.01', 'ctenophore.n.01', 'sea_slug.n.01', 'polychaete.n.01', 'horseshoe_crab.n.01', 'brachiopod.n.01', 'bryozoan.n.01', 'marine_iguana.n.01'],
                         heads=['mollusk', 'mollusc', 'crustacean', 'coelenterate', 'echinoderm', 'cetacean', 'whale', 'dolphin', 'seal', 'clam', 'snail', 'crab', 'shrimp', 'prawn', 'anemone', 'jellyfish', 'coral', 'sponge', 'gastropod', 'bivalve', 'cephalopod'],
                         skip=['snail.n.01', 'slug.n.07', 'garden_snail.n.01', 'edible_snail.n.01', 'freshwater_mussel.n.01', 'crayfish.n.03', 'woodlouse.n.01', 'branchiopod_crustacean.n.01', 'ostracod.n.01', 'copepod.n.01', 'water_flea.n.01', 'brine_shrimp.n.01', 'fairy_shrimp.n.01', 'tadpole_shrimp.n.01', 'isopod.n.01', 'pill_bug.n.01', 'sow_bug.n.01', 'hydra.n.03', 'pond_snail.n.01', 'land_snail.n.01']),
    'tree': dict(roots=['tree.n.01'], heads=['tree', 'shrub', 'conifer', 'palm', 'bush', 'evergreen', 'hardwood', 'softwood', 'timber tree', 'fruit tree', 'shade tree', 'angiospermous tree', 'gymnospermous tree', 'nut tree'],
                 skip=['bonsai.n.01', 'sapling.n.01', 'pollard.n.01', 'treelet.n.01', 'shade_tree.n.01', 'timber_tree.n.01']),
    'flower': dict(roots=['flower.n.01', 'bulbous_plant.n.01', 'orchid.n.01', 'wildflower.n.01'], heads=['flower', 'wildflower', 'wild flower', 'orchid', 'lily', 'plant', 'bulbous plant', 'herb', 'composite'],
                   skip=['bloomer.n.01', 'ornamental.n.01', 'flower_bud.n.01']),
    'fruit': dict(drop=['melon ball', 'windfall', 'acinus', 'drupelet', 'black olive', 'green olive'], roots=['edible_fruit.n.01', 'berry.n.01', 'citrus.n.01', 'melon.n.01', 'drupe.n.01', 'pome.n.01'], heads=['fruit', 'edible fruit', 'berry', 'citrus', 'citrus fruit', 'melon', 'drupe', 'pome', 'apple', 'pear', 'plum', 'cherry', 'grape', 'banana', 'orange'],
                  skip=['crab_apple.n.03:keep', 'eating_apple.n.01:keep-self', 'cooking_apple.n.01:keep-self', 'dried_fruit.n.01:keep-self', 'windfall.n.02', 'seed.n.02', 'nut.n.01', 'edible_nut.n.01', 'vegetable.n.01']),
    'spice': dict(excl_def=r'\b(tea|teas|beverage|infusion)\b', drop=['caraway seed', 'fennel seed', 'tea', 'tea bag', 'black tea', 'green tea', 'oolong', 'darjeeling', 'hyson', 'souchong', 'congou', 'orange pekoe', 'stick cinnamon'], roots=['herb.n.02', 'spice.n.02', 'herb.n.01:none'], heads=['herb', 'spice', 'flavorer', 'seasoning', 'condiment'],
                  skip=['sauce.n.01', 'condiment.n.01', 'salt.n.02', 'sugar.n.01', 'vinegar.n.01', 'sweetening.n.01', 'flavorer.n.01:self', 'extract.n.02', 'stock.n.01', 'pickle.n.01', 'relish.n.01']),
    'bread': dict(drop=['crouton', 'wafer', 'shortcake', 'melba toast', 'rusk'], roots=['bread.n.01', 'roll.n.04', 'flatbread.n.01', 'quick_bread.n.01', 'bun.n.01', 'cracker.n.01:keep-self'], heads=['bread', 'roll', 'bun', 'loaf', 'flatbread', 'quick bread'],
                  skip=['breadcrumb.n.01', 'crumb.n.03', 'crust.n.02', 'heel.n.05', 'toast.n.01', 'stuffing.n.01', 'cracker.n.01', 'bread_dough.n.01', 'sop.n.03']),
    'cheese': dict(roots=['cheese.n.01'], heads=['cheese'], skip=['cheese_spread.n.01', 'processed_cheese.n.01', 'pot_cheese.n.01:keep-self']),
    'clothing': dict(drop=['blue', 'sack', 'lounger', 'street clothes', 'ready-to-wear', 'neckpiece', 'slops', 'burberry'], roots=['garment.n.01', 'clothing.n.01:children', 'undergarment.n.01', 'nightwear.n.01', 'outerwear.n.01', 'neckwear.n.01', 'hosiery.n.01', 'swimsuit.n.01', 'glove.n.02', 'scarf.n.01', 'belt.n.02'], heads=['garment', 'clothing', 'clothes', 'wear', 'attire', 'apparel', 'dress', 'costume'],
                     skip=['footwear.n.01', 'footwear.n.02', 'headdress.n.01', 'hat.n.01', 'protective_garment.n.01:keep-self', 'vestment.n.01:keep', 'military_uniform.n.01:keep-self', 'mufti.n.02', 'civilian_clothing.n.01', 'drag.n.05', 'array.n.03', 'wardrobe.n.03', 'outfit.n.01', 'ensemble.n.01', 'finery.n.01', 'garb.n.01', 'motley.n.02', 'clothes.n.01', 'workwear.n.01', 'sportswear.n.01', 'leisure_wear.n.01', 'menswear.n.01', 'womenswear.n.01', 'babywear.n.01']),
    'hat': dict(roots=['hat.n.01', 'headdress.n.01', 'cap.n.01', 'helmet.n.02', 'bonnet.n.01'], heads=['hat', 'headdress', 'headgear', 'cap', 'helmet', 'bonnet', 'headwear'],
                skip=['hairdressing.n.01', 'hairpiece.n.01', 'wig.n.01', 'hairnet.n.01', 'headband.n.01:keep-self', 'hair_slide.n.01', 'hairpin.n.01', 'comb.n.01']),
    'shoe': dict(roots=['footwear.n.02', 'footwear.n.01', 'shoe.n.01', 'boot.n.01', 'sandal.n.01', 'slipper.n.01'], heads=['shoe', 'footwear', 'boot', 'sandal', 'slipper'],
                 skip=['hosiery.n.01', 'stocking.n.01', 'sock.n.01', 'gaiter.n.01:keep-self', 'overshoe.n.01:keep-self', 'patten.n.01:keep-self', 'shoe.n.02', 'horseshoe.n.02']),
    'tool': dict(drop=['plexor', 'catling', 'latchstring', 'crank handle', 'cap opener', 'carving knife', 'parang', 'bolo', 'pruning saw', 'hand shovel', 'sawmill', 'letter opener', 'pitchfork', 'lancet', 'loft', 'hayloft'], excl_def=r'\b(garden|gardening|farm|farming|agricultur\w*|surg\w*|dentist\w*|medical|kitchen|food|hair|letters?|envelopes?|hay|soil|weeds?|crops?|harvest\w*|logging|logs|lumber|mill|floor|building|machete|sword|weapons?|nautical|sails?|ropes?|leather|shoemak\w*|bookbind\w*|knitting|sewing|embroider\w*|grass|lawn|turf|hedges?|plow|plough|horses?|livestock|cattle|fish|whal\w*|ice|snow)\b', roots=['hand_tool.n.01', 'edge_tool.n.01', 'drill.n.01', 'saw.n.02', 'wrench.n.03', 'hammer.n.02', 'screwdriver.n.01', 'pliers.n.01', 'chisel.n.01', 'file.n.04', 'plane.n.05', 'clamp.n.01', 'vise.n.01', "carpenter's_level.n.01", 'rule.n.12', 'awl.n.01', 'punch.n.03', 'tape.n.04', 'mallet.n.03', 'pincer.n.01', 'auger.n.02', 'router.n.03', 'soldering_iron.n.01', 'power_tool.n.01', 'trowel.n.01'], heads=['tool', 'hand tool', 'edge tool', 'power tool'],
                 skip=['garden_tool.n.01', 'kitchen_utensil.n.01', 'cutlery.n.02', 'knife.n.02', 'weapon.n.01', 'scalpel.n.01', 'razor.n.01', 'shaver.n.01', 'scissors.n.01', 'shears.n.01', 'axe.n.01:keep-self']),
    'vehicle': dict(drop=['smoker', 'nonsmoker', 'serving cart', 'pilot engine', 'trap', 'wreck', 'cruiser'], roots=['vehicle.n.01'], heads=['vehicle', 'conveyance', 'craft', 'transport'],
                    skip=['bumper_car.n.01', 'hearse.n.01:keep-self', 'rocket.n.01', 'missile.n.01', 'spacecraft.n.01:keep-self', 'skibob.n.01:keep-self', 'military_vehicle.n.01:keep-self', 'wreck.n.04', 'craft.n.02:keep-self', 'drone.n.04:keep-self', 'skateboard.n.01:keep-self', 'scooter.n.03:keep-self']),
    'furniture': dict(drop=['toolbox', 'minibar', 'lawn furniture', 'lamp', 'reading lamp', 'card index', 'rolodex', 'vertical file', 'platen', 'milk bar', 'sushi bar', 'meat counter', 'deathbed', 'fitment', 'altar', 'shoofly'], excl_def=r'\b(lamps?|light|lighting|illuminat\w*|filing|index|counter|bar|mattress|printing|typewriter|altar|church|tombs?|coffin)\b', roots=['furniture.n.01', 'seat.n.03', 'table.n.02', 'bed.n.01', 'cabinet.n.01', 'chest.n.02', 'desk.n.01', 'sofa.n.01', 'stool.n.01', 'shelf.n.01', 'bookcase.n.01', 'wardrobe.n.01', 'sideboard.n.01', 'bench.n.01'], heads=['furniture', 'piece of furniture', 'seat', 'table', 'bed', 'cabinet', 'chest', 'chair', 'sofa', 'stool', 'case', 'furnishing'],
                      skip=['car_seat.n.01', 'saddle.n.01', 'pillion.n.01', 'toilet_seat.n.01', 'potty_seat.n.01', 'ejection_seat.n.01', 'box.n.08', 'seat.n.04', 'flat_bench.n.01', 'bench_press.n.01', 'workbench.n.01:keep-self', 'operating_table.n.01:keep-self', 'gaming_table.n.01:keep-self']),
    'fabric': dict(drop=['string', 'panting', 'spark arrester', 'vamp', 'beaver', 'raccoon', 'sable', 'aba'], roots=['fabric.n.01', 'leather.n.01', 'fur.n.01', 'yarn.n.01:self', 'fiber.n.01:children'], heads=['fabric', 'cloth', 'material', 'textile', 'leather', 'fur'],
                   skip=['animal_fiber.n.01:keep-self', 'fiber_optic_cable.n.01', 'nerve_fiber.n.01', 'muscle_fiber.n.01', 'dietary_fiber.n.01', 'optical_fiber.n.01', 'wire.n.01', 'filament.n.01', 'sliver.n.02', 'roving.n.02', 'strand.n.05', 'ply.n.02', 'tatter.n.01', 'remnant.n.02', 'scrap.n.02', 'swatch.n.01', 'piece_of_cloth.n.01', 'shoddy.n.01']),
    'instrument': dict(roots=['musical_instrument.n.01'], heads=['instrument', 'musical instrument', 'wind instrument', 'stringed instrument', 'percussion instrument', 'keyboard instrument', 'brass', 'woodwind'],
                       skip=['beater.n.03', 'mute.n.01', 'bow.n.03', 'pick.n.05', 'plectrum.n.01', 'drumstick.n.02', 'mallet.n.01', 'reed.n.03', 'mouthpiece.n.07', 'bridge.n.07', 'fret.n.01', 'key.n.10', 'pedal.n.01', 'stop.n.11', 'register.n.04']),
    'disease': dict(roots=['disease.n.01', 'disorder.n.01', 'syndrome.n.01', 'infection.n.01', 'cancer.n.01', 'mental_disorder.n.01', 'skin_disease.n.01', 'condition.n.01:none'], heads=['disease', 'disorder', 'syndrome', 'infection', 'illness', 'condition', 'ailment', 'malady'],
                    skip=['plant_disease.n.01', 'animal_disease.n.01:keep-self', 'blight.n.01', 'rot.n.03', 'rust.n.04', 'smut.n.04', 'mildew.n.01', 'wilt.n.01', 'scab.n.02', 'canker.n.01', 'leaf_spot.n.01', 'mosaic.n.03', 'damping_off.n.01', 'sick_building_syndrome.n.01:keep-self']),
    'language': dict(group_min=3, group_zipf=4.0, roots=['natural_language.n.01'], heads=['language', 'tongue', 'dialect', 'creole', 'pidgin'],
                     skip=['artificial_language.n.01:keep', 'sign_language.n.01:keep', 'mother_tongue.n.01', 'first_language.n.01', 'second_language.n.01', 'source_language.n.01', 'target_language.n.01', 'object_language.n.01', 'metalanguage.n.01', 'lingua_franca.n.01:keep-self', 'vernacular.n.01', 'dead_language.n.01', 'slang.n.02', 'argot.n.01', 'cant.n.01', 'jargon.n.01', 'patois.n.01', 'superstrate.n.01', 'substrate.n.01', 'interlanguage.n.01']),
    'unit': dict(drop=['head', 'mass number', 'stp', 'set point', 'match point', 'point after', 'game point', 'break point', 'degree day'], excl_def=r'\b(tennis|game|sports?|football|scores?|scoring|golf|cricket|baseball|basketball)\b', roots=['unit_of_measurement.n.01'], heads=['unit', 'measure', 'unit of measurement'],
                 skip=['monetary_unit.n.01', 'information_unit.n.01:keep', ]),
    'currency': dict(roots=['monetary_unit.n.01'], heads=['monetary unit', 'currency', 'money', 'coin'],
                     skip=['fractional_monetary_unit.n.01:keep', 'cent.n.01:keep-self', 'subunit.n.01']),
    'colour': dict(roots=['chromatic_color.n.01', 'achromatic_color.n.01', 'color.n.01:children'], heads=['color', 'colour', 'hue', 'shade', 'tint', 'chromatic color'],
                   skip=['complexion.n.01', 'skin_color.n.01', 'primary_color.n.01', 'heather_mixture.n.01', 'mottle.n.01', 'pastel.n.01', 'tincture.n.03', 'chromatic_color.n.01:self', 'achromatic_color.n.01:self', 'complementary_color.n.01', 'colouration.n.02', 'coloring.n.01', 'shade.n.03', 'tint.n.02']),
    'bone': dict(roots=['bone.n.01'], heads=['bone'],
                 skip=['long_bone.n.01:keep', 'short_bone.n.01:keep', 'flat_bone.n.01:keep', 'sesamoid_bone.n.01:keep-self', 'wishbone.n.02', 'funny_bone.n.01', 'fishbone.n.01', 'whalebone.n.01', 'cuttlebone.n.01', 'horn.n.03', 'antler.n.01', 'ivory.n.01', 'pastern.n.01', 'cannon_bone.n.01', 'coffin_bone.n.01', 'os_penis.n.01', 'marrowbone.n.01', 'knucklebone.n.01', 'jawbone.n.01:keep-self', 'chine.n.01', 'pin_bone.n.01']),
    'body-part': dict(drop=['cobblers', 'trotter', 'taret organ', 'nucleolus', 'vital organ', 'hindfoot', 'naked eye', 'hooks', 'male internal reproductive organ', 'female internal reproductive organ', 'male external reproductive organ', 'female external reproductive organ', 'roman nose', 'lantern jaw', 'pug nose', 'hooknose', 'snub nose', 'aquiline nose', 'conk', 'beak', 'hooter', 'schnoz', 'honker', 'sucker'], excl_def=r'\b(bird|birds|fish|fishes|insect|insects|animal|animals|mammal|mammals|ruminant|ruminants|crustacean|mollusk|mollusks|reptile|reptiles|invertebrate|invertebrates|worm|worms|plant|plants|horse|horses|cattle|arthropod|arthropods|echinoderm|cephalopod|amphibian|tadpole|larva|vertebrates other than|in some animals|of an animal|of animals|of a bird)\b', roots=['organ.n.01', 'external_body_part.n.01', 'gland.n.01', 'muscle.n.01', 'artery.n.01', 'vein.n.01', 'nerve.n.01', 'joint.n.01', 'ligament.n.01', 'tendon.n.01', 'cartilage.n.01', 'membrane.n.01'], heads=['organ', 'body part', 'part', 'gland', 'muscle', 'artery', 'vein', 'nerve', 'joint', 'ligament', 'tendon', 'membrane', 'tissue'],
                      skip=['plant_organ.n.01', 'sense_organ.n.01:keep', 'reproductive_organ.n.01:keep', 'vestigial_organ.n.01', 'electric_organ.n.01', 'tentacle.n.01', 'wing.n.03', 'fin.n.03', 'feather.n.01', 'beak.n.01', 'tail.n.01', 'hoof.n.01', 'claw.n.01', 'horn.n.03', 'gill.n.02', 'swim_bladder.n.01', 'crop.n.04', 'gizzard.n.01', 'udder.n.01', 'mammary_gland.n.01:keep-self', 'antenna.n.03', 'proboscis.n.01', 'trunk.n.06', 'paw.n.01', 'snout.n.01', 'muzzle.n.04', 'mane.n.01', 'withers.n.01', 'flank.n.03', 'haunch.n.01', 'hock.n.02', 'fetlock.n.01', 'dewlap.n.01', 'wattle.n.04', 'plant_membrane.n.01', 'cell_membrane.n.01', 'nuclear_membrane.n.01', 'semipermeable_membrane.n.01', 'synthetic_muscle.n.01']),
    'kitchen-item': dict(drop=['hunting knife', 'surgical knife', 'beaker'], excl_def=r'\b(surg\w*|hunting|laborator\w*|chemist\w*|scientific|weapons?|church|liturg\w*)\b', roots=['kitchen_utensil.n.01', 'kitchen_appliance.n.01', 'cooking_utensil.n.01', 'crockery.n.01', 'cutlery.n.02', 'tableware.n.01', 'pot.n.01', 'pan.n.01', 'container.n.01:none', 'dish.n.01', 'bowl.n.03', 'cup.n.01', 'glass.n.02', 'spoon.n.01', 'knife.n.01', 'fork.n.01', 'ladle.n.01', 'sieve.n.01', 'grater.n.01', 'whisk.n.01'], heads=['utensil', 'kitchen utensil', 'appliance', 'kitchen appliance', 'crockery', 'tableware', 'cutlery', 'dish', 'container', 'vessel'],
                         skip=['flatware.n.01:keep-self', 'chamber_pot.n.01', 'flowerpot.n.01', 'pot.n.04', 'crucible.n.01', 'bedpan.n.01', 'dustpan.n.01', 'pan.n.02', 'panhandle.n.01', 'drip_pan.n.01', 'evaporating_dish.n.01', 'petri_dish.n.01', 'ashtray.n.01', 'soap_dish.n.01', 'trophy.n.01', 'loving_cup.n.01', 'grail.n.01', 'chalice.n.01', 'pyx.n.01', 'eyecup.n.01', 'magnifying_glass.n.01', 'hand_glass.n.01', 'spyglass.n.01', 'hourglass.n.01', 'sandglass.n.01']),
    'gemstone': dict(roots=['gem.n.02', 'transparent_gem.n.01', 'opaque_gem.n.01', 'mineral.n.01'], heads=['gem', 'gemstone', 'mineral', 'stone', 'ore'],
                     skip=['ore.n.01:keep', 'mineral_oil.n.01', 'mineral_water.n.01', 'mineral_wool.n.01', 'rock.n.02', 'clay.n.01:keep-self', 'sand.n.01', 'soil.n.02', 'gravel.n.01', 'asphalt.n.01', 'bitumen.n.01', 'coal.n.01:keep-self', 'peat.n.01', 'petroleum.n.01', 'natural_gas.n.01', 'brine.n.01', 'salt.n.03']),
    'dance': dict(roots=['dancing.n.01', 'social_dancing.n.01', 'folk_dancing.n.01', 'ballroom_dancing.n.01', 'stage_dancing.n.01', 'round_dance.n.01', 'square_dance.n.01', 'step_dancing.n.01', 'ballet.n.01'], heads=['dance', 'dancing'],
                  skip=['dance_step.n.01', 'pas.n.01', 'choreography.n.01', 'skank.n.01:keep-self', 'mime.n.01']),
    'mythical': dict(roots=['mythical_monster.n.01', 'imaginary_being.n.01', 'spiritual_being.n.01:none', 'evil_spirit.n.01', 'fairy.n.01', 'monster.n.01', 'giant.n.04', 'dragon.n.02'], heads=['creature', 'monster', 'being', 'spirit', 'imaginary being', 'mythical monster'],
                     skip=['deity.n.01', 'god.n.01', 'goddess.n.01', 'angel.n.01:keep-self', 'saint.n.01', 'ghost.n.01:keep-self', 'monster.n.04', 'freak.n.01', 'giant.n.01', 'giant.n.07', 'mutant.n.01', 'prodigy.n.02', 'abomination.n.03', 'character.n.04', 'fictional_character.n.01', 'hero.n.03', 'mythical_being.n.01:keep-self']),
    'ancient-god': dict(drop=['john the baptist', 'mama', 'taoist trinity', 'titan', 'asura', 'sea nymph', 'sea god', 'igigi', 'anglo-saxon deity', 'bodhisattva', 'hyades', 'faun', 'tuatha de danann', 'minos', 'demogorgon'], excl_def=r'\b(saint|apostle|pope|bishop|king of|kings? who|theologian|martyr|monk|missionary|evangelist|disciple|prophet|patron saint|church|christian|jesuit|founder of|emperor|ruler|legendary king|race of)\b', roots=['deity.n.01', 'god.n.01:children', 'goddess.n.01', 'greek_deity.n.01', 'roman_deity.n.01', 'norse_deity.n.01', 'egyptian_deity.n.01', 'hindu_deity.n.01', 'semitic_deity.n.01', 'celtic_deity.n.01', 'teutonic_deity.n.01', 'anglo-saxon_deity.n.01', 'chinese_deity.n.01', 'japanese_deity.n.01', 'persian_deity.n.01', 'phrygian_deity.n.01', 'babylonian_deity.n.01', 'aztec_deity.n.01', 'inca_deity.n.01', 'maya_deity.n.01', 'pantheon.n.01:none'], instances=True, heads=['deity', 'god', 'goddess', 'divinity'],
                        skip=['idol.n.03', 'avatar.n.02:keep-self', 'demigod.n.01:keep-self', 'earth_god.n.01:self', 'war_god.n.01:self', 'sun_god.n.01:self', 'water_god.n.01:self', 'fire_god.n.01:self', 'goddess.n.01:self', 'god.n.01:self', 'deity.n.01:self', 'lord.n.03', 'allah.n.01', 'jehovah.n.01', 'holy_ghost.n.01', 'son.n.02', 'father.n.03', 'trinity.n.03']),
    'branch-of-science': dict(ology=True),
    # Named people and places (WordNet instances)
    'philosopher': dict(defn=r"\bphilosopher\b"),
    'poet': dict(defn=r"\bpoet(ess)?\b"),
    'novelist': dict(defn=r"\bnovelist\b"),
    'painter': dict(defn=r"\bpainter\b"),
    'inventor': dict(defn=r"\binventor\b"),
    'explorer': dict(defn=r"\b(explorer|navigator|circumnavigat)"),
    'scientist': dict(defn=r"\b(physicist|chemist|biologist|astronomer|mathematician|geologist|botanist|zoologist|naturalist|physiologist|bacteriologist|geneticist|biochemist|pathologist|psychologist|neurologist|anatomist|entomologist|ornithologist|paleontologist|meteorologist|oceanographer|astrophysicist|crystallographer|embryologist|microbiologist|virologist|immunologist|scientist)\b"),
    'film-director': dict(defn=r"\b(film ?maker|film director|filmmaker|motion[- ]picture director|director of films)"),
    'actress': dict(defn=r"\bactress\b"),
    'lake': dict(roots=['lake.n.01', 'loch.n.01', 'reservoir.n.02'], instances=True, only_instances=True),
    'mountain': dict(roots=['mountain.n.01', 'volcano.n.02', 'peak.n.04', 'hill.n.01:none', 'mountain_peak.n.01'], instances=True, only_instances=True),
    'desert': dict(roots=['desert.n.01'], instances=True, only_instances=True),
    'sea-or-ocean': dict(roots=['sea.n.01', 'ocean.n.01', 'gulf.n.01:none', 'bay.n.01:none'], instances=True, only_instances=True),
    'battle': dict(roots=['battle.n.01', 'siege.n.01', 'naval_battle.n.01', 'pitched_battle.n.01', 'engagement.n.03'], instances=True, only_instances=True),
    'empire': dict(roots=['empire.n.01', 'empire.n.02', 'kingdom.n.02:none', 'dynasty.n.01:none'], instances=True, only_instances=True),
    'composer': dict(defn=r"\bcomposer\b"),
}


# Never offered as answers: vulgar, offensive or slang senses.
BAD_USAGE = {'vulgarism', 'obscenity', 'ethnic_slur', 'disparagement', 'slang', 'derogation', 'profanity'}
# Vulgar words, never an answer whatever WordNet files them under (the usage tags miss some).
BAD_WORDS = re.compile(r'\b(cunt|twat|fuck\w*|shit\w*|wank\w*|bollocks?|tits?|titty|titties|boobs?|knockers?|schlong|pecker|prick|dong|minge|fanny|arse\w*|asshole|jism|spunk|cock|dick|pussy|todger|knob|willy|johnson|nooky|bazooka|jugs|nuts|balls|bum|butt|rump|keister|tail|tush)\b', re.I)
BAD_WORD_PROMPTS = {'body-part', 'disease', 'clothing', 'colour', 'language'}

# Two-word group labels named by an adjective ("Myrtaceous tree", "Fissiped mammal", "Percoid fish").
ADJ_GROUP = re.compile(r'^[A-Z][a-z-]+(aceous|oid|ine|ian|id|ate|ous|ped|odont) (tree|shrub|plant|mammal|fish|bird|insect|herb|bug|reptile|lizard|snake|frog|vine|fern|mollusk|crustacean)$')


def zipf(s):
    return zipf_frequency(s, 'en')


def bad_usage(s):
    return any(d.name().split('.')[0] in BAD_USAGE for d in s.usage_domains())


def descendants(s):
    return len(list(s.closure(lambda x: x.hyponyms())))


def nice(lemma):
    s = lemma.replace('_', ' ')
    return s[0].upper() + s[1:] if s and s[0].islower() else s


def is_binomial(lemma):
    parts = lemma.split('_')
    return len(parts) == 2 and parts[0][:1].isupper() and parts[1].islower() and bool(wn.synsets('genus_' + parts[0]))


def tree(root_spec, instances):
    """Synsets under a root. 'x:self' = just x; 'x:children' = x's direct kinds and everything under them, not x;
    'x:none' = nothing (placeholder kept for documentation); 'x:keep-self'/'x:keep' only matter in skip."""
    name, _, mode = root_spec.partition(':')
    try:
        s = wn.synset(name)
    except Exception:
        print(f'  ! no synset {name}', file=sys.stderr)
        return set()
    if mode == 'none':
        return set()
    if mode == 'self':
        return {s}
    rel = (lambda x: x.hyponyms() + x.instance_hyponyms()) if instances else (lambda x: x.hyponyms())
    got = set(s.closure(rel))
    if mode != 'children':
        got.add(s)
    return got


def skipped(spec, instances):
    """Synsets to leave out. 'x' = x and all under it; 'x:self' = x only; 'x:keep-self' = everything under x but not
    x itself; 'x:keep' = nothing (documents a subtree deliberately kept)."""
    out = set()
    for sk in spec.get('skip', []):
        name, _, mode = sk.partition(':')
        if mode == 'keep':
            continue
        try:
            s = wn.synset(name)
        except Exception:
            print(f'  ! no synset {name}', file=sys.stderr)
            continue
        if mode == 'self':
            out.add(s)
            continue
        sub = set(s.closure(lambda x: x.hyponyms() + x.instance_hyponyms()))
        if mode == 'keep-self':
            out |= sub
        else:
            out |= sub | {s}
    return out


def entries_for(pid, spec):
    if spec.get('ology'):
        seen = {}
        for s in wn.all_synsets('n'):
            for l in s.lemmas():
                n = l.name()
                if re.fullmatch(r'[a-z]+ology', n) and n not in seen and re.search(r'\b(study|science|branch|scientific|knowledge|theory|field)\b', s.definition()):
                    seen[n] = nice(n)
        return [(v, []) for v in sorted(seen.values())]
    if spec.get('defn'):
        rx = re.compile(spec['defn'], re.I)
        neg = re.compile(spec['not'], re.I) if spec.get('not') else None
        out, seen = [], set()
        for s in wn.all_synsets('n'):
            if not s.instance_hypernyms():
                continue
            d = s.definition()
            if not rx.search(d) or (neg and neg.search(d)):
                continue
            lemmas = [l.name() for l in s.lemmas()]
            full = person_name(lemmas)
            if not full:
                continue
            lemmas = [full] + [l for l in lemmas if l != full]
            name = nice(lemmas[0])
            if name.lower() in seen or name.lower() in {x.lower() for x in spec.get('drop', [])}:
                continue
            seen.add(name.lower())
            # Lone surnames are left to the game's own surname rule (only when no other answer shares one).
            out.append((name, [nice(l) for l in lemmas[1:] if '_' in l and nice(l).lower() != name.lower()]))
        return out
    instances = spec.get('instances', False)
    pool = set()
    for r in spec['roots'] + spec.get('extra_roots', []):
        pool |= tree(r, instances)
    pool -= skipped(spec, instances)
    heads = [h.lower() for h in spec.get('heads', [])]
    drop = {d.lower() for d in spec.get('drop', [])}
    out, seen = [], set()
    for s in sorted(pool, key=lambda x: x.name()):
        if spec.get('only_instances') and not s.instance_hypernyms():
            continue
        lemmas = [l.name() for l in s.lemmas()]
        common = [l for l in lemmas if not is_binomial(l)]
        lemmas = common + [l for l in lemmas if l not in common]
        name = nice(lemmas[0])
        low = name.lower()
        if (pid == 'ancient-god' and re.match(r'^\S+ (deity|god|goddess|nymph|spirit)$', low)) or low in drop or low in heads or bad_usage(s) or ADJ_GROUP.match(name) or (BAD_WORDS.search(name) and pid in BAD_WORD_PROMPTS) or (BAD_WORDS.search(name) and re.search(r'\\b(cunt|twat|fuck|shit|wank|minge|schlong)', low)):
            continue
        # A scientific group word with many kinds under it ("Leporid", "Prosimian", "Siouan") is not one thing.
        n_desc = descendants(s) if not instances else 0
        if n_desc >= spec.get('group_min', 6) and zipf(name) < spec.get('group_zipf', 2.6):
            continue
        if spec.get('excl_def') and re.search(spec['excl_def'], s.definition(), re.I):
            continue
        # A group label: has kinds under it and is named for the category ("bird of prey", "game fish").
        if not instances and s.hyponyms() and any(low == h or low.endswith(' ' + h) or low.startswith(h + ' of') for h in heads):
            continue
        if len(name) < 3 or re.search(r'\d', name) or is_binomial(lemmas[0]) or re.match(r'(Musculus|Musculi|Venae|Vena|Arteria|Arteriae|Nervus|Nervi|Oculus|Ramus|Glandula|Ligamentum|Os) ', name):
            continue
        aliases = [nice(l) for l in lemmas[1:] if not is_binomial(l)] if not is_binomial(lemmas[0]) else [nice(l) for l in lemmas[1:]]
        # Instance names are proper nouns; their extra lemmas are usually surnames ('Kant') — keep them.
        key = low
        if key in seen:
            continue
        seen.add(key)
        out.append((name, [a for a in aliases if a.lower() != low]))
    return out


def person_name(lemmas):
    """How a person is best known. A one-word name that is not just their surname is a mononym or pen name
    ('Raphael', 'Confucius', 'Voltaire'): use it. Otherwise 'First Last' if WordNet has it, else the fullest form.
    None if WordNet only has a lone surname (too thin to show as an answer)."""
    multi = [l for l in lemmas if 2 <= len(l.split('_')) <= 4 and '(' not in l and not re.match(r'(First|Second|Third|Fourth|Fifth|\d)', l)]
    surnames = {l.split('_')[-1].lower() for l in multi}
    mono = [l for l in lemmas if '_' not in l and l.lower() not in surnames and l[:1].isupper()]
    if mono and multi:
        return mono[0]
    if not multi:
        return None
    plain = [l for l in multi if not re.match(r'(Sir|Lord|Lady|Dame|Saint|St|Baron|Count|King|Queen)_', l)] or multi
    two = [l for l in plain if len(l.split('_')) == 2]
    return two[0] if two else sorted(plain, key=lambda l: -len(l))[0]


def show(name):
    s = wn.synset(name)
    print(s.name(), '-', s.definition())
    for h in sorted(s.hyponyms() + s.instance_hyponyms(), key=lambda x: -len(list(x.closure(lambda y: y.hyponyms())))):
        n = len(list(h.closure(lambda y: y.hyponyms() + y.instance_hyponyms())))
        print(f'  {n:5d}  {h.name():40s} {h.definition()[:70]}')


def main():
    args = sys.argv[1:]
    if args[:1] == ['--show']:
        for a in args[1:]:
            show(a)
        return
    for pid in (args or list(SPECS)):
        items = entries_for(pid, SPECS[pid])
        path = os.path.join(LISTS, f'{pid}.wordnet.txt')
        with open(path, 'w', encoding='utf-8') as f:
            f.write('# Princeton WordNet 3.0 (https://wordnet.princeton.edu), generated by scripts/answers/from_wordnet.py\n')
            for name, al in items:
                f.write(name + ('|' + ';'.join(a.replace('|', ' ').replace(';', ',') for a in al) if al else '') + '\n')
        print(f'{pid}: {len(items)}')


if __name__ == '__main__':
    main()
