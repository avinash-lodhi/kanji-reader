# KanjiReader - AI Agent Instructions

## Project Overview

**KanjiReader** is a mobile app for learning Japanese Kanji through camera scanning and pronunciation.

**Stack:** React Native + Expo, Google Cloud Vision (OCR), Jisho API (Dictionary), Expo Speech (TTS)

**Target:** iOS (primary), Android (secondary), local install only

## Key Documents

| Document | Purpose |
|----------|---------|
| `proposal.md` | Product vision and decisions |
| `openspec/project.md` | Tech stack and conventions |
| `openspec/changes/mvp-kanji-reader/tasks.md` | Implementation tasks |
| `openspec/specs/*.md` | Detailed feature specs |
| `.beads/issues.jsonl` | Beads task tracking |

## Beads Workflow

This project uses **beads** (`bd` CLI) for task tracking.

```bash
# List all tasks
bd list

# Show task tree
bd list --tree

# View task details
bd show <bead-id>

# Start working on a task
bd update <bead-id> --status in_progress

# Complete a task
bd close <bead-id>

# Sync and commit
bd sync
```

**Current Epic:** `kanji-reader-xwj`
**Ready to start:** `kanji-reader-xwj.1.1` (Initialize Expo Project)

## Model Recommendations

Use the right model for the task:

| Task Type | Recommended Model | Why |
|-----------|-------------------|-----|
| Architecture, complex reasoning | Claude Opus / Gemini | Heavy thinking |
| Code generation (React Native) | deepseek-coder | Good at coding |
| Simple utilities, tests | llama3 | Fast, local |
| Documentation, specs | Claude / Gemini | Good writing |
| Quick questions | llama3 | Instant, free |

## How to Use Different Models

### Via OpenClaw (Rei)
```
# Spawn local sub-agent
sessions_spawn with model="ollama/llama3:latest"
sessions_spawn with model="ollama/deepseek-coder:6.7b"
```

### Via Gemini CLI
```bash
gemini "Your prompt here"
```

### Via AMP
```bash
/home/krot/.amp/bin/amp "Your prompt here"
```

## Code Conventions

- **TypeScript** strict mode
- **Functional components** with hooks
- **Zustand** for state management
- **Async/await** over promises
- Small, focused functions
- Descriptive variable names

## File Structure
```
src/
├── components/     # Reusable UI
├── screens/        # Screen components
├── services/       # API/business logic
├── hooks/          # Custom hooks
├── utils/          # Helpers
├── types/          # TypeScript types
├── constants/      # App config
└── store/          # Zustand stores
```

## Before Making Changes

1. Check `bd list` for relevant tasks
2. Read the task description (`bd show <id>`)
3. Review related specs in `openspec/specs/`
4. Update task status when starting (`bd update <id> --status in_progress`)

## After Making Changes

1. Run linter/tests if applicable
2. Close completed tasks (`bd close <id>`)
3. Sync beads (`bd sync`)
4. Commit with bead ID: `git commit -m "Description (kanji-reader-xxx)"`
5. Push: `git push`

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
