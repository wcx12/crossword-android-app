import { WordEntry, getWordChars } from '../../data/model/WordEntry';

const HIGH_FREQUENCY_CHARS = new Set(['不', '之', '一', '无', '有', '人', '如', '大', '天']);

export function selectChineseCandidateWords(words: WordEntry[], targetCount: number = 60): WordEntry[] {
  if (words.length <= targetCount) return words;

  const charCounts = new Map<string, number>();
  for (const entry of words) {
    for (const char of new Set(getWordChars(entry.word))) {
      charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
    }
  }

  const scored = words.map((entry, index) => {
    const chars = new Set(getWordChars(entry.word));
    let score = 0;

    for (const char of chars) {
      const count = charCounts.get(char) ?? 0;
      score += HIGH_FREQUENCY_CHARS.has(char) ? count * 0.25 : count;
    }

    const clueLength = getWordChars(entry.clue).length;
    if (clueLength >= 6 && clueLength <= 45) score += 4;
    if (getWordChars(entry.word).length === 4) score += 8;

    return { entry, index, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, targetCount)
    .map(item => item.entry);
}

export function getCandidateChars(crosswordWords: WordEntry[] | string[]): string[] {
  const chars = new Set<string>();
  for (const item of crosswordWords) {
    const word = typeof item === 'string' ? item : item.word;
    for (const char of getWordChars(word)) {
      chars.add(char);
    }
  }

  return Array.from(chars).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}
