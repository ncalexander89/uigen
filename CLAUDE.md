# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly. Only comment complex or non-obvious code.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all Vitest tests
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Force-reset the SQLite database
```

No single-test command is configured — Vitest can be run with a filter: `npx vitest run src/components/chat`.

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. If the key is absent, the app falls back to a `MockLanguageModel` (static multi-step responses, no real AI calls). The mock is useful for frontend development without API access.

## Architecture

**UIGen** is a Next.js 15 (App Router) application that lets users describe React components via chat; Claude generates them in real-time into a virtual file system with live preview.

### Data Flow

```
User chat message
  → POST /api/chat (streaming, Vercel AI SDK streamText)
  → Claude (claude-haiku-4-5) with two tools:
      • str_replace_editor  – create/view/edit files
      • file_manager        – rename/delete files/dirs
  → Tool calls update VirtualFileSystem (in-memory, no disk I/O)
  → FileSystemContext triggers re-render of CodeEditor + PreviewFrame
  → PreviewFrame recompiles JSX via Babel Standalone in an iframe
  → If user is authenticated, project state saved to SQLite (Prisma)
```

### Key Abstractions

**VirtualFileSystem** (`src/lib/file-system.ts`) — pure in-memory tree. All AI file operations go through here. The `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) exposes it to components and provides `handleToolCall()` to dispatch AI tool calls.

**ChatContext** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`. Connects the stream from `/api/chat` to the UI and feeds tool results back into the conversation (supports up to 40 tool steps per generation).

**PreviewFrame** (`src/components/preview/PreviewFrame.tsx`) — renders generated components in an iframe. Uses Babel Standalone to compile JSX on the fly, builds an import map, and shims a simple webpack-style module system so components can import each other via `@/` alias.

**Language model provider** (`src/lib/provider.ts`) — single `getLanguageModel()` call; returns Claude or the mock based on env vars. Change AI model here.

**System prompt** (`src/lib/prompts/generation.tsx`) — instructs Claude to use `/App.jsx` as the entry point, Tailwind CSS for styling, and the `@/` alias for internal imports.

### Auth

JWT stored in an HTTP-only cookie (7-day expiry). Server actions in `src/actions/` handle sign-up/in/out via bcrypt + jose. `src/middleware.ts` guards API routes. Users without accounts can still use the app anonymously (no project persistence).

### Database

SQLite via Prisma. Schema: `User` (email + hashed password) → `Project` (messages JSON, file system JSON). Generated client lives in `src/generated/prisma/`.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and used inside the virtual file system too).

### UI Libraries

- **shadcn/ui** (new-york style) — components live in `src/components/ui/`
- **Radix UI** primitives
- **Monaco Editor** for the code view
- **Tailwind CSS v4**
- **Lucide** icons
