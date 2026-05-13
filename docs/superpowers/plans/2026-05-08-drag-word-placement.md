# Drag Word Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the “指定词和位置” editor so users create words or idioms first, then drag them into an initially black grid.

**Architecture:** Move grid construction and placement validation into a pure logic module, then make `GridEditorScreen` a stateful UI around `entries`, `placements`, and drag state. The playable grid remains compatible with `loadCustomPuzzle(grid, words)` by converting the draft model at the final “开始游戏” step.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, browser HTML5 drag-and-drop, existing inline style/theme token pattern.

---

## File Structure

- Create `web/src/ui/game/gridDraftLogic.ts`
  - Owns draft editor types, character handling, grid derivation, placement validation, placement updates, deletion, and conversion to the existing play payload.
- Create `web/src/ui/game/gridDraftLogic.test.ts`
  - Covers the draft rules before UI changes.
- Modify `web/src/ui/game/GridEditorScreen.tsx`
  - Replace direct cell typing with word entry creation, two-column layout, drag-and-drop placement, move, remove-to-pool, and start-game conversion.
- No changes needed in `web/src/App.tsx`
  - Existing `onPlay(grid, words)` contract remains intact.
- No changes needed in `web/src/ui/game/GameViewModel.ts`
  - `loadCustomPuzzle` already accepts the grid and placed word list we will emit.

---

### Task 1: Add Draft Logic Test Coverage

**Files:**
- Create: `web/src/ui/game/gridDraftLogic.test.ts`
- Create later: `web/src/ui/game/gridDraftLogic.ts`

- [x] **Step 1: Write the failing tests**

Create `web/src/ui/game/gridDraftLogic.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  deleteEntry,
  deriveGrid,
  DraftEntry,
  DraftPlacement,
  placeEntry,
  removePlacement,
  toPlayablePuzzle,
  validatePlacement,
} from './gridDraftLogic';

const entries: DraftEntry[] = [
  { id: 'python', word: 'python', clue: 'language' },
  { id: 'honor', word: 'honor', clue: '' },
  { id: '画蛇添足', word: '画蛇添足', clue: '' },
];

describe('gridDraftLogic', () => {
  it('starts with an all-black draft grid', () => {
    const grid = deriveGrid([], [], 2, 3);

    expect(grid).toHaveLength(2);
    expect(grid[0]).toHaveLength(3);
    expect(grid.flat().every(cell => cell.isBlack)).toBe(true);
    expect(grid.flat().every(cell => cell.letter === '')).toBe(true);
  });

  it('opens cells for a valid horizontal placement', () => {
    const placements: DraftPlacement[] = [
      { entryId: 'python', row: 1, col: 1, direction: 'across' },
    ];

    const grid = deriveGrid(entries, placements, 5, 8);

    expect(grid[1][1].isBlack).toBe(false);
    expect(grid[1][1].letter).toBe('P');
    expect(grid[1][6].letter).toBe('N');
    expect(grid[0][0].isBlack).toBe(true);
  });

  it('allows matching intersections and rejects mismatched intersections', () => {
    const base: DraftPlacement[] = [
      { entryId: 'python', row: 1, col: 1, direction: 'across' },
    ];

    const valid = validatePlacement(
      entries,
      base,
      { entryId: 'honor', row: 1, col: 4, direction: 'down' },
      8,
      8,
    );
    const invalid = validatePlacement(
      entries,
      base,
      { entryId: 'honor', row: 1, col: 1, direction: 'down' },
      8,
      8,
    );

    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
    expect(invalid.reason).toBe('第 1 个字和已有字母不一致');
  });

  it('rejects out-of-bounds placements', () => {
    const result = validatePlacement(
      entries,
      [],
      { entryId: 'python', row: 0, col: 4, direction: 'across' },
      5,
      8,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('这个词会超出网格范围');
  });

  it('moves an existing placement by ignoring its previous position', () => {
    const base: DraftPlacement[] = [
      { entryId: 'python', row: 1, col: 1, direction: 'across' },
    ];

    const result = placeEntry(
      entries,
      base,
      { entryId: 'python', row: 2, col: 1, direction: 'across' },
      5,
      8,
      { ignoreEntryId: 'python' },
    );

    expect(result.validation.valid).toBe(true);
    expect(result.placements).toEqual([
      { entryId: 'python', row: 2, col: 1, direction: 'across' },
    ]);
  });

  it('removing a placement keeps other crossing letters', () => {
    const placed = placeEntry(
      entries,
      [{ entryId: 'python', row: 1, col: 1, direction: 'across' }],
      { entryId: 'honor', row: 1, col: 4, direction: 'down' },
      8,
      8,
    ).placements;

    const remaining = removePlacement(placed, 'python');
    const grid = deriveGrid(entries, remaining, 8, 8);

    expect(grid[1][4].letter).toBe('H');
    expect(grid[1][1].isBlack).toBe(true);
  });

  it('deleting an entry also removes its placement', () => {
    const result = deleteEntry(
      entries,
      [
        { entryId: 'python', row: 1, col: 1, direction: 'across' },
        { entryId: 'honor', row: 1, col: 4, direction: 'down' },
      ],
      'python',
    );

    expect(result.entries.map(entry => entry.id)).toEqual(['honor', '画蛇添足']);
    expect(result.placements).toEqual([
      { entryId: 'honor', row: 1, col: 4, direction: 'down' },
    ]);
  });

  it('handles Chinese idiom length by character', () => {
    const grid = deriveGrid(
      entries,
      [{ entryId: '画蛇添足', row: 0, col: 0, direction: 'across' }],
      4,
      4,
    );

    expect(grid[0].map(cell => cell.letter)).toEqual(['画', '蛇', '添', '足']);
  });

  it('converts draft state to the existing play payload', () => {
    const result = toPlayablePuzzle(
      entries,
      [{ entryId: 'python', row: 1, col: 1, direction: 'across' }],
      4,
      8,
    );

    expect(result.grid[1][1]).toEqual({ isBlack: false, letter: 'P' });
    expect(result.grid[0][0]).toEqual({ isBlack: true, letter: '' });
    expect(result.words).toEqual([
      { word: 'PYTHON', clue: 'language', row: 1, col: 1, direction: 'across' },
    ]);
  });
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run:

```powershell
npx vitest run src/ui/game/gridDraftLogic.test.ts
```

Expected: FAIL because `./gridDraftLogic` does not exist.

---

### Task 2: Implement Draft Grid Logic

**Files:**
- Create: `web/src/ui/game/gridDraftLogic.ts`
- Test: `web/src/ui/game/gridDraftLogic.test.ts`

- [x] **Step 1: Add the implementation**

Create `web/src/ui/game/gridDraftLogic.ts`:

```ts
import { getWordChars } from '../../data/model/WordEntry';

export type DraftDirection = 'across' | 'down';

export interface DraftEntry {
  id: string;
  word: string;
  clue: string;
}

export interface DraftPlacement {
  entryId: string;
  row: number;
  col: number;
  direction: DraftDirection;
}

export interface DraftCell {
  isBlack: boolean;
  letter: string;
  entryIds: string[];
}

export interface PreviewCell {
  row: number;
  col: number;
  letter: string;
}

export interface ValidationResult {
  valid: boolean;
  reason: string | null;
  previewCells: PreviewCell[];
}

export interface PlaceOptions {
  ignoreEntryId?: string;
}

export interface PlaceResult {
  placements: DraftPlacement[];
  validation: ValidationResult;
}

export interface PlayablePuzzle {
  grid: { isBlack: boolean; letter: string }[][];
  words: { word: string; clue: string; row: number; col: number; direction: DraftDirection }[];
}

function hasHan(text: string): boolean {
  return /[\u4e00-\u9fff]/u.test(text);
}

export function normalizeEntryWord(word: string): string {
  const trimmed = word.trim();
  return hasHan(trimmed) ? trimmed : trimmed.toUpperCase();
}

export function getEntryChars(entry: DraftEntry): string[] {
  return getWordChars(normalizeEntryWord(entry.word));
}

function findEntry(entries: DraftEntry[], entryId: string): DraftEntry | undefined {
  return entries.find(entry => entry.id === entryId);
}

function createBlackGrid(rows: number, cols: number): DraftCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isBlack: true,
      letter: '',
      entryIds: [],
    })),
  );
}

function getPlacementCells(entry: DraftEntry, placement: DraftPlacement): PreviewCell[] {
  return getEntryChars(entry).map((letter, index) => ({
    row: placement.direction === 'down' ? placement.row + index : placement.row,
    col: placement.direction === 'across' ? placement.col + index : placement.col,
    letter,
  }));
}

export function deriveGrid(
  entries: DraftEntry[],
  placements: DraftPlacement[],
  rows: number,
  cols: number,
): DraftCell[][] {
  const grid = createBlackGrid(rows, cols);

  for (const placement of placements) {
    const entry = findEntry(entries, placement.entryId);
    if (!entry) continue;

    for (const cell of getPlacementCells(entry, placement)) {
      if (cell.row < 0 || cell.row >= rows || cell.col < 0 || cell.col >= cols) {
        continue;
      }

      grid[cell.row][cell.col] = {
        isBlack: false,
        letter: cell.letter,
        entryIds: [...grid[cell.row][cell.col].entryIds, placement.entryId],
      };
    }
  }

  return grid;
}

export function validatePlacement(
  entries: DraftEntry[],
  placements: DraftPlacement[],
  candidate: DraftPlacement,
  rows: number,
  cols: number,
  options: PlaceOptions = {},
): ValidationResult {
  const entry = findEntry(entries, candidate.entryId);
  if (!entry || normalizeEntryWord(entry.word).length === 0) {
    return { valid: false, reason: '请先添加有效词条', previewCells: [] };
  }

  const comparisonPlacements = placements.filter(
    placement => placement.entryId !== options.ignoreEntryId,
  );

  if (comparisonPlacements.some(placement => placement.entryId === candidate.entryId)) {
    return { valid: false, reason: '这个词已经放入网格', previewCells: [] };
  }

  const previewCells = getPlacementCells(entry, candidate);

  if (previewCells.some(cell => cell.row < 0 || cell.row >= rows || cell.col < 0 || cell.col >= cols)) {
    return { valid: false, reason: '这个词会超出网格范围', previewCells };
  }

  const grid = deriveGrid(entries, comparisonPlacements, rows, cols);
  for (let index = 0; index < previewCells.length; index += 1) {
    const cell = previewCells[index];
    const existing = grid[cell.row][cell.col];
    if (!existing.isBlack && existing.letter !== cell.letter) {
      return { valid: false, reason: `第 ${index + 1} 个字和已有字母不一致`, previewCells };
    }
  }

  return { valid: true, reason: null, previewCells };
}

export function placeEntry(
  entries: DraftEntry[],
  placements: DraftPlacement[],
  candidate: DraftPlacement,
  rows: number,
  cols: number,
  options: PlaceOptions = {},
): PlaceResult {
  const validation = validatePlacement(entries, placements, candidate, rows, cols, options);
  if (!validation.valid) {
    return { placements, validation };
  }

  return {
    placements: [
      ...placements.filter(placement => placement.entryId !== candidate.entryId),
      candidate,
    ],
    validation,
  };
}

export function removePlacement(
  placements: DraftPlacement[],
  entryId: string,
): DraftPlacement[] {
  return placements.filter(placement => placement.entryId !== entryId);
}

export function deleteEntry(
  entries: DraftEntry[],
  placements: DraftPlacement[],
  entryId: string,
): { entries: DraftEntry[]; placements: DraftPlacement[] } {
  return {
    entries: entries.filter(entry => entry.id !== entryId),
    placements: removePlacement(placements, entryId),
  };
}

export function toPlayablePuzzle(
  entries: DraftEntry[],
  placements: DraftPlacement[],
  rows: number,
  cols: number,
): PlayablePuzzle {
  const draftGrid = deriveGrid(entries, placements, rows, cols);
  const entryById = new Map(entries.map(entry => [entry.id, entry]));

  return {
    grid: draftGrid.map(row =>
      row.map(cell => ({
        isBlack: cell.isBlack,
        letter: cell.letter,
      })),
    ),
    words: placements.flatMap(placement => {
      const entry = entryById.get(placement.entryId);
      if (!entry) return [];

      return [{
        word: normalizeEntryWord(entry.word),
        clue: entry.clue.trim(),
        row: placement.row,
        col: placement.col,
        direction: placement.direction,
      }];
    }),
  };
}
```

- [x] **Step 2: Run the draft logic tests**

Run:

```powershell
npx vitest run src/ui/game/gridDraftLogic.test.ts
```

Expected: PASS with 9 tests.

- [x] **Step 3: Run all tests**

Run:

```powershell
npm test
```

Expected: PASS for all test files.

- [ ] **Step 4: Commit this isolated logic layer if the user wants commits**

Run only if commits are requested:

```powershell
git add web/src/ui/game/gridDraftLogic.ts web/src/ui/game/gridDraftLogic.test.ts
git commit -m "feat: add draft grid placement logic"
```

---

### Task 3: Replace Editor State With Entry and Placement State

**Files:**
- Modify: `web/src/ui/game/GridEditorScreen.tsx`
- Use: `web/src/ui/game/gridDraftLogic.ts`

- [x] **Step 1: Replace the old editor state**

In `GridEditorScreen.tsx`, replace the old `WordData`, mutable `grid`, `currentEdit`, `inputWord`, `inputClue`, `savedGrid`, and cursor state with:

```ts
import {
  deleteEntry,
  deriveGrid,
  DraftDirection,
  DraftEntry,
  DraftPlacement,
  placeEntry,
  removePlacement,
  toPlayablePuzzle,
  validatePlacement,
  ValidationResult,
} from './gridDraftLogic';

interface GridEditorScreenProps {
  onBack: () => void;
  onPlay: (
    grid: { isBlack: boolean; letter: string }[][],
    words: { word: string; clue: string; row: number; col: number; direction: DraftDirection }[],
  ) => void;
}

interface DragPayload {
  entryId: string;
  source: 'pool' | 'grid';
}

const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 10;
```

Inside the component:

```ts
const [rows, setRows] = useState(DEFAULT_ROWS);
const [cols, setCols] = useState(DEFAULT_COLS);
const [entries, setEntries] = useState<DraftEntry[]>([]);
const [placements, setPlacements] = useState<DraftPlacement[]>([]);
const [entryWord, setEntryWord] = useState('');
const [entryClue, setEntryClue] = useState('');
const [defaultDirection, setDefaultDirection] = useState<DraftDirection>('across');
const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
const [preview, setPreview] = useState<ValidationResult | null>(null);
const [editorMessage, setEditorMessage] = useState<string | null>(null);

const draftGrid = useMemo(
  () => deriveGrid(entries, placements, rows, cols),
  [entries, placements, rows, cols],
);

const placedEntryIds = useMemo(
  () => new Set(placements.map(placement => placement.entryId)),
  [placements],
);

const unplacedEntries = entries.filter(entry => !placedEntryIds.has(entry.id));
const placedEntries = entries.filter(entry => placedEntryIds.has(entry.id));
```

- [x] **Step 2: Add entry CRUD handlers**

Add these handlers inside `GridEditorScreen`:

```ts
const createEntryId = (word: string) => `${Date.now()}-${word.trim()}`;

const handleAddEntry = () => {
  const word = entryWord.trim();
  if (!word) {
    setEditorMessage('请先输入词或成语');
    return;
  }

  const entry: DraftEntry = {
    id: createEntryId(word),
    word,
    clue: entryClue.trim(),
  };

  setEntries(prev => [...prev, entry]);
  setEntryWord('');
  setEntryClue('');
  setEditorMessage(null);
};

const handleDeleteEntry = (entryId: string) => {
  const result = deleteEntry(entries, placements, entryId);
  setEntries(result.entries);
  setPlacements(result.placements);
  setPreview(null);
  setEditorMessage(null);
};

const handleRemovePlacement = (entryId: string) => {
  setPlacements(prev => removePlacement(prev, entryId));
  setPreview(null);
  setEditorMessage(null);
};
```

- [x] **Step 3: Replace grid resize logic**

Use this resize helper so resizing resets placements safely:

```ts
const regenerateGrid = (newRows: number, newCols: number) => {
  setRows(newRows);
  setCols(newCols);
  setPlacements([]);
  setPreview(null);
  setEditorMessage('网格尺寸已更新，已清空当前摆放');
};
```

- [x] **Step 4: Run TypeScript build**

Run:

```powershell
npm run build
```

Expected: FAIL if JSX still references removed state. This failure is expected until Task 4 replaces the UI.

---

### Task 4: Build the Two-Column Editor UI Without Drag Behavior

**Files:**
- Modify: `web/src/ui/game/GridEditorScreen.tsx`

- [x] **Step 1: Replace the top-level JSX layout**

Keep the existing themed header, then replace the editor body with this structure:

```tsx
<div style={editorBodyStyle}>
  <aside style={wordPanelStyle}>
    <section style={panelSectionStyle}>
      <h2 style={sectionTitleStyle}>创建词条</h2>
      <label style={labelStyle}>词或成语</label>
      <input
        type="text"
        value={entryWord}
        onChange={event => setEntryWord(event.target.value)}
        placeholder="例如 PYTHON 或 画蛇添足"
        style={inputStyle()}
      />
      <label style={{ ...labelStyle, marginTop: 10 }}>提示（可选）</label>
      <input
        type="text"
        value={entryClue}
        onChange={event => setEntryClue(event.target.value)}
        placeholder="可以留空"
        style={inputStyle()}
      />
      <button
        type="button"
        onClick={handleAddEntry}
        disabled={!entryWord.trim()}
        style={{ ...primaryButtonStyle(!entryWord.trim()), width: '100%', marginTop: 12 }}
      >
        添加词条
      </button>
    </section>

    <section style={panelSectionStyle}>
      <h2 style={sectionTitleStyle}>待放入</h2>
      {unplacedEntries.length === 0 ? (
        <p style={emptyTextStyle}>还没有待放入的词条</p>
      ) : (
        unplacedEntries.map(entry => renderEntryCard(entry, false))
      )}
    </section>

    <section style={panelSectionStyle}>
      <h2 style={sectionTitleStyle}>已放置</h2>
      {placedEntries.length === 0 ? (
        <p style={emptyTextStyle}>拖入网格后会显示在这里</p>
      ) : (
        placedEntries.map(entry => renderEntryCard(entry, true))
      )}
    </section>
  </aside>

  <main style={gridPanelStyle}>
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: colors.onSurfaceVariant }}>网格</span>
        <input
          type="number"
          value={rows}
          onChange={event => regenerateGrid(parseInt(event.target.value) || DEFAULT_ROWS, cols)}
          min={5}
          max={15}
          style={{ ...inputStyle(), width: 72 }}
        />
        <span>×</span>
        <input
          type="number"
          value={cols}
          onChange={event => regenerateGrid(rows, parseInt(event.target.value) || DEFAULT_COLS)}
          min={5}
          max={15}
          style={{ ...inputStyle(), width: 72 }}
        />
      </div>

      <div style={directionGroupStyle}>
        <button
          type="button"
          onClick={() => setDefaultDirection('across')}
          style={directionButtonStyle(defaultDirection === 'across')}
        >
          横向
        </button>
        <button
          type="button"
          onClick={() => setDefaultDirection('down')}
          style={directionButtonStyle(defaultDirection === 'down')}
        >
          纵向
        </button>
      </div>

      <button
        type="button"
        onClick={handlePlay}
        disabled={placements.length === 0}
        style={primaryButtonStyle(placements.length === 0)}
      >
        开始游戏
      </button>
    </div>

    {editorMessage && <div style={messageStyle}>{editorMessage}</div>}

    <div style={draftGridOuterStyle}>
      {draftGrid.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((cell, colIndex) => renderDraftCell(cell, rowIndex, colIndex))}
        </div>
      ))}
    </div>
  </main>
</div>
```

- [x] **Step 2: Add local render helpers**

Add these helper functions inside `GridEditorScreen` before `return`:

```tsx
const getPlacementForEntry = (entryId: string) =>
  placements.find(placement => placement.entryId === entryId) ?? null;

const renderEntryCard = (entry: DraftEntry, isPlaced: boolean) => {
  const placement = getPlacementForEntry(entry.id);

  return (
    <div key={entry.id} style={entryCardStyle}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={entryWordStyle}>{entry.word}</div>
        {entry.clue && <div style={entryClueStyle}>{entry.clue}</div>}
        {placement && (
          <div style={entryMetaStyle}>
            {placement.direction === 'across' ? '横向' : '纵向'} · 第 {placement.row + 1} 行，第 {placement.col + 1} 列
          </div>
        )}
      </div>
      {isPlaced && (
        <button type="button" onClick={() => handleRemovePlacement(entry.id)} style={quietButtonStyle}>
          放回
        </button>
      )}
      <button type="button" onClick={() => handleDeleteEntry(entry.id)} style={dangerButtonStyle}>
        删除
      </button>
    </div>
  );
};

const renderDraftCell = (cell: DraftCell, rowIndex: number, colIndex: number) => {
  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      style={{
        ...draftCellStyle,
        backgroundColor: cell.isBlack ? colors.cellBlocked : colors.cellEmpty,
        color: cell.isBlack ? 'transparent' : colors.textPrimary,
      }}
    >
      {cell.letter}
    </div>
  );
};
```

- [x] **Step 3: Add local styles**

Add these styles below the component:

```ts
const editorBodyStyle: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  gridTemplateColumns: '340px minmax(0, 1fr)',
  gap: 16,
  padding: 16,
  overflow: 'hidden',
};

const wordPanelStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const panelSectionStyle: React.CSSProperties = {
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  padding: 14,
  boxShadow: 'var(--cw-card-shadow)',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: colors.onSurface,
  fontSize: 16,
  fontWeight: 800,
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.onSurfaceVariant,
  fontSize: 14,
  lineHeight: 1.5,
};

const gridPanelStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: 'auto',
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxShadow: 'var(--cw-card-shadow)',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  padding: 14,
  borderBottom: `1px solid ${colors.outline}`,
};

const directionGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const directionButtonStyle = (selected: boolean): React.CSSProperties => ({
  minHeight: 44,
  border: `1px solid ${selected ? colors.primary : colors.outline}`,
  borderRadius: 999,
  backgroundColor: selected ? colors.primary : colors.surface,
  color: selected ? colors.onPrimary : colors.primary,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 800,
  padding: '0 14px',
});

const messageStyle: React.CSSProperties = {
  margin: 14,
  padding: 12,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
  color: colors.onSurface,
  fontSize: 14,
};

const draftGridOuterStyle: React.CSSProperties = {
  display: 'inline-block',
  margin: 14,
  border: `2px solid ${colors.outline}`,
  borderRadius: 8,
  overflow: 'hidden',
};

const draftCellStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${colors.outlineVariant}`,
  boxSizing: 'border-box',
  fontSize: 14,
  fontWeight: 800,
};

const entryCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 10,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
  marginBottom: 8,
};

const entryWordStyle: React.CSSProperties = {
  color: colors.onSurface,
  fontSize: 15,
  fontWeight: 800,
  lineHeight: 1.3,
};

const entryClueStyle: React.CSSProperties = {
  color: colors.onSurfaceVariant,
  fontSize: 13,
  lineHeight: 1.4,
  marginTop: 4,
};

const entryMetaStyle: React.CSSProperties = {
  color: colors.primary,
  fontSize: 12,
  fontWeight: 700,
  marginTop: 4,
};

const dangerButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: 'none',
  borderRadius: 8,
  backgroundColor: colors.error,
  color: colors.onError,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 800,
  padding: '0 12px',
};
```

- [x] **Step 4: Add `handlePlay` conversion**

Replace the old `handlePlay` with:

```ts
const handlePlay = () => {
  if (entries.length === 0) {
    setEditorMessage('请先添加至少一个词条');
    return;
  }

  if (placements.length === 0) {
    setEditorMessage('请至少放置一个词条');
    return;
  }

  const playable = toPlayablePuzzle(entries, placements, rows, cols);
  onPlay(playable.grid, playable.words);
};
```

- [x] **Step 5: Build**

Run:

```powershell
npm run build
```

Expected: PASS. The UI is not draggable yet, but adding words and showing an all-black grid compiles.

---

### Task 5: Add HTML5 Drag-and-Drop Placement

**Files:**
- Modify: `web/src/ui/game/GridEditorScreen.tsx`

- [x] **Step 1: Add drag payload serialization**

Add inside `GridEditorScreen`:

```ts
const dragMimeType = 'application/x-crossword-entry';

const startEntryDrag = (
  event: React.DragEvent<HTMLElement>,
  entryId: string,
  source: DragPayload['source'],
) => {
  const payload: DragPayload = { entryId, source };
  event.dataTransfer.setData(dragMimeType, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'move';
  setDragPayload(payload);
  setEditorMessage(source === 'grid' ? '拖回左侧词条池可取消放置' : null);
};

const readDragPayload = (event: React.DragEvent<HTMLElement>): DragPayload | null => {
  const raw = event.dataTransfer.getData(dragMimeType);
  if (!raw) return dragPayload;

  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return dragPayload;
  }
};

const clearDragState = () => {
  setDragPayload(null);
  setPreview(null);
};
```

- [x] **Step 2: Make entry cards draggable**

In `renderEntryCard`, add these props to the outer `<div>`:

```tsx
draggable
onDragStart={event => startEntryDrag(event, entry.id, isPlaced ? 'grid' : 'pool')}
onDragEnd={clearDragState}
```

The resulting opening tag must be:

```tsx
<div
  key={entry.id}
  draggable
  onDragStart={event => startEntryDrag(event, entry.id, isPlaced ? 'grid' : 'pool')}
  onDragEnd={clearDragState}
  style={entryCardStyle}
>
```

- [x] **Step 3: Add placement preview on grid cells**

Add this helper:

```ts
const previewCellKey = (row: number, col: number) => `${row}:${col}`;

const previewCellMap = useMemo(() => {
  const map = new Map<string, boolean>();
  if (!preview) return map;

  for (const cell of preview.previewCells) {
    map.set(previewCellKey(cell.row, cell.col), preview.valid);
  }

  return map;
}, [preview]);

const getCellPreviewState = (row: number, col: number) => {
  const key = previewCellKey(row, col);
  if (!previewCellMap.has(key)) return 'none';
  return previewCellMap.get(key) ? 'valid' : 'invalid';
};
```

Update `renderDraftCell` opening `<div>`:

```tsx
const previewState = getCellPreviewState(rowIndex, colIndex);

return (
  <div
    key={`${rowIndex}-${colIndex}`}
    onDragOver={event => handleGridDragOver(event, rowIndex, colIndex)}
    onDrop={event => handleGridDrop(event, rowIndex, colIndex)}
    style={{
      ...draftCellStyle,
      backgroundColor:
        previewState === 'valid'
          ? colors.primaryContainer
          : previewState === 'invalid'
            ? 'rgba(220, 38, 38, 0.18)'
            : cell.isBlack
              ? colors.cellBlocked
              : colors.cellEmpty,
      color: cell.isBlack ? 'transparent' : colors.textPrimary,
      outline: previewState === 'valid'
        ? `2px solid ${colors.primary}`
        : previewState === 'invalid'
          ? `2px solid ${colors.error}`
          : 'none',
      outlineOffset: '-2px',
    }}
  >
    {cell.letter}
  </div>
);
```

- [x] **Step 4: Add grid drag handlers**

Add:

```ts
const buildCandidatePlacement = (
  payload: DragPayload,
  row: number,
  col: number,
): DraftPlacement => ({
  entryId: payload.entryId,
  row,
  col,
  direction: defaultDirection,
});

const handleGridDragOver = (
  event: React.DragEvent<HTMLElement>,
  row: number,
  col: number,
) => {
  const payload = readDragPayload(event);
  if (!payload) return;

  event.preventDefault();
  const candidate = buildCandidatePlacement(payload, row, col);
  const validation = validatePlacement(entries, placements, candidate, rows, cols, {
    ignoreEntryId: payload.source === 'grid' ? payload.entryId : undefined,
  });
  setPreview(validation);
  event.dataTransfer.dropEffect = validation.valid ? 'move' : 'none';
};

const handleGridDrop = (
  event: React.DragEvent<HTMLElement>,
  row: number,
  col: number,
) => {
  const payload = readDragPayload(event);
  if (!payload) return;

  event.preventDefault();
  const candidate = buildCandidatePlacement(payload, row, col);
  const result = placeEntry(entries, placements, candidate, rows, cols, {
    ignoreEntryId: payload.source === 'grid' ? payload.entryId : undefined,
  });

  setPlacements(result.placements);
  setEditorMessage(result.validation.reason);
  clearDragState();
};
```

- [x] **Step 5: Add drop-to-pool removal**

Add props to the `<aside style={wordPanelStyle}>` element:

```tsx
onDragOver={event => {
  if (dragPayload?.source === 'grid') {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
}}
onDrop={event => {
  const payload = readDragPayload(event);
  if (payload?.source === 'grid') {
    event.preventDefault();
    handleRemovePlacement(payload.entryId);
    setEditorMessage('词条已放回待放入列表');
    clearDragState();
  }
}}
```

- [x] **Step 6: Verify invalid drops keep original placement**

Run:

```powershell
npm run build
```

Expected: PASS. Manual browser verification happens in Task 7.

---

### Task 6: Polish Editor Interactions and Empty States

**Files:**
- Modify: `web/src/ui/game/GridEditorScreen.tsx`

- [x] **Step 1: Show active pool drop affordance**

Update `wordPanelStyle` usage on the `<aside>`:

```tsx
style={{
  ...wordPanelStyle,
  outline: dragPayload?.source === 'grid' ? `2px dashed ${colors.primary}` : 'none',
  outlineOffset: 4,
}}
```

- [x] **Step 2: Show drag guidance message**

Under the toolbar, render:

```tsx
<div style={messageStyle}>
  {editorMessage ?? '先在左侧创建词条，再拖到网格中。拖回左侧词条池可取消放置。'}
</div>
```

Remove the older conditional-only `editorMessage && ...` block to keep guidance visible.

- [x] **Step 3: Make placed grid letters draggable**

In `renderDraftCell`, compute a draggable entry id:

```ts
const draggableEntryId = cell.entryIds[0] ?? null;
```

Add these props to the cell `<div>`:

```tsx
draggable={Boolean(draggableEntryId)}
onDragStart={event => {
  if (draggableEntryId) {
    startEntryDrag(event, draggableEntryId, 'grid');
  }
}}
onDragEnd={clearDragState}
```

This allows moving placed words directly from occupied cells. If a crossing cell belongs to multiple words, dragging uses the first entry id from `entryIds`; moving via the “已放置” card remains the clearer path.

- [x] **Step 4: Build**

Run:

```powershell
npm run build
```

Expected: PASS.

---

### Task 7: Verification

**Files:**
- Use: all changed files.

- [x] **Step 1: Run all automated tests**

Run:

```powershell
npm test
```

Expected: all tests pass. Expected count after Task 1 is at least 7 test files and 19 tests.

- [x] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: `tsc && vite build` succeeds.

- [x] **Step 3: Browser-check the editor flow**

Use the running local server at `http://127.0.0.1:5174/`.

Open:

```powershell
npx --yes --package @playwright/cli playwright-cli open http://127.0.0.1:5174 --headed
npx --yes --package @playwright/cli playwright-cli snapshot
```

Manual flow:

1. Click `指定词和位置`.
2. Add `PYTHON` with clue `language`.
3. Add `HONOR` with empty clue.
4. Drag `PYTHON` to row 2, col 2 with horizontal selected.
5. Switch to vertical.
6. Drag `HONOR` to intersect the `H` in `PYTHON`.
7. Confirm the preview is valid and the placement appears in `已放置`.
8. Drag `HONOR` back to the left pool.
9. Confirm the `PYTHON` letters remain and `HONOR` is unplaced.
10. Drag a word to an invalid conflicting position.
11. Confirm an inline error appears and the old placement stays.
12. Click `开始游戏`.
13. Confirm the game screen loads with the custom grid.

- [x] **Step 4: Browser-check console errors**

Run:

```powershell
npx --yes --package @playwright/cli playwright-cli console error
```

Expected: `Errors: 0`.

- [x] **Step 5: Close browser session**

Run:

```powershell
npx --yes --package @playwright/cli playwright-cli close
```

Expected: browser closes cleanly.

---

## Self-Review

Spec coverage:

- Desktop-only scope: covered by file layout and browser verification.
- Optional clue: covered by entry creation and tests using empty clue.
- Initially black grid: covered by logic test and `deriveGrid`.
- Drag from pool to grid: covered by Task 5.
- Drag from grid to grid: covered by Task 5.
- Drag from grid back to pool: covered by Task 5.
- Drag to ordinary blank area returns to original position: handled by only mutating placements on valid grid drop or pool drop.
- Delete entry removes placement: covered by logic test and UI handler.
- Existing play payload compatibility: covered by `toPlayablePuzzle` test and `handlePlay`.

Placeholder scan:

- This plan intentionally contains no placeholder items, no incomplete tasks, and no unnamed file paths.

Type consistency:

- `DraftEntry`, `DraftPlacement`, `DraftDirection`, `ValidationResult`, and `DragPayload` names are introduced before use and reused consistently.
