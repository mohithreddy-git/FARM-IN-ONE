/**
 * @file orchestrator.ts
 * @description Farm-in-One Multi-Agent Orchestrator (ADK-style)
 *
 * Architecture:
 * ┌────────────────────────────────────────────────────────┐
 * │                FarmOrchestrator (Root Agent)           │
 * │  Receives farmer query → classifies intent →           │
 * │  routes to the correct specialist sub-agent            │
 * └────────────┬───────────────────────────────────────────┘
 *              │
 *    ┌─────────┼──────────────────────────┐
 *    ▼         ▼          ▼               ▼
 * WeatherAgent  MandiAgent  PestAgent  FinanceAgent
 *
 * Each sub-agent:
 *  - Has a focused system prompt (domain-locked)
 *  - Exposes a `run(query, context)` method
 *  - Returns a structured AgentResult
 *  - Falls back to local heuristics offline
 *
 * Security:
 *  - All sub-agents reject non-agricultural queries
 *  - No eval(), no innerHTML, no raw script injection
 *  - API key is user-supplied and never hardcoded
 */

import { getGeminiApiKey, isFarmingRelated } from '../services/aiService';

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────

export type AgentDomain = 'weather' | 'market' | 'pest' | 'finance' | 'soil' | 'general';

export interface AgentContext {
  /** ISO language code from farmer profile */
  language: string;
  /** Farmer's crop type */
  cropType: string;
  /** Farmer's block / village */
  village: string;
  /** GPS latitude (optional — only if permission granted) */
  latitude?: number;
  /** GPS longitude (optional — only if permission granted) */
  longitude?: number;
}

export interface AgentResult {
  /** The sub-agent that handled this query */
  handledBy: AgentDomain;
  /** Final text response to present to the farmer */
  response: string;
  /** Whether this came from a live AI call or a local fallback */
  source: 'live-ai' | 'local-fallback';
  /** Confidence level (1–5) for UI trust indicator */
  confidence: number;
}

// ─────────────────────────────────────────────
// Intent Classifier
// ─────────────────────────────────────────────

/**
 * Classifies the farmer's query into a domain so the orchestrator
 * can route it to the correct specialist agent.
 *
 * Intent detection uses a keyword-based approach for speed and
 * offline compatibility — no network call required.
 */
function classifyIntent(query: string): AgentDomain {
  const q = query.toLowerCase();

  // Weather & irrigation keywords across 5 languages
  if (
    q.includes('weather') || q.includes('rain') || q.includes('irrigation') ||
    q.includes('बारिश') || q.includes('মৌसম') || q.includes('వర్షం') ||
    q.includes('மழை') || q.includes('पाऊस') || q.includes('water') ||
    q.includes('flood') || q.includes('drought') || q.includes('forecast')
  ) return 'weather';

  // Market & mandi keywords
  if (
    q.includes('price') || q.includes('mandi') || q.includes('market') ||
    q.includes('sell') || q.includes('rate') || q.includes('मंडी') ||
    q.includes('ధర') || q.includes('விற்') || q.includes('भाव') ||
    q.includes('cost') || q.includes('quintal') || q.includes('खरीद')
  ) return 'market';

  // Pest & disease keywords
  if (
    q.includes('pest') || q.includes('disease') || q.includes('insect') ||
    q.includes('fungus') || q.includes('leaf') || q.includes('borer') ||
    q.includes('कीट') || q.includes('रोग') || q.includes('పురుగు') ||
    q.includes('நோய்') || q.includes('कीड') || q.includes('spray') ||
    q.includes('wilt') || q.includes('rot') || q.includes('curl') ||
    q.includes('spots') || q.includes('yellow') || q.includes('blast')
  ) return 'pest';

  // Finance & loan keywords
  if (
    q.includes('loan') || q.includes('kcc') || q.includes('finance') ||
    q.includes('interest') || q.includes('money') || q.includes('ऋण') ||
    q.includes('రుణం') || q.includes('கடன்') || q.includes('कर्ज') ||
    q.includes('insurance') || q.includes('credit') || q.includes('bank')
  ) return 'finance';

  // Soil & fertilizer keywords
  if (
    q.includes('soil') || q.includes('fertilizer') || q.includes('urea') ||
    q.includes('dap') || q.includes('potash') || q.includes('manure') ||
    q.includes('मिट्टी') || q.includes('నేల') || q.includes('மண்') ||
    q.includes('माती') || q.includes('compost') || q.includes('nutrient')
  ) return 'soil';

  return 'general';
}

// ─────────────────────────────────────────────
// Base Sub-Agent Class
// ─────────────────────────────────────────────

/**
 * Abstract base for all specialist sub-agents.
 * Each sub-agent has a domain-locked system prompt and a `run()` method.
 */
abstract class SubAgent {
  abstract readonly domain: AgentDomain;

  /**
   * Each sub-agent must provide its own system prompt.
   * This is injected into every Gemini request to constrain the model.
   */
  abstract buildSystemPrompt(context: AgentContext): string;

  /**
   * Local fallback when Gemini is unavailable (no API key or offline).
   * Sub-agents must implement this so the app works without internet.
   */
  abstract localFallback(query: string, context: AgentContext): string;

  /** Call Gemini API with the sub-agent's domain-locked system prompt */
  async callGemini(query: string, context: AgentContext): Promise<string | null> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return null;

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: query }] }]
          })
        }
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {
      return null;
    }
  }

  /** Main entry point — tries live AI then falls back to local heuristics */
  async run(query: string, context: AgentContext): Promise<AgentResult> {
    const liveResponse = await this.callGemini(query, context);
    if (liveResponse) {
      return {
        handledBy: this.domain,
        response: liveResponse,
        source: 'live-ai',
        confidence: 5
      };
    }
    return {
      handledBy: this.domain,
      response: this.localFallback(query, context),
      source: 'local-fallback',
      confidence: 3
    };
  }
}

// ─────────────────────────────────────────────
// Specialist Sub-Agents
// ─────────────────────────────────────────────

/**
 * WeatherAgent — answers rain, irrigation, heat-stress questions.
 * Only activated for weather-domain queries by the orchestrator.
 */
class WeatherAgent extends SubAgent {
  readonly domain: AgentDomain = 'weather';

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Weather & Irrigation sub-agent for Farm-in-One.
ONLY answer weather, rainfall, irrigation, drought, or flood questions.
The farmer grows ${context.cropType} near ${context.village}.
Always reply in language code: ${context.language}.
Keep advice plain-language and actionable for a smallholder farmer.
Never discuss topics outside weather and water management.`;
  }

  localFallback(_query: string, _ctx: AgentContext): string {
    const msgs: Record<string, string> = {
      en: "Weather Advice: Avoid pesticide sprays when heavy rain is forecasted. Mulch fields to retain moisture if heat index is high. Monitor soil moisture before each irrigation cycle.",
      hi: "मौसम सलाह: भारी बारिश की संभावना होने पर छिड़काव न करें। मिट्टी की नमी के अनुसार सिंचाई करें।",
      te: "వాతావరణ సలహా: భారీ వర్షం సూచన ఉంటే మందులు వాడవద్దు. నేల తేమను బట్టి నీరు పెట్టండి.",
      ta: "வானிலை ஆலோசனை: கனமழை இருக்கும் போது மருந்து தெளிக்காதீர்கள். மண் ஈரப்பதத்தை கண்காணிக்கவும்.",
      mr: "हवामान सल्ला: पाऊस अपेक्षित असल्यास फवारणी टाळा. मातीतील ओलावा पाहूनच पाणी द्या."
    };
    return msgs[_ctx.language] || msgs.en;
  }
}

/**
 * MandiAgent — gives crop-price signals and sell/hold recommendations.
 * Stays strictly within market and pricing domain.
 */
class MandiAgent extends SubAgent {
  readonly domain: AgentDomain = 'market';

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Mandi & Market sub-agent for Farm-in-One.
ONLY answer questions about crop market prices, sell/hold signals, and mandi trends.
Current crops we track: Paddy (₹2310/q), Corn (₹1960/q), Wheat (₹2275/q), Cotton (₹6840/q), Chilli (₹11900/q), Tomato (₹1540/q).
The farmer grows ${context.cropType} near ${context.village}.
Always reply in language code: ${context.language}.
Never give advice outside crop pricing and market strategy.`;
  }

  localFallback(_query: string, ctx: AgentContext): string {
    const msgs: Record<string, string> = {
      en: `Market Advice: Today's sell signals — Paddy ₹2310/q ▲3.8%, Corn ₹1960/q ▲4.2%, Wheat ₹2275/q ▲1.5%. Hold Cotton (₹6840) and Tomato (₹1540) for recovery. Your crop (${ctx.cropType}) is tracked in live Mandi data.`,
      hi: `मंडी सलाह: आज धान (₹2310, +3.8%), मक्का (₹1960, +4.2%) और गेहूं (₹2275) बेचना सही है। कपास और टमाटर रोकें।`,
      te: `మార్కెట్ సలహా: నేడు వరి (₹2310), మొక్కజొన్న (₹1960) అమ్మడానికి అనుకూలం. పత్తి మరియు టమోటా నిల్వ చేయండి.`,
      ta: `சந்தை ஆலோசனை: இன்று நெல் (₹2310), சோளம் (₹1960) விற்க ஏற்றது. பருத்தி மற்றும் தக்காளியை தக்கவைக்கவும்.`,
      mr: `मंडी सल्ला: आज धान (₹2310), मका (₹1960) विकणे योग्य आहे. कापूस आणि टोमॅटो थांबवा.`
    };
    return msgs[ctx.language] || msgs.en;
  }
}

/**
 * PestAgent — diagnoses crop diseases, pests, and recommends
 * both organic and chemical treatments.
 */
class PestAgent extends SubAgent {
  readonly domain: AgentDomain = 'pest';

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Pest & Disease sub-agent for Farm-in-One.
ONLY answer crop disease, pest infestation, and treatment questions.
The farmer grows ${context.cropType} near ${context.village}.
Always recommend both organic options (neem, Trichoderma, Pseudomonas) AND chemical options.
Include dosage rates when possible. Keep advice actionable and plain-language.
Always reply in language code: ${context.language}.
Never discuss topics outside pest and disease management.`;
  }

  localFallback(query: string, ctx: AgentContext): string {
    const q = query.toLowerCase();
    const msgs: Record<string, string> = {
      en: q.includes('borer') || q.includes('armyworm')
        ? `Pest: Stem Borer/Armyworm. Organic: Neem oil 5ml/L + install pheromone traps 5/acre. Chemical: Cartap Hydrochloride 4G at 8kg/acre.`
        : q.includes('blast') || q.includes('spot') || q.includes('blight')
        ? `Disease: Blast/Blight. Organic: Pseudomonas fluorescens 10g/L. Chemical: Tricyclazole 75 WP at 0.6g/L.`
        : `Describe your crop symptoms (leaf spots, curl, borer holes, yellowing) for precise advice on your ${ctx.cropType} crop.`,
      hi: `कीट/रोग: लक्षणों के आधार पर सटीक सलाह दें। नीम तेल (5 मिली/ली) या ट्राइकोडर्मा विरिडी का उपयोग करें।`,
      te: `పురుగు/తెగులు: మీ పంట లక్షణాలు వివరించండి. వేప నూనె లేదా ట్రైకోడెర్మా వాడండి.`,
      ta: `பூச்சி/நோய்: வேப்ப எண்ணெய் (5 மிலி/லி) அல்லது டிரைக்கோடெர்மா உபயோகிக்கவும்.`,
      mr: `कीड/रोग: निंबोळी अर्क (5 मिली/ली) किंवा ट्रायकोडर्मा वापरा.`
    };
    return msgs[ctx.language] || msgs.en;
  }
}

/**
 * FinanceAgent — answers KCC loan, insurance, and input cost questions.
 * Read-only registry. Never submits or approves any financial transaction.
 */
class FinanceAgent extends SubAgent {
  readonly domain: AgentDomain = 'finance';

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Finance sub-agent for Farm-in-One.
ONLY answer questions about crop loans, KCC rates, PMFBY insurance, and input costs.
IMPORTANT SECURITY RULE: You are read-only. Never originate, submit, or approve loans.
Only compare rates and flag risks. KCC benchmark = 4% interest with prompt repayment subvention.
The farmer is near ${context.village}. Reply in language code: ${context.language}.
Always warn farmers about high-interest private lenders.`;
  }

  localFallback(_query: string, ctx: AgentContext): string {
    const msgs: Record<string, string> = {
      en: "Finance Advice: Always prefer the Kisan Credit Card (KCC) at 4% interest (with prompt repayment subvention). Avoid private lenders above 12%. Check PMFBY crop insurance before monsoon. This app is read-only — no loan is submitted.",
      hi: "वित्त सलाह: हमेशा KCC (4% ब्याज) को प्राधान्य दें। प्राइवेट साहूकार से बचें। PMFBY बीमा कराएं।",
      te: "ఆర్థిక సలహా: ఎల్లప్పుడూ KCC రుణం (4% వడ్డీ) తీసుకోండి. ప్రైవేట్ వడ్డీ వ్యాపారులను నివారించండి.",
      ta: "நிதி ஆலோசனை: எப்போதும் KCC கடன் (4% வட்டி) தேர்வு செய்யுங்கள். தனியார் வட்டிக்காரர்களை தவிர்க்கவும்.",
      mr: "आर्थिक सल्ला: KCC (4% व्याज) ला प्राधान्य द्या. खाजगी सावकारांकडून कर्ज टाळा."
    };
    return msgs[ctx.language] || msgs.en;
  }
}

/**
 * SoilAgent — answers fertilizer, soil health, and nutrient management.
 */
class SoilAgent extends SubAgent {
  readonly domain: AgentDomain = 'soil';

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Soil & Fertilizer sub-agent for Farm-in-One.
ONLY answer questions about soil health, fertilizer application (Urea, DAP, MOP/Potash), and nutrient management.
The farmer grows ${context.cropType} near ${context.village}.
Always mention both the dose (bags/acre) and timing (at sowing, 21 days, 42 days).
Reply in language code: ${context.language}.
Never discuss topics outside soil and fertilizer management.`;
  }

  localFallback(_query: string, ctx: AgentContext): string {
    const msgs: Record<string, string> = {
      en: `Soil Advice: Perform a soil test before every season. For ${ctx.cropType}: Apply DAP at sowing. Split Urea — 50% at 21 days, 50% at 42 days. Add Trichoderma-enriched compost for soil health. Apply MOP if potassium is deficient.`,
      hi: `मिट्टी सलाह: हर मौसम में मिट्टी परीक्षण करें। बुवाई पर DAP, 21 और 42 दिनों पर यूरिया डालें।`,
      te: `నేల సలహా: ప్రతి సీజన్‌కు నేల పరీక్ష చేయించండి. విత్తేటప్పుడు DAP, 21 మరియు 42 రోజులకు యూరియా వేయండి.`,
      ta: `மண் ஆலோசனை: ஒவ்வொரு சீசனிலும் மண் பரிசோதனை செய்யுங்கள். விதைக்கும் போது DAP, 21 மற்றும் 42 நாட்களில் யூரியா இடவும்.`,
      mr: `माती सल्ला: दर हंगामात माती परीक्षण करा. पेरणीच्या वेळी DAP, 21 आणि 42 दिवसांनी युरिया द्या.`
    };
    return msgs[ctx.language] || msgs.en;
  }
}

// ─────────────────────────────────────────────
// Root Orchestrator
// ─────────────────────────────────────────────

/**
 * FarmOrchestrator — the root agent that:
 *  1. Validates the query is farming-related (security gate)
 *  2. Classifies the intent into a domain
 *  3. Routes to the correct specialist sub-agent
 *  4. Returns a structured AgentResult
 *
 * This implements the multi-agent pattern from Google's ADK:
 *  - Root agent owns routing logic
 *  - Sub-agents are domain-locked and independently replaceable
 *  - All agents share the same AgentContext (farmer profile state)
 */
export class FarmOrchestrator {
  private readonly agents: Map<AgentDomain, SubAgent>;

  constructor() {
    // Register all specialist sub-agents
    this.agents = new Map<AgentDomain, SubAgent>([
      ['weather', new WeatherAgent()],
      ['market', new MandiAgent()],
      ['pest', new PestAgent()],
      ['finance', new FinanceAgent()],
      ['soil', new SoilAgent()],
      // 'general' falls through to the pest agent as default
      ['general', new PestAgent()]
    ]);
  }

  /**
   * Main entry point for all farmer queries.
   *
   * Security gate: rejects any query that is not farming-related
   * before it reaches any sub-agent or external API call.
   */
  async route(query: string, context: AgentContext): Promise<AgentResult> {
    // Security: reject non-agricultural queries at the orchestrator level
    if (!isFarmingRelated(query)) {
      return {
        handledBy: 'general',
        response: this.getOffTopicMessage(context.language),
        source: 'local-fallback',
        confidence: 5
      };
    }

    // Classify intent and select the right sub-agent
    const domain = classifyIntent(query);
    const agent = this.agents.get(domain) ?? this.agents.get('general')!;

    // Delegate to the specialist sub-agent
    return agent.run(query, context);
  }

  /** Returns the off-topic rejection message in the farmer's language */
  private getOffTopicMessage(language: string): string {
    const msgs: Record<string, string> = {
      en: "I specialize in farming, weather, mandi prices, pest control, soil health, and crop loans. Please ask me a farming question!",
      hi: "मैं केवल खेती, मौसम, मंडी, कीट और मिट्टी के बारे में बात कर सकता हूँ।",
      te: "నేను వ్యవసాయం, వాతావరణం, మార్కెట్, పురుగులు మరియు నేల గురించి మాత్రమే సమాధానం ఇవ్వగలను.",
      ta: "நான் விவசாயம், வானிலை, சந்தை மற்றும் பூச்சி நிர்வாகம் மட்டுமே பேசுவேன்.",
      mr: "मी केवळ शेती, हवामान, मंडी, कीड आणि माती याबद्दल बोलतो."
    };
    return msgs[language] || msgs.en;
  }
}

// Singleton instance — shared across the app
export const farmOrchestrator = new FarmOrchestrator();
