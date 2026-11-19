import {loadRepositories,filterRepositories,FEATURED} from './github-data.js';

const root = document.querySelector('[data-repository-directory]');
if (root) {
  const snapshot = JSON.parse(document.querySelector('#repository-snapshot').textContent);
  let repositories = snapshot.repositories;
  const search = root.querySelector('#repo-search');
  const language = root.querySelector('#repo-language');
  const sort = root.querySelector('#repo-sort');
  const inactive = root.querySelector('#repo-inactive');
  const status = root.querySelector('[data-sync-status]');
  const grid = root.querySelector('[data-repo-grid]');
  const count = root.querySelector('[data-repo-count]');
  const refresh = root.querySelector('[data-repo-refresh]');

  function element(tag,className,text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function updateLanguages() {
    const selected = language.value;
    language.replaceChildren(new Option('All languages',''));
    [...new Set(repositories.map(r=>r.language).filter(Boolean))].sort().forEach(l=>language.add(new Option(l,l)));
    language.value = [...language.options].some(o=>o.value===selected) ? selected : '';
  }
  function render() {
    const shown = filterRepositories(repositories,{query:search.value,language:language.value,sort:sort.value,includeInactive:inactive.checked});
    const cards = shown.map(repo=>{
      const article = element('article','repo-card');
      const badges = element('div','repo-badges');
      if (FEATURED.includes(repo.name)) badges.append(element('span','','Selected project'));
      if (repo.fork) badges.append(element('span','','Fork'));
      if (repo.archived) badges.append(element('span','','Archived'));
      const title = element('h2');
      const link = element('a','',repo.name);
      link.href=repo.html_url;link.target='_blank';link.rel='noopener noreferrer';
      title.append(link);
      article.append(badges,title,element('p','',repo.description || 'Public repository. View the source on GitHub.'));
      const metadata = element('div','repo-meta');
      if (repo.language) metadata.append(element('span','', '● '+repo.language));
      if (repo.updated_at) metadata.append(element('span','', 'Updated '+new Date(repo.updated_at).toLocaleDateString('en-GB',{month:'short',year:'numeric'})));
      if (repo.stargazers_count !== null) metadata.append(element('span','', '☆ '+repo.stargazers_count));
      article.append(metadata);
      return article;
    });
    if (!cards.length) {
      const empty=element('div','empty-state');
      empty.append(element('h2','','No matching repositories'),element('p','','Try a different search or clear the filters.'));
      const reset=element('button','button outline','Clear filters');reset.type='button';
      reset.addEventListener('click',()=>{search.value='';language.value='';sort.value='featured';inactive.checked=false;render();search.focus();});
      empty.append(reset);cards.push(empty);
    }
    grid.replaceChildren(...cards);
    count.textContent=`${shown.length} ${shown.length===1?'repository':'repositories'} shown`;
  }
  let storage;
  try {storage=window.localStorage;} catch {storage=undefined;}
  async function sync(force=false) {
    refresh.disabled=true;
    status.textContent=force?'Checking GitHub for updates…':'Checking GitHub… Saved public repositories are available below.';
    const result=await loadRepositories({storage,fallback:snapshot.repositories,force});
    repositories=result.repositories;
    updateLanguages();render();
    const date=result.savedAt ? new Date(result.savedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}) : null;
    status.textContent={
      live:`Live from GitHub · checked ${date}.`,
      cache:`Saved GitHub data · checked ${date}. Refresh checks for new changes.`,
      stale:`GitHub is unavailable. Showing the last successful update from ${date}.`,
      snapshot:`GitHub is unavailable. Showing the public directory saved on 17 November 2026.`
    }[result.source];
    refresh.disabled=false;
  }
  for (const control of [search,language,sort,inactive]) control.addEventListener(control===search?'input':'change',render);
  refresh.addEventListener('click',()=>sync(true));
  updateLanguages();render();sync();
}
