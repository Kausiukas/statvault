/**
 * StatVault Meshy 3D Model Generator CLI
 *
 * Uses the Meshy Text-to-3D REST API to generate textured 3D .glb assets for StatVault units.
 * Reads API key from MESHY_API_KEY environment variable or apis.txt.
 *
 * Usage:
 *   npx ts-node scripts/generate-meshy-model.ts --unit necron-immortal
 *   npx ts-node scripts/generate-meshy-model.ts --prompt "Warhammer 40k Aeldari Guardian Defender" --name guardian-defender
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const REPO_ROOT = path.resolve(__dirname, '..');
const MODELS_DIR = path.join(REPO_ROOT, 'public/models');
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

const UNIT_PROMPTS: Record<string, string> = {
  'necron-immortal': 'Warhammer 40k Necron Immortal ancient metallic skeletal cybernetic warrior, holding a Gauss Blaster rifle, glowing green dynastic energy, living metal silver chassis, T-pose',
  'guardian-defender': 'Warhammer 40k Aeldari Craftworld Guardian Defender, psychoreactive smooth thermoplas mesh armor, sleek crest helmet, holding Shuriken Catapult, T-pose, high-fidelity miniature render',
  'hormagaunt': 'Warhammer 40k Tyranid Hormagaunt swarm bioform, chitinous carapace, four bounding legs, two huge razor scything talons, snarling bio-jaw, dynamic ground stance',
  'fire-warrior': 'Warhammer 40k Tau Fire Warrior Strike Team soldier, sleek ceramic combat armor, cyclopean sensor helmet, holding Pulse Rifle, T-pose, clean battle-ready finish',
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

  const prompt = customPrompt || (targetUnit ? UNIT_PROMPTS[targetUnit] : undefined);
  const slug = outputName || targetUnit || 'generated-model';

  if (!prompt) {
    console.error('Usage: ts-node scripts/generate-meshy-model.ts --unit <slug> OR --prompt "<text>" --name <name>');
    process.exit(1);
  }

  console.log('🏛️  StatVault Meshy 3D Model Generator');
  console.log('=======================================');
  console.log(`Model Slug: ${slug}`);
  console.log(`Prompt: "${prompt}"`);

  // Step 1: Create preview task
  console.log('\nSubmitting text-to-3d generation task to Meshy API...');
  const createRes = await requestJson(
    {
      hostname: 'api.meshy.ai',
      path: '/openapi/v2/text-to-3d',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
    {
      mode: 'preview',
      prompt: prompt,
      art_style: 'realistic',
    }
  );

  const taskId = createRes.result || createRes.id;
  if (!taskId) {
    throw new Error(`Did not receive a task ID from Meshy: ${JSON.stringify(createRes)}`);
  }
  console.log(`✓ Task created: ${taskId}`);

  // Step 2: Poll for completion
  console.log('Polling generation progress (typically takes 1-2 minutes)...');
  let finished = false;
  let glbUrl: string | undefined;

  while (!finished) {
    await new Promise((r) => setTimeout(r, 6000));
    const statusRes = await requestJson({
      hostname: 'api.meshy.ai',
      path: `/openapi/v2/text-to-3d/${taskId}`,
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
      glbUrl = statusRes.model_urls?.glb;
      break;
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      throw new Error(`Meshy task ${taskId} ended with status: ${status}. Details: ${statusRes.task_error?.message}`);
    }
  }

  if (!glbUrl) {
    throw new Error('Task succeeded but no GLB URL was returned.');
  }

  // Step 3: Download GLB
  const outGlbPath = path.join(MODELS_DIR, `${slug}.glb`);
  console.log(`\nDownloading GLB model to: ${outGlbPath}...`);
  await downloadFile(glbUrl, outGlbPath);
  const sizeMb = (fs.statSync(outGlbPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Successfully downloaded ${slug}.glb (${sizeMb} MB)`);
  console.log('\n=======================================');
  console.log(`🚀 3D asset ready for StatVault: /models/${slug}.glb`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error generating 3D model:', err.message);
    process.exit(1);
  });
}
