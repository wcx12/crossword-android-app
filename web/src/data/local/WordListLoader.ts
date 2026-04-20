import { WordEntry, fromLine, getWordChars } from '../model/WordEntry';

export async function loadWordList(): Promise<WordEntry[]> {
  try {
    const response = await fetch('/wordlists/python_xword.txt');
    const text = await response.text();
    return parseWordList(text);
  } catch (error) {
    console.error('Failed to load word list:', error);
    return [];
  }
}

/**
 * parseWordList - 解析词库文本
 * 与Android版本的WordFileParser.parse完全一致
 */
export function parseWordList(text: string): WordEntry[] {
  const lines = text.split('\n');
  return lines
    .map(line => {
      const entry = fromLine(line);
      if (!entry) return null;
      const word = /[\u4e00-\u9fff]/u.test(entry.word) ? entry.word : entry.word.toUpperCase();
      return { ...entry, word, length: getWordChars(word).length };
    })
    .filter((entry): entry is WordEntry => entry !== null);
}
