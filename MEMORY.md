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
- Projects: `~/.openclaw/workspace/project/<name>/`
- **Always use `workdir` param** for project-specific `exec` calls
- **Always use full absolute paths** for `read`/`write` on project files
- Never change global workspace config — breaks memory access

### Local Model Strategy
- Use for: content generation, code drafting, spec writing, task descriptions
- Heavy model: orchestrates, validates, executes tools
- Fallback: if local fails 2x, heavy model takes over

## Projects

### KanjiReader 📱
- Japanese Kanji learning app (scan → OCR → pronunciation/meaning)
- Stack: React Native + Expo, Google Cloud Vision, Jisho API
- Path: `/home/krot/.openclaw/workspace/projects/kanji-reader`
- Status: Phase 1 complete, Phase 2 (Camera) ready
