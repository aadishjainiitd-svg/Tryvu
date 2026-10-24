import importlib.util, pathlib, tempfile, sys, uuid
root=pathlib.Path(__file__).parents[1];sys.path.insert(0,str(root))
spec=importlib.util.spec_from_file_location('tryvo_report_test',root/'server.py');s=importlib.util.module_from_spec(spec);sys.modules[spec.name]=s;spec.loader.exec_module(s)
with tempfile.TemporaryDirectory() as temp:
 s.PRIVATE=pathlib.Path(temp);calls=[]
 case=s.api('/api/cases/start',{'requestId':str(uuid.uuid4()),'level':'first-light','kind':'obstacle','initial':'Investigate checkout friction before spending on promotions.'})
 record=s.read_session(case['id']);record['lastReview']={'score':6,'rubric':{}};record['lastDecision']={'recommendation':'Test the payment flow.'};record['reviews']=1;s.persist(record)
 def provider(messages):
  calls.append(messages)
  return {'summary':'One case is limited evidence. You proposed a checkout test.', 'observations':[{'title':'A testable hypothesis','detail':'You focused on checkout.','recordIds':[case['id']]},{'title':'Limited evidence','detail':'Only one reviewed case is available.','recordIds':[case['id']]}], 'practicePlan':[{'title':'Attempt first','action':'Write a hypothesis on a new case before guidance.','check':'Record a first judgment and a falsifying observation.'} for _ in range(3)]}
 s.provider=provider
 request={'sessionIds':[case['id']],'game':{'mindScore':30,'gamePoints':30,'completedLevels':0,'independentChecks':0}}
 result=s.api('/api/practice-report',request);assert len(result['records'])==1 and result['game']['mindScore']==30
 assert s.api('/api/practice-report',request)==result and len(calls)==1
 assert 'cannot determine' in result['limits']
 try:s.api('/api/practice-report',{'sessionIds':[]});raise AssertionError('Empty report accepted')
 except s.Problem as e:assert e.status==400
 def bad(messages):
  r=provider(messages);r['observations'][0]['recordIds']=['fabricated'];return r
 s.provider=bad
 try:s.api('/api/practice-report',{**request,'game':{**request['game'],'mindScore':31}});raise AssertionError('Invented citation accepted')
 except s.Problem as e:assert e.status==502
 assert not s.BUSY
print('PASS reports use saved sessions, cache unchanged evidence, preserve scores and reject fabricated citations')
