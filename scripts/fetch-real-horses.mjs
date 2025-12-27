import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const charactersPath = resolve(rootDir, 'public', 'data', 'characters.json');
const outputPath = resolve(rootDir, 'public', 'data', 'realHorses.json');

const WIKIDATA_SEARCH_API = 'https://www.wikidata.org/w/api.php';
const WIKIDATA_GET_API = 'https://www.wikidata.org/w/api.php';
const RACEHORSE_QID = 'Q2442470'; // "racehorse"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return false;
    throw error;
  }
}

async function readExistingOutput() {
  const exists = await fileExists(outputPath);
  if (!exists) return null;
  try {
    const raw = await readFile(outputPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.warn('[fetch-real-horses] Failed to read existing output, will regenerate:', error);
    return null;
  }
}

function stripVariant(nameEn) {
  return String(nameEn ?? '')
    .replace(/\s*[（(].*?[）)]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSearchTerm(term) {
  return String(term ?? '')
    .replace(/[’'"]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson(url, init) {
  const retries = 4;
  const timeoutMs = 20_000;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'user-agent': 'umamusumedb/1.0 (https://umamusumedb.com) data-pipeline',
          ...(init?.headers ?? {})
        }
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);
        if (retryable && attempt < retries) {
          const backoff = 400 * Math.pow(2, attempt);
          console.warn(`[fetch-real-horses] Retryable HTTP ${res.status} for ${url} (attempt ${attempt + 1}/${retries + 1})`);
          await sleep(backoff);
          continue;
        }
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}\n${text.slice(0, 300)}`);
      }

      return await res.json();
    } catch (error) {
      const isLast = attempt >= retries;
      const backoff = 400 * Math.pow(2, attempt);
      if (!isLast) {
        console.warn(`[fetch-real-horses] Fetch failed (attempt ${attempt + 1}/${retries + 1}), retrying...`, error);
        await sleep(backoff);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('unreachable');
}

async function searchEntities(term, language = 'en') {
  const url = new URL(WIKIDATA_SEARCH_API);
  url.searchParams.set('action', 'wbsearchentities');
  url.searchParams.set('search', term);
  url.searchParams.set('language', language);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '10');
  return await fetchJson(url.toString());
}

async function getEntities(ids) {
  const url = new URL(WIKIDATA_GET_API);
  url.searchParams.set('action', 'wbgetentities');
  url.searchParams.set('ids', ids.join('|'));
  url.searchParams.set('props', 'claims|labels|descriptions|sitelinks');
  url.searchParams.set('languages', 'en|ja');
  url.searchParams.set('format', 'json');
  return await fetchJson(url.toString());
}

function getClaimQids(entity, property) {
  const claims = entity?.claims?.[property];
  if (!Array.isArray(claims)) return [];
  return claims
    .map((c) => c?.mainsnak?.datavalue?.value?.id)
    .filter((v) => typeof v === 'string');
}

function getClaimTime(entity, property) {
  const claims = entity?.claims?.[property];
  if (!Array.isArray(claims) || !claims.length) return null;
  const time = claims?.[0]?.mainsnak?.datavalue?.value?.time;
  if (typeof time !== 'string') return null;
  // "+1995-05-02T00:00:00Z" -> "1995-05-02"
  const match = time.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  return match?.[1] ?? null;
}

function getClaimString(entity, property) {
  const claims = entity?.claims?.[property];
  if (!Array.isArray(claims) || !claims.length) return null;
  const value = claims?.[0]?.mainsnak?.datavalue?.value;
  return typeof value === 'string' ? value : null;
}

function isRacehorseEntity(entity) {
  const uses = getClaimQids(entity, 'P366');
  if (uses.includes(RACEHORSE_QID)) return true;

  const descEn = entity?.descriptions?.en?.value ?? '';
  const descJa = entity?.descriptions?.ja?.value ?? '';
  if (typeof descEn === 'string' && /racehorse/i.test(descEn)) return true;
  if (typeof descJa === 'string' && /競走馬/.test(descJa)) return true;

  return false;
}

async function resolveRacehorseByNameEn(nameEn) {
  const terms = [
    stripVariant(nameEn),
    normalizeSearchTerm(stripVariant(nameEn))
  ].filter(Boolean);

  for (const term of [...new Set(terms)]) {
    // 1) search in English
    const search = await searchEntities(term, 'en');
    const ids = (search?.search ?? []).map((x) => x.id).filter(Boolean);
    if (!ids.length) continue;

    const entities = await getEntities(ids);
    const entries = Object.values(entities?.entities ?? {});
    const racehorse = entries.find(isRacehorseEntity);
    if (racehorse?.id) return { qid: racehorse.id, matchedTerm: term };

    // 2) if not found, try Japanese search using the same term
    const searchJa = await searchEntities(term, 'ja');
    const idsJa = (searchJa?.search ?? []).map((x) => x.id).filter(Boolean);
    if (!idsJa.length) continue;
    const entitiesJa = await getEntities(idsJa);
    const entriesJa = Object.values(entitiesJa?.entities ?? {});
    const racehorseJa = entriesJa.find(isRacehorseEntity);
    if (racehorseJa?.id) return { qid: racehorseJa.id, matchedTerm: term };
  }

  return null;
}

async function main() {
  const existing = await readExistingOutput();
  const existingHorsesByNameEn =
    (existing && typeof existing === 'object' && existing.horsesByNameEn && typeof existing.horsesByNameEn === 'object')
      ? existing.horsesByNameEn
      : {};

  const charactersRaw = JSON.parse(await readFile(charactersPath, 'utf-8'));

  const nameJaByBaseEn = new Map();
  for (const c of charactersRaw) {
    const baseEn = stripVariant(c?.name_en);
    if (!baseEn) continue;
    if (nameJaByBaseEn.has(baseEn)) continue;
    const baseJa = stripVariant(c?.name_jp);
    if (baseJa) nameJaByBaseEn.set(baseEn, baseJa);
  }

  const baseNames = Array.from(
    new Set(
      charactersRaw
        .map((c) => stripVariant(c?.name_en))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'en'));

  // Start from existing output to avoid destructive overwrites on flaky networks.
  const horsesByNameEn = { ...existingHorsesByNameEn };
  const unresolved = [];

  console.log(`[fetch-real-horses] Resolving ${baseNames.length} base names via Wikidata...`);

  for (const nameEn of baseNames) {
    // If we already have a resolved entry, keep it and skip resolution.
    if (horsesByNameEn[nameEn]?.qid) {
      continue;
    }

    try {
      let resolved = await resolveRacehorseByNameEn(nameEn);
      if (!resolved) {
        const jaName = nameJaByBaseEn.get(nameEn);
        if (jaName) {
          // Fallback: search using Japanese name when English name doesn't exist as a label (e.g., Matikanefukukitaru)
          const searchJa = await searchEntities(jaName, 'ja');
          const idsJa = (searchJa?.search ?? []).map((x) => x.id).filter(Boolean);
          if (idsJa.length) {
            const entitiesJa = await getEntities(idsJa);
            const entriesJa = Object.values(entitiesJa?.entities ?? {});
            const racehorseJa = entriesJa.find(isRacehorseEntity);
            if (racehorseJa?.id) {
              resolved = { qid: racehorseJa.id, matchedTerm: jaName };
            }
          }
        }
      }
      if (!resolved) {
        unresolved.push({ name_en: nameEn, reason: 'no_racehorse_match' });
        console.warn(`[fetch-real-horses] Unresolved: ${nameEn}`);
        await sleep(150);
        continue;
      }

      horsesByNameEn[nameEn] = { qid: resolved.qid, matchedTerm: resolved.matchedTerm };
      console.log(`[fetch-real-horses] ${nameEn} -> ${resolved.qid}`);
      await sleep(150);
    } catch (error) {
      unresolved.push({ name_en: nameEn, reason: 'error', error: String(error) });
      console.warn(`[fetch-real-horses] Error resolving ${nameEn}:`, error);
      await sleep(250);
    }
  }

  // Fetch details for resolved horses
  const qids = Object.values(horsesByNameEn).map((x) => x?.qid).filter(Boolean);

  const uniqueQids = Array.from(new Set(qids));
  const qidsNeedingDetails = uniqueQids.filter((qid) => {
    const anyEntry = Object.values(horsesByNameEn).find((x) => x?.qid === qid);
    // If we already have detailed fields, skip re-fetching.
    return !(anyEntry && (anyEntry.name_en || anyEntry.name_ja || anyEntry.wikidata_url));
  });

  console.log(
    `[fetch-real-horses] Fetching details for ${qidsNeedingDetails.length}/${uniqueQids.length} horses...`
  );

  const horseEntities = {};
  for (let i = 0; i < qidsNeedingDetails.length; i += 50) {
    const batch = qidsNeedingDetails.slice(i, i + 50);
    const data = await getEntities(batch);
    Object.assign(horseEntities, data?.entities ?? {});
    await sleep(200);
  }

  // Collect sire/dam QIDs for label lookup
  const parentQids = new Set();
  for (const qid of qidsNeedingDetails) {
    const e = horseEntities[qid];
    const sire = getClaimQids(e, 'P22')[0];
    const dam = getClaimQids(e, 'P25')[0];
    if (sire) parentQids.add(sire);
    if (dam) parentQids.add(dam);
  }

  const parentEntities = {};
  const parentList = Array.from(parentQids);
  console.log(`[fetch-real-horses] Fetching labels for ${parentList.length} sire/dam entities...`);

  for (let i = 0; i < parentList.length; i += 50) {
    const batch = parentList.slice(i, i + 50);
    const data = await getEntities(batch);
    Object.assign(parentEntities, data?.entities ?? {});
    await sleep(200);
  }

  const detailsByQid = {};
  for (const qid of qidsNeedingDetails) {
    const e = horseEntities[qid];
    if (!e) continue;

    const labels = {
      en: e?.labels?.en?.value ?? null,
      ja: e?.labels?.ja?.value ?? null
    };

    const sexQid = getClaimQids(e, 'P21')[0] ?? null;
    const sireQid = getClaimQids(e, 'P22')[0] ?? null;
    const damQid = getClaimQids(e, 'P25')[0] ?? null;
    const imageFile = getClaimString(e, 'P18');

    const sireEntity = sireQid ? parentEntities[sireQid] : null;
    const damEntity = damQid ? parentEntities[damQid] : null;

    detailsByQid[qid] = {
      qid,
      name_en: labels.en,
      name_ja: labels.ja,
      date_of_birth: getClaimTime(e, 'P569'),
      date_of_death: getClaimTime(e, 'P570'),
      sex_qid: sexQid,
      sire: sireQid
        ? {
            qid: sireQid,
            name_en: sireEntity?.labels?.en?.value ?? null,
            name_ja: sireEntity?.labels?.ja?.value ?? null
          }
        : null,
      dam: damQid
        ? {
            qid: damQid,
            name_en: damEntity?.labels?.en?.value ?? null,
            name_ja: damEntity?.labels?.ja?.value ?? null
          }
        : null,
      wikidata_url: `https://www.wikidata.org/wiki/${qid}`,
      wikipedia_en: e?.sitelinks?.enwiki?.url ?? null,
      wikipedia_ja: e?.sitelinks?.jawiki?.url ?? null,
      image: imageFile
        ? {
            file: imageFile,
            url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFile)}`
          }
        : null
    };
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      name: 'Wikidata',
      license: 'CC0',
      licenseUrl: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
      queryServiceUrl: 'https://query.wikidata.org/'
    },
    horsesByNameEn: Object.fromEntries(
      Object.entries(horsesByNameEn).map(([name, meta]) => [
        name,
        { ...meta, ...(detailsByQid[meta.qid] ?? {}) }
      ])
    ),
    unresolved
  };

  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`[fetch-real-horses] Wrote ${Object.keys(output.horsesByNameEn).length} horses to ${outputPath}`);
  console.log(`[fetch-real-horses] Unresolved: ${output.unresolved.length}`);
}

main().catch((error) => {
  console.error('[fetch-real-horses] Failed', error);
  process.exitCode = 1;
});


