# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FuckNotion is an enhanced version of the open-source Notion-style WYSIWYG editor with AI-powered autocompletions. It features OpenRouter integration for multiple AI models with automatic fallback, runtime API configuration, and enhanced AI capabilities. Built as a monorepo with Next.js, TypeScript, and Tiptap (based on ProseMirror).

## Architecture

The project uses a monorepo structure managed by Turborepo:
- `apps/web/` - Next.js 15 demo application showcasing the editor
- `apps/desktop/` - Tauri desktop application wrapper (wraps the web app)
- `packages/headless/` - Core editor package (published as "novel" on npm)
- `packages/tsconfig/` - Shared TypeScript configurations

The core editor (`packages/headless`) is framework-agnostic and can be integrated into any React application. The desktop app uses Tauri to wrap the web application with native OS integration.

### Key Architectural Decisions
- **Monorepo with Turborepo**: Enables efficient builds with dependency tracking
- **Framework-agnostic core**: The headless package can be used in any React app
- **AI-first design**: Multiple model support with automatic fallback
- **Runtime configuration**: API keys configurable via UI, not hardcoded

## Essential Commands

```bash
# Development
pnpm dev          # Start all packages in development mode
pnpm dev:web      # Start only web app and core package (faster for web-only development)
pnpm build        # Build all packages

# Code Quality (run these before committing!)
pnpm lint         # Run Biome linter
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Check code formatting
pnpm format:fix   # Auto-fix formatting issues
pnpm typecheck    # Run TypeScript type checking

# Publishing
pnpm changeset    # Create a changeset for version updates
pnpm version:packages  # Version packages with changesets (runs build first)
pnpm publish:packages  # Publish to npm

# Desktop App
cd apps/desktop && pnpm dev   # Run Tauri desktop app in development
cd apps/desktop && pnpm build # Build desktop app for distribution

# Cleanup
pnpm clean        # Clean all build artifacts

# Git Hooks
pnpm prepare      # Install Husky hooks (runs automatically after install)
```

## Development Workflow

1. **Before making changes**: Run `pnpm dev` (all packages) or `pnpm dev:web` (web only) to start the development server
2. **After making changes**: Always run `pnpm lint:fix`, `pnpm format:fix`, and `pnpm typecheck`
3. **For commits**: Use conventional commit format (see Commit Standards below)
4. **Before pushing**: Ensure all code quality checks pass

### Desktop App Development
- The desktop app requires the web app to be built first: `pnpm build` then `cd apps/desktop && pnpm dev`
- Tauri uses Rust, so ensure Rust toolchain is installed for desktop app development
- Desktop app build outputs are in `apps/desktop/src-tauri/target/`

## Key Technologies

- **Package Manager**: pnpm 9.5.0
- **Build System**: Turborepo, tsup
- **Frontend**: Next.js 15, React 18, TypeScript 5.x
- **Editor Core**: Tiptap v2 (ProseMirror-based)
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Jotai for editor state
- **AI Integration**: OpenRouter API with multi-model support (Claude 3.5 Sonnet, GPT-4o Mini, Llama 3.2 3B)
- **Runtime**: Vercel Edge Functions for AI endpoints
- **Desktop**: Tauri v2 for cross-platform desktop apps
- **Code Quality**: Biome (replaces ESLint + Prettier)

## Editor Extensions

The editor uses Tiptap extensions located in `packages/headless/src/extensions/`:
- `slash-command.tsx` - Custom slash commands menu
- `auto-complete.ts` - AI completion plugin (triggered by `++`)
- `updated-image.ts` & `image-resizer.tsx` - Image upload with drag & resize
- `ai-highlight.ts` - AI text highlighting
- `custom-keymap.ts` - Custom keyboard shortcuts
- `mathematics.ts` - Mathematical expressions (KaTeX)
- `twitter.tsx` - Twitter embed support

## API Architecture

### AI Endpoints (`apps/web/app/api/`)
- `/api/generate` - Main AI completion endpoint with multi-model fallback
- `/api/test-api-key` - Validates API configuration
- `/api/upload` - File upload endpoint (images, documents)
- `/api/debug-env` - Environment debugging (development only)

### Model Fallback Logic
The system automatically falls back through models if one fails:
1. Primary: `anthropic/claude-3.5-sonnet`
2. Secondary: `openai/gpt-4o-mini`
3. Tertiary: `meta-llama/llama-3.2-3b-instruct:free`

## Environment Variables

The app supports both environment-based and runtime API configuration:

**For AI features** (Optional - can be configured via web interface):
- `OPENAI_API_KEY` - OpenRouter or OpenAI API key
- `OPENAI_BASE_URL` - API base URL (defaults to https://openrouter.ai/api/v1)
- `OPENAI_MODEL` - Default model (defaults to anthropic/claude-3.5-sonnet)

**For additional features**:
- `BLOB_READ_WRITE_TOKEN` - For Vercel Blob storage (image uploads)
- `KV_REST_API_URL` - For Vercel KV (rate limiting)
- `KV_REST_API_TOKEN` - For Vercel KV authentication

## Code Style Guidelines

- Use Biome for all linting and formatting (no ESLint/Prettier)
- Follow existing patterns in the codebase
- Components use `.tsx` extension, utilities use `.ts`
- Tailwind classes for styling (no CSS modules)
- Prefer composition over inheritance
- Use TypeScript strict mode
- Line width: 120 characters
- Indentation: 2 spaces
- Line ending: LF (Unix-style)
- Format with errors: disabled (must fix errors before formatting)

### Biome Configuration Details
- Organize imports: enabled
- Lint rules: recommended with specific overrides
  - `noForEach`: off
  - `noUselessFragments`: off
  - `useExhaustiveDependencies`: off (for React hooks)
  - `noUnusedImports`: warn
  - `noUnusedVariables`: warn
  - `noParameterAssign`: off

### VSCode Settings
The project includes VSCode configuration for optimal development:
- Biome as default formatter
- Format on save enabled
- TypeScript workspace version preferred
- Tailwind CSS class regex patterns configured for `cva()` and `cx()` functions

## Testing

Currently, the project does not have a test suite. When implementing features, ensure manual testing in the demo app.

## Package Structure

The headless package exports:
- Core editor components (`EditorRoot`, `EditorContent`, `EditorBubble`, etc.)
- All Tiptap extensions
- Utility functions and hooks
- TypeScript types

When modifying the headless package, ensure changes are backward compatible as it's published to npm.

## AI Configuration

This project supports flexible AI configuration:

**Runtime Configuration** (Recommended):
- Access via `/settings` page in the web app
- Configure API keys, models, and providers without redeployment
- Supports OpenRouter and OpenAI providers
- Settings stored locally in browser for security

**Key AI Features**:
- Continue writing (natural text extension)
- Improve writing (style and clarity enhancement)
- Fix grammar and spelling
- Make text shorter/longer
- Custom natural language commands
- Automatic model fallback for reliability

## Important Files and Patterns

### State Management
- Editor state uses Jotai atoms (see `apps/web/lib/atoms.ts`)
- Settings stored in localStorage via custom hooks

### Component Patterns
- Use composition with Radix UI primitives
- Implement accessible components by default
- Follow the existing component structure in `apps/web/components/`

### API Route Patterns
- Use Vercel Edge Runtime for AI endpoints
- Implement proper error handling and fallbacks
- Stream responses for better UX

## Commit Standards

The project uses commitlint with Husky for automated commit message validation. Valid types:
- `feat:` - New features
- `fix:` - Bug fixes
- `doc:` - Documentation changes (note: "doc" not "docs")
- `style:` - Code style changes (formatting, etc.)
- `ref:` - Code refactoring (note: "ref" not "refactor")
- `perf:` - Performance improvements
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `clean:` - Cleanup tasks
- `revert:` - Revert previous commits

**Important**: Commits are automatically validated by Husky pre-commit hooks.

## Build Pipeline

The project uses Turborepo for efficient monorepo builds with the following task dependencies:
- `build`: Depends on upstream builds and typecheck
- `typecheck`: Depends on upstream topology
- `lint` & `format`: Run after dependency resolution
- `dev`: Runs without cache in persistent mode
- `desktop#build`: Requires web app build and export first
- `desktop#dev`: Runs without cache

### Publishing Configuration
- Changesets are configured to use GitHub changelog format
- Base branch: `main`
- Access: public packages
- Ignored packages: `novel-next-app` (the demo app)
- Repository: `steven-tey/novel` (upstream reference)