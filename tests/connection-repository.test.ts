import assert from "node:assert/strict";
import test from "node:test";
import { compatibilityLink, connectionComparableSunSign, connectionProfileSummary, deriveConnectionSunSignFromBirthDate, findConnectionById, hasComparableConnectionData, parseConnections, placementLabel, sanitizeConnectionPlacements, searchConnections } from "../client/src/lib/connectionRepository";

test("connections parser rejects malformed or overlong private records", () => {
  assert.deepEqual(parseConnections("bad"),[]);
  assert.deepEqual(parseConnections(JSON.stringify({version:2,connections:[]})),[]);
  const valid={id:"1",name:"Amy",sunSign:"Scorpio",createdAt:"now",updatedAt:"now"};
  const invalid={...valid,id:"2",sunSign:"Not a sign"};
  assert.deepEqual(parseConnections(JSON.stringify({version:1,connections:[valid,invalid]})),[valid]);
});

test("connections parser preserves sanitized local phone numbers", () => {
  const raw = {
    version: 1,
    connections: [{
      id: "1",
      name: "Amy",
      phone: "+1 (718) 555-1212 ext<script>",
      sunSign: "Scorpio",
      createdAt: "now",
      updatedAt: "now",
    }],
  };
  assert.deepEqual(parseConnections(JSON.stringify(raw)), [{
    id: "1",
    name: "Amy",
    phone: "+1 (718) 555-1212",
    sunSign: "Scorpio",
    createdAt: "now",
    updatedAt: "now",
  }]);
});

test("birthday derives concrete Sun sign data for saved people", () => {
  const raw = {
    version: 1,
    connections: [{
      id: "1",
      name: "Bobby",
      birthDate: "1990-09-17",
      sunSign: "Aries",
      createdAt: "now",
      updatedAt: "now",
    }],
  };
  const [person] = parseConnections(JSON.stringify(raw));
  assert.equal(person.birthDate, "1990-09-17");
  assert.equal(person.sunSign, "Virgo");
  assert.equal(connectionComparableSunSign(person), "Virgo");
  assert.equal(hasComparableConnectionData(person), true);
  assert.equal(deriveConnectionSunSignFromBirthDate("1987-01-19"), "Capricorn");
  assert.throws(() => deriveConnectionSunSignFromBirthDate("1990-02-31"), RangeError);
});

test("connections can save contact-only records without pretending a Sun sign is known", () => {
  const raw = {
    version: 1,
    connections: [{
      id: "contact-only",
      name: "Jordan",
      phone: "718-555-1212",
      createdAt: "now",
      updatedAt: "now",
    }],
  };
  const [person] = parseConnections(JSON.stringify(raw));
  assert.equal(person.sunSign, undefined);
  assert.equal(connectionComparableSunSign(person), undefined);
  assert.equal(hasComparableConnectionData(person), false);
});

test("connection parser keeps only supported friend chart placements", () => {
  const raw = {
    version: 1,
    connections: [{
      id: "1",
      name: "  Sam  ",
      sunSign: "Gemini",
      createdAt: "now",
      updatedAt: "now",
      placements: [
        { key: "moon", sign: "Virgo", house: 7 },
        { key: "mars", sign: "Capricorn", house: 10 },
        { key: "moon", sign: "Scorpio", house: 8 },
        { key: "fortune", sign: "Aries", house: 1 },
        { key: "venus", sign: "NotASign", house: 2 },
        { key: "saturn", sign: "Aquarius", house: 13 },
      ],
    }],
  };
  assert.deepEqual(parseConnections(JSON.stringify(raw)), [{
    id: "1",
    name: "Sam",
    sunSign: "Gemini",
    createdAt: "now",
    updatedAt: "now",
    placements: [
      { key: "moon", sign: "Scorpio", house: 8 },
      { key: "mars", sign: "Capricorn", house: 10 },
    ],
  }]);
});

test("placement sanitizer supports every governed body without accepting invented points", () => {
  assert.deepEqual(sanitizeConnectionPlacements([
    { key: "northNode", sign: "Aries", house: 1 },
    { key: "southNode", sign: "Libra", house: 7 },
    { key: "chiron", sign: "Virgo", house: 6 },
    { key: "vertex", sign: "Pisces", house: 12 },
  ]), [
    { key: "northNode", sign: "Aries", house: 1 },
    { key: "southNode", sign: "Libra", house: 7 },
    { key: "chiron", sign: "Virgo", house: 6 },
  ]);
  assert.equal(placementLabel("northNode"), "North Node");
});

test("compatibility links contain only a local connection id", () => {
  const connection={id:"person-123",name:"Amy & Bobby",phone:"+1 718 555 1212",sunSign:"Scorpio" as const,createdAt:"now",updatedAt:"now"};
  const link=compatibilityLink(connection);
  assert.equal(link,"/compatibility/compare?connection=person-123");
  assert.doesNotMatch(link,/Amy|Scorpio|718|phone|name|sunSign/);
});

test("a saved Sun placement can supply concrete comparison data without a top-level Sun sign", () => {
  const [person] = parseConnections(JSON.stringify({
    version: 1,
    connections: [{
      id: "1",
      name: "Sam",
      createdAt: "now",
      updatedAt: "now",
      placements: [{ key: "sun", sign: "Gemini", house: 3 }],
    }],
  }));
  assert.equal(connectionComparableSunSign(person), "Gemini");
  assert.equal(hasComparableConnectionData(person), true);
});

test("a local connection id resolves without exposing the name in the URL", () => {
  const amy={id:"person-123",name:"Amy & Bobby",sunSign:"Scorpio" as const,createdAt:"now",updatedAt:"now"};
  assert.equal(findConnectionById([amy],"person-123"),amy);
  assert.equal(findConnectionById([amy],"missing"),null);
});

test("saved people can be searched by name phone number or sun sign", () => {
  const people = parseConnections(JSON.stringify({
    version: 1,
    connections: [
      { id: "1", name: "Amy", phone: "+1 (718) 555-1212", sunSign: "Scorpio", createdAt: "now", updatedAt: "now" },
      { id: "2", name: "Sam", phone: "917.555.9900", birthDate: "1993-06-01", createdAt: "now", updatedAt: "now" },
    ],
  }));
  assert.deepEqual(searchConnections(people, "amy").map(person => person.id), ["1"]);
  assert.deepEqual(searchConnections(people, "5559900").map(person => person.id), ["2"]);
  assert.deepEqual(searchConnections(people, "gem").map(person => person.id), ["2"]);
  assert.deepEqual(searchConnections(people, "1993-06").map(person => person.id), ["2"]);
  assert.deepEqual(searchConnections(people, "").map(person => person.id), ["1","2"]);
});

test("people profile summaries stay evidence-bound instead of generic", () => {
  const [bobby, sam, contactOnly] = parseConnections(JSON.stringify({
    version: 1,
    connections: [
      { id: "1", name: "Bobby", birthDate: "1990-09-17", createdAt: "now", updatedAt: "now", placements: [{ key: "mars", sign: "Capricorn", house: 10 }] },
      { id: "2", name: "Sam", birthDate: "1993-06-01", createdAt: "now", updatedAt: "now", placements: [{ key: "moon", sign: "Virgo", house: 7 }] },
      { id: "3", name: "Jordan", phone: "718-555-1212", createdAt: "now", updatedAt: "now" },
    ],
  }));
  const bobbySummary = connectionProfileSummary(bobby);
  const samSummary = connectionProfileSummary(sam);
  const contactSummary = connectionProfileSummary(contactOnly);
  assert.match(bobbySummary, /Bobby: Virgo Sun from birthday 1990-09-17; Mars in Capricorn, House 10/);
  assert.match(samSummary, /Sam: Gemini Sun from birthday 1993-06-01; Moon in Virgo, House 7/);
  assert.notEqual(bobbySummary, samSummary);
  assert.match(contactSummary, /saved as a contact only/);
  assert.match(contactSummary, /Add a birthday or a known Sun placement/);
});

test("people profile summaries do not invent missing time-sensitive systems", () => {
  const [person] = parseConnections(JSON.stringify({
    version: 1,
    connections: [{ id: "1", name: "Date Only", birthDate: "1987-01-19", createdAt: "now", updatedAt: "now" }],
  }));
  const summary = connectionProfileSummary(person);
  assert.match(summary, /Capricorn Sun from birthday 1987-01-19/);
  assert.match(summary, /Moon, Rising, houses, Human Design, and other time-sensitive systems stay unavailable/);
  assert.doesNotMatch(summary, /deeply intuitive|old soul|unique individual|the universe|destined|scientifically proves/i);
});
