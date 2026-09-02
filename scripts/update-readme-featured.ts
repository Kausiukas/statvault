/**
 * StatVault Featured Readme Header Generator
 *
 * Automatically inspects the latest corpus ingestion (unit, weapon, lore, visual asset)
 * and updates the top featured hero section of README.md with the picture, description,
 * badges, and Dual-Lens tactical statistics.
 *
 * Usage:
 *   npx ts-node scripts/update-readme-featured.ts
 *   npx ts-node scripts/update-readme-featured.ts --unit necron-immortal
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');
const README_PATH = path.join(REPO_ROOT, 'README.md');
const UNITS_DIR = path.join(REPO_ROOT, 'data/units');
const WEAPONS_DIR = path.join(REPO_ROOT, 'data/weapons');
const COVERAGE_PATH = path.join(REPO_ROOT, 'data/COVERAGE.md');

const TAG_START = '<!-- FEATURED_HEADER_START -->';
const TAG_END = '<!-- FEATURED_HEADER_END -->';

const FACTION_COLORS: Record<string, string> = {
  necrons: '00ff66',
  adeptus_astartes: '0055aa',
  astra_militarum: '446633',
  aeldari: '00cccc',
  tyranids: 'aa33aa',
  tau: '3399cc',
  chaos_space_marines: 'cc2222',
  orks: '228822',
};

function resolveLatestUnitSlug(requestedSlug?: string): string {
  if (requestedSlug) return requestedSlug;

  // 1. Check COVERAGE.md changelog
  if (fs.existsSync(COVERAGE_PATH)) {
    const content = fs.readFileSync(COVERAGE_PATH, 'utf-8');
    const match = content.match(/\|\s*\d{4}-\d{2}-\d{2}\s*\|\s*\x60([a-z0-9-]+)\x60/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. Scan data/units/ sorted by mtime descending
  if (fs.existsSync(UNITS_DIR)) {
    const files = fs
      .readdirSync(UNITS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({
        slug: f.replace('.json', ''),
        mtime: fs.statSync(path.join(UNITS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > 0) {
      return files[0].slug;
    }
  }

  throw new Error('No unit found in data/units/ to feature.');
}

function resolveUnitImage(unitSlug: string, artImagePath?: string): string {
  const normalized = unitSlug.replace(/-/g, '_');
  const candidates = [
    `assets/art/${normalized}_concept.png`,
    `assets/art/${unitSlug}_concept.png`,
    artImagePath ? artImagePath.replace(/^\//, '') : undefined,
    `assets/art/${normalized}.png`,
    `assets/art/${normalized}.jpg`,
    `assets/art/${unitSlug}.png`,
    `assets/art/${unitSlug}.jpg`,
    `assets/art/${normalized}_multiview_0.png`,
    `assets/art/${unitSlug}_multiview_0.png`,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (fs.existsSync(path.join(REPO_ROOT, c))) {
      return c;
    }
  }

  return 'assets/art/space_marine_intercessor.jpg';
}

function generateFeaturedHtml(unit: any, weapon: any, imageRelativePath: string): string {
  const factionName = unit.faction.replace(/_/g, ' ').toUpperCase();
  const factionColor = FACTION_COLORS[unit.faction] || '555555';
  const roleName = (unit.role || 'Infantry').replace(/_/g, ' ').toUpperCase();
  const cost = unit.engineStats?.baseCostPoints
    ? `${unit.engineStats.baseCostPoints} pts`
    : unit.engineStats?.costPoints
    ? `${unit.engineStats.costPoints} pts`
    : 'Standard';

  const engineHp = unit.engineStats?.hitPoints ?? unit.engineStats?.hp ?? 'N/A';
  const engineArmor = unit.engineStats?.armor ?? unit.engineStats?.armorRating ?? 'N/A';
  const engineSpeed = unit.engineStats?.speedMps
    ? `${(unit.engineStats.speedMps * 2.237).toFixed(1)} mph (${(unit.engineStats.speedMps * 3.6).toFixed(1)} km/h)`
    : 'N/A';
  const loreArmor = unit.loreStats?.armorEquivalentRHAmm
    ? `${unit.loreStats.armorEquivalentRHAmm}mm RHAe`
    : unit.loreStats?.armorComposition || 'Reinforced Plating';
  const weaponName = weapon ? weapon.name : (unit.primaryWeaponSlug || 'Standard Issue');
  const weaponAp = weapon ? `AP: ${weapon.engineDamage?.armorPenetration}` : '';
  const weaponDmg = weapon ? `Base Dmg: ${weapon.engineDamage?.baseDamage}` : '';

  const unitJsonPath = `data/units/${unit.slug}.json`;
  const weaponJsonPath = weapon ? `data/weapons/${weapon.slug}.json` : undefined;
  const glbPath = unit.asset3d?.optimizedGlbPath
    ? unit.asset3d.optimizedGlbPath.replace(/^\//, 'public/')
    : `public/models/${unit.slug}.glb`;
  const hasGlb = fs.existsSync(path.join(REPO_ROOT, glbPath)) || fs.existsSync(path.join(REPO_ROOT, `public/models/${unit.slug}.glb`));

  const unitMv0 = `assets/art/${unit.slug}_multiview_0.png`;
  const unitMv1 = `assets/art/${unit.slug}_multiview_1.png`;
  const unitMv2 = `assets/art/${unit.slug}_multiview_2.png`;
  const hasUnitMv = fs.existsSync(path.join(REPO_ROOT, unitMv0)) &&
                    fs.existsSync(path.join(REPO_ROOT, unitMv1)) &&
                    fs.existsSync(path.join(REPO_ROOT, unitMv2));

  const weaponSlug = weapon ? weapon.slug : unit.primaryWeaponSlug;
  const weaponMv0 = weaponSlug ? `assets/art/${weaponSlug}_multiview_0.png` : undefined;
  const weaponMv1 = weaponSlug ? `assets/art/${weaponSlug}_multiview_1.png` : undefined;
  const weaponMv2 = weaponSlug ? `assets/art/${weaponSlug}_multiview_2.png` : undefined;
  const hasWeaponMv = weaponMv0 && weaponMv1 && weaponMv2 &&
                      fs.existsSync(path.join(REPO_ROOT, weaponMv0)) &&
                      fs.existsSync(path.join(REPO_ROOT, weaponMv1)) &&
                      fs.existsSync(path.join(REPO_ROOT, weaponMv2));

  const conceptPath = `assets/art/${unit.slug}_concept.png`;
  const hasConcept = fs.existsSync(path.join(REPO_ROOT, conceptPath));

  // Determine primary spotlight image for the core dossier
  const spotlightImage = hasUnitMv
    ? unitMv0
    : fs.existsSync(path.join(REPO_ROOT, `assets/art/${unit.slug}.png`))
    ? `assets/art/${unit.slug}.png`
    : imageRelativePath;

  let html = `${TAG_START}\n<div align="center">\n\n`;
  html += `## 🌟 Daily Featured Dataslate: ${unit.name}\n`;
  html += `*Autonomous Ingestion Pipeline — Canonical Lore Research, Multi-View Asset Suite & Battlefield Concept Art*\n\n`;

  // 1. Hero Battlefield Concept Art Banner (if available)
  if (hasConcept) {
    html += `<table>\n`;
    html += `  <tr>\n`;
    html += `    <td align="center">\n`;
    html += `      <img src="${conceptPath}" alt="${unit.name} in Action" width="100%" style="border-radius: 8px;" />\n`;
    html += `      <br/>\n`;
    html += `      <sub><b>⚔️ Tactical Reconnaissance Visual:</b> <i>${unit.name} deployed in active battlefield engagement</i></sub>\n`;
    html += `    </td>\n`;
    html += `  </tr>\n`;
    html += `</table>\n\n`;
  }

  // 2. Core Tactical Dossier (Two-Column Layout)
  html += `<table>\n`;
  html += `  <tr>\n`;
  html += `    <td width="38%" align="center" valign="middle">\n`;
  html += `      <img src="${spotlightImage}" alt="${unit.name}" width="100%" style="border-radius: 8px; max-height: 320px; object-fit: contain;" />\n`;
  html += `      <br/>\n`;
  html += `      <sub><b>StatVault Asset:</b> Primary Tactical Profile</sub>\n`;
  html += `    </td>\n`;
  html += `    <td width="62%" valign="top">\n`;
  html += `      <h3><b>${unit.name}</b></h3>\n`;
  html += `      <p>\n`;
  html += `        <img src="https://img.shields.io/badge/Faction-${encodeURIComponent(factionName)}-${factionColor}?style=flat-square" />\n`;
  html += `        <img src="https://img.shields.io/badge/Role-${encodeURIComponent(roleName)}-blue?style=flat-square" />\n`;
  html += `        <img src="https://img.shields.io/badge/Engine_Cost-${encodeURIComponent(cost)}-gold?style=flat-square" />\n`;
  html += `      </p>\n`;
  html += `      <p><b>📖 Tactical Analysis:</b><br/>\n`;
  html += `      <i>"${unit.tacticalDescription}"</i></p>\n`;
  html += `      <p><b>⚡ Dual-Lens Engine vs Lore Balance:</b><br/>\n`;
  html += `      • <b>Lore Armor Protection:</b> ${loreArmor}<br/>\n`;
  html += `      • <b>In-Engine Durability:</b> ${engineHp} HP (Armor Rating: ${engineArmor})<br/>\n`;
  html += `      • <b>RTS Tactical Speed:</b> ${engineSpeed}<br/>\n`;
  html += `      • <b>Primary Armament:</b> ${weaponName} ${weaponAp ? `(${weaponAp}, ${weaponDmg})` : ''}<br/>\n`;
  html += `      • <b>Lore Phenomenon:</b> ${unit.loreStats?.loreSummary ? unit.loreStats.loreSummary.slice(0, 140) + '...' : 'Classified military record.'}</p>\n`;
  html += `    </td>\n`;
  html += `  </tr>\n`;
  html += `</table>\n\n`;

  // 3. Multi-Angle Orthographic Views (Unit)
  if (hasUnitMv) {
    html += `<table>\n`;
    html += `  <tr>\n`;
    html += `    <th colspan="3" align="center">🧬 Unit Orthographic Multi-View (3 Angles)</th>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td width="33%" align="center"><sub><b>Front Profile (0°)</b></sub><br/><br/><a href="${unitMv0}"><img src="${unitMv0}" width="150" alt="Front Profile" /></a></td>\n`;
    html += `    <td width="33%" align="center"><sub><b>Flank Profile (90°)</b></sub><br/><br/><a href="${unitMv1}"><img src="${unitMv1}" width="150" alt="Flank Profile" /></a></td>\n`;
    html += `    <td width="33%" align="center"><sub><b>Dorsal Profile (180°)</b></sub><br/><br/><a href="${unitMv2}"><img src="${unitMv2}" width="150" alt="Dorsal Profile" /></a></td>\n`;
    html += `  </tr>\n`;
    html += `</table>\n\n`;
  }

  // 4. Multi-Angle Weapon Inspection (Armament)
  if (hasWeaponMv && weaponMv0 && weaponMv1 && weaponMv2) {
    html += `<table>\n`;
    html += `  <tr>\n`;
    html += `    <th colspan="3" align="center">⚔️ Primary Armament Multi-View: ${weaponName}</th>\n`;
    html += `  </tr>\n`;
    html += `  <tr>\n`;
    html += `    <td width="33%" align="center"><sub><b>Lateral Aspect</b></sub><br/><br/><a href="${weaponMv0}"><img src="${weaponMv0}" width="90" alt="Weapon View 1" /></a></td>\n`;
    html += `    <td width="33%" align="center"><sub><b>Dorsal Aspect</b></sub><br/><br/><a href="${weaponMv1}"><img src="${weaponMv1}" width="90" alt="Weapon View 2" /></a></td>\n`;
    html += `    <td width="33%" align="center"><sub><b>Cutting/Barrel Aspect</b></sub><br/><br/><a href="${weaponMv2}"><img src="${weaponMv2}" width="90" alt="Weapon View 3" /></a></td>\n`;
    html += `  </tr>\n`;
    html += `</table>\n\n`;
  }

  // 5. Navigation Toolbar
  html += `<p align="center">\n`;
  html += `  <a href="${unitJsonPath}"><b>📄 Inspect Unit Dataslate (.json)</b></a>`;
  if (weaponJsonPath) {
    html += ` • <a href="${weaponJsonPath}"><b>💥 Weapon Specs (.json)</b></a>`;
  }
  if (hasGlb) {
    html += ` • <a href="public/models/${unit.slug}.glb"><b>🎮 3D Model (.glb)</b></a>`;
  }
  html += `\n</p>\n\n`;

  html += `</div>\n\n---\n${TAG_END}`;
  return html;
}

async function main() {
  const args = process.argv.slice(2);
  let targetSlug: string | undefined;

  const unitIdx = args.indexOf('--unit');
  if (unitIdx !== -1 && args[unitIdx + 1]) {
    targetSlug = args[unitIdx + 1];
  }

  const slug = resolveLatestUnitSlug(targetSlug);
  console.log(`🏛️  Updating README Featured Header for: ${slug}`);

  const unitPath = path.join(UNITS_DIR, `${slug}.json`);
  if (!fs.existsSync(unitPath)) {
    throw new Error(`Unit dataslate not found at: ${unitPath}`);
  }

  const unit = JSON.parse(fs.readFileSync(unitPath, 'utf-8'));
  let weapon: any = undefined;
  if (unit.primaryWeaponSlug) {
    const weaponPath = path.join(WEAPONS_DIR, `${unit.primaryWeaponSlug}.json`);
    if (fs.existsSync(weaponPath)) {
      weapon = JSON.parse(fs.readFileSync(weaponPath, 'utf-8'));
    }
  }

  const imagePath = resolveUnitImage(slug, unit.artImagePath);
  console.log(`✓ Resolved featured image: ${imagePath}`);

  const featuredBlock = generateFeaturedHtml(unit, weapon, imagePath);

  if (!fs.existsSync(README_PATH)) {
    throw new Error(`README.md not found at: ${README_PATH}`);
  }

  let readmeContent = fs.readFileSync(README_PATH, 'utf-8');

  if (readmeContent.includes(TAG_START) && readmeContent.includes(TAG_END)) {
    const regex = new RegExp(`${TAG_START}[\\s\\S]*?${TAG_END}`, 'g');
    readmeContent = readmeContent.replace(regex, featuredBlock);
    console.log('✓ Replaced existing featured header block in README.md');
  } else {
    // Insert after line 32 (right after the closing </div align="center"> or before Vision Statement)
    const visionAnchor = '## ⚡ Vision Statement & The Dual-Lens Perspective';
    if (readmeContent.includes(visionAnchor)) {
      readmeContent = readmeContent.replace(visionAnchor, `${featuredBlock}\n\n${visionAnchor}`);
      console.log('✓ Inserted featured header block before Vision Statement');
    } else {
      readmeContent = featuredBlock + '\n\n' + readmeContent;
      console.log('✓ Prepended featured header block to top of README.md');
    }
  }

  fs.writeFileSync(README_PATH, readmeContent, 'utf-8');
  console.log(`🚀 Successfully updated README.md with featured unit: ${unit.name}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error updating README featured header:', err.message);
    process.exit(1);
  });
}
