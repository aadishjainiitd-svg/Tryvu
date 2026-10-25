/* Presentation contracts: pausing, persistence, OS override, view controls and
   pointer cleanup. No provider request or gameplay fixture is needed. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.TRYVO_URL||'http://127.0.0.1:8765';
const out=process.env.TRYVO_SCREENSHOT_DIR||'/tmp/tryvo-motion';
fs.mkdirSync(out,{recursive:true});

(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1120},reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const setting=()=>page.locator('html').getAttribute('data-motion');
  const flowState=()=>page.locator('.atlas-flow').first().evaluate(el=>getComputedStyle(el).animationPlayState);
  const gameState=()=>page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key!=='tryvo-ambient-motion')));
  await page.goto(base+'/#explore');
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('.world-map-wrap').dataset.inView==='true');
  assert.equal(await setting(),'on');
  assert.equal(await flowState(),'running');
  const before=await gameState();

  await page.locator('button[data-atlas-view=routes]').click();
  assert.equal(await page.locator('.world-map-wrap').getAttribute('data-atlas-view'),'routes');
  assert.equal(await page.locator('button[data-atlas-view=routes]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('button[data-atlas-view=scenery]').getAttribute('aria-pressed'),'false');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.campaign-map>img')).filter.includes('brightness(0.32)'));
  assert.equal(new URL(page.url()).hash,'#explore');
  assert.deepEqual(await gameState(),before,'view controls cannot modify game state');
  await page.mouse.move(20,110);
  await page.screenshot({path:path.join(out,'atlas-routes.png')});
  await page.locator('button[data-atlas-view=scenery]').click();

  const pin=page.locator('.campaign-pin').nth(3);
  await pin.focus();
  assert.equal(await page.locator('[data-atlas-readout]').innerText(),await pin.evaluate(el=>`${el.dataset.atlasPlace} / ${el.dataset.atlasSkill}`));
  await page.locator('button[data-atlas-view=scenery]').focus();
  assert.equal(await page.locator('[data-atlas-readout]').innerText(),'Pick a stop. Make it your story.');
  const box=await page.locator('[data-depth=map]').boundingBox();
  await page.mouse.move(box.x+box.width*.8,box.y+100);
  await page.waitForFunction(()=>document.querySelector('[data-depth=map]').style.getPropertyValue('--depth-y')!=='');
  await page.locator('[data-motion-toggle]').first().click();
  assert.equal(await setting(),'off');
  assert.equal(await page.locator('[data-depth=map]').evaluate(el=>el.style.getPropertyValue('--depth-y')),'');
  assert.equal(await page.locator('.atlas-flow').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  for(const toggle of await page.locator('[data-motion-toggle]').all()) assert.equal(await toggle.getAttribute('aria-pressed'),'false');
  await page.reload();
  assert.equal(await setting(),'off','user pause survives reload');
  // A shorter viewport lets the complete map leave the screen at the footer.
  await page.setViewportSize({width:1440,height:600});
  await page.locator('[data-motion-toggle]').last().click();
  assert.equal(await setting(),'on');
  for(const toggle of await page.locator('[data-motion-toggle]').all()) assert.equal(await toggle.getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelector('.world-map-wrap').dataset.inView==='false');
  assert.equal(await flowState(),'paused','offscreen route animation pauses');
  await page.setViewportSize({width:1440,height:1120});
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForFunction(()=>document.querySelector('.world-map-wrap').dataset.inView==='true');
  assert.equal(await flowState(),'running');
  console.log('PASS map views, keyboard readout, pointer cleanup, pause persistence, synchronized controls and offscreen pausing');

  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='off');
  assert.equal(await setting(),'off');
  for(const toggle of await page.locator('[data-motion-toggle]').all()) assert(await toggle.isDisabled());
  assert.equal(await page.locator('.atlas-flow').first().evaluate(el=>getComputedStyle(el).display),'none');
  assert.equal(await page.evaluate(()=>localStorage.getItem('tryvo-ambient-motion')),'on','OS setting must not overwrite saved preference');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.documentElement.dataset.motion==='on');
  assert.equal(await setting(),'on');
  for(let i=0;i<3;i++) {
   await page.goto(base+'/#progress');
   await page.locator('.progress-page').waitFor();
   await page.goto(base+'/#explore');
   await page.locator('.campaign-home').waitFor();
  }
  await page.locator('[data-motion-toggle]').first().click();
  assert.equal(await setting(),'off','remounts cannot duplicate toggle listeners');
  await page.locator('[data-motion-toggle]').first().click();
  assert.equal(await setting(),'on');
  await page.mouse.move(20,110);
  await page.waitForTimeout(1200);
  await page.screenshot({path:path.join(out,'atlas-desktop.png'),fullPage:true});
  await page.locator('.campaign-pin[data-chapter=first-light]').click();
  await page.locator('[data-rescue=obstacle]').click();
  await page.locator('#case-initial').fill('My initial judgment remains editable while motion is enabled.');
  assert.match(await page.locator('#case-initial').inputValue(),/remains editable/);
  await page.keyboard.press('Escape');
  assert(await page.locator('#dialog').isHidden());
  assert.deepEqual(errors,[]);
  console.log('PASS runtime reduced-motion preference, repeated route mounts, normal-motion dialog entry/edit/Escape; no browser errors');
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
