================================================================================
README: FARM-IN-ONE
================================================================================

PRODUCT NAME: Farm-in-One
SUBTITLE: Autonomous Multi-Lingual PWA & Agentic Engineering Harness
TRACK: Agents for Good
DEVELOPMENT MATRIX: Pure JavaScript / TypeScript


--------------------------------------------------------------------------------
1. PROJECT OVERVIEW
--------------------------------------------------------------------------------
Farm-in-One is a hyper-localized, low-cognitive-load, multi-lingual Progressive Web App (PWA) built specifically for smallholder farmers operating on low-end mobile devices in connectivity dead-zones. 

The system transitions traditional agricultural tracking into an automated, spec-driven interface dashboard. It aggregates real-time weather analytics, localized India-WRIS hydrology indices, state-sponsored financial subvention registries, and image-based crop threat scanners into a safe, isolated, and highly performant platform.


--------------------------------------------------------------------------------
2. ARCHITECTURAL HIERARCHY
--------------------------------------------------------------------------------
The project root is configured strictly around the following JavaScript/TypeScript directory structure:

farm-in-one/
├── public/
│   ├── manifest.json            # PWA cross-device installation parameters
│   └── sw.js                    # Service Worker caching engine for offline access
├── src/
│   ├── i18n/                    # Localization setup and custom dictionary files
│   │   ├── config.ts
│   │   └── locales/             # (en.json, hi.json, te.json, ta.json, mr.json)
│   ├── services/                # Simulated MCP Client Data Handshakes
│   │   ├── weatherService.ts    # Weather matrix proxy integrations
│   │   ├── wrisWaterService.ts  # India-WRIS hydrology lookups
│   │   └── financialService.ts  # Vetted KCC Loan registries & supplier prices
│   ├── components/              # Secure Trusted A2UI Component Catalog
│   │   ├── WeatherCard.tsx
│   │   ├── FinanceRadar.tsx
│   │   ├── PestScanner.tsx
│   │   └── A2UIRenderer.tsx     # Safe declarative component assembler
│   ├── App.tsx                  # Orchestrator View + PWA installation triggers
│   └── main.tsx
└── AGENTS.md                    # Static Context Source of Truth


--------------------------------------------------------------------------------
3. CORE SYSTEM CONSTRAINTS (AGENTS.MD)
--------------------------------------------------------------------------------
Development frameworks and code-generation models must strictly adhere to the security rules declared inside AGENTS.md:
* Default-Deny Model: All dynamic code generation and model payloads are sandboxed against an internal library checklist.
* Read-Only Financials: The platform compares rates and surfaces subventions (like the Kisan Credit Card 4% benchmark), but must never originate or mutate active loans.
* Zero Script Injections: The use of eval(), new Function(), raw HTML rendering, or dangerous structural properties like dangerouslySetInnerHTML is explicitly prohibited.
* Offline Self-Reliance: The app shell, language packets, and navigation arrays are cached client-side to keep core operations running completely offline.


--------------------------------------------------------------------------------
4. USER EXPERIENCE & PERSUASIVE DESIGN
--------------------------------------------------------------------------------
* Initial-State Pipeline: The application boots completely in English to guarantee layout stability, presenting large, high-contrast action elements that prompt users to switch immediately to their custom language (Hindi, Telugu, Tamil, Marathi).
* Chromatic Color Triggers: The UI guides immediate user intent through clear color indicators. Safe, approved steps, ideal weather windows, and low loan metrics are accented in high-visibility Green. Critical pest threats, incoming weather alerts, and high-interest factors flash in high-impact Red.
* Agro-Palette Composition: Visual aesthetics are restricted to an accessible mix of crisp White backgrounds, organic Green accents, and fresh water Blue states.


--------------------------------------------------------------------------------
5. INNOVATIVE AGENT FACILITIES
--------------------------------------------------------------------------------
Beyond baseline data streams, this repository implements two custom modules:
* Local Equipment-Sharing Marketplace: A local peer-to-peer directory layout allowing farmers to organize local equipment and tool rentals without handling transaction execution or financial risks.
* Multi-Turn Crop-Yield Predictive Calculator: An interactive analytics component that projects total target harvest yields based on cumulative manual entries, groundwater histories, and soil profiles.


--------------------------------------------------------------------------------
6. RUNTIME SELF-CORRECTION HARNESS
--------------------------------------------------------------------------------
Every external asynchronous service call is wrapped inside a stateful try/catch circuit breaker pipeline. If an external API schema breaks or cellular reception drops entirely, the JavaScript execution environment intercepts the error traceback, locks down visual system failure cascades, and automatically generates intuitive, local multi-lingual manual fallback confirmation flows to preserve field usability.


--------------------------------------------------------------------------------
7. PWA DEPLOYMENT & INSTALLATION
--------------------------------------------------------------------------------
* Service Worker (sw.js): Implements a strict cache-first model strategy, ensuring core structural code sheets and active language translation packages function seamlessly without mobile internet reception.
* Installation Fluidity: The app listens for the browser's native beforeinstallprompt interceptor event, storing the token inside local state and displaying a persistent, easy-access top banner link that allows immediate app installation directly to a mobile home screen.
================================================================================
