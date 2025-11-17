// Comprehensive Astrological Interpretation Library
// Provides detailed mystical explanations for all astrological elements

interface PlanetSignInterpretation {
  [planet: string]: {
    [sign: string]: {
      title: string;
      description: string;
      keywords: string[];
      spiritualMeaning: string;
    };
  };
}

interface HouseInterpretation {
  [house: number]: {
    title: string;
    description: string;
    themes: string[];
    spiritualFocus: string;
  };
}

interface PlanetMeaning {
  [planet: string]: {
    title: string;
    governs: string;
    spiritualRole: string;
    keywords: string[];
  };
}

// Core meanings of each planet
export const PLANET_MEANINGS: PlanetMeaning = {
  sun: {
    title: "The Soul's Essence",
    governs: "Core identity, life purpose, ego, vitality",
    spiritualRole: "Your divine spark and authentic self-expression",
    keywords: ["identity", "purpose", "vitality", "consciousness", "will"]
  },
  moon: {
    title: "The Emotional Soul",
    governs: "Emotions, intuition, subconscious, inner world",
    spiritualRole: "Your emotional wisdom and intuitive guidance",
    keywords: ["intuition", "emotions", "nurturing", "receptivity", "cycles"]
  },
  mercury: {
    title: "The Divine Messenger",
    governs: "Communication, thinking, learning, perception",
    spiritualRole: "How you process and share divine wisdom",
    keywords: ["communication", "intellect", "curiosity", "versatility", "connection"]
  },
  venus: {
    title: "The Love Goddess",
    governs: "Love, beauty, values, relationships, creativity",
    spiritualRole: "Your capacity for love and attraction to beauty",
    keywords: ["love", "beauty", "harmony", "values", "magnetism"]
  },
  mars: {
    title: "The Sacred Warrior",
    governs: "Action, drive, passion, courage, assertiveness",
    spiritualRole: "Your divine will in action and spiritual warrior energy",
    keywords: ["action", "courage", "passion", "drive", "assertion"]
  },
  jupiter: {
    title: "The Great Benefic",
    governs: "Expansion, wisdom, growth, philosophy, abundance",
    spiritualRole: "Your connection to higher wisdom and spiritual growth",
    keywords: ["expansion", "wisdom", "abundance", "optimism", "teaching"]
  },
  saturn: {
    title: "The Divine Teacher",
    governs: "Structure, discipline, karma, lessons, mastery",
    spiritualRole: "Your karmic lessons and path to spiritual mastery",
    keywords: ["discipline", "responsibility", "mastery", "karma", "wisdom"]
  },
  uranus: {
    title: "The Revolutionary",
    governs: "Innovation, freedom, rebellion, awakening, originality",
    spiritualRole: "Your unique contribution to collective evolution",
    keywords: ["innovation", "freedom", "rebellion", "awakening", "uniqueness"]
  },
  neptune: {
    title: "The Mystic",
    governs: "Spirituality, dreams, illusion, compassion, transcendence",
    spiritualRole: "Your connection to the divine and transcendent realms",
    keywords: ["spirituality", "intuition", "compassion", "transcendence", "dreams"]
  },
  pluto: {
    title: "The Transformer",
    governs: "Transformation, death/rebirth, power, regeneration",
    spiritualRole: "Your soul's deepest transformational journey",
    keywords: ["transformation", "rebirth", "power", "depth", "regeneration"]
  }
};

// Meanings of the 12 astrological houses
export const HOUSE_MEANINGS: HouseInterpretation = {
  1: {
    title: "House of Self",
    description: "Your identity, appearance, first impressions, and how you approach life",
    themes: ["identity", "appearance", "first impressions", "new beginnings"],
    spiritualFocus: "Your soul's primary expression in this incarnation"
  },
  2: {
    title: "House of Values & Resources", 
    description: "Your relationship with money, possessions, self-worth, and material resources",
    themes: ["money", "possessions", "self-worth", "resources", "talents"],
    spiritualFocus: "Learning to value your divine gifts and manifest abundance"
  },
  3: {
    title: "House of Communication",
    description: "How you communicate, learn, think, and connect with your immediate environment",
    themes: ["communication", "learning", "siblings", "short trips", "everyday life"],
    spiritualFocus: "Sharing your truth and connecting with your community"
  },
  4: {
    title: "House of Home & Roots",
    description: "Your family, home, emotional foundation, and connection to your ancestral lineage",
    themes: ["family", "home", "emotions", "ancestry", "security"],
    spiritualFocus: "Healing your emotional foundation and family karma"
  },
  5: {
    title: "House of Creative Expression",
    description: "Your creativity, romance, children, joy, and self-expression",
    themes: ["creativity", "romance", "children", "pleasure", "self-expression"],
    spiritualFocus: "Expressing your divine creativity and experiencing joy"
  },
  6: {
    title: "House of Service & Health",
    description: "Your daily routines, work, health, service to others, and self-improvement",
    themes: ["work", "health", "service", "daily routines", "improvement"],
    spiritualFocus: "Serving others and maintaining your physical temple"
  },
  7: {
    title: "House of Partnerships",
    description: "Your relationships, marriage, partnerships, and how you relate to others",
    themes: ["relationships", "marriage", "partnerships", "cooperation", "balance"],
    spiritualFocus: "Learning through relationships and finding your divine complement"
  },
  8: {
    title: "House of Transformation",
    description: "Shared resources, transformation, death/rebirth, occult knowledge, sexuality",
    themes: ["transformation", "shared resources", "sexuality", "occult", "rebirth"],
    spiritualFocus: "Deep soul transformation and merging with the divine"
  },
  9: {
    title: "House of Higher Wisdom",
    description: "Philosophy, higher education, travel, spirituality, and quest for meaning",
    themes: ["philosophy", "higher learning", "travel", "spirituality", "meaning"],
    spiritualFocus: "Expanding your consciousness and seeking higher truth"
  },
  10: {
    title: "House of Career & Reputation",
    description: "Your career, public image, reputation, authority, and life direction",
    themes: ["career", "reputation", "authority", "achievement", "direction"],
    spiritualFocus: "Fulfilling your soul's mission in the world"
  },
  11: {
    title: "House of Community & Dreams",
    description: "Friends, groups, hopes, dreams, humanitarian causes, and collective consciousness",
    themes: ["friends", "groups", "hopes", "dreams", "community", "ideals"],
    spiritualFocus: "Contributing to collective evolution and manifesting your vision"
  },
  12: {
    title: "House of Spirituality & Release",
    description: "Spirituality, subconscious, karma, hidden things, and connection to the divine",
    themes: ["spirituality", "subconscious", "karma", "sacrifice", "transcendence"],
    spiritualFocus: "Surrendering to divine will and completing karmic cycles"
  }
};

// Planet in Sign interpretations (Sun through Pluto in all 12 signs)
export const PLANET_SIGN_INTERPRETATIONS: PlanetSignInterpretation = {
  sun: {
    "Aries": {
      title: "The Pioneering Spirit",
      description: "You are a natural leader with fierce independence and pioneering spirit. Your soul purpose involves initiating new ventures and inspiring others to take action.",
      keywords: ["leadership", "independence", "courage", "initiative"],
      spiritualMeaning: "Your divine essence expresses through bold action and fearless self-assertion. You're here to lead others into new territories of consciousness."
    },
    "Taurus": {
      title: "The Sacred Builder", 
      description: "You have a steady, grounded approach to life with deep appreciation for beauty and comfort. Your purpose involves creating lasting value and stability.",
      keywords: ["stability", "beauty", "persistence", "sensuality"],
      spiritualMeaning: "Your soul expresses through creating beauty and stability in the material world. You teach others the value of patience and appreciation."
    },
    "Gemini": {
      title: "The Divine Communicator",
      description: "You are curious, adaptable, and gifted with words. Your purpose involves connecting people through communication and sharing knowledge.",
      keywords: ["communication", "curiosity", "adaptability", "connection"],
      spiritualMeaning: "Your essence shines through intellectual exploration and connecting diverse ideas. You bridge different worlds through communication."
    },
    "Cancer": {
      title: "The Emotional Healer",
      description: "You are deeply intuitive and nurturing with strong emotional intelligence. Your purpose involves healing and caring for others.",
      keywords: ["nurturing", "intuition", "protection", "emotion"],
      spiritualMeaning: "Your soul expresses through emotional healing and creating safe spaces for others. You embody the divine feminine principle of nurturing."
    },
    "Leo": {
      title: "The Radiant Creator",
      description: "You are naturally dramatic, creative, and generous with a need to shine and express yourself. Your purpose involves inspiring joy and creativity.",
      keywords: ["creativity", "generosity", "drama", "leadership"],
      spiritualMeaning: "Your divine essence radiates joy and creative power. You're here to remind others of their own inner light and creative potential."
    },
    "Virgo": {
      title: "The Sacred Perfectionist",
      description: "You are detail-oriented, helpful, and dedicated to improvement. Your purpose involves healing and serving others through practical wisdom.",
      keywords: ["service", "perfection", "healing", "analysis"],
      spiritualMeaning: "Your soul expresses through dedicated service and healing. You refine and purify whatever you touch, bringing divine order to chaos."
    },
    "Libra": {
      title: "The Harmony Keeper",
      description: "You seek balance, beauty, and fairness in all things. Your purpose involves creating harmony and teaching others about cooperation.",
      keywords: ["balance", "beauty", "cooperation", "justice"],
      spiritualMeaning: "Your essence manifests through creating beauty and balance. You're a divine diplomat, teaching others the art of harmonious relationships."
    },
    "Scorpio": {
      title: "The Soul Alchemist",
      description: "You are intense, transformative, and drawn to life's mysteries. Your purpose involves deep psychological healing and transformation.",
      keywords: ["transformation", "intensity", "mystery", "regeneration"],
      spiritualMeaning: "Your soul expresses through profound transformation and rebirth. You guide others through their darkest moments into the light."
    },
    "Sagittarius": {
      title: "The Wisdom Seeker",
      description: "You are adventurous, philosophical, and always seeking truth. Your purpose involves expanding consciousness and sharing wisdom.",
      keywords: ["adventure", "wisdom", "truth", "expansion"],
      spiritualMeaning: "Your divine essence seeks ultimate truth and meaning. You're here to expand horizons and teach others about higher possibilities."
    },
    "Capricorn": {
      title: "The Spiritual Authority",
      description: "You are ambitious, responsible, and naturally authoritative. Your purpose involves building lasting structures and achieving mastery.",
      keywords: ["authority", "mastery", "responsibility", "achievement"],
      spiritualMeaning: "Your soul expresses through disciplined achievement and responsible leadership. You build bridges between earth and heaven."
    },
    "Aquarius": {
      title: "The Revolutionary Visionary",
      description: "You are innovative, humanitarian, and ahead of your time. Your purpose involves bringing revolutionary change for humanity's benefit.",
      keywords: ["innovation", "humanity", "revolution", "vision"],
      spiritualMeaning: "Your essence channels future possibilities and collective evolution. You're here to awaken humanity to new ways of being."
    },
    "Pisces": {
      title: "The Mystical Dreamer",
      description: "You are compassionate, intuitive, and deeply spiritual. Your purpose involves healing through love and connecting others to the divine.",
      keywords: ["compassion", "spirituality", "intuition", "healing"],
      spiritualMeaning: "Your soul expresses through boundless compassion and spiritual wisdom. You dissolve boundaries and remind others of universal love."
    }
  },
  moon: {
    "Aries": {
      title: "The Fiery Heart",
      description: "Your emotions are intense and immediate. You need freedom and independence to feel emotionally secure.",
      keywords: ["impulsive", "independent", "passionate", "direct"],
      spiritualMeaning: "Your emotional nature is pioneering and fearless. You process feelings through action and need emotional freedom to thrive."
    },
    "Taurus": {
      title: "The Grounded Heart",
      description: "You seek emotional stability and comfort. Security through material comfort and routine brings you peace.",
      keywords: ["stable", "comfort", "sensual", "patient"],
      spiritualMeaning: "Your emotional security comes from earthly pleasures and stability. You offer others a sense of calm and groundedness."
    },
    "Gemini": {
      title: "The Curious Heart",
      description: "Your emotions are changeable and you need mental stimulation. Communication helps you process feelings.",
      keywords: ["changeable", "curious", "communicative", "restless"],
      spiritualMeaning: "Your emotional nature seeks variety and intellectual connection. You process feelings through words and need mental stimulation."
    },
    "Cancer": {
      title: "The Intuitive Heart",
      description: "You are deeply emotional and intuitive. Home and family are essential for your emotional well-being.",
      keywords: ["nurturing", "intuitive", "protective", "sensitive"],
      spiritualMeaning: "Your emotional nature is deeply intuitive and caring. You feel the emotions of others and offer profound emotional healing."
    },
    "Leo": {
      title: "The Dramatic Heart",
      description: "You need appreciation and recognition to feel emotionally fulfilled. Your feelings are warm and generous.",
      keywords: ["generous", "dramatic", "warm", "proud"],
      spiritualMeaning: "Your emotional nature radiates warmth and seeks creative expression. You need to feel special and appreciated."
    },
    "Virgo": {
      title: "The Analytical Heart",
      description: "You process emotions through analysis and service. Order and usefulness bring emotional satisfaction.",
      keywords: ["analytical", "helpful", "practical", "perfectionist"],
      spiritualMeaning: "Your emotional security comes through serving others and creating order. You heal emotions through practical action."
    },
    "Libra": {
      title: "The Harmonious Heart",
      description: "You need beauty and harmony for emotional balance. Relationships are crucial to your emotional well-being.",
      keywords: ["harmonious", "cooperative", "aesthetic", "peaceful"],
      spiritualMeaning: "Your emotional nature seeks balance and beauty. You feel most secure in harmonious relationships and beautiful environments."
    },
    "Scorpio": {
      title: "The Intense Heart",
      description: "Your emotions run deep and you need emotional intimacy. You're drawn to emotional transformation and healing.",
      keywords: ["intense", "transformative", "secretive", "powerful"],
      spiritualMeaning: "Your emotional nature is profound and transformative. You feel deeply and have the power to heal emotional wounds."
    },
    "Sagittarius": {
      title: "The Adventurous Heart",
      description: "You need freedom and adventure for emotional satisfaction. Optimism and expansion feed your soul.",
      keywords: ["adventurous", "optimistic", "philosophical", "free"],
      spiritualMeaning: "Your emotional nature seeks meaning and adventure. You feel most secure when exploring new horizons and possibilities."
    },
    "Capricorn": {
      title: "The Responsible Heart",
      description: "You need structure and achievement for emotional security. Responsibility and tradition comfort you.",
      keywords: ["responsible", "ambitious", "traditional", "reserved"],
      spiritualMeaning: "Your emotional security comes through achievement and structure. You feel most comfortable with clear goals and traditions."
    },
    "Aquarius": {
      title: "The Rebellious Heart",
      description: "You need independence and intellectual stimulation. Group activities and humanitarian causes fulfill you emotionally.",
      keywords: ["independent", "humanitarian", "unconventional", "detached"],
      spiritualMeaning: "Your emotional nature is unique and humanitarian. You feel secure when contributing to collective progress and maintaining independence."
    },
    "Pisces": {
      title: "The Mystical Heart",
      description: "You are highly sensitive and intuitive. Spiritual connection and creative expression are emotionally essential.",
      keywords: ["sensitive", "intuitive", "creative", "compassionate"],
      spiritualMeaning: "Your emotional nature is deeply spiritual and compassionate. You feel others' emotions as your own and need spiritual connection."
    }
  },
  mercury: {
    "Aries": {
      title: "The Quick Thinker",
      description: "You think and speak quickly with direct, assertive communication. Your mind works at lightning speed.",
      keywords: ["quick", "direct", "assertive", "pioneering"],
      spiritualMeaning: "Your mental energy is pioneering and bold. You think independently and communicate with courage."
    },
    "Taurus": {
      title: "The Practical Mind",
      description: "You think methodically and speak with deliberation. Your mental focus is on practical, tangible results.",
      keywords: ["practical", "methodical", "deliberate", "persistent"],
      spiritualMeaning: "Your mind seeks practical wisdom and enduring truth. You think in terms of real-world application."
    },
    "Gemini": {
      title: "The Versatile Communicator",
      description: "You are naturally gifted with words and quick to learn. Your mind thrives on variety and connection.",
      keywords: ["versatile", "quick", "curious", "adaptable"],
      spiritualMeaning: "Your mental gifts involve connecting ideas and people. You're a natural bridge between different worlds."
    },
    "Cancer": {
      title: "The Intuitive Mind",
      description: "You think with your heart and communicate with sensitivity. Your memory for emotional details is exceptional.",
      keywords: ["intuitive", "sensitive", "caring", "protective"],
      spiritualMeaning: "Your mind processes through emotional intelligence. You think in terms of care and protection."
    },
    "Leo": {
      title: "The Creative Communicator",
      description: "You think dramatically and speak with flair. Your mind is naturally creative and expressive.",
      keywords: ["dramatic", "creative", "expressive", "confident"],
      spiritualMeaning: "Your mental energy is creative and generous. You think in terms of inspiration and self-expression."
    },
    "Virgo": {
      title: "The Analytical Mind",
      description: "You think precisely and communicate with attention to detail. Your mind seeks perfection and practical solutions.",
      keywords: ["analytical", "precise", "helpful", "perfectionist"],
      spiritualMeaning: "Your mental gifts involve healing and service. You think in terms of improvement and refinement."
    },
    "Libra": {
      title: "The Harmonious Mind",
      description: "You think in terms of balance and communicate diplomatically. Your mind seeks fairness and beauty.",
      keywords: ["balanced", "diplomatic", "fair", "aesthetic"],
      spiritualMeaning: "Your mental energy creates harmony and beauty. You think in terms of cooperation and balance."
    },
    "Scorpio": {
      title: "The Penetrating Mind",
      description: "You think deeply and communicate with intensity. Your mind penetrates to the core of any matter.",
      keywords: ["deep", "intense", "penetrating", "transformative"],
      spiritualMeaning: "Your mental energy is transformative and healing. You think in terms of depth and hidden truth."
    },
    "Sagittarius": {
      title: "The Philosophical Mind",
      description: "You think broadly and communicate with enthusiasm. Your mind seeks meaning and higher truth.",
      keywords: ["broad", "enthusiastic", "philosophical", "adventurous"],
      spiritualMeaning: "Your mental energy expands consciousness. You think in terms of meaning and possibility."
    },
    "Capricorn": {
      title: "The Strategic Mind",
      description: "You think strategically and communicate with authority. Your mind is naturally organized and goal-oriented.",
      keywords: ["strategic", "authoritative", "organized", "ambitious"],
      spiritualMeaning: "Your mental energy builds lasting structures. You think in terms of achievement and responsibility."
    },
    "Aquarius": {
      title: "The Innovative Mind",
      description: "You think originally and communicate unconventionally. Your mind is ahead of its time.",
      keywords: ["original", "unconventional", "innovative", "humanitarian"],
      spiritualMeaning: "Your mental energy brings revolutionary insights. You think in terms of collective progress."
    },
    "Pisces": {
      title: "The Mystical Mind",
      description: "You think intuitively and communicate with compassion. Your mind is naturally psychic and artistic.",
      keywords: ["intuitive", "compassionate", "psychic", "artistic"],
      spiritualMeaning: "Your mental energy is deeply spiritual. You think in terms of universal love and transcendence."
    }
  },
  venus: {
    "Aries": {
      title: "The Passionate Lover",
      description: "You love boldly and value independence. Your attractions are immediate and intense.",
      keywords: ["passionate", "bold", "independent", "direct"],
      spiritualMeaning: "You express love through courage and passion. Your heart seeks adventure and excitement."
    },
    "Taurus": {
      title: "The Sensual Lover",
      description: "You love deeply and value stability. Your attractions are based on sensuality and security.",
      keywords: ["sensual", "stable", "loyal", "beautiful"],
      spiritualMeaning: "You express love through physical presence and material comfort. Your heart seeks lasting beauty."
    },
    "Gemini": {
      title: "The Playful Lover",
      description: "You love through communication and value mental connection. Your attractions are based on wit and variety.",
      keywords: ["playful", "communicative", "versatile", "curious"],
      spiritualMeaning: "You express love through words and ideas. Your heart seeks intellectual stimulation and variety."
    },
    "Cancer": {
      title: "The Nurturing Lover",
      description: "You love protectively and value emotional security. Your attractions are based on care and comfort.",
      keywords: ["nurturing", "protective", "emotional", "caring"],
      spiritualMeaning: "You express love through emotional care and nurturing. Your heart seeks deep emotional connection."
    },
    "Leo": {
      title: "The Dramatic Lover",
      description: "You love generously and value appreciation. Your attractions are based on admiration and creativity.",
      keywords: ["generous", "dramatic", "creative", "loyal"],
      spiritualMeaning: "You express love through grand gestures and creativity. Your heart seeks appreciation and admiration."
    },
    "Virgo": {
      title: "The Devoted Lover",
      description: "You love through service and value practical devotion. Your attractions are based on reliability and care.",
      keywords: ["devoted", "practical", "helpful", "pure"],
      spiritualMeaning: "You express love through acts of service and practical care. Your heart seeks genuine devotion."
    },
    "Libra": {
      title: "The Harmonious Lover",
      description: "You love through partnership and value balance. Your attractions are based on beauty and compatibility.",
      keywords: ["harmonious", "balanced", "romantic", "cooperative"],
      spiritualMeaning: "You express love through creating harmony and beauty. Your heart seeks perfect partnership."
    },
    "Scorpio": {
      title: "The Intense Lover",
      description: "You love deeply and value transformation. Your attractions are based on soul connection and mystery.",
      keywords: ["intense", "passionate", "loyal", "transformative"],
      spiritualMeaning: "You express love through deep soul connection. Your heart seeks complete emotional fusion."
    },
    "Sagittarius": {
      title: "The Adventurous Lover",
      description: "You love freely and value growth. Your attractions are based on shared ideals and adventure.",
      keywords: ["adventurous", "free", "optimistic", "philosophical"],
      spiritualMeaning: "You express love through shared adventures and growth. Your heart seeks freedom and expansion."
    },
    "Capricorn": {
      title: "The Committed Lover",
      description: "You love seriously and value commitment. Your attractions are based on respect and shared goals.",
      keywords: ["committed", "serious", "responsible", "traditional"],
      spiritualMeaning: "You express love through commitment and building together. Your heart seeks lasting partnership."
    },
    "Aquarius": {
      title: "The Unique Lover",
      description: "You love unconventionally and value friendship. Your attractions are based on intellectual connection and shared ideals.",
      keywords: ["unique", "friendly", "independent", "humanitarian"],
      spiritualMeaning: "You express love through friendship and shared vision. Your heart seeks intellectual and spiritual connection."
    },
    "Pisces": {
      title: "The Compassionate Lover",
      description: "You love unconditionally and value spiritual connection. Your attractions are based on soul recognition.",
      keywords: ["compassionate", "spiritual", "romantic", "intuitive"],
      spiritualMeaning: "You express love through boundless compassion. Your heart seeks divine love and spiritual union."
    }
  },
  mars: {
    "Aries": {
      title: "The Fearless Warrior",
      description: "You act with courage and directness. Your energy is pioneering and you lead from the front.",
      keywords: ["courageous", "direct", "pioneering", "competitive"],
      spiritualMeaning: "Your warrior energy is pure and fearless. You act on divine impulse and inspire others to be brave."
    },
    "Taurus": {
      title: "The Steady Warrior",
      description: "You act with persistence and determination. Your energy is steady and you build through consistent effort.",
      keywords: ["persistent", "determined", "steady", "practical"],
      spiritualMeaning: "Your warrior energy is grounded and enduring. You fight for security and lasting value."
    },
    "Gemini": {
      title: "The Quick Warrior",
      description: "You act through communication and adaptability. Your energy is versatile and mentally agile.",
      keywords: ["adaptable", "quick", "communicative", "versatile"],
      spiritualMeaning: "Your warrior energy is mental and communicative. You fight with words and ideas."
    },
    "Cancer": {
      title: "The Protective Warrior",
      description: "You act to protect and nurture. Your energy is emotional and you fight for family and security.",
      keywords: ["protective", "emotional", "nurturing", "defensive"],
      spiritualMeaning: "Your warrior energy protects the vulnerable. You fight for emotional security and family."
    },
    "Leo": {
      title: "The Noble Warrior",
      description: "You act with pride and creativity. Your energy is dramatic and you fight for recognition and self-expression.",
      keywords: ["proud", "creative", "dramatic", "generous"],
      spiritualMeaning: "Your warrior energy is noble and creative. You fight for self-expression and inspire others."
    },
    "Virgo": {
      title: "The Precise Warrior",
      description: "You act with precision and dedication. Your energy is focused on improvement and service.",
      keywords: ["precise", "dedicated", "helpful", "analytical"],
      spiritualMeaning: "Your warrior energy serves and heals. You fight for perfection and practical improvement."
    },
    "Libra": {
      title: "The Diplomatic Warrior",
      description: "You act through cooperation and balance. Your energy seeks harmony and fights for justice.",
      keywords: ["diplomatic", "balanced", "cooperative", "just"],
      spiritualMeaning: "Your warrior energy creates harmony. You fight for justice and balanced relationships."
    },
    "Scorpio": {
      title: "The Transformative Warrior",
      description: "You act with intensity and depth. Your energy is transformative and you fight for profound change.",
      keywords: ["intense", "transformative", "powerful", "regenerative"],
      spiritualMeaning: "Your warrior energy transforms and regenerates. You fight for deep psychological healing."
    },
    "Sagittarius": {
      title: "The Adventurous Warrior",
      description: "You act with enthusiasm and vision. Your energy seeks expansion and you fight for truth and freedom.",
      keywords: ["enthusiastic", "adventurous", "philosophical", "free"],
      spiritualMeaning: "Your warrior energy expands consciousness. You fight for truth and spiritual freedom."
    },
    "Capricorn": {
      title: "The Disciplined Warrior",
      description: "You act with discipline and ambition. Your energy is strategic and you fight for achievement and authority.",
      keywords: ["disciplined", "ambitious", "strategic", "authoritative"],
      spiritualMeaning: "Your warrior energy builds lasting structures. You fight for achievement and responsible leadership."
    },
    "Aquarius": {
      title: "The Revolutionary Warrior",
      description: "You act for humanitarian causes. Your energy is innovative and you fight for collective progress.",
      keywords: ["innovative", "humanitarian", "rebellious", "visionary"],
      spiritualMeaning: "Your warrior energy serves humanity. You fight for collective evolution and freedom."
    },
    "Pisces": {
      title: "The Spiritual Warrior",
      description: "You act with compassion and intuition. Your energy is flowing and you fight for spiritual ideals.",
      keywords: ["compassionate", "intuitive", "spiritual", "sacrificial"],
      spiritualMeaning: "Your warrior energy is compassionate and spiritual. You fight for universal love and transcendence."
    }
  },
  
  jupiter: {
    "Aries": {
      title: "The Courageous Expander",
      description: "You grow through bold action and pioneering ventures. Your faith is expressed through courage and initiative, and you expand by taking risks.",
      keywords: ["adventurous", "bold", "pioneering", "optimistic"],
      spiritualMeaning: "Spiritual Lesson: Trust in divine timing for your bold visions. Your Gift: Inspiring others to take courageous leaps of faith and believe in themselves."
    },
    "Taurus": {
      title: "The Abundant Builder",
      description: "You grow through creating stability and appreciating beauty. Your wisdom comes through patience and building lasting value.",
      keywords: ["prosperous", "patient", "grounded", "appreciative"],
      spiritualMeaning: "Spiritual Lesson: Understanding that true abundance flows from gratitude and appreciation. Your Gift: Manifesting material and spiritual wealth through steady faith."
    },
    "Gemini": {
      title: "The Curious Philosopher",
      description: "You grow through learning, communication, and connecting ideas. Your wisdom expands through diverse knowledge and sharing insights.",
      keywords: ["curious", "communicative", "versatile", "intellectual"],
      spiritualMeaning: "Spiritual Lesson: Finding profound truth in everyday conversations and simple observations. Your Gift: Translating complex wisdom into accessible knowledge for all."
    },
    "Cancer": {
      title: "The Nurturing Sage",
      description: "You grow through emotional connection and creating safe spaces. Your faith is expressed through caring for others and honoring feelings.",
      keywords: ["nurturing", "protective", "intuitive", "generous"],
      spiritualMeaning: "Spiritual Lesson: Learning that emotional vulnerability is a pathway to spiritual expansion. Your Gift: Creating emotional abundance and healing through compassionate presence."
    },
    "Leo": {
      title: "The Generous Leader",
      description: "You grow through creative self-expression and inspiring others. Your wisdom shines when you share your gifts with warmth and confidence.",
      keywords: ["generous", "creative", "dramatic", "inspiring"],
      spiritualMeaning: "Spiritual Lesson: Understanding that true leadership comes from serving others' growth, not ego. Your Gift: Igniting creative fire and confidence in everyone you encounter."
    },
    "Virgo": {
      title: "The Healing Teacher",
      description: "You grow through service, refinement, and practical wisdom. Your faith is expressed through helping others improve their lives.",
      keywords: ["helpful", "analytical", "practical", "healing"],
      spiritualMeaning: "Spiritual Lesson: Finding the sacred in daily routines and humble service to others. Your Gift: Healing and teaching through practical, grounded spiritual wisdom."
    },
    "Libra": {
      title: "The Harmonious Philosopher",
      description: "You grow through relationships, balance, and understanding diverse perspectives. Your wisdom comes from seeking fairness and beauty.",
      keywords: ["diplomatic", "balanced", "fair", "aesthetic"],
      spiritualMeaning: "Spiritual Lesson: Learning that true wisdom emerges from honoring all perspectives equally. Your Gift: Creating bridges of understanding and expanding consciousness through harmony."
    },
    "Scorpio": {
      title: "The Transformative Mystic",
      description: "You grow through deep emotional experiences and spiritual transformation. Your faith is tested and strengthened through crisis and rebirth.",
      keywords: ["intense", "transformative", "passionate", "profound"],
      spiritualMeaning: "Spiritual Lesson: Trusting that death and rebirth cycles are portals to profound wisdom. Your Gift: Guiding others through their darkest nights into spiritual empowerment."
    },
    "Sagittarius": {
      title: "The Truth Seeker",
      description: "You grow through adventure, philosophy, and expanding horizons. Your wisdom is natural, flowing from your connection to universal truth.",
      keywords: ["adventurous", "philosophical", "optimistic", "expansive"],
      spiritualMeaning: "Spiritual Lesson: Understanding that the journey itself is the destination and teacher. Your Gift: Opening minds to infinite possibilities and inspiring spiritual adventure."
    },
    "Capricorn": {
      title: "The Wise Authority",
      description: "You grow through discipline, achievement, and taking responsibility. Your wisdom is earned through patient mastery and integrity.",
      keywords: ["disciplined", "ambitious", "responsible", "masterful"],
      spiritualMeaning: "Spiritual Lesson: Learning that true success is measured by the positive legacy you leave. Your Gift: Building enduring spiritual structures and teaching through example."
    },
    "Aquarius": {
      title: "The Revolutionary Visionary",
      description: "You grow through innovation, humanitarian work, and breaking old paradigms. Your wisdom serves the collective evolution.",
      keywords: ["innovative", "humanitarian", "progressive", "unique"],
      spiritualMeaning: "Spiritual Lesson: Trusting that your unique perspective serves humanity's awakening. Your Gift: Channeling future wisdom to liberate collective consciousness."
    },
    "Pisces": {
      title: "The Compassionate Mystic",
      description: "You grow through spiritual experiences, compassion, and dissolving boundaries. Your faith is boundless and your wisdom flows from universal love.",
      keywords: ["compassionate", "spiritual", "intuitive", "transcendent"],
      spiritualMeaning: "Spiritual Lesson: Understanding that surrendering to divine flow opens infinite wisdom. Your Gift: Channeling universal compassion and healing through spiritual grace."
    }
  },
  
  saturn: {
    "Aries": {
      title: "The Patient Warrior",
      description: "You're learning to temper impulsiveness with wisdom. Your karmic lesson involves balancing courage with patience and developing disciplined initiative.",
      keywords: ["disciplined", "patient", "strategic", "controlled"],
      spiritualMeaning: "Spiritual Lesson: Mastering the art of strategic action over reactive impulse. Your Gift: Teaching others how to channel raw courage into lasting achievement."
    },
    "Taurus": {
      title: "The Resourceful Master",
      description: "You're learning about true security and value. Your karmic work involves releasing material attachment while building genuine worth.",
      keywords: ["stable", "practical", "patient", "grounded"],
      spiritualMeaning: "Spiritual Lesson: Understanding that real security comes from inner stability, not possessions. Your Gift: Building sustainable abundance through patient, conscious effort."
    },
    "Gemini": {
      title: "The Focused Communicator",
      description: "You're learning to commit to depth over breadth. Your karmic lesson involves developing focused communication and following through on ideas.",
      keywords: ["focused", "committed", "serious", "articulate"],
      spiritualMeaning: "Spiritual Lesson: Finding profound wisdom by going deep into one subject rather than skimming many. Your Gift: Teaching clarity and substance in communication."
    },
    "Cancer": {
      title: "The Emotionally Mature Nurturer",
      description: "You're learning healthy emotional boundaries. Your karmic work involves balancing nurturing with self-care and protecting without smothering.",
      keywords: ["mature", "responsible", "protective", "structured"],
      spiritualMeaning: "Spiritual Lesson: Mastering emotional wisdom through creating healthy boundaries in caring. Your Gift: Teaching others how to nurture without losing themselves."
    },
    "Leo": {
      title: "The Humble Leader",
      description: "You're learning authentic leadership through earned respect. Your karmic lesson involves balancing pride with humility and leading through service.",
      keywords: ["responsible", "dignified", "humble", "authoritative"],
      spiritualMeaning: "Spiritual Lesson: True authority comes from serving others, not demanding recognition. Your Gift: Modeling leadership that empowers rather than dominates."
    },
    "Virgo": {
      title: "The Perfected Server",
      description: "You're learning to serve without self-criticism. Your karmic work involves perfecting your craft while accepting imperfection in the process.",
      keywords: ["meticulous", "dedicated", "efficient", "grounded"],
      spiritualMeaning: "Spiritual Lesson: Excellence is achieved through practice, not perfectionism. Your Gift: Teaching mastery through humble, dedicated service."
    },
    "Libra": {
      title: "The Fair Judge",
      description: "You're learning true balance and commitment in relationships. Your karmic lesson involves making difficult choices and standing by your decisions.",
      keywords: ["fair", "committed", "balanced", "responsible"],
      spiritualMeaning: "Spiritual Lesson: Real harmony sometimes requires difficult boundaries and honest choices. Your Gift: Creating lasting partnerships built on integrity and mutual respect."
    },
    "Scorpio": {
      title: "The Transformed Healer",
      description: "You're learning mastery over intense emotions and power. Your karmic work involves using depth and intensity for healing, not control.",
      keywords: ["powerful", "controlled", "transformative", "resilient"],
      spiritualMeaning: "Spiritual Lesson: True power comes from emotional mastery and selfless transformation. Your Gift: Guiding others through their shadow work with wisdom and strength."
    },
    "Sagittarius": {
      title: "The Grounded Philosopher",
      description: "You're learning to ground your visions in reality. Your karmic lesson involves committing to one truth and building practical spiritual structures.",
      keywords: ["grounded", "committed", "wise", "practical"],
      spiritualMeaning: "Spiritual Lesson: Wisdom must be lived and applied, not just believed. Your Gift: Teaching how to translate spiritual truth into tangible positive change."
    },
    "Capricorn": {
      title: "The Master Builder",
      description: "You're learning responsible leadership and patient achievement. Your karmic work involves building lasting legacies through integrity and dedication.",
      keywords: ["masterful", "responsible", "authoritative", "enduring"],
      spiritualMeaning: "Spiritual Lesson: True success is measured in decades, not days - patience builds empires. Your Gift: Creating structures that serve generations through disciplined wisdom."
    },
    "Aquarius": {
      title: "The Responsible Revolutionary",
      description: "You're learning to balance innovation with responsibility. Your karmic lesson involves committing to humanitarian work with discipline and structure.",
      keywords: ["innovative", "responsible", "committed", "structured"],
      spiritualMeaning: "Spiritual Lesson: Real revolution requires structure and sustained effort, not just ideals. Your Gift: Building new systems that actually serve humanity's evolution."
    },
    "Pisces": {
      title: "The Grounded Mystic",
      description: "You're learning to bring spiritual wisdom into practical reality. Your karmic work involves grounding compassion in tangible service.",
      keywords: ["practical", "compassionate", "disciplined", "spiritual"],
      spiritualMeaning: "Spiritual Lesson: Transcendence is found through earthly service, not escape. Your Gift: Teaching how to channel spiritual insight into real-world healing."
    }
  },
  
  uranus: {
    "Aries": {
      title: "The Revolutionary Pioneer",
      description: "You bring radical innovation to how we initiate and lead. Your unique gift involves pioneering completely new ways of being courageous and independent.",
      keywords: ["revolutionary", "innovative", "bold", "pioneering"],
      spiritualMeaning: "Spiritual Lesson: Your individuality serves collective liberation - be boldly, unapologetically you. Your Gift: Awakening others to their own revolutionary courage and authentic self-expression."
    },
    "Taurus": {
      title: "The Value Revolutionary",
      description: "You bring innovation to resources, values, and what we consider valuable. Your gift involves revolutionizing material and spiritual abundance.",
      keywords: ["innovative", "stable", "revolutionary", "resourceful"],
      spiritualMeaning: "Spiritual Lesson: True stability comes from flexibility, and real value from unconventional wisdom. Your Gift: Showing humanity new ways to create sustainable abundance."
    },
    "Gemini": {
      title: "The Genius Communicator",
      description: "You bring breakthrough insights to communication and thinking. Your unique gift involves connecting ideas in revolutionary, mind-expanding ways.",
      keywords: ["brilliant", "innovative", "communicative", "inventive"],
      spiritualMeaning: "Spiritual Lesson: Your unique perspective opens portals of understanding for all. Your Gift: Channeling future knowledge and awakening minds to new possibilities."
    },
    "Cancer": {
      title: "The Emotional Revolutionary",
      description: "You bring innovation to nurturing, home, and emotional expression. Your gift involves creating new paradigms for family and emotional connection.",
      keywords: ["innovative", "nurturing", "unconventional", "liberating"],
      spiritualMeaning: "Spiritual Lesson: True emotional security comes from freedom to feel authentically. Your Gift: Liberating humanity from outdated emotional patterns and family karma."
    },
    "Leo": {
      title: "The Creative Genius",
      description: "You bring radical self-expression and innovative creativity. Your unique gift involves revolutionizing how we celebrate individuality and creative power.",
      keywords: ["creative", "innovative", "dramatic", "original"],
      spiritualMeaning: "Spiritual Lesson: Your authentic uniqueness is your greatest gift to the world. Your Gift: Inspiring radical self-love and creative freedom in all beings."
    },
    "Virgo": {
      title: "The Innovative Healer",
      description: "You bring revolutionary approaches to health, service, and healing. Your gift involves discovering breakthrough methods for practical improvement.",
      keywords: ["innovative", "healing", "precise", "revolutionary"],
      spiritualMeaning: "Spiritual Lesson: True healing comes from breaking free of old systems and finding new solutions. Your Gift: Pioneering holistic methods that transform health and wellbeing."
    },
    "Libra": {
      title: "The Relationship Revolutionary",
      description: "You bring innovation to partnerships and social dynamics. Your unique gift involves creating new paradigms for balance, fairness, and connection.",
      keywords: ["innovative", "balanced", "progressive", "fair"],
      spiritualMeaning: "Spiritual Lesson: True harmony requires breaking old relationship patterns. Your Gift: Awakening humanity to revolutionary forms of partnership and social justice."
    },
    "Scorpio": {
      title: "The Transformation Catalyst",
      description: "You bring sudden, profound transformation and occult innovation. Your gift involves revolutionizing how we understand power, death, and rebirth.",
      keywords: ["transformative", "powerful", "innovative", "intense"],
      spiritualMeaning: "Spiritual Lesson: Liberation comes through embracing the shadow and transforming it. Your Gift: Catalyzing quantum leaps in consciousness through profound awakening."
    },
    "Sagittarius": {
      title: "The Visionary Explorer",
      description: "You bring revolutionary wisdom and innovative philosophy. Your unique gift involves expanding consciousness through unconventional spiritual truth.",
      keywords: ["visionary", "innovative", "philosophical", "free"],
      spiritualMeaning: "Spiritual Lesson: Ultimate truth transcends all dogma and conventional belief. Your Gift: Opening portals to future wisdom and liberating spiritual understanding."
    },
    "Capricorn": {
      title: "The System Revolutionary",
      description: "You bring innovation to structures, authority, and achievement. Your gift involves revolutionizing how we build, lead, and create lasting change.",
      keywords: ["innovative", "authoritative", "revolutionary", "structural"],
      spiritualMeaning: "Spiritual Lesson: True authority comes from serving evolution, not preserving the past. Your Gift: Dismantling outdated systems and building revolutionary new structures."
    },
    "Aquarius": {
      title: "The Pure Visionary",
      description: "You embody revolutionary consciousness and humanitarian innovation. Your unique gift involves channeling future wisdom for collective awakening.",
      keywords: ["visionary", "humanitarian", "revolutionary", "original"],
      spiritualMeaning: "Spiritual Lesson: You're a living portal to humanity's future potential. Your Gift: Embodying and transmitting the consciousness humanity is evolving toward."
    },
    "Pisces": {
      title: "The Spiritual Revolutionary",
      description: "You bring innovation to spirituality and transcendence. Your gift involves revolutionizing how we connect with divine consciousness.",
      keywords: ["spiritual", "innovative", "transcendent", "liberating"],
      spiritualMeaning: "Spiritual Lesson: True enlightenment breaks all spiritual rules and dogma. Your Gift: Channeling divine frequencies that liberate souls from all illusions."
    }
  },
  
  neptune: {
    "Aries": {
      title: "The Spiritual Warrior",
      description: "You dream of courageous action and spiritual warriorship. Your mystical gift involves channeling divine will into compassionate action.",
      keywords: ["idealistic", "inspired", "compassionate", "visionary"],
      spiritualMeaning: "Spiritual Lesson: True courage comes from surrendering to divine guidance. Your Gift: Inspiring others to fight for spiritual ideals with compassion and faith."
    },
    "Taurus": {
      title: "The Material Mystic",
      description: "You dream of earthly paradise and sacred abundance. Your gift involves bringing heaven to earth through beauty and sensory spirituality.",
      keywords: ["aesthetic", "grounded", "spiritual", "sensory"],
      spiritualMeaning: "Spiritual Lesson: The divine is found in physical beauty and earthly pleasure. Your Gift: Teaching that spirituality and sensuality are sacred partners."
    },
    "Gemini": {
      title: "The Divine Messenger",
      description: "You dream of spiritual communication and mystical knowledge. Your gift involves channeling divine wisdom through words and connections.",
      keywords: ["intuitive", "communicative", "inspired", "poetic"],
      spiritualMeaning: "Spiritual Lesson: Sacred truth flows through everyday conversations and simple words. Your Gift: Translating divine messages into language that awakens hearts."
    },
    "Cancer": {
      title: "The Compassionate Nurturer",
      description: "You dream of universal motherhood and emotional healing. Your mystical gift involves channeling divine love through emotional presence.",
      keywords: ["compassionate", "nurturing", "psychic", "healing"],
      spiritualMeaning: "Spiritual Lesson: Your empathy is a direct line to divine compassion. Your Gift: Healing ancestral and collective emotional wounds through unconditional love."
    },
    "Leo": {
      title: "The Divine Creator",
      description: "You dream of inspired creativity and spiritual radiance. Your gift involves channeling divine creative force through artistic expression.",
      keywords: ["creative", "inspired", "radiant", "artistic"],
      spiritualMeaning: "Spiritual Lesson: Your creative expression is divine worship and service. Your Gift: Bringing celestial beauty into form through inspired artistry."
    },
    "Virgo": {
      title: "The Sacred Server",
      description: "You dream of perfect service and divine healing. Your mystical gift involves channeling spiritual purity through humble work.",
      keywords: ["healing", "devoted", "spiritual", "purifying"],
      spiritualMeaning: "Spiritual Lesson: The sacred is found in small acts of service and daily devotion. Your Gift: Teaching that enlightenment comes through perfecting compassionate service."
    },
    "Libra": {
      title: "The Divine Harmonizer",
      description: "You dream of perfect love and spiritual partnership. Your gift involves channeling divine beauty through relationships and balance.",
      keywords: ["harmonious", "romantic", "spiritual", "aesthetic"],
      spiritualMeaning: "Spiritual Lesson: True love is a portal to divine union and cosmic harmony. Your Gift: Creating relationships that serve as temples of spiritual connection."
    },
    "Scorpio": {
      title: "The Mystical Transformer",
      description: "You dream of profound spiritual transformation and occult mysteries. Your gift involves channeling divine power through death and rebirth.",
      keywords: ["mystical", "powerful", "psychic", "transformative"],
      spiritualMeaning: "Spiritual Lesson: Surrendering to transformation opens portals to divine power. Your Gift: Guiding souls through spiritual death into transcendent rebirth."
    },
    "Sagittarius": {
      title: "The Spiritual Seeker",
      description: "You dream of ultimate truth and divine wisdom. Your mystical gift involves channeling universal philosophy and sacred knowledge.",
      keywords: ["philosophical", "inspired", "visionary", "faithful"],
      spiritualMeaning: "Spiritual Lesson: All spiritual paths lead to the same divine truth. Your Gift: Teaching universal wisdom that transcends all religious boundaries."
    },
    "Capricorn": {
      title: "The Practical Mystic",
      description: "You dream of manifesting spiritual ideals in material form. Your gift involves bringing divine structure into earthly reality.",
      keywords: ["grounded", "spiritual", "responsible", "visionary"],
      spiritualMeaning: "Spiritual Lesson: True spirituality must be lived and built, not just believed. Your Gift: Creating tangible spiritual structures that serve humanity's evolution."
    },
    "Aquarius": {
      title: "The Universal Visionary",
      description: "You dream of collective enlightenment and humanitarian awakening. Your gift involves channeling future spiritual consciousness.",
      keywords: ["visionary", "humanitarian", "spiritual", "progressive"],
      spiritualMeaning: "Spiritual Lesson: Your spiritual visions serve humanity's collective awakening. Your Gift: Channeling divine frequencies that elevate mass consciousness."
    },
    "Pisces": {
      title: "The Pure Channel",
      description: "You dream of complete dissolution into divine love. Your mystical gift involves being a pure vessel for universal compassion.",
      keywords: ["transcendent", "compassionate", "mystical", "universal"],
      spiritualMeaning: "Spiritual Lesson: You are a living portal between heaven and earth. Your Gift: Embodying unconditional love and teaching surrender to divine flow."
    }
  },
  
  pluto: {
    "Aries": {
      title: "The Power Pioneer",
      description: "You transform through confronting and reclaiming your personal power. Your soul's work involves revolutionizing identity and self-assertion.",
      keywords: ["powerful", "transformative", "pioneering", "intense"],
      spiritualMeaning: "Spiritual Lesson: True power emerges when you fearlessly become your authentic self. Your Gift: Empowering others to reclaim their sovereignty and warrior spirit."
    },
    "Taurus": {
      title: "The Value Transformer",
      description: "You transform through death and rebirth of values and resources. Your soul's work involves revolutionizing what humanity considers valuable.",
      keywords: ["transformative", "resourceful", "powerful", "persistent"],
      spiritualMeaning: "Spiritual Lesson: Security comes from releasing attachment, not accumulating. Your Gift: Teaching profound transformation of material and spiritual worth."
    },
    "Gemini": {
      title: "The Mind Transformer",
      description: "You transform through profound shifts in perception and communication. Your soul's work involves revolutionizing how we think and connect.",
      keywords: ["penetrating", "transformative", "insightful", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True knowledge comes from diving into the depths, not skimming surfaces. Your Gift: Revealing hidden truths and transforming collective understanding."
    },
    "Cancer": {
      title: "The Emotional Alchemist",
      description: "You transform through deep emotional healing and family karma release. Your soul's work involves revolutionizing how we nurture and feel.",
      keywords: ["deep", "transformative", "healing", "powerful"],
      spiritualMeaning: "Spiritual Lesson: Emotional vulnerability is the gateway to profound power. Your Gift: Healing ancestral wounds and transforming collective emotional patterns."
    },
    "Leo": {
      title: "The Creative Transformer",
      description: "You transform through death and rebirth of ego and creative expression. Your soul's work involves revolutionizing authentic self-expression.",
      keywords: ["powerful", "transformative", "creative", "intense"],
      spiritualMeaning: "Spiritual Lesson: True creative power comes from ego death and soul expression. Your Gift: Teaching others to create from their deepest authentic power."
    },
    "Virgo": {
      title: "The Healing Transformer",
      description: "You transform through purification and service crisis. Your soul's work involves revolutionizing health, healing, and sacred work.",
      keywords: ["transformative", "healing", "powerful", "purifying"],
      spiritualMeaning: "Spiritual Lesson: Perfection comes through accepting and transforming imperfection. Your Gift: Catalyzing profound healing through crisis and dedicated service."
    },
    "Libra": {
      title: "The Relationship Transformer",
      description: "You transform through death and rebirth in partnerships. Your soul's work involves revolutionizing balance, fairness, and connection.",
      keywords: ["transformative", "intense", "balancing", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True intimacy requires dying to the old self in relationship. Your Gift: Teaching profound transformation through sacred partnership."
    },
    "Scorpio": {
      title: "The Ultimate Transformer",
      description: "You transform through complete death and rebirth of the soul. Your soul's work involves mastering the mysteries of life, death, and power.",
      keywords: ["intense", "transformative", "powerful", "regenerative"],
      spiritualMeaning: "Spiritual Lesson: You are here to master transformation itself and guide others through it. Your Gift: Being a shamanic guide through the underworld of consciousness."
    },
    "Sagittarius": {
      title: "The Belief Transformer",
      description: "You transform through death and rebirth of beliefs and philosophy. Your soul's work involves revolutionizing truth, wisdom, and meaning.",
      keywords: ["transformative", "philosophical", "powerful", "deep"],
      spiritualMeaning: "Spiritual Lesson: Ultimate truth is found by destroying all false beliefs. Your Gift: Guiding others through spiritual transformation and paradigm shifts."
    },
    "Capricorn": {
      title: "The Structure Transformer",
      description: "You transform through dismantling and rebuilding authority. Your soul's work involves revolutionizing systems, power, and achievement.",
      keywords: ["powerful", "transformative", "authoritative", "intense"],
      spiritualMeaning: "Spiritual Lesson: True mastery comes from destroying and rebuilding yourself repeatedly. Your Gift: Transforming outdated power structures into enlightened leadership."
    },
    "Aquarius": {
      title: "The Collective Transformer",
      description: "You transform through revolutionary changes in consciousness. Your soul's work involves catalyzing humanity's evolution and awakening.",
      keywords: ["revolutionary", "transformative", "powerful", "visionary"],
      spiritualMeaning: "Spiritual Lesson: Your personal transformation serves collective liberation. Your Gift: Catalyzing quantum leaps in mass consciousness and social structures."
    },
    "Pisces": {
      title: "The Spiritual Transformer",
      description: "You transform through complete dissolution and spiritual rebirth. Your soul's work involves revolutionizing compassion, transcendence, and unity.",
      keywords: ["transcendent", "transformative", "mystical", "powerful"],
      spiritualMeaning: "Spiritual Lesson: True power comes from surrendering all power to the divine. Your Gift: Teaching transformation through spiritual surrender and universal love."
    }
  }
};

// Karmic Points Interpretations
export const KARMIC_INTERPRETATIONS = {
  northNode: {
    "Aries": {
      title: "Soul Mission: Pioneer Leadership",
      description: "Your soul is learning to develop independence, courage, and leadership. Move away from over-dependence on others' opinions.",
      spiritualGrowth: "Embrace your individuality and learn to take initiative without waiting for others' approval."
    },
    "Taurus": {
      title: "Soul Mission: Grounded Stability", 
      description: "Your soul is learning to create stability, appreciate simple pleasures, and build lasting value. Move away from emotional drama.",
      spiritualGrowth: "Find peace in simplicity and learn to appreciate the beauty in everyday moments."
    },
    "Gemini": {
      title: "Soul Mission: Divine Communication",
      description: "Your soul is learning to communicate clearly, stay curious, and share knowledge. Move away from rigid thinking.",
      spiritualGrowth: "Embrace flexibility and learn to see multiple perspectives on any situation."
    },
    "Cancer": {
      title: "Soul Mission: Emotional Healing",
      description: "Your soul is learning to nurture, trust intuition, and create emotional security. Move away from cold ambition.",
      spiritualGrowth: "Open your heart and learn to trust your emotional wisdom and caring nature."
    },
    "Leo": {
      title: "Soul Mission: Creative Self-Expression",
      description: "Your soul is learning to express creativity, develop confidence, and share your unique gifts. Move away from hiding in groups.",
      spiritualGrowth: "Step into the spotlight and share your creative gifts with confidence and generosity."
    },
    "Virgo": {
      title: "Soul Mission: Sacred Service",
      description: "Your soul is learning to serve others, pay attention to details, and create practical solutions. Move away from scattered energy.",
      spiritualGrowth: "Focus on being helpful and bringing order to chaos through dedicated service."
    },
    "Libra": {
      title: "Soul Mission: Divine Harmony",
      description: "Your soul is learning to create balance, cooperate with others, and appreciate beauty. Move away from selfish behavior.",
      spiritualGrowth: "Learn the art of cooperation and creating harmony in all your relationships."
    },
    "Scorpio": {
      title: "Soul Mission: Soul Transformation", 
      description: "Your soul is learning to embrace transformation, develop emotional depth, and heal through crisis. Move away from superficiality.",
      spiritualGrowth: "Dive deep into life's mysteries and transform yourself and others through emotional healing."
    },
    "Sagittarius": {
      title: "Soul Mission: Wisdom Teaching",
      description: "Your soul is learning to seek higher truth, expand consciousness, and teach others. Move away from petty details.",
      spiritualGrowth: "Expand your horizons and share wisdom gained from your spiritual adventures."
    },
    "Capricorn": {
      title: "Soul Mission: Spiritual Authority",
      description: "Your soul is learning to take responsibility, build lasting structures, and achieve mastery. Move away from emotional dependency.",
      spiritualGrowth: "Develop discipline and take responsibility for creating something meaningful in the world."
    },
    "Aquarius": {
      title: "Soul Mission: Humanitarian Evolution",
      description: "Your soul is learning to contribute to humanity, embrace innovation, and think collectively. Move away from ego-centered attention.",
      spiritualGrowth: "Channel your uniqueness toward benefiting humanity and collective evolution."
    },
    "Pisces": {
      title: "Soul Mission: Universal Love",
      description: "Your soul is learning to develop compassion, trust intuition, and serve something greater. Move away from critical analysis.",
      spiritualGrowth: "Trust your intuition and serve others through boundless compassion and spiritual wisdom."
    }
  },
  chiron: {
    "Aries": {
      title: "The Wounded Warrior",
      description: "Your deepest wound involves issues with identity, confidence, and assertiveness. Healing comes through developing healthy self-assertion.",
      healingPath: "Learn to express your authentic self without aggression or defensiveness."
    },
    "Taurus": {
      title: "The Wounded Builder",
      description: "Your deepest wound involves self-worth, material security, and appreciating your own value. Healing comes through recognizing your inherent worth.",
      healingPath: "Discover that your value isn't dependent on external possessions or achievements."
    },
    "Gemini": {
      title: "The Wounded Communicator",
      description: "Your deepest wound involves communication, learning, and being heard. Healing comes through finding your authentic voice.",
      healingPath: "Learn to communicate your truth clearly and trust that your ideas have value."
    },
    "Cancer": {
      title: "The Wounded Nurturer",
      description: "Your deepest wound involves emotional security, family, and feeling safe to be vulnerable. Healing comes through self-nurturing.",
      healingPath: "Learn to nurture yourself first, then extend that caring to others in healthy ways."
    },
    "Leo": {
      title: "The Wounded Creator",
      description: "Your deepest wound involves creativity, self-expression, and feeling worthy of attention. Healing comes through authentic self-expression.",
      healingPath: "Express your creativity without seeking external validation or approval."
    },
    "Virgo": {
      title: "The Wounded Healer",
      description: "Your deepest wound involves perfectionism, criticism, and feeling flawed. Healing comes through self-acceptance.",
      healingPath: "Embrace your imperfections and learn that being human means being beautifully flawed."
    },
    "Libra": {
      title: "The Wounded Peacemaker",
      description: "Your deepest wound involves relationships, balance, and fear of conflict. Healing comes through authentic relating.",
      healingPath: "Learn to maintain your identity while creating harmonious relationships with others."
    },
    "Scorpio": {
      title: "The Wounded Transformer",
      description: "Your deepest wound involves trust, intimacy, and fear of emotional destruction. Healing comes through emotional courage.",
      healingPath: "Face your deepest fears and learn that transformation leads to regeneration, not destruction."
    },
    "Sagittarius": {
      title: "The Wounded Teacher",
      description: "Your deepest wound involves meaning, truth, and feeling lost or purposeless. Healing comes through sharing your wisdom.",
      healingPath: "Find your truth and share it with others, knowing that your journey gives you wisdom to offer."
    },
    "Capricorn": {
      title: "The Wounded Authority",
      description: "Your deepest wound involves achievement, recognition, and feeling powerless. Healing comes through authentic leadership.",
      healingPath: "Learn to be an authority in your own life and use your power to serve something greater."
    },
    "Aquarius": {
      title: "The Wounded Revolutionary",
      description: "Your deepest wound involves belonging, uniqueness, and feeling like an outsider. Healing comes through embracing your differences.",
      healingPath: "Celebrate your uniqueness and use it to contribute something valuable to collective humanity."
    },
    "Pisces": {
      title: "The Wounded Mystic",
      description: "Your deepest wound involves spirituality, boundaries, and feeling overwhelmed by life. Healing comes through spiritual practice.",
      healingPath: "Develop healthy boundaries while maintaining your compassionate, spiritual nature."
    }
  }
};

// Function to get interpretation for planet in sign
export function getPlanetSignInterpretation(planet: string, sign: string) {
  return PLANET_SIGN_INTERPRETATIONS[planet]?.[sign] || {
    title: `${planet} in ${sign}`,
    description: `Your ${planet} energy expresses through ${sign} qualities.`,
    keywords: [],
    spiritualMeaning: `This placement brings unique spiritual lessons and gifts.`
  };
}

// Function to get house interpretation
export function getHouseInterpretation(house: number) {
  return HOUSE_MEANINGS[house] || {
    title: `House ${house}`,
    description: "This house represents an important life area.",
    themes: [],
    spiritualFocus: "This area offers spiritual growth opportunities."
  };
}

// Function to get planet meaning
export function getPlanetMeaning(planet: string) {
  return PLANET_MEANINGS[planet] || {
    title: planet,
    governs: "Various life themes",
    spiritualRole: "Spiritual growth and evolution",
    keywords: []
  };
}

// Function to get karmic point interpretation
export function getKarmicInterpretation(point: 'northNode' | 'chiron', sign: string) {
  const interpretation = KARMIC_INTERPRETATIONS[point] as any;
  return interpretation?.[sign] || {
    title: `${point} in ${sign}`,
    description: `This placement offers important spiritual lessons.`,
    spiritualGrowth: "Focus on growth in this area.",
    healingPath: "Healing comes through conscious awareness."
  };
}

// Comprehensive Aspect Interpretations
interface AspectInterpretation {
  [aspectType: string]: {
    [planetPair: string]: {
      title: string;
      description: string;
      spiritualMeaning: string;
      keywords: string[];
      harmonyLevel: 'harmonious' | 'challenging' | 'dynamic';
    };
  };
}

export const ASPECT_INTERPRETATIONS: AspectInterpretation = {
  conjunction: {
    'sun-moon': {
      title: "Soul Integration",
      description: "Your conscious self and emotional nature are unified, creating a powerful inner harmony. You know who you are at a deep level and express your authentic self naturally.",
      spiritualMeaning: "This aspect represents the sacred marriage of masculine and feminine energies within you, creating wholeness and integrated consciousness.",
      keywords: ["unity", "integration", "authenticity", "self-awareness", "wholeness"],
      harmonyLevel: 'harmonious'
    },
    'sun-mercury': {
      title: "Illuminated Mind",
      description: "Your core identity and mental processes are deeply unified. You think clearly about who you are and communicate your essence with natural authority.",
      spiritualMeaning: "Your soul speaks through your words and thoughts, making you a natural teacher of self-awareness and conscious living.",
      keywords: ["clarity", "self-expression", "teaching", "awareness", "authenticity"],
      harmonyLevel: 'harmonious'
    },
    'sun-venus': {
      title: "Radiant Love",
      description: "Your sense of self is intimately connected with your capacity to love and create beauty. You naturally express affection and artistic gifts.",
      spiritualMeaning: "You embody the divine principle that love and identity are one - teaching others that being yourself IS the greatest act of love.",
      keywords: ["love", "beauty", "creativity", "self-worth", "magnetism"],
      harmonyLevel: 'harmonious'
    },
    'sun-mars': {
      title: "Warrior Spirit",
      description: "Your identity and will are powerfully fused. You act on your convictions with courage and move through life with decisive confidence.",
      spiritualMeaning: "You incarnated to demonstrate the power of aligned action - when who you are and what you do become one unstoppable force.",
      keywords: ["courage", "action", "willpower", "confidence", "leadership"],
      harmonyLevel: 'dynamic'
    },
    'sun-jupiter': {
      title: "Blessed Expansion",
      description: "Your core self naturally expands and radiates optimism. You have faith in yourself and inspire others through your generous spirit.",
      spiritualMeaning: "You carry the divine gift of natural abundance - your very presence expands possibilities for yourself and others.",
      keywords: ["optimism", "expansion", "generosity", "faith", "abundance"],
      harmonyLevel: 'harmonious'
    },
    'sun-saturn': {
      title: "Disciplined Self",
      description: "Your identity is shaped by responsibility and mastery. You take yourself seriously and build your life through patient, deliberate effort.",
      spiritualMeaning: "You're learning that true power comes through discipline - your soul becomes diamond through sustained pressure and conscious refinement.",
      keywords: ["discipline", "mastery", "responsibility", "authority", "structure"],
      harmonyLevel: 'dynamic'
    },
    'sun-uranus': {
      title: "Revolutionary Self",
      description: "Your identity is unique, innovative, and sometimes shocking. You're here to break conventions and show others new ways of being.",
      spiritualMeaning: "You embody the principle of divine rebellion - your authenticity challenges others to break free and discover their own truth.",
      keywords: ["uniqueness", "innovation", "rebellion", "awakening", "freedom"],
      harmonyLevel: 'dynamic'
    },
    'sun-neptune': {
      title: "Mystical Identity",
      description: "Your sense of self is fluid, spiritual, and deeply intuitive. You experience yourself as part of something greater than ego.",
      spiritualMeaning: "You're here to dissolve the illusion of separation - showing others that true identity is found in union with the divine.",
      keywords: ["spirituality", "intuition", "compassion", "mysticism", "transcendence"],
      harmonyLevel: 'harmonious'
    },
    'sun-pluto': {
      title: "Transformative Power",
      description: "Your identity is intensely transformative and deeply powerful. You experience life through death and rebirth, constantly evolving.",
      spiritualMeaning: "You carry the phoenix energy - your soul transforms through crisis, emerging stronger and wiser with each regeneration.",
      keywords: ["transformation", "power", "intensity", "rebirth", "depth"],
      harmonyLevel: 'dynamic'
    },
    'moon-mercury': {
      title: "Emotional Intelligence",
      description: "Your feelings and thoughts flow together naturally. You can articulate emotions with clarity and understand others' feelings through logic.",
      spiritualMeaning: "You bridge heart and mind, teaching others that true wisdom comes from integrating emotional and mental intelligence.",
      keywords: ["emotional intelligence", "communication", "understanding", "empathy", "clarity"],
      harmonyLevel: 'harmonious'
    },
    'moon-venus': {
      title: "Divine Nurturer",
      description: "Your emotional nature and capacity to love are beautifully unified. You nurture through affection and find emotional security in beauty and connection.",
      spiritualMeaning: "You embody the divine feminine principle of unconditional love - your heart naturally knows how to care, comfort, and create beauty.",
      keywords: ["nurturing", "love", "comfort", "beauty", "harmony"],
      harmonyLevel: 'harmonious'
    },
    'moon-mars': {
      title: "Emotional Warrior",
      description: "Your emotions fuel your actions powerfully and immediately. You respond to feelings with instinctive action and defend what you care about fiercely.",
      spiritualMeaning: "You demonstrate that emotions are not weakness but power - your feelings drive courageous action and protective strength.",
      keywords: ["passion", "courage", "protection", "instinct", "action"],
      harmonyLevel: 'dynamic'
    },
    'moon-jupiter': {
      title: "Emotional Abundance",
      description: "Your emotional nature is naturally optimistic and generous. You feel hopeful about life and spread emotional warmth wherever you go.",
      spiritualMeaning: "You carry the blessing of emotional faith - trusting that the universe will provide and teaching others to feel abundance rather than scarcity.",
      keywords: ["optimism", "generosity", "faith", "abundance", "warmth"],
      harmonyLevel: 'harmonious'
    },
    'moon-saturn': {
      title: "Emotional Mastery",
      description: "Your emotions are controlled, mature, and deeply responsible. You take your feelings seriously and build emotional security through structure.",
      spiritualMeaning: "You're learning the advanced lesson of emotional sovereignty - that true security comes from within through self-discipline and maturity.",
      keywords: ["maturity", "responsibility", "control", "security", "discipline"],
      harmonyLevel: 'challenging'
    },
    'moon-uranus': {
      title: "Emotional Freedom",
      description: "Your emotional nature is unique, changeable, and liberated. You need freedom to feel authentically and resist emotional conventions.",
      spiritualMeaning: "You're here to revolutionize emotional expression - showing others that feelings don't have to fit society's expectations.",
      keywords: ["freedom", "uniqueness", "independence", "authenticity", "innovation"],
      harmonyLevel: 'dynamic'
    },
    'moon-neptune': {
      title: "Psychic Sensitivity",
      description: "Your emotions are deeply intuitive, compassionate, and spiritually attuned. You feel what others feel and connect to cosmic consciousness.",
      spiritualMeaning: "You have the gift of divine empathy - your emotional body is a receptor for spiritual truth and collective feeling.",
      keywords: ["intuition", "empathy", "spirituality", "sensitivity", "compassion"],
      harmonyLevel: 'harmonious'
    },
    'moon-pluto': {
      title: "Emotional Transformation",
      description: "Your emotional life is intense, deep, and transformative. You experience feelings with volcanic power and emotional rebirth through crisis.",
      spiritualMeaning: "Your soul chose emotional intensity as your path to power - through feeling everything deeply, you transform yourself and heal others.",
      keywords: ["intensity", "transformation", "depth", "power", "healing"],
      harmonyLevel: 'challenging'
    },
    'mercury-venus': {
      title: "Graceful Communication",
      description: "Your mind and heart speak with one voice. You communicate with charm, diplomacy, and natural grace, making others feel valued.",
      spiritualMeaning: "You teach that words can be acts of love - your communication creates beauty, harmony, and deeper connection.",
      keywords: ["charm", "diplomacy", "grace", "harmony", "connection"],
      harmonyLevel: 'harmonious'
    },
    'mercury-mars': {
      title: "Mental Warrior",
      description: "Your thoughts and actions are tightly coupled. You think quickly, speak directly, and move from idea to action with impressive speed.",
      spiritualMeaning: "You demonstrate the power of decisive thinking - showing others how mental clarity creates swift, effective action.",
      keywords: ["decisiveness", "speed", "clarity", "action", "directness"],
      harmonyLevel: 'dynamic'
    },
    'mercury-jupiter': {
      title: "Expansive Mind",
      description: "Your thinking is naturally optimistic, philosophical, and broad. You see the big picture and communicate wisdom with enthusiasm.",
      spiritualMeaning: "You're blessed with the gift of higher mind - your thoughts naturally reach for truth, meaning, and universal principles.",
      keywords: ["wisdom", "optimism", "philosophy", "vision", "enthusiasm"],
      harmonyLevel: 'harmonious'
    },
    'mercury-saturn': {
      title: "Structured Thinking",
      description: "Your mind is disciplined, focused, and deeply serious. You think methodically and communicate with authority and precision.",
      spiritualMeaning: "You're developing the master skill of mental discipline - your thoughts build lasting structures of knowledge and wisdom.",
      keywords: ["discipline", "focus", "precision", "authority", "mastery"],
      harmonyLevel: 'harmonious'
    },
    'mercury-uranus': {
      title: "Genius Mind",
      description: "Your thinking is brilliantly original, innovative, and lightning-fast. You have breakthrough insights and communicate revolutionary ideas.",
      spiritualMeaning: "You channel divine intelligence - your mind receives downloads from higher consciousness and translates them into innovative thought.",
      keywords: ["genius", "innovation", "breakthrough", "originality", "awakening"],
      harmonyLevel: 'dynamic'
    },
    'mercury-neptune': {
      title: "Intuitive Mind",
      description: "Your thinking is imaginative, intuitive, and spiritually attuned. You think in symbols, dreams, and impressions rather than pure logic.",
      spiritualMeaning: "You demonstrate that true intelligence includes intuition - your mind bridges rational thought and mystical knowing.",
      keywords: ["intuition", "imagination", "spirituality", "symbolism", "mysticism"],
      harmonyLevel: 'harmonious'
    },
    'mercury-pluto': {
      title: "Penetrating Mind",
      description: "Your thinking is intensely deep, investigative, and transformative. You see beneath surfaces and uncover hidden truths.",
      spiritualMeaning: "You're gifted with x-ray vision for truth - your mind penetrates illusions and brings what's hidden into consciousness.",
      keywords: ["depth", "investigation", "truth", "transformation", "insight"],
      harmonyLevel: 'dynamic'
    },
    'venus-mars': {
      title: "Passion and Love United",
      description: "Your desires and affections work in perfect harmony. You have a natural magnetism and can attract what you want through authentic expression of your heart's desires.",
      spiritualMeaning: "The divine feminine and masculine energies within you are balanced, creating powerful manifestation abilities and authentic relationships.",
      keywords: ["magnetism", "passion", "attraction", "creativity", "balance"],
      harmonyLevel: 'harmonious'
    },
    'venus-jupiter': {
      title: "Blessed Love",
      description: "Your capacity for love, beauty, and pleasure is abundant and generous. You attract blessings in relationships and creative endeavors.",
      spiritualMeaning: "You carry the energy of divine grace - love and abundance flow to you naturally because you embody appreciation and generosity.",
      keywords: ["abundance", "grace", "generosity", "blessing", "expansion"],
      harmonyLevel: 'harmonious'
    },
    'venus-saturn': {
      title: "Committed Love",
      description: "Your approach to love and beauty is serious, loyal, and enduring. You value quality over quantity and build lasting relationships.",
      spiritualMeaning: "You're learning that true love requires commitment - your soul is mastering the art of sustained devotion and mature affection.",
      keywords: ["commitment", "loyalty", "endurance", "maturity", "dedication"],
      harmonyLevel: 'dynamic'
    },
    'venus-uranus': {
      title: "Liberated Love",
      description: "Your approach to love and beauty is unconventional, exciting, and freedom-loving. You attract through uniqueness and value independence.",
      spiritualMeaning: "You're revolutionizing the concept of love - showing others that true affection honors freedom and celebrates uniqueness.",
      keywords: ["freedom", "uniqueness", "excitement", "independence", "revolution"],
      harmonyLevel: 'dynamic'
    },
    'venus-neptune': {
      title: "Divine Love",
      description: "Your capacity for love is spiritual, boundless, and transcendent. You experience love as a pathway to the divine.",
      spiritualMeaning: "You embody unconditional love - your heart knows no boundaries and sees the divine in all beings.",
      keywords: ["unconditional love", "spirituality", "transcendence", "compassion", "unity"],
      harmonyLevel: 'harmonious'
    },
    'venus-pluto': {
      title: "Transformative Love",
      description: "Your relationships are intense, transformative, and deeply passionate. Love changes you profoundly and reveals hidden depths.",
      spiritualMeaning: "You experience love as alchemy - your relationships transform your soul and teach you the power of emotional death and rebirth.",
      keywords: ["transformation", "intensity", "passion", "depth", "regeneration"],
      harmonyLevel: 'challenging'
    },
    'mars-jupiter': {
      title: "Victorious Action",
      description: "Your drive and expansion work together powerfully. You act with confidence, optimism, and often achieve victory through bold moves.",
      spiritualMeaning: "You're blessed with the warrior's faith - your actions are guided by optimism and your efforts tend to expand into success.",
      keywords: ["victory", "confidence", "expansion", "boldness", "success"],
      harmonyLevel: 'harmonious'
    },
    'mars-saturn': {
      title: "Disciplined Will",
      description: "Your drive is controlled, strategic, and enduring. You achieve through sustained effort and overcome obstacles through patient persistence.",
      spiritualMeaning: "You're mastering the advanced skill of controlled power - your will becomes invincible through discipline and strategic action.",
      keywords: ["discipline", "strategy", "endurance", "mastery", "control"],
      harmonyLevel: 'challenging'
    },
    'mars-uranus': {
      title: "Revolutionary Action",
      description: "Your actions are sudden, innovative, and rebellious. You break through barriers with explosive energy and unexpected moves.",
      spiritualMeaning: "You're here to demonstrate liberation through action - showing others how to break free from limitations through bold, innovative moves.",
      keywords: ["liberation", "innovation", "breakthrough", "rebellion", "suddenness"],
      harmonyLevel: 'dynamic'
    },
    'mars-neptune': {
      title: "Spiritual Warrior",
      description: "Your drive is guided by intuition and spiritual purpose. You act on faith and inspiration rather than pure ambition.",
      spiritualMeaning: "You're the divine warrior - your actions serve something greater than ego and your will is aligned with cosmic purpose.",
      keywords: ["spiritual action", "inspiration", "faith", "service", "intuition"],
      harmonyLevel: 'harmonious'
    },
    'mars-pluto': {
      title: "Atomic Power",
      description: "Your will is intensely powerful, transformative, and unstoppable. You have tremendous drive and the ability to overcome any obstacle.",
      spiritualMeaning: "You carry nuclear force within - your power to transform through sheer will teaches others about the indomitable nature of the soul.",
      keywords: ["power", "transformation", "will", "intensity", "regeneration"],
      harmonyLevel: 'challenging'
    },
    'jupiter-saturn': {
      title: "Wisdom Through Structure",
      description: "You have the rare ability to expand with wisdom and discipline. Your growth is steady and lasting because you understand both vision and practical application.",
      spiritualMeaning: "You embody the perfect balance of spiritual expansion and earthly mastery, teaching others how to grow with integrity.",
      keywords: ["wisdom", "discipline", "structured growth", "mastery", "teaching"],
      harmonyLevel: 'dynamic'
    },
    'jupiter-uranus': {
      title: "Revolutionary Expansion",
      description: "Your growth comes through sudden breakthroughs and innovative thinking. You expand into completely new territory through radical change.",
      spiritualMeaning: "You're blessed with quantum leaps - your soul evolution happens through revolutionary insights and unexpected expansions.",
      keywords: ["breakthrough", "innovation", "revolution", "expansion", "liberation"],
      harmonyLevel: 'dynamic'
    },
    'jupiter-neptune': {
      title: "Infinite Faith",
      description: "Your optimism is spiritual, boundless, and inspired. You have deep faith in the universe and believe in miracles.",
      spiritualMeaning: "You carry the gift of divine grace - your faith connects you to infinite possibility and your optimism creates spiritual reality.",
      keywords: ["faith", "miracles", "spirituality", "grace", "inspiration"],
      harmonyLevel: 'harmonious'
    },
    'jupiter-pluto': {
      title: "Transformative Growth",
      description: "Your expansion happens through deep transformation and regeneration. You grow by facing shadows and emerging stronger.",
      spiritualMeaning: "You're blessed with the power of conscious evolution - your growth transforms not just you but everything you touch.",
      keywords: ["transformation", "power", "evolution", "regeneration", "depth"],
      harmonyLevel: 'dynamic'
    },
    'saturn-uranus': {
      title: "Revolutionary Structure",
      description: "You're learning to build new structures while honoring traditional wisdom. You create innovative forms that are both free and stable.",
      spiritualMeaning: "You're here to revolutionize responsibility - showing that true freedom comes through conscious structure and that rules can liberate.",
      keywords: ["innovation", "structure", "freedom", "responsibility", "balance"],
      harmonyLevel: 'challenging'
    },
    'saturn-neptune': {
      title: "Spiritual Discipline",
      description: "You're learning to give form to the formless. Your spiritual insights become practical through patient effort and grounded wisdom.",
      spiritualMeaning: "You're mastering the divine art of manifestation - bringing spiritual vision into material reality through discipline and faith.",
      keywords: ["manifestation", "discipline", "spirituality", "grounding", "wisdom"],
      harmonyLevel: 'harmonious'
    },
    'saturn-pluto': {
      title: "Masterful Transformation",
      description: "You transform through sustained pressure and deep commitment. Your power comes from facing limitations and emerging as a master.",
      spiritualMeaning: "You're learning the ultimate lesson of power - that true strength comes through enduring transformation and disciplined regeneration.",
      keywords: ["mastery", "transformation", "endurance", "power", "depth"],
      harmonyLevel: 'challenging'
    },
    'uranus-neptune': {
      title: "Visionary Awakening",
      description: "You're part of a generation bringing spiritual revolution. Your awakening connects individual liberation with collective consciousness.",
      spiritualMeaning: "You carry the energy of spiritual evolution - awakening others to new dimensions of consciousness and collective transformation.",
      keywords: ["awakening", "evolution", "vision", "spirituality", "revolution"],
      harmonyLevel: 'harmonious'
    },
    'uranus-pluto': {
      title: "Revolutionary Transformation",
      description: "You're part of a generation that transforms society through radical change. You break down old structures and rebuild from scratch.",
      spiritualMeaning: "You carry the energy of collective rebirth - destroying what's outdated and creating new forms for humanity's evolution.",
      keywords: ["revolution", "transformation", "rebirth", "evolution", "power"],
      harmonyLevel: 'dynamic'
    },
    'neptune-pluto': {
      title: "Spiritual Transformation",
      description: "You're part of a generation dissolving old spiritual forms and birthing new mystical understanding. Collective consciousness evolves through you.",
      spiritualMeaning: "You carry the energy of spiritual evolution - transforming humanity's relationship with the divine and birthing new spiritual paradigms.",
      keywords: ["spiritual evolution", "transformation", "mysticism", "collective consciousness", "rebirth"],
      harmonyLevel: 'harmonious'
    }
  },
  sextile: {
    'sun-moon': {
      title: "Harmonious Self-Expression",
      description: "Your conscious goals and emotional needs support each other beautifully. You can express your true self while honoring your inner emotional world, creating natural charisma.",
      spiritualMeaning: "Your soul's purpose flows in harmony with your emotional wisdom, creating opportunities for authentic leadership and inspiring others.",
      keywords: ["harmony", "opportunity", "charisma", "emotional intelligence", "flow"],
      harmonyLevel: 'harmonious'
    },
    'sun-mercury': {
      title: "Mindful Opportunity",
      description: "Your identity and thoughts create easy opportunities for self-expression. You communicate who you are with natural clarity and charm.",
      spiritualMeaning: "Gentle opportunities flow to you when you speak your truth - your words create pathways for your soul's purpose.",
      keywords: ["clarity", "opportunity", "communication", "self-awareness", "ease"],
      harmonyLevel: 'harmonious'
    },
    'sun-venus': {
      title: "Graceful Magnetism",
      description: "You easily attract love, beauty, and appreciation. Your natural charm creates opportunities for connection and creative expression.",
      spiritualMeaning: "You attract blessings through simply being yourself - your authentic presence draws love and resources naturally.",
      keywords: ["attraction", "grace", "opportunity", "love", "creativity"],
      harmonyLevel: 'harmonious'
    },
    'sun-mars': {
      title: "Effortless Action",
      description: "Your will and identity support each other, creating easy opportunities to assert yourself. Action flows naturally from who you are.",
      spiritualMeaning: "You demonstrate that aligned action requires no struggle - when you're true to yourself, opportunities for expression appear.",
      keywords: ["action", "opportunity", "confidence", "alignment", "flow"],
      harmonyLevel: 'harmonious'
    },
    'moon-mercury': {
      title: "Emotional Articulation",
      description: "You have natural talent for expressing feelings and understanding others emotionally. Communication opportunities arise through empathy.",
      spiritualMeaning: "Your emotional intelligence creates pathways for healing dialogue - you help others understand their hearts through words.",
      keywords: ["emotional intelligence", "communication", "empathy", "understanding", "opportunity"],
      harmonyLevel: 'harmonious'
    },
    'moon-venus': {
      title: "Nurturing Love",
      description: "You easily create emotional warmth and attract loving relationships. Opportunities for connection flow through your caring nature.",
      spiritualMeaning: "Love comes easily when you follow your heart - your emotional authenticity attracts beautiful relationships and experiences.",
      keywords: ["love", "nurturing", "opportunity", "warmth", "connection"],
      harmonyLevel: 'harmonious'
    },
    'moon-mars': {
      title: "Emotional Courage",
      description: "You can act on your feelings effectively, creating opportunities through emotional honesty. Your instincts guide successful action.",
      spiritualMeaning: "You show that emotions fuel effective action - opportunities arise when you honor your feelings and act courageously.",
      keywords: ["courage", "action", "opportunity", "instinct", "effectiveness"],
      harmonyLevel: 'harmonious'
    },
    'mercury-venus': {
      title: "Charming Words",
      description: "You communicate with natural charm and create opportunities through diplomacy. Your words attract love and cooperation.",
      spiritualMeaning: "Your speech creates beauty and harmony - opportunities flow when you communicate from the heart with grace.",
      keywords: ["charm", "diplomacy", "opportunity", "communication", "harmony"],
      harmonyLevel: 'harmonious'
    },
    'mercury-mars': {
      title: "Quick Thinking",
      description: "You think and act quickly, creating opportunities through mental agility. Your mind moves seamlessly into action.",
      spiritualMeaning: "Swift opportunities come to those who think clearly and act decisively - your mental speed creates openings others miss.",
      keywords: ["agility", "speed", "opportunity", "decisiveness", "clarity"],
      harmonyLevel: 'harmonious'
    },
    'venus-mars': {
      title: "Creative Magnetism",
      description: "Your desires and affections create beautiful opportunities for connection and creativity. You attract love and resources through gentle action and authentic charm.",
      spiritualMeaning: "You understand the sacred dance between giving and receiving, creating abundance through heart-centered action.",
      keywords: ["creativity", "attraction", "opportunity", "charm", "abundance"],
      harmonyLevel: 'harmonious'
    },
    'sun-jupiter': {
      title: "Blessed Opportunities",
      description: "Opportunities for expansion and growth flow to you naturally. Your optimism and faith create pathways for success and abundance.",
      spiritualMeaning: "Divine grace supports your journey - when you align with your purpose, the universe opens doors of opportunity.",
      keywords: ["opportunity", "expansion", "grace", "optimism", "growth"],
      harmonyLevel: 'harmonious'
    },
    'sun-saturn': {
      title: "Structured Success",
      description: "You create opportunities through disciplined effort and patient work. Your commitment to excellence opens doors over time.",
      spiritualMeaning: "You're learning that true opportunity comes through mastery - your dedication creates lasting pathways to success.",
      keywords: ["discipline", "mastery", "opportunity", "patience", "achievement"],
      harmonyLevel: 'harmonious'
    },
    'moon-jupiter': {
      title: "Emotional Blessings",
      description: "Opportunities for emotional growth and happiness flow naturally. Your optimistic feelings attract positive experiences.",
      spiritualMeaning: "Your emotional faith creates miracles - opportunities arise when you trust your feelings and remain hopeful.",
      keywords: ["blessings", "optimism", "opportunity", "growth", "faith"],
      harmonyLevel: 'harmonious'
    },
    'moon-saturn': {
      title: "Emotional Discipline",
      description: "You create emotional security through patient effort and self-control. Opportunities arise through mature emotional management.",
      spiritualMeaning: "You're building emotional sovereignty - opportunities for depth come through disciplined feeling and responsible nurturing.",
      keywords: ["discipline", "maturity", "opportunity", "security", "responsibility"],
      harmonyLevel: 'harmonious'
    },
    'mercury-jupiter': {
      title: "Expansive Thinking",
      description: "Your mind creates opportunities through broad vision and optimistic thinking. You attract success through positive communication.",
      spiritualMeaning: "Your thoughts reach for the stars - opportunities flow when you speak truth and think expansively.",
      keywords: ["expansion", "optimism", "opportunity", "vision", "wisdom"],
      harmonyLevel: 'harmonious'
    },
    'mercury-saturn': {
      title: "Structured Mind",
      description: "Your disciplined thinking creates opportunities through careful planning and methodical communication. Mastery comes through mental effort.",
      spiritualMeaning: "You're developing the master's mind - opportunities arise through patient study and structured thought.",
      keywords: ["discipline", "mastery", "opportunity", "structure", "focus"],
      harmonyLevel: 'harmonious'
    },
    'venus-jupiter': {
      title: "Love's Blessings",
      description: "Opportunities for love, beauty, and abundance flow naturally to you. Your generous heart attracts blessings in relationships and creativity.",
      spiritualMeaning: "You're blessed with the grace of love - opportunities for joy arise when you share your heart generously.",
      keywords: ["blessings", "love", "opportunity", "abundance", "grace"],
      harmonyLevel: 'harmonious'
    },
    'venus-saturn': {
      title: "Committed Beauty",
      description: "You create lasting love and beauty through patient effort. Opportunities for deep connection arise through loyal dedication.",
      spiritualMeaning: "You're mastering mature love - opportunities for true partnership come through commitment and enduring devotion.",
      keywords: ["commitment", "maturity", "opportunity", "dedication", "depth"],
      harmonyLevel: 'harmonious'
    },
    'mars-jupiter': {
      title: "Victorious Action",
      description: "Your actions create expansive opportunities. You achieve success through optimistic effort and confident assertion.",
      spiritualMeaning: "You're blessed with the warrior's faith - opportunities for victory arise when you act with courage and optimism.",
      keywords: ["victory", "expansion", "opportunity", "confidence", "success"],
      harmonyLevel: 'harmonious'
    },
    'mars-saturn': {
      title: "Disciplined Will",
      description: "Your controlled action creates lasting opportunities. Success comes through strategic effort and sustained determination.",
      spiritualMeaning: "You're mastering focused power - opportunities arise when you combine will with wisdom and act with discipline.",
      keywords: ["discipline", "strategy", "opportunity", "mastery", "endurance"],
      harmonyLevel: 'harmonious'
    },
    'jupiter-saturn': {
      title: "Practical Optimism",
      description: "You can manifest your dreams through practical steps and patient work. Your optimism is grounded in reality, making your goals achievable and lasting.",
      spiritualMeaning: "You serve as a bridge between the spiritual and material worlds, showing others how to manifest their highest visions with integrity.",
      keywords: ["manifestation", "practical wisdom", "patience", "achievement", "grounding"],
      harmonyLevel: 'harmonious'
    },
    'sun-uranus': {
      title: "Awakening Opportunities",
      description: "You create opportunities through authentic individuality and sudden insights. Your unique perspective opens unexpected doors.",
      spiritualMeaning: "You're blessed with the lightning of awakening - opportunities arise when you honor your authentic, revolutionary self.",
      keywords: ["awakening", "opportunity", "individuality", "insight", "revolution"],
      harmonyLevel: 'harmonious'
    },
    'sun-neptune': {
      title: "Inspired Opportunities",
      description: "You attract opportunities through spiritual sensitivity and creative vision. Your compassion and imagination open mystical pathways.",
      spiritualMeaning: "Divine inspiration guides your path - opportunities flow when you trust your dreams and honor your spiritual nature.",
      keywords: ["inspiration", "opportunity", "vision", "compassion", "mysticism"],
      harmonyLevel: 'harmonious'
    },
    'sun-pluto': {
      title: "Transformative Opportunities",
      description: "You create powerful opportunities through deep transformation and authentic power. Your intensity and insight open profound pathways.",
      spiritualMeaning: "You're blessed with regenerative force - opportunities arise through embracing your power and facilitating deep change.",
      keywords: ["transformation", "opportunity", "power", "intensity", "regeneration"],
      harmonyLevel: 'harmonious'
    },
    'moon-uranus': {
      title: "Emotional Liberation",
      description: "You create opportunities through emotional authenticity and intuitive breakthroughs. Your unique feelings open unexpected doors.",
      spiritualMeaning: "Freedom flows through your emotions - opportunities arise when you honor unconventional feelings and sudden insights.",
      keywords: ["liberation", "opportunity", "authenticity", "breakthrough", "freedom"],
      harmonyLevel: 'harmonious'
    },
    'moon-neptune': {
      title: "Psychic Opportunities",
      description: "You attract opportunities through emotional sensitivity and spiritual intuition. Your compassion and empathy create magical openings.",
      spiritualMeaning: "Mystical grace flows through your heart - opportunities arise when you trust your psychic feelings and emotional dreams.",
      keywords: ["psychic", "opportunity", "sensitivity", "empathy", "grace"],
      harmonyLevel: 'harmonious'
    },
    'moon-pluto': {
      title: "Emotional Depth Opportunities",
      description: "You create opportunities through emotional intensity and transformative feelings. Your depth and passion open powerful pathways.",
      spiritualMeaning: "Regenerative power flows through emotions - opportunities arise through embracing emotional truth and deep healing.",
      keywords: ["depth", "opportunity", "intensity", "transformation", "healing"],
      harmonyLevel: 'harmonious'
    },
    'mercury-uranus': {
      title: "Brilliant Ideas",
      description: "You create opportunities through original thinking and sudden insights. Your innovative mind opens unexpected pathways to success.",
      spiritualMeaning: "Lightning strikes your mind - opportunities flow when you trust breakthrough thoughts and communicate revolutionary ideas.",
      keywords: ["brilliance", "opportunity", "innovation", "insight", "revolution"],
      harmonyLevel: 'harmonious'
    },
    'mercury-neptune': {
      title: "Inspired Communication",
      description: "You attract opportunities through intuitive thinking and creative expression. Your imaginative mind creates mystical connections.",
      spiritualMeaning: "Divine whispers guide your thoughts - opportunities arise when you communicate from inspiration and trust subtle knowing.",
      keywords: ["inspiration", "opportunity", "creativity", "intuition", "mysticism"],
      harmonyLevel: 'harmonious'
    },
    'mercury-pluto': {
      title: "Penetrating Insight",
      description: "You create opportunities through deep investigation and transformative communication. Your powerful mind reveals hidden truths.",
      spiritualMeaning: "X-ray vision blesses your thoughts - opportunities flow when you speak truth and investigate beneath surfaces.",
      keywords: ["insight", "opportunity", "investigation", "truth", "power"],
      harmonyLevel: 'harmonious'
    },
    'venus-uranus': {
      title: "Unconventional Love",
      description: "You attract opportunities through unique affections and original creativity. Your authentic heart opens unexpected relational doors.",
      spiritualMeaning: "Love's freedom flows through you - opportunities arise when you honor unconventional beauty and revolutionary relationships.",
      keywords: ["unconventional", "opportunity", "love", "freedom", "originality"],
      harmonyLevel: 'harmonious'
    },
    'venus-neptune': {
      title: "Divine Love",
      description: "You create opportunities through spiritual affection and transcendent beauty. Your compassionate heart attracts mystical blessings.",
      spiritualMeaning: "Universal love flows through you - opportunities arise when you create beauty from spirit and love unconditionally.",
      keywords: ["divine", "opportunity", "love", "transcendence", "compassion"],
      harmonyLevel: 'harmonious'
    },
    'venus-pluto': {
      title: "Magnetic Love",
      description: "You attract opportunities through intense passion and transformative relationships. Your powerful heart creates profound connections.",
      spiritualMeaning: "Alchemical love flows through you - opportunities arise through deep vulnerability and transformative intimacy.",
      keywords: ["magnetic", "opportunity", "passion", "transformation", "alchemy"],
      harmonyLevel: 'harmonious'
    },
    'mars-uranus': {
      title: "Revolutionary Action",
      description: "You create opportunities through bold, innovative action and sudden breakthroughs. Your unique courage opens unexpected victories.",
      spiritualMeaning: "Lightning strikes through your will - opportunities flow when you act from authentic rebellion and trust sudden impulses.",
      keywords: ["revolution", "opportunity", "courage", "breakthrough", "innovation"],
      harmonyLevel: 'harmonious'
    },
    'mars-neptune': {
      title: "Inspired Action",
      description: "You attract opportunities through spiritually guided action and creative assertion. Your compassionate will creates magical results.",
      spiritualMeaning: "Divine purpose flows through your actions - opportunities arise when you fight for dreams and act from inspiration.",
      keywords: ["inspiration", "opportunity", "action", "purpose", "magic"],
      harmonyLevel: 'harmonious'
    },
    'mars-pluto': {
      title: "Unstoppable Will",
      description: "You create opportunities through transformative action and powerful assertion. Your intense drive achieves profound victories.",
      spiritualMeaning: "Regenerative power flows through your will - opportunities arise through fearless action and embracing your full strength.",
      keywords: ["unstoppable", "opportunity", "power", "transformation", "strength"],
      harmonyLevel: 'harmonious'
    }
  },
  trine: {
    'sun-moon': {
      title: "Natural Grace",
      description: "You possess an effortless grace where your personality and emotions flow together seamlessly. People are naturally drawn to your authentic, warm presence.",
      spiritualMeaning: "You embody the divine flow of life, showing others how to live authentically without struggle or internal conflict.",
      keywords: ["grace", "authenticity", "natural flow", "warmth", "ease"],
      harmonyLevel: 'harmonious'
    },
    'sun-mercury': {
      title: "Brilliant Expression",
      description: "Your identity and mind flow together with natural brilliance. You express who you are with effortless clarity and authentic communication.",
      spiritualMeaning: "You're a natural teacher whose very being communicates truth - your words and essence flow as one divine expression.",
      keywords: ["brilliance", "clarity", "expression", "teaching", "flow"],
      harmonyLevel: 'harmonious'
    },
    'sun-venus': {
      title: "Natural Beauty",
      description: "Love, beauty, and self-expression flow through you effortlessly. You radiate charm and attract blessings through your authentic presence.",
      spiritualMeaning: "You embody the principle that being yourself IS beauty - your natural state attracts love and creative abundance.",
      keywords: ["beauty", "charm", "love", "flow", "abundance"],
      harmonyLevel: 'harmonious'
    },
    'sun-mars': {
      title: "Victorious Flow",
      description: "Your will and identity move together with natural power. You achieve your goals through effortless action and confident self-expression.",
      spiritualMeaning: "You demonstrate that true power flows without force - when aligned with your essence, victory comes naturally.",
      keywords: ["power", "victory", "flow", "confidence", "achievement"],
      harmonyLevel: 'harmonious'
    },
    'moon-mercury': {
      title: "Emotional Wisdom",
      description: "Your feelings and thoughts flow together naturally, creating emotional wisdom and intuitive understanding. You communicate from the heart with ease.",
      spiritualMeaning: "You bridge heart and mind effortlessly - your emotional intelligence flows into wise words and compassionate understanding.",
      keywords: ["wisdom", "flow", "intuition", "communication", "compassion"],
      harmonyLevel: 'harmonious'
    },
    'moon-venus': {
      title: "Loving Flow",
      description: "Love and emotional security flow through you effortlessly. You nurture through beauty and find comfort in creating harmonious environments.",
      spiritualMeaning: "You channel divine feminine grace - your natural state creates emotional warmth and loving spaces wherever you go.",
      keywords: ["love", "grace", "nurturing", "flow", "harmony"],
      harmonyLevel: 'harmonious'
    },
    'moon-mars': {
      title: "Instinctive Power",
      description: "Your emotions and actions flow together with natural courage. You act on your feelings effectively and defend what matters with ease.",
      spiritualMeaning: "You show that emotional power flows best when honored - your instincts guide you to courageous, effective action.",
      keywords: ["courage", "power", "instinct", "flow", "effectiveness"],
      harmonyLevel: 'harmonious'
    },
    'mercury-venus': {
      title: "Eloquent Grace",
      description: "Your words flow with natural charm and beauty. Communication becomes art through your graceful, diplomatic expression.",
      spiritualMeaning: "You demonstrate that language can create beauty - your words flow as poetry, creating harmony and understanding.",
      keywords: ["eloquence", "grace", "beauty", "flow", "harmony"],
      harmonyLevel: 'harmonious'
    },
    'mercury-mars': {
      title: "Mental Power",
      description: "Your thoughts flow directly into action with impressive speed and effectiveness. Mental clarity creates swift, decisive results.",
      spiritualMeaning: "You channel the power of aligned mind and will - your thoughts manifest through immediate, effective action.",
      keywords: ["power", "speed", "effectiveness", "flow", "clarity"],
      harmonyLevel: 'harmonious'
    },
    'venus-mars': {
      title: "Divine Creativity",
      description: "Your creative and romantic energies flow like a beautiful dance. You have a natural talent for creating beauty and inspiring love wherever you go.",
      spiritualMeaning: "You channel the divine creative force through love and passion, bringing heaven to earth through your artistic and relational gifts.",
      keywords: ["divine creativity", "artistic talent", "romance", "inspiration", "beauty"],
      harmonyLevel: 'harmonious'
    },
    'sun-jupiter': {
      title: "Natural Abundance",
      description: "Success and expansion flow through you effortlessly. Your natural optimism and generous spirit attract blessings without effort.",
      spiritualMeaning: "You embody divine grace - abundance is your natural state and your presence itself expands possibilities for everyone.",
      keywords: ["abundance", "grace", "expansion", "flow", "optimism"],
      harmonyLevel: 'harmonious'
    },
    'sun-saturn': {
      title: "Effortless Mastery",
      description: "Authority and discipline flow naturally from your being. You achieve mastery with patience that feels innate rather than forced.",
      spiritualMeaning: "You're a natural master - your soul knows how to build lasting structures and your wisdom flows without struggle.",
      keywords: ["mastery", "authority", "flow", "wisdom", "natural"],
      harmonyLevel: 'harmonious'
    },
    'moon-jupiter': {
      title: "Emotional Grace",
      description: "Emotional wisdom and optimism flow through you naturally. Your feelings create expansion and your heart radiates hope effortlessly.",
      spiritualMeaning: "You're blessed with emotional faith - your natural state is trust, and your feelings create miracles without trying.",
      keywords: ["grace", "optimism", "flow", "faith", "expansion"],
      harmonyLevel: 'harmonious'
    },
    'moon-saturn': {
      title: "Natural Emotional Wisdom",
      description: "Emotional maturity and security flow through you effortlessly. You provide stability and structure to others' feelings with natural ease.",
      spiritualMeaning: "You're a natural emotional anchor - your soul knows how to create security and your maturity flows without effort.",
      keywords: ["maturity", "wisdom", "flow", "security", "natural"],
      harmonyLevel: 'harmonious'
    },
    'mercury-jupiter': {
      title: "Natural Wisdom",
      description: "Expansive thinking and philosophical insight flow through you effortlessly. Your mind naturally reaches for truth and understanding.",
      spiritualMeaning: "You're a natural philosopher - wisdom flows through your thoughts and your words expand consciousness without trying.",
      keywords: ["wisdom", "expansion", "flow", "philosophy", "natural"],
      harmonyLevel: 'harmonious'
    },
    'mercury-saturn': {
      title: "Effortless Focus",
      description: "Mental discipline and structured thinking come naturally to you. Your mind organizes information with innate precision.",
      spiritualMeaning: "You're a natural scholar - your thoughts naturally create order and your focus flows without forcing.",
      keywords: ["focus", "discipline", "flow", "precision", "natural"],
      harmonyLevel: 'harmonious'
    },
    'venus-jupiter': {
      title: "Natural Love",
      description: "Love, beauty, and abundance flow through you effortlessly. Your heart naturally creates joy and attracts blessings.",
      spiritualMeaning: "You embody love's grace - beauty is your natural expression and your heart expands love without effort.",
      keywords: ["love", "grace", "flow", "abundance", "beauty"],
      harmonyLevel: 'harmonious'
    },
    'venus-saturn': {
      title: "Enduring Beauty",
      description: "Loyal love and lasting beauty flow from you naturally. Your commitments feel like natural expressions rather than obligations.",
      spiritualMeaning: "You're a natural partner - your soul knows how to build lasting love and your devotion flows without struggle.",
      keywords: ["devotion", "beauty", "flow", "commitment", "natural"],
      harmonyLevel: 'harmonious'
    },
    'mars-jupiter': {
      title: "Natural Victory",
      description: "Confident action and expansion flow through you effortlessly. You achieve success through natural courage and optimistic drive.",
      spiritualMeaning: "You're a natural champion - victory flows through your actions and your will expands possibilities without forcing.",
      keywords: ["victory", "courage", "flow", "expansion", "natural"],
      harmonyLevel: 'harmonious'
    },
    'mars-saturn': {
      title: "Strategic Power",
      description: "Disciplined action and focused will come naturally to you. Your power flows through patience and strategic effort feels effortless.",
      spiritualMeaning: "You're a natural strategist - your power flows through wisdom and your discipline feels like natural expression.",
      keywords: ["strategy", "power", "flow", "discipline", "natural"],
      harmonyLevel: 'harmonious'
    },
    'jupiter-saturn': {
      title: "Masterful Growth",
      description: "You have a natural ability to grow and achieve success through disciplined expansion. Your wisdom comes through experience and you teach through example.",
      spiritualMeaning: "You are a master teacher who understands both the heights of vision and the depths of practical wisdom, guiding others on the path of conscious evolution.",
      keywords: ["mastery", "teaching", "wisdom", "success", "evolution"],
      harmonyLevel: 'harmonious'
    },
    'sun-uranus': {
      title: "Natural Innovation",
      description: "Authentic individuality and breakthrough insights flow through you effortlessly. You naturally inspire revolution and awaken others.",
      spiritualMeaning: "You're a natural awakener - your very being sparks innovation and your uniqueness flows without struggle.",
      keywords: ["innovation", "flow", "awakening", "authenticity", "natural"],
      harmonyLevel: 'harmonious'
    },
    'sun-neptune': {
      title: "Divine Presence",
      description: "Spiritual grace and creative vision flow through you naturally. Your compassion and imagination radiate without effort.",
      spiritualMeaning: "You're a natural mystic - divine love flows through your essence and your dreams manifest with grace.",
      keywords: ["divine", "flow", "grace", "vision", "natural"],
      harmonyLevel: 'harmonious'
    },
    'sun-pluto': {
      title: "Natural Power",
      description: "Transformative force and authentic power flow through you effortlessly. Your intensity and depth feel innate rather than cultivated.",
      spiritualMeaning: "You're a natural alchemist - regenerative power flows through your being and transformation comes without forcing.",
      keywords: ["power", "flow", "transformation", "natural", "alchemy"],
      harmonyLevel: 'harmonious'
    },
    'moon-uranus': {
      title: "Natural Freedom",
      description: "Emotional authenticity and intuitive breakthroughs flow through you effortlessly. Your unique feelings guide you naturally.",
      spiritualMeaning: "You're naturally liberated - emotional freedom flows through your heart and authentic feelings arise without struggle.",
      keywords: ["freedom", "flow", "authenticity", "natural", "liberation"],
      harmonyLevel: 'harmonious'
    },
    'moon-neptune': {
      title: "Natural Empathy",
      description: "Psychic sensitivity and spiritual compassion flow through you effortlessly. Your empathy and intuition feel innate.",
      spiritualMeaning: "You're a natural empath - mystical feelings flow through your heart and spiritual connection comes without trying.",
      keywords: ["empathy", "flow", "psychic", "natural", "mysticism"],
      harmonyLevel: 'harmonious'
    },
    'moon-pluto': {
      title: "Natural Depth",
      description: "Emotional intensity and transformative feelings flow through you effortlessly. Your passion and healing power feel innate.",
      spiritualMeaning: "You're naturally profound - regenerative emotions flow through your being and deep healing comes without forcing.",
      keywords: ["depth", "flow", "intensity", "natural", "healing"],
      harmonyLevel: 'harmonious'
    },
    'mercury-uranus': {
      title: "Natural Genius",
      description: "Innovative thinking and sudden insights flow through you effortlessly. Your brilliant mind operates with natural originality.",
      spiritualMeaning: "You're a natural genius - revolutionary thoughts flow through your mind and breakthrough ideas come without struggle.",
      keywords: ["genius", "flow", "innovation", "natural", "brilliance"],
      harmonyLevel: 'harmonious'
    },
    'mercury-neptune': {
      title: "Natural Intuition",
      description: "Intuitive thinking and inspired communication flow through you effortlessly. Your imagination and spiritual knowing feel innate.",
      spiritualMeaning: "You're naturally inspired - divine whispers flow through your thoughts and mystical understanding comes without trying.",
      keywords: ["intuition", "flow", "inspiration", "natural", "mysticism"],
      harmonyLevel: 'harmonious'
    },
    'mercury-pluto': {
      title: "Natural Penetration",
      description: "Deep investigation and transformative insight flow through you effortlessly. Your powerful mind sees truth naturally.",
      spiritualMeaning: "You're naturally perceptive - x-ray vision flows through your thoughts and profound truth reveals itself without forcing.",
      keywords: ["penetration", "flow", "insight", "natural", "truth"],
      harmonyLevel: 'harmonious'
    },
    'venus-uranus': {
      title: "Natural Originality",
      description: "Unconventional love and unique beauty flow through you effortlessly. Your authentic heart attracts blessings naturally.",
      spiritualMeaning: "You're naturally free in love - revolutionary affection flows through your heart and unique beauty comes without trying.",
      keywords: ["originality", "flow", "love", "natural", "freedom"],
      harmonyLevel: 'harmonious'
    },
    'venus-neptune': {
      title: "Natural Compassion",
      description: "Universal love and transcendent beauty flow through you effortlessly. Your spiritual heart radiates grace naturally.",
      spiritualMeaning: "You're naturally divine in love - unconditional affection flows through your being and mystical beauty comes without effort.",
      keywords: ["compassion", "flow", "love", "natural", "divine"],
      harmonyLevel: 'harmonious'
    },
    'venus-pluto': {
      title: "Natural Magnetism",
      description: "Intense passion and transformative love flow through you effortlessly. Your powerful heart attracts deep connection naturally.",
      spiritualMeaning: "You're naturally magnetic - alchemical love flows through your being and profound intimacy comes without forcing.",
      keywords: ["magnetism", "flow", "passion", "natural", "alchemy"],
      harmonyLevel: 'harmonious'
    },
    'mars-uranus': {
      title: "Natural Revolution",
      description: "Bold innovation and breakthrough action flow through you effortlessly. Your unique courage expresses naturally.",
      spiritualMeaning: "You're a natural revolutionary - lightning-fast will flows through your being and authentic rebellion comes without struggle.",
      keywords: ["revolution", "flow", "courage", "natural", "innovation"],
      harmonyLevel: 'harmonious'
    },
    'mars-neptune': {
      title: "Natural Inspiration",
      description: "Spiritually guided action and creative assertion flow through you effortlessly. Your compassionate will operates naturally.",
      spiritualMeaning: "You're naturally inspired in action - divine purpose flows through your will and magical deeds come without forcing.",
      keywords: ["inspiration", "flow", "action", "natural", "divine"],
      harmonyLevel: 'harmonious'
    },
    'mars-pluto': {
      title: "Natural Intensity",
      description: "Transformative power and unstoppable will flow through you effortlessly. Your regenerative force expresses naturally.",
      spiritualMeaning: "You're naturally powerful - volcanic energy flows through your being and profound strength comes without struggle.",
      keywords: ["intensity", "flow", "power", "natural", "transformation"],
      harmonyLevel: 'harmonious'
    }
  },
  square: {
    'sun-moon': {
      title: "Inner Tension for Growth",
      description: "You experience dynamic tension between your conscious goals and emotional needs. This internal friction, while challenging, drives tremendous personal growth and strength.",
      spiritualMeaning: "Your soul chose this tension to develop fierce authenticity and emotional mastery. Your struggles become your greatest strengths.",
      keywords: ["growth", "tension", "strength", "authenticity", "mastery"],
      harmonyLevel: 'challenging'
    },
    'sun-mercury': {
      title: "Mental Friction",
      description: "Your identity and thoughts sometimes clash, creating tension between who you are and how you think. This friction develops sharp mental clarity through challenge.",
      spiritualMeaning: "You're learning to align mind and soul - the tension between thinking and being forges authentic self-expression through effort.",
      keywords: ["challenge", "clarity", "growth", "alignment", "effort"],
      harmonyLevel: 'challenging'
    },
    'sun-venus': {
      title: "Love Lessons",
      description: "Tension exists between your sense of self and your approach to love and beauty. You must work to integrate self-worth with relationships.",
      spiritualMeaning: "You're learning that true love begins with self - the challenge of loving yourself creates capacity to love others authentically.",
      keywords: ["challenge", "self-worth", "love", "integration", "growth"],
      harmonyLevel: 'challenging'
    },
    'sun-mars': {
      title: "Will Conflict",
      description: "Your identity and drive sometimes conflict, creating internal battles about how to assert yourself. This tension builds powerful self-awareness.",
      spiritualMeaning: "You're learning to align who you are with what you do - the friction between being and acting creates conscious mastery of will.",
      keywords: ["conflict", "will", "mastery", "challenge", "awareness"],
      harmonyLevel: 'challenging'
    },
    'moon-mercury': {
      title: "Heart-Mind Tension",
      description: "Your feelings and thoughts sometimes clash, creating internal debates between emotion and logic. This develops sophisticated emotional intelligence.",
      spiritualMeaning: "You're learning to honor both heart and mind - the challenge of integrating feeling and thinking creates profound wisdom.",
      keywords: ["tension", "wisdom", "integration", "challenge", "intelligence"],
      harmonyLevel: 'challenging'
    },
    'moon-venus': {
      title: "Emotional-Love Friction",
      description: "Tension between your emotional needs and how you express love creates relationship challenges that deepen your capacity for authentic connection.",
      spiritualMeaning: "You're learning that emotional security and love aren't always the same - this challenge teaches mature, conscious affection.",
      keywords: ["challenge", "maturity", "love", "growth", "depth"],
      harmonyLevel: 'challenging'
    },
    'moon-mars': {
      title: "Emotional Battles",
      description: "Your feelings and actions sometimes war with each other, creating passionate intensity and reactive patterns. This builds emotional courage through challenge.",
      spiritualMeaning: "You're mastering the warrior's heart - learning to act courageously without being controlled by emotional reactivity.",
      keywords: ["courage", "challenge", "passion", "mastery", "intensity"],
      harmonyLevel: 'challenging'
    },
    'mercury-venus': {
      title: "Mind-Heart Friction",
      description: "Tension between your thinking and values creates challenges in communication and relationships. This develops conscious, thoughtful expression of love.",
      spiritualMeaning: "You're learning to speak from the heart with clarity - the challenge of aligning words and love creates authentic communication.",
      keywords: ["challenge", "communication", "authenticity", "growth", "clarity"],
      harmonyLevel: 'challenging'
    },
    'mercury-mars': {
      title: "Thought-Action Conflict",
      description: "Your mind and will sometimes clash, creating impulsive speech or mental paralysis. This tension teaches conscious, powerful communication.",
      spiritualMeaning: "You're mastering the art of wise action - learning when to speak, when to act, and when to pause through challenging friction.",
      keywords: ["challenge", "mastery", "communication", "action", "wisdom"],
      harmonyLevel: 'challenging'
    },
    'venus-mars': {
      title: "Passionate Challenges",
      description: "Your desires and actions sometimes conflict, creating passionate intensity in relationships and creative endeavors. You must learn to balance wanting and acting.",
      spiritualMeaning: "This aspect teaches you about the sacred fire of desire and the importance of conscious choice in love and creativity.",
      keywords: ["passion", "intensity", "desire", "challenge", "fire"],
      harmonyLevel: 'challenging'
    },
    'sun-jupiter': {
      title: "Excessive Optimism",
      description: "Tension between your core self and expansive tendencies creates challenges with overconfidence or unrealistic expectations. Growth comes through balancing faith with reality.",
      spiritualMeaning: "You're learning that true expansion requires discernment - the challenge of excessive optimism teaches wise, grounded faith.",
      keywords: ["challenge", "excess", "optimism", "growth", "discernment"],
      harmonyLevel: 'challenging'
    },
    'sun-saturn': {
      title: "Self-Restriction",
      description: "Tension between your identity and limitations creates challenges with self-doubt or excessive responsibility. Mastery comes through honoring both freedom and structure.",
      spiritualMeaning: "You're learning that true authority comes from within - the challenge of restriction teaches authentic self-empowerment.",
      keywords: ["challenge", "restriction", "mastery", "growth", "authority"],
      harmonyLevel: 'challenging'
    },
    'moon-jupiter': {
      title: "Emotional Excess",
      description: "Tension between emotions and expansion creates challenges with mood swings or unrealistic emotional expectations. Growth comes through emotional wisdom.",
      spiritualMeaning: "You're learning to trust feelings without drowning in them - the challenge teaches balanced emotional faith.",
      keywords: ["challenge", "excess", "emotions", "growth", "balance"],
      harmonyLevel: 'challenging'
    },
    'moon-saturn': {
      title: "Emotional Restriction",
      description: "Tension between feelings and control creates challenges with emotional coldness or fear of vulnerability. Growth comes through safe emotional expression.",
      spiritualMeaning: "You're learning that emotional control and feeling deeply aren't opposites - the challenge teaches mature emotional authenticity.",
      keywords: ["challenge", "restriction", "emotions", "growth", "maturity"],
      harmonyLevel: 'challenging'
    },
    'mercury-jupiter': {
      title: "Mental Excess",
      description: "Tension between thinking and expansion creates challenges with scattered thoughts or over-promising. Growth comes through focused optimism.",
      spiritualMeaning: "You're learning that wisdom requires focus - the challenge of mental excess teaches discerning truth from possibility.",
      keywords: ["challenge", "excess", "thinking", "growth", "focus"],
      harmonyLevel: 'challenging'
    },
    'mercury-saturn': {
      title: "Mental Blockage",
      description: "Tension between thoughts and limitations creates challenges with negative thinking or communication fears. Growth comes through structured confidence.",
      spiritualMeaning: "You're learning that discipline enhances rather than limits thought - the challenge teaches masterful, authoritative communication.",
      keywords: ["challenge", "blockage", "thinking", "growth", "mastery"],
      harmonyLevel: 'challenging'
    },
    'venus-jupiter': {
      title: "Love Excess",
      description: "Tension between love and expansion creates challenges with overindulgence or unrealistic relationship expectations. Growth comes through balanced generosity.",
      spiritualMeaning: "You're learning that more isn't always better in love - the challenge teaches wise, sustainable affection and beauty.",
      keywords: ["challenge", "excess", "love", "growth", "balance"],
      harmonyLevel: 'challenging'
    },
    'venus-saturn': {
      title: "Love Restriction",
      description: "Tension between love and limitation creates challenges with fear of intimacy or relationship coldness. Growth comes through committed vulnerability.",
      spiritualMeaning: "You're learning that walls don't protect the heart - the challenge teaches opening to mature, lasting love through courage.",
      keywords: ["challenge", "restriction", "love", "growth", "commitment"],
      harmonyLevel: 'challenging'
    },
    'mars-jupiter': {
      title: "Action Excess",
      description: "Tension between will and expansion creates challenges with recklessness or scattered energy. Growth comes through focused, strategic action.",
      spiritualMeaning: "You're learning that power requires direction - the challenge of impulsive action teaches wise, effective assertion.",
      keywords: ["challenge", "excess", "action", "growth", "strategy"],
      harmonyLevel: 'challenging'
    },
    'mars-saturn': {
      title: "Frustrated Will",
      description: "Tension between action and limitation creates challenges with blocked energy or fear of assertion. Growth comes through patient, strategic power.",
      spiritualMeaning: "You're learning that true power is patient - the challenge of frustration teaches enduring, masterful will.",
      keywords: ["challenge", "frustration", "will", "growth", "mastery"],
      harmonyLevel: 'challenging'
    },
    'jupiter-saturn': {
      title: "Wisdom Through Restriction",
      description: "You face ongoing tension between your desire to expand and the need for limits. This creates wisdom through learning when to grow and when to consolidate.",
      spiritualMeaning: "You are learning the most advanced spiritual lesson: how to find freedom within structure and expansion within limits.",
      keywords: ["wisdom", "restriction", "learning", "balance", "freedom"],
      harmonyLevel: 'challenging'
    },
    'sun-uranus': {
      title: "Rebellious Identity",
      description: "Tension between self-expression and rebellion creates challenges with instability or alienation. Growth comes through integrating uniqueness with stability.",
      spiritualMeaning: "You're learning that true freedom requires foundation - the challenge of disruption teaches grounded authenticity.",
      keywords: ["challenge", "rebellion", "identity", "growth", "freedom"],
      harmonyLevel: 'challenging'
    },
    'sun-neptune': {
      title: "Dissolving Ego",
      description: "Tension between identity and dissolution creates challenges with confusion or escapism. Growth comes through grounded spirituality.",
      spiritualMeaning: "You're learning to be both human and divine - the challenge of confusion teaches clear spiritual vision.",
      keywords: ["challenge", "dissolution", "identity", "growth", "clarity"],
      harmonyLevel: 'challenging'
    },
    'sun-pluto': {
      title: "Power Struggles",
      description: "Tension between self and transformation creates challenges with control issues or intensity. Growth comes through conscious empowerment.",
      spiritualMeaning: "You're learning that true power serves - the challenge of control teaches authentic, regenerative strength.",
      keywords: ["challenge", "power", "transformation", "growth", "control"],
      harmonyLevel: 'challenging'
    },
    'moon-uranus': {
      title: "Emotional Disruption",
      description: "Tension between feelings and freedom creates challenges with emotional instability or detachment. Growth comes through stable authenticity.",
      spiritualMeaning: "You're learning to be both free and feeling - the challenge teaches emotionally grounded liberation.",
      keywords: ["challenge", "disruption", "emotions", "growth", "freedom"],
      harmonyLevel: 'challenging'
    },
    'moon-neptune': {
      title: "Emotional Confusion",
      description: "Tension between emotions and dissolution creates challenges with boundary issues or emotional fog. Growth comes through clear compassion.",
      spiritualMeaning: "You're learning to feel without drowning - the challenge teaches empathy with emotional clarity.",
      keywords: ["challenge", "confusion", "emotions", "growth", "clarity"],
      harmonyLevel: 'challenging'
    },
    'moon-pluto': {
      title: "Emotional Intensity",
      description: "Tension between feelings and power creates challenges with emotional manipulation or overwhelming passion. Growth comes through conscious feeling.",
      spiritualMeaning: "You're learning that emotions need not control - the challenge teaches powerful emotional mastery.",
      keywords: ["challenge", "intensity", "emotions", "growth", "mastery"],
      harmonyLevel: 'challenging'
    },
    'mercury-uranus': {
      title: "Mental Disruption",
      description: "Tension between thinking and innovation creates challenges with scattered thoughts or mental rebellion. Growth comes through focused brilliance.",
      spiritualMeaning: "You're learning that genius needs grounding - the challenge teaches revolutionary thinking with clarity.",
      keywords: ["challenge", "disruption", "thinking", "growth", "brilliance"],
      harmonyLevel: 'challenging'
    },
    'mercury-neptune': {
      title: "Mental Fog",
      description: "Tension between logic and intuition creates challenges with confusion or deception. Growth comes through integrated knowing.",
      spiritualMeaning: "You're learning to think and feel truth - the challenge teaches clear intuitive communication.",
      keywords: ["challenge", "fog", "thinking", "growth", "clarity"],
      harmonyLevel: 'challenging'
    },
    'mercury-pluto': {
      title: "Mental Obsession",
      description: "Tension between thinking and intensity creates challenges with obsessive thoughts or mental power struggles. Growth comes through peaceful depth.",
      spiritualMeaning: "You're learning that truth needs not force - the challenge teaches powerful yet peaceful investigation.",
      keywords: ["challenge", "obsession", "thinking", "growth", "depth"],
      harmonyLevel: 'challenging'
    },
    'venus-uranus': {
      title: "Love Disruption",
      description: "Tension between love and freedom creates challenges with relationship instability or fear of commitment. Growth comes through free intimacy.",
      spiritualMeaning: "You're learning to be both free and connected - the challenge teaches liberated love.",
      keywords: ["challenge", "disruption", "love", "growth", "freedom"],
      harmonyLevel: 'challenging'
    },
    'venus-neptune': {
      title: "Love Illusion",
      description: "Tension between affection and idealization creates challenges with unrealistic love or deception. Growth comes through grounded compassion.",
      spiritualMeaning: "You're learning to love what's real - the challenge teaches spiritual love grounded in truth.",
      keywords: ["challenge", "illusion", "love", "growth", "reality"],
      harmonyLevel: 'challenging'
    },
    'venus-pluto': {
      title: "Love Obsession",
      description: "Tension between affection and intensity creates challenges with possessive love or relationship power struggles. Growth comes through transformative release.",
      spiritualMeaning: "You're learning that love is freedom - the challenge teaches powerful affection without possession.",
      keywords: ["challenge", "obsession", "love", "growth", "transformation"],
      harmonyLevel: 'challenging'
    },
    'mars-uranus': {
      title: "Reckless Action",
      description: "Tension between will and rebellion creates challenges with impulsive action or accidents. Growth comes through conscious revolution.",
      spiritualMeaning: "You're learning that freedom requires wisdom - the challenge teaches revolutionary action with awareness.",
      keywords: ["challenge", "recklessness", "action", "growth", "awareness"],
      harmonyLevel: 'challenging'
    },
    'mars-neptune': {
      title: "Confused Action",
      description: "Tension between assertion and dissolution creates challenges with misdirected energy or passive aggression. Growth comes through inspired clarity.",
      spiritualMeaning: "You're learning to act from vision - the challenge teaches spiritually guided action with clear purpose.",
      keywords: ["challenge", "confusion", "action", "growth", "clarity"],
      harmonyLevel: 'challenging'
    },
    'mars-pluto': {
      title: "Ruthless Will",
      description: "Tension between action and intensity creates challenges with compulsive behavior or destructive power. Growth comes through conscious strength.",
      spiritualMeaning: "You're learning that true power regenerates - the challenge teaches transformative will without destruction.",
      keywords: ["challenge", "ruthlessness", "will", "growth", "transformation"],
      harmonyLevel: 'challenging'
    }
  },
  opposition: {
    'sun-moon': {
      title: "Conscious Integration",
      description: "You experience a powerful pull between your conscious self and your emotional nature. Learning to balance these opposing forces creates remarkable self-awareness and empathy.",
      spiritualMeaning: "You are here to master the art of conscious relationship - first with yourself, then with others. Your internal dialogue becomes external wisdom.",
      keywords: ["integration", "balance", "awareness", "empathy", "relationship"],
      harmonyLevel: 'dynamic'
    },
    'sun-mercury': {
      title: "Self-Thought Polarity",
      description: "You experience tension between your core identity and how you think and communicate. Balancing this creates powerful objective self-awareness.",
      spiritualMeaning: "You're learning to see yourself clearly - the polarity between being and perceiving creates conscious self-knowledge and wisdom.",
      keywords: ["polarity", "awareness", "objectivity", "balance", "wisdom"],
      harmonyLevel: 'dynamic'
    },
    'sun-venus': {
      title: "Self-Love Balance",
      description: "You navigate the dynamic between self-expression and relationship needs. Mastering this polarity creates authentic love that honors both self and other.",
      spiritualMeaning: "You're learning the sacred balance - how to be fully yourself while deeply connecting with others in love and partnership.",
      keywords: ["balance", "love", "relationship", "authenticity", "connection"],
      harmonyLevel: 'dynamic'
    },
    'sun-mars': {
      title: "Being-Doing Polarity",
      description: "You experience tension between who you are and how you act in the world. Integrating this creates purposeful, authentic action.",
      spiritualMeaning: "You're mastering conscious will - learning to align your actions with your essence through the dynamic of opposition.",
      keywords: ["polarity", "action", "purpose", "integration", "will"],
      harmonyLevel: 'dynamic'
    },
    'moon-mercury': {
      title: "Feeling-Thinking Balance",
      description: "You navigate the polarity between emotional truth and mental clarity. This creates the ability to understand both heart and mind objectively.",
      spiritualMeaning: "You're learning to honor both emotion and reason - the opposition creates wise, balanced understanding of human nature.",
      keywords: ["balance", "wisdom", "understanding", "polarity", "integration"],
      harmonyLevel: 'dynamic'
    },
    'moon-venus': {
      title: "Emotional-Relational Polarity",
      description: "You balance between your emotional needs and relationship harmony. This dynamic creates mature, conscious approaches to love and connection.",
      spiritualMeaning: "You're learning that true connection honors both personal feelings and relational beauty - integration creates authentic love.",
      keywords: ["polarity", "love", "maturity", "balance", "connection"],
      harmonyLevel: 'dynamic'
    },
    'moon-mars': {
      title: "Emotion-Action Dynamic",
      description: "You experience the push-pull between feeling and doing. Balancing this creates emotional courage and effective, heart-centered action.",
      spiritualMeaning: "You're learning to act from the heart wisely - the opposition teaches when to feel and when to act for maximum impact.",
      keywords: ["dynamic", "courage", "balance", "action", "heart"],
      harmonyLevel: 'dynamic'
    },
    'mercury-venus': {
      title: "Mind-Heart Polarity",
      description: "You navigate between logical thinking and heart-centered values. This creates the ability to communicate love with clarity and wisdom.",
      spiritualMeaning: "You're learning that head and heart can work together - the polarity creates communication that's both clear and loving.",
      keywords: ["polarity", "communication", "love", "clarity", "wisdom"],
      harmonyLevel: 'dynamic'
    },
    'mercury-mars': {
      title: "Thought-Action Opposition",
      description: "You balance between thinking and acting, creating dynamic tension that can be either paralyzing or powerfully strategic.",
      spiritualMeaning: "You're mastering conscious action - learning through polarity when to think, when to act, and how to unite both.",
      keywords: ["opposition", "strategy", "action", "balance", "mastery"],
      harmonyLevel: 'dynamic'
    },
    'venus-mars': {
      title: "Relationship Alchemy",
      description: "You feel torn between love and desire, creating intense relationship dynamics. Mastering this opposition leads to deep understanding of love's many faces.",
      spiritualMeaning: "You are learning about the sacred polarities of love - how giving and receiving, desiring and surrendering create the alchemy of true partnership.",
      keywords: ["polarity", "alchemy", "relationship", "intensity", "understanding"],
      harmonyLevel: 'dynamic'
    },
    'sun-jupiter': {
      title: "Faith-Reality Balance",
      description: "You balance between confidence and excess, self and expansion. Integrating this polarity creates wise optimism grounded in authentic self-knowledge.",
      spiritualMeaning: "You're learning to expand from a centered self - the polarity teaches how faith and identity dance to create conscious abundance.",
      keywords: ["polarity", "faith", "balance", "expansion", "integration"],
      harmonyLevel: 'dynamic'
    },
    'sun-saturn': {
      title: "Authority Balance",
      description: "You navigate between self-expression and responsibility, freedom and structure. This polarity creates mature, authentic authority.",
      spiritualMeaning: "You're mastering the balance of power - learning how true authority honors both self and duty through conscious integration.",
      keywords: ["polarity", "authority", "balance", "mastery", "integration"],
      harmonyLevel: 'dynamic'
    },
    'moon-jupiter': {
      title: "Emotional-Faith Polarity",
      description: "You balance between emotional needs and optimistic expansion. This dynamic creates mature emotional wisdom that trusts without denial.",
      spiritualMeaning: "You're learning to feel and have faith simultaneously - the polarity teaches how emotion and optimism create balanced trust.",
      keywords: ["polarity", "emotion", "faith", "balance", "wisdom"],
      harmonyLevel: 'dynamic'
    },
    'moon-saturn': {
      title: "Security-Structure Balance",
      description: "You navigate between emotional needs and practical limits. This polarity creates mature emotional security through balanced vulnerability and strength.",
      spiritualMeaning: "You're integrating feeling and form - learning how emotional depth and structural wisdom create true security.",
      keywords: ["polarity", "security", "balance", "maturity", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mercury-jupiter': {
      title: "Detail-Vision Balance",
      description: "You balance between focused thinking and expansive vision. This polarity creates philosophical wisdom grounded in clear communication.",
      spiritualMeaning: "You're learning to see both forest and trees - the opposition teaches how detail and vision create comprehensive understanding.",
      keywords: ["polarity", "vision", "balance", "wisdom", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mercury-saturn': {
      title: "Thought-Form Polarity",
      description: "You navigate between fluid thinking and structured discipline. This dynamic creates authoritative communication through balanced freedom and focus.",
      spiritualMeaning: "You're mastering mental integration - learning how spontaneous thought and disciplined focus create masterful expression.",
      keywords: ["polarity", "mastery", "balance", "authority", "integration"],
      harmonyLevel: 'dynamic'
    },
    'venus-jupiter': {
      title: "Love-Abundance Balance",
      description: "You balance between relationship needs and expansive generosity. This polarity creates wise love that's both intimate and generous.",
      spiritualMeaning: "You're integrating connection and expansion - learning how personal love and universal blessing create abundant relationships.",
      keywords: ["polarity", "love", "abundance", "balance", "integration"],
      harmonyLevel: 'dynamic'
    },
    'venus-saturn': {
      title: "Intimacy-Commitment Balance",
      description: "You navigate between emotional warmth and practical commitment. This polarity creates mature love through balanced vulnerability and dedication.",
      spiritualMeaning: "You're mastering relationship wisdom - learning how emotional openness and loyal commitment create lasting partnership.",
      keywords: ["polarity", "commitment", "balance", "maturity", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mars-jupiter': {
      title: "Action-Vision Balance",
      description: "You balance between immediate action and expansive goals. This polarity creates effective achievement through integrated will and faith.",
      spiritualMeaning: "You're learning strategic expansion - how focused action and broad vision create manifested dreams through balanced effort.",
      keywords: ["polarity", "action", "vision", "balance", "achievement"],
      harmonyLevel: 'dynamic'
    },
    'mars-saturn': {
      title: "Will-Discipline Balance",
      description: "You navigate between assertive drive and patient control. This polarity creates masterful power through integrated action and wisdom.",
      spiritualMeaning: "You're mastering conscious will - learning how immediate power and long-term strategy create enduring victory.",
      keywords: ["polarity", "mastery", "balance", "power", "integration"],
      harmonyLevel: 'dynamic'
    },
    'jupiter-saturn': {
      title: "Philosophical Tension",
      description: "You swing between boundless optimism and practical restriction. This creates a lifelong journey of finding meaning through both expansion and limitation.",
      spiritualMeaning: "You embody the cosmic tension between infinite possibility and manifest reality, teaching others about the dance between faith and responsibility.",
      keywords: ["tension", "philosophy", "meaning", "possibility", "responsibility"],
      harmonyLevel: 'dynamic'
    },
    'sun-uranus': {
      title: "Identity-Freedom Balance",
      description: "You balance between stable self-expression and revolutionary change. This polarity creates authentic individuality through integrated uniqueness and foundation.",
      spiritualMeaning: "You're learning to be both grounded and free - the polarity teaches how stability and revolution create conscious awakening.",
      keywords: ["polarity", "freedom", "balance", "identity", "integration"],
      harmonyLevel: 'dynamic'
    },
    'sun-neptune': {
      title: "Ego-Spirit Balance",
      description: "You navigate between personal identity and spiritual dissolution. This polarity creates conscious spirituality through integrated self and transcendence.",
      spiritualMeaning: "You're mastering divine embodiment - learning how human ego and spiritual essence create conscious mysticism.",
      keywords: ["polarity", "spirit", "balance", "integration", "mysticism"],
      harmonyLevel: 'dynamic'
    },
    'sun-pluto': {
      title: "Self-Power Balance",
      description: "You balance between identity and transformation. This polarity creates authentic empowerment through integrated self-expression and regenerative force.",
      spiritualMeaning: "You're learning conscious transformation - how personal will and regenerative power create evolutionary leadership.",
      keywords: ["polarity", "power", "balance", "transformation", "integration"],
      harmonyLevel: 'dynamic'
    },
    'moon-uranus': {
      title: "Emotion-Freedom Balance",
      description: "You navigate between emotional security and liberation. This polarity creates authentic feeling through integrated safety and freedom.",
      spiritualMeaning: "You're mastering free emotion - learning how security and liberation create conscious, grounded authenticity.",
      keywords: ["polarity", "freedom", "balance", "emotion", "integration"],
      harmonyLevel: 'dynamic'
    },
    'moon-neptune': {
      title: "Feeling-Spirit Balance",
      description: "You balance between personal emotions and universal compassion. This polarity creates clear empathy through integrated boundaries and oneness.",
      spiritualMeaning: "You're learning conscious sensitivity - how personal feeling and spiritual dissolution create wise, grounded compassion.",
      keywords: ["polarity", "spirit", "balance", "empathy", "integration"],
      harmonyLevel: 'dynamic'
    },
    'moon-pluto': {
      title: "Emotion-Depth Balance",
      description: "You navigate between surface feelings and emotional transformation. This polarity creates conscious depth through integrated vulnerability and power.",
      spiritualMeaning: "You're mastering emotional alchemy - learning how safety and intensity create profound, regenerative feeling.",
      keywords: ["polarity", "depth", "balance", "emotion", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mercury-uranus': {
      title: "Mind-Innovation Balance",
      description: "You balance between logical thinking and revolutionary insight. This polarity creates brilliant communication through integrated reason and breakthrough.",
      spiritualMeaning: "You're learning genius expression - how structured thought and innovative vision create revolutionary yet clear understanding.",
      keywords: ["polarity", "innovation", "balance", "mind", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mercury-neptune': {
      title: "Logic-Intuition Balance",
      description: "You navigate between rational thought and spiritual knowing. This polarity creates inspired wisdom through integrated logic and intuition.",
      spiritualMeaning: "You're mastering mystical communication - learning how clear thought and divine whispers create conscious, inspired expression.",
      keywords: ["polarity", "intuition", "balance", "wisdom", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mercury-pluto': {
      title: "Thought-Depth Balance",
      description: "You balance between surface thinking and penetrating investigation. This polarity creates powerful insight through integrated curiosity and intensity.",
      spiritualMeaning: "You're learning transformative communication - how light exploration and deep probing create truth-revealing expression.",
      keywords: ["polarity", "depth", "balance", "insight", "integration"],
      harmonyLevel: 'dynamic'
    },
    'venus-uranus': {
      title: "Love-Freedom Balance",
      description: "You navigate between intimacy and independence in relationships. This polarity creates liberated love through integrated connection and autonomy.",
      spiritualMeaning: "You're mastering free affection - learning how closeness and freedom create conscious, authentic partnership.",
      keywords: ["polarity", "freedom", "balance", "love", "integration"],
      harmonyLevel: 'dynamic'
    },
    'venus-neptune': {
      title: "Human-Divine Love Balance",
      description: "You balance between personal affection and universal compassion. This polarity creates grounded spirituality through integrated intimacy and transcendence.",
      spiritualMeaning: "You're learning sacred relationship - how personal love and divine oneness create conscious, mystical connection.",
      keywords: ["polarity", "divine", "balance", "love", "integration"],
      harmonyLevel: 'dynamic'
    },
    'venus-pluto': {
      title: "Affection-Intensity Balance",
      description: "You navigate between gentle love and transformative passion. This polarity creates alchemical relationship through integrated tenderness and power.",
      spiritualMeaning: "You're mastering deep intimacy - learning how soft affection and volcanic passion create regenerative, profound love.",
      keywords: ["polarity", "intensity", "balance", "love", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mars-uranus': {
      title: "Action-Revolution Balance",
      description: "You balance between strategic effort and breakthrough impulse. This polarity creates conscious innovation through integrated planning and spontaneity.",
      spiritualMeaning: "You're learning revolutionary effectiveness - how disciplined action and lightning insight create awakened, powerful change.",
      keywords: ["polarity", "revolution", "balance", "action", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mars-neptune': {
      title: "Will-Spirit Balance",
      description: "You navigate between personal assertion and spiritual surrender. This polarity creates inspired action through integrated will and divine guidance.",
      spiritualMeaning: "You're mastering sacred warriorship - learning how personal drive and spiritual flow create conscious, purposeful action.",
      keywords: ["polarity", "spirit", "balance", "will", "integration"],
      harmonyLevel: 'dynamic'
    },
    'mars-pluto': {
      title: "Will-Power Balance",
      description: "You balance between controlled action and volcanic force. This polarity creates transformative effectiveness through integrated strategy and intensity.",
      spiritualMeaning: "You're learning regenerative power - how measured effort and unstoppable force create conscious, evolutionary action.",
      keywords: ["polarity", "power", "balance", "will", "integration"],
      harmonyLevel: 'dynamic'
    }
  }
};

// Function to get aspect interpretation
export function getAspectInterpretation(planet1: string, planet2: string, aspectType: string) {
  const planetPair = `${planet1}-${planet2}`;
  const reversePair = `${planet2}-${planet1}`;
  
  const interpretation = ASPECT_INTERPRETATIONS[aspectType]?.[planetPair] || 
                        ASPECT_INTERPRETATIONS[aspectType]?.[reversePair];
  
  if (interpretation) {
    return interpretation;
  }
  
  // Get planet meanings for personalized fallback
  const p1Meaning = PLANET_MEANINGS[planet1.toLowerCase()];
  const p2Meaning = PLANET_MEANINGS[planet2.toLowerCase()];
  
  // Create personalized fallback based on aspect type and planet meanings
  const aspectDescriptions = {
    conjunction: {
      description: `Your ${p1Meaning?.governs || planet1} energy and ${p2Meaning?.governs || planet2} nature are deeply unified, creating a powerful blend that shapes your spiritual path.`,
      spiritualMeaning: `This unified energy teaches you how ${p1Meaning?.spiritualRole?.toLowerCase() || 'growth'} and ${p2Meaning?.spiritualRole?.toLowerCase() || 'evolution'} work together as one force in your life.`,
      harmonyLevel: 'dynamic' as const
    },
    sextile: {
      description: `Your ${p1Meaning?.governs || planet1} and ${p2Meaning?.governs || planet2} create gentle opportunities for growth when you make conscious effort to develop these gifts.`,
      spiritualMeaning: `This aspect offers pathways to integrate ${p1Meaning?.spiritualRole?.toLowerCase() || 'your wisdom'} with ${p2Meaning?.spiritualRole?.toLowerCase() || 'your power'} through mindful practice.`,
      harmonyLevel: 'harmonious' as const
    },
    trine: {
      description: `Your ${p1Meaning?.governs || planet1} and ${p2Meaning?.governs || planet2} flow together naturally, creating effortless talents and natural grace in these areas of life.`,
      spiritualMeaning: `This harmonious flow shows how ${p1Meaning?.spiritualRole?.toLowerCase() || 'your essence'} and ${p2Meaning?.spiritualRole?.toLowerCase() || 'your purpose'} align divinely without struggle.`,
      harmonyLevel: 'harmonious' as const
    },
    square: {
      description: `Tension between your ${p1Meaning?.governs || planet1} and ${p2Meaning?.governs || planet2} creates dynamic challenges that forge strength and wisdom through conscious effort.`,
      spiritualMeaning: `This challenging aspect teaches you to master the friction between ${p1Meaning?.spiritualRole?.toLowerCase() || 'different parts of your soul'} and ${p2Meaning?.spiritualRole?.toLowerCase() || 'your life path'}, building resilience.`,
      harmonyLevel: 'challenging' as const
    },
    opposition: {
      description: `You experience polarity between ${p1Meaning?.governs || planet1} and ${p2Meaning?.governs || planet2}, learning to balance these opposing forces for greater self-awareness.`,
      spiritualMeaning: `This opposition teaches you how ${p1Meaning?.spiritualRole?.toLowerCase() || 'one aspect of your nature'} and ${p2Meaning?.spiritualRole?.toLowerCase() || 'another dimension'} can complement each other through conscious integration.`,
      harmonyLevel: 'dynamic' as const
    }
  };
  
  const fallback = aspectDescriptions[aspectType as keyof typeof aspectDescriptions] || aspectDescriptions.conjunction;
  
  return {
    title: `${planet1.charAt(0).toUpperCase() + planet1.slice(1)} ${aspectType.charAt(0).toUpperCase() + aspectType.slice(1)} ${planet2.charAt(0).toUpperCase() + planet2.slice(1)}`,
    description: fallback.description,
    spiritualMeaning: fallback.spiritualMeaning,
    keywords: [
      ...(p1Meaning?.keywords || [planet1]).slice(0, 2),
      ...(p2Meaning?.keywords || [planet2]).slice(0, 2),
      aspectType
    ],
    harmonyLevel: fallback.harmonyLevel
  };
}