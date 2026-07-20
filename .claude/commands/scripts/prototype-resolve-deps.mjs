#!/usr/bin/env node
//
// prototype 依賴閉包解析器（/prototype-init 與 /prototype 共用）。
//
// 從給定的進入點檔案做逐引用遞迴，把來源 repo 內「被實際引用到」的 src 檔
// 複製進目的地，達成「用到才搬」：
//   - /prototype-init：進入點為目的地的 prototypes/index.js（＋ system 畫面），
//     seed 出跑得起框架的最小檔案集。
//   - /prototype 改既有頁：進入點為剛產出的 prototypes/views/<page>/*.vue，
//     把 TagForm 等產品依賴按需拉進目的地。
//
// 解析規則（輕量首方解析器）：
//   - 只跟 @/（→ 來源 src）、~/（→ 來源根）與相對 import；bare 套件交給 pnpm。
//   - 副檔名解析比照 prototypes/vite.config.js 的 resolve.extensions，
//     .mock.js 排在 .js 前 → 無副檔名 import 會優先命中 .mock.js（真實版不搬）。
//   - .vue 以 @vue/compiler-sfc 取 script/scriptSetup 後交給 es-module-lexer；
//     另跟 <style src>、style/css 的 @import 與 url()、template 內的靜態資產路徑。
//
// 用法：
//   node prototype-resolve-deps.mjs --src <來源根> --dest <目的地根> <進入點...>
//
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// --- 參數 ---
const argv = process.argv.slice(2);
let srcRoot = '';
let destRoot = '';
const entries = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--src') srcRoot = argv[(i += 1)];
  else if (a === '--dest') destRoot = argv[(i += 1)];
  else entries.push(a);
}
if (!srcRoot || !destRoot || entries.length === 0) {
  console.error('用法：node prototype-resolve-deps.mjs --src <來源根> --dest <目的地根> <進入點...>');
  process.exit(1);
}
srcRoot = fs.realpathSync(srcRoot);
destRoot = fs.realpathSync(destRoot);
const srcDir = path.join(srcRoot, 'src');

// --- 解析 lexer / compiler-sfc（pnpm 未 hoist，需從 vite / plugin-vue 的 context 找）---
function resolveDep(name, hostPkgs) {
  for (const host of hostPkgs) {
    try {
      const hostPkgJson = require.resolve(`${host}/package.json`, { paths: [srcRoot] });
      const hostRequire = createRequire(hostPkgJson);
      return hostRequire.resolve(name);
    } catch {
      /* 換下一個 host */
    }
  }
  // 後備：直接掃 .pnpm store
  const store = path.join(srcRoot, 'node_modules', '.pnpm');
  const flat = name.replace('/', '+');
  try {
    const hit = fs
      .readdirSync(store)
      .filter(d => d.startsWith(`${flat}@`))
      .sort()
      .pop();
    if (hit) {
      const base = path.join(store, hit, 'node_modules', name);
      return require.resolve(base);
    }
  } catch {
    /* ignore */
  }
  throw new Error(`找不到相依套件：${name}（請先在來源 repo 執行 pnpm install）`);
}

const { init: lexerInit, parse: lexerParse } = require(resolveDep('es-module-lexer', ['vite']));
const { parse: parseSFC } = require(resolveDep('@vue/compiler-sfc', ['@vitejs/plugin-vue', 'vue']));
await lexerInit;

// --- 副檔名解析（比照 vite resolve.extensions，.mock.js 優先）---
const EXTS = ['.ts', '.tsx', '.mjs', '.mock.js', '.js', '.jsx', '.json', '.vue'];
const PARSEABLE = new Set(['.ts', '.tsx', '.mjs', '.js', '.jsx', '.vue']);

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function resolveWithExts(base) {
  if (isFile(base) && EXTS.some(e => base.endsWith(e))) return base;
  for (const ext of EXTS) if (isFile(base + ext)) return base + ext;
  for (const ext of EXTS) if (isFile(path.join(base, `index${ext}`))) return path.join(base, `index${ext}`);
  if (isFile(base)) return base; // 資產（.css/.png/.woff…）帶完整副檔名
  return null;
}

// 把 import 字串解析成來源檔絕對路徑；bare 套件回 null（交給 pnpm）。
function resolveSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = path.join(srcDir, spec.slice(2));
  else if (spec === '~' || spec.startsWith('~/')) base = path.join(srcRoot, spec.replace(/^~\/?/, ''));
  else if (spec.startsWith('./') || spec.startsWith('../')) base = path.resolve(path.dirname(fromFile), spec);
  else return { kind: 'bare' };
  const resolved = resolveWithExts(base);
  return resolved ? { kind: 'file', path: resolved } : { kind: 'unresolved', base };
}

// --- 從單一檔案抽出所有 import 字串 ---
function specsFromScript(code) {
  const out = [];
  try {
    const [imports] = lexerParse(code);
    for (const im of imports) if (im.n) out.push(im.n);
  } catch {
    /* 無法 lex 就跳過，交由「缺什麼補什麼」把關 */
  }
  return out;
}

function specsFromCss(code) {
  const out = [];
  for (const m of code.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) out.push(m[1]);
  for (const m of code.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) out.push(m[1]);
  return out.filter(s => /^[@~.]/.test(s));
}

function specsFromTemplate(code) {
  const out = [];
  for (const m of code.matchAll(/(?:src|href)\s*=\s*["'](@\/|~\/|\.\.?\/)[^"']+["']/g)) {
    out.push(m[0].replace(/^[^"']*["']/, '').replace(/["']$/, ''));
  }
  return out;
}

function extractSpecs(file, code) {
  const ext = EXTS.find(e => file.endsWith(e)) || path.extname(file);
  if (ext === '.vue') {
    const { descriptor } = parseSFC(code, { filename: file });
    const specs = [];
    const script = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n;\n');
    if (script) specs.push(...specsFromScript(script));
    for (const s of descriptor.styles || []) {
      if (s.src) specs.push(s.src);
      if (s.content) specs.push(...specsFromCss(s.content));
    }
    if (descriptor.template?.content) specs.push(...specsFromTemplate(descriptor.template.content));
    return specs;
  }
  if (ext === '.css') return specsFromCss(code);
  if (ext === '.json') return [];
  if (PARSEABLE.has(ext)) return specsFromScript(code);
  return []; // 二進位資產
}

// --- BFS 逐引用遞迴 ---
const visited = new Set();
const copied = [];
const unresolved = [];
const queue = [];

for (const e of entries) {
  const abs = path.resolve(e);
  if (isFile(abs)) queue.push(abs);
  else console.error(`（略過不存在的進入點：${e}）`);
}

function isParseable(file) {
  const ext = EXTS.find(e => file.endsWith(e)) || path.extname(file);
  return ext === '.css' || ext === '.json' || PARSEABLE.has(ext);
}

while (queue.length) {
  const file = queue.shift();
  if (visited.has(file)) continue;
  visited.add(file);

  const underSrc = file.startsWith(srcDir + path.sep);

  // 落在來源 src 下的檔要複製到目的地（同相對路徑）；prototypes/* 等已在目的地的不複製。
  if (underSrc) {
    const rel = path.relative(srcRoot, file);
    const target = path.join(destRoot, rel);
    if (!isFile(target)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(file, target);
      copied.push(rel);
    }
  }

  if (!isParseable(file)) continue; // 二進位資產：複製即可，不再往下跟
  let code;
  try {
    code = fs.readFileSync(file, 'utf-8');
  } catch {
    continue;
  }
  for (const spec of extractSpecs(file, code)) {
    const r = resolveSpecifier(spec, file);
    if (r.kind === 'file') {
      if (!visited.has(r.path)) queue.push(r.path);
    } else if (r.kind === 'unresolved') {
      unresolved.push({ spec, from: path.relative(srcRoot, file) });
    }
  }
}

// --- 回報 ---
console.log(`逐引用遞迴完成：新增 ${copied.length} 個檔案。`);
for (const rel of copied.sort()) console.log(`  + ${rel}`);
if (unresolved.length) {
  console.log(`\n有 ${unresolved.length} 個 @/、~/ 或相對 import 未能解析（可能需人工確認）：`);
  for (const u of unresolved) console.log(`  ? ${u.spec}（來自 ${u.from}）`);
}
