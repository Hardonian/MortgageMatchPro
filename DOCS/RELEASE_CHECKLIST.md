# Release Checklist

## Content and legal
- [ ] Legal review of Privacy, Terms, Disclosures
- [ ] Support email confirmed and mailbox monitored
- [ ] FAQ/Guide regulatory figures verified and dated
- [ ] `updated` dates and sitemap `lastmod` current

## SEO / CRO
- [ ] OG share image added (1200x630) with `og:image`
- [ ] Sitemap submitted in Google Search Console; `robots.txt` references it
- [ ] Rich Results Test passes for `/faq` and `/guide`
- [ ] Analytics/consent approach decided before adding tracking (update Privacy Policy accordingly)

## Technical
- [ ] `npm run lint`, `npm run type-check`, `npm test` pass
- [ ] `npm run build` lists all public pages as static, no errors
- [ ] CSP allows required fonts (or font self-hosted)
- [ ] Production env vars set in Vercel; no secrets in repo (`.env` files are not committed)
- [ ] Only allowlisted APIs respond in production ([proxy.ts](../proxy.ts)); others 404
- [ ] Lighthouse: performance, accessibility, SEO >= 90 on `/`, `/guide`, `/faq`
- [ ] Custom domain and HTTPS verified on Vercel

## Post-release
- [ ] Smoke test every route and footer link on production
- [ ] Monitor `/api/health`; review Vercel logs after 24h
