/* Redesign regressions: fixed mobile drawer geometry, in-page chapter browsing,
   and tutorial guide/map overlap. Provider behavior is covered by cases-browser. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const base = process.env.TRYVO_URL || 'http://127.0.0.1:8765';
const out = process.env.TRYVO_SCREENSHOT_DIR || path.join(os.tmpdir(), 'tryvo-fieldguide');
fs.mkdirSync(out, { recursive: true });

(async () => {
 const browser = await chromium.launch({ headless: true });
 try {
  const context = await browser.newContext({ viewport: {width:1440,height:1000}, reducedMotion:'reduce' });
  const page = await context.newPage();
  const errors = [];
  const readable = async (textSelector, surfaceSelector) => {
   const ratio = await page.evaluate(([textSelector,surfaceSelector]) => {
    const numbers = value => value.match(/[\d.]+/g).slice(0,3).map(Number);
    const luminance = value => numbers(value).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);
    const a=luminance(getComputedStyle(document.querySelector(textSelector)).color);
    const b=luminance(getComputedStyle(document.querySelector(surfaceSelector)).backgroundColor);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   },[textSelector,surfaceSelector]);
   assert(ratio>=4.5, `${textSelector} needs readable contrast, got ${ratio}`);
  };
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if(response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base + '/#explore');
  await page.evaluate(() => document.fonts.ready);
  const sameHash = await page.evaluate(() => location.hash);
  await page.locator('[data-browse-journeys]').click();
  assert.equal(await page.evaluate(() => location.hash), sameHash, 'browse must not reroute the application');
  assert.equal(await page.locator('#all-journeys').getAttribute('open'), '');
  assert.equal(await page.locator('#all-journeys li').count(),12);
  assert(await page.locator('#all-journeys > summary').evaluate(el => el === document.activeElement));
  await page.locator('#all-journeys > summary').click();
  await page.locator('.chapter-card').nth(1).click();
  assert.equal(await page.evaluate(() => location.hash), '#rescue');
  await page.locator('.rescue-page h1').waitFor();
  assert.match(await page.locator('.rescue-page h1').innerText(), /A delicate balance/);
  console.log('PASS chapter browsing preserves route; featured chapters launch their actual journey');

  for (const width of [1440,1024,768,760,390,320]) {
   await page.setViewportSize({width,height:900});
   for (const route of ['explore','demo','progress','rankings','rescue']) {
    await page.goto(base + '/#' + route);
    await page.locator({explore:'.campaign-home',demo:'.tutorial-home',progress:'.progress-page',rankings:'.leaderboard-page',rescue:'.rescue-page'}[route]).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), `${route} overflows at ${width}px`);
    if(route === 'explore') {
     const main = await page.locator('h1').boundingBox();
     const header = await page.locator('.header').boundingBox();
     assert(main.y >= header.y+header.height, `headline hidden by header at ${width}px`);
     assert.equal(await page.locator('.campaign-pin').count(),12);
    }
    if (route==='demo') await readable('.lesson-card li','.lesson-card');
    if ((width===1440 || width===390) && route !== 'rescue') {
     await page.screenshot({path:path.join(out,`${route}-${width}.png`),fullPage:true});
    }
   }
   if(width <= 760) {
    await page.goto(base+'/#explore');
    await page.locator('.sidebar-toggle').click();
    const panel = await page.locator('.sidebar-panel').boundingBox();
    assert(Math.abs(panel.y+panel.height-900)<2, `drawer must reach viewport bottom at ${width}px`);
    assert(panel.height > 700, 'filtered header must not become drawer containing block');
    assert.equal(await page.locator('.sidebar-panel').evaluate(el=>el.inert),false);
    await page.locator('[data-action=demo-controls]').click();
    assert(await page.locator('#dialog').isVisible());
    await page.keyboard.press('Escape');
    await page.locator('.sidebar-toggle').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'),'false');
    assert(await page.locator('.sidebar-toggle').evaluate(el=>el===document.activeElement));
    assert.equal(await page.locator('.sidebar-panel').evaluate(el=>el.inert),true);
   }
   if(width <= 900) {
    await page.goto(base+'/#demo');
    await page.locator('[data-lesson="first-connection"]').click();
    await page.locator('.tutorial-guide').waitFor();
    await readable('.tutorial-counters strong','.tutorial-counters > div');
    const guide=await page.locator('.tutorial-guide').boundingBox();
    const map=await page.locator('.tutorial-play-area').boundingBox();
    assert(guide.y+guide.height <= map.y+1, `tutorial guide overlaps map at ${width}px`);
    if(width===390) await page.screenshot({path:path.join(out,'tutorial-play-390.png'),fullPage:true});
   }
  }
  console.log('PASS 320/390/760/768/1024/1440px overflow, mobile drawer, Escape/focus and tutorial geometry');
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(base+'/#explore');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.campaign-world')).opacity==='1');
  assert(await page.locator('.campaign-pin').first().isVisible());
  await page.screenshot({path:path.join(out,'explore-desktop.png'),fullPage:false});
  await page.locator('.campaign-pin[data-chapter="first-light"]').click();
  await page.locator('[data-rescue=obstacle]').click();
  await page.locator('#case-initial').waitFor();
  await page.screenshot({path:path.join(out,'case-desktop.png'),fullPage:false});
  assert.deepEqual(errors,[]);
  console.log('PASS normal-motion entrance and case entry; no browser errors or failed resources');
  console.log('Screenshots: '+out);
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
