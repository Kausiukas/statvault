#!/usr/bin/env node
/**
 * StatVault Meshy 3D Generation & Animation CLI
 */

import { MeshyClient } from './meshy-generator';
import path from 'path';
import fs from 'fs';

const DEFAULT_API_KEY = 'msy_b95iMAKXmOmaJ5qu0JREDvb8hFrAAYuWA2z9';

const UNIT_PROMPTS: Record<string, string> = {
  'space-marine': 'Warhammer 40k Ultramarines Space Marine Primaris Intercessor in Mark X power armor holding bolt rifle, full body, T-pose, realistic sci-fi armor',
  'kasrkin': 'Warhammer 40k Astra Militarum Kasrkin Elite Grenadier in carapace armor with hotshot lasgun, full body, T-pose, realistic military sci-fi',
  'cadian': 'Warhammer 40k Astra Militarum Cadian Shock Trooper Guardsman in flak armor with lasgun, full body, T-pose, realistic military',
  'ork-boy': 'Warhammer 40k Ork Boy with slugga and choppa cleaver, muscular green skin, crude armor, full body, T-pose, realistic',
  'chaos-chosen': 'Warhammer 40k Chaos Space Marines Chosen warrior in horned corrupted power armor with daemon blade, full body, T-pose, realistic',
};

async function main() {
  const args = process.argv.slice(2);
  const unitKey = args[0] || 'space-marine';
  const prompt = UNIT_PROMPTS[unitKey] || UNIT_PROMPTS['space-marine'];

  console.log('===============================================================');
  console.log(`⚡ STATVAULT 3D PIPELINE: COMMENCING MESHY 3D GENERATION`);
  console.log(`🎯 Unit: ${unitKey}`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log('===============================================================');

  const client = new MeshyClient({ apiKey: process.env.MESHY_API_KEY || DEFAULT_API_KEY });

  // Phase 1: Preview
  console.log('\n[Phase 1/3] Generating Preview Base Mesh...');
  const previewTaskId = await client.createPreview({ prompt, artStyle: 'realistic' });
  console.log(`>> Preview Task ID: ${previewTaskId}`);

  const previewResult = await client.pollTask(previewTaskId, 'v2/text-to-3d', (p, s) => {
    process.stdout.write(`\r>> Progress: ${p}% [Status: ${s}]`);
  });
  console.log('\n>> Preview Completed! GLB URL:', previewResult.model_urls?.glb);

  // Phase 2: Refine Textures
  console.log('\n[Phase 2/3] Generating Refined PBR Textures...');
  const refineTaskId = await client.createRefine(previewTaskId);
  console.log(`>> Refine Task ID: ${refineTaskId}`);

  const refineResult = await client.pollTask(refineTaskId, 'v2/text-to-3d', (p, s) => {
    process.stdout.write(`\r>> Progress: ${p}% [Status: ${s}]`);
  });
  console.log('\n>> Refine Completed! PBR GLB URL:', refineResult.model_urls?.glb);

  // Phase 3: Auto-Rigging & Animation
  if (refineResult.model_urls?.glb) {
    console.log('\n[Phase 3/3] Auto-Rigging & Generating Animations...');
    const rigTaskId = await client.createRigging(refineResult.model_urls.glb);
    console.log(`>> Rigging Task ID: ${rigTaskId}`);

    const rigResult = await client.pollTask(rigTaskId, 'v1/rigging', (p, s) => {
      process.stdout.write(`\r>> Progress: ${p}% [Status: ${s}]`);
    });
    console.log('\n>> Rigging & Animations Completed!');
    console.log('>> Rigged GLB:', rigResult.result?.rigged_character_glb_url);
    console.log('>> Walking Animation GLB:', rigResult.result?.basic_animations?.walking_glb_url);
    console.log('>> Running Animation GLB:', rigResult.result?.basic_animations?.running_glb_url);

    // Download assets locally
    const outputDir = path.join(process.cwd(), 'public', 'models');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    if (refineResult.model_urls?.glb) {
      const pbrDest = path.join(outputDir, `${unitKey}-pbr.glb`);
      console.log(`\nSaving PBR Master model to ${pbrDest}...`);
      await client.downloadFile(refineResult.model_urls.glb, pbrDest);
    }
  }

  console.log('\n===============================================================');
  console.log('✅ ALL 3D PIPELINE PHASES SUCCEEDED');
  console.log('===============================================================\n');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Pipeline error:', err);
    process.exit(1);
  });
}
