# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## CRITICAL: Always Consult /docs First

Before generating any code, **always check the `/docs` directory** for a relevant documentation file. If a matching doc exists, read it in full before writing any code. This is not optional — it overrides default behavior.

## Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server (requires build first)
```

## Stack

- **Next.js 16.2.1** (App Router) with **React 19.2.4**
- **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- No testing framework configured yet

## Architecture

This is a Next.js App Router project. All routes live under `src/app/` using file-system routing:
- `layout.tsx` — root layout wrapping all pages
- `page.tsx` — route entry point
- `globals.css` — global styles with Tailwind directives

Components are Server Components by default. Add `"use client"` only when browser APIs or React hooks are needed.

## Important: Next.js Version

This project uses **Next.js 16.2.1**, which may have breaking changes from older versions. Always read `node_modules/next/dist/docs/` before writing Next.js-specific code — particularly for routing, data fetching, and rendering patterns.
