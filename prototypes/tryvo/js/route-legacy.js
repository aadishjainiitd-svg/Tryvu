/* Original, deterministic route puzzles. No network, grading model or random outcomes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TryvoLegacyRoutes=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const J=typeof module==='object'&&module.exports?require('./journey-data.js'):globalThis.TryvoJourney;
 const originalLevels=[
  {id:'first-light',name:'First light',chapter:'The first arrivals',cols:6,rows:5,start:12,end:17,budget:9,stops:[{at:8,name:'Lantern makers',people:6}],blocked:[14,15,26],repairs:{9:2,16:2},gate:null,switch:null,
   brief:'Pick up the lantern makers and bring them to the festival. You have 9 repair tokens.',hint:'The direct street is blocked. Look for a route above it that also reaches the lantern makers.',intro:'The lanterns are ready. Their makers are still across town.',reply:'That’s our first tram! The lantern makers can finally light the square.'},
  {id:'all-aboard',name:'All aboard',chapter:'Nobody left behind',cols:7,rows:6,start:28,end:13,budget:18,stops:[{at:8,name:'Musicians',people:5},{at:33,name:'Food vendors',people:4}],blocked:[3,10,17,24,38],repairs:{23:2,31:3,32:2},gate:null,switch:null,
   brief:'Collect both groups before reaching the square. Plan around closed streets and expensive repairs.',hint:'Visit the musicians on the left first. The crossing near the lower half of the map can connect both groups.',intro:'The band has the music. The vendors have dinner. We need both.',reply:'Music and dinner, on the same tram. You connected the two sides of the festival.'},
  {id:'across-the-river',name:'Across the river',chapter:'One last connection',cols:7,rows:7,start:35,end:13,budget:20,stops:[{at:8,name:'Performers',people:4},{at:40,name:'Night market crew',people:6}],blocked:[3,10,17,31,38,45],repairs:{24:2},gate:24,switch:22,
   brief:'Pass the signal hut before the bridge. Pick up both groups and stay within 20 tokens.',hint:'The signal hut is left of the bridge. Your route must reach it before crossing, while still collecting the performers above.',intro:'The bridge is shut. A signal from the hut will open it for your tram.',reply:'You opened the crossing and brought everyone home. Tonight, this city has your fingerprints on it.'}
 ];
 const levels=J.expand(originalLevels);
 function level(id){return levels.find(l=>l.id===id);}
 function adjacent(l,a,b){return Math.abs(a%l.cols-b%l.cols)+Math.abs(Math.floor(a/l.cols)-Math.floor(b/l.cols))===1;}
 function cellCost(l,id){return id===l.start?0:l.repairs[id]||1;}
 function cost(l,path){return path.reduce((n,id)=>n+cellCost(l,id),0);}
 function validatePath(l,path){return Array.isArray(path)&&path.length>0&&path.length<=l.cols*l.rows&&path[0]===l.start&&new Set(path).size===path.length&&path.every((id,i)=>Number.isInteger(id)&&id>=0&&id<l.cols*l.rows&&!l.blocked.includes(id)&&(!i||adjacent(l,path[i-1],id)))&&path.slice(0,-1).every(id=>id!==l.end);}
 function evaluate(l,path,puzzle){
  if(!validatePath(l,path))throw Error('This route is invalid. Start at the depot and connect neighbouring streets.');
  let spent=0,signal=false;const collected=[];
  for(let i=0;i<path.length;i++){
   const at=path[i];spent+=cellCost(l,at);
   if(spent>l.budget)return {success:false,reason:'budget',stopIndex:Math.max(0,i-1),cost:cost(l,path),spent:spent-cellCost(l,at),collected,message:`The tram stopped before street ${Math.floor(at/l.cols)+1}, ${at%l.cols+1}: this route needs more than ${l.budget} repair tokens. Try a shorter route or avoid a costly repair.`};
   if(at===l.gate&&!signal)return {success:false,reason:'gate',stopIndex:Math.max(0,i-1),cost:cost(l,path),spent,collected,message:'The bridge is still closed. Route the tram through the signal hut before it reaches the bridge.'};
   if(puzzle!==undefined&&at===l.checkpoint&&!(puzzle?.solved&&J.grade(l.id,puzzle.answer).ok))return {success:false,reason:'checkpoint',stopIndex:i,cost:cost(l,path),spent,collected,message:'Checkpoint reached: '+l.puzzle.title+'. Resolve it before the tram continues.'};
   if(at===l.switch)signal=true;
   const stop=l.stops.find(s=>s.at===at);if(stop)collected.push(stop.at);
  }
  const missing=l.stops.filter(s=>!collected.includes(s.at));
  const reached=path.at(-1)===l.end;
  return {success:reached&&!missing.length,reason:!reached?'unfinished':missing.length?'pickup':'arrived',stopIndex:path.length-1,cost:spent,spent,collected,message:!reached?'The track ends here. Extend it to the festival gate.':missing.length?`You reached the festival, but ${missing.map(s=>s.name.toLowerCase()).join(' and ')} still need a pickup. Connect their stops before the gate.`:`Everyone arrived. Your route used ${spent} of ${l.budget} tokens.`};
 }
 function draft(l){return {path:[l.start],moves:0,hint:false,firstPlan:null,lastId:null,puzzle:{answer:{},tries:[],solved:false,hint:false}};}
 function fresh(){return {version:1,selected:levels[0].id,drafts:{},history:[]};}
 function valid(s){
  if(!s||s.version!==1||!level(s.selected)||!s.drafts||typeof s.drafts!=='object'||Array.isArray(s.drafts)||!Array.isArray(s.history)||s.history.length>2000)return false;
  for(const [id,d]of Object.entries(s.drafts)){const l=level(id);if(!l||!d||!validatePath(l,d.path)||!Number.isInteger(d.moves)||d.moves<0||typeof d.hint!=='boolean'||d.firstPlan!==null&&!validatePath(l,d.firstPlan)||d.lastId!==null&&typeof d.lastId!=='string')return false;}
  const ids=new Set();
  for(const r of s.history){const l=level(r.level);if(!l||typeof r.id!=='string'||ids.has(r.id)||!validatePath(l,r.path)||!validatePath(l,r.firstPlan)||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||typeof r.hint!=='boolean'||!Number.isInteger(r.moves)||r.moves<0)return false;ids.add(r.id);const actual=evaluate(l,r.path,r.journeyVersion===2?r.puzzle:undefined);if(r.success!==actual.success||r.cost!==actual.cost||r.reason!==actual.reason)return false;}
  return Object.entries(s.drafts).every(([id,d])=>!d.lastId||s.history.some(r=>r.id===d.lastId&&r.level===id&&JSON.stringify(r.path)===JSON.stringify(d.path)));
 }
 function completed(s,id){return s.history.some(r=>r.level===id&&r.success&&r.journeyVersion===2);}
 function unlocked(s,id){return !!level(id);}
 function best(s,id){return s.history.filter(r=>r.level===id&&r.success).sort((a,b)=>a.cost-b.cost||a.moves-b.moves)[0]||null;}
 function edit(l,d,id){
  if(!Number.isInteger(id)||id<0||id>=l.cols*l.rows)throw Error('Choose a street on the board.');
  const found=d.path.indexOf(id);
  if(found>=0){if(found===d.path.length-1)return false;d.path=d.path.slice(0,found+1);}
  else {if(l.blocked.includes(id))throw Error('That street is closed. Choose a neighbouring open street.');if(d.path.at(-1)===l.end)throw Error('Your route reaches the gate. Undo a section to change the approach.');if(!adjacent(l,d.path.at(-1),id))throw Error('Connect a street beside the glowing end of your route.');d.path.push(id);}
  d.moves++;d.lastId=null;return true;
 }
 function run(s,l,d){d.puzzle||={answer:{},tries:[],solved:false,hint:false};const result=evaluate(l,d.path,d.puzzle);if(d.lastId){const previous=s.history.find(r=>r.id===d.lastId);if(previous&&previous.journeyVersion===2&&JSON.stringify(previous.puzzle)===JSON.stringify(d.puzzle))return previous;}if(!d.firstPlan)d.firstPlan=[...d.path];const r={journeyVersion:2,puzzle:JSON.parse(JSON.stringify(d.puzzle)),id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),level:l.id,path:[...d.path],firstPlan:[...d.firstPlan],moves:d.moves,hint:d.hint,date:new Date().toISOString(),...result};s.history.push(r);if(s.history.length>2000){const removed=s.history.shift();for(const v of Object.values(s.drafts))if(v.lastId===removed.id)v.lastId=null;}d.lastId=r.id;return r;}
 return {levels,level,adjacent,cellCost,cost,validatePath,evaluate,draft,fresh,valid,completed,unlocked,best,edit,run};
});
