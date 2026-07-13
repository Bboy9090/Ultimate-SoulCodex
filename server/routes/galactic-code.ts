/**
 * Galactic Code API Route
 *
 * POST /api/galactic-code/generate
 * GET /api/galactic-code/:profileId
 */

import type { Express } from 'express';
import type { GalacticCodeInput } from '../../shared/galactic-code/types';
import { generateGalacticCode } from '../services/galactic-code/generator';

export function registerGalacticCodeRoutes(app: Express): void {
  // Generate or regenerate Galactic Code
  app.post('/api/galactic-code/generate', async (req, res) => {
    try {
      const input: GalacticCodeInput = req.body;

      // Validate required fields
      if (!input.profileId) {
        return res.status(400).json({ error: 'profileId is required' });
      }

      if (!input.astrology || !input.humanDesign || !input.numerology || !input.behavior) {
        return res.status(400).json({
          error: 'astrology, humanDesign, numerology, and behavior objects are required',
        });
      }

      // Generate Galactic Code
      const result = generateGalacticCode(input);

      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[GalacticCode] Generation error:', message);
      res.status(400).json({ error: message });
    }
  });

  // Retrieve stored Galactic Code (future: database integration)
  app.get('/api/galactic-code/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;

      // TODO: Retrieve from database when schema is available
      // For now, return not found
      res.status(404).json({
        error: 'Galactic Code persistence not yet available. Use POST /api/galactic-code/generate',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[GalacticCode] Retrieval error:', message);
      res.status(500).json({ error: message });
    }
  });

  console.log('[GalacticCode] Routes registered: POST /api/galactic-code/generate, GET /api/galactic-code/:profileId');
}
