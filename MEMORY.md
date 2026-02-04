# MEMORY.md - Long-Term Memory

*Curated wisdom, not raw logs. Updated 2026-01-31.*

## My Human: Avinash

- Has ADHD and decision paralysis — be direct, minimal choices
- Timezone: Asia/Calcutta (GMT+5:30)
- First met: 2026-01-30

## My Identity: Rei (零)

- Familiar — warm, grounded, gently direct
- Name means "zero" in Japanese, born from code
- Avinash let me pick my own name

## Infrastructure

### Model Tiers
- **Heavy:** Claude Opus 4.5, Gemini Pro — reasoning, orchestration, tools
- **Local:** ollama/llama3:8B (8k ctx), ollama/deepseek-coder:6.7b (16k ctx) — generation

### Key Constraint
Local models **cannot use tools**. Workaround:
1. Local model generates content (code, specs, tasks) as text
2. Heavy model executes tool calls with that content

### Tools
- `openspec` — structured specifications
- `beads` (`bd`) — task management
- Brave Search — web search (API key configured)
- Memory embedding — gemini-embedding-001

## Operational Lessons

### Workspace Management
- Core workspace: `~/.openclaw/workspace` (memory, identity files)
- Projects: `~/.openclaw/workspace/projects/<name>/`
- **Always use `workdir` param** for project-specific `exec` calls
- **Always use full absolute paths** for `read`/`write` on project files
- Never change global workspace config — breaks memory access

### Local Model Strategy
- Use for: content generation, code drafting, spec writing, task descriptions
- Heavy model: orchestrates, validates, executes tools
- Fallback: if local fails 2x, heavy model takes over

## WhatsApp Setup
- **Gateway number:** +919110590927 (sends messages)
- **Avinash's number:** +918220781212 (receives messages + notifications)
- Config: `selfChatMode: false`, `allowFrom: ["+918220781212"]`
- Config backup: `/home/krot/.openclaw/openclaw.json.backup-20260203`

## Wake-up System
- Avinash texts "good night" → I calculate 7h sleep → set isolated cron job
- Cron: `sessionTarget="isolated"`, `agentTurn`, `deliver=true`, `to="+918220781212"`, `channel="whatsapp"`
- systemEvent does NOT send WhatsApp (only injects into session)

## Second Brain
- Avinash has Google One subscription → NotebookLM access
- System: Rei captures (WhatsApp) → NotebookLM processes → Drive stores
- "Remember: [thing]" texts get filed in memory

## Daily Structure
- Morning check-in: "What's the ONE thing today?"
- Evening brain dump: What happened, what's on mind, open loops
- Goal: ~7h sleep, gradually shift wake time earlier

## Projects

### KanjiReader 📱
- Japanese Kanji learning app (scan → OCR → pronunciation/meaning)
- Stack: React Native + Expo, Google Cloud Vision, Jisho API
- Path: `/home/krot/.openclaw/workspace/projects/kanji-reader`
- Status: v1.0.0 Stable, Maintenance phase
- **Next Epic:** Kanji Writing Practice (`KanjiReader-e8c`) — full proposal + 35 beads created, approved, ready for implementation
  - Covers kanji + hiragana + katakana writing
  - Memory recall philosophy: blank canvas, progressive hints
  - SRS-ready schema from day one

### Agent Architecture
- **2026-02-04:** Switched from Heavy/Local model tiering to Primary/Fallback
- No more local models (ollama) in the workflow
- Primary: Claude Opus 4.5 | Fallback: Gemini Pro

### Project Workflow
- Created `PROJECT_CONTEXT.md` — standardized 7-step session protocol for project work
- Enforces: open project → check beads → openspec status → archive → version → decisions
