# Word List Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `输入词表生成` start entry as a strict paste/import flow that saves to `我的词库` and starts a game.

**Architecture:** Put parsing and validation in a small pure module under `web/src/ui/start`, cover it with Vitest, then build a themed React screen that calls the existing `handleAddCustomWordList(entries)` path in `App.tsx`.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, existing inline style helpers.

---

## File Structure

- Create `web/src/ui/start/wordListInputParser.ts`
  - Owns strict line parsing, normalization, validation, duplicate detection, and start eligibility.
- Create `web/src/ui/start/wordListInputParser.test.ts`
  - Covers all import rules.
- Create `web/src/ui/start/WordListInputScreen.tsx`
  - Owns paste UI, preview, invalid line rendering, and the start action.
- Modify `web/src/App.tsx`
  - Replace the placeholder `PendingCreationScreen` for `wordListInput`.

---

### Task 1: Parser

- [x] Add failing parser tests.
- [x] Implement `parseWordListInput(text)` and `canStartFromParse(result)`.
- [x] Run `npm test -- src/ui/start/wordListInputParser.test.ts`.

### Task 2: Screen

- [x] Create `WordListInputScreen.tsx` using existing page styles.
- [x] Render textarea, import summary, valid preview, invalid line list, and disabled/enabled `开始游戏`.
- [x] Call `onConfirm(result.entries)` only when strict validation passes.

### Task 3: App Wiring

- [x] Import `WordListInputScreen` in `App.tsx`.
- [x] Replace `PendingCreationScreen` for `screen === 'wordListInput'`.
- [x] Pass `handleAddCustomWordList` as `onConfirm` and `handleBackToStart` as `onBack`.

### Task 4: Verification

- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Open `http://127.0.0.1:5174/`, enter the second start entry, paste a valid list, start game, and confirm the game screen loads.

## Self-Review

- Strict mode is explicit.
- Auto-save uses the existing custom-list path.
- The parser has no UI dependencies.
- The screen does not introduce a new persistence path.
