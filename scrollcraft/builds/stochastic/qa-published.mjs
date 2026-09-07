import fs from 'node:fs';
import path from 'node:path';
import {chromium, chrome, safePage} from './qa-runtime.mjs';

// A focused check at the actual GitHub Pages base path after publication.
const revision = process.argv[2] || 'current';
const root = 'https://alemoralv.github.io/alemoralv/';
const out = path.resolve('scrollcraft/builds/stochastic/review/published-' + revision);
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({executablePath: chrome, headless: true});
const results = [];
try {
  for (const route of ['index.html', 'thinking-in-measures.html']) {
    const reader = route !== 'index.html';
    const page = await safePage(browser, {viewport: {width: 1440, height: 1000}});
    const errors = [], badResponses = [], resources = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => {
      resources.push(response.url());
      if (response.status() >= 400) badResponses.push({url: response.url(), status: response.status()});
    });
    const response = await page.goto(root + route + '?revision=' + encodeURIComponent(revision), {waitUntil: 'domcontentloaded', timeout: 45000});
    await page.waitForSelector('html.sc-ready');
    await page.evaluate(() => document.fonts.ready);
    if (reader) await page.waitForSelector('body[data-math-ready="true"]', {timeout: 45000});
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    const state = await page.evaluate(() => ({
      title: document.title,
      body: document.body.className,
      layers: document.querySelectorAll('.stochastic-layer[data-depth]').length,
      engine: window.ScrollCraft?.instances.length,
      brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.currentSrc),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      math: document.querySelectorAll('mjx-container').length,
      mathErrors: document.querySelectorAll('mjx-merror,[data-mjx-error]').length,
      notes: document.querySelectorAll('.blog-toggle-btn').length
    }));
    await page.screenshot({path: path.join(out, route + '-desktop.png')});
    const toggles = [];
    if (reader) {
      for (let i = 0; i < 3; i++) {
        const button = page.locator('.blog-toggle-btn').nth(i);
        await button.click();
        await page.waitForTimeout(650);
        toggles.push(await button.evaluate(element => ({expanded: element.getAttribute('aria-expanded'), math: document.querySelectorAll('mjx-container').length, inert: element.closest('.blog-card').querySelector('.blog-content').inert})));
        await button.click();
        await page.waitForTimeout(650);
      }
    }
    await page.setViewportSize({width: 390, height: 844});
    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.waitForTimeout(650);
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    const mobile = await page.evaluate(() => ({width: innerWidth, documentWidth: document.documentElement.scrollWidth, imagesLoaded: [...document.images].every(image => image.complete && image.naturalWidth > 0), math: document.querySelectorAll('mjx-container').length}));
    await page.screenshot({path: path.join(out, route + '-phone.png')});
    const oldArtwork = resources.filter(url => url.includes('/atelier-'));
    const pass = response.status() === 200 && state.body.includes('stochastic') && state.layers === 9 && state.engine === 1 && !state.brokenImages.length && !errors.length && !badResponses.length && !oldArtwork.length && state.documentWidth === state.viewportWidth && mobile.documentWidth === mobile.width && mobile.imagesLoaded && (!reader || (state.notes === 3 && state.math === 144 && !state.mathErrors && toggles.every(item => item.expanded === 'true' && !item.inert && item.math === 144) && mobile.math === 144));
    const result = {route, revision, status: response.status(), pass, state, toggles, mobile, errors, badResponses, oldArtwork, stochasticResources: [...new Set(resources.filter(url => url.includes('stochastic'))) ]};
    results.push(result);
    console.log(JSON.stringify(result));
    await page.close();
  }
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}
if (results.length !== 2 || results.some(result => !result.pass)) process.exitCode = 1;
