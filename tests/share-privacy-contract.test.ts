import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createShareableLink, getShareableProfile, updateShareableLink } from '../services/shareable-links';

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


function shareStorageFixture(includePersonalInfo: boolean) {
  const settings = {
    includeFullProfile: true,
    includeSections: ['astrology', 'archetype'],
    includePersonalInfo,
    includeCompatibility: false,
    includeTransits: false,
    includeJournal: false,
    passwordProtected: false,
    passwordHash: '$argon2id$private-hash-material',
    allowComments: false,
  };

  const profile = {
    id: 'profile-1',
    userId: 'user-secret',
    sessionId: 'session-secret',
    name: 'Private Person',
    birthDate: '1990-09-17',
    birthTime: '11:11',
    birthLocation: 'Bronx, New York',
    timezone: 'America/New_York',
    latitude: '40.8448',
    longitude: '-73.8648',
    astrologyData: {
      sunSign: 'Virgo',
      evidence: {
        inputTimestamp: '1990-09-17T15:11:00.000Z',
        latitude: 40.8448,
        longitude: -73.8648,
        timezone: 'America/New_York',
        birthDate: '1990-09-17',
        birthLocation: 'Bronx, New York',
        safeMethod: 'verified',
      },
    },
    humanDesignData: {
      type: 'Reflector',
      verification: {
        inputTimestampUtc: '1990-09-17T15:11:00.000Z',
        input_timestamp: '1990-09-17T15:11:00.000Z',
        birth_time: '11:11',
        birth_coordinates: '40.8448,-73.8648',
        latitude: 40.8448,
        longitude: -73.8648,
        safeReceiptId: 'receipt-safe',
      },
    },
    biography: 'Private Person was born on 1990-09-17 in Bronx, New York at 11:11 America/New_York.',
    dailyGuidance: 'Private Person can use this reflective guidance today.',
    archetypeData: { title: 'Verified Archetype' },
    soulCodexData: {
      birthDate: '1990-09-17',
      birthTime: '11:11',
      timezone: 'America/New_York',
      nested: {
        inputTimestamp: '1990-09-17T15:11:00.000Z',
        safe: 'keep-me',
      },
    },
  };

  const link = {
    id: 'share-1',
    profileId: profile.id,
    userId: 'user-secret',
    token: 'token',
    url: 'https://example.test/share/token',
    settings,
    createdAt: new Date('2026-09-26T00:00:00.000Z'),
    accessCount: 0,
    isActive: true,
  };

  const storage = {
    getShareableLinkByToken: async () => link,
    getProfile: async () => profile,
    getUser: async () => ({ id: 'user-secret', name: 'Account Owner' }),
    updateShareableLink: async () => undefined,
  };

  return { storage, settings, link };
}

test('anonymous full-profile sharing recursively strips nested birth evidence', async () => {
  const { storage } = shareStorageFixture(false);
  const result = await getShareableProfile(storage as any, 'token');

  assert.ok(result);
  assert.equal(result?.sharedBy, 'Anonymous');
  const serialized = JSON.stringify(result?.profile);

  for (const forbidden of [
    'user-secret',
    'session-secret',
    '11:11',
    'America/New_York',
    '40.8448',
    '-73.8648',
    '1990-09-17T15:11:00.000Z',
    '1990-09-17',
    'Bronx, New York',
    'Private Person',
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }

  assert.match(serialized, /Virgo/);
  assert.match(serialized, /receipt-safe/);
  assert.match(serialized, /keep-me/);
});

test('explicit personal sharing may expose date/location but never exact birth geometry', async () => {
  const { storage } = shareStorageFixture(true);
  const result = await getShareableProfile(storage as any, 'token');

  assert.ok(result);
  assert.equal(result?.sharedBy, 'Account Owner');
  assert.equal(result?.profile.birthDate, '1990-09-17');
  assert.equal(result?.profile.birthLocation, 'Bronx, New York');

  const serialized = JSON.stringify(result?.profile);
  for (const forbidden of [
    '11:11',
    'America/New_York',
    '40.8448',
    '-73.8648',
    '1990-09-17T15:11:00.000Z',
    'user-secret',
    'session-secret',
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});


test('alternate sensitive key spellings are stripped recursively', async () => {
  const { storage } = shareStorageFixture(false);
  const result = await getShareableProfile(storage as any, 'token');

  assert.ok(result);
  const serialized = JSON.stringify(result?.profile);
  for (const forbiddenKey of [
    'input_timestamp',
    'inputTimestampUtc',
    'birth_time',
    'birth_coordinates',
    'timezone',
    'latitude',
    'longitude',
  ]) {
    assert.equal(serialized.includes(forbiddenKey), false, forbiddenKey);
  }
  assert.match(serialized, /Shared Profile/);
  assert.doesNotMatch(serialized, /Private Person/);
});


test('public share responses never expose password hashes', async () => {
  const { storage } = shareStorageFixture(false);
  const result = await getShareableProfile(storage as any, 'token');

  assert.ok(result);
  assert.equal(result?.settings.passwordHash, undefined);
  assert.doesNotMatch(JSON.stringify(result), /private-hash-material/);
});


test('protected share creation rejects plaintext or missing hashes', async () => {
  let writes = 0;
  const storage = {
    createShareableLink: async () => { writes += 1; },
  };

  await assert.rejects(
    () =>
      createShareableLink(
        storage as any,
        'profile-1',
        'user-1',
        { passwordProtected: true, passwordHash: 'plain-text-secret' },
      ),
    /Argon2 password hash/,
  );

  await assert.rejects(
    () =>
      createShareableLink(
        storage as any,
        'profile-1',
        'user-1',
        { passwordProtected: true },
      ),
    /Argon2 password hash/,
  );

  assert.equal(writes, 0);
});

test('unprotected share creation drops stray password hashes before persistence', async () => {
  let persisted: any = null;
  const storage = {
    createShareableLink: async (link: any) => { persisted = link; },
  };

  const created = await createShareableLink(
    storage as any,
    'profile-1',
    'user-1',
    {
      passwordProtected: false,
      passwordHash: '$argon2id$should-not-be-kept',
    },
  );

  assert.equal(created.settings.passwordHash, undefined);
  assert.equal(persisted?.settings?.passwordHash, undefined);
});

test('malformed protected share records fail closed before profile disclosure', async () => {
  const { storage, link } = shareStorageFixture(false);
  link.settings.passwordProtected = true;
  link.settings.passwordHash = 'not-an-argon2-hash';

  const result = await getShareableProfile(storage as any, 'token', 'secret');
  assert.equal(result, null);
});

test('share updates cannot enable password protection without an Argon2 hash', async () => {
  const existing = {
    id: 'share-1',
    profileId: 'profile-1',
    userId: 'user-1',
    token: 'token',
    url: 'https://example.test/share/token',
    settings: {
      includeFullProfile: false,
      includeSections: ['archetype'],
      includePersonalInfo: false,
      includeCompatibility: false,
      includeTransits: false,
      includeJournal: false,
      passwordProtected: false,
      allowComments: false,
    },
    createdAt: new Date(),
    accessCount: 0,
    isActive: true,
  };

  let writes = 0;
  const storage = {
    getShareableLink: async () => existing,
    updateShareableLink: async () => { writes += 1; },
  };

  await assert.rejects(
    () =>
      updateShareableLink(
        storage as any,
        existing.id,
        { passwordProtected: true, passwordHash: 'plaintext' },
      ),
    /Argon2 password hash/,
  );
  assert.equal(writes, 0);
});
