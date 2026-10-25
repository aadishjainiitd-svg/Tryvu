/* Future Atlas: progressive presentation only. No game state or route ownership. */
(() => {
 'use strict';
 const root = document.documentElement;
 const main = document.querySelector('#main');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const fine = matchMedia('(hover: hover) and (pointer: fine)');
 const key = 'tryvo-ambient-motion';
 let saved = true;
 try { saved = localStorage.getItem(key) !== 'off'; } catch { /* Session-only preference. */ }
 let frame = 0, pointer = null, tilted = null, revealObserver = null, worldObserver = null;
 let previousRoute = null, mapStyle = 'scenery';
 let editSnapshot = null;
 let returnRequested = false;
 const returns = new Map();
 const routeName = () => location.hash.split('?')[0] || '#explore';
 document.addEventListener('click',event=>{
  const back=event.target.closest('.rescue-top a[href="#explore"],.tutorial-top a[href="#demo"],.tutorial-quit[href="#demo"]');
  if(back&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)returnRequested=true;
 },true);
 // Browsers with Navigation API also restore context on history traversal.
 window.navigation?.addEventListener('navigate',event=>{
  if(event.navigationType==='traverse')returnRequested=true;
 });
 const effects = new Set();
 const enabled = () => saved && !reduced.matches;

 function resetDepth() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (tilted) {
   tilted.style.removeProperty('--depth-x');
   tilted.style.removeProperty('--depth-y');
  }
  tilted = null;
  pointer = null;
 }
 function stopReveals() {
  revealObserver?.disconnect();
  revealObserver = null;
  effects.forEach(animation => animation.cancel());
  effects.clear();
 }
 function updatePreference() {
  root.dataset.motion = enabled() ? 'on' : 'off';
  document.querySelectorAll('[data-motion-toggle]').forEach(button => {
   button.setAttribute('aria-pressed', String(enabled()));
   button.disabled = reduced.matches;
   button.title = reduced.matches ? 'Reduced motion is enabled in your device settings' : 'Turn decorative animation on or off';
   button.querySelector('[data-motion-label]').textContent = reduced.matches ? 'Reduced motion' : enabled() ? 'Motion on' : 'Motion off';
  });
  if (!enabled()) { resetDepth(); stopReveals(); }
  window.dispatchEvent(new Event('tryvo:motionchange'));
 }
 function animate(element, frames, options) {
  if (!enabled() || !element.animate) return;
  const animation = element.animate(frames, options);
  effects.add(animation);
  animation.finished.then(() => effects.delete(animation), () => effects.delete(animation));
  return animation;
 }
 // Capture before synchronous page replacement. No delays to rendering or input.
 window.addEventListener('tryvo:before-render', event => {
  editSnapshot = null;
  const destination = routeName();
  const child = {'#explore':'#rescue','#demo':'#demo-play'}[previousRoute];
  if (event.detail.focus && child === destination) {
   const active = document.activeElement;
   const selected = previousRoute === '#explore'
    ? active.closest('[data-campaign="play"][data-chapter]')
    : active.closest('[data-lesson]');
   const selector = selected?.dataset.chapter
    ? `[data-campaign="play"][data-chapter="${CSS.escape(selected.dataset.chapter)}"]`
    : selected?.dataset.lesson ? `[data-lesson="${CSS.escape(selected.dataset.lesson)}"]` : null;
   const selectionIndex=selector?[...main.querySelectorAll(selector)].indexOf(selected):-1;
   returns.set(previousRoute,{scroll:scrollY,selector,selectionIndex,indexOpen:!!main.querySelector('#all-journeys')?.open});
  }
  if (!event.detail.focus && ['#rescue','#demo-play'].includes(previousRoute)) {
   const line = main.querySelector('.route-plan,.lesson-route');
   editSnapshot = {
    points:line?.getAttribute('points'),
    counters:[...main.querySelectorAll('.route-wallet strong,.tutorial-counters strong')].map(el=>el.textContent)
   };
  }
 });
 function polishEdit() {
  const snapshot = editSnapshot;
  editSnapshot = null;
  if (!enabled() || !snapshot) return;
  main.querySelectorAll('.route-wallet strong,.tutorial-counters strong').forEach((el,i)=>{
   if (snapshot.counters[i] !== undefined && snapshot.counters[i] !== el.textContent)
    animate(el,[{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'});
  });
  const line = main.querySelector('.route-plan,.lesson-route');
  const before = snapshot.points?.trim().split(/\s+/), after = line?.getAttribute('points')?.trim().split(/\s+/);
  if (!before?.length || after?.length !== before.length+1 || !before.every((point,i)=>point===after[i])) return;
  const segment=line.cloneNode(false), full=after.join(' ');
  line.setAttribute('points',before.join(' '));
  segment.setAttribute('points',after.slice(-2).join(' '));
  segment.setAttribute('pathLength','1');
  segment.setAttribute('aria-hidden','true');
  segment.classList.add('route-extension');
  segment.style.strokeDasharray='1';
  line.after(segment);
  const effect=animate(segment,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:190,easing:'ease-out'});
  const finish=()=>{line.setAttribute('points',full);segment.remove();};
  if(effect)effect.finished.then(finish,finish);else finish();
 }
 function setView(view) {
  const world = main.querySelector('.world-map-wrap');
  if (!world) return;
  mapStyle = view;
  world.dataset.atlasView = view;
  world.querySelectorAll('[data-atlas-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.atlasView === view)));
 }
 function mount() {
  resetDepth();
  stopReveals();
  worldObserver?.disconnect();
  worldObserver = null;
  updatePreference();
  setView(mapStyle);
  const world = main.querySelector('.world-map-wrap');
  if (world && 'IntersectionObserver' in window) {
   world.dataset.inView = 'false';
   worldObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.dataset.inView = String(entry.isIntersecting);
   }, {threshold:0});
   worldObserver.observe(world);
  }
  const route = routeName();
  const from = previousRoute;
  const newRoute = route !== previousRoute;
  previousRoute = route;
  const returnVisit = returnRequested && newRoute && ({'#explore':'#rescue','#demo':'#demo-play'}[route] === from) && returns.get(route);
  returnRequested = false;
  if (returnVisit) {
   const index=main.querySelector('#all-journeys');
   if(index)index.open=returnVisit.indexOpen;
   main.querySelector('.campaign-home,.tutorial-home')?.setAttribute('data-returned','true');
   window.scrollTo({top:returnVisit.scroll,behavior:'instant'});
   if(returnVisit.selector)main.querySelectorAll(returnVisit.selector)[returnVisit.selectionIndex]?.focus({preventScroll:true});
  }
  if (!newRoute) polishEdit();
  if (!enabled() || !newRoute) return;
  if (!returnVisit && ['#rescue','#demo-play','#progress','#rankings','#mission-library'].includes(route)) {
   const page=main.querySelector(':scope > section');
   if(page)animate(page,[{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.75,.2,1)'});
  }
  if(returnVisit)return;
  // Never animate a rerender caused by a route-building move or form update.
  if (!['#explore','#demo','#progress','#rankings'].includes(route)) return;
  const candidates = [...main.querySelectorAll('.chapter-card,.new-player-invite,.lesson-card,.mindscore-card,.leaderboard-standing')];
  if (!('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver((entries, observer) => {
   entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
    observer.unobserve(entry.target);
    animate(entry.target, [
     {opacity:0,transform:'translateY(28px) rotateX(5deg)'},
     {opacity:1,transform:'none'}
    ], {duration:650,delay:index*65,easing:'cubic-bezier(.2,.75,.2,1)',fill:'backwards'});
   });
  }, {threshold:.12});
  candidates.forEach(element => revealObserver.observe(element));
 }
 document.addEventListener('click', event => {
  if (event.target.closest('[data-motion-toggle]')) {
   if (reduced.matches) return;
   saved = !saved;
   try { localStorage.setItem(key, saved ? 'on' : 'off'); } catch { /* Session-only. */ }
   updatePreference();
  }
  const view = event.target.closest('button[data-atlas-view]');
  if (view) setView(view.dataset.atlasView);
 });
 main.addEventListener('pointermove', event => {
  if (!enabled() || !fine.matches || event.pointerType === 'touch') return;
  const target = event.target.closest('[data-depth]');
  if (target !== tilted) { resetDepth(); tilted = target; }
  if (!target) return;
  pointer = {x:event.clientX,y:event.clientY};
  if (frame) return;
  frame = requestAnimationFrame(() => {
   frame = 0;
   if (!tilted?.isConnected || !pointer || !enabled()) return;
   const box = tilted.getBoundingClientRect();
   const x = Math.max(-.5,Math.min(.5,(pointer.x-box.left)/box.width-.5));
   const y = Math.max(-.5,Math.min(.5,(pointer.y-box.top)/box.height-.5));
   const strength = tilted.dataset.depth === 'map' ? 2 : 7;
   tilted.style.setProperty('--depth-x', `${-y*strength}deg`);
   tilted.style.setProperty('--depth-y', `${x*strength}deg`);
  });
 }, {passive:true});
 main.addEventListener('pointerleave', resetDepth);
 main.addEventListener('focusin', resetDepth);
 function preview(pin) {
  const readout = main.querySelector('[data-atlas-readout]');
  if (!readout) return;
  main.querySelectorAll('.campaign-pin.is-inspected').forEach(item => item.classList.remove('is-inspected'));
  if (pin) {
   pin.classList.add('is-inspected');
   readout.textContent = `${pin.dataset.atlasPlace} / ${pin.dataset.atlasSkill}`;
  } else readout.textContent = 'Pick a stop. Make it your story.';
 }
 main.addEventListener('pointerover', event => {
  const pin = event.target.closest('.campaign-pin');
  if (pin) preview(pin);
 });
 main.addEventListener('pointerout', event => {
  const pin = event.target.closest('.campaign-pin');
  if (pin && !pin.contains(event.relatedTarget)) preview(document.activeElement.closest('.campaign-pin'));
 });
 main.addEventListener('focusin', event => { if (event.target.matches('.campaign-pin')) preview(event.target); });
 main.addEventListener('focusout', event => { if (event.target.matches('.campaign-pin')) preview(null); });
 reduced.addEventListener('change', updatePreference);
 fine.addEventListener('change', resetDepth);
 document.addEventListener('visibilitychange', () => {
  root.dataset.tabHidden = String(document.hidden);
  if (document.hidden) { resetDepth(); stopReveals(); }
 });
 // Only direct page replacements: input edits and animation styles do not remount.
 new MutationObserver(mount).observe(main, {childList:true});
 mount();
})();
