# Production launch gates

This file is the evidence log for work that cannot be completed safely by a
source-code change. Do not mark a gate complete without the named evidence and
an accountable owner.

## Required before public launch

| Gate | Owner | Evidence required | Status |
|---|---|---|---|
| Secret rotation and historical exposure review | Security owner | Rotation record; GitHub secret-scanning alerts reviewed; history decision recorded | Open |
| GitHub branch protection | Repository administrator | `main` requires the Production quality gate and Dependency Review | Open |
| Vercel production configuration | Platform owner | Domain/HTTPS verification; production environment variables set; deploy smoke-test URL | Open |
| Supabase activation | Data owner | Migration output; RLS smoke-test output; backup owner and restore evidence | Open |
| Rate-data provenance | Product owner | Executed provider agreement; source, region, timestamp, freshness SLA, and fallback policy | Open |
| Calculation review | Licensed Canadian mortgage professional | Signed review of assumptions, disclosures, and permitted user-facing language | Open |
| Legal and privacy approval | Legal owner | Approved Privacy, Terms, Disclosures, consent text, retention schedule, and DPA decisions | Open |
| Payments activation | Finance/platform owner | Stripe live-mode verification, webhook delivery test, support/refund process | Open |
| Open-banking activation | Privacy/platform owner | Provider agreement, registered redirect/webhook URLs, consent version, encrypted-token key rotation procedure | Open |
| Observability and incident response | Operations owner | Synthetic monitor, alert route, named on-call owner, and completed incident drill | Open |
| Accessibility sign-off | QA/design owner | Keyboard, screen-reader, zoom, contrast, and reduced-motion test results | Open |

## Code-enforced safeguards

- Production APIs are allowlisted in `proxy.page.ts`; other API routes fail closed.
- `DOCS/api/production-openapi.yaml` is checked against that allowlist by
  `npm run api:verify`.
- Payment and open-banking endpoints require authenticated users and return a
  safe unavailable response until their provider and storage settings exist.
- The calculator is deterministic and displays planning warnings; it is not an
  underwriting, approval, or rate-offer system.

## Current regulatory references

- [OSFI minimum qualifying rate](https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages): greater of contract rate plus 2% or 5.25%; review annually.
- [FCAC minimum down payment guidance](https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html): tiered 5%/10%/20% down-payment model and default-insurance guidance.

These references support a planning model only. The licensed-professional and
legal approval gates above remain mandatory before launch.
