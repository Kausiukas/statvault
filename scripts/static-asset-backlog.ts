import type { Faction, UnitRole, WeaponType } from '../packages/schemas/src';

/**
 * Temporary deterministic expansion queue.
 *
 * These seeds keep the daily corpus/visual workflows moving until the planned
 * generative curator can research and append new candidates. The daily builder
 * expands each seed into a provisional, schema-valid dataslate and leaves its
 * lore annotation unapproved for later source verification.
 */
export interface StaticAssetSeed {
  slug: string;
  name: string;
  faction: Faction;
  role: UnitRole;
  weaponSlug: string;
  weaponName: string;
  weaponType: WeaponType;
}

export const STATIC_ASSET_BACKLOG: readonly StaticAssetSeed[] = [
  // Adeptus Astartes
  { slug: 'space-marine-assault', name: 'Assault Intercessor Squad', faction: 'adeptus_astartes', role: 'shock_infantry', weaponSlug: 'assault-intercessor-heavy-bolt-pistol', weaponName: 'Heavy Bolt Pistol', weaponType: 'ballistic_slug' },
  { slug: 'jump-pack-intercessors', name: 'Jump Pack Intercessor Squad', faction: 'adeptus_astartes', role: 'fast_attack', weaponSlug: 'astartes-chainsword', weaponName: 'Astartes Chainsword', weaponType: 'melee_chain' },
  { slug: 'terminator-squad', name: 'Terminator Squad', faction: 'adeptus_astartes', role: 'heavy_support', weaponSlug: 'terminator-storm-bolter', weaponName: 'Terminator Storm Bolter', weaponType: 'ballistic_slug' },
  { slug: 'hellblaster-squad', name: 'Hellblaster Squad', faction: 'adeptus_astartes', role: 'heavy_support', weaponSlug: 'plasma-incinerator', weaponName: 'Plasma Incinerator', weaponType: 'energy_plasma' },
  { slug: 'aggressor-squad', name: 'Aggressor Squad', faction: 'adeptus_astartes', role: 'heavy_support', weaponSlug: 'flamestorm-gauntlets', weaponName: 'Flamestorm Gauntlets', weaponType: 'energy_flamer' },
  { slug: 'inceptor-squad', name: 'Inceptor Squad', faction: 'adeptus_astartes', role: 'fast_attack', weaponSlug: 'assault-bolters', weaponName: 'Assault Bolters', weaponType: 'ballistic_slug' },
  { slug: 'eliminator-squad', name: 'Eliminator Squad', faction: 'adeptus_astartes', role: 'line_infantry', weaponSlug: 'bolt-sniper-rifle', weaponName: 'Bolt Sniper Rifle', weaponType: 'ballistic_slug' },
  { slug: 'bladeguard-veterans', name: 'Bladeguard Veteran Squad', faction: 'adeptus_astartes', role: 'shock_infantry', weaponSlug: 'master-crafted-power-sword', weaponName: 'Master-Crafted Power Sword', weaponType: 'melee_power' },
  { slug: 'eradicator-squad', name: 'Eradicator Squad', faction: 'adeptus_astartes', role: 'heavy_support', weaponSlug: 'melta-rifle', weaponName: 'Melta Rifle', weaponType: 'energy_melta' },
  { slug: 'outrider-squad', name: 'Outrider Squad', faction: 'adeptus_astartes', role: 'fast_attack', weaponSlug: 'outrider-twin-bolt-rifle', weaponName: 'Outrider Twin Bolt Rifle', weaponType: 'ballistic_slug' },
  { slug: 'redemptor-dreadnought', name: 'Redemptor Dreadnought', faction: 'adeptus_astartes', role: 'vehicle', weaponSlug: 'macro-plasma-incinerator', weaponName: 'Macro Plasma Incinerator', weaponType: 'energy_plasma' },
  { slug: 'brutalis-dreadnought', name: 'Brutalis Dreadnought', faction: 'adeptus_astartes', role: 'vehicle', weaponSlug: 'brutalis-talons', weaponName: 'Brutalis Talons', weaponType: 'melee_power' },
  { slug: 'repulsor-executioner', name: 'Repulsor Executioner', faction: 'adeptus_astartes', role: 'vehicle', weaponSlug: 'heavy-laser-destroyer', weaponName: 'Heavy Laser Destroyer', weaponType: 'energy_las' },

  // Astra Militarum
  { slug: 'catachan-jungle-fighters', name: 'Catachan Jungle Fighters', faction: 'astra_militarum', role: 'line_infantry', weaponSlug: 'catachan-fang', weaponName: 'Catachan Fang', weaponType: 'melee_crude' },
  { slug: 'death-korps-of-krieg', name: 'Death Korps of Krieg Infantry', faction: 'astra_militarum', role: 'line_infantry', weaponSlug: 'lucius-lasgun', weaponName: 'Lucius-Pattern Lasgun', weaponType: 'energy_las' },
  { slug: 'ogryn-squad', name: 'Ogryn Squad', faction: 'astra_militarum', role: 'shock_infantry', weaponSlug: 'ogryn-ripper-gun', weaponName: 'Ogryn Ripper Gun', weaponType: 'ballistic_slug' },
  { slug: 'bullgryn-squad', name: 'Bullgryn Squad', faction: 'astra_militarum', role: 'heavy_support', weaponSlug: 'bullgryn-grenade-gauntlet', weaponName: 'Bullgryn Grenade Gauntlet', weaponType: 'explosive_missile' },
  { slug: 'ratling-snipers', name: 'Ratling Snipers', faction: 'astra_militarum', role: 'line_infantry', weaponSlug: 'ratling-long-las', weaponName: 'Ratling Long-Las', weaponType: 'energy_las' },
  { slug: 'tempestus-scion-squad', name: 'Tempestus Scion Squad', faction: 'astra_militarum', role: 'shock_infantry', weaponSlug: 'hot-shot-volley-gun', weaponName: 'Hot-Shot Volley Gun', weaponType: 'energy_las' },
  { slug: 'heavy-weapons-squad', name: 'Heavy Weapons Squad', faction: 'astra_militarum', role: 'heavy_support', weaponSlug: 'guard-autocannon', weaponName: 'Imperial Guard Autocannon', weaponType: 'ballistic_slug' },
  { slug: 'attilan-rough-riders', name: 'Attilan Rough Riders', faction: 'astra_militarum', role: 'fast_attack', weaponSlug: 'meltdown-hunting-lance', weaponName: 'Meltdown Hunting Lance', weaponType: 'energy_melta' },
  { slug: 'armoured-sentinel', name: 'Armoured Sentinel', faction: 'astra_militarum', role: 'vehicle', weaponSlug: 'sentinel-autocannon', weaponName: 'Sentinel Autocannon', weaponType: 'ballistic_slug' },
  { slug: 'chimera-transport', name: 'Chimera Armoured Transport', faction: 'astra_militarum', role: 'vehicle', weaponSlug: 'chimera-multilaser', weaponName: 'Chimera Multilaser', weaponType: 'energy_las' },
  { slug: 'leman-russ-battle-tank', name: 'Leman Russ Battle Tank', faction: 'astra_militarum', role: 'vehicle', weaponSlug: 'leman-russ-battle-cannon', weaponName: 'Leman Russ Battle Cannon', weaponType: 'ballistic_slug' },
  { slug: 'rogal-dorn-battle-tank', name: 'Rogal Dorn Battle Tank', faction: 'astra_militarum', role: 'vehicle', weaponSlug: 'oppressor-cannon', weaponName: 'Oppressor Cannon', weaponType: 'ballistic_slug' },
  { slug: 'manticore-artillery', name: 'Manticore Rocket Artillery', faction: 'astra_militarum', role: 'heavy_support', weaponSlug: 'storm-eagle-rockets', weaponName: 'Storm Eagle Rockets', weaponType: 'explosive_missile' },
  { slug: 'baneblade', name: 'Baneblade Super-Heavy Tank', faction: 'astra_militarum', role: 'lord_of_war', weaponSlug: 'baneblade-cannon', weaponName: 'Baneblade Cannon', weaponType: 'ballistic_slug' },

  // Chaos Space Marines
  { slug: 'chaos-legionaries', name: 'Chaos Space Marine Legionaries', faction: 'chaos_space_marines', role: 'line_infantry', weaponSlug: 'corrupted-boltgun', weaponName: 'Corrupted Boltgun', weaponType: 'ballistic_slug' },
  { slug: 'khorne-berzerkers', name: 'Khorne Berzerkers', faction: 'chaos_space_marines', role: 'shock_infantry', weaponSlug: 'berzerker-chainaxe', weaponName: 'Berzerker Chainaxe', weaponType: 'melee_chain' },
  { slug: 'plague-marines', name: 'Plague Marines', faction: 'chaos_space_marines', role: 'heavy_support', weaponSlug: 'blight-launcher', weaponName: 'Blight Launcher', weaponType: 'bio_weapon' },
  { slug: 'rubric-marines', name: 'Rubric Marines', faction: 'chaos_space_marines', role: 'line_infantry', weaponSlug: 'inferno-boltgun', weaponName: 'Inferno Boltgun', weaponType: 'warp_daemon' },
  { slug: 'noise-marines', name: 'Noise Marines', faction: 'chaos_space_marines', role: 'line_infantry', weaponSlug: 'sonic-blaster', weaponName: 'Sonic Blaster', weaponType: 'energy_pulse' },
  { slug: 'havoc-squad', name: 'Chaos Havoc Squad', faction: 'chaos_space_marines', role: 'heavy_support', weaponSlug: 'reaper-chaincannon', weaponName: 'Reaper Chaincannon', weaponType: 'ballistic_slug' },
  { slug: 'chaos-raptors', name: 'Chaos Raptors', faction: 'chaos_space_marines', role: 'fast_attack', weaponSlug: 'raptor-plasma-pistol', weaponName: 'Raptor Plasma Pistol', weaponType: 'energy_plasma' },
  { slug: 'warp-talons', name: 'Warp Talons', faction: 'chaos_space_marines', role: 'fast_attack', weaponSlug: 'warp-lightning-claws', weaponName: 'Warp Lightning Claws', weaponType: 'warp_daemon' },
  { slug: 'possessed-marines', name: 'Possessed Marines', faction: 'chaos_space_marines', role: 'monstrous_creature', weaponSlug: 'daemonic-talons', weaponName: 'Daemonic Talons', weaponType: 'warp_daemon' },
  { slug: 'chaos-terminators', name: 'Chaos Terminator Squad', faction: 'chaos_space_marines', role: 'heavy_support', weaponSlug: 'chaos-combi-bolter', weaponName: 'Chaos Combi-Bolter', weaponType: 'ballistic_slug' },
  { slug: 'helbrute', name: 'Helbrute', faction: 'chaos_space_marines', role: 'vehicle', weaponSlug: 'helbrute-twin-lascannon', weaponName: 'Helbrute Twin Lascannon', weaponType: 'energy_las' },
  { slug: 'obliterators', name: 'Obliterators', faction: 'chaos_space_marines', role: 'heavy_support', weaponSlug: 'fleshmetal-guns', weaponName: 'Fleshmetal Guns', weaponType: 'warp_daemon' },
  { slug: 'daemon-prince', name: 'Daemon Prince', faction: 'chaos_space_marines', role: 'lord_of_war', weaponSlug: 'hellforged-sword', weaponName: 'Hellforged Sword', weaponType: 'warp_daemon' },
  { slug: 'chaos-predator', name: 'Chaos Predator', faction: 'chaos_space_marines', role: 'vehicle', weaponSlug: 'predator-autocannon', weaponName: 'Predator Autocannon', weaponType: 'ballistic_slug' },

  // Orks
  { slug: 'gretchin-mob', name: 'Gretchin Mob', faction: 'orks', role: 'line_infantry', weaponSlug: 'grot-blasta', weaponName: 'Grot Blasta', weaponType: 'ballistic_slug' },
  { slug: 'ork-nobz', name: 'Ork Nobz Mob', faction: 'orks', role: 'shock_infantry', weaponSlug: 'nob-big-choppa', weaponName: 'Nob Big Choppa', weaponType: 'melee_crude' },
  { slug: 'meganobz', name: 'Meganobz', faction: 'orks', role: 'heavy_support', weaponSlug: 'mega-armour-power-klaw', weaponName: 'Mega-Armour Power Klaw', weaponType: 'melee_power' },
  { slug: 'stormboyz', name: 'Stormboyz', faction: 'orks', role: 'fast_attack', weaponSlug: 'stormboy-choppa', weaponName: 'Stormboy Choppa', weaponType: 'melee_crude' },
  { slug: 'burna-boyz', name: 'Burna Boyz', faction: 'orks', role: 'line_infantry', weaponSlug: 'ork-burna', weaponName: 'Ork Burna', weaponType: 'energy_flamer' },
  { slug: 'lootas', name: 'Lootas', faction: 'orks', role: 'heavy_support', weaponSlug: 'deffgun', weaponName: 'Deffgun', weaponType: 'ballistic_slug' },
  { slug: 'flash-gitz', name: 'Flash Gitz', faction: 'orks', role: 'heavy_support', weaponSlug: 'snazzgun', weaponName: 'Snazzgun', weaponType: 'ballistic_slug' },
  { slug: 'tankbustas', name: 'Tankbustas', faction: 'orks', role: 'heavy_support', weaponSlug: 'rokkit-launcha', weaponName: 'Rokkit Launcha', weaponType: 'explosive_missile' },
  { slug: 'ork-kommandos', name: 'Ork Kommandos', faction: 'orks', role: 'line_infantry', weaponSlug: 'breacha-ram', weaponName: 'Breacha Ram', weaponType: 'melee_crude' },
  { slug: 'warbikers', name: 'Ork Warbikers', faction: 'orks', role: 'fast_attack', weaponSlug: 'warbike-dakkagun', weaponName: 'Warbike Dakkagun', weaponType: 'ballistic_slug' },
  { slug: 'deffkoptas', name: 'Deffkoptas', faction: 'orks', role: 'fast_attack', weaponSlug: 'kopta-rokkits', weaponName: 'Kopta Rokkits', weaponType: 'explosive_missile' },
  { slug: 'killa-kans', name: 'Killa Kans', faction: 'orks', role: 'vehicle', weaponSlug: 'kan-klaw', weaponName: 'Kan Klaw', weaponType: 'melee_crude' },
  { slug: 'deff-dread', name: 'Deff Dread', faction: 'orks', role: 'vehicle', weaponSlug: 'dread-klaw', weaponName: 'Dread Klaw', weaponType: 'melee_crude' },
  { slug: 'battlewagon', name: 'Ork Battlewagon', faction: 'orks', role: 'vehicle', weaponSlug: 'killkannon', weaponName: 'Killkannon', weaponType: 'ballistic_slug' },

  // Aeldari
  { slug: 'dire-avengers', name: 'Dire Avengers', faction: 'aeldari', role: 'line_infantry', weaponSlug: 'avenger-shuriken-catapult', weaponName: 'Avenger Shuriken Catapult', weaponType: 'energy_shuriken' },
  { slug: 'striking-scorpions', name: 'Striking Scorpions', faction: 'aeldari', role: 'shock_infantry', weaponSlug: 'scorpion-chainsword', weaponName: 'Scorpion Chainsword', weaponType: 'melee_chain' },
  { slug: 'dark-reapers', name: 'Dark Reapers', faction: 'aeldari', role: 'heavy_support', weaponSlug: 'reaper-launcher', weaponName: 'Reaper Launcher', weaponType: 'explosive_missile' },
  { slug: 'fire-dragons', name: 'Fire Dragons', faction: 'aeldari', role: 'heavy_support', weaponSlug: 'aeldari-fusion-gun', weaponName: 'Aeldari Fusion Gun', weaponType: 'energy_melta' },
  { slug: 'swooping-hawks', name: 'Swooping Hawks', faction: 'aeldari', role: 'fast_attack', weaponSlug: 'hawk-lasblaster', weaponName: 'Lasblaster', weaponType: 'energy_las' },
  { slug: 'warp-spiders', name: 'Warp Spiders', faction: 'aeldari', role: 'fast_attack', weaponSlug: 'death-spinner', weaponName: 'Death Spinner', weaponType: 'energy_shuriken' },
  { slug: 'wraithguard', name: 'Wraithguard', faction: 'aeldari', role: 'heavy_support', weaponSlug: 'wraithcannon', weaponName: 'Wraithcannon', weaponType: 'warp_daemon' },
  { slug: 'wraithblades', name: 'Wraithblades', faction: 'aeldari', role: 'shock_infantry', weaponSlug: 'ghostsword', weaponName: 'Ghostsword', weaponType: 'melee_power' },
  { slug: 'windriders', name: 'Windriders', faction: 'aeldari', role: 'fast_attack', weaponSlug: 'windrider-shuriken-cannon', weaponName: 'Windrider Shuriken Cannon', weaponType: 'energy_shuriken' },
  { slug: 'war-walker', name: 'War Walker', faction: 'aeldari', role: 'vehicle', weaponSlug: 'war-walker-bright-lance', weaponName: 'War Walker Bright Lance', weaponType: 'energy_las' },
  { slug: 'falcon-grav-tank', name: 'Falcon Grav-Tank', faction: 'aeldari', role: 'vehicle', weaponSlug: 'falcon-pulse-laser', weaponName: 'Falcon Pulse Laser', weaponType: 'energy_las' },
  { slug: 'fire-prism', name: 'Fire Prism Grav-Tank', faction: 'aeldari', role: 'vehicle', weaponSlug: 'prism-cannon', weaponName: 'Prism Cannon', weaponType: 'energy_las' },
  { slug: 'wraithlord', name: 'Wraithlord', faction: 'aeldari', role: 'monstrous_creature', weaponSlug: 'wraithlord-starcannon', weaponName: 'Wraithlord Starcannon', weaponType: 'energy_plasma' },

  // Necrons
  { slug: 'deathmarks', name: 'Deathmarks', faction: 'necrons', role: 'line_infantry', weaponSlug: 'synaptic-disintegrator', weaponName: 'Synaptic Disintegrator', weaponType: 'energy_gauss' },
  { slug: 'lychguard', name: 'Lychguard', faction: 'necrons', role: 'shock_infantry', weaponSlug: 'hyperphase-sword', weaponName: 'Hyperphase Sword', weaponType: 'melee_power' },
  { slug: 'triarch-praetorians', name: 'Triarch Praetorians', faction: 'necrons', role: 'fast_attack', weaponSlug: 'rod-of-covenant', weaponName: 'Rod of Covenant', weaponType: 'energy_gauss' },
  { slug: 'flayed-ones', name: 'Flayed Ones', faction: 'necrons', role: 'shock_infantry', weaponSlug: 'flayer-claws', weaponName: 'Flayer Claws', weaponType: 'melee_crude' },
  { slug: 'lokhust-destroyers', name: 'Lokhust Destroyers', faction: 'necrons', role: 'fast_attack', weaponSlug: 'lokhust-gauss-cannon', weaponName: 'Lokhust Gauss Cannon', weaponType: 'energy_gauss' },
  { slug: 'lokhust-heavy-destroyer', name: 'Lokhust Heavy Destroyer', faction: 'necrons', role: 'heavy_support', weaponSlug: 'gauss-destructor', weaponName: 'Gauss Destructor', weaponType: 'energy_gauss' },
  { slug: 'canoptek-scarabs', name: 'Canoptek Scarab Swarm', faction: 'necrons', role: 'fast_attack', weaponSlug: 'feeder-mandibles', weaponName: 'Feeder Mandibles', weaponType: 'energy_gauss' },
  { slug: 'canoptek-wraiths', name: 'Canoptek Wraiths', faction: 'necrons', role: 'fast_attack', weaponSlug: 'wraith-vicious-claws', weaponName: 'Vicious Claws', weaponType: 'melee_power' },
  { slug: 'skorpekh-destroyers', name: 'Skorpekh Destroyers', faction: 'necrons', role: 'shock_infantry', weaponSlug: 'hyperphase-threshers', weaponName: 'Hyperphase Threshers', weaponType: 'melee_power' },
  { slug: 'ophydian-destroyers', name: 'Ophydian Destroyers', faction: 'necrons', role: 'fast_attack', weaponSlug: 'ophydian-hyperphase-weapons', weaponName: 'Ophydian Hyperphase Weapons', weaponType: 'melee_power' },
  { slug: 'tomb-blades', name: 'Tomb Blades', faction: 'necrons', role: 'fast_attack', weaponSlug: 'twin-tesla-carbine', weaponName: 'Twin Tesla Carbine', weaponType: 'energy_gauss' },
  { slug: 'annihilation-barge', name: 'Annihilation Barge', faction: 'necrons', role: 'vehicle', weaponSlug: 'tesla-destructor', weaponName: 'Tesla Destructor', weaponType: 'energy_gauss' },
  { slug: 'doom-scythe', name: 'Doom Scythe', faction: 'necrons', role: 'vehicle', weaponSlug: 'death-ray', weaponName: 'Death Ray', weaponType: 'energy_gauss' },
  { slug: 'necron-monolith', name: 'Necron Monolith', faction: 'necrons', role: 'lord_of_war', weaponSlug: 'particle-whip', weaponName: 'Particle Whip', weaponType: 'energy_gauss' },

  // Tyranids
  { slug: 'genestealers', name: 'Genestealer Brood', faction: 'tyranids', role: 'shock_infantry', weaponSlug: 'genestealer-rending-claws', weaponName: 'Rending Claws', weaponType: 'bio_weapon' },
  { slug: 'tyranid-warriors', name: 'Tyranid Warrior Brood', faction: 'tyranids', role: 'line_infantry', weaponSlug: 'warrior-deathspitter', weaponName: 'Deathspitter', weaponType: 'bio_weapon' },
  { slug: 'gargoyle-brood', name: 'Gargoyle Brood', faction: 'tyranids', role: 'fast_attack', weaponSlug: 'gargoyle-fleshborer', weaponName: 'Gargoyle Fleshborer', weaponType: 'bio_weapon' },
  { slug: 'neurogaunts', name: 'Neurogaunt Nodebeasts', faction: 'tyranids', role: 'line_infantry', weaponSlug: 'neurogaunt-claws', weaponName: 'Neurogaunt Claws', weaponType: 'bio_weapon' },
  { slug: 'von-ryans-leapers', name: "Von Ryan's Leapers", faction: 'tyranids', role: 'fast_attack', weaponSlug: 'leaper-mantis-claws', weaponName: 'Mantis Claws', weaponType: 'bio_weapon' },
  { slug: 'barbgaunts', name: 'Barbgaunt Brood', faction: 'tyranids', role: 'heavy_support', weaponSlug: 'barbgaunt-bio-cannon', weaponName: 'Barblauncher', weaponType: 'bio_weapon' },
  { slug: 'raveners', name: 'Ravener Brood', faction: 'tyranids', role: 'fast_attack', weaponSlug: 'thoracic-devourer', weaponName: 'Thoracic Devourer', weaponType: 'bio_weapon' },
  { slug: 'lictor', name: 'Lictor', faction: 'tyranids', role: 'shock_infantry', weaponSlug: 'lictor-flesh-hooks', weaponName: 'Flesh Hooks', weaponType: 'bio_weapon' },
  { slug: 'zoanthropes', name: 'Zoanthrope Brood', faction: 'tyranids', role: 'heavy_support', weaponSlug: 'zoanthrope-warp-blast', weaponName: 'Warp Blast', weaponType: 'warp_daemon' },
  { slug: 'hive-guard', name: 'Hive Guard Brood', faction: 'tyranids', role: 'heavy_support', weaponSlug: 'impaler-cannon', weaponName: 'Impaler Cannon', weaponType: 'bio_weapon' },
  { slug: 'carnifex', name: 'Carnifex', faction: 'tyranids', role: 'monstrous_creature', weaponSlug: 'monstrous-crushing-claws', weaponName: 'Monstrous Crushing Claws', weaponType: 'bio_weapon' },
  { slug: 'screamer-killer', name: 'Screamer-Killer', faction: 'tyranids', role: 'monstrous_creature', weaponSlug: 'bio-plasmic-scream', weaponName: 'Bio-Plasmic Scream', weaponType: 'bio_weapon' },
  { slug: 'exocrine', name: 'Exocrine', faction: 'tyranids', role: 'heavy_support', weaponSlug: 'bio-plasmic-cannon', weaponName: 'Bio-Plasmic Cannon', weaponType: 'bio_weapon' },
  { slug: 'tyrannofex', name: 'Tyrannofex', faction: 'tyranids', role: 'monstrous_creature', weaponSlug: 'rupture-cannon', weaponName: 'Rupture Cannon', weaponType: 'bio_weapon' },
  { slug: 'hive-tyrant', name: 'Hive Tyrant', faction: 'tyranids', role: 'lord_of_war', weaponSlug: 'heavy-venom-cannon', weaponName: 'Heavy Venom Cannon', weaponType: 'bio_weapon' },

  // T'au Empire
  { slug: 'breacher-team', name: "T'au Breacher Team", faction: 'tau_empire', role: 'shock_infantry', weaponSlug: 'pulse-blaster', weaponName: 'Pulse Blaster', weaponType: 'energy_pulse' },
  { slug: 'pathfinder-team', name: "T'au Pathfinder Team", faction: 'tau_empire', role: 'line_infantry', weaponSlug: 'pathfinder-rail-rifle', weaponName: 'Rail Rifle', weaponType: 'energy_pulse' },
  { slug: 'stealth-battlesuits', name: 'Stealth Battlesuit Team', faction: 'tau_empire', role: 'fast_attack', weaponSlug: 'stealth-burst-cannon', weaponName: 'Burst Cannon', weaponType: 'energy_pulse' },
  { slug: 'crisis-battlesuits', name: 'Crisis Battlesuit Team', faction: 'tau_empire', role: 'fast_attack', weaponSlug: 'cyclic-ion-blaster', weaponName: 'Cyclic Ion Blaster', weaponType: 'energy_plasma' },
  { slug: 'broadside-battlesuit', name: 'Broadside Battlesuit', faction: 'tau_empire', role: 'heavy_support', weaponSlug: 'heavy-rail-rifle', weaponName: 'Heavy Rail Rifle', weaponType: 'energy_pulse' },
  { slug: 'ghostkeel-battlesuit', name: 'Ghostkeel Battlesuit', faction: 'tau_empire', role: 'monstrous_creature', weaponSlug: 'fusion-collider', weaponName: 'Fusion Collider', weaponType: 'energy_melta' },
  { slug: 'riptide-battlesuit', name: 'Riptide Battlesuit', faction: 'tau_empire', role: 'monstrous_creature', weaponSlug: 'heavy-burst-cannon', weaponName: 'Heavy Burst Cannon', weaponType: 'energy_pulse' },
  { slug: 'piranha-skimmer', name: "T'au Piranha", faction: 'tau_empire', role: 'fast_attack', weaponSlug: 'piranha-fusion-blaster', weaponName: 'Piranha Fusion Blaster', weaponType: 'energy_melta' },
  { slug: 'hammerhead-gunship', name: 'Hammerhead Gunship', faction: 'tau_empire', role: 'vehicle', weaponSlug: 'hammerhead-railgun', weaponName: 'Hammerhead Railgun', weaponType: 'energy_pulse' },
  { slug: 'devilfish-transport', name: 'Devilfish Transport', faction: 'tau_empire', role: 'vehicle', weaponSlug: 'devilfish-accelerator-burst-cannon', weaponName: 'Accelerator Burst Cannon', weaponType: 'energy_pulse' },
  { slug: 'kroot-carnivores', name: 'Kroot Carnivore Squad', faction: 'tau_empire', role: 'line_infantry', weaponSlug: 'kroot-rifle', weaponName: 'Kroot Rifle', weaponType: 'ballistic_slug' },
  { slug: 'krootox-rider', name: 'Krootox Rider', faction: 'tau_empire', role: 'heavy_support', weaponSlug: 'krootox-gun', weaponName: 'Krootox Gun', weaponType: 'ballistic_slug' },

  // Adepta Sororitas
  { slug: 'dominion-squad', name: 'Dominion Squad', faction: 'adepta_sororitas', role: 'line_infantry', weaponSlug: 'artificer-storm-bolter', weaponName: 'Artificer Storm Bolter', weaponType: 'ballistic_slug' },
  { slug: 'retributor-squad', name: 'Retributor Squad', faction: 'adepta_sororitas', role: 'heavy_support', weaponSlug: 'sororitas-multi-melta', weaponName: 'Sororitas Multi-Melta', weaponType: 'energy_melta' },
  { slug: 'celestian-sacresants', name: 'Celestian Sacresants', faction: 'adepta_sororitas', role: 'shock_infantry', weaponSlug: 'anointed-halberd', weaponName: 'Anointed Halberd', weaponType: 'melee_power' },
  { slug: 'repentia-squad', name: 'Sisters Repentia', faction: 'adepta_sororitas', role: 'shock_infantry', weaponSlug: 'penitent-eviscerator', weaponName: 'Penitent Eviscerator', weaponType: 'melee_chain' },
  { slug: 'seraphim-squad', name: 'Seraphim Squad', faction: 'adepta_sororitas', role: 'fast_attack', weaponSlug: 'seraphim-bolt-pistols', weaponName: 'Seraphim Bolt Pistols', weaponType: 'ballistic_slug' },
  { slug: 'zephyrim-squad', name: 'Zephyrim Squad', faction: 'adepta_sororitas', role: 'fast_attack', weaponSlug: 'zephyrim-power-sword', weaponName: 'Zephyrim Power Sword', weaponType: 'melee_power' },
  { slug: 'arco-flagellants', name: 'Arco-Flagellants', faction: 'adepta_sororitas', role: 'shock_infantry', weaponSlug: 'arco-flails', weaponName: 'Arco-Flails', weaponType: 'melee_crude' },
  { slug: 'mortifier', name: 'Mortifier', faction: 'adepta_sororitas', role: 'monstrous_creature', weaponSlug: 'mortifier-heavy-bolters', weaponName: 'Mortifier Heavy Bolters', weaponType: 'ballistic_slug' },
  { slug: 'penitent-engine', name: 'Penitent Engine', faction: 'adepta_sororitas', role: 'monstrous_creature', weaponSlug: 'twin-penitent-buzz-blades', weaponName: 'Twin Penitent Buzz-Blades', weaponType: 'melee_chain' },
  { slug: 'paragon-warsuits', name: 'Paragon Warsuit Squad', faction: 'adepta_sororitas', role: 'heavy_support', weaponSlug: 'paragon-multi-melta', weaponName: 'Paragon Multi-Melta', weaponType: 'energy_melta' },
  { slug: 'immolator-tank', name: 'Immolator', faction: 'adepta_sororitas', role: 'vehicle', weaponSlug: 'immolation-flamers', weaponName: 'Immolation Flamers', weaponType: 'energy_flamer' },
  { slug: 'exorcist-tank', name: 'Exorcist', faction: 'adepta_sororitas', role: 'heavy_support', weaponSlug: 'exorcist-missile-launcher', weaponName: 'Exorcist Missile Launcher', weaponType: 'explosive_missile' },

  // Adeptus Custodes
  { slug: 'custodian-wardens', name: 'Custodian Wardens', faction: 'adeptus_custodes', role: 'shock_infantry', weaponSlug: 'castellan-axe', weaponName: 'Castellan Axe', weaponType: 'melee_power' },
  { slug: 'allarus-custodians', name: 'Allarus Custodians', faction: 'adeptus_custodes', role: 'heavy_support', weaponSlug: 'balistus-grenade-launcher', weaponName: 'Balistus Grenade Launcher', weaponType: 'explosive_missile' },
  { slug: 'sagittarum-custodians', name: 'Sagittarum Custodians', faction: 'adeptus_custodes', role: 'line_infantry', weaponSlug: 'adrastus-bolt-caliver', weaponName: 'Adrastus Bolt Caliver', weaponType: 'ballistic_slug' },
  { slug: 'vertus-praetors', name: 'Vertus Praetors', faction: 'adeptus_custodes', role: 'fast_attack', weaponSlug: 'vertus-salvo-launcher', weaponName: 'Salvo Launcher', weaponType: 'explosive_missile' },
  { slug: 'sisters-of-silence-vigilators', name: 'Sisters of Silence Vigilators', faction: 'adeptus_custodes', role: 'shock_infantry', weaponSlug: 'executioner-greatblade', weaponName: 'Executioner Greatblade', weaponType: 'melee_power' },
  { slug: 'sisters-of-silence-witchseekers', name: 'Sisters of Silence Witchseekers', faction: 'adeptus_custodes', role: 'line_infantry', weaponSlug: 'witchseeker-flamer', weaponName: 'Witchseeker Flamer', weaponType: 'energy_flamer' },
  { slug: 'venatari-custodians', name: 'Venatari Custodians', faction: 'adeptus_custodes', role: 'fast_attack', weaponSlug: 'kinetic-destroyer', weaponName: 'Kinetic Destroyer', weaponType: 'ballistic_slug' },
  { slug: 'achillus-dreadnought', name: 'Contemptor-Achillus Dreadnought', faction: 'adeptus_custodes', role: 'vehicle', weaponSlug: 'achillus-dreadspear', weaponName: 'Achillus Dreadspear', weaponType: 'melee_power' },
  { slug: 'galatus-dreadnought', name: 'Contemptor-Galatus Dreadnought', faction: 'adeptus_custodes', role: 'vehicle', weaponSlug: 'galatus-warblade', weaponName: 'Galatus Warblade', weaponType: 'melee_power' },
  { slug: 'venerable-land-raider', name: 'Venerable Land Raider', faction: 'adeptus_custodes', role: 'vehicle', weaponSlug: 'venerable-twin-lascannon', weaponName: 'Venerable Twin Lascannon', weaponType: 'energy_las' },

  // Leagues of Votann
  { slug: 'hernkyn-pioneers', name: 'Hernkyn Pioneers', faction: 'leagues_of_votann', role: 'fast_attack', weaponSlug: 'magna-coil-autocannon', weaponName: 'Magna-Coil Autocannon', weaponType: 'energy_gauss' },
  { slug: 'cthonian-beserks', name: 'Cthonian Beserks', faction: 'leagues_of_votann', role: 'shock_infantry', weaponSlug: 'heavy-plasma-axe', weaponName: 'Heavy Plasma Axe', weaponType: 'melee_power' },
  { slug: 'einhyr-hearthguard', name: 'Einhyr Hearthguard', faction: 'leagues_of_votann', role: 'heavy_support', weaponSlug: 'eta-carn-plasma-gun', weaponName: 'EtaCarn Plasma Gun', weaponType: 'energy_plasma' },
  { slug: 'einhyr-champion', name: 'Einhyr Champion', faction: 'leagues_of_votann', role: 'shock_infantry', weaponSlug: 'mass-hammer', weaponName: 'Mass Hammer', weaponType: 'melee_power' },
  { slug: 'brokhyr-thunderkyn', name: 'Brokhyr Thunderkyn', faction: 'leagues_of_votann', role: 'heavy_support', weaponSlug: 'thunderkyn-bolt-cannon', weaponName: 'Bolt Cannon', weaponType: 'ballistic_slug' },
  { slug: 'brokhyr-iron-master', name: 'Brokhyr Iron-Master', faction: 'leagues_of_votann', role: 'line_infantry', weaponSlug: 'graviton-rifle', weaponName: 'Graviton Rifle', weaponType: 'energy_gauss' },
  { slug: 'hernkyn-yaegirs', name: 'Hernkyn Yaegirs', faction: 'leagues_of_votann', role: 'line_infantry', weaponSlug: 'yaegir-bolt-shotgun', weaponName: 'Bolt Shotgun', weaponType: 'ballistic_slug' },
  { slug: 'sagitaur', name: 'Sagitaur', faction: 'leagues_of_votann', role: 'vehicle', weaponSlug: 'sagitaur-beam-cannon', weaponName: 'Sagitaur Beam Cannon', weaponType: 'energy_volkite' },
  { slug: 'hekaton-land-fortress', name: 'Hekaton Land Fortress', faction: 'leagues_of_votann', role: 'lord_of_war', weaponSlug: 'heavy-magna-rail-cannon', weaponName: 'Heavy Magna-Rail Cannon', weaponType: 'energy_gauss' },
  { slug: 'grimnyr', name: 'Grimnyr', faction: 'leagues_of_votann', role: 'line_infantry', weaponSlug: 'ancestral-ward-stave', weaponName: 'Ancestral Ward Stave', weaponType: 'melee_force' },

  // Drukhari
  { slug: 'wych-cult-squad', name: 'Wych Cult Squad', faction: 'drukhari', role: 'shock_infantry', weaponSlug: 'wych-blades', weaponName: 'Wych Blades', weaponType: 'melee_crude' },
  { slug: 'incubi', name: 'Incubi', faction: 'drukhari', role: 'shock_infantry', weaponSlug: 'incubus-klaive', weaponName: 'Klaive', weaponType: 'melee_power' },
  { slug: 'wrack-coven', name: 'Wrack Coven', faction: 'drukhari', role: 'line_infantry', weaponSlug: 'wrack-poisoned-blades', weaponName: 'Poisoned Blades', weaponType: 'bio_weapon' },
  { slug: 'grotesques', name: 'Grotesques', faction: 'drukhari', role: 'monstrous_creature', weaponSlug: 'flesh-gauntlet', weaponName: 'Flesh Gauntlet', weaponType: 'bio_weapon' },
  { slug: 'scourges', name: 'Scourges', faction: 'drukhari', role: 'fast_attack', weaponSlug: 'haywire-blaster', weaponName: 'Haywire Blaster', weaponType: 'energy_gauss' },
  { slug: 'hellions', name: 'Hellions', faction: 'drukhari', role: 'fast_attack', weaponSlug: 'hellglaive', weaponName: 'Hellglaive', weaponType: 'melee_power' },
  { slug: 'reaver-jetbikes', name: 'Reaver Jetbikes', faction: 'drukhari', role: 'fast_attack', weaponSlug: 'reaver-splinter-pods', weaponName: 'Splinter Pods', weaponType: 'energy_shuriken' },
  { slug: 'mandrakes', name: 'Mandrakes', faction: 'drukhari', role: 'line_infantry', weaponSlug: 'baleblast', weaponName: 'Baleblast', weaponType: 'warp_daemon' },
  { slug: 'talos-pain-engine', name: 'Talos Pain Engine', faction: 'drukhari', role: 'monstrous_creature', weaponSlug: 'talos-macro-scalpel', weaponName: 'Macro-Scalpel', weaponType: 'melee_power' },
  { slug: 'cronos-pain-engine', name: 'Cronos Pain Engine', faction: 'drukhari', role: 'monstrous_creature', weaponSlug: 'spirit-syphon', weaponName: 'Spirit Syphon', weaponType: 'warp_daemon' },
  { slug: 'drukhari-raider', name: 'Drukhari Raider', faction: 'drukhari', role: 'vehicle', weaponSlug: 'raider-dark-lance', weaponName: 'Dark Lance', weaponType: 'energy_las' },
  { slug: 'drukhari-ravager', name: 'Drukhari Ravager', faction: 'drukhari', role: 'vehicle', weaponSlug: 'ravager-disintegrator-cannon', weaponName: 'Disintegrator Cannon', weaponType: 'energy_plasma' },
  { slug: 'drukhari-venom', name: 'Drukhari Venom', faction: 'drukhari', role: 'fast_attack', weaponSlug: 'venom-splinter-cannon', weaponName: 'Splinter Cannon', weaponType: 'energy_shuriken' },
];
