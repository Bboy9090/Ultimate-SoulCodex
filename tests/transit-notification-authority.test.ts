import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const serviceSource = readFileSync('services/transit-notifications.ts', 'utf8');
const packageSource = readFileSync('packages/astrology/transit-notifications.ts', 'utf8');

test('transit notification package delegates to one governed service authority', () => {
  assert.match(
    packageSource,
    /export \* from ['"]\.\.\/\.\.\/services\/transit-notifications['"]/,
  );
  assert.match(
    packageSource,
    /export \{ default \} from ['"]\.\.\/\.\.\/services\/transit-notifications['"]/,
  );
  assert.doesNotMatch(packageSource, /calculateActiveTransits|sendToUser|notificationDateKey/);
});

test('transit notification deduplication uses profile-local calendar day and aspect identity', () => {
  assert.match(serviceSource, /formatInTimeZone\(date, notificationTimezone\(profile\), 'yyyy-MM-dd'\)/);
  assert.match(
    serviceSource,
    /\$\{profile\.id\}-\$\{transit\.planet\}-\$\{transit\.natalPlanet\}-\$\{transit\.aspect\}-\$\{notificationDateKey\(profile, date\)\}/,
  );
  assert.doesNotMatch(
    serviceSource,
    /notificationId:[^\n]*toISOString\(\)\.split\('T'\)\[0\]/,
  );
});

test('upcoming transit notifications use bounded local civil-date iteration', () => {
  assert.match(serviceSource, /MAX_UPCOMING_NOTIFICATION_DAYS = 366/);
  assert.match(serviceSource, /Transit notification days must be 1-/);
  assert.match(serviceSource, /resolveCivilTimeStrict\(dateISO, '12:00', timezone\)/);
  assert.match(serviceSource, /formatInTimeZone\(new Date\(\), timezone, 'yyyy-MM-dd'\)/);
  assert.doesNotMatch(serviceSource, /checkDate\.setDate\(checkDate\.getDate\(\) \+ i\)/);
});

test('transit notification copy is reflective rather than predictive', () => {
  assert.match(serviceSource, /Transit Reflection/);
  assert.match(serviceSource, /reflection prompt, not a prediction/i);
  assert.doesNotMatch(serviceSource, /Spiritual Awakening|Mastery Challenge|Expansion Opportunity/);
});
