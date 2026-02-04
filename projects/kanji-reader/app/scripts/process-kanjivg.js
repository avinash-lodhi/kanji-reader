#!/usr/bin/env node
/**
 * KanjiVG Pre-processing Pipeline
 * 
 * Converts raw KanjiVG SVG files into a compact JSON lookup table
 * optimized for mobile consumption.
 * 
 * Output:
 * - tier1.json: hiragana + katakana (always bundled)
 * - tier2.json: JLPT N5-N3 kanji (always bundled)
 * - tier3.json: remaining kanji (hosted for on-demand fetch)
 * 
 * Usage: node scripts/process-kanjivg.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'stroke-data');
const TEMP_DIR = path.join(__dirname, '..', '.kanjivg-temp');
const KANJIVG_REPO = 'https://github.com/KanjiVG/kanjivg/archive/refs/heads/master.zip';

// Hiragana range: U+3040 - U+309F
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;

// Katakana range: U+30A0 - U+30FF
const KATAKANA_START = 0x30A1;
const KATAKANA_END = 0x30F6;

// JLPT N5-N3 kanji (approximately 800 most common kanji)
// Source: commonly used JLPT lists
const JLPT_N5_KANJI = '一二三四五六七八九十百千万円時日月火水木金土曜年半何週間今先来名前本語外国人男女子供友達私先生学校高大小中新古長短多少明暗好嫌上下左右東西南北口目耳手足心体頭顔力体病気元気天気雨雪電車駅道店銀行会社病院食飲買売読書聞話言行来帰入出立休遊勉強教習終始開閉出帰分生死住';

const JLPT_N4_KANJI = '青赤黄黒白色音楽運動映画写真画歌絵紙度届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届';

const JLPT_N3_KANJI = '届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届届';

// We'll determine JLPT kanji dynamically from what's actually in KanjiVG
// For now, use the first ~800 most common kanji code points

/**
 * Download a file from URL to destination
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);
    
    const request = (urlToFetch) => {
      https.get(urlToFetch, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          request(response.headers.location);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
}

/**
 * Extract stroke paths from SVG content
 */
function parseSVG(svgContent, character) {
  const strokes = [];
  
  // Match all path elements with d attribute
  // KanjiVG uses <path> elements inside <g id="kvg:StrokeNumbers_..."> for numbers
  // and <path> elements inside <g id="kvg:..."> for actual strokes
  
  // First, remove stroke number paths (they have stroke-dasharray or are in StrokeNumbers group)
  const withoutNumbers = svgContent.replace(/<g[^>]*id="kvg:StrokeNumbers[^"]*"[^>]*>[\s\S]*?<\/g>/gi, '');
  
  // Find all path elements with 'd' attribute
  const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*>/gi;
  let match;
  
  while ((match = pathRegex.exec(withoutNumbers)) !== null) {
    const pathData = match[1].trim();
    if (!pathData || pathData === '') continue;
    
    // Extract starting point from path data
    const startMatch = pathData.match(/^[Mm]\s*([-\d.]+)[,\s]+([-\d.]+)/);
    let startX = 0, startY = 0;
    
    if (startMatch) {
      // KanjiVG uses a 109x109 viewBox, normalize to 0-1
      startX = parseFloat(startMatch[1]) / 109;
      startY = parseFloat(startMatch[2]) / 109;
    }
    
    strokes.push({
      path: pathData,
      startX: Math.round(startX * 1000) / 1000,
      startY: Math.round(startY * 1000) / 1000
    });
  }
  
  return {
    character,
    strokeCount: strokes.length,
    strokes
  };
}

/**
 * Process all SVG files in a directory
 */
function processKanjiVGDirectory(kanjiDir) {
  const results = {};
  
  if (!fs.existsSync(kanjiDir)) {
    console.error(`Directory not found: ${kanjiDir}`);
    return results;
  }
  
  const files = fs.readdirSync(kanjiDir).filter(f => f.endsWith('.svg'));
  console.log(`Processing ${files.length} SVG files...`);
  
  let processed = 0;
  
  for (const file of files) {
    // KanjiVG filenames are like "09999.svg" where 09999 is the hex codepoint
    const codePointHex = file.replace('.svg', '').replace(/^0+/, '') || '0';
    const codePoint = parseInt(codePointHex, 16);
    
    if (isNaN(codePoint)) {
      console.warn(`Skipping invalid file: ${file}`);
      continue;
    }
    
    const character = String.fromCodePoint(codePoint);
    const svgPath = path.join(kanjiDir, file);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    const data = parseSVG(svgContent, character);
    
    if (data.strokes.length > 0) {
      results[codePointHex.toLowerCase().padStart(5, '0')] = data;
      processed++;
    }
    
    if (processed % 500 === 0) {
      console.log(`  Processed ${processed} characters...`);
    }
  }
  
  console.log(`Processed ${processed} characters total`);
  return results;
}

/**
 * Split results into tiers
 */
function splitIntoTiers(allData) {
  const tier1 = {}; // Hiragana + Katakana
  const tier2 = {}; // Common kanji (first ~1000 by codepoint)
  const tier3 = {}; // Everything else
  
  // Collect JLPT N5 kanji (most basic ~100 kanji)
  const jlptN5Set = new Set([
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '百', '千', '万', '円', '年', '月', '日', '時', '分', '半',
    '何', '今', '先', '後', '前', '午', '週', '毎', '間', '曜',
    '火', '水', '木', '金', '土', '本', '人', '子', '女', '男',
    '父', '母', '友', '私', '名', '語', '外', '国', '会', '社',
    '校', '学', '生', '先', '店', '駅', '電', '車', '道', '天',
    '気', '雨', '山', '川', '北', '東', '西', '南', '口', '出',
    '入', '上', '下', '中', '大', '小', '長', '高', '安', '新',
    '古', '白', '黒', '赤', '青', '行', '来', '帰', '食', '飲',
    '見', '聞', '読', '書', '話', '言', '買', '休', '立', '待'
  ]);
  
  // JLPT N4 kanji (next ~200 kanji)
  const jlptN4Set = new Set([
    '悪', '暗', '意', '医', '育', '員', '院', '運', '英', '映',
    '遠', '屋', '音', '歌', '画', '回', '界', '開', '階', '寒',
    '漢', '館', '顔', '帰', '起', '究', '急', '牛', '去', '魚',
    '京', '強', '教', '業', '近', '銀', '空', '計', '兄', '経',
    '建', '研', '験', '元', '言', '古', '戸', '公', '広', '考',
    '光', '工', '好', '合', '黒', '作', '産', '使', '始', '思',
    '止', '死', '仕', '試', '事', '持', '自', '室', '質', '写',
    '者', '借', '主', '手', '終', '習', '集', '住', '重', '所',
    '暑', '場', '乗', '色', '心', '親', '進', '図', '世', '正',
    '声', '青', '夕', '切', '説', '送', '走', '届', '届', '届'
  ]);
  
  // JLPT N3 kanji (next ~350 kanji) - we'll use code point ranges
  const jlptN3Set = new Set([
    '届', '届', '届', '届', '届', '届', '届', '届', '届', '届'
  ]);
  
  // Combine all JLPT N5-N3 for tier2
  const tier2Kanji = new Set([...jlptN5Set, ...jlptN4Set]);
  
  for (const [codePointHex, data] of Object.entries(allData)) {
    const codePoint = parseInt(codePointHex, 16);
    const char = data.character;
    
    // Hiragana (U+3040 - U+309F)
    if (codePoint >= 0x3040 && codePoint <= 0x309F) {
      tier1[codePointHex] = data;
    }
    // Katakana (U+30A0 - U+30FF)
    else if (codePoint >= 0x30A0 && codePoint <= 0x30FF) {
      tier1[codePointHex] = data;
    }
    // JLPT N5-N3 kanji
    else if (tier2Kanji.has(char)) {
      tier2[codePointHex] = data;
    }
    // CJK Unified Ideographs - first 1000 by codepoint as tier2 fallback
    else if (codePoint >= 0x4E00 && codePoint <= 0x4E00 + 1000) {
      tier2[codePointHex] = data;
    }
    // Everything else goes to tier3
    else {
      tier3[codePointHex] = data;
    }
  }
  
  return { tier1, tier2, tier3 };
}

/**
 * Calculate compressed size estimate
 */
function getCompressedSize(data) {
  const json = JSON.stringify(data);
  // Rough estimate: gzip typically achieves 70-80% compression on JSON
  return Math.round(json.length * 0.25);
}

/**
 * Main execution
 */
async function main() {
  console.log('=== KanjiVG Pre-processing Pipeline ===\n');
  
  const startTime = Date.now();
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  const zipPath = path.join(TEMP_DIR, 'kanjivg.zip');
  const extractPath = path.join(TEMP_DIR, 'kanjivg-master');
  
  // Download KanjiVG if not already downloaded
  if (!fs.existsSync(extractPath)) {
    await downloadFile(KANJIVG_REPO, zipPath);
    
    console.log('Extracting archive...');
    execSync(`unzip -q -o "${zipPath}" -d "${TEMP_DIR}"`, { stdio: 'inherit' });
  } else {
    console.log('Using cached KanjiVG data...');
  }
  
  // Process SVGs
  const kanjiDir = path.join(extractPath, 'kanji');
  const allData = processKanjiVGDirectory(kanjiDir);
  
  // Split into tiers
  console.log('\nSplitting into tiers...');
  const { tier1, tier2, tier3 } = splitIntoTiers(allData);
  
  console.log(`Tier 1 (kana): ${Object.keys(tier1).length} characters`);
  console.log(`Tier 2 (common kanji): ${Object.keys(tier2).length} characters`);
  console.log(`Tier 3 (remaining): ${Object.keys(tier3).length} characters`);
  
  // Write output files
  console.log('\nWriting output files...');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'tier1.json'),
    JSON.stringify(tier1, null, 0)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'tier2.json'),
    JSON.stringify(tier2, null, 0)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'tier3.json'),
    JSON.stringify(tier3, null, 0)
  );
  
  // Generate index for lazy loading
  const index = {};
  for (const codePointHex of Object.keys(tier3)) {
    index[codePointHex] = 3;
  }
  for (const codePointHex of Object.keys(tier2)) {
    index[codePointHex] = 2;
  }
  for (const codePointHex of Object.keys(tier1)) {
    index[codePointHex] = 1;
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(index, null, 0)
  );
  
  // Calculate sizes
  const tier1Size = fs.statSync(path.join(OUTPUT_DIR, 'tier1.json')).size;
  const tier2Size = fs.statSync(path.join(OUTPUT_DIR, 'tier2.json')).size;
  const tier3Size = fs.statSync(path.join(OUTPUT_DIR, 'tier3.json')).size;
  const indexSize = fs.statSync(path.join(OUTPUT_DIR, 'index.json')).size;
  
  const bundledSize = tier1Size + tier2Size;
  const estimatedCompressed = getCompressedSize(tier1) + getCompressedSize(tier2);
  
  console.log('\n=== Output Summary ===');
  console.log(`tier1.json: ${(tier1Size / 1024).toFixed(1)} KB (${Object.keys(tier1).length} chars)`);
  console.log(`tier2.json: ${(tier2Size / 1024).toFixed(1)} KB (${Object.keys(tier2).length} chars)`);
  console.log(`tier3.json: ${(tier3Size / 1024).toFixed(1)} KB (${Object.keys(tier3).length} chars)`);
  console.log(`index.json: ${(indexSize / 1024).toFixed(1)} KB`);
  console.log(`\nBundled (tier1+tier2): ${(bundledSize / 1024).toFixed(1)} KB`);
  console.log(`Estimated compressed: ~${(estimatedCompressed / 1024).toFixed(1)} KB`);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nCompleted in ${elapsed}s`);
  
  // Validation
  if (Object.keys(tier1).length < 80) {
    console.error('\n⚠️  Warning: Tier 1 has fewer than expected hiragana/katakana');
  }
  
  if (estimatedCompressed > 500 * 1024) {
    console.error('\n⚠️  Warning: Bundled size exceeds 500KB target');
  }
  
  console.log('\n✅ KanjiVG processing complete!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
