import {createRequire} from 'node:module';
import fs from 'node:fs';
export const {chromium}=createRequire(new URL('../daylight/package.json',import.meta.url))('playwright-core');
export const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
export const base='http://127.0.0.1:4519/';
export async function safePage(browser,options={}) {
 const page=await browser.newPage(options);
 await page.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled during QA'));Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){};Document.prototype.exitPointerLock=function(){};});
 return page;
}
