/**
 * WordEntry - 词条数据类
 *
 * 表示一个单词及其对应的线索
 *
 * 与Android版本的WordEntry完全一致
 */
export interface WordEntry {
  word: string;  // 单词
  clue: string;  // 线索
  length: number; // 单词长度
}

export function getWordChars(word: string): string[] {
  return Array.from(word);
}

export function isValidWordText(word: string): boolean {
  return getWordChars(word).every(c => /[a-zA-Z\u4e00-\u9fff]/u.test(c));
}

/**
 * fromLine - 从行解析WordEntry
 *
 * 支持两种格式：
 * 1. "word clue" - 空格分隔，clue可以包含多个空格
 * 2. "word" - 只有单词，clue为空
 *
 * 与Android版本的WordEntry.fromLine完全一致
 */
export function fromLine(line: string): WordEntry | null {
  const trimmed = line.trim();

  // 空行返回null
  if (trimmed.length === 0) return null;

  // 按空白字符分割
  const parts = trimmed.split(/\s+/);

  // 第一个部分是单词，保持原始大小写
  const word = parts[0];

  // 验证单词只包含英文或汉字
  if (!isValidWordText(word)) {
    return null;
  }

  // 剩余部分是线索
  const clue = parts.length > 1 ? parts.slice(1).join(' ') : '';

  return {
    word,
    clue,
    length: getWordChars(word).length
  };
}
