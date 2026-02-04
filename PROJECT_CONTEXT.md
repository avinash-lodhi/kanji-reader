# Project Context

> **Status:** Maintenance | **Version:** 1.0.0 | **Updated:** 2026-02-04
> **Active Context:** [KanjiReader]
> **Primary Model:** Claude Opus 4.5 | **Fallback:** Gemini Pro

## 🧠 Active Workflow Context

This file serves as the SINGLE SOURCE OF TRUTH for session context and workflow state.

### 1. Implementation Context
- **Project:** KanjiReader (`projects/kanji-reader`)
- **Stack:** React Native, Expo, Zustand, Google Cloud Vision
- **State Source:** `projects/kanji-reader/PROJECT.md` & `projects/kanji-reader/openspec/project.md`

### 2. Workflow Checklist (Session Protocol)
Every session operating on this project MUST follow this sequence:

1.  **[ ] Open Project:**
    *   Set `workdir` to `/home/krot/.openclaw/workspace/projects/kanji-reader`
    *   Verify identity via `PROJECT.md`

2.  **[ ] Check Beads Tasks:**
    *   Run `bd list` (in `workdir`) to see active/pending tasks
    *   Verify `.beads` DB is present

3.  **[ ] OpenSpec Status:**
    *   Check `openspec/specs/` for current implementation details
    *   Check `openspec/changes/` for active proposals
    *   Match against "Active Epic" in `PROJECT.md`

4.  **[ ] OpenSpec Archive:**
    *   Verify completed specs are archived (e.g., `kanjireader_v1_archive.md`)
    *   Ensure no stale changes in `openspec/changes/`

5.  **[ ] Maintain Project Version:**
    *   Check `PROJECT.md` header vs `package.json`
    *   Ensure they match (currently `1.0.0`)

6.  **[ ] Increase Version (Trigger):**
    *   **IF** Epic/Group of Epics complete:
        *   Bump `package.json`
        *   Update `PROJECT.md`
        *   Archive specs → `vX.X_archive.md`
        *   Git tag

7.  **[ ] Project Decisions:**
    *   Log architectural/product decisions in `openspec/project.md` ("Key Decisions")
    *   Consult `docs/decisions/` if present

## 📝 Decision Log (Session Buffer)
*Log new decisions here during the session. Move to `openspec/project.md` or `docs/` before closing.*

- **[2026-02-04] Agent Architecture:** Switched from Heavy/Local tiering to Primary/Fallback model. Local models removed from workflow.

## 📂 Active References
- **Specs:** `projects/kanji-reader/openspec/specs/`
- **Manifest:** `projects/kanji-reader/PROJECT.md`
- **Tasks:** `projects/kanji-reader/.beads/`

---
*Update this file at the start of major context switches.*
