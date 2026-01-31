import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const publicDataDir = resolve(rootDir, 'public', 'data');
const overridesDir = resolve(rootDir, 'data', 'overrides');

const DATASETS = [
  { key: 'characters', file: 'characters.json' },
  { key: 'supportCards', file: 'supportCards.json' },
  { key: 'skills', file: 'skills.json' }
];

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return false;
    throw error;
  }
}

async function loadJson(filePath) {
  const contents = await readFile(filePath, 'utf-8');
  return JSON.parse(contents);
}

function normalizeOverrides(overrides, idKey = 'id') {
  if (!overrides) return {};
  if (Array.isArray(overrides)) {
    return Object.fromEntries(
      overrides
        .filter((item) => item && typeof item === 'object' && item[idKey])
        .map((item) => [String(item[idKey]), item])
    );
  }
  if (typeof overrides === 'object') {
    return overrides;
  }
  throw new Error(`Overrides must be an object (id -> patch) or an array of records`);
}

function applyOverrides(baseArray, overridesMap, idKey = 'id') {
  if (!Array.isArray(baseArray)) {
    throw new Error(`Base data must be an array`);
  }

  const merged = [...baseArray];
  const indexById = new Map(
    baseArray
      .map((item, idx) => [item?.[idKey], idx])
      .filter(([id]) => typeof id === 'string' && id.length > 0)
  );

  let updated = 0;
  let added = 0;

  for (const [rawId, patch] of Object.entries(overridesMap ?? {})) {
    const id = String(rawId).trim();
    if (!id) continue;
    if (!patch || typeof patch !== 'object') continue;

    const idx = indexById.get(id);
    if (typeof idx === 'number') {
      merged[idx] = { ...merged[idx], ...patch, [idKey]: id };
      updated += 1;
    } else {
      merged.push({ [idKey]: id, ...patch });
      added += 1;
    }
  }

  return { merged, updated, added };
}

async function main() {
  console.log('[apply-overrides] Applying optional overrides (if present)...');

  for (const dataset of DATASETS) {
    const basePath = resolve(publicDataDir, dataset.file);
    const overridesPath = resolve(overridesDir, dataset.file);

    const hasBase = await fileExists(basePath);
    if (!hasBase) {
      console.warn(`[apply-overrides] Skip ${dataset.key}: base file not found: ${basePath}`);
      continue;
    }

    const hasOverrides = await fileExists(overridesPath);
    if (!hasOverrides) {
      console.log(`[apply-overrides] Skip ${dataset.key}: no overrides at ${overridesPath}`);
      continue;
    }

    const base = await loadJson(basePath);
    const overridesRaw = await loadJson(overridesPath);
    const overrides = normalizeOverrides(overridesRaw, 'id');

    const { merged, updated, added } = applyOverrides(base, overrides, 'id');
    await writeFile(basePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');

    console.log(
      `[apply-overrides] ${dataset.key}: updated=${updated}, added=${added}, total=${merged.length}`
    );
  }

  console.log('[apply-overrides] Done.');
}

main().catch((error) => {
  console.error('[apply-overrides] Failed', error);
  process.exitCode = 1;
});







