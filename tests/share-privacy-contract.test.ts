import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const service = fs.readFileSync(new URL('../services/shareable-links.ts', import.meta.url), 'utf8');
const routes = fs.readFileSync(new URL('../routes.ts', import.meta.url), 'utf8');

test('share links default to least-privilege disclosure', () => {
  assert.match(service, /includeFullProfile:\s*false/);
  assert.match(service, /includePersonalInfo:\s*false/);
  assert.match(service, /includeSections:\s*\['archetype'\]/);
});

test('anonymous sharing does not reveal account or profile name', () => {
  assert.match(
    service,
    /const sharedBy = link\.settings\.includePersonalInfo[\s\S]*: 'Anonymous'/,
  );
});

test('share-link update and delete enforce authenticated ownership', () => {
  const putStart = routes.indexOf('app.put("/api/share/links/:id"');
  const deleteStart = routes.indexOf('app.delete("/api/share/links/:id"');
  const transitStart = routes.indexOf('// Transit Notifications Endpoints', deleteStart);
  assert.ok(putStart >= 0 && deleteStart > putStart && transitStart > deleteStart);

  const updateRoute = routes.slice(putStart, deleteStart);
  const deleteRoute = routes.slice(deleteStart, transitStart);

  assert.match(updateRoute, /existingLink\.userId !== userId/);
  assert.match(deleteRoute, /existingLink\.userId !== userId/);
});
