import fs from 'node:fs';import path from 'node:path';import {chromium} from 'playwright-core';
const out=path.resolve('review',process.argv[2]||'focused-v1');fs.mkdirSync(out,{recursive:true});
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const browser=await chromium.launch({executablePath:chrome,headless:true});const results=[];
for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]) {
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled in QA'));Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){};Document.prototype.exitPointerLock=function(){};});
 const r={name,errors:[],keyboard:[],disclosures:[]};page.on('pageerror',e=>r.errors.push(String(e)));
 await page.goto('http://127.0.0.1:4519/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.waitForSelector('html.sc-ready');await page.waitForTimeout(500);
 r.engine=await page.evaluate(()=>({instances:window.ScrollCraft.instances.length,canvas:getComputedStyle(document.documentElement).getPropertyValue('--sc-canvas'),heroP:getComputedStyle(document.querySelector('.masthead')).getPropertyValue('--hero-p')}));
 for(let i=0;i<26;i++) {
  await page.keyboard.press('Tab');await page.waitForTimeout(800);
  r.keyboard.push(await page.evaluate(()=>{const e=document.activeElement,b=e.getBoundingClientRect(),s=getComputedStyle(e);let op=1;for(let a=e;a;a=a.parentElement)op*=Number(getComputedStyle(a).opacity);return {text:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,70),href:e.getAttribute('href'),onscreen:b.top<innerHeight&&b.bottom>0&&b.left<innerWidth&&b.right>0,opacity:op,outline:s.outline,top:b.top,bottom:b.bottom};}));
 }
 for(const i of [0,20,41]) {
  const btn=page.locator('.module-btn').nth(i);await btn.click();await page.waitForTimeout(550);const open=await btn.evaluate(e=>({expanded:e.getAttribute('aria-expanded'),height:e.nextElementSibling.getBoundingClientRect().height}));
  await btn.focus();await page.keyboard.press('Enter');await page.waitForTimeout(550);const closed=await btn.evaluate(e=>({expanded:e.getAttribute('aria-expanded'),height:e.nextElementSibling.getBoundingClientRect().height}));r.disclosures.push({i,open,closed});
 }
 await page.locator('.index-link[href="#modules"]').click();await page.waitForTimeout(800);r.navBefore=await page.locator('.index-link.is-here').count();
 await page.locator('.index-mark').click();await page.waitForFunction(()=>scrollY<=1);r.navAfter=await page.locator('.index-link.is-here').count();r.topAfter=await page.evaluate(()=>scrollY);
 await page.screenshot({path:path.join(out,`${name}-opening.png`)});
 r.scroll=[];
 for(const y of [0,300,600]){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(220);r.scroll.push(await page.evaluate(()=>({y:scrollY,p:getComputedStyle(document.querySelector('.masthead')).getPropertyValue('--hero-p'),scP:getComputedStyle(document.querySelector('.masthead')).getPropertyValue('--sc-p'),portrait:getComputedStyle(document.querySelector('.portrait-mat')).transform,offset:getComputedStyle(document.querySelector('[data-path-line]')).strokeDashoffset})));}
 results.push(r);fs.writeFileSync(path.join(out,'focused.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({...r,keyboard:r.keyboard.filter(x=>!x.onscreen||x.opacity<.85)}));await page.close();
}
await browser.close();
