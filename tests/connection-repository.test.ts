import assert from "node:assert/strict";
import test from "node:test";
import { compatibilityLink, parseConnections } from "../client/src/lib/connectionRepository";

test("connections parser rejects malformed or overlong private records", () => {
  assert.deepEqual(parseConnections("bad"),[]);
  assert.deepEqual(parseConnections(JSON.stringify({version:2,connections:[]})),[]);
  const valid={id:"1",name:"Amy",sunSign:"Scorpio",createdAt:"now",updatedAt:"now"};
  const invalid={...valid,id:"2",sunSign:"Not a sign"};
  assert.deepEqual(parseConnections(JSON.stringify({version:1,connections:[valid,invalid]})),[valid]);
});

test("compatibility links encode user-entered names", () => {
  const link=compatibilityLink({name:"Amy & Bobby",sunSign:"Scorpio"});
  assert.equal(link,"/compatibility/compare?name=Amy+%26+Bobby&sunSign=Scorpio");
});
