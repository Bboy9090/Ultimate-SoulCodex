import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔥 Test route for the mobile app
app.get('/hello', (_req, res) => {
  res.json({ message: 'Soul Codex API is alive.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SoulCodex API listening on http://localhost:${PORT}`);
});
