// Node preload for the unchanged upstream harness. Await this reader's real
// asynchronous MathJax completion before allowing harness sampling to start.
import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../daylight/package.json',import.meta.url))('playwright-core');
const launch=chromium.launch.bind(chromium);
chromium.launch=async function(options){
 const browser=await launch(options),newPage=browser.newPage.bind(browser);
 browser.newPage=async function(options){
  const page=await newPage(options),goto=page.goto.bind(page);
  page.setDefaultNavigationTimeout(60000);
  page.goto=async function(url,options){
   const response=await goto(url,options);
   if(url.includes('thinking-in-measures.html')){
    await page.waitForSelector('body[data-math-ready="true"]',{timeout:60000});
    await page.evaluate(()=>window.__timMathReady);
    console.log('Reader MathJax ready: '+await page.locator('mjx-container').count()+' containers');
   }
   return response;
  };
  return page;
 };
 return browser;
};
