/**
 * SOUL CODEX - BACKEND NARRATIVE SANITIZER
 * 
 * Perfected firewall against AI noise and word mutilation.
 * Shared across backend routes and services.
 */

export function pureText(text: string | null | undefined): string {
  if (!text) return "";
  
  let cleaned = text;

  // 1. Remove specific technical markers used in multi-signal synthesis (e.g. "hj|", "rg|", "lon|")
  cleaned = cleaned.replace(/^[a-z]{2,3}\s*\|\s*/gmi, "");

  // 2. Strict Prefix Scrub: Remove single-letter prefixes (D., C., P —)
  // ONLY if followed by dot/colon/dash AND then a Capital letter.
  cleaned = cleaned.replace(/^([B-HJ-NP-Z])[\s.:—-]+\s*(?=[A-Z])/gm, "");

  // 3. Catch standalone single letters on their own line
  cleaned = cleaned.replace(/^([B-HJ-NP-Z])\s*$/gm, "");

  // 4. Purge leakage tokens as whole words
  const leakageTokens = [
    "chaosrepetition", "talkwithdraw", "chaoschaos", "chaos", "repetition", 
    "fix", "withdraw", "talk", "analyze", "hj", "rg", "undefined", "null"
  ];
  
  leakageTokens.forEach(token => {
    const regex = new RegExp(`\\b${token}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // 5. Clean up JS artifacts
  cleaned = cleaned.replace(/\[object object\]/gi, "");

  // 6. Final Polish
  cleaned = cleaned.replace(/^[,|.:\s—-]+/, "").trim();
  
  if (!cleaned) return "";
  
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
