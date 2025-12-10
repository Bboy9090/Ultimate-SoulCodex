// server/index.ts
// Minimal REST server for SoulCodex / rest-express

// server/index.ts (example)
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/hello', (_req, res) => {
  res.json({ message: 'Soul Codex API is alive.' });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
