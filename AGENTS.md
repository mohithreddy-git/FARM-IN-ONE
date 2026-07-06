Farm-in-One Agent Context

System Goal
Farm-in-One is a hyper-localized, low-cognitive-load, multilingual platform for smallholder farmers. It must make weather, water, finance, pest, soil, mandi, yield, and equipment decisions easier to understand on low-end mobile devices.

Operating Constraints
* Use a default-deny security model for generated UI and agent-authored payloads.
* All financial actions are read-only registry lookups. The app may compare rates and flag risk, but it must not originate, submit, approve, or mutate loan applications.
* Runtime templates must never use eval(), new Function(), raw HTML execution, script injection, or arbitrary event-handler strings.
* Declarative UI instructions must be matched against the trusted internal component catalog only.
* Unknown components, unknown props, executable-looking strings, and unsafe keys such as dangerouslySetInnerHTML, script, style, onClick, or href must be rejected.
* Farmer-facing copy must be localized and plain-language first.
* Offline mode should preserve the app shell and language files; online mode should surface live-capable service workflows when available.

UX & Visual Persuasion Rules
* Initial State: The interface launches in English to guarantee clear technical structure, showing prominent, high-contrast target buttons for immediate language selection.
* Language Selection: Users can switch seamlessly to their custom dialect (Hindi, Telugu, Tamil, Marathi). Every component, button, and dynamic validation notification must completely render in the selected language.
* Persuasive Colors: High-impact psychological color triggers must be applied to guide intent. Approved steps, optimal sowing windows, and lower-interest KCC loan flags are accented in vivid Green. High-risk crop threats, immediate weather alerts, and high interest rate indicators are accented in warning Red.
* Agro-Palette: The overarching structure emphasizes clean White backgrounds, with deep organic Greens and fresh Blues for data fields and monitoring states.

Autonomous Innovative Features
* Local Equipment-Sharing Marketplace: An internal peer-to-peer sharing registry where farmers can list, locate, and coordinate agricultural tool rentals locally without transaction execution.
* Multi-Turn Crop-Yield Predictive Calculator: An interactive projection tool calculating harvest yields based on cumulative local inputs, historic water indicators, and soil data parameters.
