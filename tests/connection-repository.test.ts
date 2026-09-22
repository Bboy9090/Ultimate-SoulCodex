import assert from "node:assert/strict";
import test from "node:test";
import { compatibilityLink, findConnectionById, parseConnections } from "../client/src/lib/connectionRepository";

test("connections parser rejects malformed or overlong private records", () => {
  assert.deepEqual(parseConnections("bad"),[]);
  assert.deepEqual(parseConnections(JSON.stringify({version:2,connections:[]})),[]);
  const valid={id:"1",name:"Amy",sunSign:"Scorpio",createdAt:"now",updatedAt:"now"};
  const invalid={...valid,id:"2",sunSign:"Not a sign"};
  assert.deepEqual(parseConnections(JSON.stringify({version:1,connections:[valid,invalid]})),[valid]);
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
