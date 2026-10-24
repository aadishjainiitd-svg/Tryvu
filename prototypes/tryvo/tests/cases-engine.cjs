const assert=require('node:assert/strict'),E=require('../js/rescue-engine.js');
function receipt(l,kind){return {accepted:true,level:l.id,kind,receipt:l.id+'-'+kind,score:8,rubric:Object.fromEntries(['framing','evidence','tradeoffs','test'].map(k=>[k,{score:2}]))};}
for(const l of E.levels){
 const s=E.fresh(),d=E.draft(l);s.selected=l.id;s.drafts[l.id]=d;
 d.obstacle.solved=true;d.obstacle.case={review:receipt(l,'obstacle')};
 assert(E.obstacleOK(l,d.obstacle));E.submit(s,l,d,'obstacle',{ok:true});
 for(const at of E.shortest(l).slice(1))E.edit(l,d,at);
 d.puzzle.solved=true;d.puzzle.case={review:receipt(l,'arrival'),routeKey:JSON.stringify([d.path,d.boarding])};
 E.submit(s,l,d,'arrival',{ok:true});const run=E.run(s,l,d);assert(run.success);assert(E.valid(s));
 const score=E.points(s);assert.equal(E.submit(s,l,d,'arrival',{ok:true}),0);assert.equal(E.points(s),score);
 const original=JSON.parse(JSON.stringify(d));d.puzzle.case.routeKey='different-route';assert.equal(E.evaluate(l,d.path,d.puzzle,d).reason,'checkpoint');
 d.puzzle=original.puzzle;d.obstacle.case.review.level='wrong-level';assert(!E.obstacleOK(l,d.obstacle));
 d.obstacle=original.obstacle;d.obstacle.case.review.rubric.evidence.score=0;assert(!E.obstacleOK(l,d.obstacle));
}
console.log('PASS all 12 AI-reviewed routes, persisted history, single awards, route-bound arrival review and rubric validation');
