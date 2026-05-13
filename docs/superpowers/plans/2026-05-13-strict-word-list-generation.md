# Strict Word List Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "input word list" entry use strict generation while leaving user-designed/manual custom lists non-strict.

**Architecture:** Add a focused generation helper that reports placed and missing words. `GameViewModel` will use it for custom word generation, and `WordListInputScreen` will show strict failure details instead of saving an unusable list.

**Tech Stack:** React, TypeScript, Vitest, existing `CrosswordGenerator`.

---

### Task 1: Add Generation Result Helper

**Files:**
- Create: `web/src/ui/game/customWordGeneration.ts`
- Create: `web/src/ui/game/customWordGeneration.test.ts`
- Modify: `web/src/ui/game/GameViewModel.ts`
- Modify: `web/src/ui/game/GameViewModel.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests proving that strict mode rejects disconnected entries and non-strict mode accepts the best partial puzzle:

```ts
const disconnected = [
  { word: 'CAT', clue: 'animal' },
  { word: 'DOG', clue: 'animal' },
];

expect(generateCustomWordPuzzle(disconnected, 13, 13, { requireAllWords: true }).ok).toBe(false);
expect(generateCustomWordPuzzle(disconnected, 13, 13, { requireAllWords: false }).ok).toBe(true);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/ui/game/customWordGeneration.test.ts`

- [ ] **Step 3: Implement the helper**

Build `generateCustomWordPuzzle(entries, rows, cols, options)` around `CrosswordGenerator`, returning `ok`, `crossword`, `placedEntries`, `missingEntries`, `placedCount`, and `totalCount`.

- [ ] **Step 4: Update `GameViewModel`**

Replace local custom-word conversion with the helper. Default `setCustomWords` to non-strict so existing custom/manual flows keep working, and allow callers to pass `{ requireAllWords: true }`.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/ui/game/customWordGeneration.test.ts src/ui/game/GameViewModel.test.ts`

### Task 2: Wire Strict Mode Into Entry 2

**Files:**
- Modify: `web/src/App.tsx`
- Modify: `web/src/ui/start/WordListInputScreen.tsx`

- [ ] **Step 1: Update the confirm contract**

Let `WordListInputScreen` call `onConfirm(entries, { requireAllWords: true })` and receive either success or a disconnected-word failure.

- [ ] **Step 2: Show failure details**

When strict generation fails, show the placed count, missing words, and buttons for continuing editing or generating with the connectable subset.

- [ ] **Step 3: Keep user-designed lists non-strict**

Ensure `WordListScreen` selection and manual editor playback continue calling custom generation without strict mode.

- [ ] **Step 4: Verify**

Run: `npm test`, `npm run build`, and browser-test disconnected and connected input lists.
