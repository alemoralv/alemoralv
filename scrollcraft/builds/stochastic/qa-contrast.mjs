import fs from 'node:fs';
import path from 'node:path';
import { chromium } from './qa-runtime.mjs';
const out=path.resolve('review',process.argv[2]||'contrast-v1');fs.mkdirSync(out,{recursive:true});
const chrome=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
const browser=await chromium.launch({executablePath:chrome,headless:true});
const results=[];
for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]) {
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.addInitScript(()=>{Element.prototype.requestPointerLock=()=>Promise.reject(new Error('Disabled in QA'));Element.prototype.setPointerCapture=function(){};Element.prototype.releasePointerCapture=function(){};Document.prototype.exitPointerLock=function(){};});
 const reader=process.argv[3]==='reader';
 await page.goto('http://127.0.0.1:4519/'+(reader?'thinking-in-measures.html':''),{waitUntil:'domcontentloaded',timeout:60000});await page.evaluate(()=>document.fonts.ready);if(reader)await page.waitForSelector('body[data-math-ready="true"]',{timeout:30000});await page.waitForTimeout(500);
 for(const section of (reader?['home','thesis','notes']:['home','about','projects','notes','academic-background','modules'])) {
  await page.locator('#'+section).evaluate(e=>scrollTo({top:Math.max(0,e.getBoundingClientRect().top+scrollY-130),behavior:'instant'}));await page.waitForTimeout(200);
  const samples=await page.evaluate(()=>{
   const headerBottom=document.querySelector('.index').getBoundingClientRect().bottom;
   return [...document.querySelectorAll('.masthead-name,.hero-kicker,.masthead-bio,.wire-key,.wire-val,.portrait-note,.path-label,.path-reset,.index-mark,.index-link,.index-cta,.sheet-title,.sheet-tally,.about-text-wrapper p,.project-name,.project-links a,.note-name,.module-btn,.footer-invitation,.foot-sign,.reading-tagline,.reading-sub,.reading-caption,.thesis-line,#thesis p,.thesis-abstract-head,.blog-toggle-btn,.blog-meta')].flatMap(e=>{
    const s=getComputedStyle(e);let op=1;for(let a=e;a;a=a.parentElement)op*=Number(getComputedStyle(a).opacity);if(op<.85||s.visibility==='hidden'||s.display==='none')return [];
    const ink=(s.color.match(/[\d.]+/g)||[]).map(Number);if(ink.length<3)return [];
    const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),boxes=[];let node;
    while(node=walker.nextNode()){if(!node.textContent.trim()||node.parentElement.closest('[aria-hidden="true"]'))continue;const range=document.createRange();range.selectNodeContents(node);boxes.push(...range.getClientRects());}
    const rects=boxes.map(r=>({x:Math.max(0,r.left+2),y:Math.max(e.closest('.index')?0:headerBottom,r.top+2),right:Math.min(innerWidth,r.right-2),bottom:Math.min(innerHeight,r.bottom-2)})).filter(r=>r.right>r.x&&r.bottom>r.y&&r.y>=0&&r.y<innerHeight);
    if(!rects.length)return [];
    const fontSize=parseFloat(s.fontSize),weight=parseInt(s.fontWeight);return [{text:e.textContent.trim().replace(/\s+/g,' ').slice(0,80),selector:e.className,ink:ink.slice(0,3),fontSize,weight,threshold:fontSize>=24||(fontSize>=18.66&&weight>=700)?3:4.5,rects}];
   });
  });
  const hide=await page.addStyleTag({content:'html * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow:none !important; }'});
  const buf=await page.screenshot({path:path.join(out,`${name}-${section}-background.png`)});await hide.evaluate(e=>e.remove());
  const graded=await page.evaluate(async({samples,b64})=>{
   const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;const c=canvas.getContext('2d');c.drawImage(img,0,0);const data=c.getImageData(0,0,img.width,img.height).data;
   const lum=rgb=>rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   return samples.map(s=>{const ink=lum(s.ink);let worst=100,points=0;for(const r of s.rects)for(let y=Math.ceil(r.y);y<r.bottom;y+=3)for(let x=Math.ceil(r.x);x<r.right;x+=3){const i=(y*img.width+x)*4,bg=lum([data[i],data[i+1],data[i+2]]),ratio=(Math.max(ink,bg)+.05)/(Math.min(ink,bg)+.05);worst=Math.min(worst,ratio);points++;}return {...s,rects:undefined,points,worst:Number(worst.toFixed(2)),pass:worst>=s.threshold};});
  },{samples,b64:buf.toString('base64')});
  results.push({name,section,samples:graded});
 }
 await page.close();
}
await browser.close();fs.writeFileSync(path.join(out,'contrast.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({out,samples:results.reduce((n,x)=>n+x.samples.length,0),failures:results.flatMap(x=>x.samples.filter(s=>!s.pass).map(s=>({name:x.name,section:x.section,...s})))},null,2));
