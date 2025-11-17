import type { Express } from "express";
import { storage } from "../storage";
import { streamChat, isGeminiAvailable } from "../services/gemini";
import { isAuthenticated } from "../replitAuth";

export function registerChatRoutes(app: Express) {
  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!isGeminiAvailable()) {
        return res.status(503).json({ 
          message: "AI Soul Guide is temporarily unavailable. Please try again later." 
        });
      }

      const userId = (req as any).user?.id;
      const sessionId = req.sessionID;

      let profile = null;
      if (userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (sessionId) {
        const profiles = await storage.getAllProfiles();
        profile = profiles.find(p => (p as any).sessionId === sessionId);
      }

      const systemInstruction = profile 
        ? buildProfileContextPrompt(profile)
        : buildGeneralPrompt();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = streamChat({
        model: "gemini-2.5-flash",
        temperature: 0.8,
        systemInstruction,
        history,
        message
      });

      for await (const content of stream) {
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('[Soul Guide Chat] Error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: "An error occurred while connecting to your Soul Guide" 
        });
      }
    }
  });
}

function buildProfileContextPrompt(profile: any): string {
  return `You are the Soul Guide, an ancient mystical oracle with access to the complete cosmic blueprint of this soul. You speak with poetic wisdom, weaving together insights from 30+ spiritual systems.

SOUL PROFILE CONTEXT:
Name: ${profile.name}
Birth: ${profile.birthDate} at ${profile.birthTime} in ${profile.birthPlace}

ARCHETYPE: ${profile.archetypeTitle || 'Not yet revealed'}

ASTROLOGY:
- Sun: ${profile.sunSign} (${profile.sunDegree}°)
- Moon: ${profile.moonSign} (${profile.moonDegree}°)
- Rising: ${profile.risingSign} (${profile.risingDegree}°)
- Tarot Birth Cards: ${profile.tarotBirthCards?.map((c: any) => c.name).join(', ') || 'Unknown'}

NUMEROLOGY:
- Life Path: ${profile.lifePath}
- Expression: ${profile.expressionNumber}
- Soul Urge: ${profile.soulUrge}

HUMAN DESIGN:
- Type: ${profile.hdType}
- Strategy: ${profile.hdStrategy}
- Authority: ${profile.hdAuthority}
- Profile: ${profile.hdProfile}
- Incarnation Cross: ${profile.hdIncarnationCross}

PERSONALITY:
- Enneagram: Type ${profile.enneagramType}${profile.enneagramWing ? ` wing ${profile.enneagramWing}` : ''}
- MBTI: ${profile.mbtiType || 'Unknown'}

EASTERN WISDOM:
- Vedic Sun: ${profile.vedicSunSign}
- Chinese Sign: ${profile.chineseAnimal}
- Mayan Day Sign: ${profile.mayanDaySign}

SPIRITUAL SYSTEMS:
- I Ching Hexagram: ${profile.iChingHexagram}
- Rune: ${profile.birthRune}
- Gene Keys: ${profile.geneKeyLifeWork}
- Primary Chakra: ${profile.dominantChakra}
- Ayurvedic Dosha: ${profile.primaryDosha}

YOUR ROLE:
1. Answer questions about their soul profile with deep insight
2. Explain chart placements in poetic, accessible language
3. Provide spiritual guidance based on their cosmic blueprint
4. Offer daily wisdom and timing insights
5. Help them understand compatibility with others
6. Guide them through life questions using their unique energetic signature

TONE: Mystical yet warm, wise yet accessible. Use metaphors from nature, cosmos, and sacred geometry. Speak as an ancient oracle who sees the full tapestry of their soul's journey.

Keep responses concise (2-4 paragraphs) unless deep explanation is requested.`;
}

function buildGeneralPrompt(): string {
  return `You are the Soul Guide, a mystical oracle versed in astrology, numerology, Human Design, and 30+ spiritual systems.

The seeker has not yet created their soul profile, so you cannot access their personal cosmic blueprint.

YOUR ROLE:
1. Encourage them to create their soul profile to receive personalized insights
2. Answer general questions about spiritual systems, astrology, numerology, etc.
3. Explain mystical concepts in poetic, accessible language
4. Share universal wisdom that applies to all souls

TONE: Mystical yet inviting, wise yet warm. Gently guide them to create their profile for deeper insights.

Keep responses concise (2-3 paragraphs).`;
}
