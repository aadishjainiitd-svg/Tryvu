"""Exercise browser preflights and API requests without paid AI or real data."""
import http.client
import importlib.util
import json
import os
import pathlib
import sys
import tempfile
import threading
import uuid
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('tryvo_http_test', pathlib.Path(__file__).parents[1] / 'server.py')
s = importlib.util.module_from_spec(spec)
sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))
sys.modules[spec.name] = s
spec.loader.exec_module(s)
origin = 'https://tryvu-tryvo.vercel.app'

with tempfile.TemporaryDirectory() as temp, patch.dict(os.environ, {'TRYVO_ALLOWED_ORIGINS': '*'}):
    s.PRIVATE = pathlib.Path(temp)
    server = s.ThreadingHTTPServer(('127.0.0.1', 0), s.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    def request(method, path, body=None, **extra):
        conn = http.client.HTTPConnection('127.0.0.1', server.server_port, timeout=5)
        headers = {'Host': 'tryvu-5.onrender.com', 'Origin': origin, **extra}
        conn.request(method, path, body=body, headers=headers)
        response = conn.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        conn.close()
        return result

    try:
        for path in ('/api/cases/start', '/api/practice-report'):
            status, headers, body = request('OPTIONS', path, **{
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'content-type,x-tryvo-client',
            })
            assert status == 204 and not body
            assert headers['Access-Control-Allow-Origin'] == '*'
            assert 'POST' in headers['Access-Control-Allow-Methods']
            assert 'x-tryvo-client' in headers['Access-Control-Allow-Headers'].lower()

        status, headers, body = request('GET', '/api/health')
        assert status == 200 and json.loads(body)['provider'] == 'Groq'
        assert headers['Access-Control-Allow-Origin'] == '*'
        api_headers = {'Content-Type': 'application/json', 'X-Tryvo-Client': 'case-workbench'}
        payload = json.dumps({'level': 'first-light', 'kind': 'obstacle', 'requestId': str(uuid.uuid4()),
                              'initial': 'Investigate checkout friction before changing room prices.'})
        status, headers, body = request('POST', '/api/cases/start', payload, **api_headers)
        assert status == 200 and json.loads(body)['id']
        assert headers['Access-Control-Allow-Origin'] == '*'

        status, headers, body = request('POST', '/api/practice-report', '{}', **api_headers)
        assert status == 400 and 'error' in json.loads(body)
        assert headers['Access-Control-Allow-Origin'] == '*', 'Browser must be able to read API errors'
        assert request('POST', '/api/cases/start', payload, **{'Content-Type': 'application/json'})[0] == 403
        assert request('GET', '/api/health', Host='unrelated.example')[0] == 403
        assert request('GET', '/api/health', Host=f'localhost:{server.server_port}')[0] == 200
        assert request('GET', '/server.py')[0] == 404
        assert request('GET', '/.env.tryvo')[0] == 404

        with patch.dict(os.environ, {'TRYVO_ALLOWED_ORIGINS': origin}):
            status, headers, _ = request('OPTIONS', '/api/cases/start')
            assert status == 204 and headers['Access-Control-Allow-Origin'] == origin
            status, headers, _ = request('OPTIONS', '/api/cases/start', Origin='https://unrelated.example')
            assert status == 403 and 'Access-Control-Allow-Origin' not in headers
            assert request('POST', '/api/cases/start', payload, Origin='https://unrelated.example', **api_headers)[0] == 403
        with patch.dict(os.environ, {'RENDER_EXTERNAL_HOSTNAME': 'another-tryvo.onrender.com'}):
            assert request('GET', '/api/health', Host='another-tryvo.onrender.com')[0] == 200
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

print('PASS hosted/local API access, CORS preflight, readable errors, optional origin restrictions and private files')
