import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEnneagram,
  calculateMBTI,
} from "../server/services/personality";

test("all Enneagram outcomes stay framed as traditional reflection", () => {
  for (let type = 1; type <= 9; type += 1) {
    const responses = Array(9).fill(0);
    responses[type - 1] = 5;

    const result = calculateEnneagram(responses);
    assert.equal(result?.type, type);
    assert.match(result?.description ?? "", /traditionally associated/i);
    assert.match(result?.motivation ?? "", /traditional motivation theme/i);
    assert.match(result?.fear ?? "", /traditional fear theme/i);

    const rendered = [
      result?.description,
      result?.motivation,
      result?.fear,
    ].join(" ");

    assert.doesNotMatch(
      rendered,
      /you always|you never|proves|diagnos|fixed identity|destined|guaranteed/i,
    );
  }
});

function mbtiResponses(type: string): string[] {
  const e = type[0] === "E" ? "social group" : "quiet solitude";
  const s = type[1] === "S" ? "practical detail concrete" : "abstract possibility";
  const t = type[2] === "T" ? "logical objective analyze" : "values empathy";
  const j = type[3] === "J" ? "plan schedule organize" : "flexible spontaneous";
  return [e, s, t, j, e, s, t, j];
}

test("all 16 MBTI outcomes stay framed as traditional reflection", () => {
  const types = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP",
  ];

  for (const type of types) {
    const result = calculateMBTI(mbtiResponses(type));
    assert.equal(result?.type, type);
    assert.match(result?.description ?? "", /traditionally described/i);
    assert.equal(result?.functions.length, 4);

    assert.doesNotMatch(
      result?.description ?? "",
      /always|never|proves|diagnos|fixed identity|destined|guaranteed|unsurpassed/i,
    );
  }
});
