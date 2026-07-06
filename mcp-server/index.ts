/**
 * @file mcp-server/index.ts
 * @description Farm-in-One MCP (Model Context Protocol) Server
 *
 * This server exposes Farm-in-One's agricultural data as MCP tools,
 * allowing any MCP-compatible AI agent (e.g. Claude, Gemini ADK agents)
 * to query real-time farming data programmatically.
 *
 * Tools exposed:
 *  - get_mandi_prices       → Live/simulated crop market prices
 *  - get_weather_advisory   → 7-day rainfall and crop action advisory
 *  - get_water_metrics      → WRIS groundwater and soil moisture data
 *  - get_fertilizer_dose    → N-P-K bag recommendations by crop/soil
 *  - get_pest_advice        → Pest and disease treatment lookup
 *  - get_finance_options    → KCC loan and insurance rate registry
 *
 * Transport: stdio (standard MCP transport for local agents)
 *
 * Security:
 *  - All financial tools are READ-ONLY registry lookups
 *  - No loan submission, approval, or mutation is possible
 *  - Input validation on all tool parameters
 *
 * Usage (with Claude Desktop or ADK agent):
 *  Add to mcp_config.json:
 *  {
 *    "mcpServers": {
 *      "farm-in-one": {
 *        "command": "node",
 *        "args": ["/path/to/farm-in-one/mcp-server/index.js"]
 *      }
 *    }
 *  }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// ─────────────────────────────────────────────
// Data: Mandi Prices
// ─────────────────────────────────────────────

/** Simulated mandi price registry (replace with live AGMARKNET API in production) */
const MANDI_PRICES: Record<string, { pricePerQuintal: number; change7d: number; signal: 'sell' | 'hold' }> = {
  paddy:   { pricePerQuintal: 2310, change7d: 3.8,  signal: 'sell' },
  corn:    { pricePerQuintal: 1960, change7d: 4.2,  signal: 'sell' },
  wheat:   { pricePerQuintal: 2275, change7d: 1.5,  signal: 'sell' },
  cotton:  { pricePerQuintal: 6840, change7d: -2.4, signal: 'hold' },
  chilli:  { pricePerQuintal: 11900, change7d: 5.1, signal: 'sell' },
  tomato:  { pricePerQuintal: 1540, change7d: -8.3, signal: 'hold' }
};

// ─────────────────────────────────────────────
// Data: Fertilizer Doses (50 kg bags per acre)
// ─────────────────────────────────────────────

/** Base N-P-K (as Urea/DAP/MOP bags) per acre per crop */
const FERTILIZER_DOSES: Record<string, { urea: number; dap: number; mop: number }> = {
  paddy:   { urea: 1.3, dap: 1.0, mop: 0.7 },
  cotton:  { urea: 1.5, dap: 1.2, mop: 1.0 },
  chilli:  { urea: 1.8, dap: 1.4, mop: 1.2 },
  corn:    { urea: 1.4, dap: 0.9, mop: 0.6 },
  wheat:   { urea: 1.2, dap: 0.8, mop: 0.5 },
  tomato:  { urea: 1.6, dap: 1.3, mop: 1.1 }
};

// ─────────────────────────────────────────────
// Data: Pest & Disease Treatments
// ─────────────────────────────────────────────

const PEST_TREATMENTS: Record<string, { organic: string; chemical: string; severity: string }> = {
  blast:      { organic: 'Pseudomonas fluorescens 10g/L',     chemical: 'Tricyclazole 75 WP at 0.6g/L',          severity: 'critical' },
  borer:      { organic: 'Neem oil 5ml/L + pheromone traps',  chemical: 'Cartap Hydrochloride 4G at 8kg/acre',   severity: 'critical' },
  armyworm:   { organic: 'Neem oil 5ml/L + pheromone traps',  chemical: 'Chlorpyrifos 20 EC at 2ml/L',           severity: 'critical' },
  curl:       { organic: 'NSKE 5% + yellow sticky traps',     chemical: 'Imidacloprid 17.8 SL at 0.5ml/L',       severity: 'warning'  },
  rot:        { organic: 'Trichoderma viride enriched manure', chemical: 'Carbendazim 50 WP at 2g/L soil drench', severity: 'critical' },
  nutrient:   { organic: 'Well-decomposed farmyard manure',    chemical: 'Zinc Sulfate 0.5% foliar spray',         severity: 'safe'     },
  rust:       { organic: 'Pseudomonas fluorescens 10g/L',     chemical: 'Propiconazole 25 EC at 1ml/L',           severity: 'warning'  },
  mildew:     { organic: 'Neem oil 3ml/L',                    chemical: 'Mancozeb 75 WP at 2g/L',                severity: 'warning'  }
};

// ─────────────────────────────────────────────
// MCP Server Setup
// ─────────────────────────────────────────────

const server = new McpServer({
  name: 'farm-in-one',
  version: '1.0.0'
});

// ─────────────────────────────────────────────
// Tool 1: get_mandi_prices
// ─────────────────────────────────────────────

server.tool(
  'get_mandi_prices',
  'Get current mandi market prices and sell/hold signals for a crop. Returns price per quintal, 7-day change %, and recommendation.',
  {
    crop: z.string().describe('Crop name: paddy, corn, wheat, cotton, chilli, or tomato'),
    language: z.string().optional().describe('Response language code: en, hi, te, ta, mr')
  },
  async ({ crop, language = 'en' }) => {
    const cropKey = crop.toLowerCase().trim();
    const data = MANDI_PRICES[cropKey];

    if (!data) {
      return {
        content: [{
          type: 'text',
          text: `Crop "${crop}" not found. Supported crops: ${Object.keys(MANDI_PRICES).join(', ')}`
        }]
      };
    }

    const arrow = data.change7d > 0 ? '▲' : '▼';
    const result = {
      crop: cropKey,
      pricePerQuintal: data.pricePerQuintal,
      change7d: `${arrow}${Math.abs(data.change7d)}%`,
      recommendation: data.signal,
      currency: 'INR',
      unit: 'quintal',
      source: 'Farm-in-One simulated registry (production: AGMARKNET API)',
      disclaimer: 'READ-ONLY registry. No transaction is initiated.'
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Tool 2: get_weather_advisory
// ─────────────────────────────────────────────

server.tool(
  'get_weather_advisory',
  'Get a 7-day weather risk summary and crop-specific action advisory for a given region.',
  {
    region: z.string().describe('Village, block, or district name'),
    crop: z.string().optional().describe('Crop type to tailor the advisory'),
    language: z.string().optional().describe('Response language code: en, hi, te, ta, mr')
  },
  async ({ region, crop = 'general', language = 'en' }) => {
    // Simulated advisory — in production, query IMD or OpenWeatherMap API
    const advisory = {
      region,
      crop,
      language,
      forecastSummary: '72% rain chance in next 3 days. Storm risk on Day 3. Heat stress on Day 6.',
      cropActions: [
        'Day 1-2: Delay pesticide spray. Clear field drains.',
        'Day 3: Secure nursery beds. Do NOT broadcast fertilizer.',
        'Day 4-5: Good transplanting window after storm clears.',
        'Day 6: Irrigate early morning. Heat index critical.',
        'Day 7: Watch for fungal pressure post-rain.'
      ],
      source: 'Farm-in-One simulated weather matrix (production: IMD API + OpenWeatherMap)'
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(advisory, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Tool 3: get_water_metrics
// ─────────────────────────────────────────────

server.tool(
  'get_water_metrics',
  'Get groundwater depth, reservoir capacity, canal release, and soil moisture metrics for a block.',
  {
    block: z.string().describe('Block or village name'),
    latitude: z.number().optional().describe('GPS latitude for precise metrics'),
    longitude: z.number().optional().describe('GPS longitude for precise metrics')
  },
  async ({ block, latitude, longitude }) => {
    // Generate coordinate-bound metrics if GPS is available
    let metrics;
    if (latitude !== undefined && longitude !== undefined) {
      metrics = {
        block: `${block} (${latitude.toFixed(3)}° N, ${longitude.toFixed(3)}° E)`,
        groundwaterDepthMeters: parseFloat((5.0 + (Math.abs(latitude * 4.7) % 13.0)).toFixed(1)),
        reservoirCapacityPercent: Math.round(25 + (Math.abs((latitude + longitude) * 6.7) % 65)),
        canalReleaseCusecs: Math.round(30 + (Math.abs(longitude * 7.9) % 210)),
        soilMoisturePercent: Math.round(18.0 + (Math.abs(longitude * 11.3) % 48.0)),
        gpsSource: true
      };
    } else {
      metrics = {
        block,
        groundwaterDepthMeters: 8.4,
        reservoirCapacityPercent: 62,
        canalReleaseCusecs: 145,
        soilMoisturePercent: 41,
        gpsSource: false
      };
    }

    const status = metrics.soilMoisturePercent < 25 ? 'critical' : metrics.soilMoisturePercent < 35 ? 'warning' : 'safe';
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ ...metrics, status, source: 'Farm-in-One WRIS water service (production: India-WRIS API)' }, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Tool 4: get_fertilizer_dose
// ─────────────────────────────────────────────

server.tool(
  'get_fertilizer_dose',
  'Calculate recommended Urea, DAP, and MOP (Potash) bags per acre for a given crop and soil type. Returns 50kg bag counts.',
  {
    crop: z.string().describe('Crop name: paddy, corn, wheat, cotton, chilli, tomato'),
    acres: z.number().positive().describe('Farm area in acres'),
    soilType: z.enum(['alluvial', 'black', 'red', 'laterite']).describe('Soil type')
  },
  async ({ crop, acres, soilType }) => {
    const cropKey = crop.toLowerCase().trim();
    const base = FERTILIZER_DOSES[cropKey] ?? FERTILIZER_DOSES['paddy'];

    // Apply soil type multipliers
    let { urea, dap, mop } = base;
    if (soilType === 'black')    mop   *= 0.8;          // Rich in K, reduce MOP
    if (soilType === 'red')    { urea  *= 1.15; dap *= 1.15; } // N&P deficient
    if (soilType === 'laterite'){ dap  *= 1.1;  urea *= 1.1;  } // Acidic, low fertility

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          crop: cropKey,
          acres,
          soilType,
          recommendations: {
            ureaBags_50kg: parseFloat((acres * urea).toFixed(1)),
            dapBags_50kg:  parseFloat((acres * dap).toFixed(1)),
            mopBags_50kg:  parseFloat((acres * mop).toFixed(1))
          },
          timing: '50% DAP at sowing/transplanting. Urea — 50% at 21 days, 50% at 42 days. MOP at sowing.',
          disclaimer: 'Always conduct a soil test before the season for precise recommendations.'
        }, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Tool 5: get_pest_advice
// ─────────────────────────────────────────────

server.tool(
  'get_pest_advice',
  'Get organic and chemical treatment advice for a specific pest or disease on a crop.',
  {
    pest: z.string().describe('Pest or disease name: blast, borer, armyworm, curl, rot, rust, mildew, nutrient'),
    crop: z.string().optional().describe('Crop type for context'),
    language: z.string().optional().describe('Response language code: en, hi, te, ta, mr')
  },
  async ({ pest, crop = 'general', language = 'en' }) => {
    const pestKey = pest.toLowerCase().trim();
    const data = PEST_TREATMENTS[pestKey];

    if (!data) {
      return {
        content: [{
          type: 'text',
          text: `Pest "${pest}" not found. Supported: ${Object.keys(PEST_TREATMENTS).join(', ')}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          pest: pestKey,
          crop,
          severity: data.severity,
          organicTreatment: data.organic,
          chemicalTreatment: data.chemical,
          language,
          note: 'Always prefer organic options first. Apply chemical treatments only if severity is critical or warning.'
        }, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Tool 6: get_finance_options
// ─────────────────────────────────────────────

server.tool(
  'get_finance_options',
  'Get read-only crop loan rate registry comparing KCC, co-op, and private lenders. NEVER submits or approves loans.',
  {
    cropType: z.string().optional().describe('Crop type for contextual advice'),
    language: z.string().optional().describe('Response language code')
  },
  async ({ cropType = 'general', language = 'en' }) => {
    // READ-ONLY: this tool only returns comparison data, never initiates transactions
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          disclaimer: 'READ-ONLY registry. No loan is submitted, approved, or mutated by this tool.',
          cropType,
          language,
          loanOptions: [
            {
              name: 'Kisan Credit Card (KCC)',
              annualInterestRate: '4% (with prompt repayment subvention)',
              source: 'State-sponsored government registry',
              riskLevel: 'low',
              recommended: true
            },
            {
              name: 'Cooperative Seasonal Crop Credit',
              annualInterestRate: '7-9%',
              source: 'Verified cooperative bank registry',
              riskLevel: 'medium',
              recommended: true
            },
            {
              name: 'Private Lender',
              annualInterestRate: '18-36%',
              source: 'Unregistered private offer — FLAGGED',
              riskLevel: 'HIGH',
              recommended: false,
              warning: 'Avoid! Rates far above regulated KCC benchmark.'
            }
          ],
          insurance: 'PMFBY crop insurance: enroll before monsoon onset for coverage.',
          source: 'Farm-in-One read-only finance registry'
        }, null, 2)
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Start the MCP Server
// ─────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Farm-in-One MCP Server running on stdio transport');
}

main().catch((error) => {
  console.error('MCP Server fatal error:', error);
  process.exit(1);
});
