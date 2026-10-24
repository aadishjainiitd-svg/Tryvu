"""Server validation without paid provider requests or access to the real session store."""
import importlib.util, pathlib, tempfile, uuid
spec=importlib.util.spec_from_file_location('tryvo_server',pathlib.Path(__file__).parents[1]/'server.py')
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
def uid():return str(uuid.uuid4())
def expect_error(fn,status=400):
 try:fn();raise AssertionError('Expected an error')
 except s.Problem as e:assert e.status==status,(e.status,e.message)
with tempfile.TemporaryDirectory() as temp:
 s.PRIVATE=pathlib.Path(temp)
 calls=[]
 def provider(messages):
  calls.append(messages)
  return {'rubric':{k:{'score':2,'feedback':'Specific case reasoning.'} for k in s.RUBRIC},'summary':'A coherent decision.','consequence':'A conditional outcome.','nextQuestion':'What would change your mind?'}
 s.provider=provider
 body={'level':'first-light','kind':'obstacle','requestId':uid(),'initial':'Test a conversion hypothesis before changing room prices.'}
 session=s.api('/api/cases/start',body);assert s.api('/api/cases/start',body)['id']==session['id']
 expect_error(lambda:s.api('/api/cases/start',{**body,'initial':'A different initial judgment that still meets the minimum.'}),409)
 expect_error(lambda:s.api('/api/cases/review',{'sessionId':session['id'],'requestId':uid(),'decision':None}))
 decision={k:'Specific case reasoning with enough evidence to justify a test and an alternative. '*2 for k in ('recommendation','evidence','tradeoff','test')}
 req={'sessionId':session['id'],'requestId':uid(),'decision':decision}
 r=s.api('/api/cases/review',req);assert r['accepted'] and r['score']==8
 assert s.api('/api/cases/review',req)==r and len(calls)==1
 expect_error(lambda:s.api('/api/cases/review',{**req,'requestId':uid()}),409)
 weak=provider([]);weak['rubric']['evidence']['score']=0
 assert not s.validate_review(weak)['accepted'] # 6/8 cannot pass without evidence.
 weak['rubric']['evidence']['score']=True;expect_error(lambda:s.validate_review(weak),502)
 assert 'initial' in s.public(s.read_session(session['id']))
print('PASS session idempotency, duplicate-review prevention, locked completed decisions, validation and evidence requirement')
