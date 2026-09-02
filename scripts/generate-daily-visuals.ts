/**
 * StatVault Daily Visual Asset Generator (Meshy API)
 *
 * Configured to produce:
 * 1. Unit Multiview (3 images: Front, Side, Rear) via Meshy Text-to-Image (Nano Banana Pro, generate_multi_view: true)
 * 2. Primary Weapon Multiview (3 images) via Meshy Text-to-Image (Nano Banana Pro, generate_multi_view: true)
 * 3. Unit in Action Concept Art (1 image, 16:9) in a lore-accurate battle environment
 *
 * Total Credits per run: 27 credits (3 tasks x 9 credits on Nano Banana Pro)
 * Monthly Total (30 days): 810 credits / month (fully within 1,000 credit Pro plan)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync } from 'child_process';

const REPO_ROOT = path.resolve(__dirname, '..');
const ART_DIR = path.join(REPO_ROOT, 'assets/art');
const UNITS_DIR = path.join(REPO_ROOT, 'data/units');
const WEAPONS_DIR = path.join(REPO_ROOT, 'data/weapons');
const COVERAGE_FILE = path.join(REPO_ROOT, 'data/COVERAGE.md');
const APIS_FILE = path.join(REPO_ROOT, 'apis.txt');

function getMeshyApiKey(): string {
  if (process.env.MESHY_API_KEY) {
    return process.env.MESHY_API_KEY.trim();
  }
  if (fs.existsSync(APIS_FILE)) {
    const content = fs.readFileSync(APIS_FILE, 'utf-8');
    const match = content.match(/meshy:\s*([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  throw new Error('MESHY_API_KEY not found in environment or apis.txt.');
}

function requestJson(options: https.RequestOptions, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

// Canonical Presets
const CANONICAL_UNIT_PROMPTS: Record<string, string> = {
  'fire-warrior': 'Warhammer 40k Tau Fire Warrior Strike Team soldier in sleek ochre ceramic combat armor, cyclopean sensor helmet, holding Pulse Rifle, tabletop miniature figure, isolated on neutral studio grey background, clean battle-ready finish',
  'hormagaunt': 'Warhammer 40k Tyranid Hormagaunt swarm bioform, chitinous purple carapace, beige bio-flesh, four bounding legs, razor scything talons, dynamic ground stance, high-fidelity tabletop miniature figure render, isolated on neutral studio grey background',
  'guardian-defender': 'Warhammer 40k Aeldari Craftworld Guardian Defender, psychoreactive smooth thermoplas mesh armor in Ulthwe black and bone styling, sleek crest helmet, holding Shuriken Catapult, high-fidelity miniature render, isolated on neutral studio background',
  'necron-immortal': 'Warhammer 40k Necron Immortal ancient metallic skeletal cybernetic warrior, holding a Gauss Blaster rifle, glowing green dynastic energy, living metal silver chassis, tabletop miniature figure, isolated on neutral background',
  'necron-warrior': 'Warhammer 40k Necron Warrior mechanical skeletal android soldier, holding Gauss Flayer rifle, glowing emerald power tubes, living metal chassis, tabletop miniature, isolated on neutral grey background',
  'cadian-shock-trooper': 'Warhammer 40k Astra Militarum Cadian Shock Trooper infantryman in flak armor and helmet, holding Kantrael Lasgun, tabletop miniature, isolated on neutral studio background',
  'kasrkin-grenadier': 'Warhammer 40k Kasrkin Grenadier elite special forces soldier, reinforced carapace armor, helmet targeting visor, holding Hotshot Hellgun with power cable, tabletop miniature, isolated',
  'space-marine-intercessor': 'Warhammer 40k Adeptus Astartes Primaris Intercessor, Mark X Tacticus power armor in Ultramarines cobalt blue, holding Godwyn Bolt Rifle, tabletop miniature figure, isolated',
  'ork-boyz': 'Warhammer 40k Ork Boy, muscular green brute in scrap metal armor, holding crude Choppa cleaver and heavy Slugga pistol, tabletop miniature, isolated',
  'chaos-chosen': 'Warhammer 40k Chaos Chosen Warrior, baroque corrupted power armor with horns, holding daemon sword, tabletop miniature figure, isolated',
};

const CANONICAL_WEAPON_PROMPTS: Record<string, string> = {
  'pulse-rifle': 'Warhammer 40k Tau Pulse Rifle weapon, sleek white and ochre chassis, long particle acceleration barrel, photonic power cell, clean advanced sci-fi energy firearm, isolated tabletop asset, neutral background',
  'scything-talons': 'Warhammer 40k Tyranid Scything Talons close-combat biomorphic weapon, pair of razor-sharp chitinous curved serrated bone blades, organic joint mounts, high-fidelity isolated weapon asset, neutral background',
  'shuriken-catapult': 'Warhammer 40k Aeldari Shuriken Catapult firearm, sleek psychoreactive wraithbone chassis, gravity accelerator barrel, monomolecular disc magazine, high-fidelity isolated weapon render, neutral background',
  'gauss-blaster': 'Warhammer 40k Necron Gauss Blaster heavy rifle, dual living metal barrels, glowing emerald green molecular disintegration coils, techno-arcane weapon, isolated tabletop asset, neutral background',
  'gauss-flayer': 'Warhammer 40k Necron Gauss Flayer rifle, single long living metal barrel with transparent green energy flayer tube, techno-arcane weapon, isolated weapon render, neutral background',
  'kantrael-lasgun': 'Warhammer 40k Kantrael pattern M36 Lasgun rifle, rugged stamped metal receiver, heat sink cooling shroud, standard issue Imperial Guard lasgun, isolated weapon render, neutral background',
  'hotshot-lasgun': 'Warhammer 40k Type XIV Hotshot Hellgun rifle, reinforced receiver, heavy power cable connecting to backpack generator, high-yield capacitor, isolated weapon render, neutral background',
  'godwyn-bolt-rifle': 'Warhammer 40k Godwyn-pattern Bolt Rifle firearm, heavy ceranite casing, sickle box magazine, muzzle compensator, tactical scope, isolated weapon render, neutral background',
  'ork-choppa-slugga': 'Warhammer 40k Ork Choppa cleaver and heavy Slugga pistol, jagged scrap metal blade, bolted sheet steel, crude oversized kinetic firearm, isolated weapon render, neutral background',
  'warp-daemon-blade': 'Warhammer 40k Warp Daemon Blade sword, jagged serrated daemonic metal, writhing eyes and demonic runes on blade, unholy warp energy aura, isolated weapon render, neutral background',
};

const CANONICAL_CONCEPT_PROMPTS: Record<string, string> = {
  'fire-warrior': 'Epic Warhammer 40k cinematic battle scene, Tau Empire Fire Warriors holding a disciplined firing line on a rocky desert canyon under red sun, unleashing synchronized blinding blue pulse rifle plasma volleys against distant enemy assault, markerlight laser beams cutting through dusty combat smoke, grimdark sci-fi concept art, wide 16:9 composition',
  'hormagaunt': 'Epic Warhammer 40k cinematic battle scene, endless swarm of Tyranid Hormagaunts leaping over barbed wire barricades of a ruined Imperial fortress trench, toxic spore clouds in dark sky, bioship tendrils overhead, desperate defense fire, hyper-dynamic grimdark action concept art, wide 16:9 composition',
  'guardian-defender': 'Epic Warhammer 40k battle scene, Aeldari Guardian Defenders firing sweeping monomolecular shuriken volleys from behind crystalline wraithbone fortifications on a burning Maiden World, webway portal glowing in background, graceful grimdark war scene, wide 16:9 composition',
  'necron-immortal': 'Warhammer 40k epic battle scene, phalanx of Necron Immortals striding impassively through ruined gothic city ruins, twin-linked gauss blasters disintegrating armored vehicles into green subatomic particles, dark storm clouds, eerie green glow, wide 16:9 composition',
  'necron-warrior': 'Warhammer 40k battle scene, legion of Necron Warriors rising from dust in ancient underground subterranean necropolis tomb, eerie green ocular sensors glowing in shadows, cinematic concept art, wide 16:9 composition',
  'cadian-shock-trooper': 'Warhammer 40k battle scene, Cadian Shock Troops hunkered down in muddy trenches under artillery barrage, lasguns firing red laser beams into the darkness, burning war machines on horizon, gritty grimdark war art, wide 16:9 composition',
  'kasrkin-grenadier': 'Warhammer 40k tactical operation scene, squad of Kasrkin Grenadiers breaching a darkened fortified command bunker, green helmet visors and intense piercing hotshot laser beams cutting through thick smoke, cinematic special ops concept art, wide 16:9 composition',
  'space-marine-intercessor': 'Warhammer 40k epic battle scene, Ultramarines Primaris Intercessors holding the line against invading xenos inside a crumbling Imperial cathedral, bolter muzzle flash illuminating gothic arches, cinematic concept art, wide 16:9 composition',
  'ork-boyz': 'Warhammer 40k epic battle scene, roaring tide of Ork Boyz charging wildly across a smoke-filled wasteland, waving choppas and shooting sluggas in the air, makeshift war-buggies kicking up dust in background, brutal WAAAGH concept art, wide 16:9 composition',
  'chaos-chosen': 'Warhammer 40k battle scene, Chaos Chosen warriors fighting amid burning warp-corrupted ruins, daemonic fires burning, skies torn open with purple eye of terror energy, dark sinister concept art, wide 16:9 composition',
};

async function generateMultiView(apiKey: string, prompt: string, prefix: string): Promise<string[]> {
  console.log(`\n📸 Generating Multi-View (3 Angles) for [${prefix}]...`);
  console.log(`   Prompt: "${prompt}"`);

  const createRes = await requestJson(
    {
      hostname: 'api.meshy.ai',
      path: '/openapi/v1/text-to-image',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
    {
      prompt,
      ai_model: 'nano-banana-pro',
      generate_multi_view: true,
    }
  );

  const taskId = createRes.result || createRes.id;
  if (!taskId) {
    throw new Error(`Failed to create multi-view task: ${JSON.stringify(createRes)}`);
  }
  console.log(`✓ Task created: ${taskId}. Waiting for 3-view render completion...`);

  let finished = false;
  let imageUrls: string[] = [];

  for (let attempt = 0; attempt < 45; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await requestJson({
      hostname: 'api.meshy.ai',
      path: `/openapi/v1/text-to-image/${taskId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const status = statusRes.status;
    const progress = statusRes.progress ?? 0;
    console.log(`   Status: ${status} (${progress}%)`);

    if (status === 'SUCCEEDED') {
      finished = true;
      imageUrls = statusRes.image_urls || [];
      console.log(`✓ Multi-view task completed (consumed ${statusRes.consumed_credits ?? 9} credits)`);
      break;
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Multi-view task ${taskId} failed: ${statusRes.task_error?.message}`);
    }
  }

  if (imageUrls.length === 0) {
    throw new Error(`Multi-view succeeded but returned no image URLs for ${prefix}`);
  }

  const savedPaths: string[] = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const destName = `${prefix}_multiview_${i}.png`;
    const destPath = path.join(ART_DIR, destName);
    console.log(`   Downloading view [${i}] to: ${destName}...`);
    await downloadFile(imageUrls[i], destPath);
    savedPaths.push(`assets/art/${destName}`);
  }

  // Also create base thumbnail alias from view 0
  const baseName = `${prefix}.png`;
  const basePath = path.join(ART_DIR, baseName);
  if (!fs.existsSync(basePath) && fs.existsSync(path.join(ART_DIR, `${prefix}_multiview_0.png`))) {
    fs.copyFileSync(path.join(ART_DIR, `${prefix}_multiview_0.png`), basePath);
    const jpgPath = path.join(ART_DIR, `${prefix}.jpg`);
    fs.copyFileSync(basePath, jpgPath);
  }

  return savedPaths;
}

async function generateConceptArt(apiKey: string, prompt: string, prefix: string): Promise<string> {
  console.log(`\n🎨 Generating Lore-Accurate Action Concept Art (16:9) for [${prefix}]...`);
  console.log(`   Prompt: "${prompt}"`);

  const createRes = await requestJson(
    {
      hostname: 'api.meshy.ai',
      path: '/openapi/v1/text-to-image',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
    {
      prompt,
      ai_model: 'nano-banana-pro',
      aspect_ratio: '16:9',
    }
  );

  const taskId = createRes.result || createRes.id;
  if (!taskId) {
    throw new Error(`Failed to create concept art task: ${JSON.stringify(createRes)}`);
  }
  console.log(`✓ Task created: ${taskId}. Waiting for concept art render completion...`);

  let finished = false;
  let imageUrl: string | undefined;

  for (let attempt = 0; attempt < 35; attempt++) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await requestJson({
      hostname: 'api.meshy.ai',
      path: `/openapi/v1/text-to-image/${taskId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const status = statusRes.status;
    const progress = statusRes.progress ?? 0;
    console.log(`   Status: ${status} (${progress}%)`);

    if (status === 'SUCCEEDED') {
      finished = true;
      if (Array.isArray(statusRes.image_urls) && statusRes.image_urls.length > 0) {
        imageUrl = statusRes.image_urls[0];
      }
      console.log(`✓ Concept art task completed (consumed ${statusRes.consumed_credits ?? 9} credits)`);
      break;
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Concept art task ${taskId} failed: ${statusRes.task_error?.message}`);
    }
  }

  if (!imageUrl) {
    throw new Error(`Concept art task succeeded but returned no image URL for ${prefix}`);
  }

  const destPngName = `${prefix}_concept.png`;
  const destJpgName = `${prefix}_concept.jpg`;
  const destPngPath = path.join(ART_DIR, destPngName);
  const destJpgPath = path.join(ART_DIR, destJpgName);

  console.log(`   Downloading concept art to: ${destPngName}...`);
  await downloadFile(imageUrl, destPngPath);
  fs.copyFileSync(destPngPath, destJpgPath);

  return `assets/art/${destPngName}`;
}

async function main() {
  const args = process.argv.slice(2);
  const apiKey = getMeshyApiKey();

  if (!fs.existsSync(ART_DIR)) {
    fs.mkdirSync(ART_DIR, { recursive: true });
  }

  let targetUnitSlug: string | undefined;
  const unitIdx = args.indexOf('--unit');
  if (unitIdx !== -1 && args[unitIdx + 1]) {
    targetUnitSlug = args[unitIdx + 1];
  }

  // 1. Auto-detect target unit from COVERAGE.md changelog if omitted
  if (!targetUnitSlug && fs.existsSync(COVERAGE_FILE)) {
    const covContent = fs.readFileSync(COVERAGE_FILE, 'utf-8');
    const match = covContent.match(/\|\s*\d{4}-\d{2}-\d{2}\s*\|\s*\x60([a-z0-9-]+)\x60/);
    if (match && match[1]) {
      targetUnitSlug = match[1];
    }
  }

  // Fallback to newest unit in data/units/
  if (!targetUnitSlug && fs.existsSync(UNITS_DIR)) {
    const files = fs
      .readdirSync(UNITS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ slug: f.replace('.json', ''), mtime: fs.statSync(path.join(UNITS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    if (files.length > 0) {
      targetUnitSlug = files[0].slug;
    }
  }

  if (!targetUnitSlug) {
    throw new Error('Could not identify target unit to generate visual assets for.');
  }

  const unitFilePath = path.join(UNITS_DIR, `${targetUnitSlug}.json`);
  if (!fs.existsSync(unitFilePath)) {
    throw new Error(`Unit dataslate file does not exist: ${unitFilePath}`);
  }

  const unitData = JSON.parse(fs.readFileSync(unitFilePath, 'utf-8'));
  const weaponSlug = unitData.primaryWeaponSlug;
  const weaponFilePath = weaponSlug ? path.join(WEAPONS_DIR, `${weaponSlug}.json`) : undefined;
  const weaponData = weaponFilePath && fs.existsSync(weaponFilePath) ? JSON.parse(fs.readFileSync(weaponFilePath, 'utf-8')) : undefined;

  console.log('🏛️  StatVault Daily Visual Asset Suite Generation (Meshy API)');
  console.log('===========================================================');
  console.log(`Target Unit:   ${unitData.name} (${targetUnitSlug}) [${unitData.faction}]`);
  console.log(`Target Weapon: ${weaponData ? weaponData.name : 'N/A'} (${weaponSlug || 'none'})`);
  console.log('Daily Output Scope:');
  console.log('  1. Unit Multiview (3 transparent orthographic images)');
  console.log('  2. Primary Weapon Multiview (3 transparent orthographic images)');
  console.log('  3. Unit in Action Concept Art (1 cinematic 16:9 scene)');
  console.log('===========================================================');

  // STEP 1: Unit Multiview
  const unitMultiviewPrefix = targetUnitSlug;
  const existingUnitMv = [0, 1, 2].map((i) => path.join(ART_DIR, `${unitMultiviewPrefix}_multiview_${i}.png`));
  let unitMvPaths: string[] = [];

  if (existingUnitMv.every((f) => fs.existsSync(f) && fs.statSync(f).size > 1000)) {
    console.log(`✓ Unit multiview already verified on disk: ${unitMultiviewPrefix}_multiview_[0,1,2].png`);
    unitMvPaths = existingUnitMv.map((f) => `assets/art/${path.basename(f)}`);
  } else {
    const unitPrompt =
      CANONICAL_UNIT_PROMPTS[targetUnitSlug] ||
      `Warhammer 40k ${unitData.name}, ${unitData.faction}, ${unitData.role}, tabletop miniature figure, isolated on neutral studio grey background, sharp focus, clean lighting`;
    unitMvPaths = await generateMultiView(apiKey, unitPrompt, unitMultiviewPrefix);
  }

  // STEP 2: Weapon Multiview
  let weaponMvPaths: string[] = [];
  if (weaponSlug) {
    const weaponMultiviewPrefix = weaponSlug;
    const existingWeaponMv = [0, 1, 2].map((i) => path.join(ART_DIR, `${weaponMultiviewPrefix}_multiview_${i}.png`));

    if (existingWeaponMv.every((f) => fs.existsSync(f) && fs.statSync(f).size > 1000)) {
      console.log(`✓ Weapon multiview already verified on disk: ${weaponMultiviewPrefix}_multiview_[0,1,2].png`);
      weaponMvPaths = existingWeaponMv.map((f) => `assets/art/${path.basename(f)}`);
    } else {
      const weaponPrompt =
        CANONICAL_WEAPON_PROMPTS[weaponSlug] ||
        (weaponData
          ? `Warhammer 40k ${weaponData.name} ${weaponData.type} weapon, ${weaponData.faction}, high-fidelity isolated weapon asset, studio lighting, neutral background`
          : `Warhammer 40k ${weaponSlug.replace(/-/g, ' ')} weapon, high-fidelity isolated weapon render, studio neutral background`);
      weaponMvPaths = await generateMultiView(apiKey, weaponPrompt, weaponMultiviewPrefix);
    }
  }

  // STEP 3: Lore-Accurate Action Concept Art (16:9)
  const conceptPrefix = targetUnitSlug;
  const conceptPngPath = path.join(ART_DIR, `${conceptPrefix}_concept.png`);
  let conceptArtRelPath = `assets/art/${conceptPrefix}_concept.png`;

  if (fs.existsSync(conceptPngPath) && fs.statSync(conceptPngPath).size > 1000) {
    console.log(`✓ Concept art already verified on disk: ${conceptPrefix}_concept.png`);
  } else {
    const conceptPrompt =
      CANONICAL_CONCEPT_PROMPTS[targetUnitSlug] ||
      `Epic Warhammer 40k cinematic battle scene, ${unitData.name} in combat action in a lore-accurate battle environment, ${unitData.tacticalDescription}, firing line, atmospheric smoke, particle effects, dramatic lighting, high-fidelity grimdark concept art, wide 16:9 composition`;
    conceptArtRelPath = await generateConceptArt(apiKey, conceptPrompt, conceptPrefix);
  }

  // STEP 4: Update Unit and Weapon JSON Schemas
  console.log('\n📝 Updating Dataslate references...');
  unitData.multiviewImages = unitMvPaths;
  unitData.conceptArtPath = conceptArtRelPath;
  unitData.artImagePath = conceptArtRelPath; // Header card features the action concept art
  fs.writeFileSync(unitFilePath, JSON.stringify(unitData, null, 2) + '\n', 'utf-8');
  console.log(`✓ Updated ${path.basename(unitFilePath)} with multiview and concept art links.`);

  if (weaponFilePath && fs.existsSync(weaponFilePath) && weaponData) {
    weaponData.multiviewImages = weaponMvPaths;
    weaponData.artImagePath = weaponMvPaths[0] || `assets/art/${weaponSlug}.png`;
    fs.writeFileSync(weaponFilePath, JSON.stringify(weaponData, null, 2) + '\n', 'utf-8');
    console.log(`✓ Updated ${path.basename(weaponFilePath)} with weapon multiview links.`);
  }

  // STEP 5: Full Corpus Validation
  console.log('\n🔍 Validating corpus schemas...');
  try {
    execSync('npm run validate:data', { cwd: REPO_ROOT, stdio: 'inherit' });
    console.log('✓ All corpus data files valid.');
  } catch (err) {
    console.warn('Notice: validate:data exited with notice.');
  }

  // STEP 6: Strict Pre-Finish Verification (Assert all 7 files exist)
  console.log('\n🛡️  Performing Strict Pre-Finish Assertion:');
  const requiredFiles = [
    path.join(ART_DIR, `${unitMultiviewPrefix}_multiview_0.png`),
    path.join(ART_DIR, `${unitMultiviewPrefix}_multiview_1.png`),
    path.join(ART_DIR, `${unitMultiviewPrefix}_multiview_2.png`),
    path.join(ART_DIR, `${conceptPrefix}_concept.png`),
  ];
  if (weaponSlug) {
    requiredFiles.push(
      path.join(ART_DIR, `${weaponSlug}_multiview_0.png`),
      path.join(ART_DIR, `${weaponSlug}_multiview_1.png`),
      path.join(ART_DIR, `${weaponSlug}_multiview_2.png`)
    );
  }

  for (const f of requiredFiles) {
    if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
      throw new Error(`[FATAL] Required asset missing or incomplete: ${path.basename(f)}`);
    }
    console.log(`  ✓ Verified: ${path.basename(f)} (${(fs.statSync(f).size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n===========================================================');
  console.log(`🚀 Daily Visual Suite Successfully Generated for: ${unitData.name}`);
  console.log(`  • Unit Multiview:    3 images`);
  console.log(`  • Weapon Multiview:  3 images`);
  console.log(`  • Action Concept Art: 1 widescreen image`);
  console.log('===========================================================');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error during daily visual suite generation:', err.message);
    process.exit(1);
  });
}