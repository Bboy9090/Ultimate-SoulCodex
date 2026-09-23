import assert from "node:assert/strict";
import test from "node:test";
import { compatibilityLink, findConnectionById, parseConnections, placementLabel, sanitizeConnectionPlacements } from "../client/src/lib/connectionRepository";

test("connections parser rejects malformed or overlong private records", () => {
  assert.deepEqual(parseConnections("bad"),[]);
  assert.deepEqual(parseConnections(JSON.stringify({version:2,connections:[]})),[]);
  const valid={id:"1",name:"Amy",sunSign:"Scorpio",createdAt:"now",updatedAt:"now"};
  const invalid={...valid,id:"2",sunSign:"Not a sign"};
  assert.deepEqual(parseConnections(JSON.stringify({version:1,connections:[valid,invalid]})),[valid]);
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
  const connection={id:"person-123",name:"Amy & Bobby",sunSign:"Scorpio" as const,createdAt:"now",updatedAt:"now"};
  const link=compatibilityLink(connection);
  assert.equal(link,"/compatibility/compare?connection=person-123");
  assert.doesNotMatch(link,/Amy|Scorpio|name|sunSign/);
});

test("a local connection id resolves without exposing the name in the URL", () => {
  const amy={id:"person-123",name:"Amy & Bobby",sunSign:"Scorpio" as const,createdAt:"now",updatedAt:"now"};
  assert.equal(findConnectionById([amy],"person-123"),amy);
  assert.equal(findConnectionById([amy],"missing"),null);
});
