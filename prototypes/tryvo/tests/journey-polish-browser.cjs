const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const E=require('../js/rescue-engine.js');
const base=process.env.TRYVO_URL||'http://127.0.0.1:8765';
const out=process.env.TRYVO_SCREENSHOT_DIR||'/tmp/tryvo-journey-polish';
fs.mkdirSync(out,{recursive:true});

(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:950},reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tryvo-adventure-v1')));
  const sample=async(selector,terminal)=>page.evaluate(({selector,terminal})=>{
   window.tripSamples=[];
   let seen=false;
   const frame=()=>{
    const marker=document.querySelector(selector);
    if(marker?.dataset.travelling){
     seen=true;
     const style=getComputedStyle(marker),board=marker.parentElement;
     window.tripSamples.push({x:parseFloat(style.left)/board.clientWidth*100,y:parseFloat(style.top)/board.clientHeight*100,time:performance.now(),early:!!document.querySelector(terminal)});
    }
    if(!seen||marker?.dataset.travelling)requestAnimationFrame(frame);
   };
   requestAnimationFrame(frame);
  },{selector,terminal});
  await page.goto(base+'/#demo');
  await page.locator('[data-lesson=first-connection]').click();
  await page.locator('[data-tutorial=next]').click();
  await page.locator('[data-cell-id="6"]').click();
  await page.locator('[data-cell-id="7"]').click();
  await page.locator('#tutorial-saving').fill('2');
  await page.locator('#tutorial-repair [type=submit]').click();
  for(const id of [7,8,9])await page.locator(`[data-cell-id="${id}"]`).click();
  const ready=await saved();
  await sample('.tutorial-tram','#tutorial-total');
  await page.locator('[data-tutorial=run-from-guide]').click();
  await page.locator('#tutorial-total').waitFor();
  const samples=await page.evaluate(()=>tripSamples);
  assert(samples.filter(p=>p.x>9&&p.x<28).length>4,'tram needs visible intermediate positions before the first pickup');
  assert(samples.filter(p=>Math.abs(p.x-92)<.15).length>3,'tram must visibly settle at the last stop before the form replaces it');
  assert(samples.every(p=>!p.early),'dispatch form cannot precede arrival');
  assert.equal((await saved()).tutorial.drafts['first-connection'].phase,'settle');
  console.log('PASS smooth tutorial movement, visible arrival hold and form sequencing');

  const restore=async()=>{await page.evaluate(s=>localStorage.setItem('tryvo-adventure-v1',JSON.stringify(s)),ready);await page.goto(base+'/#demo-play');await page.reload();};
  await restore();
  await page.locator('[data-tutorial=run-from-guide]').click();
  await page.waitForFunction(()=>document.querySelector('.tutorial-tram')?.dataset.travelling==='true');
  await page.locator('.tutorial-top a').click();
  await page.waitForTimeout(2300);
  assert.equal(new URL(page.url()).hash,'#demo');
  assert.equal((await saved()).tutorial.drafts['first-connection'].phase,'run','leaving mid-trip cannot advance a stale lesson');
  assert.equal(await page.locator('#tutorial-total').count(),0);

  await restore();
  await page.locator('[data-tutorial=run-from-guide]').click();
  await page.waitForFunction(()=>document.querySelector('.tutorial-tram')?.dataset.travelling==='true');
  await page.evaluate(()=>document.querySelector('.footer [data-motion-toggle]').click());
  await page.locator('#tutorial-total').waitFor({timeout:1500});
  assert.equal(await page.locator('html').getAttribute('data-motion'),'off');
  await page.evaluate(()=>document.querySelector('.footer [data-motion-toggle]').click());
  console.log('PASS cancellation on leaving and immediate completion when motion is turned off');

  // Return to the exact launcher, including an expanded index and its scroll.
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.goto(base+'/#explore');
   await page.locator('[data-browse-journeys]').click();
   const launcher=page.locator('#all-journeys [data-campaign=play]').nth(8);
   await launcher.scrollIntoViewIfNeeded();
   await page.waitForTimeout(600);
   await launcher.focus();
   const position=await page.evaluate(()=>scrollY);
   await launcher.click();
   await page.locator('.rescue-top a').click();
   await page.waitForFunction(()=>document.activeElement?.closest('#all-journeys'));
   assert.equal(await page.locator('#all-journeys').getAttribute('open'),'');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.chapter),E.levels[8].id);
   assert(Math.abs(await page.evaluate(()=>scrollY)-position)<4,'return link must restore browsing position');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'/#explore');
  const card=page.locator('.chapter-card').nth(1);
  await card.click();
  await page.locator('.rescue-page').waitFor();
  await page.goBack();
  await page.waitForFunction(()=>document.activeElement?.matches('.chapter-card'));
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.chapter),E.levels[3].id);
  assert.equal(await page.locator('.campaign-home').getAttribute('data-returned'),'true');
  assert.equal(await page.locator('.campaign-world').evaluate(el=>getComputedStyle(el).animationName),'none','returning should not replay the initial hero entrance');
  await page.locator('.chapter-card').nth(1).click();
  await page.goBack();
  await page.waitForFunction(()=>document.activeElement?.matches('.chapter-card'));
  await page.evaluate(()=>{
   window.navigationRenders=0;
   window.addEventListener('tryvo:before-render',()=>navigationRenders++);
   location.hash='#progress';location.hash='#rankings';
  });
  await page.locator('.leaderboard-page').waitFor();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>navigationRenders),1,'queued navigation events should render the final destination once');
  console.log('PASS exact index/card focus, expanded state and scroll restoration at desktop/mobile; browser Back');

  await page.goto(base+'/#explore');
  await page.locator('.campaign-pin[data-chapter=first-light]').click();
  const level=E.levels[0];
  await page.locator('[data-rescue=obstacle]').click();
  await page.locator('[data-case=offline]').click();
  await page.locator('[name=saved]').fill(String(level.closedDistance-level.optimalDistance));
  await page.locator('#checkpoint-form [type=submit]').click();
  await page.locator('[data-puzzle-continue]').click();
  const route=E.shortest(level);
  for(const id of route.slice(1))await page.locator(`[data-cell="${id}"]`).click();
  await page.waitForFunction(()=>!document.querySelector('.route-extension'));
  assert.equal((await saved()).tram.drafts[level.id].path.length,route.length);
  assert.equal(await page.locator('.route-plan').evaluate(el=>el.points.numberOfItems),route.length,'drawn route must settle to the actual saved plan');
  await page.locator('[data-rescue=undo]').click();
  assert.equal(await page.locator('.route-plan').evaluate(el=>el.points.numberOfItems),route.length-1);
  await page.locator(`[data-cell="${route.at(-1)}"]`).click();
  await page.waitForFunction(()=>!document.querySelector('.route-extension'));
  await sample('.moving-tram','#case-initial');
  await page.locator('[data-rescue=run]').click();
  await page.locator('#case-initial').waitFor();
  const actual=await page.evaluate(()=>tripSamples);
  const end=await page.locator(`[data-cell="${route.at(-1)}"]`).evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top)}));
  assert(new Set(actual.map(p=>p.x.toFixed(2))).size>route.length*3,'campaign travel must interpolate');
  assert(actual.filter(p=>Math.abs(p.x-end.x)<.2&&Math.abs(p.y-end.y)<.2).length>3,'case must open after visible arrival');
  assert(actual.every(p=>!p.early));
  await page.keyboard.press('Escape');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:out+'/journey-after.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS route extension/undo, smooth campaign travel and checkpoint timing; no browser errors');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
