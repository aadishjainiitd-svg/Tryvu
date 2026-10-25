/* Twelve route-led journeys. Completion requires a route and its checkpoint, not an ability claim. */
window.TryvoCampaign=(()=>{
 const RE=window.TryvoRescueEngine,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const positions=[[12,28],[29,20],[48,25],[69,19],[87,31],[73,43],[53,47],[32,44],[14,62],[37,73],[61,70],[84,67]];
 const chapters=RE.levels.map((l,i)=>({id:l.id,type:'route',title:l.name,skill:window.TryvoCaseData[l.id].skill,place:l.place||['Tram depot','Town stops','River crossing'][['first-light','all-aboard','across-the-river'].indexOf(l.id)],x:positions[i][0],y:positions[i][1],why:window.TryvoCaseData[l.id].title+' · '+l.brief,handoff:l.puzzle.win}));
 const chapter=id=>chapters.find(c=>c.id===id);
 const records=s=>RE.valid(s.tram)?s.tram.history:[];
 const record=(s,id)=>records(s).filter(r=>r.level===id&&r.success&&r.journeyVersion===3).at(-1)||null;
 const done=(s,id)=>!!record(s,id),count=s=>chapters.filter(c=>done(s,c.id)).length,next=s=>chapters.find(c=>!done(s,c.id))||null,available=(s,id)=>!!chapter(id);
 function effect(s,id){const r=record(s,id);return r?`${r.passengers} passengers · ${r.distance} km · ${r.net} operating net`:'Review a client case, unlock the shortcut and respond to a new development at arrival.';}
 const status=(s,c)=>done(s,c.id)?'Journey complete':'Ready to explore';
 const routeLevel=(s,l)=>l;
 const destination=()=> 'Lantern Festival';
 function launch(s,c,label){return `<button class="button campaign-launch" data-campaign="play" data-chapter="${c.id}">${esc(label||(done(s,c.id)?'Replay journey':'Start journey'))} <span aria-hidden="true">→</span></button>`;}
 function resume(s){const id=s.tram?.selected,d=s.tram?.drafts?.[id],started=d&&(d.path?.length>1||d.obstacle?.solved||d.obstacle?.case?.initial?.trim()||d.obstacle?.tries?.length);return chapter(id)&&started&&!done(s,id)?chapter(id):null;}
 function primary(s){const c=resume(s)||next(s);return c?launch(s,c,resume(s)?'Continue my journey':count(s)?'Start the next journey':'Start my first journey'):'<button class="button" data-campaign="finale">See my festival</button>';}
 function home(s){
  const c=resume(s)||next(s), n=count(s), caseInfo=c?window.TryvoCaseData[c.id]:null;
  const featured=[chapters[0],chapters[3],chapters[6],chapters[9]];
  const atlasPath=chapters.map((x,i)=>`${i?'L':'M'}${x.x*10},${x.y*6.67}`).join(' ');
  return `<section class="campaign-home">
   <div class="fieldguide-intro">
    <div><div class="world-kicker"><span class="world-spark" aria-hidden="true">✳</span> A playground for your own thinking</div>
     <h1><span class="title-line"><span>Less autopilot.</span></span><span class="title-line"><span>More adventure.</span></span></h1></div>
    <div class="fieldguide-note"><p>Practise making your own decisions.<br>Investigate a client case, defend your call,<br class="desktop-break"> and see what it unlocks in the town.</p>${primary(s)}<a href="#demo">New to the map? Learn the controls <span aria-hidden="true">→</span></a></div>
   </div>
   <ol class="purpose-path" aria-label="How a journey works"><li><b>1</b><span><strong>Make your own call</strong><small>Read the case. Weigh the evidence.</small></span><i aria-hidden="true">→</i></li><li><b>2</b><span><strong>Connect the route</strong><small>Your decision opens a shortcut.</small></span><i aria-hidden="true">→</i></li><li><b>3</b><span><strong>Respond & reflect</strong><small>Meet a new twist. Review your choices.</small></span></li></ol>
   <div class="world-section-heading"><div><span class="world-label">YOUR WORLD</span><h2>The Lantern Festival</h2></div><span class="world-edition">An interactive story set in 2040 <span aria-hidden="true">↙</span></span></div>
   <div class="campaign-world">
    <div class="world-map-wrap" data-depth="map">
     <div class="atlas-toolbar"><span class="atlas-id"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 7V2h5m6 0h5v5m0 6v5h-5m-6 0H2v-5M10 5v10M5 10h10"/></svg> WORLD / 2040</span><div class="atlas-views" role="group" aria-label="Map style"><button type="button" data-atlas-view="scenery" aria-pressed="true">Scenery</button><button type="button" data-atlas-view="routes" aria-pressed="false">Routes</button></div><button type="button" class="motion-toggle" data-motion-toggle aria-label="Ambient motion" aria-pressed="false"><span aria-hidden="true">Ⅱ</span><span data-motion-label>Motion</span></button></div>
     <div class="campaign-map journey-map" role="group" aria-label="Twelve playable tram journeys">
      <img src="assets/festival-town.png" alt="An illustrated festival town among mountains, with tram stops, a river and glowing lanterns" width="1536" height="1024" fetchpriority="high">
      <div class="map-location"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg> Lantern Valley <small>12 places to make a difference</small></div>
      <svg class="atlas-network" viewBox="0 0 1000 667" preserveAspectRatio="none" aria-hidden="true"><path class="atlas-route" d="${atlasPath}"/><path class="atlas-flow" d="${atlasPath}" pathLength="100"/><path class="atlas-flow atlas-flow-late" d="${atlasPath}" pathLength="100"/></svg><span class="atlas-corner atlas-corner-tl" aria-hidden="true"></span><span class="atlas-corner atlas-corner-br" aria-hidden="true"></span>
      ${chapters.map((x,i)=>`<button class="campaign-pin ${done(s,x.id)?'complete':x.id===c?.id?'current':'later'}" style="left:${x.x}%;top:${x.y}%" data-campaign="play" data-chapter="${x.id}" data-atlas-place="${esc(x.place)}" data-atlas-skill="${esc(x.skill)}" aria-label="Level ${i+1}: ${esc(x.title)}. ${esc(x.skill)}. ${done(s,x.id)?'Completed, replay':'Start tram journey'}"><b>${done(s,x.id)?'✓':i+1}</b><span>${esc(x.place)}</span></button>`).join('')}
      <div class="campaign-map-caption"><span aria-hidden="true">↗</span><span data-atlas-readout>Pick a stop. Make it your story.</span></div>
     </div>
     <div class="map-bottom-strip"><div class="map-legend"><span><i class="ready"></i>Up next</span><span><i class="complete">✓</i>Completed</span><span><i class="later"></i>Ready to explore</span></div><span>All journeys open · No timer</span></div>
    </div>
    <aside class="campaign-dispatch">
     <div class="dispatch-topline"><span>${resume(s)?'PICK UP WHERE YOU LEFT OFF':c?'YOUR NEXT CHAPTER':'A TOWN CONNECTED'}</span><span aria-hidden="true">↗</span></div>
     <div class="dispatch-chapter-number" aria-hidden="true">${c?String(chapters.indexOf(c)+1).padStart(2,'0'):'12'}<span> / 12</span></div>
     <h2>${esc(c?.title||'Every connection counts.')}</h2>
     <p>${esc(caseInfo?.title||'You made it through every journey. There is always another way to see the story.')}</p>
     ${c?`<div class="chapter-skill"><span>${esc(c.skill)}</span><span>Route planning</span></div>`:''}
     <div class="dispatch-guide"><span class="mira-avatar">${window.TryvoArt.portrait()}</span><div><strong>${resume(s)?'Your work is saved':c?'Begin with the client case':'A note from Mira'}</strong><p>${resume(s)?'Continue your case or route from where you left off.':c?'Make your first judgment, explore the evidence, then recommend what to do.':'“Look at what your decisions made possible.”'}</p></div></div>
     ${primary(s)}<span class="dispatch-footnote">Your decisions move the story forward.</span>
    </aside>
   </div>
   <div class="journey-summary"><div class="summary-progress" aria-label="${n} of 12 journeys completed"><span class="progress-ring" style="--completion:${n/12*100}%"><b>${n}</b></span><div><strong>${n===0?'Your story is still unwritten.':n===12?'You connected the whole town.':'Your story is taking shape.'}</strong><span>${n} of 12 journeys complete. ${n===0?'A good place to begin.':'Every choice leaves a mark.'}</span></div></div><a href="#progress">Your field notes <span aria-hidden="true">↗</span></a></div>
   <section class="chapter-collection" aria-labelledby="collection-title"><div class="collection-heading"><div><span class="world-label">FOLLOW YOUR CURIOSITY</span><h2 id="collection-title">A different way to see things.</h2></div><a href="#all-journeys" data-browse-journeys>Browse all 12 journeys <span aria-hidden="true">↗</span></a></div>
    <div class="chapter-cards">${featured.map((x,i)=>`<button class="chapter-card chapter-card-${i}" data-depth="card" data-campaign="play" data-chapter="${x.id}"><span class="chapter-art"><img src="assets/festival-town.png" alt="" width="1536" height="1024" loading="lazy"><span class="chapter-art-number">${String(chapters.indexOf(x)+1).padStart(2,'0')}</span><span class="chapter-card-arrow" aria-hidden="true">↗</span></span><span class="chapter-card-content"><span class="chapter-card-skill">${esc(x.skill)}</span><strong>${esc(window.TryvoCaseData[x.id].title)}</strong><span class="chapter-card-footer">${esc(x.title)}<span>${done(s,x.id)?'✓ Complete':'Explore →'}</span></span></span></button>`).join('')}</div>
   </section>
   <details class="journey-index" id="all-journeys"><summary>All 12 journeys <span>Choose your own starting point</span></summary><ol>${chapters.map((x,i)=>`<li><span class="index-number">${String(i+1).padStart(2,'0')}</span><span>${esc(x.title)}<small>${esc(x.skill)}</small></span>${launch(s,x,done(s,x.id)?'Replay':'Play')}</li>`).join('')}</ol></details>
   <div class="new-player-invite"><div><span class="invite-symbol" aria-hidden="true">↝</span><div><strong>A small first step.</strong><span>Two guided lessons. A little practice. Then the town is yours.</span></div></div><a href="#demo">Try the guided demo <span aria-hidden="true">↗</span></a></div>
  </section>`;
 }
 function context(s,id){const c=chapter(id);return c?`<aside class="campaign-context"><a href="#explore">← All tram journeys</a><span>Level ${chapters.indexOf(c)+1} of 12 · ${esc(c.skill)}</span></aside>`:'';}
 function handoff(s,id){const n=next(s);return `<section class="campaign-handoff compact-handoff"><div>${n?launch(s,n,'Next journey: '+n.title):'<button class="button" data-campaign="finale">See your completed festival</button>'}<a href="#explore">All journeys</a></div></section>`;}
 function ledger(s){return `<ul class="journey-ledger">${chapters.filter(c=>done(s,c.id)).map(c=>`<li><strong>${esc(c.title)}</strong><span>${esc(effect(s,c.id))}</span></li>`).join('')}</ul>`;}
 function finale(s){return `<div class="festival-finale"><img src="assets/festival-town.png" alt="Your lantern festival town" width="1536" height="1024"><h3>${count(s)===12?'You connected the whole town.':'Your festival is taking shape.'}</h3><p>${count(s)} of 12 tram journeys complete. Every arrival required route planning, a repaired connection and a settled dispatch.</p>${ledger(s)}<p>These records show what you did in the game, not a measure of intelligence or general improvement.</p><a href="#progress" data-action="close">Open My progress</a></div>`;}
 return {chapters,chapter,record,done,count,next,available,destination,effect,status,routeLevel,launch,primary,summary:ledger,ledger,home,context,handoff,finale};
})();
