import { describe, expect, it } from 'vitest';
import { analyzeLayout, type LayoutMatrix } from './layoutAnalysis';

const open = false;
const black = true;

function layout(rows: boolean[][]): LayoutMatrix {
  return rows.map(row => row.map(isBlack => ({ isBlack })));
}

describe('analyzeLayout', () => {
  it('extracts across and down slots with length requirements', () => {
    const result = analyzeLayout(layout([
      [open, open, black],
      [open, open, open],
      [black, open, open],
    ]));

    expect(result.slots.map(slot => ({
      direction: slot.direction,
      row: slot.row,
      col: slot.col,
      length: slot.length,
      cells: slot.cells,
    }))).toEqual([
      { direction: 'across', row: 0, col: 0, length: 2, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
      { direction: 'across', row: 1, col: 0, length: 3, cells: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
      { direction: 'across', row: 2, col: 1, length: 2, cells: [{ row: 2, col: 1 }, { row: 2, col: 2 }] },
      { direction: 'down', row: 0, col: 0, length: 2, cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }] },
      { direction: 'down', row: 0, col: 1, length: 3, cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }] },
      { direction: 'down', row: 1, col: 2, length: 2, cells: [{ row: 1, col: 2 }, { row: 2, col: 2 }] },
    ]);
    expect(result.lengthRequirements).toEqual({ 2: 4, 3: 2 });
    expect(result.isConnected).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('reports empty and slotless layouts', () => {
    const emptyResult = analyzeLayout([]);
    expect(emptyResult.issues.map(issue => issue.type)).toContain('emptyLayout');
    expect(emptyResult.issues.map(issue => issue.type)).toContain('noSlots');

    const singleCellResult = analyzeLayout(layout([[open]]));
    expect(singleCellResult.slots).toEqual([]);
    expect(singleCellResult.issues.map(issue => issue.type)).toContain('noSlots');
    expect(singleCellResult.issues.map(issue => issue.type)).toContain('isolatedWhiteCell');
  });

  it('reports disconnected slot components', () => {
    const result = analyzeLayout(layout([
      [open, open, black, open, open],
    ]));

    expect(result.isConnected).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'disconnectedLayout', componentCount: 2 }),
    ]));
  });
});
