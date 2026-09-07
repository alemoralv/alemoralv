import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:4519/';
const label = process.argv[2] || 'final-v1';
const out = path.resolve('review', label);
fs.mkdirSync(out, { recursive: true });
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const report = { generatedAt: new Date().toISOString(), base, chrome, views: [] };
const specs = [
  ['desktop', 1440,1000], ['phone',390,844], ['compact',360,800], ['short-phone',360,640],
  ['reduced',1440,1000,'reduce'], ['reduced-phone',390,844,'reduce'], ['nojs',390,844,'reduce',false]
];
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
for (const [name,width,height,motion='no-preference',js=true] of specs) {
  const page = await browser.newPage({viewport:{width,height}, deviceScaleFactor:1, reducedMotion:motion, javaScriptEnabled:js, hasTouch:width<500, isMobile:width<500});
  await page.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.reject(new Error('Native pointer lock disabled during verification'));
    Element.prototype.setPointerCapture = function() {};
    Element.prototype.releasePointerCapture = function() {};
    Document.prototype.exitPointerLock = function() {};
  });
  const state = {name,width,height,motion,js,errors:[],failed:[],httpErrors:[]};
  page.on('pageerror',e=>state.errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error') state.errors.push(m.text());});
  page.on('requestfailed',r=>state.failed.push({url:r.url(),failure:r.failure()}));
  page.on('response',r=>{if(r.status()>=400) state.httpErrors.push({url:r.url(),status:r.status()});});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  if(js) await page.waitForSelector('html.sc-ready');
  await page.waitForTimeout(700);
  state.initial = await page.evaluate(()=>({ title:document.title, scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth, docHeight:document.documentElement.scrollHeight,
    background:getComputedStyle(document.body).backgroundColor,
    brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc),
    images:[...document.images].map(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight})),
    missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(decodeURIComponent(h.slice(1)))),
    modules:document.querySelectorAll('.module-btn').length,
    visibleReferences:[...document.querySelectorAll('.module-references')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0).length,
    pathButtonHidden:document.querySelector('.path-reset').hidden,
    pathOffset:getComputedStyle(document.querySelector('[data-path-line]')).strokeDashoffset,
    heroP:getComputedStyle(document.querySelector('.masthead')).getPropertyValue('--hero-p'),
    engineInstances:window.ScrollCraft?.instances.length ?? 0
  }));
  await page.screenshot({path:path.join(out,`${name}-opening.png`)});
  await page.screenshot({path:path.join(out,`${name}-full.png`),fullPage:true});
  if(js) {
    // Keyboard order and visible focus, including the horizontally scrollable phone nav.
    state.keyboard=[];
    await page.keyboard.press('Tab');
    await page.screenshot({path:path.join(out,`${name}-keyboard.png`)});
    for(let i=0;i<23;i++) {
      if(i) await page.keyboard.press('Tab');
      await page.waitForTimeout(800);
      state.keyboard.push(await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),s=getComputedStyle(e);let opacity=1;for(let a=e;a;a=a.parentElement)opacity*=Number(getComputedStyle(a).opacity);return {tag:e.tagName,text:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,80),href:e.getAttribute('href'),rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},opacity,visibility:s.visibility,outline:s.outline,onscreen:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};}));
    }
    // Native navigation controls must land below the sticky header.
    state.anchors=[];
    for(const id of ['about','projects','notes','academic-background','modules']) {
      await page.locator(`.index-link[href="#${id}"]`).click();
      await page.waitForTimeout(800);
      state.anchors.push(await page.evaluate(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),h=document.querySelector('.index').getBoundingClientRect();return {id,hash:location.hash,top:r.top,headerBottom:h.bottom,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,active:document.querySelector(`[data-index-for="${id}"]`).getAttribute('aria-current')};},id));
      await page.screenshot({path:path.join(out,`${name}-${id}.png`)});
    }
    state.disclosures=[];
    for(const i of [0,20,41]) {
      const button=page.locator('.module-btn').nth(i);
      if(i>=await page.locator('.module-btn').count())continue;
      await button.click(); await page.waitForTimeout(550);
      const open=await button.evaluate(b=>({expanded:b.getAttribute('aria-expanded'),controls:b.getAttribute('aria-controls'),visible:getComputedStyle(b.nextElementSibling).display!=='none'&&b.nextElementSibling.getBoundingClientRect().height>0,text:b.nextElementSibling.textContent.trim().slice(0,90)}));
      await button.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(550);
      const closed=await button.evaluate(b=>({expanded:b.getAttribute('aria-expanded'),visible:getComputedStyle(b.nextElementSibling).display!=='none'&&b.nextElementSibling.getBoundingClientRect().height>0}));
      state.disclosures.push({i,open,closed});
    }
    const reset=page.locator('.path-reset');
    await reset.scrollIntoViewIfNeeded(); await reset.focus(); await page.waitForTimeout(300);
    state.pathBefore=await page.locator('[data-path-line]').getAttribute('d');
    const before=await page.locator('.path-experiment').screenshot({path:path.join(out,`${name}-path-before.png`)});
    await page.keyboard.press('Enter');await page.waitForTimeout(550);
    state.pathAfter=await page.locator('[data-path-line]').getAttribute('d');
    const after=await page.locator('.path-experiment').screenshot({path:path.join(out,`${name}-path-after.png`)});
    state.path={changed:state.pathBefore!==state.pathAfter,pixelsChanged:hash(before)!==hash(after),status:await page.locator('.path-status').textContent(),offset:await page.locator('[data-path-line]').evaluate(e=>getComputedStyle(e).strokeDashoffset)};
    delete state.pathBefore;delete state.pathAfter;
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
    state.scroll=[];
    for(const fraction of [0,0.25,0.55,0.9]) {
      await page.evaluate(f=>scrollTo({top:document.querySelector('.masthead').offsetHeight*f,behavior:'instant'}),fraction);await page.waitForTimeout(250);
      state.scroll.push(await page.evaluate(()=>({y:scrollY,heroP:getComputedStyle(document.querySelector('.masthead')).getPropertyValue('--hero-p'),background:getComputedStyle(document.querySelector('.daylight-backdrop')).transform,portrait:getComputedStyle(document.querySelector('.portrait-mat')).transform,orbit:getComputedStyle(document.querySelector('.hero-orbit')).transform,pathOffset:getComputedStyle(document.querySelector('[data-path-line]')).strokeDashoffset,overflow:document.documentElement.scrollWidth>innerWidth})));
      if(name==='desktop'||name==='phone')await page.screenshot({path:path.join(out,`${name}-hero-${fraction}.png`)});
    }
    if(name==='desktop') {
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
      await page.mouse.move(40,130);await page.waitForTimeout(250);
      const p1=await page.screenshot({path:path.join(out,'desktop-pointer-left.png')});
      const t1=await page.locator('.portrait-mat').evaluate(e=>getComputedStyle(e).transform);
      await page.mouse.move(1320,530);await page.waitForTimeout(250);
      const p2=await page.screenshot({path:path.join(out,'desktop-pointer-right.png')});
      const t2=await page.locator('.portrait-mat').evaluate(e=>getComputedStyle(e).transform);
      state.pointer={transform1:t1,transform2:t2,pixelsChanged:hash(p1)!==hash(p2)};
      const links=await page.locator('a[href]').evaluateAll(as=>[...new Set(as.map(a=>a.href))]);
      state.localLinks=[];
      for(const u of links.filter(u=>u.startsWith(base))) {const url=new URL(u);url.hash='';const r=await page.request.head(url.href);state.localLinks.push({url:url.href,status:r.status()});}
      state.security=[];
      for(const route of ['.env','%2eenv','.git/config','.codex/','node_modules/','scrollcraft/builds/daylight/package.json','scrollcraft/builds/daylight/qa-server.mjs']) {const r=await page.request.get(base+route);state.security.push({route,status:r.status()});}
    }
  }
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(250);
  await page.screenshot({path:path.join(out,`${name}-closing.png`)});
  state.finalOverflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
  report.views.push(state);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({name,errors:state.errors,failed:state.failed,images:state.initial.brokenImages,initialWidth:state.initial.scrollWidth,final:state.finalOverflow,path:state.path,anchors:state.anchors}));
  await page.close();
}
await browser.close();
console.log(`Evidence written to ${out}`);
