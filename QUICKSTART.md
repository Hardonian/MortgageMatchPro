# Quickstart

## Prerequisites
- Node.js 20+ and npm
- Copy `.env.example` to `.env.local` and fill in values (never commit secrets)

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
```

## Verify before pushing
```bash
npm run lint
npm run type-check
npm test
npm run build        # must list all pages as static (o) with no errors
```

## Deploy
Pushes to `main` auto-deploy on Vercel; PRs get previews. See [DOCS/RELEASE_CHECKLIST.md](DOCS/RELEASE_CHECKLIST.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
