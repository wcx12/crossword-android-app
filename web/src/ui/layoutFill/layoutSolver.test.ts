import { describe, expect, it } from 'vitest';
import { solveLayout } from './layoutSolver';
import type { LayoutMatrix } from './layoutAnalysis';

const open = false;
const black = true;

function layout(rows: boolean[][]): LayoutMatrix {
  return rows.map(row => row.map(isBlack => ({ isBlack })));
}

describe('solveLayout', () => {
  it('fills a connected layout while respecting crossings', () => {
    const result = solveLayout(layout([
      [open, open, open],
      [open, black, open],
      [open, open, open],
    ]), [
      { word: 'cat', clue: 'top row' },
      { word: 'dog', clue: 'bottom row' },
      { word: 'cud', clue: 'left column' },
      { word: 'tag', clue: 'right column' },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.words).toEqual([
      { word: 'CAT', clue: 'top row', row: 0, col: 0, direction: 'across' },
      { word: 'DOG', clue: 'bottom row', row: 2, col: 0, direction: 'across' },
      { word: 'CUD', clue: 'left column', row: 0, col: 0, direction: 'down' },
      { word: 'TAG', clue: 'right column', row: 0, col: 2, direction: 'down' },
    ]);
    expect(result.grid.map(row => row.map(cell => cell.letter))).toEqual([
      ['C', 'A', 'T'],
      ['U', '', 'A'],
      ['D', 'O', 'G'],
    ]);
  });

  it('keeps Chinese characters intact', () => {
    const result = solveLayout(layout([[open, open, open, open]]), [
      { word: ' 画龙点睛 ', clue: '成语' },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.words[0].word).toBe('画龙点睛');
    expect(result.grid[0].map(cell => cell.letter)).toEqual(['画', '龙', '点', '睛']);
  });

  it('fails when a layout has no slots', () => {
    const result = solveLayout(layout([[open]]), [{ word: 'AB' }]);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'noSlots',
    }));
  });

  it('fails disconnected layouts before solving', () => {
    const result = solveLayout(layout([[open, open, black, open, open]]), [
      { word: 'AB' },
      { word: 'CD' },
    ]);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'disconnectedLayout',
    }));
  });

  it('fails when there are not enough unique words for a required length', () => {
    const result = solveLayout(layout([
      [open, open],
      [open, open],
    ]), [
      { word: 'AA' },
      { word: 'AA' },
      { word: 'AB' },
    ]);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'insufficientWordsByLength',
    }));
  });

  it('fails when no candidate exists for a slot length', () => {
    const result = solveLayout(layout([[open, open, open]]), [
      { word: 'AB' },
      { word: 'CD' },
    ]);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'noCandidatesForSlot',
    }));
  });

  it('fails when crossing letters cannot be made consistent', () => {
    const result = solveLayout(layout([
      [open, open],
      [open, open],
    ]), [
      { word: 'AB' },
      { word: 'CD' },
      { word: 'EF' },
      { word: 'GH' },
    ]);

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'noSolution',
    }));
  });
});
