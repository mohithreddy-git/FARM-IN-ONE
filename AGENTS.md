# Farm-in-One Agent Context

## System Goal
Farm-in-One is a hyper-localized, low-cognitive-load, multilingual platform for smallholder farmers. It must make weather, water, finance, pest, soil, mandi, yield, and equipment decisions easier to understand on low-end mobile devices.

## Operating Constraints
- Use a default-deny security model for generated UI and agent-authored payloads.
- All financial actions are read-only registry lookups. The app may compare rates and flag risk, but it must not originate, submit, approve, or mutate loan applications.
- Runtime templates must never use `eval()`, `new Function()`, raw HTML execution, script injection, or arbitrary event-handler strings.
- Declarative UI instructions must be matched against the trusted internal component catalog only.
- Unknown components, unknown props, executable-looking strings, and unsafe keys such as `dangerouslySetInnerHTML`, `script`, `style`, `onClick`, or `href` must be rejected.
- Farmer-facing copy must be localized and plain-language first.
- Offline mode should preserve the app shell and language files; online mode should surface live-capable service workflows when available.
