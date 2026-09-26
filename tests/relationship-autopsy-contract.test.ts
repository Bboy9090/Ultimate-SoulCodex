import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateRelationshipAutopsy } from '../services/relationship-autopsy';

test('relationship autopsy fails closed before generation when behavioral signals are incomplete', async () => {
  const result = await generateRelationshipAutopsy(
    {
      name: 'Person A',
      signals: {
        pressureStyle: 'pushes harder under pressure',
        socialEnergy: '',
        decisionStyle: 'fast',
      },
    } as any,
    {
      name: 'Person B',
      signals: {
        pressureStyle: 'withdraws',
        socialEnergy: 'reserved',
        decisionStyle: 'deliberate',
      },
    } as any,
  );

  assert.equal(result.available, false);
  assert.equal(result.reason, 'behavioral_signals_incomplete');
  assert.ok(result.missing.includes('Person A.socialEnergy'));
  assert.equal(result.tension, null);
  assert.deepEqual(result.frictionPoints, []);
  assert.equal(result.autopsy, null);
});

test('legacy autopsy route retains shared ownership checks for both profiles', () => {
  const source = fs.readFileSync(new URL('../routes.ts', import.meta.url), 'utf8');
  const routeStart = source.indexOf('app.post("/api/compatibility/autopsy"');
  const routeEnd = source.indexOf('app.get("/api/compatibility/:profile1Id/:profile2Id"', routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart);

  const route = source.slice(routeStart, routeEnd);
  assert.match(route, /profileBelongsToActor\(p1, actor\)/);
  assert.match(route, /profileBelongsToActor\(p2, actor\)/);
});
