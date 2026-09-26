import test from 'node:test';
import assert from 'node:assert/strict';
import { MemStorage } from '../storage';

function profileInput(birthDate: unknown) {
  return {
    userId: null,
    sessionId: 'birth-date-storage-test',
    name: 'Birth Date Storage',
    birthDate,
    birthTime: null,
    birthLocation: 'Test',
    timezone: 'UTC',
    latitude: null,
    longitude: null,
    isPremium: false,
    astrologyData: null,
    numerologyData: null,
    personalityData: null,
    archetypeData: null,
    humanDesignData: null,
    vedicAstrologyData: null,
    geneKeysData: null,
    iChingData: null,
    chineseAstrologyData: null,
    kabbalahData: null,
    mayanAstrologyData: null,
    chakraData: null,
    sacredGeometryData: null,
    runesData: null,
    sabianSymbolsData: null,
    ayurvedaData: null,
    biorhythmsData: null,
    asteroidsData: null,
    arabicPartsData: null,
    fixedStarsData: null,
    purposeStatement: null,
    biography: null,
    dailyGuidance: null,
  } as any;
}

test('profile storage preserves canonical UTC-midnight birth dates exactly', async () => {
  const storage = new MemStorage();
  const profile = await storage.createProfile(
    profileInput(new Date('1990-09-17T00:00:00.000Z')),
  );

  assert.equal(profile.birthDate.toISOString(), '1990-09-17T00:00:00.000Z');
});

test('profile storage rejects Date objects that contain time-of-day ambiguity', async () => {
  const storage = new MemStorage();

  await assert.rejects(
    storage.createProfile(
      profileInput(new Date('1990-09-17T04:00:00.000Z')),
    ),
    /canonical UTC midnight/,
  );
});

test('profile storage accepts explicit date-only strings without calendar drift', async () => {
  const storage = new MemStorage();
  const profile = await storage.createProfile(
    profileInput('1990-09-17'),
  );

  assert.equal(profile.birthDate.toISOString(), '1990-09-17T00:00:00.000Z');
});
