const https = require('https');
const fs = require('fs');
const path = require('path');

const apiKey = 'msy_b95iMAKXmOmaJ5qu0JREDvb8hFrAAYuWA2z9';

const tasksToRun = [
  {
    type: 'weapon',
    name: 'meshy_weapon_boltgun',
    prompt: 'Warhammer 40k Imperial Space Marine Godwyn-pattern Boltgun rifle, heavy .75 caliber explosive bolt rifle, matte black casing with golden imperial aquila, sickle magazine, rugged tactical weapon render, isolated on clean neutral studio background'
  },
  {
    type: 'scene',
    name: 'meshy_scene_cadia',
    prompt: 'Warhammer 40k cinematic lore scene: Battle of Cadia, imperial guardsmen defending a burning ferrocrete trench line beneath a violet warp storm sky as Chaos Space Marines charge through the smoke, grimdark gothic warfare, dramatic action scene'
  },
  {
    type: 'concept',
    name: 'meshy_concept_tomb_world',
    prompt: 'Warhammer 40k concept art: ancient Necron Tomb World subterranean throne chamber, monolithic black obsidian pyramids with glowing green necrodermis glyphs and levitating dynastic stasis crypts, dark sci-fi architectural concept art'
  },
  {
    type: 'artifact',
    name: 'meshy_artifact_spirit_stone',
    prompt: 'Warhammer 40k relic artifact: an ancient glowing Aeldari Spirit Stone jewel set into an ornate wraithbone talisman pendant, pulsating with psychic azure soul energy, miniature relic render on neutral studio backdrop'
  }
];

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function run() {
  console.log('Submitting 4 generation tasks to Meshy (Nano Banana Pro)...');
  const active = [];

  for (const item of tasksToRun) {
    const res = await request({
      hostname: 'api.meshy.ai',
      path: '/openapi/v1/text-to-image',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    }, {
      prompt: item.prompt,
      ai_model: 'nano-banana-pro'
    });

    const taskId = res.body.result || res.body.id;
    console.log('Submitted [' + item.type + '] -> Task ID: ' + taskId + ' (HTTP ' + res.status + ')');
    active.push({ ...item, taskId, finished: false });
  }

  console.log('\nPolling Meshy tasks for completion...');
  let remaining = active.length;

  while (remaining > 0) {
    await new Promise(r => setTimeout(r, 5000));
    for (const item of active) {
      if (item.finished) continue;

      const res = await request({
        hostname: 'api.meshy.ai',
        path: '/openapi/v1/text-to-image/' + item.taskId,
        headers: { 'Authorization': 'Bearer ' + apiKey }
      });

      const data = res.body;
      const progress = data.progress !== undefined ? data.progress : 0;
      const status = data.status;
      console.log('  [' + item.type + '] status: ' + status + ' (' + progress + '%)');

      if (status === 'SUCCEEDED') {
        item.finished = true;
        remaining--;
        const imgUrl = data.image_urls && data.image_urls[0];
        if (imgUrl) {
          const dest = path.join(__dirname, '..', 'assets/art', item.name + '.png');
          await download(imgUrl, dest);
          console.log('  ✓ Saved: ' + dest);
        }
      } else if (status === 'FAILED' || status === 'EXPIRED') {
        item.finished = true;
        remaining--;
        console.error('  ✗ [' + item.type + '] failed:', data);
      }
    }
  }
  console.log('\nAll 4 Meshy generation tasks finished successfully!');
}

run().catch(console.error);
