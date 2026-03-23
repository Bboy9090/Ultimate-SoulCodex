/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - ENHANCED JOURNALING SYSTEM
 * 100+ Reflection Prompts for Deep Self-Discovery
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface JournalEntry {
  id: string;
  userId: string;
  profileId?: string;
  date: Date;
  prompt: JournalPrompt;
  response: string;
  tags: string[];
  mood?: string;
  energyLevel?: number; // 1-10
  transitContext?: {
    activeTransits: string[];
    dominantTheme: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPrompt {
  id: string;
  category: PromptCategory;
  title: string;
  question: string;
  description?: string;
  tags: string[];
  intensity: 'gentle' | 'moderate' | 'deep' | 'transformative';
  suggestedDuration?: number; // minutes
}

export type PromptCategory = 
  | 'daily-reflection'
  | 'shadow-work'
  | 'gratitude'
  | 'future-vision'
  | 'past-healing'
  | 'relationships'
  | 'purpose'
  | 'transits'
  | 'elemental'
  | 'archetype'
  | 'values'
  | 'growth';

// ─────────────────────────────────────────────────────────────────────────────
// 100+ REFLECTION PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Daily Reflection (15 prompts)
  {
    id: 'daily-001',
    category: 'daily-reflection',
    title: 'Morning Intention',
    question: 'What energy do I want to embody today? How can I align my actions with my highest self?',
    description: 'Set your intention for the day ahead',
    tags: ['intention', 'presence', 'alignment'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'daily-002',
    category: 'daily-reflection',
    title: 'Evening Integration',
    question: 'What did I learn about myself today? What patterns did I notice?',
    description: 'Reflect on the day\'s lessons',
    tags: ['integration', 'learning', 'patterns'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'daily-003',
    category: 'daily-reflection',
    title: 'Energy Check',
    question: 'Where is my energy flowing today? What drains me? What fills me?',
    tags: ['energy', 'balance', 'awareness'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'daily-004',
    category: 'daily-reflection',
    title: 'Presence Practice',
    question: 'What am I avoiding feeling right now? What would happen if I fully felt it?',
    tags: ['presence', 'emotions', 'avoidance'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'daily-005',
    category: 'daily-reflection',
    title: 'Boundary Reflection',
    question: 'Where did I say yes when I meant no today? Where did I honor my boundaries?',
    tags: ['boundaries', 'authenticity', 'self-respect'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'daily-006',
    category: 'daily-reflection',
    title: 'Inner Voice',
    question: 'What is my inner critic saying today? What would my inner advocate say instead?',
    tags: ['self-talk', 'compassion', 'inner-voice'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'daily-007',
    category: 'daily-reflection',
    title: 'Connection Check',
    question: 'Who did I connect with today? How did those connections feel?',
    tags: ['relationships', 'connection', 'presence'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'daily-008',
    category: 'daily-reflection',
    title: 'Creative Expression',
    question: 'How did I express myself today? What wants to be expressed that hasn\'t been?',
    tags: ['creativity', 'expression', 'authenticity'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'daily-009',
    category: 'daily-reflection',
    title: 'Body Wisdom',
    question: 'What is my body telling me today? What sensations am I noticing?',
    tags: ['body', 'somatics', 'awareness'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'daily-010',
    category: 'daily-reflection',
    title: 'Choice Awareness',
    question: 'What choices did I make today? Were they aligned with my values?',
    tags: ['choices', 'values', 'alignment'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'daily-011',
    category: 'daily-reflection',
    title: 'Resistance Exploration',
    question: 'What am I resisting right now? What would happen if I stopped resisting?',
    tags: ['resistance', 'surrender', 'acceptance'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'daily-012',
    category: 'daily-reflection',
    title: 'Gratitude Practice',
    question: 'What am I grateful for today that I haven\'t acknowledged?',
    tags: ['gratitude', 'appreciation', 'abundance'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'daily-013',
    category: 'daily-reflection',
    title: 'Trigger Awareness',
    question: 'What triggered me today? What old wound does this connect to?',
    tags: ['triggers', 'healing', 'awareness'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'daily-014',
    category: 'daily-reflection',
    title: 'Joy Moments',
    question: 'When did I feel most alive today? What made those moments special?',
    tags: ['joy', 'aliveness', 'presence'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'daily-015',
    category: 'daily-reflection',
    title: 'Evening Release',
    question: 'What do I need to release before I sleep? What can I let go of?',
    tags: ['release', 'letting-go', 'rest'],
    intensity: 'gentle',
    suggestedDuration: 5
  },

  // Shadow Work (20 prompts)
  {
    id: 'shadow-001',
    category: 'shadow-work',
    title: 'The Rejected Self',
    question: 'What parts of myself do I reject? Why? What would happen if I accepted them?',
    description: 'Explore the parts of yourself you\'ve disowned',
    tags: ['shadow', 'acceptance', 'integration'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-002',
    category: 'shadow-work',
    title: 'Projection Awareness',
    question: 'What do I judge in others that I refuse to see in myself?',
    tags: ['projection', 'judgment', 'self-awareness'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-003',
    category: 'shadow-work',
    title: 'Hidden Anger',
    question: 'Where am I holding anger that I haven\'t expressed? What is it protecting?',
    tags: ['anger', 'emotions', 'protection'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-004',
    category: 'shadow-work',
    title: 'The Mask',
    question: 'What mask do I wear? Who am I when no one is watching?',
    tags: ['authenticity', 'masks', 'identity'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-005',
    category: 'shadow-work',
    title: 'Shame Exploration',
    question: 'What am I ashamed of? Where did this shame come from? Is it mine?',
    tags: ['shame', 'healing', 'self-compassion'],
    intensity: 'transformative',
    suggestedDuration: 25
  },
  {
    id: 'shadow-006',
    category: 'shadow-work',
    title: 'The Inner Critic',
    question: 'What does my inner critic say? Whose voice is it really?',
    tags: ['inner-critic', 'self-talk', 'healing'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-007',
    category: 'shadow-work',
    title: 'Control Patterns',
    question: 'Where do I try to control things? What am I afraid will happen if I let go?',
    tags: ['control', 'fear', 'surrender'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-008',
    category: 'shadow-work',
    title: 'The Victim Story',
    question: 'What victim stories do I tell? How do they keep me stuck?',
    tags: ['victimhood', 'empowerment', 'narrative'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-009',
    category: 'shadow-work',
    title: 'Hidden Desires',
    question: 'What do I want that I\'m afraid to admit? Why?',
    tags: ['desires', 'fear', 'authenticity'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'shadow-010',
    category: 'shadow-work',
    title: 'The Perfectionist',
    question: 'Where does perfectionism show up? What is it protecting me from?',
    tags: ['perfectionism', 'vulnerability', 'acceptance'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-011',
    category: 'shadow-work',
    title: 'Abandonment Fears',
    question: 'What am I afraid of losing? How does this fear control my behavior?',
    tags: ['fear', 'abandonment', 'attachment'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-012',
    category: 'shadow-work',
    title: 'The People Pleaser',
    question: 'Where do I abandon myself to please others? What would happen if I stopped?',
    tags: ['people-pleasing', 'boundaries', 'self-love'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-013',
    category: 'shadow-work',
    title: 'Hidden Envy',
    question: 'What am I envious of? What does this reveal about what I want?',
    tags: ['envy', 'desires', 'self-awareness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'shadow-014',
    category: 'shadow-work',
    title: 'The Saboteur',
    question: 'How do I sabotage myself? What am I protecting myself from by staying small?',
    tags: ['self-sabotage', 'fear', 'growth'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-015',
    category: 'shadow-work',
    title: 'Unprocessed Grief',
    question: 'What losses have I not fully grieved? What needs to be mourned?',
    tags: ['grief', 'loss', 'healing'],
    intensity: 'transformative',
    suggestedDuration: 25
  },
  {
    id: 'shadow-016',
    category: 'shadow-work',
    title: 'The Martyr',
    question: 'Where do I play the martyr? How does this serve me?',
    tags: ['martyrdom', 'self-sacrifice', 'boundaries'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-017',
    category: 'shadow-work',
    title: 'Hidden Power',
    question: 'What power do I refuse to claim? Why am I afraid of my own power?',
    tags: ['power', 'fear', 'empowerment'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'shadow-018',
    category: 'shadow-work',
    title: 'The Imposter',
    question: 'Where do I feel like an imposter? What would it take to feel legitimate?',
    tags: ['imposter-syndrome', 'self-worth', 'acceptance'],
    intensity: 'deep',
    suggestedDuration: 15
  },
  {
    id: 'shadow-019',
    category: 'shadow-work',
    title: 'Unacknowledged Needs',
    question: 'What needs do I have that I refuse to acknowledge? Why?',
    tags: ['needs', 'self-care', 'vulnerability'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'shadow-020',
    category: 'shadow-work',
    title: 'Integration Practice',
    question: 'What shadow aspect am I ready to integrate? How can I welcome it home?',
    tags: ['integration', 'shadow', 'wholeness'],
    intensity: 'transformative',
    suggestedDuration: 20
  },

  // Gratitude (10 prompts)
  {
    id: 'gratitude-001',
    category: 'gratitude',
    title: 'Simple Gifts',
    question: 'What simple things am I grateful for today that I usually take for granted?',
    tags: ['gratitude', 'appreciation', 'presence'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'gratitude-002',
    category: 'gratitude',
    title: 'Challenge Gratitude',
    question: 'What challenge am I grateful for? What did it teach me?',
    tags: ['gratitude', 'challenges', 'growth'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-003',
    category: 'gratitude',
    title: 'People Gratitude',
    question: 'Who am I grateful for? How have they impacted my life?',
    tags: ['gratitude', 'relationships', 'connection'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-004',
    category: 'gratitude',
    title: 'Self Gratitude',
    question: 'What about myself am I grateful for? What strengths do I appreciate?',
    tags: ['gratitude', 'self-love', 'appreciation'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-005',
    category: 'gratitude',
    title: 'Body Gratitude',
    question: 'What about my body am I grateful for? How does it serve me?',
    tags: ['gratitude', 'body', 'appreciation'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-006',
    category: 'gratitude',
    title: 'Past Gratitude',
    question: 'What from my past am I grateful for? How did it shape me?',
    tags: ['gratitude', 'past', 'healing'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-007',
    category: 'gratitude',
    title: 'Present Moment',
    question: 'What about this exact moment am I grateful for?',
    tags: ['gratitude', 'presence', 'mindfulness'],
    intensity: 'gentle',
    suggestedDuration: 5
  },
  {
    id: 'gratitude-008',
    category: 'gratitude',
    title: 'Abundance Recognition',
    question: 'Where do I see abundance in my life? What am I blessed with?',
    tags: ['gratitude', 'abundance', 'appreciation'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-009',
    category: 'gratitude',
    title: 'Growth Gratitude',
    question: 'What growth am I grateful for? How have I changed?',
    tags: ['gratitude', 'growth', 'transformation'],
    intensity: 'moderate',
    suggestedDuration: 10
  },
  {
    id: 'gratitude-010',
    category: 'gratitude',
    title: 'Life Gratitude',
    question: 'What about being alive am I grateful for? What makes life precious?',
    tags: ['gratitude', 'life', 'meaning'],
    intensity: 'gentle',
    suggestedDuration: 10
  },

  // Future Vision (10 prompts)
  {
    id: 'future-001',
    category: 'future-vision',
    title: 'Five Years Forward',
    question: 'Where do I want to be in five years? What does that life look like?',
    tags: ['vision', 'future', 'goals'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'future-002',
    category: 'future-vision',
    title: 'Legacy Vision',
    question: 'What legacy do I want to leave? How do I want to be remembered?',
    tags: ['legacy', 'purpose', 'impact'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'future-003',
    category: 'future-vision',
    title: 'Ideal Day',
    question: 'What would my ideal day look like? What would I be doing?',
    tags: ['vision', 'lifestyle', 'dreams'],
    intensity: 'gentle',
    suggestedDuration: 15
  },
  {
    id: 'future-004',
    category: 'future-vision',
    title: 'Dream Life',
    question: 'If I had no limitations, what would my life look like?',
    tags: ['dreams', 'vision', 'possibility'],
    intensity: 'moderate',
    suggestedDuration: 20
  },
  {
    id: 'future-005',
    category: 'future-vision',
    title: 'Impact Vision',
    question: 'How do I want to impact the world? What change do I want to create?',
    tags: ['impact', 'purpose', 'contribution'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'future-006',
    category: 'future-vision',
    title: 'Relationship Vision',
    question: 'What do I want my relationships to look like? How do I want to show up?',
    tags: ['relationships', 'vision', 'connection'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'future-007',
    category: 'future-vision',
    title: 'Creative Vision',
    question: 'What do I want to create? What art, work, or expression wants to come through me?',
    tags: ['creativity', 'vision', 'expression'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'future-008',
    category: 'future-vision',
    title: 'Health Vision',
    question: 'What does optimal health look like for me? How do I want to feel?',
    tags: ['health', 'wellness', 'vision'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'future-009',
    category: 'future-vision',
    title: 'Financial Vision',
    question: 'What does financial freedom look like for me? How do I want to relate to money?',
    tags: ['money', 'abundance', 'vision'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'future-010',
    category: 'future-vision',
    title: 'Spiritual Vision',
    question: 'What does my spiritual path look like? How do I want to evolve?',
    tags: ['spirituality', 'growth', 'vision'],
    intensity: 'deep',
    suggestedDuration: 20
  },

  // Past Healing (10 prompts)
  {
    id: 'past-001',
    category: 'past-healing',
    title: 'Childhood Wound',
    question: 'What childhood wound still affects me? How can I heal it?',
    tags: ['healing', 'childhood', 'trauma'],
    intensity: 'transformative',
    suggestedDuration: 25
  },
  {
    id: 'past-002',
    category: 'past-healing',
    title: 'Forgiveness Practice',
    question: 'Who do I need to forgive? What would forgiveness look like?',
    tags: ['forgiveness', 'healing', 'release'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'past-003',
    category: 'past-healing',
    title: 'Self Forgiveness',
    question: 'What do I need to forgive myself for? How can I show myself compassion?',
    tags: ['forgiveness', 'self-compassion', 'healing'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'past-004',
    category: 'past-healing',
    title: 'Pattern Recognition',
    question: 'What patterns from my past keep repeating? What are they trying to teach me?',
    tags: ['patterns', 'awareness', 'healing'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'past-005',
    category: 'past-healing',
    title: 'Parental Healing',
    question: 'What do I need to heal with my parents? What can I release?',
    tags: ['healing', 'parents', 'family'],
    intensity: 'transformative',
    suggestedDuration: 25
  },
  {
    id: 'past-006',
    category: 'past-healing',
    title: 'Relationship Healing',
    question: 'What past relationship still affects me? What needs to be healed?',
    tags: ['healing', 'relationships', 'closure'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'past-007',
    category: 'past-healing',
    title: 'Regret Transformation',
    question: 'What do I regret? How can I transform this regret into wisdom?',
    tags: ['regret', 'healing', 'wisdom'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'past-008',
    category: 'past-healing',
    title: 'Trauma Integration',
    question: 'What trauma have I experienced? How can I integrate it into my story?',
    tags: ['trauma', 'healing', 'integration'],
    intensity: 'transformative',
    suggestedDuration: 30
  },
  {
    id: 'past-009',
    category: 'past-healing',
    title: 'Lost Dreams',
    question: 'What dreams did I let go of? Do any of them still call to me?',
    tags: ['dreams', 'healing', 'possibility'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'past-010',
    category: 'past-healing',
    title: 'Integration Practice',
    question: 'How can I honor my past while not being defined by it?',
    tags: ['integration', 'healing', 'freedom'],
    intensity: 'deep',
    suggestedDuration: 20
  },

  // Relationships (10 prompts)
  {
    id: 'relationships-001',
    category: 'relationships',
    title: 'Relationship Patterns',
    question: 'What patterns do I notice in my relationships? What am I learning?',
    tags: ['relationships', 'patterns', 'awareness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-002',
    category: 'relationships',
    title: 'Attachment Style',
    question: 'How do I attach in relationships? What does this reveal about my needs?',
    tags: ['relationships', 'attachment', 'needs'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'relationships-003',
    category: 'relationships',
    title: 'Boundaries in Love',
    question: 'Where do I need stronger boundaries in my relationships?',
    tags: ['relationships', 'boundaries', 'love'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-004',
    category: 'relationships',
    title: 'Communication Style',
    question: 'How do I communicate in relationships? What would I like to improve?',
    tags: ['relationships', 'communication', 'growth'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-005',
    category: 'relationships',
    title: 'Love Languages',
    question: 'How do I give and receive love? What do I need more of?',
    tags: ['relationships', 'love', 'needs'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-006',
    category: 'relationships',
    title: 'Conflict Resolution',
    question: 'How do I handle conflict? What would healthy conflict look like?',
    tags: ['relationships', 'conflict', 'communication'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-007',
    category: 'relationships',
    title: 'Intimacy Fears',
    question: 'What am I afraid of in intimacy? What would deeper connection require?',
    tags: ['relationships', 'intimacy', 'fear'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'relationships-008',
    category: 'relationships',
    title: 'Relationship Needs',
    question: 'What do I need in relationships that I\'m not getting? How can I ask for it?',
    tags: ['relationships', 'needs', 'communication'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'relationships-009',
    category: 'relationships',
    title: 'Codependency Patterns',
    question: 'Where do I lose myself in relationships? How can I maintain my identity?',
    tags: ['relationships', 'codependency', 'boundaries'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'relationships-010',
    category: 'relationships',
    title: 'Healthy Love',
    question: 'What does healthy love look like to me? How do I want to love and be loved?',
    tags: ['relationships', 'love', 'vision'],
    intensity: 'moderate',
    suggestedDuration: 15
  },

  // Purpose (10 prompts)
  {
    id: 'purpose-001',
    category: 'purpose',
    title: 'Soul Mission',
    question: 'What is my soul\'s mission? What am I here to do?',
    tags: ['purpose', 'mission', 'meaning'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-002',
    category: 'purpose',
    title: 'Unique Gifts',
    question: 'What are my unique gifts? How can I share them with the world?',
    tags: ['purpose', 'gifts', 'contribution'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'purpose-003',
    category: 'purpose',
    title: 'Impact Vision',
    question: 'How do I want to impact others? What change do I want to create?',
    tags: ['purpose', 'impact', 'contribution'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-004',
    category: 'purpose',
    title: 'Passion Exploration',
    question: 'What am I passionate about? How can I align my life with my passions?',
    tags: ['purpose', 'passion', 'alignment'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'purpose-005',
    category: 'purpose',
    title: 'Service Path',
    question: 'How do I want to serve? What problems do I want to solve?',
    tags: ['purpose', 'service', 'contribution'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-006',
    category: 'purpose',
    title: 'Work Alignment',
    question: 'Is my work aligned with my purpose? What would aligned work look like?',
    tags: ['purpose', 'work', 'alignment'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'purpose-007',
    category: 'purpose',
    title: 'Legacy Creation',
    question: 'What do I want to create that outlives me?',
    tags: ['purpose', 'legacy', 'creation'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-008',
    category: 'purpose',
    title: 'Calling Exploration',
    question: 'What is calling to me? What wants to be expressed through me?',
    tags: ['purpose', 'calling', 'expression'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-009',
    category: 'purpose',
    title: 'Meaning Making',
    question: 'What gives my life meaning? How can I deepen this?',
    tags: ['purpose', 'meaning', 'fulfillment'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'purpose-010',
    category: 'purpose',
    title: 'Purpose Integration',
    question: 'How can I live my purpose every day? What small steps can I take?',
    tags: ['purpose', 'action', 'integration'],
    intensity: 'moderate',
    suggestedDuration: 15
  },

  // Transits (10 prompts)
  {
    id: 'transits-001',
    category: 'transits',
    title: 'Current Energy',
    question: 'What energy am I experiencing from current transits? How is it affecting me?',
    tags: ['transits', 'energy', 'awareness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-002',
    category: 'transits',
    title: 'Transit Themes',
    question: 'What themes are showing up in my life right now? How do they connect to my transits?',
    tags: ['transits', 'themes', 'awareness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-003',
    category: 'transits',
    title: 'Transformation Opportunity',
    question: 'What transformation is this transit asking of me? How can I work with it?',
    tags: ['transits', 'transformation', 'growth'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'transits-004',
    category: 'transits',
    title: 'Resistance to Change',
    question: 'Where am I resisting the energy of this transit? What would surrender look like?',
    tags: ['transits', 'resistance', 'surrender'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-005',
    category: 'transits',
    title: 'Transit Lessons',
    question: 'What is this transit teaching me? What wisdom is it offering?',
    tags: ['transits', 'lessons', 'wisdom'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-006',
    category: 'transits',
    title: 'Challenging Transits',
    question: 'How am I navigating challenging transits? What support do I need?',
    tags: ['transits', 'challenges', 'support'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-007',
    category: 'transits',
    title: 'Expansive Transits',
    question: 'How can I maximize the energy of expansive transits? What opportunities are present?',
    tags: ['transits', 'expansion', 'opportunity'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-008',
    category: 'transits',
    title: 'Transit Patterns',
    question: 'What patterns do I notice in how transits affect me?',
    tags: ['transits', 'patterns', 'awareness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-009',
    category: 'transits',
    title: 'Integration Practice',
    question: 'How can I integrate the lessons from this transit into my life?',
    tags: ['transits', 'integration', 'growth'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'transits-010',
    category: 'transits',
    title: 'Transit Preparation',
    question: 'What upcoming transits am I aware of? How can I prepare?',
    tags: ['transits', 'preparation', 'awareness'],
    intensity: 'gentle',
    suggestedDuration: 10
  },

  // Elemental (5 prompts)
  {
    id: 'elemental-001',
    category: 'elemental',
    title: 'Elemental Balance',
    question: 'How is my elemental balance today? What element needs attention?',
    tags: ['elemental', 'balance', 'wellness'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'elemental-002',
    category: 'elemental',
    title: 'Elemental Needs',
    question: 'What does my primary element need right now? How can I honor it?',
    tags: ['elemental', 'needs', 'wellness'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'elemental-003',
    category: 'elemental',
    title: 'Elemental Imbalance',
    question: 'Where am I experiencing elemental imbalance? What would balance look like?',
    tags: ['elemental', 'balance', 'healing'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'elemental-004',
    category: 'elemental',
    title: 'Elemental Remedies',
    question: 'What elemental remedies am I practicing? How are they helping?',
    tags: ['elemental', 'remedies', 'wellness'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'elemental-005',
    category: 'elemental',
    title: 'Elemental Integration',
    question: 'How can I better integrate all five elements into my daily life?',
    tags: ['elemental', 'integration', 'wellness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },

  // Archetype (5 prompts)
  {
    id: 'archetype-001',
    category: 'archetype',
    title: 'Archetype Expression',
    question: 'How am I expressing my soul archetype today?',
    tags: ['archetype', 'expression', 'identity'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'archetype-002',
    category: 'archetype',
    title: 'Shadow Mode Awareness',
    question: 'Am I in shadow mode or power mode? What would shift me?',
    tags: ['archetype', 'shadow', 'power'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'archetype-003',
    category: 'archetype',
    title: 'Archetype Strengths',
    question: 'How am I using my archetype strengths? Where can I lean into them more?',
    tags: ['archetype', 'strengths', 'empowerment'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'archetype-004',
    category: 'archetype',
    title: 'Archetype Purpose',
    question: 'How am I living my archetype\'s purpose? What would deeper alignment look like?',
    tags: ['archetype', 'purpose', 'alignment'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'archetype-005',
    category: 'archetype',
    title: 'Archetype Integration',
    question: 'How can I better integrate all aspects of my archetype?',
    tags: ['archetype', 'integration', 'wholeness'],
    intensity: 'moderate',
    suggestedDuration: 15
  },

  // Values (5 prompts)
  {
    id: 'values-001',
    category: 'values',
    title: 'Core Values Check',
    question: 'What are my core values? How am I living them today?',
    tags: ['values', 'alignment', 'authenticity'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'values-002',
    category: 'values',
    title: 'Values Conflict',
    question: 'Where are my actions not aligned with my values? What needs to change?',
    tags: ['values', 'alignment', 'integrity'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'values-003',
    category: 'values',
    title: 'Values Evolution',
    question: 'How have my values evolved? What new values are emerging?',
    tags: ['values', 'growth', 'evolution'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'values-004',
    category: 'values',
    title: 'Values in Relationships',
    question: 'How do my values show up in my relationships? Are they respected?',
    tags: ['values', 'relationships', 'boundaries'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'values-005',
    category: 'values',
    title: 'Values Integration',
    question: 'How can I better live my values every day?',
    tags: ['values', 'integration', 'authenticity'],
    intensity: 'moderate',
    suggestedDuration: 15
  },

  // Growth (5 prompts)
  {
    id: 'growth-001',
    category: 'growth',
    title: 'Growth Edge',
    question: 'What is my current growth edge? What am I being asked to expand into?',
    tags: ['growth', 'expansion', 'challenge'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'growth-002',
    category: 'growth',
    title: 'Comfort Zone',
    question: 'What am I staying in my comfort zone to avoid? What would growth require?',
    tags: ['growth', 'comfort-zone', 'courage'],
    intensity: 'moderate',
    suggestedDuration: 15
  },
  {
    id: 'growth-003',
    category: 'growth',
    title: 'Growth Resistance',
    question: 'Where am I resisting growth? What am I afraid of?',
    tags: ['growth', 'resistance', 'fear'],
    intensity: 'deep',
    suggestedDuration: 20
  },
  {
    id: 'growth-004',
    category: 'growth',
    title: 'Growth Celebration',
    question: 'What growth have I experienced recently? How can I celebrate it?',
    tags: ['growth', 'celebration', 'acknowledgment'],
    intensity: 'gentle',
    suggestedDuration: 10
  },
  {
    id: 'growth-005',
    category: 'growth',
    title: 'Next Level',
    question: 'What would the next level of my growth look like? What would it require?',
    tags: ['growth', 'vision', 'expansion'],
    intensity: 'moderate',
    suggestedDuration: 15
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT SELECTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a random prompt from a specific category
 */
export function getPromptByCategory(category: PromptCategory): JournalPrompt {
  const categoryPrompts = JOURNAL_PROMPTS.filter(p => p.category === category);
  return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
}

/**
 * Get a random prompt matching intensity level
 */
export function getPromptByIntensity(intensity: JournalPrompt['intensity']): JournalPrompt {
  const intensityPrompts = JOURNAL_PROMPTS.filter(p => p.intensity === intensity);
  return intensityPrompts[Math.floor(Math.random() * intensityPrompts.length)];
}

/**
 * Get a prompt based on current transits
 */
export function getTransitPrompt(activeTransits: string[]): JournalPrompt {
  // If there are significant transits, use transit prompts
  if (activeTransits.length > 0) {
    return getPromptByCategory('transits');
  }
  // Otherwise return a daily reflection
  return getPromptByCategory('daily-reflection');
}

/**
 * Get a prompt based on mood/energy
 */
export function getMoodBasedPrompt(mood?: string, energyLevel?: number): JournalPrompt {
  if (energyLevel !== undefined) {
    if (energyLevel <= 3) {
      return getPromptByIntensity('gentle');
    } else if (energyLevel <= 6) {
      return getPromptByIntensity('moderate');
    } else {
      return getPromptByIntensity('deep');
    }
  }
  
  // Default to daily reflection
  return getPromptByCategory('daily-reflection');
}

/**
 * Get all prompts in a category
 */
export function getPromptsByCategory(category: PromptCategory): JournalPrompt[] {
  return JOURNAL_PROMPTS.filter(p => p.category === category);
}

/**
 * Get all prompts
 */
export function getAllPrompts(): JournalPrompt[] {
  return JOURNAL_PROMPTS;
}

/**
 * Get prompt by ID
 */
export function getPromptById(id: string): JournalPrompt | undefined {
  return JOURNAL_PROMPTS.find(p => p.id === id);
}

export default {
  JOURNAL_PROMPTS,
  getPromptByCategory,
  getPromptByIntensity,
  getTransitPrompt,
  getMoodBasedPrompt,
  getPromptsByCategory,
  getAllPrompts,
  getPromptById
};
