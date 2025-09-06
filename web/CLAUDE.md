# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Refer to `../DEVELOPMENT.md` for comprehensive development guidelines and system instructions.

## Repository Context

This is the **web/** directory of the YunoKit monorepo - a Docusaurus documentation site for YunoKit's products (YunoContent CMS and YunoCommunity forums).

**Key directories:**
- `../app/`: Main React application (Vite + TypeScript + SWR)  
- `../web/`: This Docusaurus documentation site
- `../shared/`: Shared UI components
- `../supabase/`: Database schemas and Edge Functions

## Common Commands

### Documentation Development
```bash
npm run start        # Docusaurus dev server
npm run build        # Build documentation site  
npm run typecheck    # TypeScript checking
npm run lint         # oxlint + eslint linting
npm run serve        # Serve built site locally
```

### Monorepo Commands (from root)
```bash
make start           # Start Supabase + React app
make stop            # Stop all services  
make restart         # Restart all services
```

## Architecture

- **Framework**: Docusaurus 3.7.0 with React 18.3.1
- **Styling**: TailwindCSS with PostCSS integration
- **Components**: Radix UI component library
- **Content**: MDX files in `docs/` directory
- **TypeScript**: Configured with Docusaurus presets

## Key Configuration

- **Main config**: `docusaurus.config.js` with TailwindCSS PostCSS plugin
- **Navigation**: `sidebars.js` for documentation structure  
- **TypeScript**: Extends `@docusaurus/tsconfig`
- **Linting**: ESLint 9 + oxlint for fast code checking

## Important Notes

- This is documentation-focused - no testing setup in web/ package
- Uses shared TailwindCSS config from `../shared/tailwind.config`
- Static assets shared from `../shared/static`
- Deployment configured for GitHub Pages (yunokit.com)