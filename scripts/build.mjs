import {readFile,writeFile,mkdir,cp,rm,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {home,caseStudy,repositoriesPage,cvPage,notFound} from '../src/pages.mjs';
import {productsPage,releasePage,checkoutPage} from '../src/products.mjs';
import {prepareCommerce} from '../src/commerce.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJSON=async name=>JSON.parse(await readFile(path.join(root,'content',name+'.json'),'utf8'));
const [profile,projects,snapshot]=await Promise.all(['profile','projects','repositories'].map(readJSON));
const release=prepareCommerce(await readJSON('commerce'));
if(profile.cvPdf){if(!profile.cvPdf.startsWith('/files/')||profile.cvPdf.includes('..'))throw new Error('CV must use a local /files/ path');await access(path.join(root,'public',profile.cvPdf));}
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
const pages=[['index.html',home(profile,projects)],['repositories/index.html',repositoriesPage(profile,snapshot)],['cv/index.html',cvPage(profile,projects)],['products/index.html',productsPage(profile,release)],[`products/${release.slug}/index.html`,releasePage(profile,release)],['checkout/index.html',checkoutPage(profile,release)],['404.html',notFound(profile)],...projects.map(p=>[`projects/${p.slug}/index.html`,caseStudy(profile,p,projects)])];
for(const [name,html]of pages){const target=path.join(root,'dist',name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html);}
const origin=profile.siteUrl;
const paths=['/','/cv/','/repositories/','/products/',`/products/${release.slug}/`,...projects.map(p=>`/projects/${p.slug}/`)];
await writeFile(path.join(root,'dist','sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>`<url><loc>${origin}${p}</loc></url>`).join('')+'</urlset>\n');
await writeFile(path.join(root,'dist','robots.txt'),`User-agent: *\nAllow: /\nDisallow: /checkout/\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages. ${snapshot.repositories.length} saved public repositories. CV PDF: ${profile.cvPdf?'configured':'not selected'}.`);
