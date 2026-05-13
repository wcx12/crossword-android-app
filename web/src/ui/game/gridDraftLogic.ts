export type DraftDirection = 'across' | 'down';

export interface DraftEntry {
  id: string;
  word: string;
  clue?: string;
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
  owners: string[];
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PlaceOptions {
  ignoreEntryId?: string;
}

export interface PlaceResult {
  placements: DraftPlacement[];
  validation: ValidationResult;
}

export interface PlayablePuzzle {
  grid: Array<Array<{ isBlack: boolean; letter: string }>>;
  words: Array<{
    word: string;
    clue: string;
    row: number;
    col: number;
    direction: DraftDirection;
  }>;
}

const hasHan = (value: string) => /[\u3400-\u9fff]/u.test(value);

export const normalizeEntryWord = (word: string): string => {
  const trimmed = word.trim();
  return Array.from(trimmed)
    .map((char) => (hasHan(char) ? char : char.toUpperCase()))
    .join('');
};

export const getEntryChars = (entry: DraftEntry): string[] => Array.from(normalizeEntryWord(entry.word));

const createBlackCell = (): DraftCell => ({
  isBlack: true,
  letter: '',
  owners: [],
});

const findEntry = (entries: DraftEntry[], entryId: string): DraftEntry | undefined =>
  entries.find((entry) => entry.id === entryId);

const getPlacementPosition = (
  placement: DraftPlacement,
  index: number,
): { row: number; col: number } => ({
  row: placement.row + (placement.direction === 'down' ? index : 0),
  col: placement.col + (placement.direction === 'across' ? index : 0),
});

const findPlacementLetterAt = (
  entry: DraftEntry,
  placement: DraftPlacement,
  row: number,
  col: number,
): { letter: string; index: number } | null => {
  const chars = getEntryChars(entry);

  for (let index = 0; index < chars.length; index += 1) {
    const position = getPlacementPosition(placement, index);
    if (position.row === row && position.col === col) {
      return { letter: chars[index], index };
    }
  }

  return null;
};

export const deriveGrid = (
  entries: DraftEntry[],
  placements: DraftPlacement[],
  rowCount: number,
  colCount: number,
): DraftCell[][] => {
  const grid = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, createBlackCell));

  placements.forEach((placement) => {
    const entry = findEntry(entries, placement.entryId);
    if (!entry) return;

    getEntryChars(entry).forEach((letter, index) => {
      const { row, col } = getPlacementPosition(placement, index);
      const cell = grid[row]?.[col];
      if (!cell) return;

      cell.isBlack = false;
      if (!cell.letter) {
        cell.letter = letter;
      }
      if (!cell.owners.includes(placement.entryId)) {
        cell.owners.push(placement.entryId);
      }
    });
  });

  return grid;
};

export const validatePlacement = (
  entries: DraftEntry[],
  placements: DraftPlacement[],
  draft: DraftPlacement,
  rowCount: number,
  colCount: number,
  options?: PlaceOptions,
): ValidationResult => {
  const entry = findEntry(entries, draft.entryId);
  if (!entry) {
    return { valid: false, reason: '词条不存在' };
  }

  const chars = getEntryChars(entry);
  if (chars.length === 0) {
    return { valid: false, reason: '词不能为空' };
  }

  const lastRow = draft.row + (draft.direction === 'down' ? chars.length - 1 : 0);
  const lastCol = draft.col + (draft.direction === 'across' ? chars.length - 1 : 0);
  if (draft.row < 0 || draft.col < 0 || lastRow >= rowCount || lastCol >= colCount) {
    return { valid: false, reason: '这个词会超出网格范围' };
  }

  const existingPlacements = placements.filter((placement) => placement.entryId !== options?.ignoreEntryId);

  for (let index = 0; index < chars.length; index += 1) {
    const { row, col } = getPlacementPosition(draft, index);

    for (const existingPlacement of existingPlacements) {
      const existingEntry = findEntry(entries, existingPlacement.entryId);
      if (!existingEntry) continue;

      const existing = findPlacementLetterAt(existingEntry, existingPlacement, row, col);
      if (!existing) continue;

      if (existingPlacement.direction === draft.direction) {
        return { valid: false, reason: '同方向词不能重叠' };
      }

      if (existing.letter !== chars[index]) {
        return { valid: false, reason: `第 ${index + 1} 个字和已有字母不一致` };
      }
    }
  }

  return { valid: true };
};

export const placeEntry = (
  entries: DraftEntry[],
  placements: DraftPlacement[],
  draft: DraftPlacement,
  rowCount: number,
  colCount: number,
  options?: PlaceOptions,
): PlaceResult => {
  const validation = validatePlacement(entries, placements, draft, rowCount, colCount, options);
  if (!validation.valid) {
    return { placements, validation };
  }

  return {
    placements: [...placements.filter((placement) => placement.entryId !== draft.entryId), draft],
    validation,
  };
};

export const removePlacement = (placements: DraftPlacement[], entryId: string): DraftPlacement[] =>
  placements.filter((placement) => placement.entryId !== entryId);

export const deleteEntry = (
  entries: DraftEntry[],
  placements: DraftPlacement[],
  entryId: string,
): { entries: DraftEntry[]; placements: DraftPlacement[] } => ({
  entries: entries.filter((entry) => entry.id !== entryId),
  placements: removePlacement(placements, entryId),
});

export const toPlayablePuzzle = (
  entries: DraftEntry[],
  placements: DraftPlacement[],
  rowCount: number,
  colCount: number,
): PlayablePuzzle => {
  const validPlacements = placements.reduce<DraftPlacement[]>((acceptedPlacements, placement) => {
    const validation = validatePlacement(entries, acceptedPlacements, placement, rowCount, colCount);
    return validation.valid ? [...acceptedPlacements, placement] : acceptedPlacements;
  }, []);
  const draftGrid = deriveGrid(entries, validPlacements, rowCount, colCount);

  return {
    grid: draftGrid.map((row) => row.map(({ isBlack, letter }) => ({ isBlack, letter }))),
    words: validPlacements.flatMap((placement) => {
      const entry = findEntry(entries, placement.entryId);
      if (!entry) return [];

      return [
        {
          word: normalizeEntryWord(entry.word),
          clue: entry.clue ?? '',
          row: placement.row,
          col: placement.col,
          direction: placement.direction,
        },
      ];
    }),
  };
};
