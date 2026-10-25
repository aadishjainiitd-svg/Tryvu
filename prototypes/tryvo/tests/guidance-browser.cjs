const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../js/rescue-engine.js');
const base=process.env.TRYVO_URL||'http://127.0.0.1:8765';
const out=process.env.TRYVO_SCREENSHOT_DIR||'/tmp/tryvo-guidance';
fs.mkdirSync(out,{recursive:true});
const memo={recommendation:'Test the checkout before applying a broad discount to every booking.',evidence:'Exhibit E1 compares visits and conversion. I would separate a change in interest from a payment failure before attributing the drop.',tradeoff:'A discount could improve demand but reduces contribution on every booking.',test:'Compare conversion and payment failures across two groups before deciding to expand.'};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],sessions={};let session=0,arrivalReviews=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/cases/**',async route=>{
   const action=route.request().url().split('/').pop(),body=route.request().postDataJSON();let reply;
   if(action==='start'){const id='guidance-'+(++session);sessions[id]={kind:body.kind,level:body.level,attempt:0};reply={id,messages:[],turns:0};}
   else if(action==='review'){
    const s=sessions[body.sessionId];s.attempt++;
    const accepted=s.kind==='obstacle'||++arrivalReviews>1;
    reply={level:s.level,kind:s.kind,attempt:s.attempt,accepted,score:accepted?7:3,source:'Mock AI review',receipt:body.sessionId+'-'+s.attempt,summary:accepted?'The recommendation is ready.':'Compare the evidence more specifically.',consequence:'Test the proposed change before extending it.',nextQuestion:'What would make you reconsider?',rubric:Object.fromEntries(['framing','evidence','tradeoffs','test'].map((k,i)=>[k,{score:accepted?(i===3?1:2):(i===1?0:1),feedback:'State the evidence and a testable threshold.'}]))};
   }else throw Error('Unexpected provider request: '+action);
   await route.fulfill({contentType:'application/json',body:JSON.stringify(reply)});
  });
  const store=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tryvo-adventure-v1')));
  const phase=()=>page.locator('.journey-direction').getAttribute('data-guidance-state');
  const dismiss=async()=>{await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#dialog').classList.contains('case-dialog'));};
  const startCase=async()=>{await page.locator('#case-initial').fill('My first judgment is that I should compare the underlying causes before choosing a response.');await page.locator('[data-case-form=start] [type=submit]').click();await page.locator('[data-case-next=recommend]').waitFor();};
  const submit=async()=>{for(const [key,value]of Object.entries(memo))await page.locator('#case-'+key).fill(value);await page.locator('[data-case-form=review] [type=submit]').click();await page.locator('#dialog .case-verdict').waitFor();};
  await page.goto(base+'/#explore');
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.locator('.purpose-path li').count(),3);
   const cta=await page.locator('.fieldguide-note [data-campaign=play]').boundingBox();
   assert(cta.height>=44&&cta.y+cta.height<900,'first action should be visible without browsing the map');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(out,'first-use-home.png'),fullPage:true});
  await page.locator('.fieldguide-note [data-campaign=play]').click();
  assert.equal(await phase(),'case');
  await page.locator('[data-journey-action=obstacle]').click();
  await startCase();
  assert.match(await page.locator('.case-direction').innerText(),/questions is optional/);
  await page.locator('[data-case-next=recommend]').click();
  await submit();
  await dismiss();
  await page.waitForFunction(()=>document.querySelector('.journey-direction')?.dataset.guidanceState==='build',null,{timeout:3000});
  assert.equal(await phase(),'build','accepted case dismissal must update the locked board and next action');
  assert.equal(await page.locator('.repairable-obstruction').count(),0);
  await page.reload();
  assert.equal(await phase(),'build');
  const level=E.levels[0],planned=E.shortest(level);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   const before=await store();
   const expected=Array.from({length:level.cols*level.rows},(_,id)=>id).filter(id=>E.adjacent(level,level.start,id)&&!level.blocked.includes(id));
   const actual=await page.locator('[data-connection-choice]').evaluateAll(els=>els.map(el=>Number(el.dataset.connectionChoice)));
   assert.deepEqual(actual,expected,'every arrow must represent an equally available connection');
   await page.locator('[data-journey-action=show-connections]').click();
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.cell),String(level.start));
   const target=await page.locator(`[data-cell="${level.start}"]`).boundingBox();
   assert(target.x>=0&&target.x+target.width<=width+1&&target.y>=70&&target.y<900,'endpoint should be visible horizontally and below header');
   assert.deepEqual(await store(),before,'orientation must not edit routes, hints or awards');
   await page.screenshot({path:path.join(out,`connections-${width}.png`)});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const id of planned.slice(1))await page.locator(`[data-cell="${id}"]`).click();
  assert.equal(await phase(),'run');
  await page.locator('[data-journey-action=run]').click();
  await page.locator('#case-initial').waitFor();
  const runs=(await store()).tram.history.length;
  await dismiss();
  assert.equal(await phase(),'arrival');
  await page.locator('[data-journey-action=checkpoint]').click();
  assert.equal((await store()).tram.history.length,runs,'reopening arrival must not replay travel');
  await startCase();await page.locator('[data-case-next=recommend]').click();await submit();
  await dismiss();
  assert.equal(await phase(),'arrival','rejected arrival review still needs a decision');
  await page.reload();assert.equal(await phase(),'arrival');
  await page.locator('[data-journey-action=checkpoint]').click();
  await page.locator('[data-case=recommend]').click();await submit();
  await dismiss();
  await page.waitForFunction(()=>document.querySelector('.journey-direction')?.dataset.guidanceState==='finish',null,{timeout:3000});
  assert.equal(await phase(),'finish','accepted arrival review needs finalization, not another route plan');
  await page.reload();assert.equal(await phase(),'finish');
  assert.equal((await store()).tram.history.length,runs);
  await page.locator('[data-journey-action=finish-journey]').click();
  await page.locator('[data-feedback-continue]').click();
  assert.equal(await phase(),'complete');
  const completed=await store();
  assert.equal(completed.tram.history.length,runs+1);
  assert(completed.tram.history.at(-1).success);
  assert.equal(completed.tram.drafts[level.id].hint,false);
  await page.locator('.journey-next a').click();
  await page.locator('.progress-page').waitFor();
  console.log('PASS first action, case dismissal, equal-choice arrows, no guidance awards/hints, arrival revision/reload/finalization and reflection');

  // An earlier arrival must not turn an edited draft into a finishable trip.
  await page.goto(base+'/#rescue');
  await page.locator('[data-rescue=undo]').click();
  assert.equal(await phase(),'build');
  assert.equal(await page.locator('[data-journey-action=finish-journey]').count(),0);

  // A fresh attempt must never inherit the old arrival for an identical route.
  await page.locator('[data-rescue=clear]').first().click();
  await page.locator('[data-journey-action=obstacle]').click();
  await startCase();await page.locator('[data-case-next=recommend]').click();await submit();
  await dismiss();
  await page.waitForFunction(()=>document.querySelector('.journey-direction')?.dataset.guidanceState==='build');
  for(const id of planned.slice(1))await page.locator(`[data-cell="${id}"]`).click();
  assert.equal(await phase(),'run','an identical fresh route needs its own tram run');

  // A written first take is real progress even before any track is built.
  await page.goto(base+'/#explore');
  await page.locator('.campaign-pin[data-chapter=balanced-load]').click();
  await page.locator('[data-journey-action=obstacle]').click();
  await page.locator('#case-initial').fill('This is my saved initial judgment for the price-cut case, before building any route.');
  await dismiss();
  await page.locator('.rescue-top a').click();
  assert.equal(await page.locator('.fieldguide-note [data-campaign=play]').getAttribute('data-chapter'),'balanced-load');
  assert.match(await page.locator('.fieldguide-note [data-campaign=play]').innerText(),/Continue/);
  await page.reload();
  await page.locator('.fieldguide-note [data-campaign=play]').click();
  await page.locator('[data-journey-action=obstacle]').click();
  assert.match(await page.locator('#case-initial').inputValue(),/saved initial judgment/);
  await dismiss();
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(out,'first-use-route.png'),fullPage:true});
  for(const width of [390,320]){
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const action=await page.locator('.journey-next button').boundingBox();assert(action.height>=44);
   await page.evaluate(()=>scrollTo(0,0));
   if(width===390)await page.screenshot({path:path.join(out,'first-use-route-mobile.png'),fullPage:true});
   await page.locator('[data-journey-action=obstacle]').click();
   assert(await page.locator('#dialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await dismiss();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS edited-route invalidation, saved-first-take resume, mobile next-action and case layouts; no browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
