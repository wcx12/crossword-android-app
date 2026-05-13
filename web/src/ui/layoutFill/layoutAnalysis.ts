export type LayoutDirection = 'across' | 'down';
export type LayoutMatrix = { isBlack: boolean }[][];

export interface LayoutCellPosition {
  row: number;
  col: number;
}

export interface LayoutSlot {
  id: string;
  direction: LayoutDirection;
  row: number;
  col: number;
  length: number;
  cells: LayoutCellPosition[];
}

export type LayoutIssue =
  | { type: 'emptyLayout'; severity: 'error'; message: string }
  | { type: 'noSlots'; severity: 'error'; message: string }
  | { type: 'isolatedWhiteCell'; severity: 'warning'; message: string; cells: LayoutCellPosition[] }
  | { type: 'disconnectedLayout'; severity: 'error'; message: string; componentCount: number };

export interface LayoutAnalysis {
  slots: LayoutSlot[];
  lengthRequirements: Record<number, number>;
  issues: LayoutIssue[];
  isConnected: boolean;
}

export function analyzeLayout(layout: LayoutMatrix): LayoutAnalysis {
  const slots = extractSlots(layout);
  const lengthRequirements = slots.reduce<Record<number, number>>((requirements, slot) => {
    requirements[slot.length] = (requirements[slot.length] ?? 0) + 1;
    return requirements;
  }, {});

  const issues: LayoutIssue[] = [];
  const isEmpty = layout.length === 0 || layout.every(row => row.length === 0);
  if (isEmpty) {
    issues.push({
      type: 'emptyLayout',
      severity: 'error',
      message: '布局为空，请先创建格子。',
    });
  }

  if (slots.length === 0) {
    issues.push({
      type: 'noSlots',
      severity: 'error',
      message: '布局中没有长度至少为 2 的可填位置。',
    });
  }

  const isolatedWhiteCells = findIsolatedWhiteCells(layout, slots);
  if (isolatedWhiteCells.length > 0) {
    issues.push({
      type: 'isolatedWhiteCell',
      severity: 'warning',
      message: `有 ${isolatedWhiteCells.length} 个开放格不属于任何可填位置。`,
      cells: isolatedWhiteCells,
    });
  }

  const componentCount = countSlotComponents(slots);
  const isConnected = slots.length > 0 && componentCount === 1;
  if (slots.length > 0 && componentCount > 1) {
    issues.push({
      type: 'disconnectedLayout',
      severity: 'error',
      message: `布局被分成 ${componentCount} 个互不相连的填词区域。`,
      componentCount,
    });
  }

  return {
    slots,
    lengthRequirements,
    issues,
    isConnected,
  };
}

function extractSlots(layout: LayoutMatrix): LayoutSlot[] {
  const slots: LayoutSlot[] = [];
  let acrossCount = 0;
  let downCount = 0;

  layout.forEach((row, rowIndex) => {
    let col = 0;
    while (col < row.length) {
      if (row[col]?.isBlack) {
        col += 1;
        continue;
      }

      const startCol = col;
      const cells: LayoutCellPosition[] = [];
      while (col < row.length && !row[col]?.isBlack) {
        cells.push({ row: rowIndex, col });
        col += 1;
      }

      if (cells.length >= 2) {
        acrossCount += 1;
        slots.push({
          id: `A${acrossCount}`,
          direction: 'across',
          row: rowIndex,
          col: startCol,
          length: cells.length,
          cells,
        });
      }
    }
  });

  const maxCols = Math.max(0, ...layout.map(row => row.length));
  for (let col = 0; col < maxCols; col += 1) {
    let row = 0;
    while (row < layout.length) {
      if (layout[row]?.[col]?.isBlack ?? true) {
        row += 1;
        continue;
      }

      const startRow = row;
      const cells: LayoutCellPosition[] = [];
      while (row < layout.length && !(layout[row]?.[col]?.isBlack ?? true)) {
        cells.push({ row, col });
        row += 1;
      }

      if (cells.length >= 2) {
        downCount += 1;
        slots.push({
          id: `D${downCount}`,
          direction: 'down',
          row: startRow,
          col,
          length: cells.length,
          cells,
        });
      }
    }
  }

  return slots;
}

function findIsolatedWhiteCells(layout: LayoutMatrix, slots: LayoutSlot[]): LayoutCellPosition[] {
  const coveredCells = new Set(slots.flatMap(slot => slot.cells.map(cellKey)));
  const isolated: LayoutCellPosition[] = [];

  layout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell.isBlack && !coveredCells.has(cellKey({ row: rowIndex, col: colIndex }))) {
        isolated.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  return isolated;
}

function countSlotComponents(slots: LayoutSlot[]): number {
  if (slots.length === 0) return 0;

  const cellToSlotIds = new Map<string, string[]>();
  slots.forEach(slot => {
    slot.cells.forEach(cell => {
      const key = cellKey(cell);
      const slotIds = cellToSlotIds.get(key) ?? [];
      slotIds.push(slot.id);
      cellToSlotIds.set(key, slotIds);
    });
  });

  const edges = new Map<string, Set<string>>();
  slots.forEach(slot => edges.set(slot.id, new Set()));
  cellToSlotIds.forEach(slotIds => {
    slotIds.forEach(slotId => {
      const neighbors = edges.get(slotId);
      if (!neighbors) return;
      slotIds.forEach(otherSlotId => {
        if (otherSlotId !== slotId) neighbors.add(otherSlotId);
      });
    });
  });

  const visited = new Set<string>();
  let componentCount = 0;
  slots.forEach(slot => {
    if (visited.has(slot.id)) return;
    componentCount += 1;
    const stack = [slot.id];
    visited.add(slot.id);

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      edges.get(current)?.forEach(next => {
        if (visited.has(next)) return;
        visited.add(next);
        stack.push(next);
      });
    }
  });

  return componentCount;
}

function cellKey(cell: LayoutCellPosition): string {
  return `${cell.row}:${cell.col}`;
}
