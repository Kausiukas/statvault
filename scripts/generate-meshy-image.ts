/**
 * StatVault Meshy Text-to-Image Generator CLI
 *
 * Generates isolated miniature-style character renders using Meshy's Text-to-Image API (Nano Banana Pro).
 * Reads API key from MESHY_API_KEY environment variable or apis.txt.
 *
 * Usage:
 *   npx ts-node scripts/generate-meshy-image.ts --unit guardian-defender
 *   npx ts-node scripts/generate-meshy-image.ts --prompt "Warhammer 40k Necron Lychguard" --name necron-lychguard
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const REPO_ROOT = path.resolve(__dirname, '..');
const ART_DIR = path.join(REPO_ROOT, 'assets/art');
const UNITS_DIR = path.join(REPO_ROOT, 'data/units');
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

const CANONICAL_IMAGE_PROMPTS: Record<string, string> = {
  'guardian-defender': 'Warhammer 40k Aeldari Craftworld Guardian Defender, psychoreactive smooth thermoplas mesh armor in Ulthwe black and bone styling, sleek crest helmet, holding Shuriken Catapult, high-fidelity miniature render',
  'necron-warrior': 'Warhammer 40k Necron Warrior mechanical skeletal android soldier, holding Gauss Flayer rifle, glowing emerald power tubes, living metal chassis, high-fidelity miniature render, studio grey background',
  'necron-immortal': 'Warhammer 40k Necron Immortal ancient metallic skeletal cybernetic warrior, holding a Gauss Blaster rifle, glowing green dynastic energy, living metal silver chassis, high-fidelity miniature render',
  'cadian-shock-trooper': 'Warhammer 40k Astra Militarum Cadian Shock Trooper infantryman in flak armor and helmet, holding Kantrael Lasgun, high-fidelity miniature render',
  'kasrkin-grenadier': 'Warhammer 40k Kasrkin Grenadier elite special forces, reinforced carapace armor, targeting visor, holding Hotshot Hellgun with power cables, high-fidelity miniature render',
  'space-marine-intercessor': 'Warhammer 40k Adeptus Astartes Primaris Intercessor, Mark X Tacticus power armor, holding Godwyn Bolt Rifle, high-fidelity miniature render',
  'ork-boyz': 'Warhammer 40k Ork Boy, muscular green brute in scrap metal armor, holding crude Choppa cleaver and heavy Slugga pistol, high-fidelity miniature render',
  'chaos-chosen': 'Warhammer 40k Chaos Chosen Warrior, baroque corrupted power armor with horns, holding daemon sword, high-fidelity miniature render',
  'hormagaunt': 'Warhammer 40k Tyranid Hormagaunt swarm bioform, chitinous purple carapace, beige bio-flesh, four bounding legs, two huge razor scything talons, snarling bio-jaw, dynamic ground stance, high-fidelity miniature render, studio neutral background',
};

async function main() {
  const args = process.argv.slice(2);
  const apiKey = getMeshyApiKey();

  let targetUnit: string | undefined;
  let customPrompt: string | undefined;
  let outputName: string | undefined;

  const unitIdx = args.indexOf('--unit');
  if (unitIdx !== -1 && args[unitIdx + 1]) {
    targetUnit = args[unitIdx + 1];
  }
  const promptIdx = args.indexOf('--prompt');
  if (promptIdx !== -1 && args[promptIdx + 1]) {
    customPrompt = args[promptIdx + 1];
  }
  const nameIdx = args.indexOf('--name');
  if (nameIdx !== -1 && args[nameIdx + 1]) {
    outputName = args[nameIdx + 1];
  }

  const slug = outputName || targetUnit || 'aeldari-guardian';
  let prompt = customPrompt || (targetUnit ? CANONICAL_IMAGE_PROMPTS[targetUnit] : undefined);

  if (!prompt && targetUnit) {
    const unitFile = path.join(UNITS_DIR, `${targetUnit}.json`);
    if (fs.existsSync(unitFile)) {
      try {
        const u = JSON.parse(fs.readFileSync(unitFile, 'utf-8'));
        prompt = `Warhammer 40k ${u.name}, ${u.faction}, ${u.role}, high-fidelity miniature render, clean studio background`;
      } catch (e) {}
    }
  }

  if (!prompt) {
    prompt = CANONICAL_IMAGE_PROMPTS['guardian-defender'];
  }

  console.log('🏛️  StatVault Meshy Text-to-Image Generator (Nano Banana Pro)');
  console.log('===========================================================');
  console.log(`Model Engine: nano-banana-pro`);
  console.log(`Target Slug:  ${slug}`);
  console.log(`Prompt:       "${prompt}"`);

  // Step 1: Submit Text-to-Image task
  console.log('\nSubmitting task to Meshy Text-to-Image API...');
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
      prompt: prompt,
      ai_model: 'nano-banana-pro',
    }
  );

  const taskId = createRes.result || createRes.id;
  if (!taskId) {
    throw new Error(`Did not receive a task ID from Meshy: ${JSON.stringify(createRes)}`);
  }
  console.log(`✓ Task created: ${taskId}`);

  // Step 2: Poll for completion
  console.log('Polling image generation (typically takes 15-30 seconds)...');
  let finished = false;
  let imageUrl: string | undefined;

  while (!finished) {
    await new Promise((r) => setTimeout(r, 4000));
    const statusRes = await requestJson({
      hostname: 'api.meshy.ai',
      path: `/openapi/v1/text-to-image/${taskId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const progress = statusRes.progress ?? 0;
    const status = statusRes.status;
    console.log(`  Status: ${status} (${progress}%)`);

    if (status === 'SUCCEEDED') {
      finished = true;
      imageUrl = statusRes.image_urls?.[0];
      break;
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Meshy task ${taskId} ended with status: ${status}.`);
    }
  }

  if (!imageUrl) {
    throw new Error('Task succeeded but no image URL was returned.');
  }

  // Step 3: Download image
  if (!fs.existsSync(ART_DIR)) {
    fs.mkdirSync(ART_DIR, { recursive: true });
  }
  const outPath = path.join(ART_DIR, `${slug.replace(/-/g, '_')}_miniature.png`);
  console.log(`\nDownloading miniature render to: ${outPath}...`);
  await downloadFile(imageUrl, outPath);
  console.log(`✓ Successfully saved ${path.basename(outPath)}`);
  console.log('\n===========================================================');
  console.log(`🚀 Miniature art ready: /assets/art/${path.basename(outPath)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error generating Meshy image:', err.message);
    process.exit(1);
  });
}
