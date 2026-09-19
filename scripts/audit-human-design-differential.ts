import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { calculateHumanDesign } from "../packages/astrology/human-design";

const require = createRequire(import.meta.url);
const { computeChart } = require("free-human-design") as {
  computeChart: (input: {
    birthdate: string;
    birthtime: string;
    timezone: string;
    location?: { lat: number; lng: number };
  }) => {
    humanDesign: {
      type: string;
      authority: string;
      profile: string;
      definedCenters: string[];
      definedChannels: Array<{ gates: number[]; key?: string }>;
      activations: {
        personality: Array<{ body: string; gate: number; line: number }>;
        design: Array<{ body: string; gate: number; line: number }>;
      };
    };
  };
};

const FIXTURES = [
  ["bobby-bronx","1990-09-17","11:11","America/New_York",40.8448,-73.8648],
  ["bangkok-reference","1972-08-02","14:30","Asia/Bangkok",13.7563,100.5018],
  ["new-york-1988","1988-10-29","06:30","America/New_York",40.7128,-74.006],
  ["san-juan-1991","1991-04-23","12:15","America/Puerto_Rico",18.4655,-66.1057],
  ["tokyo-1975","1975-04-03","14:32","Asia/Tokyo",35.6762,139.6503],
  ["london-2001","2001-06-21","12:00","Europe/London",51.5074,-0.1278],
  ["sydney-1999","1999-01-15","06:20","Australia/Sydney",-33.8688,151.2093],
  ["cape-town-1968","1968-08-09","22:40","Africa/Johannesburg",-33.9249,18.4241],
  ["delhi-leap-2000","2000-02-29","05:45","Asia/Kolkata",28.6139,77.209],
  ["kathmandu-2020","2020-02-29","17:12","Asia/Kathmandu",27.7172,85.324],
  ["adelaide-1988","1988-10-29","07:30","Australia/Adelaide",-34.9285,138.6007],
  ["honolulu-1944","1944-06-06","03:00","Pacific/Honolulu",21.3069,-157.8583],
  ["anchorage-2015","2015-09-23","00:15","America/Anchorage",61.2181,-149.9003],
  ["reykjavik-1950","1950-03-20","13:00","Atlantic/Reykjavik",64.1466,-21.9426],
  ["buenos-aires-2008","2008-12-31","23:59","America/Argentina/Buenos_Aires",-34.6037,-58.3816],
  ["nairobi-1993","1993-07-26","09:00","Africa/Nairobi",-1.2921,36.8219],
  ["apia-2012","2011-12-31","23:10","Pacific/Apia",-13.8507,-171.7514],
  ["kiritimati-2026","2026-08-03","23:28","Pacific/Kiritimati",1.8721,-157.4278],
  ["pago-pago-2026","2026-08-03","23:28","Pacific/Pago_Pago",-14.2756,-170.702],
  ["los-angeles-2005","2005-05-17","19:42","America/Los_Angeles",34.0522,-118.2437],
] as const;

const BODY_MAP: Record<string,string> = {
  sun: "sun", earth: "earth", moon: "moon",
  northNode: "north_node", southNode: "south_node",
  mercury: "mercury", venus: "venus", mars: "mars",
  jupiter: "jupiter", saturn: "saturn", uranus: "uranus",
  neptune: "neptune", pluto: "pluto",
};

function normCenter(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "").replace("solarplexus", "solarplexus");
}

function normAuthority(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("emotional")) return "emotional";
  if (v.includes("sacral")) return "sacral";
  if (v.includes("splenic")) return "splenic";
  if (v.includes("ego") || v.includes("heart")) return "ego";
  if (v.includes("self-projected") || v.includes("self projected")) return "self-projected";
  if (v.includes("mental") || v.includes("environment")) return "mental";
  if (v.includes("lunar")) return "lunar";
  return v;
}

function normChannel(gates: number[]): string {
  return [...gates].sort((a,b)=>a-b).join("-");
}

function activationMap(
  activations: Array<{ body: string; gate: number; line: number }>,
): Map<string,{gate:number;line:number}> {
  return new Map(activations.map((a)=>[a.body,{gate:a.gate,line:a.line}]));
}

const rows = [];
let totalActivations = 0;
let exactGateMatches = 0;
let exactLineMatches = 0;
let typeMatches = 0;
let authorityMatches = 0;
let profileMatches = 0;
let centerSetMatches = 0;
let channelSetMatches = 0;

for (const [id,birthDate,birthTime,timezone,latitude,longitude] of FIXTURES) {
  const soul = calculateHumanDesign({
    name: id,
    birthDate,
    birthTime,
    birthLocation: id,
    timezone,
    latitude: String(latitude),
    longitude: String(longitude),
  });
  if (soul.status !== "resolved") {
    rows.push({id,status:"soul_unresolved",reason:soul.reason});
    continue;
  }

  const ref = computeChart({
    birthdate: birthDate,
    birthtime: birthTime,
    timezone,
    location: { lat: latitude, lng: longitude },
  }).humanDesign;

  const refPersonality = activationMap(ref.activations.personality);
  const refDesign = activationMap(ref.activations.design);
  const activationDiffs = [];

  for (const [soulBody,refBody] of Object.entries(BODY_MAP)) {
    for (const [stream,soulSet,refSet] of [
      ["personality",soul.activations.conscious,refPersonality],
      ["design",soul.activations.unconscious,refDesign],
    ] as const) {
      const actual = soulSet[soulBody as keyof typeof soulSet];
      const expected = refSet.get(refBody);
      if (!actual || !expected) {
        activationDiffs.push({stream,body:soulBody,reason:"missing_activation"});
        continue;
      }
      totalActivations += 1;
      if (actual.gate === expected.gate) exactGateMatches += 1;
      if (actual.gate === expected.gate && actual.line === expected.line) exactLineMatches += 1;
      if (actual.gate !== expected.gate || actual.line !== expected.line) {
        activationDiffs.push({
          stream,
          body:soulBody,
          soul:{gate:actual.gate,line:actual.line},
          reference:{gate:expected.gate,line:expected.line},
        });
      }
    }
  }

  const soulCenters = Object.entries(soul.centers)
    .filter(([,value])=>value.defined)
    .map(([name])=>normCenter(name))
    .sort();
  const refCenters = [...ref.definedCenters].map(normCenter).sort();

  const soulChannels = soul.channels.filter((x)=>x.defined).map((x)=>normChannel(x.gates)).sort();
  const refChannels = ref.definedChannels.map((x)=>normChannel(x.gates)).sort();

  const typeMatch = soul.type === ref.type;
  const authorityMatch = normAuthority(soul.authority) === normAuthority(ref.authority);
  const profileMatch = soul.profile === ref.profile;
  const centersMatch = JSON.stringify(soulCenters) === JSON.stringify(refCenters);
  const channelsMatch = JSON.stringify(soulChannels) === JSON.stringify(refChannels);

  typeMatches += Number(typeMatch);
  authorityMatches += Number(authorityMatch);
  profileMatches += Number(profileMatch);
  centerSetMatches += Number(centersMatch);
  channelSetMatches += Number(channelsMatch);

  rows.push({
    id,
    status:"compared",
    type:{soul:soul.type,reference:ref.type,match:typeMatch},
    authority:{soul:soul.authority,reference:ref.authority,match:authorityMatch},
    profile:{soul:soul.profile,reference:ref.profile,match:profileMatch},
    centers:{soul:soulCenters,reference:refCenters,match:centersMatch},
    channels:{soul:soulChannels,reference:refChannels,match:channelsMatch},
    activationDiffs,
  });
}

const compared = rows.filter((row:any)=>row.status==="compared").length;
const receipt = {
  schemaVersion:"1.0.0",
  generatedAt:new Date().toISOString(),
  policyStatus:"audit_only_no_human_design_production_approval",
  soulEngine:"packages/astrology/human-design.ts",
  referenceEngine:"free-human-design@1.0.1",
  fixtureCount:FIXTURES.length,
  comparedFixtureCount:compared,
  rows,
  summary:{
    totalActivations,
    exactGateMatches,
    exactLineMatches,
    gateAgreement: totalActivations ? exactGateMatches/totalActivations : 0,
    exactGateLineAgreement: totalActivations ? exactLineMatches/totalActivations : 0,
    typeMatches,
    authorityMatches,
    profileMatches,
    centerSetMatches,
    channelSetMatches,
    typeAgreement: compared ? typeMatches/compared : 0,
    authorityAgreement: compared ? authorityMatches/compared : 0,
    profileAgreement: compared ? profileMatches/compared : 0,
    centerSetAgreement: compared ? centerSetMatches/compared : 0,
    channelSetAgreement: compared ? channelSetMatches/compared : 0,
  },
};

const outputPath = process.argv[2] ?? "human-design-differential-audit.json";
await writeFile(outputPath, JSON.stringify(receipt,null,2)+"\n","utf8");
console.log(JSON.stringify({outputPath,...receipt.summary},null,2));

if (compared !== FIXTURES.length) process.exitCode = 2;
