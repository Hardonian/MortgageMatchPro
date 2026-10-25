# MortgageMatch Pro — delivery roadmap

This roadmap reflects the actual deployable product: the mobile-first Next.js client surface under `*.page.*`. Legacy React Native, backend, and API files are retained for migration only and are not production routes. Priorities are ordered by user safety, correctness, and launch value.

Status legend: **Done** is implemented in this repository; **External gate** needs an account owner, legal owner, regulated partner, or production credential; **Planned** is intentionally not represented as shipped functionality.

| # | Priority | Item | Status |
|---:|:---:|---|---|
| 1 | P0 | Keep a single canonical production project and environment. | **Done** |
| 2 | P0 | Expose only reviewed API routes in production. | **Done** |
| 3 | P0 | Remove server secrets from browser configuration. | **Done** |
| 4 | P0 | Keep local credential files out of version control. | **Done** |
| 5 | P0 | Rotate every credential that was historically committed and purge remote history if required. | **External gate** |
| 6 | P0 | Use deterministic calculations, never an LLM, for affordability outputs. | **Done** |
| 7 | P0 | Label all figures as planning estimates, not credit decisions or offers. | **Done** |
| 8 | P0 | Keep payments and open banking unavailable until provider-backed integrations pass review. | **Done** |
| 9 | P0 | Protect API-key generation with verified identity and organization roles. | **Done** |
| 10 | P0 | Replace retired GraphQL routing with no public rewrite. | **Done** |
| 11 | P0 | Maintain health and readiness endpoints that disclose no infrastructure details. | **Done** |
| 12 | P0 | Gate all changes with tracked-source secret scanning. | **Done** |
| 13 | P0 | Enable GitHub secret scanning and push protection; review historical alerts. | **External gate** |
| 14 | P0 | Configure Vercel production environment variables and domain ownership. | **External gate** |
| 15 | P0 | Add a reviewed production Supabase schema, RLS policies, and migration baseline. | **External gate** |
| 16 | P1 | Run type, lint, unit, build, bundle, and mobile E2E checks on every PR. | **Done** |
| 17 | P1 | Install a Playwright browser explicitly in CI before running E2E tests. | **Done** |
| 18 | P1 | Stop automatic workflows that require unset external credentials. | **Done** |
| 19 | P1 | Re-enable each manual operational workflow only with an owner, runbook, and passing dry run. | **External gate** |
| 20 | P1 | Keep a small, production-aware bundle report with enforced budgets. | **Done** |
| 21 | P1 | Keep smoke checks aligned to live home, liveness, and readiness routes. | **Done** |
| 22 | P1 | Add synthetic uptime monitoring and alert routing for the canonical domain. | **External gate** |
| 23 | P1 | Create an incident owner, on-call policy, and severity communication templates. | **External gate** |
| 24 | P1 | Add error tracking with PII redaction before client telemetry is enabled. | **External gate** |
| 25 | P1 | Add product analytics only after consent, retention, and data-processing decisions. | **External gate** |
| 26 | P1 | Preserve the mobile-first plan, compare, saved, and profile navigation model. | **Done** |
| 27 | P1 | Make header navigation functional and keyboard-accessible. | **Done** |
| 28 | P1 | Persist a saved planning scenario locally without transmitting it. | **Done** |
| 29 | P1 | Add sign-in and cross-device scenario sync backed by reviewed auth and consent. | **Planned** |
| 30 | P1 | Add account recovery, session management, and data deletion controls. | **Planned** |
| 31 | P1 | Complete keyboard, screen-reader, reduced-motion, and contrast accessibility testing. | **Planned** |
| 32 | P1 | Add a human-verified rate source with freshness timestamp, region, and disclosure. | **External gate** |
| 33 | P1 | Support fees, condo costs, insurance, and province-specific tax assumptions. | **Planned** |
| 34 | P1 | Validate calculator assumptions with a licensed Canadian mortgage professional. | **External gate** |
| 35 | P1 | Add transparent amortization and cash-to-close breakdowns. | **Planned** |
| 36 | P1 | Add comparison sharing/export only after privacy review. | **Planned** |
| 37 | P1 | Publish privacy, terms, accessibility, and calculation-methodology pages approved by counsel. | **External gate** |
| 38 | P1 | Define broker referral, lead consent, and anti-steering rules before any matching flow. | **External gate** |
| 39 | P1 | Perform threat modeling for auth, stored scenarios, provider webhooks, and data exports. | **Planned** |
| 40 | P2 | Replace duplicate legacy domain language and stale product claims across docs. | **Planned** |
| 41 | P2 | Archive or split the unshipped React Native and legacy backend work into explicit packages. | **Planned** |
| 42 | P2 | Establish a single source of truth for API schemas and generate client contracts. | **Planned** |
| 43 | P2 | Remove unused dependencies after a dependency-by-dependency compatibility audit. | **Planned** |
| 44 | P2 | Add visual-regression checks for mobile breakpoints and dark-mode policy. | **Planned** |
| 45 | P2 | Add localization architecture and Canadian English/French content review. | **Planned** |
| 46 | P2 | Add feature flags with audited ownership, defaults, and expiry dates. | **Planned** |
| 47 | P2 | Define data retention, backup, restore, and deletion evidence requirements. | **External gate** |
| 48 | P2 | Establish release notes, changelog discipline, and a rollback runbook. | **Planned** |
| 49 | P2 | Establish a performance budget for LCP, INP, CLS, API latency, and availability. | **Planned** |
| 50 | P2 | Run a launch-readiness review spanning security, legal, operations, accessibility, and lender-data provenance. | **External gate** |

## Completion boundary

All items marked **Done** were implemented in the current codebase and are verified by the local quality suite. Items marked **External gate** cannot responsibly be fabricated in source code: they require credentials, legal sign-off, production data contracts, or an accountable operational owner. **Planned** items have deliberately not been presented as live product capabilities.
