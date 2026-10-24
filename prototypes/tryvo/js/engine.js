(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TryvoEngine=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const fresh=()=>({version:1,seen:{},awards:{},history:[],active:null,survey:null,surveys:{},surveyDrafts:{}});
  function begin(state,task,mode='solo'){
    if(!task||!Array.isArray(task.options))throw Error('This mission is unavailable.');
    if(!['solo','coop','duel'].includes(mode)||(mode==='coop'&&!task.cooperative)||(mode==='duel'&&!task.duel))throw Error('This play mode is unavailable.');
    const replay=!!state.seen[task.id]; state.seen[task.id]=(state.seen[task.id]||0)+1;
    state.active={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),taskId:task.id,mode,replay,phase:task.type==='check'?'check':'initial',turn:0,initials:[],viewed:[[],[]],pinned:[[],[]],hint:false,external:false,answer:'',next:'',note:'',confidence:'',evidence:task.evidence[0].id,contentVersion:task.contentVersion||1,reasoning:{},plan:{}};
    return state.active;
  }
  function commitInitial(a,task,answer,confidence,note=''){
    if(a.phase!=='initial'||!task.options.some(x=>x.id===answer)||!['low','medium','high'].includes(confidence))throw Error('Choose an explanation and your confidence before continuing.');
    a.initials[a.turn]={answer,confidence,note:String(note).slice(0,600)};
    if(a.mode==='coop'&&a.turn===0){a.phase='handoff-initial';}else{a.turn=0;a.phase='investigate';a.evidence=task.evidence.find(x=>a.mode!=='coop'||x.group===0).id;}
  }
  function allowed(a,e){return a.mode!=='coop'||a.phase==='decision'||e.group===a.turn;}
  function view(a,task,id){const e=task.evidence.find(x=>x.id===id);if(!['investigate','decision','check'].includes(a.phase)||!e||!allowed(a,e))throw Error('That evidence is not available in this turn.');a.evidence=id;if(!a.viewed[a.turn].includes(id))a.viewed[a.turn].push(id);}
  function pin(a,task,id){view(a,task,id);const p=a.pinned[a.turn];if(p.includes(id))p.splice(p.indexOf(id),1);else p.push(id);}
  function grade(task,answer,next,pins,response={}){
    const choice=task.options.find(x=>x.id===answer),step=task.nextOptions.find(x=>x.id===next);
    if(!choice||!step||!pins.length||pins.some(id=>!task.evidence.some(e=>e.id===id)))throw Error('Choose your explanation, supporting evidence and next step.');
    let evidence=0,nextPoints=step.points,linkResults=[],planResult=null;
    if(task.links){
      linkResults=task.links.map(link=>{
        const selected=response.reasoning?.[link.id];
        if(!selected||!pins.includes(selected.source)||!link.options.some(o=>o.id===selected.meaning))throw Error('Complete each evidence connection using a source you selected.');
        if(response.mode==='coop'&&(selected.by!==link.owner||!response.pinned?.[link.owner]?.includes(selected.source)))throw Error('Each investigator must record their own evidence connection before the shared decision.');
        const sourceOK=link.sources.includes(selected.source),meaningOK=selected.meaning===link.correct;
        return {id:link.id,source:selected.source,meaning:selected.meaning,sourceOK,meaningOK,points:sourceOK&&meaningOK?20:0,by:response.mode==='coop'?link.owner:0};
      });
      evidence=linkResults.reduce((n,r)=>n+r.points,0);
      if(task.plan){
        const factor=task.plan.factors.find(f=>f.id===response.plan?.factor),groups=task.plan.groups.find(g=>g.id===response.plan?.groups);
        if(!factor||!groups)throw Error('Choose what changes and how you form the comparison groups.');
        nextPoints=(factor.id!=='bundle'?10:0)+(groups.id==='random'?10:0);
        planResult={factor:factor.id,groups:groups.id,separates:factor.id!=='bundle',randomised:groups.id==='random',points:nextPoints};
      }
    }else{
      const key=task.evidence.filter(e=>e.key);evidence=Math.round(40*key.filter(e=>pins.includes(e.id)).length/key.length);
    }
    return {score:choice.points+nextPoints+evidence,parts:{explanation:choice.points,evidence,next:nextPoints},answer,next,pins:[...new Set(pins)],...(task.links?{linkResults,planResult}:{})};
  }
  function finish(state,task,answer,next,note='',external=false){
    const a=state.active;if(!a||a.taskId!==task.id)throw Error('This attempt is unavailable.');
    const old=state.history.find(r=>r.id===a.id);if(old)return old;
    if(!['decision','check'].includes(a.phase))throw Error('Complete the investigation first.');
    const pins=a.mode==='coop'?[...new Set(a.pinned.flat())]:a.pinned[0];const result=grade(task,answer,next,pins,a);
    a.external=a.external||external;a.answer=answer;a.next=next;a.note=String(note).slice(0,600);a.phase='result';
    const eligible=!a.hint&&!a.replay&&!a.external&&a.mode!=='coop'&&!Object.prototype.hasOwnProperty.call(state.awards,task.id);
    const record={...JSON.parse(JSON.stringify(a)),...result,date:new Date().toISOString(),eligible,points:eligible?result.score:0};
    if(eligible)state.awards[task.id]=result.score;
    state.history.push(record);return record;
  }
  const total=s=>Object.values(s.awards).reduce((sum,n)=>sum+n,0);
  function valid(s,tasks,legacyTasks=tasks){
    const ids=new Set(tasks.map(t=>t.id));const plain=o=>o&&typeof o==='object'&&!Array.isArray(o);
    if(!plain(s)||s.version!==1||!plain(s.seen)||!plain(s.awards)||!Array.isArray(s.history))return false;
    if(Object.entries(s.seen).some(([k,v])=>!ids.has(k)||!Number.isInteger(v)||v<1))return false;
    if(Object.entries(s.awards).some(([k,v])=>!ids.has(k)||!Number.isInteger(v)||v<0||v>100))return false;
    const recordIds=new Set();
    const validPairs=(value,t)=>Array.isArray(value)&&value.length===2&&value.every(p=>Array.isArray(p)&&p.every(id=>t.evidence.some(e=>e.id===id)));
    const validInitials=(value,t)=>Array.isArray(value)&&value.every(i=>i&&t.options.some(o=>o.id===i.answer)&&['low','medium','high'].includes(i.confidence)&&typeof i.note==='string');
    const validMode=(a,t)=>['solo','coop','duel'].includes(a.mode)&&(a.mode!=='coop'||t.cooperative)&&(a.mode!=='duel'||t.duel);
    for(const r of s.history){if(!plain(r)||typeof r.id!=='string'||recordIds.has(r.id)||!ids.has(r.taskId)||!Number.isInteger(r.score)||r.score<0||r.score>100||!Array.isArray(r.pins)||typeof r.eligible!=='boolean'||!Number.isFinite(r.points)||typeof r.note!=='string'||typeof r.date!=='string'||typeof r.hint!=='boolean'||typeof r.replay!=='boolean'||typeof r.external!=='boolean')return false;recordIds.add(r.id);const t=(r.contentVersion===2?tasks:legacyTasks).find(t=>t.id===r.taskId);if(!t||r.contentVersion&&!([1,2].includes(r.contentVersion)))return false;if(!validMode(r,t)||!validPairs(r.pinned,t)||!validPairs(r.viewed,t)||!validInitials(r.initials,t)||t.type!=='check'&&r.initials.length!==(r.mode==='coop'?2:1))return false;try{const g=grade(t,r.answer,r.next,r.pins,r);if(t.links&&(JSON.stringify(g.linkResults)!==JSON.stringify(r.linkResults)||JSON.stringify(g.planResult)!==JSON.stringify(r.planResult)))return false;if(g.score!==r.score||!plain(r.parts)||Object.keys(g.parts).some(k=>g.parts[k]!==r.parts[k]))return false;}catch{return false;}if(r.points!==(r.eligible?r.score:0)||r.eligible&&(r.hint||r.replay||r.external||r.mode==='coop'))return false;}
    for(const [id,points]of Object.entries(s.awards)){const rs=s.history.filter(r=>r.taskId===id&&r.eligible);if(rs.length!==1||rs[0].score!==points)return false;}
    if(s.history.some(r=>r.eligible&&s.awards[r.taskId]!==r.score))return false;
    if(s.active){const a=s.active,t=(a.contentVersion===2?tasks:legacyTasks).find(t=>t.id===a.taskId);if(!t||typeof a.id!=='string'||!s.seen[a.taskId]||!['initial','handoff-initial','investigate','handoff-evidence','decision','result','check'].includes(a.phase)||!validMode(a,t)||!validPairs(a.viewed,t)||!validPairs(a.pinned,t)||!validInitials(a.initials,t)||![0,1].includes(a.turn)||typeof a.hint!=='boolean'||typeof a.replay!=='boolean'||typeof a.external!=='boolean'||typeof a.note!=='string')return false;if(a.contentVersion&&!([1,2].includes(a.contentVersion)))return false;if(t.links&&(!plain(a.reasoning)||!plain(a.plan)||Object.entries(a.reasoning).some(([id,v])=>{const l=t.links.find(l=>l.id===id);return !l||!plain(v)||typeof v.source!=='string'||v.source&&!t.evidence.some(e=>e.id===v.source)||typeof v.meaning!=='string'||v.meaning&&!l.options.some(o=>o.id===v.meaning)||![0,1].includes(v.by);})))return false;if(a.phase==='result'&&!s.history.some(r=>r.id===a.id))return false;if(['investigate','handoff-evidence','decision'].includes(a.phase)&&a.initials.length!==(a.mode==='coop'?2:1))return false;if(a.phase.startsWith('handoff')&&a.mode!=='coop')return false;if(a.phase==='check'&&t.type!=='check')return false;}
    for(const field of ['surveys','surveyDrafts'])if(s[field]!==undefined&&(!plain(s[field])||Object.entries(s[field]).some(([id,v])=>!recordIds.has(id)||!plain(v)||['earned','enjoyment'].some(k=>v[k]!==null&&v[k]!==undefined&&!['1','2','3','4','5'].includes(v[k])))))return false;
    return true;
  }
  return {fresh,begin,commitInitial,view,pin,grade,finish,total,valid};
});
