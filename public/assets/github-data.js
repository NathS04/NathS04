const HIDDEN_REPOSITORIES = new Set(['comp1711', 'mycoursework', 'proctask2n3', 'progproj']);

export const USERNAME = 'NathS04';
export const CACHE_KEY = 'nath-portfolio-public-repos-v2';
export const CACHE_TTL = 15 * 60 * 1000;
export const FEATURED = ['policy_copilot_submission', 'comp3011-cw1-api', 'ledger-data-quality', 'comp3011-cw2-api'];

export function normalizeRepositories(input) {
  if (!Array.isArray(input)) throw new Error('Unexpected repository response');
  const found = new Set();
  return input.filter(repo => {
    if (!repo || repo.private !== false || typeof repo.owner?.login !== 'string' || repo.owner.login.toLowerCase() !== USERNAME.toLowerCase()) return false;
    if (!/^[a-zA-Z0-9_.-]+$/.test(repo.name || '') || found.has(repo.name.toLowerCase()) || HIDDEN_REPOSITORIES.has(repo.name.toLowerCase())) return false;
    try {
      const url = new URL(repo.html_url);
      if (url.origin !== 'https://github.com' || url.pathname.toLowerCase() !== `/${USERNAME}/${repo.name}`.toLowerCase() || url.search || url.hash) return false;
    } catch { return false; }
    found.add(repo.name.toLowerCase());
    return true;
  }).map(repo => ({
    name: repo.name,
    full_name: `${USERNAME}/${repo.name}`,
    html_url: `https://github.com/${USERNAME}/${repo.name}`,
    private: false,
    owner: {login: USERNAME},
    description: typeof repo.description === 'string' ? repo.description.slice(0,350) : null,
    language: typeof repo.language === 'string' ? repo.language.slice(0,40) : null,
    fork: typeof repo.fork === 'boolean' ? repo.fork : null,
    archived: repo.archived === true,
    updated_at: typeof repo.updated_at === 'string' && Number.isFinite(Date.parse(repo.updated_at)) ? repo.updated_at : null,
    stargazers_count: Number.isInteger(repo.stargazers_count) && repo.stargazers_count >= 0 ? repo.stargazers_count : null,
    forks_count: Number.isInteger(repo.forks_count) && repo.forks_count >= 0 ? repo.forks_count : null
  }));
}

export function filterRepositories(repositories, {query='', language='', includeInactive=false, sort='featured'} = {}) {
  const needle = query.trim().toLowerCase();
  const filtered = repositories.filter(repo =>
    (includeInactive || (!repo.archived && !repo.fork)) &&
    (!language || repo.language === language) &&
    (!needle || `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase().includes(needle))
  );
  return filtered.sort((a,b) => {
    if (sort === 'featured') {
      const ai = FEATURED.includes(a.name) ? FEATURED.indexOf(a.name) : 100;
      const bi = FEATURED.includes(b.name) ? FEATURED.indexOf(b.name) : 100;
      if (ai !== bi) return ai-bi;
    }
    if (sort === 'updated') {
      const delta = (Date.parse(b.updated_at) || 0)-(Date.parse(a.updated_at) || 0);
      if (delta) return delta;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function fetchPublicRepositories(fetcher = fetch, signal) {
  const all = [];
  for (let page=1;page<=20;page++) {
    const response = await fetcher(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner&sort=updated&page=${page}`, {
      headers:{'Accept':'application/vnd.github+json'},signal
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Unexpected repository response');
    all.push(...batch);
    if (batch.length < 100) return normalizeRepositories(all);
  }
  throw new Error('Repository directory exceeded its safe pagination limit');
}

export async function loadRepositories({fetcher=fetch, storage, fallback=[], now=Date.now(), force=false, timeoutMs=8000}={}) {
  let cache = null;
  try {
    const saved = JSON.parse(storage?.getItem(CACHE_KEY) || 'null');
    if (saved && Number.isFinite(saved.savedAt) && saved.savedAt <= now && Array.isArray(saved.repositories)) {
      cache = {savedAt:saved.savedAt,repositories:normalizeRepositories(saved.repositories)};
    }
  } catch { /* Disabled storage and malformed caches are ordinary fallback cases. */ }
  if (cache && !force && now-cache.savedAt < CACHE_TTL) return {...cache,source:'cache'};
  const controller = new AbortController();
  let timer;
  try {
    const timeout = new Promise((_, reject) => {timer=setTimeout(() => {controller.abort();reject(new Error('GitHub request timed out'));},timeoutMs);});
    const repositories = await Promise.race([fetchPublicRepositories(fetcher,controller.signal),timeout]);
    try { storage?.setItem(CACHE_KEY,JSON.stringify({savedAt:now,repositories})); } catch { /* Reading the site never depends on storage consent or availability. */ }
    return {repositories,savedAt:now,source:'live'};
  } catch {
    return {repositories:cache ? cache.repositories : normalizeRepositories(fallback), savedAt:cache?.savedAt??null,source:cache?'stale':'snapshot'};
  } finally {clearTimeout(timer);}
}
