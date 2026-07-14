/**
 * Golden Regression Fixtures
 *
 * Canonical test datasets with deterministic outputs.
 * These act as regression tests: if outputs change, something broke.
 * Regression testing validates consistent behavior, not historical accuracy.
 */

import type { GoldenFixture } from './types.js';
import type { FixtureProvenance } from './provenance.js';

// Provenance metadata for all fixtures
const fixture001Provenance: FixtureProvenance = {
  source: {
    provider: 'Astrodatabank',
    reference: null,
    rating: null,
    accessedAt: null,
    notes: [
      'Birth data sourced from Astrodatabank but access record not preserved',
      'Exact reference URL or ID not recorded and cannot be verified',
    ],
  },
  birthplace: {
    city: 'Ulm',
    region: 'Württemberg',
    country: 'Germany',
    latitude: 48.4008,
    longitude: 9.9878,
  },
  timeHandling: {
    recordedLocalTime: '11:30',
    utcOffset: null,
    timezoneMethod: 'unknown',
    timezoneIdentifier: null,
    uncertaintyMinutes: null,
    notes: [
      'Birth time recorded as 11:30 local time in Ulm',
      'Germany adopted standard time (Mitteleuropäische Zeit) in 1893',
      'Birth occurred under pre-standard time regime',
      'Local mean time conversion is a reconstruction hypothesis without independent audit',
      'UTC offset calculation from geographic coordinates is unverified',
      'Source does not explicitly report uncertainty in birth time',
    ],
  },
  calculation: {
    astrologyProvider: null,
    astrologyProviderVersion: null,
    ephemeris: null,
    ephemerisVersion: null,
    zodiac: null,
    coordinateMode: null,
    epochOrFrame: null,

    humanDesignProvider: null,
    humanDesignProviderVersion: null,
    humanDesignMethod: null,

    numerologyConvention: null,
  },
  expectedCoordinates: {
    sunLongitudeDegrees: null,
    moonLongitudeDegrees: null,
    ascendantLongitudeDegrees: null,
  },
  tolerances: {
    sunLongitudeDegrees: null,
    moonLongitudeDegrees: null,
    ascendantLongitudeDegrees: null,
  },
  verification: {
    status: 'partially-verified',
    verifiedAt: null,
    verifiedBy: null,
    comparedAgainst: [],
    limitations: [
      'Birth date and time are documented but source access is not recorded',
      'Historical UTC offset conversion from local mean time has not been independently audited',
      'Astrodatabank birth record provides date/time/location data only; it does not verify astronomical calculations',
      'Expected astrology outputs remain unverified against any astronomy provider',
      'Expected Human Design outputs remain unverified',
      'Numerology reduction method is not documented in provenance; no external convention comparison exists',
    ],
  },
};

export const GOLDEN_FIXTURES: GoldenFixture[] = [
  {
    id: 'fixture-001',
    name: 'Albert Einstein',
    birthDate: '1879-03-14',
    birthTime: '11:30',
    timeVerified: 'exact',
    source: 'Astrodatabank (reference not recorded)',
    notes: 'Birth time is recorded in historical sources; UTC conversion is unaudited',
    expected: {
      personalNumbers: {
        day: 5, // 1+4 = 5
        month: 3, // 3 (single digit)
        year: 7, // 1+8+7+9=25 -> 2+5=7
      },
      astrology: {
        sunSign: 'Pisces',
        moonSign: 'Scorpio',
        risingSign: 'Capricorn',
      },
      humanDesign: {
        type: 'Manifestor',
        strategy: 'To Inform',
        authority: 'Emotional',
        profile: '1/3',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastVerified: '2024-07-12T10:00:00Z',
    engine_versions: {
      numerology: '1.0',
      astrology: '1.0',
      human_design: '1.0',
    },
    provenance: fixture001Provenance,
  },
  {
    id: 'fixture-002',
    name: 'Marie Curie',
    birthDate: '1867-11-24',
    birthTime: '18:30',
    timeVerified: 'exact',
    source: 'Astrodatabank (reference not recorded)',
    notes: 'Birth time is recorded in historical sources; UTC conversion is unaudited',
    expected: {
      personalNumbers: {
        day: 6, // 2+4 = 6
        month: 11, // 1+1 = 2, but 11 is a master number so keep as 11
        year: 22, // 1+8+6+7=22 (master number)
      },
      astrology: {
        sunSign: 'Sagittarius',
        moonSign: 'Capricorn',
        risingSign: 'Scorpio',
      },
      humanDesign: {
        type: 'Generator',
        strategy: 'To Respond',
        authority: 'Sacral',
        profile: '2/4',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastVerified: '2024-07-12T10:00:00Z',
    engine_versions: {
      numerology: '1.0',
      astrology: '1.0',
      human_design: '1.0',
    },
    provenance: {
      source: {
        provider: 'Astrodatabank',
        reference: null,
        rating: null,
        accessedAt: null,
        notes: [
          'Birth data sourced from Astrodatabank but access record not preserved',
          'Exact reference URL or ID not recorded and cannot be verified',
        ],
      },
      birthplace: {
        city: 'Warsaw',
        region: 'Mazovia',
        country: 'Poland (Russian Poland during this period)',
        latitude: 52.2297,
        longitude: 21.0122,
      },
      timeHandling: {
        recordedLocalTime: '18:30',
        utcOffset: null,
        timezoneMethod: 'unknown',
        timezoneIdentifier: null,
        uncertaintyMinutes: null,
        notes: [
          'Birth time recorded as 18:30 local time in Warsaw',
          'Birth occurred during Russian Empire administrative period',
          'Poland adopted standard time (Mitteleuropäische Zeit) in 1893',
          'Russian Empire local time offset is a reconstruction hypothesis without independent audit',
          'UTC offset calculation from geographic coordinates is unverified',
          'Source does not explicitly report uncertainty in birth time',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: null,
        coordinateMode: null,
        epochOrFrame: null,

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: null,
      },
      expectedCoordinates: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      tolerances: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      verification: {
        status: 'partially-verified',
        verifiedAt: null,
        verifiedBy: null,
        comparedAgainst: [],
        limitations: [
          'Birth date and time are documented but source access is not recorded',
          'Historical UTC offset conversion from Russian Empire local time has not been independently audited',
          'Astrodatabank birth record provides date/time/location data only; it does not verify astronomical calculations',
          'Expected astrology outputs remain unverified against any astronomy provider',
          'Expected Human Design outputs remain unverified',
          'Numerology reduction method is not documented in provenance; master-number preservation is asserted but not audited',
        ],
      },
    } as FixtureProvenance,
  },
  {
    id: 'fixture-003',
    name: 'Test Subject A',
    birthDate: '1990-08-15',
    birthTime: '14:30',
    timeVerified: 'exact',
    source: 'Internal test suite',
    notes: 'Synthetic fixture for regression testing',
    expected: {
      personalNumbers: {
        day: 6, // 1+5 = 6
        month: 8, // 8 (single digit)
        year: 1, // 1+9+9+0=19 -> 1+9=10 -> 1+0=1
      },
      astrology: {
        sunSign: 'Leo',
        moonSign: 'Pisces',
        risingSign: 'Aquarius',
      },
      humanDesign: {
        type: 'Generator Cross',
        strategy: 'To Respond',
        authority: 'Emotional',
        profile: '3/5',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastVerified: '2024-07-12T10:00:00Z',
    engine_versions: {
      numerology: '1.0',
      astrology: '1.0',
      human_design: '1.0',
    },
    provenance: {
      source: {
        provider: 'Internal Test Suite',
        reference: null,
        rating: null,
        accessedAt: null,
        notes: [
          'This is a contemporary test fixture used for regression testing',
          'Birth data is internally recorded but not independently verified against external sources',
        ],
      },
      birthplace: {
        city: null,
        region: null,
        country: null,
        latitude: null,
        longitude: null,
      },
      timeHandling: {
        recordedLocalTime: '14:30',
        utcOffset: null,
        timezoneMethod: 'unknown',
        timezoneIdentifier: null,
        uncertaintyMinutes: null,
        notes: [
          'Timezone and UTC offset information not documented for this test fixture',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: null,
        coordinateMode: null,
        epochOrFrame: null,

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: null,
      },
      expectedCoordinates: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      tolerances: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      verification: {
        status: 'unverified',
        verifiedAt: null,
        verifiedBy: null,
        comparedAgainst: [],
        limitations: [
          'This fixture is internal to the Soul Codex project and does not represent a real person',
          'Birth location and timezone information are deliberately not documented',
          'No external source record exists',
          'No independent verification has been performed',
          'Expected outputs are for deterministic regression testing only',
          'This fixture should not be used for accuracy or validity claims of any kind',
        ],
      },
    } as FixtureProvenance,
  },
  {
    id: 'fixture-004',
    name: 'Test Subject B',
    birthDate: '1975-12-31',
    birthTime: '00:00',
    timeVerified: 'estimated',
    source: 'Internal test suite',
    notes: 'Synthetic fixture with estimated birth time for regression testing',
    expected: {
      personalNumbers: {
        day: 4, // 3+1 = 4
        month: 3, // 1+2 = 3
        year: 22, // 1+9+7+5=22 (master number)
      },
      astrology: {
        sunSign: 'Capricorn',
        moonSign: 'Unknown',
        risingSign: 'Unknown',
      },
      humanDesign: {
        type: 'Unknown',
        strategy: 'Unknown',
        authority: 'Unknown',
        profile: 'Unknown',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastVerified: '2024-07-12T10:00:00Z',
    engine_versions: {
      numerology: '1.0',
      astrology: '1.0',
      human_design: '1.0',
    },
    provenance: {
      source: {
        provider: 'Internal Test Suite',
        reference: null,
        rating: null,
        accessedAt: null,
        notes: [
          'This is a synthetic test fixture, not a real person',
          'It does not represent a real birth certificate or historical record',
          'Created to test engine behavior when birth time is completely unknown',
        ],
      },
      birthplace: {
        city: null,
        region: null,
        country: null,
        latitude: null,
        longitude: null,
      },
      timeHandling: {
        recordedLocalTime: null,
        utcOffset: null,
        timezoneMethod: 'unknown',
        timezoneIdentifier: null,
        uncertaintyMinutes: null,
        notes: [
          'Birth time is completely unknown and unrecorded',
          'Test value 00:00 (midnight) is arbitrary placeholder for missing data',
          'No timezone information available or applicable',
          'When birth time is unknown, fields like Ascendant and Human Design cannot be calculated reliably',
          'Test data only; not suitable for any validation claims',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: null,
        coordinateMode: null,
        epochOrFrame: null,

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: null,
      },
      expectedCoordinates: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      tolerances: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      verification: {
        status: 'unverified',
        verifiedAt: null,
        verifiedBy: null,
        comparedAgainst: [],
        limitations: [
          'Birth time is completely unknown; estimated to midnight (00:00) for testing purposes only',
          'Moon sign calculation requires exact birth time; without it, Moon sign value is unreliable',
          'Ascendant calculation requires exact birth time; without it, Ascendant value is unreliable',
          'Human Design calculations require exact birth time; all HD fields are unreliable',
          'Sun sign (Capricorn) is reliable because it depends only on birth date',
          'Numerology is reliable because it depends only on date components',
          'This fixture tests engine behavior when birth time data is missing or unrecorded',
          'Do not use this fixture to validate astrology or Human Design outputs for cases with missing birth time',
        ],
      },
    } as FixtureProvenance,
  },
  {
    id: 'fixture-005',
    name: 'Master Number Test',
    birthDate: '1964-02-29',
    birthTime: '11:00',
    timeVerified: 'exact',
    source: 'Internal test suite',
    notes: 'Synthetic fixture for leap-day edge case testing',
    expected: {
      personalNumbers: {
        day: 11, // 2+9 = 11 (master number, stop)
        month: 2, // 0+2 = 2
        year: 2, // 1+9+6+4=20 -> 2+0=2
      },
      astrology: {
        sunSign: 'Pisces',
        moonSign: 'Libra',
        risingSign: 'Taurus',
      },
      humanDesign: {
        type: 'Reflector',
        strategy: 'To Be Invited',
        authority: 'Lunar',
        profile: '4/6',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastVerified: '2024-07-12T10:00:00Z',
    engine_versions: {
      numerology: '1.0',
      astrology: '1.0',
      human_design: '1.0',
    },
    provenance: {
      source: {
        provider: 'Internal Synthetic Fixture',
        reference: 'Leap day edge case for numerology and calendar handling',
        rating: null,
        accessedAt: null,
        notes: [
          'This is a synthetic test fixture created to validate edge-case handling',
          'Leap day (February 29) occurs only in leap years (divisible by 4, except centuries not divisible by 400)',
          '1964 was a leap year; February 29, 1964 is a valid date',
          'Not a real historical person; created specifically for regression testing',
        ],
      },
      birthplace: {
        city: null,
        region: null,
        country: null,
        latitude: null,
        longitude: null,
      },
      timeHandling: {
        recordedLocalTime: '11:00',
        utcOffset: null,
        timezoneMethod: 'unknown',
        timezoneIdentifier: null,
        uncertaintyMinutes: null,
        notes: [
          'Time is arbitrarily set for testing purposes',
          'Timezone information is not applicable to this synthetic fixture',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: null,
        coordinateMode: null,
        epochOrFrame: null,

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: null,
      },
      expectedCoordinates: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      tolerances: {
        sunLongitudeDegrees: null,
        moonLongitudeDegrees: null,
        ascendantLongitudeDegrees: null,
      },
      verification: {
        status: 'unverified',
        verifiedAt: null,
        verifiedBy: null,
        comparedAgainst: [],
        limitations: [
          'This is a synthetic fixture created specifically for regression testing; it does not represent a real person',
          'Birth date (February 29, 1964) is chosen to test leap-day handling in date parsing',
          'Birth time and location are arbitrarily set and not realistic',
          'Timezone information is not applicable to this synthetic fixture',
          'Numerology convention is not documented in provenance',
          'Expected astrology outputs are provided for regression consistency only; no external verification exists',
          'Expected Human Design outputs are provided for regression consistency only; no external verification exists',
          'The sole purpose is to validate leap-day parsing and demonstrate deterministic regression testing',
          'Do not use this fixture for any historical, scientific, or accuracy validation claims',
        ],
      },
    } as FixtureProvenance,
  },
];

export function getFixtureById(id: string): GoldenFixture | undefined {
  return GOLDEN_FIXTURES.find(f => f.id === id);
}

export function getAllFixtures(): GoldenFixture[] {
  return GOLDEN_FIXTURES;
}

export function getFixturesByTimeVerification(
  level: 'exact' | 'estimated' | 'unknown'
): GoldenFixture[] {
  return GOLDEN_FIXTURES.filter(f => f.timeVerified === level);
}
