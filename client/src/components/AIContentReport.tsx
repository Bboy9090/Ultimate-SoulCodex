import { useState } from "react";

const CATEGORIES = [
  ["offensive", "Offensive or hateful"],
  ["sexual", "Sexual or inappropriate"],
  ["dangerous", "Dangerous or harmful"],
  ["self-harm", "Self-harm concern"],
  ["misleading", "Misleading or fabricated"],
  ["privacy", "Privacy concern"],
  ["other", "Other"],
] as const;

export default function AIContentReport() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("offensive");
  const [excerpt, setExcerpt] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reportId, setReportId] = useState<string | null>(null);

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    if (!excerpt.trim() || status === "sending") return;

    setStatus("sending");
    setReportId(null);
    try {
      const response = await fetch("/api/ai-content-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          excerpt: excerpt.trim(),
          details: details.trim(),
          source: "soul-guide",
        }),
      });
      if (!response.ok) throw new Error(`Report failed with ${response.status}`);
      const payload = await response.json();
      setReportId(typeof payload.reportId === "string" ? payload.reportId : null);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function resetAndClose() {
    setOpen(false);
    setStatus("idle");
    setReportId(null);
    setExcerpt("");
    setDetails("");
    setCategory("offensive");
  }

  return (
    <div className="ai-report-root">
      {!open ? (
        <button type="button" className="ai-report-trigger" onClick={() => setOpen(true)}>
          Report AI output
        </button>
      ) : (
        <div className="ai-report-panel" role="dialog" aria-modal="false" aria-labelledby="ai-report-title">
          <div className="ai-report-header">
            <div>
              <p>Safety feedback</p>
              <h2 id="ai-report-title">Report an AI response</h2>
            </div>
            <button type="button" className="ai-report-close" aria-label="Close report form" onClick={resetAndClose}>×</button>
          </div>

          {status === "sent" ? (
            <div className="ai-report-result" role="status">
              <strong>Report received.</strong>
              <span>Thank you. The report was sent for developer review.</span>
              {reportId && <code>{reportId}</code>}
              <button type="button" onClick={resetAndClose}>Done</button>
            </div>
          ) : (
            <form onSubmit={submitReport}>
              <label>
                What is wrong with the response?
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label>
                AI response or relevant excerpt
                <textarea
                  required
                  maxLength={2000}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Paste the generated text you want reviewed."
                />
              </label>

              <label>
                Additional details (optional)
                <textarea
                  maxLength={1000}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Tell us what happened or why this response should be reviewed."
                />
              </label>

              <p className="ai-report-note">Only submit content you want sent to Soul Codex for safety review.</p>
              {status === "error" && <p className="ai-report-error" role="alert">The report could not be sent. Try again.</p>}
              <button type="submit" className="ai-report-submit" disabled={!excerpt.trim() || status === "sending"}>
                {status === "sending" ? "Sending…" : "Send report"}
              </button>
            </form>
          )}
        </div>
      )}

      <style>{`
        .ai-report-root{position:fixed;right:14px;bottom:14px;z-index:9999;font-family:inherit}.ai-report-trigger{border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(13,9,23,.94);color:#d7cfdf;padding:10px 14px;font-size:12px;font-weight:700;box-shadow:0 12px 34px rgba(0,0,0,.32);cursor:pointer}.ai-report-trigger:hover{border-color:rgba(212,168,95,.42);color:#f7f0e4}.ai-report-panel{width:min(390px,calc(100vw - 24px));max-height:min(720px,calc(100vh - 28px));overflow:auto;border:1px solid rgba(212,168,95,.28);border-radius:18px;background:linear-gradient(150deg,rgba(25,18,39,.99),rgba(9,7,15,.99));color:#f7f0e4;box-shadow:0 24px 80px rgba(0,0,0,.48);padding:18px}.ai-report-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.ai-report-header p{margin:0 0 4px;color:#d4a85f;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.ai-report-header h2{margin:0;font-size:20px}.ai-report-close{border:0;background:transparent;color:#aaa4b8;font-size:25px;line-height:1;cursor:pointer}.ai-report-panel form{display:flex;flex-direction:column;gap:12px}.ai-report-panel label{display:flex;flex-direction:column;gap:6px;color:#d7cfdf;font-size:12px;font-weight:650}.ai-report-panel select,.ai-report-panel textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.04);color:#f7f0e4;padding:10px;font:inherit;outline:none}.ai-report-panel select:focus,.ai-report-panel textarea:focus{border-color:#d4a85f;box-shadow:0 0 0 2px rgba(212,168,95,.1)}.ai-report-panel textarea{min-height:88px;resize:vertical}.ai-report-note{margin:0;color:#928b9f;font-size:11px;line-height:1.45}.ai-report-error{margin:0;color:#ff9698;font-size:12px}.ai-report-submit,.ai-report-result button{border:1px solid rgba(212,168,95,.55);border-radius:10px;background:rgba(212,168,95,.14);color:#f1d69c;padding:11px 13px;font-weight:800;cursor:pointer}.ai-report-submit:disabled{opacity:.45;cursor:not-allowed}.ai-report-result{display:flex;flex-direction:column;gap:9px;color:#d7cfdf;font-size:13px}.ai-report-result strong{color:#f7f0e4;font-size:17px}.ai-report-result code{font-size:10px;color:#aaa4b8;overflow-wrap:anywhere}@media(max-width:520px){.ai-report-root{left:8px;right:8px;bottom:8px}.ai-report-trigger{margin-left:auto;display:block}.ai-report-panel{width:100%;max-height:72vh}}
      `}</style>
    </div>
  );
}
