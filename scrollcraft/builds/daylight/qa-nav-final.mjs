import fs from 'node:fs';import path from 'node:path';import {chromium} from 'playwright-core';
const out=path.resolve('review/nav-final');fs.mkdirSync(out,{recursive:true});
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const browser=await chromium.launch({executablePath:chrome,headless:true});const result=[];
for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]) {
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});await page.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled in QA'));Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){};Document.prototype.exitPointerLock=function(){};});
 await page.goto('http://127.0.0.1:4519/',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await page.waitForSelector('html.sc-ready');
 await page.locator('.index-link[href="#modules"]').click();await page.waitForTimeout(1600);const before=await page.locator('.index-link.is-here').count();await page.locator('.index-mark').click();await page.waitForFunction(()=>scrollY<=1);await page.waitForTimeout(100);
 result.push({name,before,after:await page.locator('.index-link.is-here').count(),y:await page.evaluate(()=>scrollY),engine:await page.evaluate(()=>window.ScrollCraft.instances.length)});await page.screenshot({path:path.join(out,`${name}-opening.png`)});
 await page.close();
}
fs.writeFileSync(path.join(out,'nav-final.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));await browser.close();
