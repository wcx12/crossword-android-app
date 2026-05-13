export interface WordListInputEntry {
  word: string;
  clue: string;
}

export interface WordListInputIssue {
  lineNumber: number;
  text: string;
  reason: string;
}

export interface WordListInputParseResult {
  entries: WordListInputEntry[];
  issues: WordListInputIssue[];
  nonEmptyLineCount: number;
}

function isHan(char: string): boolean {
  return /[\u4e00-\u9fff]/u.test(char);
}

function isLatinLetter(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

export function normalizeImportedWord(word: string): string {
  return Array.from(word.trim())
    .map(char => (isHan(char) ? char : char.toUpperCase()))
    .join('');
}

function isValidImportedWord(word: string): boolean {
  return Array.from(word).every(char => isHan(char) || isLatinLetter(char));
}

export function parseWordListInput(text: string): WordListInputParseResult {
  const entries: WordListInputEntry[] = [];
  const issues: WordListInputIssue[] = [];
  const seenWords = new Set<string>();
  let nonEmptyLineCount = 0;

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    nonEmptyLineCount += 1;
    const lineNumber = index + 1;
    const [rawWord, ...clueParts] = trimmed.split(/\s+/);
    const normalizedWord = normalizeImportedWord(rawWord);

    if (!isValidImportedWord(normalizedWord)) {
      issues.push({ lineNumber, text: trimmed, reason: '词只能包含中文或英文字母' });
      return;
    }

    if (Array.from(normalizedWord).length < 2) {
      issues.push({ lineNumber, text: trimmed, reason: '词至少需要 2 个字符' });
      return;
    }

    if (seenWords.has(normalizedWord)) {
      issues.push({ lineNumber, text: trimmed, reason: `重复词：${normalizedWord}` });
      return;
    }

    seenWords.add(normalizedWord);
    entries.push({
      word: normalizedWord,
      clue: clueParts.join(' '),
    });
  });

  return { entries, issues, nonEmptyLineCount };
}

export function canStartFromParse(result: WordListInputParseResult): boolean {
  return result.entries.length >= 2 && result.issues.length === 0;
}
