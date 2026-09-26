// I Ching remains outside the governed identity contract.
// Soul Codex does not derive a birth hexagram from a calendar date, and it does
// not synthesize missing hexagram text. A future implementation requires a
// complete governed corpus and an explicit user-invoked divination method.
export function calculateIChing(birthDate: string): never {
  void birthDate;
  throw new Error('i_ching_unavailable:incomplete_hexagram_corpus_and_no_governed_divination_method');
}
