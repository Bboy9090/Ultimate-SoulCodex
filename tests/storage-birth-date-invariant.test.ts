import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MemStorage as PackageMemStorage } from '../packages/db/storage';

test('package MemStorage canonicalizes civil birth dates to UTC midnight', async () => {
  const storage = new PackageMemStorage();
  const profile = await storage.createProfile({
    name: 'Civil Date Test',
    birthDate: '1990-09-17',
  } as any);

  assert.equal(profile.birthDate instanceof Date, true);
  assert.equal(profile.birthDate.toISOString(), '1990-09-17T00:00:00.000Z');
});

test('package MemStorage rejects ambiguous timestamp strings for birth dates', async () => {
  const storage = new PackageMemStorage();

  await assert.rejects(
    () => storage.createProfile({
      name: 'Bad Civil Date',
      birthDate: '1990-09-17T11:11:00-04:00',
    } as any),
    /Birth date storage requires a real YYYY-MM-DD civil date/,
  );
});

test('active storage implementations normalize birthDate on create and update', () => {
  const root = readFileSync('storage.ts', 'utf8');
  const server = readFileSync('server/storage.ts', 'utf8');
  const pkg = readFileSync('packages/db/storage.ts', 'utf8');

  for (const source of [root, server, pkg]) {
    assert.match(source, /function canonicalBirthDateTimestamp/);
    assert.match(source, /T00:00:00\.000Z/);
    assert.match(source, /Birth date storage requires a real YYYY-MM-DD civil date/);
  }

  assert.match(root, /birthDate: canonicalBirthDateTimestamp\(structured\.birthDate\)/);
  assert.match(root, /k === "birthDate"[\s\S]*canonicalBirthDateTimestamp/);
  assert.match(server, /birthDate: canonicalBirthDateTimestamp\(\(insertProfile as any\)\.birthDate\)/);
  assert.match(server, /hasOwnProperty\.call\(updates, "birthDate"\)/);
});
