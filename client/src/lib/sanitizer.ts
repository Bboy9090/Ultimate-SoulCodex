/**
 * SOUL CODEX - CENTRAL NARRATIVE SANITIZER
 * 
 * This is the ultimate firewall against AI noise, system leakage, and word mutilation.
 * It is used by both the frontend and backend to ensure narrative integrity.
 */

export function pureText(text: string | null | undefined): string {
  if (!text) return "";
  
  let cleaned = text;

  // 1. Remove specific technical markers used in multi-signal synthesis (e.g. "hj|", "rg|", "lon|")
  // These are often 2-3 letters followed by a pipe.
  cleaned = cleaned.replace(/^[a-z]{2,3}\s*\|\s*/gmi, "");

  // 2. Strict Prefix Scrub: Remove single-letter prefixes like 'D.', 'C.', 'P —' etc. 
  // ONLY if followed by dot/colon/dash AND then a Capital letter (start of real sentence).
  // This prevents stripping "G-" in "G-term" or "D" in "Don't".
  cleaned = cleaned.replace(/^([B-HJ-NP-Z])[\s.:—-]+\s*(?=[A-Z])/gm, "");

  // 3. Catch standalone single letters on their own line
  cleaned = cleaned.replace(/^([B-HJ-NP-Z])\s*$/gm, "");

  // 4. Purge specific leakage tokens ONLY as whole words (\b)
  const leakageTokens = [
    "chaosrepetition", "talkwithdraw", "chaoschaos", "chaos", "repetition", 
    "fix", "withdraw", "talk", "analyze", "hj", "rg", "undefined", "null"
  ];
  
  leakageTokens.forEach(token => {
    const regex = new RegExp(`\\b${token}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // 5. Clean up [object Object] and other JS artifacts
  cleaned = cleaned.replace(/\[object object\]/gi, "");

  // 6. Final Polish: remove leading/trailing punctuation and whitespace
  cleaned = cleaned.replace(/^[,|.:\s—-]+/, "").trim();
  
  if (!cleaned) return "";
  
  // 7. Ensure proper capitalization
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
