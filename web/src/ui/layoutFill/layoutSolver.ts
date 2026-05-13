import { analyzeLayout, type LayoutAnalysis, type LayoutMatrix, type LayoutSlot } from './layoutAnalysis';

export interface LayoutEntry {
  word: string;
  clue?: string;
}

export interface LayoutSolvedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

export type LayoutSolveFailureReason =
  | 'noSlots'
  | 'disconnectedLayout'
  | 'insufficientWordsByLength'
  | 'noCandidatesForSlot'
  | 'noSolution';

export type LayoutSolveResult =
  | {
      ok: true;
      analysis: LayoutAnalysis;
      grid: { isBlack: boolean; letter: string }[][];
      words: LayoutSolvedWord[];
    }
  | {
      ok: false;
      analysis: LayoutAnalysis;
      reason: LayoutSolveFailureReason;
      message: string;
      details?: unknown;
    };

interface Candidate {
  word: string;
  chars: string[];
  clue: string;
}

type LetterGrid = string[][];

export function solveLayout(layout: LayoutMatrix, entries: LayoutEntry[]): LayoutSolveResult {
  const analysis = analyzeLayout(layout);

  if (analysis.slots.length === 0) {
    return failure(analysis, 'noSlots', '布局中没有长度至少为 2 的可填位置。');
  }

  if (!analysis.isConnected) {
    return failure(analysis, 'disconnectedLayout', '布局不是单一连通区域，请让填词位置通过交叉格相连。');
  }

  const candidatesByLength = groupCandidatesByLength(entries);
  const missingLengths = Object.keys(analysis.lengthRequirements)
    .map(Number)
    .filter(length => (candidatesByLength.get(length)?.length ?? 0) === 0);
  if (missingLengths.length > 0) {
    return failure(analysis, 'noCandidatesForSlot', '词库中缺少当前布局需要的词长。', {
      lengths: missingLengths,
    });
  }

  const insufficientLengths = Object.entries(analysis.lengthRequirements)
    .map(([length, required]) => ({
      length: Number(length),
      required,
      available: candidatesByLength.get(Number(length))?.length ?? 0,
    }))
    .filter(item => item.available < item.required);
  if (insufficientLengths.length > 0) {
    return failure(analysis, 'insufficientWordsByLength', '词库中的可用词数量不足，无法填满当前布局。', {
      lengths: insufficientLengths,
    });
  }

  const assignments = new Map<string, Candidate>();
  const usedWords = new Set<string>();
  const letters = createEmptyLetterGrid(layout);
  const solved = backtrack(analysis.slots, candidatesByLength, assignments, usedWords, letters);

  if (!solved) {
    return failure(analysis, 'noSolution', '没有找到同时满足交叉约束且不重复用词的填法。');
  }

  return {
    ok: true,
    analysis,
    grid: layout.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        isBlack: cell.isBlack,
        letter: cell.isBlack ? '' : letters[rowIndex]?.[colIndex] ?? '',
      }))
    ),
    words: analysis.slots.map(slot => {
      const candidate = assignments.get(slot.id);
      return {
        word: candidate?.word ?? '',
        clue: candidate?.clue ?? '',
        row: slot.row,
        col: slot.col,
        direction: slot.direction,
      };
    }),
  };
}

function backtrack(
  slots: LayoutSlot[],
  candidatesByLength: Map<number, Candidate[]>,
  assignments: Map<string, Candidate>,
  usedWords: Set<string>,
  letters: LetterGrid
): boolean {
  if (assignments.size === slots.length) return true;

  const next = selectMostConstrainedSlot(slots, candidatesByLength, assignments, usedWords, letters);
  if (!next || next.candidates.length === 0) return false;

  for (const candidate of next.candidates) {
    const changedCells = placeCandidate(next.slot, candidate, letters);
    if (!changedCells) continue;

    assignments.set(next.slot.id, candidate);
    usedWords.add(candidate.word);

    if (backtrack(slots, candidatesByLength, assignments, usedWords, letters)) return true;

    assignments.delete(next.slot.id);
    usedWords.delete(candidate.word);
    changedCells.forEach(cell => {
      letters[cell.row][cell.col] = '';
    });
  }

  return false;
}

function selectMostConstrainedSlot(
  slots: LayoutSlot[],
  candidatesByLength: Map<number, Candidate[]>,
  assignments: Map<string, Candidate>,
  usedWords: Set<string>,
  letters: LetterGrid
): { slot: LayoutSlot; candidates: Candidate[] } | null {
  let best: { slot: LayoutSlot; candidates: Candidate[] } | null = null;

  for (const slot of slots) {
    if (assignments.has(slot.id)) continue;
    const candidates = (candidatesByLength.get(slot.length) ?? [])
      .filter(candidate => !usedWords.has(candidate.word))
      .filter(candidate => fitsSlot(slot, candidate, letters));

    if (!best || candidates.length < best.candidates.length) {
      best = { slot, candidates };
    }
  }

  return best;
}

function fitsSlot(slot: LayoutSlot, candidate: Candidate, letters: LetterGrid): boolean {
  return slot.cells.every((cell, index) => {
    const existing = letters[cell.row]?.[cell.col] ?? '';
    return existing === '' || existing === candidate.chars[index];
  });
}

function placeCandidate(
  slot: LayoutSlot,
  candidate: Candidate,
  letters: LetterGrid
): { row: number; col: number }[] | null {
  if (!fitsSlot(slot, candidate, letters)) return null;

  const changedCells: { row: number; col: number }[] = [];
  slot.cells.forEach((cell, index) => {
    if (letters[cell.row][cell.col] === '') {
      changedCells.push(cell);
      letters[cell.row][cell.col] = candidate.chars[index];
    }
  });

  return changedCells;
}

function groupCandidatesByLength(entries: LayoutEntry[]): Map<number, Candidate[]> {
  const seenWords = new Set<string>();
  const candidatesByLength = new Map<number, Candidate[]>();

  entries.forEach(entry => {
    const word = normalizeWord(entry.word);
    if (!word || seenWords.has(word)) return;
    seenWords.add(word);

    const candidate = {
      word,
      chars: Array.from(word),
      clue: entry.clue?.trim() ?? '',
    };
    const candidates = candidatesByLength.get(candidate.chars.length) ?? [];
    candidates.push(candidate);
    candidatesByLength.set(candidate.chars.length, candidates);
  });

  return candidatesByLength;
}

function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

function createEmptyLetterGrid(layout: LayoutMatrix): LetterGrid {
  return layout.map(row => row.map(() => ''));
}

function failure(
  analysis: LayoutAnalysis,
  reason: LayoutSolveFailureReason,
  message: string,
  details?: unknown
): LayoutSolveResult {
  return {
    ok: false,
    analysis,
    reason,
    message,
    details,
  };
}
