'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync(path.resolve(__dirname, '../.github/workflows/deploy.yml'), 'utf8');

test('Pages deployments share a concurrency group without interrupting the active deployment', () => {
  assert.match(workflow, /^concurrency:\n  group: pages\n(?:  #[^\n]*\n)*  cancel-in-progress: false$/m);
});

test('Pages deployment waits for validation and is restricted to main', () => {
  assert.match(workflow, /npm run check\n\s+node --test tests\/deploy\.test\.js/);
  assert.doesNotMatch(workflow, /npm run build/, 'Deploy the committed pre-rendered page without regenerating it');
  assert.match(workflow, /deploy:\n\s+if: github\.ref == 'refs\/heads\/main'\n\s+needs: build/);
  assert.match(workflow, /permissions:\n\s+pages: write\n\s+id-token: write/);
  assert.match(workflow, /environment:\n\s+name: github-pages/);
});

test('Pages artifact contains only public site files, not the repository', () => {
  assert.match(workflow, /cp index\.html "\$RUNNER_TEMP\/site\/"/);
  assert.match(workflow, /cp -R css js assets "\$RUNNER_TEMP\/site\/"/);
  assert.match(workflow, /uses: actions\/upload-pages-artifact@[^\n]+\n\s+with:\n\s+path: \$\{\{ runner\.temp \}\}\/site/);
});
