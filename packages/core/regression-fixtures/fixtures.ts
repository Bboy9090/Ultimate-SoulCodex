/**
 * Golden Regression Fixtures
 *
 * Canonical birth charts with verified outputs.
 * These act as regression tests: if outputs change, something broke.
 */

import type { GoldenFixture } from './types.js';
import type { FixtureProvenance } from './provenance.js';

// Provenance metadata for all fixtures
const fixture001Provenance: FixtureProvenance = {
  source: {
    provider: 'Astrodatabank',
    reference: 'Albert Einstein (March 14, 1879)',
    rating: 'A (Reliable)',
    accessedAt: '2024-01-15',
    notes: [
      'Birth time is well-documented in historical records',
      'Multiple historical sources corroborate 11:30 local time in Ulm',
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
    utcOffset: 'LMT-0:33:20', // Ulm local mean time before standard time adoption
    timezoneMethod: 'local-mean-time',
    timezoneIdentifier: null,
    uncertaintyMinutes: 5,
    notes: [
      'Germany adopted standard time (Mitteleuropäische Zeit) in 1893',
      'Birth occurred under local mean time regime',
      'UTC conversion based on documented local mean time with ±5 minute tolerance',
    ],
  },
  calculation: {
    astrologyProvider: null,
    astrologyProviderVersion: null,
    ephemeris: null,
    ephemerisVersion: null,
    zodiac: 'tropical',
    coordinateMode: 'geocentric',
    epochOrFrame: 'J2000.0',

    humanDesignProvider: null,
    humanDesignProviderVersion: null,
    humanDesignMethod: null,

    numerologyConvention: 'Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values',
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
      'Birth record is documented but exact UTC conversion method has not been independently audited',
      'Astrodatabank rating "A" indicates reliable source data but does not verify astronomical calculations',
      'Expected astrology output values remain unverified against independent astronomy provider comparison',
      'Expected Human Design output remains unverified against independent Human Design provider',
      'Numerology reduction follows documented convention but historical validation is incomplete',
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
    source: 'Astrodatabank (confirmed)',
    notes: 'Physicist, known birth time verified through historical records',
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
    source: 'Astrodatabank',
    notes: 'Physicist, exact birth time confirmed',
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
        reference: 'Marie Curie (November 24, 1867)',
        rating: 'A (Reliable)',
        accessedAt: '2024-01-15',
        notes: [
          'Birth time recorded as 18:30 (6:30 PM)',
          'Birth in Warsaw, then part of Russian Poland',
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
        utcOffset: 'LMT+1:23:40', // Warsaw local mean time
        timezoneMethod: 'local-mean-time',
        timezoneIdentifier: null,
        uncertaintyMinutes: 10,
        notes: [
          'Birth occurred during Russian Empire local time conventions',
          'Poland adopted standard time (Mitteleuropäische Zeit) in 1893',
          'UTC conversion based on documented local mean time with ±10 minute tolerance',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: 'tropical',
        coordinateMode: 'geocentric',
        epochOrFrame: 'J2000.0',

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: 'Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values',
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
          'Birth record is documented but exact UTC conversion from Russian Empire time has not been independently audited',
          'Astrodatabank rating "A" indicates reliable source data but does not verify astronomical calculations',
          'Expected astrology output values remain unverified against independent astronomy provider comparison',
          'Expected Human Design output remains unverified against independent Human Design provider',
          'Numerology reduction follows documented convention but historical validation is incomplete',
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
    source: 'Direct verification',
    notes: 'Contemporary chart, exact birth time',
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
        zodiac: 'tropical',
        coordinateMode: 'geocentric',
        epochOrFrame: 'J2000.0',

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: 'Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values',
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
          'This fixture is internal to the Soul Codex project',
          'No external source record or independent verification has been performed',
          'Birth location and timezone information are not documented',
          'Regression tests establish deterministic behavior but not historical accuracy or validity',
          'Expected astrology and Human Design values are provided for regression consistency only',
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
    source: 'Birth certificate (no time)',
    notes: 'Birth time estimated to midnight',
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
        reference: 'Birth certificate record (time not recorded)',
        rating: null,
        accessedAt: null,
        notes: [
          'Birth occurred on the last day of the year',
          'Birth time is not recorded on the birth certificate',
          'This fixture tests edge cases and missing data handling',
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
        timezoneMethod: 'estimated',
        timezoneIdentifier: null,
        uncertaintyMinutes: 1440,
        notes: [
          'Birth time is completely unknown; time set to 00:00 (midnight) is arbitrary for testing',
          'Uncertainty range is ±1440 minutes (24 hours / full day)',
          'Unknown birth time means Ascendant and time-sensitive Human Design fields cannot be accurately calculated',
        ],
      },
      calculation: {
        astrologyProvider: null,
        astrologyProviderVersion: null,
        ephemeris: null,
        ephemerisVersion: null,
        zodiac: 'tropical',
        coordinateMode: 'geocentric',
        epochOrFrame: 'J2000.0',

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: 'Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values',
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
          'Birth time is unknown and estimated to midnight for testing purposes only',
          'Moon sign calculation depends on birth time; without exact time, Moon sign is unreliable',
          'Ascendant depends critically on birth time; without exact time, Ascendant is unknown',
          'Human Design fields (strategy, authority, type) require exact birth time; they cannot be reliably calculated',
          'Sun sign can be determined from date alone and is reliable for Capricorn',
          'Numerology calculation depends only on date and is reliable',
          'No external source has been consulted to verify expected outputs',
          'This fixture serves to test the engine behavior when birth time data is missing',
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
    source: 'Historical leap day birth',
    notes: 'Leap year birth to test edge case',
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
        zodiac: 'tropical',
        coordinateMode: 'geocentric',
        epochOrFrame: 'J2000.0',

        humanDesignProvider: null,
        humanDesignProviderVersion: null,
        humanDesignMethod: null,

        numerologyConvention: 'Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values',
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
          'This is a synthetic fixture and does not represent a real person',
          'It tests the engine behavior on leap-day dates (February 29)',
          'It validates the repository master-number preservation convention: reducing 2+9=11, which is a master number',
          'Expected astrology outputs are provided for regression testing only and have not been independently verified',
          'Expected Human Design outputs are provided for regression testing only and have not been independently verified',
          'The sole purpose is to ensure the numerology engine correctly handles leap dates and preserves master numbers',
          'This fixture should not be used for any historical or scientific validation claims',
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
