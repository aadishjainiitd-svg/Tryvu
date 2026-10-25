/* Shared tram presentation. Callers retain all route rules, records and rewards. */
window.TryvoTravel = (() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const enabled = () => !reduced.matches && document.documentElement.dataset.motion !== 'off';

 function play({marker, points, onArrive = () => {}, onComplete = () => {}}) {
  let cancelled = false, animation = null, timer = null, release = null;
  const place = point => { marker.style.left = point.x+'%'; marker.style.top = point.y+'%'; };
  function wake() { clearTimeout(timer); timer = null; release?.(); release = null; }
  function preferenceChanged() { if (!enabled()) { animation?.finish(); wake(); } }
  function cleanup() {
   reduced.removeEventListener('change', preferenceChanged);
   window.removeEventListener('tryvo:motionchange', preferenceChanged);
   marker?.removeAttribute('data-travelling');
  }
  function cancel() {
   cancelled = true;
   animation?.cancel();
   wake();
   cleanup();
  }
  const wait = duration => new Promise(resolve => {
   if (!enabled() || !duration) return resolve();
   release = resolve;
   timer = setTimeout(() => { release = null; timer = null; resolve(); }, duration);
  });
  async function run() {
   // Let callers store the cancellation handle before even an instant trip ends.
   await Promise.resolve();
   if (cancelled || !marker?.isConnected || !points.length) return cleanup();
   marker.dataset.travelling = 'true';
   place(points[0]);
   if (!enabled() || !marker.animate) {
    place(points.at(-1));
    onArrive(points.at(-1), points.length-1);
   } else {
    onArrive(points[0], 0);
    await wait(points[0].pause || 90);
    for (let i=1; i<points.length; i++) {
     if (cancelled || !marker.isConnected) return cleanup();
     const from=points[i-1], to=points[i];
     if (enabled()) {
      const board=marker.parentElement;
      const distance=Math.hypot((to.x-from.x)*board.clientWidth/100,(to.y-from.y)*board.clientHeight/100);
      const departure=i===1 || !!from.pause, arrival=i===points.length-1 || !!to.pause;
      const easing=departure&&arrival?'cubic-bezier(.4,0,.2,1)':departure?'cubic-bezier(.4,0,1,1)':arrival?'cubic-bezier(0,0,.2,1)':'linear';
      animation=marker.animate([
       {left:from.x+'%',top:from.y+'%'},
       {left:to.x+'%',top:to.y+'%'}
      ],{duration:Math.max(180,Math.min(380,distance*2.1)),easing,fill:'forwards'});
      try { await animation.finished; } catch { if (cancelled) return; }
     }
     if (cancelled || !marker.isConnected) return cleanup();
     place(to);
     animation?.cancel();
     animation=null;
     onArrive(to,i);
     await wait(i===points.length-1?220:to.pause||0);
    }
   }
   if (cancelled || !marker.isConnected) return cleanup();
   cleanup();
   onComplete();
  }
  reduced.addEventListener('change', preferenceChanged);
  window.addEventListener('tryvo:motionchange', preferenceChanged);
  void run();
  return {cancel};
 }
 return {play,enabled};
})();
