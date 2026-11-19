import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareCommerce,validatePaymentLink} from '../src/commerce.mjs';
import {checkoutPage,productsPage} from '../src/products.mjs';
const base={provider:'stripe_payment_links',status:'coming_soon',title:'First release',description:'An original guide.',amountMinor:null,currency:'gbp',paymentLink:null,fulfilmentReady:false,deliveryDescription:null,slug:'first-release'};
const profile={name:'Nathaniel Sebastian',brand:'Future',email:'nathannn.s04@gmail.com',location:'Cardiff, UK',github:'https://github.com/NathS04',linkedin:'https://www.linkedin.com/in/nathaniel-sebastian-11a877301/',siteUrl:'https://portfolio.example'};
test('coming-soon checkout cannot expose a configured payment link',()=>{
 const release=prepareCommerce({...base,paymentLink:'https://buy.stripe.com/fixture123'});
 const html=checkoutPage(profile,release);
 assert.equal(release.canPurchase,false);assert.equal(release.checkoutUrl,null);assert.match(html,/Not on sale yet/);assert.doesNotMatch(html,/buy\.stripe\.com/);
});
test('live release needs a real description, price, checkout and prepared delivery',()=>{
 assert.throws(()=>prepareCommerce({...base,status:'available'}));
 assert.throws(()=>prepareCommerce({...base,status:'available',amountMinor:2500,paymentLink:'https://buy.stripe.com/fixture123'}));
});
test('gateway rejects unsafe hosts, credential URLs, query strings and test links',()=>{
 for(const bad of ['http://buy.stripe.com/fixture123','https://buy.stripe.com.evil.example/fixture123','javascript:alert(1)','https://user:pass@buy.stripe.com/fixture123','https://buy.stripe.com/fixture123?redirect=evil','https://example.com/']) assert.throws(()=>validatePaymentLink(bad));
 assert.throws(()=>prepareCommerce({...base,status:'available',amountMinor:2500,paymentLink:'https://buy.stripe.com/test_fixture123',deliveryDescription:'Delivery is configured.',fulfilmentReady:true}));
});
test('available configuration renders the exact Stripe-hosted URL and correct GBP price',()=>{
 const release=prepareCommerce({...base,status:'available',amountMinor:2500,paymentLink:'https://buy.stripe.com/fixture123',deliveryDescription:'Delivery is configured.',fulfilmentReady:true});
 assert.equal(release.canPurchase,true);assert.equal(release.priceLabel,'£25.00');assert.match(checkoutPage(profile,release),/href="https:\/\/buy\.stripe\.com\/fixture123"/);
});
test('shipped configuration has no invented offer or live payment request',async()=>{
 const config=JSON.parse(await readFile(new URL('../content/commerce.json',import.meta.url),'utf8'));
 const release=prepareCommerce(config);assert.equal(release.canPurchase,false);assert.equal(release.amountMinor,null);assert.equal(release.paymentLink,null);
 assert.match(productsPage(profile,release),/Yet to drop/);assert.doesNotMatch(productsPage(profile,release),/Preview pricing|USD examples|price-amount/);assert.equal(config.previewPricing,undefined);assert.match(productsPage(profile,release),/\/products\/first-release\//);
});
