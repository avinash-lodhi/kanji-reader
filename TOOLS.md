# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

---

## AI Agent Tools

### AMP (Anthropic Multi-Agent Platform?)
- **Path:** `/home/krot/.amp/bin/amp`
- **Version:** 0.0.1769765269

### Beads (Task Daemon)
- **Binary:** `/home/krot/.local/bin/bd`
- **Version:** 0.47.0
- **Registry:** `~/.beads/registry.json`
- **Note:** Runs per-workspace as a daemon, uses socket + SQLite

### OpenSpec
- **Path:** global npm install
- **Use:** Structured specifications

### Ollama (Local LLMs)
- **Models:**
  - `ollama/llama3:latest` — 8B params, 8k context, general tasks
  - `ollama/deepseek-coder:6.7b` — 6.7B params, 16k context, coding
- **API:** http://127.0.0.1:11434

---

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
