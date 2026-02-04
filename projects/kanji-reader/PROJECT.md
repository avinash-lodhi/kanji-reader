# KanjiReader Manifest
> **Status:** Active Development | **Version:** 1.2.0-dev | **Updated:** 2026-02-05

## 📍 State
- **Phase:** Writing Practice Bug Fixes
- **Active Epic:** `KanjiReader-wpfix` — Writing Practice UX Fixes
- **Branch:** `master` (trunk-based)

## 🧠 Context
- **Summary:** Japanese Kanji learning app — OCR scanning + writing practice.
- **v1.1.0:** Shipped writing practice (learn/practice modes, hints, stroke data pipeline, persistence). Critical touch-crash fixed. Four UX issues remain.
- **v1.2.0 Goal:** Fix all four writing practice UX issues — multi-stroke progression, hint accuracy, learn mode visibility, scroll conflict.
- **Tech Debt:**
  - [ ] UI spacing is choppy (Priority: Low)
  - [ ] Verb segmentation logic is flawed (Priority: Low)
  - [ ] Stale closure patterns in usePracticeSession (Priority: High — fixing in v1.2.0)

## 🔮 Future Self Instructions
- Archive: `kanjireader_v1.1_archive.md` has full retro + known issues.
- OpenSpec proposal: `openspec/changes/writing-practice-ux-fixes/`
- Trust this file and `package.json` for version truth.
- **Testing:** Cannot test on device from server. Always have Avinash verify on real device before closing bugs.
