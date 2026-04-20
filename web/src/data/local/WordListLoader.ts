import { WordEntry, fromLine } from '../model/WordEntry';

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
function parseWordList(text: string): WordEntry[] {
  const lines = text.split('\n');
  return lines.map(line => fromLine(line)).filter((entry): entry is WordEntry => entry !== null);
}