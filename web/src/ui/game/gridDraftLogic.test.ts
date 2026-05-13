import { describe, expect, it } from 'vitest';
import {
  deleteEntry,
  deriveGrid,
  getEntryChars,
  normalizeEntryWord,
  placeEntry,
  removePlacement,
  toPlayablePuzzle,
  validatePlacement,
  type DraftEntry,
  type DraftPlacement,
} from './gridDraftLogic';

const entries: DraftEntry[] = [
  { id: 'hello', word: ' hello ', clue: 'Greeting' },
  { id: 'earth', word: 'earth', clue: 'Planet' },
  { id: 'hard', word: 'hard' },
  { id: 'hel', word: 'hel' },
  { id: 'hero', word: 'hero', clue: '' },
  { id: 'mixed', word: ' ai人工智能 ', clue: 'AI' },
];

describe('gridDraftLogic', () => {
  it('derives an initially all-black grid when nothing is placed', () => {
    const grid = deriveGrid(entries, [], 2, 3);

    expect(grid).toEqual([
      [
        { isBlack: true, letter: '', owners: [] },
        { isBlack: true, letter: '', owners: [] },
        { isBlack: true, letter: '', owners: [] },
      ],
      [
        { isBlack: true, letter: '', owners: [] },
        { isBlack: true, letter: '', owners: [] },
        { isBlack: true, letter: '', owners: [] },
      ],
    ]);
  });

  it('places an entry across with normalized letters and owners', () => {
    const grid = deriveGrid(entries, [{ entryId: 'hello', row: 1, col: 0, direction: 'across' }], 3, 6);

    expect(grid[1].map((cell) => cell.letter)).toEqual(['H', 'E', 'L', 'L', 'O', '']);
    expect(grid[1][0]).toEqual({ isBlack: false, letter: 'H', owners: ['hello'] });
    expect(grid[0][0]).toEqual({ isBlack: true, letter: '', owners: [] });
  });

  it('allows matching crossings and rejects mismatched crossings', () => {
    const placements: DraftPlacement[] = [{ entryId: 'hello', row: 1, col: 0, direction: 'across' }];

    expect(
      validatePlacement(entries, placements, { entryId: 'hero', row: 0, col: 1, direction: 'down' }, 6, 6),
    ).toEqual({ valid: true });

    expect(
      validatePlacement(entries, placements, { entryId: 'hard', row: 0, col: 1, direction: 'down' }, 6, 6),
    ).toEqual({ valid: false, reason: '第 2 个字和已有字母不一致' });
  });

  it('rejects overlapping placements in the same direction even when letters match', () => {
    const placements: DraftPlacement[] = [{ entryId: 'hello', row: 0, col: 0, direction: 'across' }];

    expect(
      validatePlacement(entries, placements, { entryId: 'hel', row: 0, col: 0, direction: 'across' }, 6, 6).valid,
    ).toBe(false);

    expect(
      validatePlacement(entries, placements, { entryId: 'hel', row: 0, col: 2, direction: 'across' }, 6, 6).valid,
    ).toBe(false);
  });

  it('rejects placements that exceed grid bounds', () => {
    expect(
      validatePlacement(entries, [], { entryId: 'hello', row: 0, col: 2, direction: 'across' }, 3, 5),
    ).toEqual({ valid: false, reason: '这个词会超出网格范围' });

    expect(
      validatePlacement(entries, [], { entryId: 'hello', row: 1, col: 0, direction: 'down' }, 5, 5),
    ).toEqual({ valid: false, reason: '这个词会超出网格范围' });
  });

  it('ignores the old placement for the same entry while moving it', () => {
    const placements: DraftPlacement[] = [
      { entryId: 'hello', row: 0, col: 0, direction: 'across' },
      { entryId: 'hero', row: 0, col: 1, direction: 'down' },
    ];

    expect(
      validatePlacement(
        entries,
        placements,
        { entryId: 'hero', row: 0, col: 0, direction: 'down' },
        6,
        6,
        { ignoreEntryId: 'hero' },
      ),
    ).toEqual({ valid: true });

    const result = placeEntry(
      entries,
      placements,
      { entryId: 'hero', row: 0, col: 0, direction: 'down' },
      6,
      6,
      { ignoreEntryId: 'hero' },
    );

    expect(result.validation).toEqual({ valid: true });
    expect(result.placements).toEqual([
      { entryId: 'hello', row: 0, col: 0, direction: 'across' },
      { entryId: 'hero', row: 0, col: 0, direction: 'down' },
    ]);
  });

  it('keeps other crossing letters when removing one placement', () => {
    const placements: DraftPlacement[] = [
      { entryId: 'hello', row: 1, col: 0, direction: 'across' },
      { entryId: 'earth', row: 0, col: 1, direction: 'down' },
    ];

    const remainingGrid = deriveGrid(entries, removePlacement(placements, 'hello'), 6, 6);

    expect(remainingGrid[1][1]).toEqual({ isBlack: false, letter: 'A', owners: ['earth'] });
    expect(remainingGrid[1][0]).toEqual({ isBlack: true, letter: '', owners: [] });
  });

  it('deletes an entry and its placement together', () => {
    const placements: DraftPlacement[] = [
      { entryId: 'hello', row: 0, col: 0, direction: 'across' },
      { entryId: 'earth', row: 0, col: 1, direction: 'down' },
    ];

    expect(deleteEntry(entries, placements, 'earth')).toEqual({
      entries: entries.filter((entry) => entry.id !== 'earth'),
      placements: [{ entryId: 'hello', row: 0, col: 0, direction: 'across' }],
    });
  });

  it('normalizes non-Chinese characters individually and counts Chinese idioms by character', () => {
    const idiom = { id: 'idiom', word: ' 画龙点睛 ' };

    expect(normalizeEntryWord(' hello ')).toBe('HELLO');
    expect(normalizeEntryWord(' 画龙点睛 ')).toBe('画龙点睛');
    expect(normalizeEntryWord(' ai人工智能 ')).toBe('AI人工智能');
    expect(getEntryChars(idiom)).toEqual(['画', '龙', '点', '睛']);
  });

  it('uses mixed Chinese and English normalization in grid and payload', () => {
    const placements: DraftPlacement[] = [{ entryId: 'mixed', row: 0, col: 0, direction: 'across' }];

    const grid = deriveGrid(entries, placements, 2, 6);
    const puzzle = toPlayablePuzzle(entries, placements, 2, 6);

    expect(grid[0].map((cell) => cell.letter)).toEqual(['A', 'I', '人', '工', '智', '能']);
    expect(puzzle.grid[0].map((cell) => cell.letter)).toEqual(['A', 'I', '人', '工', '智', '能']);
    expect(puzzle.words).toContainEqual({
      word: 'AI人工智能',
      clue: 'AI',
      row: 0,
      col: 0,
      direction: 'across',
    });
  });

  it('converts placed entries to a playable puzzle payload', () => {
    const puzzle = toPlayablePuzzle(
      [...entries, { id: 'idiom', word: '画龙点睛' }],
      [
        { entryId: 'hello', row: 1, col: 0, direction: 'across' },
        { entryId: 'idiom', row: 0, col: 5, direction: 'down' },
      ],
      5,
      6,
    );

    expect(puzzle.grid[1][0]).toEqual({ isBlack: false, letter: 'H' });
    expect(puzzle.grid[0][0]).toEqual({ isBlack: true, letter: '' });
    expect(puzzle.words).toEqual([
      { word: 'HELLO', clue: 'Greeting', row: 1, col: 0, direction: 'across' },
      { word: '画龙点睛', clue: '', row: 0, col: 5, direction: 'down' },
    ]);
  });

  it('filters stale invalid placements out of playable puzzle payload and grid', () => {
    const puzzle = toPlayablePuzzle(
      entries,
      [
        { entryId: 'hello', row: 0, col: 0, direction: 'across' },
        { entryId: 'earth', row: 1, col: 4, direction: 'across' },
      ],
      3,
      6,
    );

    expect(puzzle.words).toEqual([{ word: 'HELLO', clue: 'Greeting', row: 0, col: 0, direction: 'across' }]);
    expect(puzzle.grid[1].every((cell) => cell.isBlack && cell.letter === '')).toBe(true);
  });
});
