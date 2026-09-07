import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const base = 'http://127.0.0.1:4519/';
const out = path.resolve('review/baseline');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const report = { generatedAt: new Date().toISOString(), base, chrome, views: [] };
for (const [name, width, height] of [['desktop',1440,1000],['phone',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.reject(new Error('Native pointer lock disabled during verification'));
    Element.prototype.setPointerCapture = function() {};
    Element.prototype.releasePointerCapture = function() {};
    Document.prototype.exitPointerLock = function() {};
  });
  const errors = [], failed = [], httpErrors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => failed.push({ url: r.url(), failure: r.failure() }));
  page.on('response', r => { if (r.status() >= 400) httpErrors.push({url:r.url(),status:r.status()}); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(out,`${name}-opening.png`) });
  await page.screenshot({ path: path.join(out,`${name}-full.png`),fullPage:true });
  const state = await page.evaluate(() => ({
    title: document.title, width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    images:[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i=>i.getAttribute('src')),
    missingAnchors: [...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(decodeURIComponent(h.slice(1))))
  }));
  if (name === 'desktop') {
    const links = await page.locator('a[href]').evaluateAll(as=>[...new Set(as.map(a=>a.href))]);
    const local = links.filter(u=>u.startsWith(locationBase()));
    report.localLinks = [];
    for (const u of local) {
      const url = new URL(u); url.hash = '';
      const response = await page.request.head(url.href);
      report.localLinks.push({url:url.href,status:response.status()});
    }
    report.security = [];
    for (const route of ['.env','%2eenv','.git/config','.codex/','node_modules/','scrollcraft/builds/daylight/package.json','scrollcraft/builds/daylight/qa-server.mjs']) {
      const r = await page.request.get(base+route);
      report.security.push({route,status:r.status()});
    }
  }
  report.views.push({ name, ...state, errors, failed, httpErrors });
  await page.close();
}
function locationBase() { return base; }
fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify({out,views:report.views,brokenLocal:report.localLinks.filter(x=>x.status>=400),security:report.security},null,2));
