const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/api-config.js'), 'utf8');
for (const [hostname, override, expected] of [
  ['tryvu-tryvo.vercel.app', undefined, 'https://tryvu-5.onrender.com'],
  ['tryvu-preview.vercel.app', undefined, 'https://tryvu-5.onrender.com'],
  ['localhost', undefined, ''],
  ['127.0.0.1', undefined, ''],
  ['tryvu-tryvo.vercel.app', 'https://another.example/', 'https://another.example'],
]) {
  const window = { location: { hostname }, TRYVO_API_URL: override };
  vm.runInNewContext(source, { window });
  for (const endpoint of ['/api/cases/start', '/api/cases/chat', '/api/cases/review', '/api/cases/resume', '/api/practice-report']) {
    assert.equal(window.TryvoApiUrl(endpoint), expected + endpoint);
  }
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const file of ['case-workbench.js', 'mindscore.js']) {
  assert.ok(html.indexOf('js/api-config.js') < html.indexOf('js/' + file));
  assert.ok(fs.readFileSync(path.join(root, 'js', file), 'utf8').includes('fetch(window.TryvoApiUrl('));
}
console.log('PASS hosted and local API routing, URL overrides and script loading order');
