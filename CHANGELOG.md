# Changelog

## Unreleased - Customer-ready web release (2026-10-25)

### Added
- Public static pages: About, FAQ, Security, Contact, Privacy, Terms, Disclosures, and a new Affordability Guide.
- Shared `StaticPage` layout with canonical URLs, Open Graph/Twitter tags, robots meta, and JSON-LD (Organization, BreadcrumbList, WebPage, FAQPage, Article).
- Conversion CTA banner linking to the planner; cross-links between pages; footer links on the home page.
- Keyword-targeted home page title, description, canonical and Open Graph tags.
- Expanded `public/sitemap.xml` covering all public routes.

### Changed
- README now leads with production scope and the API allowlist; QUICKSTART rewritten with real commands.

### Known follow-ups
- Add a 1200x630 Open Graph image and `og:image` tag.
- CSP blocks Google Fonts; allow `fonts.googleapis.com`/`fonts.gstatic.com` or self-host Inter.
- Legal copy (Privacy, Terms, Disclosures) needs counsel review.
- Confirm `support@mortgagematch.pro` (`SUPPORT_EMAIL` in `components/site/StaticPage.tsx`).
- Verify regulatory figures cited in FAQ/Guide (GDS/TDS limits, down payment tiers).

Earlier history: see [CHANGELOG_v1.4.0-rc1.md](CHANGELOG_v1.4.0-rc1.md).
