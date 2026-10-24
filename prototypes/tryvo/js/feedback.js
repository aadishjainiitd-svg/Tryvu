/* Event-driven feedback: never awards points or replays celebrations on refresh. */
window.TryvoFeedback=(()=>{
 'use strict';
 let host;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const close=(label='Keep going')=>`<button class="button" data-action="close" data-feedback-continue>${label}</button>`;
 function show(title,text,detail,actions,kind='success'){
  host.modal(title,`<div class="feedback-panel ${kind}" data-feedback-kind="${kind}"><div class="feedback-emblem" aria-hidden="true">${kind==='success'?'✦':kind==='retry'?'↻':'?'}</div><p class="feedback-lead">${esc(text)}</p>${detail}<div class="dialog-actions">${actions}</div></div>`);
  document.querySelector('#dialog').classList.add('feedback-dialog');
  document.querySelector('#dialog [data-feedback-continue]')?.focus();
 }
 function route(l,r){
  const s=host.getState(),C=window.TryvoCampaign,all=C.count(s)===12;
  if(!r.success){show('One more try. You’ve got a starting point.',r.message||window.TryvoRescueEngine.evaluate(l,r.path).message,'<p>Your route is still on the map. Tap an earlier junction to cut back, or undo the last street. Your test run stays in your contribution record.</p>',close('Revise my route'),'retry');return;}
  show(all?'Congratulations! You brought the festival together.':'Congratulations! Route complete.',`${r.passengers} passengers arrived over ${r.distance} km. +${r.awarded} arrival points. Dispatch rebate: +${r.rebate} credits; final balance: ${r.settledBalance}.`, `<div class="feedback-receipt"><strong>${esc(l.name)}</strong><span>${r.path.length-1} connected streets · ${r.hint?'Nudge used':'No in-game nudge used'}</span><span>${C.count(s)} of 12 tram journeys completed</span></div><p>${esc(C.chapter(l.id).handoff)}</p>`,close('See my route and next chapter'));
 }
 function mission(m,r){
  const s=host.getState(),check=m.type==='check',supported=r.score===100,all=window.TryvoCampaign.count(s)===12;
  const title=check?'Independent check complete.':supported?'Congratulations! Investigation complete.':'Attempt complete. Keep building your reasoning.';
  const text=check?'Your response is recorded. Explore what the evidence supports in this unfamiliar situation.':supported?'Your conclusion, evidence connections and next step are supported by this task’s rubric.':'You made a decision and left a record of your thinking. Some parts need another look—your feedback shows where.';
  show(title,text,`<div class="feedback-receipt"><strong>${esc(m.title)}</strong><span>${r.score}/100 on this task · ${r.mode==='coop'?'Shared attempt':r.replay?'Replay':r.hint||r.external?'Assistance declared':'No assistance declared'}</span></div>${all&&!check?'<p>All twelve tram journeys are now recorded. Your festival is ready to review.</p>':''}<p>${check?'This records one task; it does not establish general improvement.':supported?'Your choices are now part of the festival story.':'Completing an attempt is progress through the story, not a claim that every answer was correct.'}</p>`,close(check?'See my feedback':'See what happened'),supported&&!check?'success':'reflection');
 }
 function guide(){
  const s=host.getState(),a=s.active,hash=location.hash.split('?')[0];let title='Your festival, one chapter at a time.',steps=['Choose any of the twelve numbered stops to start a tram journey.','Every level is a tram journey. A checkpoint puzzle stands between your plan and the arrival.','Use the map to preview later chapters, or the mission library to practise freely.'];
  if(hash==='#rescue'){title='Connect. Test. Revise.';steps=['Start at the depot. Tap a highlighted neighbouring junction, or use arrow keys and Enter.','Click the striped obstruction and solve its repair challenge. Compare travel cost, fares, capacity and distance before choosing pickups.','Run the tram to test your plan. If it stops, keep your route and revise it. Visit any marked service stop, then complete final dispatch at arrival.'];}
  else if(hash==='#mission-library'){title='Choose what you want to practise.';steps=['Search or filter the five playable investigations by topic.','These five standalone investigations are extra practice. They do not count toward the twelve tram journeys.','Upcoming stories are previews only. Return to the festival map to continue the connected campaign.'];}
  else if(hash==='#progress'||hash==='#festival-file'){title='Read your progress in context.';steps=['The progress bar counts twelve tram journeys; both the route and checkpoint must be complete.','Open a level row to see its latest result, feedback and any earlier attempts.','The independent check is separate. Completion records participation, not mastery.'];}
  else if(hash==='#rankings'){title='Your place in the demo league.';steps=['Your existing game points place you alongside 12 fictional players with fixed scores.','Use Find me in the table to jump to your row. Equal scores share a rank.','Open How scoring works for the points rules. Your level reports stay in My progress.'];}
  else if(hash==='#result'||a?.phase==='result'&&hash==='#mission'){title='See what your decisions contributed.';steps=['Reveal your contribution after the story outcome.','Read the source connections and task feedback; look for a specific change to try.','Continue the festival, revisit an investigation, or try the separate independent check. Reflection is optional.'];}
  else if(hash==='#mission'&&a){
   if(a.phase==='initial'){title='Make your first call.';steps=['Choose what you think is happening before opening the evidence.','Select your confidence. A personal note is optional.','Record your judgment to start investigating. You can revise your conclusion later.'];}
   else if(a.phase.startsWith('handoff')){title='Pass the device to your partner.';steps=['Let the next player make their own initial judgment and explore their evidence.','Use the handoff button when your partner is ready.','This is local shared play on one device. Both perspectives stay in the record.'];}
   else if(a.phase==='investigate'){title='Turn clues into a reason.';steps=['Open the evidence cards and select the clues that support your view.','Compare clues side by side. For shared play, record your source and interpretation before handing over.','Continue to your decision when you have supporting evidence. A nudge is available and is recorded as assistance.'];}
   else {title=a.phase==='check'?'Try this one on your own.':'Connect your evidence to your decision.';steps=['Choose a conclusion and select supporting evidence.','For each connection, choose the source and explain what it means. Complete the next step or comparison plan.','Submit when ready. Declare outside assistance if used; your contribution is still recorded.'];}
  }
  show(title,'A little direction. The choices stay yours.',`<ol class="feedback-steps">${steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`,close('Got it'),'guide');
 }
 function mount(){
  const main=document.querySelector('#main');if(!main||['#demo','#demo-play','#rescue'].includes(location.hash.split('?')[0]))return;
  main.insertAdjacentHTML('afterbegin','<div class="step-help"><button class="text-button" data-feedback-help aria-haspopup="dialog"><span aria-hidden="true">?</span> Help at this step</button></div>');
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-feedback-help]'))guide();});
 document.querySelector('#dialog').addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const dialog=e.currentTarget,items=[...dialog.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex]')].filter(n=>!n.disabled&&n.tabIndex>=0&&n.getClientRects().length);
  if(!items.length){e.preventDefault();return;}
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 return {configure:api=>host=api,route,mission,mount};
})();
