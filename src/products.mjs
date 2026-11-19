import {escape, renderDocument} from './pages.mjs';

const arrow = '<span aria-hidden="true">→</span>';
const outbound = '<svg class="outbound" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M3 13 13 3M4 3h9v9" stroke="currentColor" stroke-width="1.4"/></svg>';
const pack = {
  file: 'future-card-pack',
  alt: 'A navy sleeve with a sliver of silver cards showing.'
};

const releaseUrl = release => `/products/${release.slug}/`;
const enquiry = profile => `mailto:${escape(profile.email)}?subject=Future%20Store%20release%20enquiry`;

function packImage(sizes, {priority = false} = {}) {
  const source = `/images/${pack.file}`;
  return `<img src="${source}-760.webp" srcset="${source}-384.webp 384w, ${source}-760.webp 760w, ${source}-1200.webp 1200w" sizes="${sizes}" width="1200" height="1200" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" alt="${escape(pack.alt)}">`;
}

function portrait() {
  return `<img class="launch-photo" src="/images/nathaniel-editorial.jpg" width="2000" height="1125" fetchpriority="high" decoding="async" alt="Nathaniel Sebastian in a navy blazer at a workstation.">`;
}

function storeLayout(profile, options) {
  const current = options.urlPath === '/products/' ? ' aria-current="page"' : '';
  const header = `<header class="store-header"><nav class="frame masthead" aria-label="Store navigation">
    <a class="shop-brand" href="/products/" aria-label="Future Store home"><span class="wordmark">Future<span>.</span></span><span class="brand-division">Store</span></a>
    <div class="nav-actions"><a href="/products/"${current}>Releases</a><a class="leave-shop" href="/">Portfolio ${outbound}</a></div>
  </nav><a class="portfolio-return" href="/">Back to the professional portfolio ${outbound}</a></header>`;
  const footer = `<footer class="store-footer"><div class="frame footer-row">
    <span>Future Store <span class="footer-credit">/ ${escape(profile.name)}</span></span>
    <nav aria-label="Footer"><a href="/">Portfolio</a><a href="/cv/">CV</a><a href="${enquiry(profile)}">Enquiries ${outbound}</a></nav>
  </div></footer>`;
  return renderDocument(profile, {...options, pageClass: 'storefront'}, header, footer);
}

function availability(release) {
  return `<span class="availability"><span class="status-dot" aria-hidden="true"></span>${escape(release.statusLabel)}</span>`;
}

export function productsPage(profile, release) {
  const url = releaseUrl(release);
  const comingSoon = !release.canPurchase;
  const title = comingSoon ? 'The first<br><em>drop.</em>' : escape(release.title);
  const description = comingSoon
    ? 'A digital membership, still sealed. What members receive opens with the launch.'
    : escape(release.description);
  const body = `<section class="launch" aria-labelledby="feature-title">
    <div class="launch-stage">
      ${comingSoon ? portrait() : `<div class="launch-pack">${packImage('(max-width: 780px) 94vw, 72vw', {priority: true})}</div>`}
      <div class="frame launch-frame">
        <div class="launch-copy">
          <p class="kicker"><span class="kicker-rule" aria-hidden="true"></span>${comingSoon ? 'Mystery subscription' : 'Digital release'}</p>
          <h1 class="feature-title" id="feature-title">${title}</h1>
          <p class="intro-copy">${description}</p>
          <div class="feature-actions"><a class="primary-action" href="${url}">${comingSoon ? 'See the drop' : 'View the release'} ${arrow}</a>${availability(release)}</div>
        </div>
      </div>
    </div>
  </section>
  <div class="frame store-main">
    <section class="seal-section" aria-labelledby="seal-heading">
      <div class="section-heading"><h2 id="seal-heading">The first drop</h2><span>Release 001</span></div>
      <a class="seal" href="${url}">${packImage('(max-width: 780px) 92vw, 1200px', {priority: comingSoon ? false : true})}</a>
    </section>
  </div>`;
  return storeLayout(profile, {
    title: 'Future Store — The first drop',
    urlPath: '/products/',
    description: 'Future Store’s first digital subscription is yet to drop. Release details will be announced here.',
    body
  });
}

function facts(rows) {
  return `<dl class="facts">${rows.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;
}

export function releasePage(profile, release) {
  const url = releaseUrl(release);
  const comingSoon = !release.canPurchase;
  const action = comingSoon
    ? `<button class="primary-action wide" type="button" disabled>Yet to drop</button>
       <a class="quiet-link" href="/checkout/">Check availability ${arrow}</a>`
    : `<a class="primary-action wide" href="/checkout/">Continue to checkout ${arrow}</a>`;
  const body = `<div class="frame">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/products/">Store</a><span aria-hidden="true">/</span><span aria-current="page">The first drop</span></nav>
    <section class="product-layout" aria-labelledby="product-title">
      <figure class="seal seal-product">${packImage('(max-width: 780px) 92vw, 680px', {priority: true})}</figure>
      <div class="product-copy">
        <p class="kicker"><span class="kicker-rule" aria-hidden="true"></span>Release 001</p>
        <h1 class="page-title" id="product-title">${escape(release.title)}</h1>
        ${availability(release)}
        <p class="intro-copy">${escape(release.description)}</p>
        ${facts([['Created by', profile.name], ['Release date', comingSoon ? 'To be announced' : 'Available now'], ['Price', release.priceLabel]])}
        <div class="product-actions">${action}</div>
        <details class="detail-note"><summary>Release enquiries</summary><p><a href="${enquiry(profile)}">Email ${escape(profile.name)} ${arrow}</a></p></details>
      </div>
    </section>
  </div>`;
  return storeLayout(profile, {title: `${release.title} — Future Store`, urlPath: url, description: release.description, body});
}

export function checkoutPage(profile, release) {
  const url = releaseUrl(release);
  const next = release.canPurchase
    ? `<a class="primary-action wide" href="${escape(release.checkoutUrl)}" rel="noreferrer">Continue to Stripe ${arrow}</a><p class="checkout-note">You’ll enter your payment details on Stripe’s hosted checkout.</p>`
    : '<button class="primary-action wide" type="button" disabled>Not on sale yet</button>';
  const body = `<div class="frame">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/products/">Store</a><span aria-hidden="true">/</span><a href="${url}">The first drop</a><span aria-hidden="true">/</span><span aria-current="page">Availability</span></nav>
    <section class="checkout-layout" aria-labelledby="checkout-title">
      <div><p class="kicker"><span class="kicker-rule" aria-hidden="true"></span>Release 001</p>
        <h1 id="checkout-title" class="page-title">${release.canPurchase ? 'Checkout' : 'Yet to<br><em>drop.</em>'}</h1>
        <p class="intro-copy">${release.canPurchase ? escape(release.deliveryDescription) : 'This subscription is not on sale. The live price will be in GBP when checkout opens.'}</p>
        <a class="quiet-link" href="${url}">View the drop ${arrow}</a>
      </div>
      <aside class="order-summary" aria-label="Release summary">
        <div class="order-product">${packImage('84px')}<div><span class="kicker">Digital subscription</span><h2>${escape(release.title)}</h2></div></div>
        ${facts([['Availability', release.statusLabel], ['Price', release.priceLabel]])}
        ${next}
      </aside>
    </section>
  </div>`;
  return storeLayout(profile, {title: 'Availability & checkout — Future Store', urlPath: '/checkout/', noindex: true, description: 'Availability and checkout for the first Future drop. Checkout is closed.', body});
}
