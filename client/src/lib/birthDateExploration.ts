import * as Astronomy from 'astronomy-engine';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { ATLAS_SIGNS } from './astrologyAtlas';

const BODIES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
export type BirthDateExploration = {
  startUtc: string; endUtc: string; samples: number;
  placements: { body: string; signs: string[]; boundarySensitive: boolean }[];
};
export function localBirthDateWindow(date: string, timezone: string): [Date,Date] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('A full birth date is required.');
  const calendar = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0,10) !== date) throw new Error('Enter a valid calendar date.');
  if (calendar.getUTCFullYear() < 1900 || calendar.getUTCFullYear() > 2100) throw new Error('Date exploration currently supports 1900–2100.');
  try { new Intl.DateTimeFormat('en',{timeZone:timezone}).format(calendar); }
  catch { throw new Error('Resolve a valid birthplace timezone first.'); }
  if (!timezone.trim()) throw new Error('Resolve a valid birthplace timezone first.');
  calendar.setUTCDate(calendar.getUTCDate()+1);
  const next = calendar.toISOString().slice(0,10);
  const start = fromZonedTime(`${date}T00:00:00`,timezone);
  const end = fromZonedTime(`${next}T00:00:00`,timezone);
  // Fail closed for skipped civil dates or ambiguous historical midnight transitions.
  if (formatInTimeZone(start,timezone,'yyyy-MM-dd HH:mm') !== `${date} 00:00` || formatInTimeZone(end,timezone,'yyyy-MM-dd HH:mm') !== `${next} 00:00`) throw new Error('This historical timezone transition needs additional verification.');
  const hours = (end.getTime()-start.getTime())/3600000;
  if (hours < 23 || hours > 25) throw new Error('This civil date needs additional timezone verification.');
  return [start,end];
}
export function exploreBirthDate(date: string, timezone: string): BirthDateExploration {
  const [start,end] = localBirthDateWindow(date,timezone);
  const placements = BODIES.map(body => ({body, signs: new Set<string>(), boundarySensitive:false}));
  const times: number[] = [];
  for (let t=start.getTime();t<end.getTime();t+=600000) times.push(t);
  times.push(end.getTime()-1);
  for (const timestamp of times) {
    const at = new Date(timestamp);
    for (const p of placements) {
      const longitude = p.body === 'Moon' ? Astronomy.EclipticGeoMoon(at).lon : Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body[p.body],at,true)).elon;
      if (!Number.isFinite(longitude)) throw new Error('A planetary calculation could not be completed.');
      const normalized = ((longitude%360)+360)%360;
      const index = Math.floor(normalized/30);
      p.signs.add(ATLAS_SIGNS[index]);
      // Conservative edge candidates; not a proof of continuous-time stability.
      const degree = normalized%30;
      if (degree < 0.25) { p.signs.add(ATLAS_SIGNS[(index+11)%12]); p.boundarySensitive=true; }
      if (degree > 29.75) { p.signs.add(ATLAS_SIGNS[(index+1)%12]); p.boundarySensitive=true; }
    }
  }
  return { startUtc:start.toISOString(), endUtc:end.toISOString(), samples:times.length, placements: placements.map(p => ({...p,signs:[...p.signs]})) };
}
