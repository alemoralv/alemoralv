import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {chromium,chrome,base,safePage} from './qa-runtime.mjs';
const out=path.resolve('review/baseline');fs.mkdirSync(out,{recursive:true});const results=[];
const browser=await chromium.launch({executablePath:chrome,headless:true});
for(const [name,width,height,js] of [['desktop',1440,1000,true],['phone',390,844,true],['nojs',390,844,false]]) {
 const page=await safePage(browser,{viewport:{width,height},deviceScaleFactor:1,javaScriptEnabled:js});
 const r={name,errors:[],failed:[],httpErrors:[],responses:[]};page.on('pageerror',e=>r.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')r.errors.push(m.text());});page.on('requestfailed',q=>r.failed.push({url:q.url(),failure:q.failure()}));page.on('response',q=>{r.responses.push({url:q.url(),status:q.status()});if(q.status()>=400)r.httpErrors.push({url:q.url(),status:q.status()});});
 // Route the saved pre-edit HTML so concurrent redesign work cannot replace this baseline.
 await page.route('**/thinking-in-measures.html',route=>route.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(path.join(out,'thinking-in-measures.html.source'),'utf8')}));
 await page.goto(base+'thinking-in-measures.html',{waitUntil:'commit'});
 try{await page.waitForLoadState('domcontentloaded',{timeout:20000});}catch(e){r.startupTimeout=String(e);}
 await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]));
 if(js){try{await page.waitForSelector('.blog-card',{timeout:15000});await page.waitForFunction(()=>Boolean(window.MathJax?.startup?.document),undefined,{timeout:15000});await page.evaluate(()=>Promise.race([window.MathJax.startup.promise,new Promise(resolve=>setTimeout(resolve,5000))]));}catch(e){r.typesetWaitError=String(e);}}
 await page.waitForTimeout(700);await page.screenshot({path:path.join(out,name+'-reader-opening.png')});
 r.initial=await page.evaluate(()=>({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,notes:[...document.querySelectorAll('.blog-toggle-btn')].map(e=>e.textContent.trim()),math:document.querySelectorAll('mjx-container').length,mathErrors:document.querySelectorAll('mjx-merror,[data-mjx-error]').length,thesisText:document.getElementById('thesis').textContent,visiblePosts:[...document.querySelectorAll('.blog-content')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0).length}));
 r.disclosures=[];
 if(js)for(let i=0;i<await page.locator('.blog-toggle-btn').count();i++){
  const btn=page.locator('.blog-toggle-btn').nth(i);await btn.click();await page.waitForTimeout(700);
  const state=await btn.evaluate(e=>{const c=e.closest('.blog-card'),b=c.querySelector('.blog-content');return {title:e.textContent.trim(),expanded:e.getAttribute('aria-expanded'),display:getComputedStyle(b).display,height:b.getBoundingClientRect().height,text:b.textContent,math:b.querySelectorAll('mjx-container').length,mathErrors:b.querySelectorAll('mjx-merror,[data-mjx-error]').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,equations:[...b.querySelectorAll('.blog-equation')].map(x=>({width:x.clientWidth,scrollWidth:x.scrollWidth,overflowX:getComputedStyle(x).overflowX}))};});
  state.textHash=crypto.createHash('sha256').update(state.text).digest('hex');delete state.text;
  await page.screenshot({path:path.join(out,`${name}-post-${i}-open.png`)});await btn.focus();await page.keyboard.press('Enter');await page.waitForTimeout(700);state.closed=await btn.evaluate(e=>({expanded:e.getAttribute('aria-expanded'),height:e.closest('.blog-card').querySelector('.blog-content').getBoundingClientRect().height}));r.disclosures.push(state);
 }
 const hrefs=await page.locator('a[href]').evaluateAll(as=>[...new Set(as.map(a=>a.href))]);r.localLinks=[];if(name==='desktop')for(const href of hrefs.filter(x=>x.startsWith(base))){const u=new URL(href);u.hash='';const q=await page.request.head(u.href);r.localLinks.push({url:u.href,status:q.status()});}
 results.push(r);fs.writeFileSync(path.join(out,'reader-baseline.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({...r,initial:{...r.initial,thesisText:undefined},disclosures:r.disclosures.map(x=>({...x,equations:undefined}))}));await page.close();
}
await browser.close();
