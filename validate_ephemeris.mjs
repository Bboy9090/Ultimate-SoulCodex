// Cross-validate astronomy-engine against JPL Horizons
// Birth: Sept 17, 1990, 11:11 AM EDT, Bronx NY

import * as Astronomy from 'astronomy-engine';

const Astro = Astronomy.default || Astronomy;

// Test date: Sept 17, 1990, 11:11 AM EDT = 15:11 UTC
const birthDate = new Date('1990-09-17T15:11:00Z');

// Observer location: Bronx, NY (40.8448°N, 73.8648°W)
const latitude = 40.8448;
const longitude = -73.8648;

// Calculate positions using astronomy-engine
const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const bodyMap = {
  Sun: Astro.Body.Sun,
  Moon: Astro.Body.Moon,
  Mercury: Astro.Body.Mercury,
  Venus: Astro.Body.Venus,
  Mars: Astro.Body.Mars,
  Jupiter: Astro.Body.Jupiter,
  Saturn: Astro.Body.Saturn,
  Uranus: Astro.Body.Uranus,
  Neptune: Astro.Body.Neptune,
  Pluto: Astro.Body.Pluto
};

console.log('ASTRONOMY-ENGINE EPHEMERIS VALIDATION');
console.log('=====================================');
console.log(`Birth Date: ${birthDate.toISOString()}`);
console.log(`Location: Bronx, NY (${latitude}°N, ${longitude}°W)`);
console.log('');
console.log('Planet Positions (Ecliptic Longitude):');
console.log('');

const positions = {};

planets.forEach(name => {
  const body = bodyMap[name];
  const equ = Astro.GeoVector(body, birthDate, true);
  const ecl = Astro.Ecliptic(equ);
  const longitude = ecl.elon;
  const sign = Math.floor(longitude / 30);
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const degree = longitude % 30;
  
  positions[name] = { longitude: longitude.toFixed(4), degree: degree.toFixed(4), sign: signNames[sign] };
  
  console.log(`${name.padEnd(10)} ${signNames[sign].padEnd(12)} ${degree.toFixed(4)}°`);
});

console.log('');
console.log('Ascendant Calculation (Sidereal Time Method):');
const lst = Astro.SiderealTime(birthDate);
const lstDegrees = lst * 15;
const latRad = latitude * Math.PI / 180;
const obliquity = 23.4397;
const oblRad = obliquity * Math.PI / 180;
const lstRad = lstDegrees * Math.PI / 180;
const numerator = Math.cos(lstRad);
const denominator = -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));
let ascendantLongitude = Math.atan2(numerator, denominator) * 180 / Math.PI;
ascendantLongitude = (ascendantLongitude + 360) % 360;
const ascSign = Math.floor(ascendantLongitude / 30);
const ascDegree = ascendantLongitude % 30;

console.log(`Ascendant (Rising): ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][ascSign]} ${ascDegree.toFixed(4)}°`);
console.log(`Local Sidereal Time: ${lst.toFixed(6)} hours (${lstDegrees.toFixed(4)}°)`);

console.log('');
console.log('JSON Output for Horizons comparison:');
console.log(JSON.stringify({
  date: birthDate.toISOString(),
  location: { latitude, longitude },
  planets: positions
}, null, 2));
