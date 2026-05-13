import { Crossword } from '../../domain/model/crossword';
import { CrosswordGenerator } from '../../domain/usecase/CrosswordGenerator';
import { getWordChars, WordEntry } from '../../data/model/WordEntry';
import { selectChineseCandidateWords } from '../../domain/usecase/ChineseCandidateSelector';

export interface CustomWordSourceEntry {
  word: string;
  clue: string;
}

export type GameWordSource =
  | { type: 'file'; filePath: string }
  | { type: 'customWords'; entries: CustomWordSourceEntry[] };

export interface CustomWordGenerationOptions {
  requireAllWords?: boolean;
  timeLimitSeconds?: number;
}

export interface CustomWordGenerationResult {
  ok: boolean;
  crossword: Crossword | null;
  placedEntries: CustomWordSourceEntry[];
  missingEntries: CustomWordSourceEntry[];
  placedWords: string[];
  missingWords: string[];
  placedCount: number;
  totalCount: number;
  requireAllWords: boolean;
  message: string | null;
}

export function hasHanText(text: string): boolean {
  return /[\u4e00-\u9fff]/u.test(text);
}

export function normalizeWordForGenerator(word: string): string {
  return Array.from(word.trim())
    .map(char => (hasHanText(char) ? char : char.toUpperCase()))
    .join('');
}

export function resolveNewGameSource(currentSource: GameWordSource, filePath?: string): GameWordSource {
  return filePath ? { type: 'file', filePath } : currentSource;
}

export function toGeneratorWords(entries: CustomWordSourceEntry[]): WordEntry[] {
  return entries.map(entry => {
    const word = normalizeWordForGenerator(entry.word);
    return {
      word,
      clue: entry.clue,
      length: getWordChars(word).length,
    };
  });
}

export function generateCustomWordPuzzle(
  entries: CustomWordSourceEntry[],
  rows: number,
  cols: number,
  options: CustomWordGenerationOptions = {}
): CustomWordGenerationResult {
  const requireAllWords = options.requireAllWords ?? false;
  const sourceEntries = entries.map(entry => ({
    word: normalizeWordForGenerator(entry.word),
    clue: entry.clue,
  }));
  const allWords = toGeneratorWords(sourceEntries);
  const hasChineseWords = allWords.some(entry => hasHanText(entry.word));
  const generatorWords = hasChineseWords && !requireAllWords
    ? selectChineseCandidateWords(allWords, 80)
    : allWords;
  const crossword = new CrosswordGenerator(rows, cols).generate(
    generatorWords,
    options.timeLimitSeconds ?? 3
  );
  const placedWordSet = new Set(
    (crossword?.placements ?? []).map(placement => normalizeWordForGenerator(placement.word))
  );
  const placedEntries = sourceEntries.filter(entry => placedWordSet.has(entry.word));
  const missingEntries = sourceEntries.filter(entry => !placedWordSet.has(entry.word));
  const ok = crossword !== null && (!requireAllWords || missingEntries.length === 0);

  return {
    ok,
    crossword,
    placedEntries,
    missingEntries,
    placedWords: placedEntries.map(entry => entry.word),
    missingWords: missingEntries.map(entry => entry.word),
    placedCount: placedEntries.length,
    totalCount: sourceEntries.length,
    requireAllWords,
    message: ok ? null : getGenerationFailureMessage(crossword, placedEntries.length, sourceEntries.length),
  };
}

function getGenerationFailureMessage(
  crossword: Crossword | null,
  placedCount: number,
  totalCount: number
): string {
  if (!crossword) {
    return '无法生成谜题，请尝试更多可以相互交叉的词。';
  }

  return `无法用全部词生成连通谜题，已成功放入 ${placedCount}/${totalCount} 个词。`;
}
