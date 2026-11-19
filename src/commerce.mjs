export function validatePaymentLink(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new Error('The Stripe payment link must be a URL.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com' || url.port || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9_]{6,}$/.test(url.pathname)) {
    throw new Error('Use the exact HTTPS buy.stripe.com payment link from your Stripe account.');
  }
  return url.href;
}

export function prepareCommerce(config) {
  if (config.provider !== 'stripe_payment_links') throw new Error('Unsupported payment provider.');
  if (!['coming_soon','available'].includes(config.status)) throw new Error('Unknown product status.');
  const paymentLink = validatePaymentLink(config.paymentLink);
  const comingSoon = { ...config, canPurchase:false, checkoutUrl:null, priceLabel:'To be announced', statusLabel:'Yet to drop' };
  if (config.status === 'coming_soon') return comingSoon;
  if (!paymentLink || !Number.isSafeInteger(config.amountMinor) || config.amountMinor <= 0 || config.currency !== 'gbp' || !config.title?.trim() || !config.description?.trim() || !config.deliveryDescription?.trim() || config.fulfilmentReady !== true) {
    throw new Error('Checkout stays closed until the product, GBP price, Stripe payment link and delivery process are ready.');
  }
  if (new URL(paymentLink).pathname.startsWith('/test_')) throw new Error('A test payment link cannot be published as a live product.');
  return {...config,canPurchase:true,checkoutUrl:paymentLink,priceLabel:new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(config.amountMinor/100),statusLabel:'Available'};
}
