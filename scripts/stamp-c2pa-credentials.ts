/**
 * StatVault C2PA & Provenance Metadata Stamping Engine
 *
 * Stamps generated images with Content Credentials / C2PA / Adobe XMP / IPTC metadata:
 * - Made by: StatVault
 * - Producer / Domain: marketing.ekopolimeras.com
 * - Digital Source Type: trainedAlgorithmicMedia (IPTC standard)
 * - Rights & Attribution: Copyright (c) 2026 StatVault. Curated by marketing.ekopolimeras.com
 *
 * Operates losslessly on both PNG and JPEG images.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const REPO_ROOT = path.resolve(__dirname, '..');
const ART_DIR = path.join(REPO_ROOT, 'assets/art');

interface ProvenanceMetadata {
  creator: string;
  domain: string;
  sourceUrl: string;
  credit: string;
  copyright: string;
  claimGenerator: string;
  title?: string;
  description?: string;
}

const DEFAULT_METADATA: ProvenanceMetadata = {
  creator: 'StatVault',
  domain: 'marketing.ekopolimeras.com',
  sourceUrl: 'https://marketing.ekopolimeras.com',
  credit: 'Made by StatVault / marketing.ekopolimeras.com',
  copyright: 'Copyright (c) 2026 StatVault. Curated by marketing.ekopolimeras.com',
  claimGenerator: 'StatVault Content Credentials Engine (marketing.ekopolimeras.com)',
  title: 'StatVault Canonical Warhammer 40k Visual Asset',
  description: 'Verified digital asset produced for StatVault Terminal by marketing.ekopolimeras.com',
};

function generateXmpXml(meta: ProvenanceMetadata): string {
  const nowIso = new Date().toISOString();
  return (
    `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>\n` +
    `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000">\n` +
    `  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n` +
    `           xmlns:dc="http://purl.org/dc/elements/1.1/"\n` +
    `           xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"\n` +
    `           xmlns:xmp="http://ns.adobe.com/xap/1.0/"\n` +
    `           xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"\n` +
    `           xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"\n` +
    `           xmlns:c2pa="http://c2pa.org/schema/1.0/">\n` +
    `    <rdf:Description rdf:about=""\n` +
    `      photoshop:Credit="${meta.credit}"\n` +
    `      photoshop:Source="${meta.sourceUrl}"\n` +
    `      xmpRights:Marked="True"\n` +
    `      xmpRights:WebStatement="${meta.sourceUrl}"\n` +
    `      Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"\n` +
    `      Iptc4xmpExt:DigitalSourceFileType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"\n` +
    `      c2pa:claim_generator="${meta.claimGenerator}"\n` +
    `      xmp:ModifyDate="${nowIso}"\n` +
    `      xmp:MetadataDate="${nowIso}">\n` +
    `      <dc:creator>\n` +
    `        <rdf:Seq>\n` +
    `          <rdf:li>${meta.creator}</rdf:li>\n` +
    `          <rdf:li>${meta.domain}</rdf:li>\n` +
    `        </rdf:Seq>\n` +
    `      </dc:creator>\n` +
    `      <dc:rights>\n` +
    `        <rdf:Alt>\n` +
    `          <rdf:li xml:lang="x-default">${meta.copyright}</rdf:li>\n` +
    `        </rdf:Alt>\n` +
    `      </dc:rights>\n` +
    `      <dc:title>\n` +
    `        <rdf:Alt>\n` +
    `          <rdf:li xml:lang="x-default">${meta.title}</rdf:li>\n` +
    `        </rdf:Alt>\n` +
    `      </dc:title>\n` +
    `      <dc:description>\n` +
    `        <rdf:Alt>\n` +
    `          <rdf:li xml:lang="x-default">${meta.description}</rdf:li>\n` +
    `        </rdf:Alt>\n` +
    `      </dc:description>\n` +
    `    </rdf:Description>\n` +
    `  </rdf:RDF>\n` +
    `</x:xmpmeta>\n` +
    `<?xpacket end="w"?>`
  );
}

function makePngTextChunk(keyword: string, text: string): Buffer {
  const keyBuf = Buffer.from(keyword, 'ascii');
  const nullBuf = Buffer.from([0]);
  const textBuf = Buffer.from(text, 'utf-8');
  const data = Buffer.concat([keyBuf, nullBuf, textBuf]);

  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from('tEXt', 'ascii');
  const crc = zlib.crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePngItxtChunk(keyword: string, text: string): Buffer {
  const keyBuf = Buffer.from(keyword, 'ascii');
  const nullBuf = Buffer.from([0]);
  const compFlag = Buffer.from([0]);
  const compMethod = Buffer.from([0]);
  const langTag = Buffer.from([0]);
  const transKey = Buffer.from([0]);
  const textBuf = Buffer.from(text, 'utf-8');

  const data = Buffer.concat([keyBuf, nullBuf, compFlag, compMethod, langTag, transKey, textBuf]);

  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from('iTXt', 'ascii');
  const crc = zlib.crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function stampPng(filePath: string, meta: ProvenanceMetadata = DEFAULT_METADATA): boolean {
  const buf = fs.readFileSync(filePath);
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    return false;
  }

  // Parse existing chunks to remove any stale custom tEXt or XMP iTXt chunks
  let offset = 8;
  const filteredChunks: Buffer[] = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const totalChunkLen = 12 + length;
    const chunkData = buf.slice(offset, offset + totalChunkLen);

    // Keep all chunks except old metadata chunks that we replace
    if (type === 'tEXt') {
      const kw = chunkData.slice(8, 8 + Math.min(length, 30)).toString('ascii');
      if (kw.startsWith('Author') || kw.startsWith('Copyright') || kw.startsWith('Source') || kw.startsWith('Credit')) {
        offset += totalChunkLen;
        continue;
      }
    } else if (type === 'iTXt') {
      const kw = chunkData.slice(8, 8 + Math.min(length, 30)).toString('ascii');
      if (kw.startsWith('XML:com.adobe.xmp')) {
        offset += totalChunkLen;
        continue;
      }
    }

    filteredChunks.push(chunkData);
    offset += totalChunkLen;
  }

  // Find position after IHDR
  const ihdrChunk = filteredChunks[0]; // IHDR is always first
  const remainingChunks = filteredChunks.slice(1);

  const xmpXml = generateXmpXml(meta);
  const newChunks: Buffer[] = [
    makePngItxtChunk('XML:com.adobe.xmp', xmpXml),
    makePngTextChunk('Author', meta.creator),
    makePngTextChunk('Credit', meta.credit),
    makePngTextChunk('Copyright', meta.copyright),
    makePngTextChunk('Source', meta.sourceUrl),
    makePngTextChunk('C2PA_Claim_Generator', meta.claimGenerator),
    makePngTextChunk('DigitalSourceType', 'trainedAlgorithmicMedia'),
  ];

  const stampedBuf = Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    ihdrChunk,
    Buffer.concat(newChunks),
    Buffer.concat(remainingChunks),
  ]);

  fs.writeFileSync(filePath, stampedBuf);
  return true;
}

function stampJpg(filePath: string, meta: ProvenanceMetadata = DEFAULT_METADATA): boolean {
  const buf = fs.readFileSync(filePath);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    return false; // Not a JPEG
  }

  const xmpXml = generateXmpXml(meta);
  const xmpHeader = Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'ascii');
  const xmpPayload = Buffer.from(xmpXml, 'utf-8');
  const app1Data = Buffer.concat([xmpHeader, xmpPayload]);

  const app1Len = 2 + app1Data.length;
  const app1Marker = Buffer.alloc(4);
  app1Marker.writeUInt8(0xff, 0);
  app1Marker.writeUInt8(0xe1, 1);
  app1Marker.writeUInt16BE(app1Len, 2);
  const app1Segment = Buffer.concat([app1Marker, app1Data]);

  // COM (comment) segment
  const commentStr = `${meta.credit} | ${meta.sourceUrl}`;
  const commentData = Buffer.from(commentStr, 'utf-8');
  const comLen = 2 + commentData.length;
  const comMarker = Buffer.alloc(4);
  comMarker.writeUInt8(0xff, 0);
  comMarker.writeUInt8(0xfe, 1);
  comMarker.writeUInt16BE(comLen, 2);
  const comSegment = Buffer.concat([comMarker, commentData]);

  // Insert right after SOI marker (bytes 0-1)
  const stampedBuf = Buffer.concat([
    buf.slice(0, 2),
    comSegment,
    app1Segment,
    buf.slice(2),
  ]);

  fs.writeFileSync(filePath, stampedBuf);
  return true;
}

export function stampImageFile(filePath: string, meta: ProvenanceMetadata = DEFAULT_METADATA): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') {
    return stampPng(filePath, meta);
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return stampJpg(filePath, meta);
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  let targetFile: string | undefined;
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    targetFile = args[fileIdx + 1];
  }

  console.log('🏛️  StatVault C2PA & Provenance Metadata Stamping Engine');
  console.log('===========================================================');
  console.log(`Creator:         ${DEFAULT_METADATA.creator}`);
  console.log(`Domain & Source: ${DEFAULT_METADATA.sourceUrl}`);
  console.log(`Credit:          ${DEFAULT_METADATA.credit}`);
  console.log(`C2PA Generator:  ${DEFAULT_METADATA.claimGenerator}`);
  console.log('===========================================================');

  const filesToStamp: string[] = [];

  if (targetFile) {
    const fullPath = path.isAbsolute(targetFile) ? targetFile : path.join(REPO_ROOT, targetFile);
    if (fs.existsSync(fullPath)) {
      filesToStamp.push(fullPath);
    } else {
      throw new Error(`Target file not found: ${fullPath}`);
    }
  } else if (fs.existsSync(ART_DIR)) {
    const entries = fs.readdirSync(ART_DIR);
    for (const entry of entries) {
      if (entry.endsWith('.png') || entry.endsWith('.jpg') || entry.endsWith('.jpeg')) {
        filesToStamp.push(path.join(ART_DIR, entry));
      }
    }
  }

  console.log(`Found ${filesToStamp.length} image asset(s) to stamp with credentials.\n`);
  let stampedCount = 0;

  for (const f of filesToStamp) {
    try {
      const ok = stampImageFile(f, DEFAULT_METADATA);
      if (ok) {
        stampedCount++;
        console.log(`  ✓ Stamped: ${path.relative(REPO_ROOT, f)}`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Could not stamp ${path.basename(f)}: ${err.message}`);
    }
  }

  console.log('\n===========================================================');
  console.log(`🚀 Successfully stamped ${stampedCount}/${filesToStamp.length} images with StatVault & marketing.ekopolimeras.com credentials.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error during provenance stamping:', err.message);
    process.exit(1);
  });
}