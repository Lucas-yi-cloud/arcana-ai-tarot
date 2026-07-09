import { clampSeoDescription } from "@/lib/tarot-seo";

export type TarotCardMeaning = {
  slug: string;
  designSlug: string;
  roman: string;
  num: string;
  name: string;
  keywords: string[];
  image: string;
  oneLine: string;
  upKeywords: string[];
  reversedKeywords: string[];
  overview: string;
  upright: string;
  reversed: string;
  love: string;
  career: string;
  money: string;
  yesNo: string;
  yesNoExplanation: string;
  positions: Array<{ label: string; text: string }>;
  related: string[];
  recommendedSpreadId: string;
  faqs: Array<{ q: string; a: string }>;
};

export const cardIndexTitle = "Tarot Card Meanings | Major Arcana Guide | Arcana AI";
export const cardIndexDescription =
  "Explore all 22 Major Arcana tarot card meanings with upright, reversed, love, career, money, yes or no, and spread position guidance.";
export const cardIndexKeywords = [
  "tarot card meanings",
  "major arcana meanings",
  "upright reversed tarot",
  "rider waite tarot cards",
  "ai tarot card meanings",
];

export const cardIndexFaq = [
  {
    q: "Do I need to memorize every tarot card meaning?",
    a: "No. Start with each card's core theme, then learn how it shifts by question, spread position, and orientation. The story a card tells matters more than rote memorization.",
  },
  {
    q: "Are reversed tarot cards always negative?",
    a: "No. A reversed card usually points to blocked, delayed, internal, or underdeveloped energy. It adds nuance rather than simply flipping the upright meaning into something bad.",
  },
  {
    q: "Why does Arcana AI use the Major Arcana first?",
    a: "The 22 Major Arcana carry clear archetypal themes that work well for focused AI-guided readings. Their meanings are memorable, distinct, and strong enough to anchor a useful interpretation.",
  },
];

export const tarotCardMeanings = [
  {
    "slug": "fool",
    "designSlug": "the-fool",
    "roman": "0",
    "num": "00",
    "name": "The Fool",
    "keywords": [
      "new beginnings",
      "freedom",
      "trust"
    ],
    "image": "/assets/tarot/RWS_Tarot_00_Fool.jpg",
    "oneLine": "The Fool represents a fresh beginning, open trust, and the courage to step into the unknown.",
    "upKeywords": [
      "new beginnings",
      "freedom",
      "trust"
    ],
    "reversedKeywords": [
      "recklessness",
      "hesitation",
      "naivety"
    ],
    "overview": "The Fool is the first breath before a journey begins. It appears when life asks you to move with openness, curiosity, and faith, even if the full path is not visible yet.",
    "upright": "Upright, The Fool invites a leap of faith. It favors openness, beginner’s mind, and the willingness to learn by moving.",
    "reversed": "Reversed, The Fool asks you to pause before acting. The desire for freedom may be real, but the timing, preparation, or judgment may need care.",
    "love": "In love, The Fool can show a new connection, playful openness, or a relationship that needs more freedom and honesty. Reversed, it can warn against rushing in or ignoring red flags.",
    "career": "In career, The Fool points to a new role, creative risk, or starting over. Reversed, it asks for a plan before jumping.",
    "money": "For money, The Fool encourages fresh thinking but warns against careless spending when reversed.",
    "yesNo": "Maybe — leaning yes",
    "yesNoExplanation": "The Fool leans yes when the question involves a fresh start, but it asks you to accept uncertainty and avoid impulsive decisions.",
    "positions": [
      {
        "label": "One card",
        "text": "Begin again with curiosity."
      },
      {
        "label": "Past",
        "text": "A leap or naive choice shaped the current situation."
      },
      {
        "label": "Present",
        "text": "You are at the edge of a new chapter."
      },
      {
        "label": "Future",
        "text": "A new path opens if you stay willing to learn."
      },
      {
        "label": "Outcome",
        "text": "The answer leads to freedom, but not total certainty."
      }
    ],
    "related": [
      "magician",
      "star",
      "world"
    ],
    "recommendedSpreadId": "past-present-future",
    "faqs": [
      {
        "q": "Is The Fool a positive card?",
        "a": "Usually, yes. The Fool is one of the most optimistic cards in the deck, favoring beginnings, freedom, and open trust. Its only real caution is that it asks you to embrace uncertainty rather than wait for guarantees before you begin."
      },
      {
        "q": "Does The Fool mean I should take a risk?",
        "a": "It can encourage a leap of faith, especially when a genuine fresh start is called for. But a reversed or poorly placed Fool asks you to slow down and prepare first — the aim is a brave step, not an impulsive one."
      },
      {
        "q": "What does The Fool mean in love?",
        "a": "In love, The Fool often points to new attraction, playful openness, or a relationship that needs more breathing room and honesty. Reversed, it can warn against rushing in too fast or overlooking clear red flags."
      }
    ]
  },
  {
    "slug": "magician",
    "designSlug": "the-magician",
    "roman": "I",
    "num": "01",
    "name": "The Magician",
    "keywords": [
      "manifestation",
      "skill",
      "willpower"
    ],
    "image": "/assets/tarot/RWS_Tarot_01_Magician.jpg",
    "oneLine": "The Magician represents focus, skill, intention, and the power to turn possibility into action.",
    "upKeywords": [
      "manifestation",
      "skill",
      "willpower"
    ],
    "reversedKeywords": [
      "manipulation",
      "blocked talent",
      "scattered focus"
    ],
    "overview": "The Magician appears when you have more tools than you may realize. It asks you to focus your intention and use what is already available.",
    "upright": "Upright, The Magician is a card of agency. It says your skills, timing, and attention can shape the outcome.",
    "reversed": "Reversed, The Magician warns of scattered energy, self-doubt, or using influence without integrity.",
    "love": "In love, The Magician can show attraction, communication, and intentional connection. Reversed, it can point to mixed signals or charm without depth.",
    "career": "In career, it favors pitching, launching, negotiating, and showing your competence. Reversed, it asks you to stop underselling or misusing your talent.",
    "money": "For money, The Magician supports resourcefulness and new income ideas. Reversed, check the fine print.",
    "yesNo": "Yes",
    "yesNoExplanation": "The Magician is a strong yes when you are prepared to act clearly and use your resources well.",
    "positions": [
      {
        "label": "One card",
        "text": "Use the tools already in your hands."
      },
      {
        "label": "Past",
        "text": "A choice or skill set created the present opportunity."
      },
      {
        "label": "Present",
        "text": "Your focus and intention matter now."
      },
      {
        "label": "Future",
        "text": "Action and competence can open the way."
      },
      {
        "label": "Outcome",
        "text": "The result depends on how clearly you direct your will."
      }
    ],
    "related": [
      "fool",
      "chariot",
      "strength"
    ],
    "recommendedSpreadId": "situation-action-outcome",
    "faqs": [
      {
        "q": "Is The Magician a manifestation card?",
        "a": "Yes, but it manifests through skill, focus, and deliberate action rather than wishing alone. It says you already hold the tools you need — the outcome depends on how clearly and honestly you use them."
      },
      {
        "q": "What does The Magician reversed warn about?",
        "a": "Reversed, it can point to manipulation, mixed intentions, or charm used without integrity. It can also mean scattered energy, self-doubt, or real talent that is going unused or undersold."
      },
      {
        "q": "Is The Magician a yes card?",
        "a": "Usually yes, especially when you are prepared to act with clarity and make the most of your resources. The stronger your focus and follow-through, the stronger the yes becomes."
      }
    ]
  },
  {
    "slug": "high-priestess",
    "designSlug": "the-high-priestess",
    "roman": "II",
    "num": "02",
    "name": "The High Priestess",
    "keywords": [
      "intuition",
      "mystery",
      "inner wisdom"
    ],
    "image": "/assets/tarot/RWS_Tarot_02_High_Priestess.jpg",
    "oneLine": "The High Priestess represents intuition, hidden knowledge, mystery, and quiet inner knowing.",
    "upKeywords": [
      "intuition",
      "mystery",
      "inner wisdom"
    ],
    "reversedKeywords": [
      "secrets",
      "disconnection",
      "confusion"
    ],
    "overview": "The High Priestess appears when not everything is visible yet. She asks you to listen deeply and notice what is felt before it is explained.",
    "upright": "Upright, this card favors patience, silence, dreams, intuition, and subtle information.",
    "reversed": "Reversed, it can show blocked intuition, hidden motives, or a refusal to trust what you already sense.",
    "love": "In love, it suggests emotional mystery, unspoken feelings, or the need to trust your instincts. Reversed, it may point to secrecy or avoidance.",
    "career": "In career, it asks you to gather information quietly before making a move. Reversed, avoid acting on incomplete assumptions.",
    "money": "For money, The High Priestess asks for caution, research, and listening to discomfort around unclear deals.",
    "yesNo": "Maybe",
    "yesNoExplanation": "The High Priestess rarely gives a direct answer. It says more information is hidden or your intuition already knows the answer.",
    "positions": [
      {
        "label": "One card",
        "text": "Pause and listen inward."
      },
      {
        "label": "Past",
        "text": "Something unspoken shaped this situation."
      },
      {
        "label": "Present",
        "text": "Trust subtle signs and quiet knowing."
      },
      {
        "label": "Future",
        "text": "More will be revealed in time."
      },
      {
        "label": "Outcome",
        "text": "The answer comes through patience, not force."
      }
    ],
    "related": [
      "moon",
      "hermit",
      "star"
    ],
    "recommendedSpreadId": "celtic-cross",
    "faqs": [
      {
        "q": "Does The High Priestess mean secrets?",
        "a": "Sometimes. She can indicate hidden information, unspoken feelings, or something not yet ready to be revealed, particularly when reversed or in a hidden-influence position. More often she simply asks you to trust what you already quietly sense."
      },
      {
        "q": "Is The High Priestess a yes or no card?",
        "a": "She usually answers “maybe,” because she points to factors that are still unknown or unfolding. The card suggests that either more information is hidden, or your intuition already knows the answer you have been avoiding."
      },
      {
        "q": "What does The High Priestess mean in love?",
        "a": "In love she can show deep attraction, emotional mystery, or feelings that have not yet been spoken aloud. She invites you to listen to your instincts and let things surface rather than forcing early clarity."
      }
    ]
  },
  {
    "slug": "empress",
    "designSlug": "the-empress",
    "roman": "III",
    "num": "03",
    "name": "The Empress",
    "keywords": [
      "abundance",
      "nurture",
      "creativity"
    ],
    "image": "/assets/tarot/RWS_Tarot_03_Empress.jpg",
    "oneLine": "The Empress represents nurture, abundance, creativity, beauty, and natural growth.",
    "upKeywords": [
      "abundance",
      "nurture",
      "creativity"
    ],
    "reversedKeywords": [
      "overgiving",
      "stagnation",
      "self-neglect"
    ],
    "overview": "The Empress is the card of growth that happens through care. She appears when something needs nourishment, patience, and embodied attention.",
    "upright": "Upright, The Empress supports creation, comfort, fertility, pleasure, and emotional generosity.",
    "reversed": "Reversed, she warns against overgiving, neglecting your own needs, or trying to force growth before it is ready.",
    "love": "In love, The Empress is warm, affectionate, sensual, and supportive. Reversed, it can show neediness or imbalance in care.",
    "career": "In career, she favors creative work, brand building, hospitality, design, and projects that need steady nurturing.",
    "money": "For money, The Empress suggests abundance through care and long-term growth. Reversed, watch comfort spending.",
    "yesNo": "Yes",
    "yesNoExplanation": "The Empress is usually a yes, especially for growth, love, creativity, and healing questions.",
    "positions": [
      {
        "label": "One card",
        "text": "Nourish what you want to grow."
      },
      {
        "label": "Past",
        "text": "Care, support, or comfort shaped the situation."
      },
      {
        "label": "Present",
        "text": "Growth is possible through patience and attention."
      },
      {
        "label": "Future",
        "text": "Something can bloom if it is properly cared for."
      },
      {
        "label": "Outcome",
        "text": "The result is fertile, supportive, and life-giving."
      }
    ],
    "related": [
      "lovers",
      "temperance",
      "sun"
    ],
    "recommendedSpreadId": "love-connection",
    "faqs": [
      {
        "q": "Is The Empress a love card?",
        "a": "Yes, she is one of the warmest relationship cards, bringing affection, sensuality, and emotional generosity. She supports connection that grows steadily through genuine care and nurturing."
      },
      {
        "q": "Does The Empress always mean pregnancy?",
        "a": "No. While she can signal literal fertility, she far more often means creativity, growth, and the nurturing of a project, relationship, or idea. Read her as creation in the broadest sense."
      },
      {
        "q": "What does The Empress reversed mean?",
        "a": "Reversed, she can show overgiving, creative blockage, or neglecting your own needs while caring for everyone else. She asks you to restore balance and refill your own well first."
      }
    ]
  },
  {
    "slug": "emperor",
    "designSlug": "the-emperor",
    "roman": "IV",
    "num": "04",
    "name": "The Emperor",
    "keywords": [
      "structure",
      "authority",
      "stability"
    ],
    "image": "/assets/tarot/RWS_Tarot_04_Emperor.jpg",
    "oneLine": "The Emperor represents structure, authority, discipline, protection, and practical leadership.",
    "upKeywords": [
      "structure",
      "authority",
      "stability"
    ],
    "reversedKeywords": [
      "control",
      "rigidity",
      "instability"
    ],
    "overview": "The Emperor appears when boundaries, plans, and clear responsibility matter. It is the card of building something that can stand.",
    "upright": "Upright, The Emperor favors order, leadership, consistency, and mature decision-making.",
    "reversed": "Reversed, it can point to control issues, stubbornness, weak boundaries, or a structure that has become too rigid.",
    "love": "In love, The Emperor can show commitment, protection, and reliability. Reversed, it warns of emotional control or distance.",
    "career": "In career, it supports leadership, management, systems, and long-term planning.",
    "money": "For money, The Emperor asks for budgets, discipline, and practical control. Reversed, spending or power dynamics may need correction.",
    "yesNo": "Yes — if structured",
    "yesNoExplanation": "The Emperor leans yes when there is a solid plan, clear responsibility, and realistic structure.",
    "positions": [
      {
        "label": "One card",
        "text": "Create structure before you move."
      },
      {
        "label": "Past",
        "text": "Rules, authority, or stability shaped the current path."
      },
      {
        "label": "Present",
        "text": "Take responsibility and lead clearly."
      },
      {
        "label": "Future",
        "text": "A stable structure can form."
      },
      {
        "label": "Outcome",
        "text": "The result is secure if control does not become rigidity."
      }
    ],
    "related": [
      "justice",
      "hierophant",
      "chariot"
    ],
    "recommendedSpreadId": "career-path",
    "faqs": [
      {
        "q": "Is The Emperor a good card for career?",
        "a": "Yes, he is excellent for leadership, planning, and building something stable and lasting. He favors structure, clear responsibility, and mature, consistent decision-making."
      },
      {
        "q": "What does The Emperor reversed mean in love?",
        "a": "Reversed, he can point to control, emotional distance, or an unequal balance of power in the relationship. He asks whether protection has hardened into rigidity or dominance."
      },
      {
        "q": "Is The Emperor a yes card?",
        "a": "Usually yes, but mainly when discipline, a realistic plan, and clear structure are in place. Without those foundations, the yes becomes conditional."
      }
    ]
  },
  {
    "slug": "hierophant",
    "designSlug": "the-hierophant",
    "roman": "V",
    "num": "05",
    "name": "The Hierophant",
    "keywords": [
      "tradition",
      "teaching",
      "commitment"
    ],
    "image": "/assets/tarot/RWS_Tarot_05_Hierophant.jpg",
    "oneLine": "The Hierophant represents tradition, guidance, learning, commitment, and shared beliefs.",
    "upKeywords": [
      "tradition",
      "teaching",
      "commitment"
    ],
    "reversedKeywords": [
      "rebellion",
      "dogma",
      "nonconformity"
    ],
    "overview": "The Hierophant appears when a system, mentor, belief, or tradition is shaping the situation. It asks what you follow and why.",
    "upright": "Upright, it supports learning, guidance, ceremony, commitment, and wise counsel.",
    "reversed": "Reversed, it questions rigid rules, inherited beliefs, or the pressure to conform.",
    "love": "In love, The Hierophant can point to commitment, marriage, shared values, or traditional relationship expectations. Reversed, values may clash.",
    "career": "In career, it favors institutions, education, mentorship, and formal paths. Reversed, you may need an unconventional route.",
    "money": "For money, it supports conservative advice and proven methods. Reversed, avoid blindly following outdated rules.",
    "yesNo": "Yes — if aligned with values",
    "yesNoExplanation": "The Hierophant leans yes when the choice matches your values, commitments, and trusted guidance.",
    "positions": [
      {
        "label": "One card",
        "text": "Seek guidance or return to your values."
      },
      {
        "label": "Past",
        "text": "Tradition or expectation shaped this path."
      },
      {
        "label": "Present",
        "text": "Commitment and shared beliefs matter now."
      },
      {
        "label": "Future",
        "text": "A formal step or lesson may arrive."
      },
      {
        "label": "Outcome",
        "text": "The answer depends on values and commitment."
      }
    ],
    "related": [
      "emperor",
      "justice",
      "lovers"
    ],
    "recommendedSpreadId": "relationship-mirror",
    "faqs": [
      {
        "q": "Does The Hierophant mean marriage?",
        "a": "It can, especially in love readings about commitment, shared values, or formalizing a bond. More broadly, it points to tradition, ceremony, and choices made within a trusted framework."
      },
      {
        "q": "What does The Hierophant reversed mean?",
        "a": "Reversed, it often challenges rigid rules, inherited beliefs, or pressure to conform. It can be a call to find your own path rather than follow convention out of habit."
      },
      {
        "q": "Is The Hierophant spiritual?",
        "a": "Yes, but it usually expresses spirituality through teaching, mentorship, ritual, or established tradition rather than solitary mysticism. It favors learning from guidance and shared belief."
      }
    ]
  },
  {
    "slug": "lovers",
    "designSlug": "the-lovers",
    "roman": "VI",
    "num": "06",
    "name": "The Lovers",
    "keywords": [
      "love",
      "choice",
      "alignment"
    ],
    "image": "/assets/tarot/RWS_Tarot_06_Lovers.jpg",
    "oneLine": "The Lovers represents connection, choice, alignment, attraction, and values shared between people or paths.",
    "upKeywords": [
      "love",
      "choice",
      "alignment"
    ],
    "reversedKeywords": [
      "disharmony",
      "misalignment",
      "avoidance"
    ],
    "overview": "The Lovers is not only romance. It is the card of meaningful choice, where the heart, values, and consequences must align.",
    "upright": "Upright, The Lovers supports union, honest choice, mutual attraction, and value alignment.",
    "reversed": "Reversed, it shows conflict, imbalance, temptation, or a choice made without full integrity.",
    "love": "In love, this is one of the strongest connection cards. Reversed, it can show tension, mixed values, or disconnection.",
    "career": "In career, The Lovers asks you to choose work that aligns with your values, not just external reward.",
    "money": "For money, it highlights financial choices that affect relationships or personal values.",
    "yesNo": "Yes — if aligned",
    "yesNoExplanation": "The Lovers leans yes when the choice is mutual, honest, and aligned with your values. Reversed, it becomes uncertain.",
    "positions": [
      {
        "label": "One card",
        "text": "Choose from your values, not fear."
      },
      {
        "label": "Past",
        "text": "A relationship or choice shaped the current situation."
      },
      {
        "label": "Present",
        "text": "Alignment and honesty matter now."
      },
      {
        "label": "Future",
        "text": "A meaningful choice or connection develops."
      },
      {
        "label": "Outcome",
        "text": "The result depends on mutual alignment."
      }
    ],
    "related": [
      "empress",
      "devil",
      "temperance"
    ],
    "recommendedSpreadId": "love-connection",
    "faqs": [
      {
        "q": "Does The Lovers always mean romance?",
        "a": "No. While it is a powerful love card, it is fundamentally about meaningful choice, values, and alignment. It often appears when your heart, your values, and the consequences of a decision all need to line up."
      },
      {
        "q": "Is The Lovers a yes card?",
        "a": "Usually yes, when the choice is honest, mutual, and aligned with your values. Reversed or conflicted, the answer turns uncertain until that alignment is restored."
      },
      {
        "q": "What does The Lovers reversed mean?",
        "a": "Reversed, it can show disharmony, conflicting values, temptation, or a difficult choice made without full integrity. It asks you to face what is out of alignment before moving forward."
      }
    ]
  },
  {
    "slug": "chariot",
    "designSlug": "the-chariot",
    "roman": "VII",
    "num": "07",
    "name": "The Chariot",
    "keywords": [
      "victory",
      "focus",
      "control"
    ],
    "image": "/assets/tarot/RWS_Tarot_07_Chariot.jpg",
    "oneLine": "The Chariot represents determination, direction, discipline, and the will to move forward.",
    "upKeywords": [
      "victory",
      "focus",
      "control"
    ],
    "reversedKeywords": [
      "drift",
      "force",
      "loss of control"
    ],
    "overview": "The Chariot appears when progress requires direction. It is not passive luck; it is momentum created by focus and self-command.",
    "upright": "Upright, The Chariot favors discipline, confidence, travel, competition, and decisive movement.",
    "reversed": "Reversed, it warns of pushing too hard, losing direction, or letting conflicting impulses drive you.",
    "love": "In love, it can show movement, pursuit, or choosing a direction together. Reversed, it may show control struggles.",
    "career": "In career, it is excellent for ambition, interviews, promotions, and goals that need drive.",
    "money": "For money, it supports disciplined action and focused goals. Reversed, impulse or pressure can derail progress.",
    "yesNo": "Yes",
    "yesNoExplanation": "The Chariot is a strong yes when you can stay focused and steer the situation with discipline.",
    "positions": [
      {
        "label": "One card",
        "text": "Move with focus and control."
      },
      {
        "label": "Past",
        "text": "Drive or ambition brought you here."
      },
      {
        "label": "Present",
        "text": "Choose a direction and commit."
      },
      {
        "label": "Future",
        "text": "Progress comes through discipline."
      },
      {
        "label": "Outcome",
        "text": "Victory is possible if you stay in command."
      }
    ],
    "related": [
      "magician",
      "strength",
      "emperor"
    ],
    "recommendedSpreadId": "career-path",
    "faqs": [
      {
        "q": "Is The Chariot a victory card?",
        "a": "Yes, but the victory comes through discipline and self-command rather than luck or ease. It rewards focus, confidence, and the will to steer your own direction."
      },
      {
        "q": "What does The Chariot reversed mean?",
        "a": "Reversed, it can mean force without direction, scattered effort, or a loss of control. It warns against pushing harder when what you actually need is a clear course."
      },
      {
        "q": "Is The Chariot good for career?",
        "a": "Yes, it is one of the strongest cards for ambition, interviews, promotions, and competitive goals. It favors decisive movement toward a target you are truly committed to."
      }
    ]
  },
  {
    "slug": "strength",
    "designSlug": "strength",
    "roman": "VIII",
    "num": "08",
    "name": "Strength",
    "keywords": [
      "courage",
      "patience",
      "inner power"
    ],
    "image": "/assets/tarot/RWS_Tarot_08_Strength.jpg",
    "oneLine": "Strength represents courage, patience, compassion, and quiet power under pressure.",
    "upKeywords": [
      "courage",
      "patience",
      "inner power"
    ],
    "reversedKeywords": [
      "self-doubt",
      "impatience",
      "insecurity"
    ],
    "overview": "Strength is not force. It is the calm, steady ability to meet fear, desire, anger, or pressure without being ruled by it.",
    "upright": "Upright, Strength favors resilience, gentleness, emotional courage, and mature self-control.",
    "reversed": "Reversed, it can show low confidence, frustration, or trying to overpower something that needs patience.",
    "love": "In love, Strength points to patience, forgiveness, loyalty, and gentle repair. Reversed, insecurity may shape the connection.",
    "career": "In career, it supports persistence, emotional intelligence, and leadership through calm confidence.",
    "money": "For money, Strength asks for patience and restraint. Reversed, fear or impulse can create instability.",
    "yesNo": "Yes — with patience",
    "yesNoExplanation": "Strength leans yes, especially when the situation asks for endurance, kindness, and self-control.",
    "positions": [
      {
        "label": "One card",
        "text": "Lead with calm courage."
      },
      {
        "label": "Past",
        "text": "Resilience helped you survive or grow."
      },
      {
        "label": "Present",
        "text": "Patience is stronger than force."
      },
      {
        "label": "Future",
        "text": "Your confidence returns through steadiness."
      },
      {
        "label": "Outcome",
        "text": "The result improves through courage and restraint."
      }
    ],
    "related": [
      "chariot",
      "temperance",
      "sun"
    ],
    "recommendedSpreadId": "career-path",
    "faqs": [
      {
        "q": "Is Strength a positive card?",
        "a": "Yes. It is a card of courage, patience, and emotional maturity — quiet power rather than brute force. It shows the ability to meet fear and pressure with calm and compassion."
      },
      {
        "q": "What does Strength reversed mean?",
        "a": "Reversed, it can show self-doubt, impatience, or inner pressure that undermines your confidence. It may also mean trying to force something that actually needs gentleness and time."
      },
      {
        "q": "Is Strength a yes card?",
        "a": "Usually yes, especially when the situation rewards endurance, kindness, and self-control. The answer grows stronger the more patient and steady you are willing to be."
      }
    ]
  },
  {
    "slug": "hermit",
    "designSlug": "the-hermit",
    "roman": "IX",
    "num": "09",
    "name": "The Hermit",
    "keywords": [
      "reflection",
      "solitude",
      "wisdom"
    ],
    "image": "/assets/tarot/RWS_Tarot_09_Hermit.jpg",
    "oneLine": "The Hermit represents solitude, reflection, wisdom, and the search for inner truth.",
    "upKeywords": [
      "reflection",
      "solitude",
      "wisdom"
    ],
    "reversedKeywords": [
      "isolation",
      "withdrawal",
      "lost guidance"
    ],
    "overview": "The Hermit appears when the answer is not found in noise. It asks for space, honesty, and a return to your own inner light.",
    "upright": "Upright, The Hermit supports introspection, study, retreat, mentoring, and spiritual searching.",
    "reversed": "Reversed, it can show loneliness, avoidance, or staying withdrawn after the lesson has already arrived.",
    "love": "In love, The Hermit can mean needing space or understanding yourself before choosing. Reversed, it may show emotional distance.",
    "career": "In career, it favors research, mastery, independent work, or stepping back to clarify your path.",
    "money": "For money, The Hermit asks for careful review and less outside noise.",
    "yesNo": "Maybe — leaning no",
    "yesNoExplanation": "The Hermit often says pause. It is not a hard no, but the answer needs reflection before action.",
    "positions": [
      {
        "label": "One card",
        "text": "Step back and listen inward."
      },
      {
        "label": "Past",
        "text": "Solitude or study shaped this moment."
      },
      {
        "label": "Present",
        "text": "The answer needs quiet."
      },
      {
        "label": "Future",
        "text": "A period of reflection brings clarity."
      },
      {
        "label": "Outcome",
        "text": "Wisdom comes, but not through rushing."
      }
    ],
    "related": [
      "high-priestess",
      "moon",
      "judgement"
    ],
    "recommendedSpreadId": "shadow-and-light",
    "faqs": [
      {
        "q": "Does The Hermit mean being alone?",
        "a": "Sometimes, but the solitude is usually purposeful — time for reflection, healing, or gaining clarity. It is about seeking inner truth rather than loneliness for its own sake."
      },
      {
        "q": "Is The Hermit bad for love?",
        "a": "Not necessarily. It can mean one person needs space or wants to understand themselves before committing. It only becomes a warning when withdrawal hardens into avoidance or lasting distance."
      },
      {
        "q": "Is The Hermit a yes or no card?",
        "a": "It usually asks you to pause rather than answer immediately, leaning gently toward “not yet.” The guidance is to reflect and seek clarity before you decide."
      }
    ]
  },
  {
    "slug": "wheel-of-fortune",
    "designSlug": "wheel-of-fortune",
    "roman": "X",
    "num": "10",
    "name": "Wheel of Fortune",
    "keywords": [
      "change",
      "luck",
      "cycles"
    ],
    "image": "/assets/tarot/RWS_Tarot_10_Wheel_of_Fortune.jpg",
    "oneLine": "Wheel of Fortune represents change, cycles, timing, fate, and turning points.",
    "upKeywords": [
      "change",
      "luck",
      "cycles"
    ],
    "reversedKeywords": [
      "delay",
      "resistance",
      "bad timing"
    ],
    "overview": "Wheel of Fortune appears when life is moving. It reminds you that situations change, cycles turn, and timing matters.",
    "upright": "Upright, it signals momentum, opportunity, change, or a fortunate shift.",
    "reversed": "Reversed, it can show resistance to change, poor timing, or repeating a pattern that needs awareness.",
    "love": "In love, it can show a turning point, unexpected meeting, or changing relationship cycle. Reversed, timing may be off.",
    "career": "In career, it points to opportunity, market shifts, role changes, or timing that opens a door.",
    "money": "For money, it can show financial fluctuation or a change in fortune. Reversed, avoid gambling on unstable timing.",
    "yesNo": "Maybe — leaning yes",
    "yesNoExplanation": "Wheel of Fortune leans yes when change is welcome, but the outcome depends heavily on timing.",
    "positions": [
      {
        "label": "One card",
        "text": "A cycle is turning."
      },
      {
        "label": "Past",
        "text": "A turning point brought you here."
      },
      {
        "label": "Present",
        "text": "Timing is changing the situation."
      },
      {
        "label": "Future",
        "text": "Expect movement and new conditions."
      },
      {
        "label": "Outcome",
        "text": "The result shifts with the cycle."
      }
    ],
    "related": [
      "world",
      "judgement",
      "sun"
    ],
    "recommendedSpreadId": "past-present-future",
    "faqs": [
      {
        "q": "Is Wheel of Fortune good luck?",
        "a": "Often, yes, but it is really about cycles, timing, and turning points rather than pure luck. It reminds you that circumstances change and momentum can shift in your favor."
      },
      {
        "q": "What does Wheel of Fortune reversed mean?",
        "a": "Reversed, it can show delay, resistance to change, poor timing, or a pattern repeating until it is finally understood. It asks you to work with the cycle instead of fighting it."
      },
      {
        "q": "Is Wheel of Fortune a yes card?",
        "a": "It usually leans from maybe to yes, depending heavily on timing. When change is welcome and the moment is right, the answer becomes more clearly positive."
      }
    ]
  },
  {
    "slug": "justice",
    "designSlug": "justice",
    "roman": "XI",
    "num": "11",
    "name": "Justice",
    "keywords": [
      "truth",
      "fairness",
      "accountability"
    ],
    "image": "/assets/tarot/RWS_Tarot_11_Justice.jpg",
    "oneLine": "Justice represents truth, fairness, accountability, decisions, and cause and effect.",
    "upKeywords": [
      "truth",
      "fairness",
      "accountability"
    ],
    "reversedKeywords": [
      "dishonesty",
      "imbalance",
      "avoidance"
    ],
    "overview": "Justice appears when consequences, clarity, and responsibility matter. It asks for honesty, balance, and clean decisions.",
    "upright": "Upright, Justice favors fairness, contracts, ethical choices, clear judgment, and accountability.",
    "reversed": "Reversed, it warns against denial, unfairness, bias, or avoiding responsibility.",
    "love": "In love, Justice asks for honesty, equality, and accountability. Reversed, it can show blame or imbalance.",
    "career": "In career, it favors contracts, legal matters, performance reviews, and fair decisions.",
    "money": "For money, Justice asks for clear records, fair agreements, and responsibility.",
    "yesNo": "Yes — if fair",
    "yesNoExplanation": "Justice leans yes when the choice is ethical, balanced, and based on truth.",
    "positions": [
      {
        "label": "One card",
        "text": "Choose what is honest and fair."
      },
      {
        "label": "Past",
        "text": "A decision or consequence shaped this situation."
      },
      {
        "label": "Present",
        "text": "Accountability is required now."
      },
      {
        "label": "Future",
        "text": "Truth and fairness become unavoidable."
      },
      {
        "label": "Outcome",
        "text": "The result reflects the integrity of the choice."
      }
    ],
    "related": [
      "emperor",
      "hierophant",
      "judgement"
    ],
    "recommendedSpreadId": "decision-crossroads",
    "faqs": [
      {
        "q": "Does Justice mean legal matters?",
        "a": "It can point to contracts, agreements, or legal situations, but its deeper meaning is fairness, accountability, and cause and effect. It reminds you that choices carry real consequences."
      },
      {
        "q": "Is Justice a yes card?",
        "a": "Yes, when the situation is honest, balanced, and ethically sound. If something is unfair or unresolved, the card withholds its yes until integrity is restored."
      },
      {
        "q": "What does Justice reversed mean?",
        "a": "Reversed, it can show unfairness, bias, dishonesty, or the avoidance of responsibility. It asks you to face the truth and take accountability rather than deflect it."
      }
    ]
  },
  {
    "slug": "hanged-man",
    "designSlug": "the-hanged-man",
    "roman": "XII",
    "num": "12",
    "name": "The Hanged Man",
    "keywords": [
      "pause",
      "surrender",
      "perspective"
    ],
    "image": "/assets/tarot/RWS_Tarot_12_Hanged_Man.jpg",
    "oneLine": "The Hanged Man represents surrender, pause, new perspective, and release of control.",
    "upKeywords": [
      "pause",
      "surrender",
      "perspective"
    ],
    "reversedKeywords": [
      "stalling",
      "resistance",
      "martyrdom"
    ],
    "overview": "The Hanged Man appears when forcing movement will not help. It asks you to see differently before acting.",
    "upright": "Upright, it supports patience, letting go, sacrifice, and a change in perspective.",
    "reversed": "Reversed, it can show pointless delay, resistance to surrender, or feeling stuck without learning from the pause.",
    "love": "In love, it may show waiting, seeing the relationship differently, or needing to release control. Reversed, one person may be stuck.",
    "career": "In career, it asks for patience and perspective before making a move. Reversed, watch procrastination.",
    "money": "For money, The Hanged Man suggests waiting, reviewing, and avoiding rushed decisions.",
    "yesNo": "No — for now",
    "yesNoExplanation": "The Hanged Man usually says not yet. The situation needs pause, perspective, or surrender first.",
    "positions": [
      {
        "label": "One card",
        "text": "Pause before acting."
      },
      {
        "label": "Past",
        "text": "A delay or sacrifice shaped this path."
      },
      {
        "label": "Present",
        "text": "You need a new perspective."
      },
      {
        "label": "Future",
        "text": "Progress comes after surrender."
      },
      {
        "label": "Outcome",
        "text": "The answer is delayed until control is released."
      }
    ],
    "related": [
      "hermit",
      "temperance",
      "death"
    ],
    "recommendedSpreadId": "block-breakthrough",
    "faqs": [
      {
        "q": "Is The Hanged Man negative?",
        "a": "Not necessarily. Although it involves pause and surrender, it often brings valuable clarity through a change of perspective. The stillness is meant to reveal something you could not see while rushing."
      },
      {
        "q": "Does The Hanged Man mean delay?",
        "a": "Yes, but the delay is usually purposeful rather than pointless. When you use the pause to see the situation differently, the wait itself becomes part of the solution."
      },
      {
        "q": "Is The Hanged Man a yes or no card?",
        "a": "It usually answers “no” or “not yet,” because the situation needs pause, perspective, or a release of control first. Forcing an outcome now tends to work against you."
      }
    ]
  },
  {
    "slug": "death",
    "designSlug": "death",
    "roman": "XIII",
    "num": "13",
    "name": "Death",
    "keywords": [
      "ending",
      "transformation",
      "release"
    ],
    "image": "/assets/tarot/RWS_Tarot_13_Death.jpg",
    "oneLine": "Death represents endings, transformation, release, and the beginning that follows closure.",
    "upKeywords": [
      "ending",
      "transformation",
      "release"
    ],
    "reversedKeywords": [
      "resistance",
      "stagnation",
      "fear of change"
    ],
    "overview": "Death is not usually literal. It is the card of necessary ending, where something old must close so new life can begin.",
    "upright": "Upright, Death supports transformation, closure, release, and honest acceptance that a chapter is complete.",
    "reversed": "Reversed, it shows resistance to change, clinging, or delaying an ending that is already underway.",
    "love": "In love, Death can mean a relationship transforms, an old pattern ends, or closure is needed. Reversed, someone may be resisting change.",
    "career": "In career, it points to endings, transitions, resignations, or a new professional identity.",
    "money": "For money, Death asks you to end an unsustainable pattern and rebuild differently.",
    "yesNo": "No — unless asking about release",
    "yesNoExplanation": "Death is usually no to keeping things as they are, but yes to transformation and letting go.",
    "positions": [
      {
        "label": "One card",
        "text": "Let the old chapter end."
      },
      {
        "label": "Past",
        "text": "An ending changed the path."
      },
      {
        "label": "Present",
        "text": "Transformation is already happening."
      },
      {
        "label": "Future",
        "text": "A major transition approaches."
      },
      {
        "label": "Outcome",
        "text": "The result requires release before renewal."
      }
    ],
    "related": [
      "tower",
      "judgement",
      "world"
    ],
    "recommendedSpreadId": "ex-closure",
    "faqs": [
      {
        "q": "Does Death mean physical death?",
        "a": "Almost never. In a reading it points to transformation, endings, and release — the closing of one chapter so another can begin. It is one of the most misunderstood cards in the deck."
      },
      {
        "q": "Is Death bad in a love reading?",
        "a": "It can be difficult, but it usually signals transformation or closure rather than doom. A relationship may change form, an old pattern may end, or a needed release may already be underway."
      },
      {
        "q": "Is Death a yes or no card?",
        "a": "It is usually “no” to keeping things exactly as they are, but “yes” to change and letting go. The card consistently favors transformation over preservation."
      }
    ]
  },
  {
    "slug": "temperance",
    "designSlug": "temperance",
    "roman": "XIV",
    "num": "14",
    "name": "Temperance",
    "keywords": [
      "balance",
      "healing",
      "moderation"
    ],
    "image": "/assets/tarot/RWS_Tarot_14_Temperance.jpg",
    "oneLine": "Temperance represents balance, healing, moderation, patience, and the art of blending opposites.",
    "upKeywords": [
      "balance",
      "healing",
      "moderation"
    ],
    "reversedKeywords": [
      "excess",
      "imbalance",
      "impatience"
    ],
    "overview": "Temperance appears when harmony is built slowly. It asks for patience, proportion, and integration rather than extremes.",
    "upright": "Upright, Temperance favors healing, emotional balance, compromise, and steady progress.",
    "reversed": "Reversed, it warns of excess, impatience, imbalance, or trying to rush a process that needs time.",
    "love": "In love, Temperance supports reconciliation, patience, and emotional harmony. Reversed, imbalance may need attention.",
    "career": "In career, it favors collaboration, pacing, and sustainable progress.",
    "money": "For money, Temperance asks for moderation, budgeting, and avoiding extremes.",
    "yesNo": "Yes — slowly",
    "yesNoExplanation": "Temperance leans yes, but the answer unfolds through patience and balance rather than speed.",
    "positions": [
      {
        "label": "One card",
        "text": "Find the middle path."
      },
      {
        "label": "Past",
        "text": "Healing or compromise shaped this situation."
      },
      {
        "label": "Present",
        "text": "Balance is the key now."
      },
      {
        "label": "Future",
        "text": "Steady integration leads to progress."
      },
      {
        "label": "Outcome",
        "text": "The result is peaceful if extremes are avoided."
      }
    ],
    "related": [
      "strength",
      "star",
      "lovers"
    ],
    "recommendedSpreadId": "mind-body-spirit",
    "faqs": [
      {
        "q": "Is Temperance a healing card?",
        "a": "Yes. It often points to emotional, spiritual, or practical healing that happens gradually. It favors patience, moderation, and the careful blending of opposites into balance."
      },
      {
        "q": "What does Temperance reversed mean?",
        "a": "Reversed, it can show excess, impatience, or imbalance — trying to rush a process that genuinely needs time. It invites you back to proportion and a steadier pace."
      },
      {
        "q": "Is Temperance a yes card?",
        "a": "Yes, but usually slowly and with moderation rather than all at once. The answer unfolds through patience and balance rather than speed."
      }
    ]
  },
  {
    "slug": "devil",
    "designSlug": "the-devil",
    "roman": "XV",
    "num": "15",
    "name": "The Devil",
    "keywords": [
      "attachment",
      "temptation",
      "shadow"
    ],
    "image": "/assets/tarot/RWS_Tarot_15_Devil.jpg",
    "oneLine": "The Devil represents attachment, temptation, shadow patterns, dependency, and the power to recognize what binds you.",
    "upKeywords": [
      "attachment",
      "temptation",
      "shadow"
    ],
    "reversedKeywords": [
      "release",
      "awareness",
      "breaking patterns"
    ],
    "overview": "The Devil appears when something has more power over you than it should. It names the chain so you can decide whether to keep wearing it.",
    "upright": "Upright, it points to obsession, addiction, control, fear, material attachment, or repeated shadow patterns.",
    "reversed": "Reversed, The Devil can be hopeful. It shows awareness, release, and the beginning of breaking an unhealthy bond.",
    "love": "In love, The Devil can show intense attraction, dependency, jealousy, or toxic cycles. Reversed, it can show liberation from those patterns.",
    "career": "In career, it may point to golden handcuffs, unhealthy ambition, control, or work that traps your values.",
    "money": "For money, it warns about debt, compulsion, greed, or financial dependence. Reversed, recovery is possible.",
    "yesNo": "No",
    "yesNoExplanation": "The Devil is usually no if the question involves freedom, health, or trust. It asks what hidden attachment is shaping the choice.",
    "positions": [
      {
        "label": "One card",
        "text": "Notice what has power over you."
      },
      {
        "label": "Past",
        "text": "Attachment or fear shaped this path."
      },
      {
        "label": "Present",
        "text": "A pattern needs honest attention."
      },
      {
        "label": "Future",
        "text": "The chain can be seen and challenged."
      },
      {
        "label": "Outcome",
        "text": "The result depends on whether you choose freedom or attachment."
      }
    ],
    "related": [
      "lovers",
      "tower",
      "death"
    ],
    "recommendedSpreadId": "shadow-and-light",
    "faqs": [
      {
        "q": "Is The Devil always bad?",
        "a": "No. Although it is a challenging card, it is often useful because it reveals exactly what has power over you. Naming the attachment is the first step toward freeing yourself from it."
      },
      {
        "q": "What does The Devil mean in love?",
        "a": "It can show intense attraction, desire, dependency, jealousy, or toxic cycles. Reversed, it becomes more hopeful, pointing to awareness and liberation from those patterns."
      },
      {
        "q": "Is The Devil a yes or no card?",
        "a": "Usually no, especially when the question involves freedom, health, or trust. It asks what hidden attachment or fear may quietly be shaping the choice."
      }
    ]
  },
  {
    "slug": "tower",
    "designSlug": "the-tower",
    "roman": "XVI",
    "num": "16",
    "name": "The Tower",
    "keywords": [
      "upheaval",
      "truth",
      "breakdown"
    ],
    "image": "/assets/tarot/RWS_Tarot_16_Tower.jpg",
    "oneLine": "The Tower represents sudden change, revelation, collapse of false structures, and truth breaking through.",
    "upKeywords": [
      "upheaval",
      "truth",
      "breakdown"
    ],
    "reversedKeywords": [
      "avoidance",
      "delayed change",
      "fear of collapse"
    ],
    "overview": "The Tower appears when something unstable can no longer stand. It is disruptive, but it often clears what was false.",
    "upright": "Upright, The Tower signals shock, revelation, disruption, or a sudden reset that exposes the truth.",
    "reversed": "Reversed, it can show resisting inevitable change or experiencing a quieter internal collapse.",
    "love": "In love, The Tower can reveal hidden truths, break illusions, or force a relationship crisis into the open.",
    "career": "In career, it may point to sudden changes, restructuring, job shocks, or a realization that the old path is not stable.",
    "money": "For money, it warns about unstable foundations, surprise expenses, or the need to rebuild.",
    "yesNo": "No",
    "yesNoExplanation": "The Tower is usually no to preserving the current structure. It favors truth over comfort.",
    "positions": [
      {
        "label": "One card",
        "text": "Let truth break the false structure."
      },
      {
        "label": "Past",
        "text": "A disruption changed everything."
      },
      {
        "label": "Present",
        "text": "Something unstable is being exposed."
      },
      {
        "label": "Future",
        "text": "Expect a shake-up or truth revealed."
      },
      {
        "label": "Outcome",
        "text": "The old form may fall so something honest can be rebuilt."
      }
    ],
    "related": [
      "death",
      "devil",
      "star"
    ],
    "recommendedSpreadId": "block-breakthrough",
    "faqs": [
      {
        "q": "Is The Tower always bad?",
        "a": "It is difficult, but not purely negative. Its sudden disruption often clears away false structures and forces hidden truths into the open, making space for something more honest to be rebuilt."
      },
      {
        "q": "What does The Tower reversed mean?",
        "a": "Reversed, it can show resistance to an inevitable change, or a slower, more internal collapse. It may mean you are bracing against a shift that is already underway."
      },
      {
        "q": "Is The Tower a yes or no card?",
        "a": "Usually no, especially if the question asks whether things can stay the same. The Tower favors truth and necessary change over comfort and preservation."
      }
    ]
  },
  {
    "slug": "star",
    "designSlug": "the-star",
    "roman": "XVII",
    "num": "17",
    "name": "The Star",
    "keywords": [
      "hope",
      "healing",
      "renewal"
    ],
    "image": "/assets/tarot/RWS_Tarot_17_Star.jpg",
    "oneLine": "The Star represents hope, renewal, healing, inspiration, and trust after difficulty.",
    "upKeywords": [
      "hope",
      "healing",
      "renewal"
    ],
    "reversedKeywords": [
      "discouragement",
      "lost faith",
      "disconnection"
    ],
    "overview": "The Star appears after the storm. It is the gentle return of faith, healing, and a sense that life can open again.",
    "upright": "Upright, The Star supports hope, spiritual renewal, inspiration, and calm recovery.",
    "reversed": "Reversed, it can show discouragement, self-protection, or difficulty trusting the future.",
    "love": "In love, The Star brings healing, honesty, softness, and renewed trust. Reversed, hope may need rebuilding.",
    "career": "In career, it favors visibility, inspiration, long-term vision, and creative direction.",
    "money": "For money, it suggests recovery and gradual improvement rather than instant gain.",
    "yesNo": "Yes",
    "yesNoExplanation": "The Star is a gentle yes, especially for healing, hope, renewal, and long-term growth.",
    "positions": [
      {
        "label": "One card",
        "text": "Let hope return."
      },
      {
        "label": "Past",
        "text": "Healing or inspiration helped you continue."
      },
      {
        "label": "Present",
        "text": "A softer future is possible."
      },
      {
        "label": "Future",
        "text": "Renewal and clarity arrive slowly."
      },
      {
        "label": "Outcome",
        "text": "The result brings healing and restored faith."
      }
    ],
    "related": [
      "temperance",
      "sun",
      "moon"
    ],
    "recommendedSpreadId": "new-moon-intention",
    "faqs": [
      {
        "q": "Is The Star a good card?",
        "a": "Yes, it is one of tarot’s strongest cards of hope, healing, and renewal. It arrives like calm after a storm, restoring faith and a sense that life can open up again."
      },
      {
        "q": "What does The Star reversed mean?",
        "a": "Reversed, it can show discouragement, lost faith, or healing that still needs more time. It gently asks you to protect your hope rather than abandon it."
      },
      {
        "q": "Is The Star a yes card?",
        "a": "Usually yes, especially for questions about renewal, healing, and long-term growth. It is a gentle, encouraging yes rather than a loud one."
      }
    ]
  },
  {
    "slug": "moon",
    "designSlug": "the-moon",
    "roman": "XVIII",
    "num": "18",
    "name": "The Moon",
    "keywords": [
      "uncertainty",
      "illusion",
      "intuition"
    ],
    "image": "/assets/tarot/RWS_Tarot_18_Moon.jpg",
    "oneLine": "The Moon represents uncertainty, intuition, dreams, illusion, fear, and what is not fully revealed.",
    "upKeywords": [
      "uncertainty",
      "illusion",
      "intuition"
    ],
    "reversedKeywords": [
      "clarity",
      "confusion lifting",
      "denial"
    ],
    "overview": "The Moon appears when the path is dim. It asks you to move carefully, listen to intuition, and avoid mistaking fear for truth.",
    "upright": "Upright, The Moon points to mystery, anxiety, dreams, projection, or information that is not yet clear.",
    "reversed": "Reversed, it can show truth emerging, confusion lifting, or the need to stop denying what you sense.",
    "love": "In love, The Moon can show uncertainty, fantasy, hidden emotions, or fear. Reversed, clarity may begin to surface.",
    "career": "In career, it warns against unclear information, office politics, or decisions made under anxiety.",
    "money": "For money, The Moon asks for caution, research, and avoiding unclear deals.",
    "yesNo": "Maybe — leaning no",
    "yesNoExplanation": "The Moon does not give a clean yes. It says the situation is unclear and more truth is needed.",
    "positions": [
      {
        "label": "One card",
        "text": "Do not rush through uncertainty."
      },
      {
        "label": "Past",
        "text": "Confusion or fear shaped the path."
      },
      {
        "label": "Present",
        "text": "Not everything is visible yet."
      },
      {
        "label": "Future",
        "text": "The truth emerges slowly."
      },
      {
        "label": "Outcome",
        "text": "The result depends on separating intuition from fear."
      }
    ],
    "related": [
      "high-priestess",
      "star",
      "hermit"
    ],
    "recommendedSpreadId": "celtic-cross",
    "faqs": [
      {
        "q": "Is The Moon a bad card?",
        "a": "Not bad, but unclear. It points to uncertainty, illusion, and emotion, asking you to move carefully and lean on your intuition. Its main caution is not to mistake fear for truth."
      },
      {
        "q": "Does The Moon mean deception?",
        "a": "It can, particularly when the question involves hidden motives or facts that are not fully visible. Often, though, the confusion comes from within — projection, anxiety, or fantasy — as much as from others."
      },
      {
        "q": "Is The Moon a yes or no card?",
        "a": "It usually leans from maybe to no, at least until clarity improves. The card suggests waiting for more truth to surface before you decide."
      }
    ]
  },
  {
    "slug": "sun",
    "designSlug": "the-sun",
    "roman": "XIX",
    "num": "19",
    "name": "The Sun",
    "keywords": [
      "joy",
      "success",
      "clarity"
    ],
    "image": "/assets/tarot/RWS_Tarot_19_Sun.jpg",
    "oneLine": "The Sun represents joy, clarity, success, vitality, confidence, and open-hearted truth.",
    "upKeywords": [
      "joy",
      "success",
      "clarity"
    ],
    "reversedKeywords": [
      "delayed joy",
      "low confidence",
      "temporary cloud"
    ],
    "overview": "The Sun is one of tarot’s clearest positive cards. It brings light, honesty, warmth, and the confidence to be seen.",
    "upright": "Upright, The Sun supports happiness, vitality, success, optimism, and clear understanding.",
    "reversed": "Reversed, it can show delayed happiness, muted confidence, or joy that is available but not fully felt yet.",
    "love": "In love, The Sun brings warmth, honesty, playfulness, and mutual joy. Reversed, communication may need brightening.",
    "career": "In career, it favors recognition, success, visibility, and confident progress.",
    "money": "For money, The Sun suggests improvement, optimism, and clearer financial direction.",
    "yesNo": "Yes",
    "yesNoExplanation": "The Sun is one of the strongest yes cards, especially for clarity, success, and wellbeing.",
    "positions": [
      {
        "label": "One card",
        "text": "Choose clarity and joy."
      },
      {
        "label": "Past",
        "text": "Happiness or success shaped your confidence."
      },
      {
        "label": "Present",
        "text": "The answer is becoming clear."
      },
      {
        "label": "Future",
        "text": "Success, warmth, or relief is likely."
      },
      {
        "label": "Outcome",
        "text": "The result is bright, open, and positive."
      }
    ],
    "related": [
      "star",
      "strength",
      "world"
    ],
    "recommendedSpreadId": "daily",
    "faqs": [
      {
        "q": "Is The Sun the best tarot card?",
        "a": "It is one of the most positive cards, radiating joy, clarity, success, and vitality. Many readers consider it the brightest and most affirming card in the entire deck."
      },
      {
        "q": "What does The Sun reversed mean?",
        "a": "Reversed, it can show delayed happiness, temporary clouds, or confidence that needs rebuilding. The warmth is still available — it simply is not being fully felt yet."
      },
      {
        "q": "Is The Sun a yes card?",
        "a": "Yes, and a very strong one. It is among the clearest affirmative cards, especially for questions about clarity, success, and wellbeing."
      }
    ]
  },
  {
    "slug": "judgement",
    "designSlug": "judgement",
    "roman": "XX",
    "num": "20",
    "name": "Judgement",
    "keywords": [
      "awakening",
      "rebirth",
      "calling"
    ],
    "image": "/assets/tarot/RWS_Tarot_20_Judgement.jpg",
    "oneLine": "Judgement represents awakening, reflection, accountability, rebirth, and answering a deeper call.",
    "upKeywords": [
      "awakening",
      "rebirth",
      "calling"
    ],
    "reversedKeywords": [
      "self-doubt",
      "avoidance",
      "unfinished lesson"
    ],
    "overview": "Judgement appears when a chapter asks to be reviewed honestly. It is the card of waking up, owning the past, and choosing renewal.",
    "upright": "Upright, Judgement supports self-evaluation, second chances, awakening, and life-changing clarity.",
    "reversed": "Reversed, it can show fear of being judged, avoiding a call, or repeating an unfinished lesson.",
    "love": "In love, Judgement can show reconciliation, honest review, forgiveness, or a relationship reaching a defining moment.",
    "career": "In career, it points to vocation, major review, public evaluation, or a decision about your next calling.",
    "money": "For money, Judgement asks you to review past choices and make a more conscious plan.",
    "yesNo": "Yes — if accountable",
    "yesNoExplanation": "Judgement leans yes when you are ready to answer honestly and act from a renewed understanding.",
    "positions": [
      {
        "label": "One card",
        "text": "Answer the call honestly."
      },
      {
        "label": "Past",
        "text": "A wake-up call shaped this moment."
      },
      {
        "label": "Present",
        "text": "Review, decide, and rise."
      },
      {
        "label": "Future",
        "text": "A second chance or awakening arrives."
      },
      {
        "label": "Outcome",
        "text": "The result brings renewal through truth."
      }
    ],
    "related": [
      "justice",
      "death",
      "world"
    ],
    "recommendedSpreadId": "year-ahead",
    "faqs": [
      {
        "q": "Does Judgement mean someone is judging me?",
        "a": "Usually not. It points to self-reflection, honest self-evaluation, and accountability rather than outside criticism. Its deeper theme is awakening and answering an inner call."
      },
      {
        "q": "Is Judgement about second chances?",
        "a": "Yes, often — but typically after an honest review of the past. It offers renewal and a genuine fresh start once you have owned what came before."
      },
      {
        "q": "Is Judgement a yes or no card?",
        "a": "It leans yes when you are ready to be accountable and act from a renewed understanding. The clearer your honesty, the stronger the yes."
      }
    ]
  },
  {
    "slug": "world",
    "designSlug": "the-world",
    "roman": "XXI",
    "num": "21",
    "name": "The World",
    "keywords": [
      "completion",
      "achievement",
      "wholeness"
    ],
    "image": "/assets/tarot/RWS_Tarot_21_World.jpg",
    "oneLine": "The World represents completion, integration, achievement, wholeness, and the end of a meaningful cycle.",
    "upKeywords": [
      "completion",
      "achievement",
      "wholeness"
    ],
    "reversedKeywords": [
      "unfinished business",
      "delay",
      "incompletion"
    ],
    "overview": "The World closes the Major Arcana journey. It appears when something is ready to be completed, integrated, and understood as a whole.",
    "upright": "Upright, The World supports achievement, closure, fulfillment, travel, graduation, and integration.",
    "reversed": "Reversed, it can show unfinished business, delayed completion, or the need to tie up loose ends.",
    "love": "In love, The World can show fulfillment, maturity, or a relationship reaching an important milestone. Reversed, closure may be incomplete.",
    "career": "In career, it favors completion, recognition, global work, graduation, or reaching a professional goal.",
    "money": "For money, The World points to long-term completion or reward after sustained effort.",
    "yesNo": "Yes",
    "yesNoExplanation": "The World is a strong yes when the question involves completion, achievement, or moving into a fuller chapter.",
    "positions": [
      {
        "label": "One card",
        "text": "Complete the cycle with awareness."
      },
      {
        "label": "Past",
        "text": "A major chapter reached completion."
      },
      {
        "label": "Present",
        "text": "Integration and closure are needed now."
      },
      {
        "label": "Future",
        "text": "A goal can be completed."
      },
      {
        "label": "Outcome",
        "text": "The result is completion, fulfillment, and readiness for what comes next."
      }
    ],
    "related": [
      "fool",
      "wheel-of-fortune",
      "judgement"
    ],
    "recommendedSpreadId": "year-ahead",
    "faqs": [
      {
        "q": "Is The World a positive card?",
        "a": "Yes, it is one of the most rewarding cards, pointing to completion, achievement, and wholeness. It marks the successful close of a meaningful cycle."
      },
      {
        "q": "What does The World reversed mean?",
        "a": "Reversed, it can show unfinished business, delay, or the need to tie up loose ends before a chapter can truly close. Completion is near, but not yet fully realized."
      },
      {
        "q": "Is The World a yes card?",
        "a": "Yes, especially when the question involves closure, achievement, or reaching a long-term goal. It affirms that a cycle is ready to be completed."
      }
    ]
  }
] satisfies TarotCardMeaning[];

export function cardMeaningPath(cardOrSlug: TarotCardMeaning | string) {
  const slug = typeof cardOrSlug === "string" ? cardOrSlug : cardOrSlug.slug;
  return `/card/${slug}`;
}

export function findTarotCardMeaning(slug: string) {
  return tarotCardMeanings.find((card) => card.slug === slug) ?? null;
}

export function cardMeaningTitle(card: TarotCardMeaning) {
  return `${card.name} Tarot Card Meaning | Upright & Reversed`;
}

export function cardMeaningDescription(card: TarotCardMeaning) {
  return clampSeoDescription(
    `Learn ${card.name} tarot card meaning: upright and reversed interpretations, love, career, money, yes or no answer, spread positions, and related Major Arcana cards.`
  );
}

export function cardMeaningKeywords(card: TarotCardMeaning) {
  return [
    `${card.name.toLowerCase()} tarot card meaning`,
    `${card.name.toLowerCase()} upright`,
    `${card.name.toLowerCase()} reversed`,
    `${card.name.toLowerCase()} love meaning`,
    `${card.name.toLowerCase()} yes or no`,
    "major arcana",
    "rider waite tarot",
  ];
}
