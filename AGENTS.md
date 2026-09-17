# AGENTS.md

## Repository Guidelines

This repository is part of the [Hardonian](https://github.com/Hardonian) organization.

### Architecture
- See individual component READMEs for architecture details
- Follow existing patterns when adding new code

### Build & Test
- Check `package.json` for available scripts
- Run linting and type checks before pushing
- All PRs require passing CI

### Security
- Never commit secrets, API keys, or credentials
- Report security issues per SECURITY.md
- Dependencies are monitored via Dependabot

### Deployment
- Production deploys via Vercel (auto-deploy on main push)
- Preview deploys on PRs
- See vercel.json for build configuration

