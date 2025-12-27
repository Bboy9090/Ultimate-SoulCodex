import { Router } from "express";

const router = Router();

// Placeholder router; real endpoints are defined in routes.ts
router.get("/compatibility/ping", (_req, res) => {
  res.json({ ok: true });
});

export default router;
