import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRepositories,filterRepositories,loadRepositories,fetchPublicRepositories,CACHE_KEY,CACHE_TTL} from '../public/assets/github-data.js';
const repo=(name,extra={})=>({name,private:false,owner:{login:'NathS04'},html_url:`https://github.com/NathS04/${name}`,language:'Python',...extra});
const storage=(initial)=>{let value=initial;return {getItem:()=>value,setItem:(key,data)=>{assert.equal(key,CACHE_KEY);value=data;}};};
test('only expected public owner repositories with safe URLs survive normalization',()=>{
  const clean=normalizeRepositories([repo('good'),repo('good'),repo('comp1711'),repo('MyCoursework'),repo('ProcTask2n3'),repo('ProgProj'),repo('private',{private:true}),repo('wrong-owner',{owner:{login:'someone'}}),repo('unsafe',{html_url:'javascript:alert(1)'}),repo('lookalike',{html_url:'https://github.com.evil.test/NathS04/lookalike'}),repo('has-secrets',{private:undefined}),repo('wrong-path',{html_url:'https://github.com/other/wrong-path'})]);
  assert.deepEqual(clean.map(r=>r.name),['good']);assert.equal(clean[0].stargazers_count,null);
});
test('filters search descriptions, exclude archived/forks, and keep featured first',()=>{
  const repos=normalizeRepositories([repo('z', {description:'API import'}),repo('policy_copilot_submission'),repo('fork',{fork:true}),repo('old',{archived:true})]);
  assert.deepEqual(filterRepositories(repos).map(r=>r.name),['policy_copilot_submission','z']);
  assert.deepEqual(filterRepositories(repos,{query:'IMPORT'}).map(r=>r.name),['z']);
  assert.equal(filterRepositories(repos,{includeInactive:true}).length,4);
  assert.equal(filterRepositories(repos,{language:'Java'}).length,0);
});
test('fresh cache avoids requests and can be forcibly refreshed',async()=>{
  const savedAt=Date.now();const saved=storage(JSON.stringify({savedAt,repositories:[repo('cached')]}));
  let requests=0;const fetcher=async()=>{requests++;return{ok:true,json:async()=>[repo('live')]};};
  assert.equal((await loadRepositories({storage:saved,fetcher,now:savedAt+100})).source,'cache');assert.equal(requests,0);
  assert.equal((await loadRepositories({storage:saved,fetcher,now:savedAt+100,force:true})).source,'live');assert.equal(requests,1);
});
test('rate limits and expired caches retain the last successful public data',async()=>{
  const now=Date.now();const result=await loadRepositories({now,storage:storage(JSON.stringify({savedAt:now-CACHE_TTL-1,repositories:[repo('saved')]})),fetcher:async()=>({ok:false,status:403}),fallback:[repo('fallback')]});
  assert.equal(result.source,'stale');assert.equal(result.repositories[0].name,'saved');
});
test('cold start timeout, malformed cache and disabled storage use the saved directory',async()=>{
  const result=await loadRepositories({storage:storage('broken'),fetcher:()=>new Promise(()=>{}),fallback:[repo('fallback')],timeoutMs:5});
  assert.equal(result.source,'snapshot');assert.equal(result.repositories[0].name,'fallback');
  const success=await loadRepositories({storage:{getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}},fetcher:async()=>({ok:true,json:async()=>[repo('live')]})});
  assert.equal(success.source,'live');
});
test('pagination retrieves later pages and an actual empty public response remains empty',async()=>{
  let requests=0;
  const repos=await fetchPublicRepositories(async()=>({ok:true,json:async()=>++requests===1?Array.from({length:100},(_,i)=>repo('repo-'+i)):[repo('last')]}));
  assert.equal(repos.length,101);assert.equal(requests,2);
  const empty=await loadRepositories({fetcher:async()=>({ok:true,json:async()=>[]}),fallback:[repo('fallback')]});
  assert.equal(empty.source,'live');assert.deepEqual(empty.repositories,[]);
});
