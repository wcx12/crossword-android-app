import { WordEntry, getWordChars } from '../../data/model/WordEntry';

export interface SearchParams {
  pattern?: string;      // "_O__E" 格式，下划线表示未知
  length?: number;       // 单词长度
  startsWith?: string;   // 首位字母
  endsWith?: string;     // 末位字母
  wordList: WordEntry[]; // 要搜索的词表
}

/**
 * 搜索匹配单词
 * @param params 搜索参数
 * @returns 匹配到的单词列表
 */
export function searchWords(params: SearchParams): WordEntry[] {
  const { pattern, length, startsWith, endsWith, wordList } = params;

  return wordList.filter(word => {
    const wordChars = getWordChars(word.word);

    // 长度过滤
    if (length !== undefined && wordChars.length !== length) {
      return false;
    }

    // 首位过滤
    if (startsWith && wordChars[0]?.toUpperCase() !== startsWith.toUpperCase()) {
      return false;
    }

    // 末位过滤
    if (endsWith && wordChars[wordChars.length - 1]?.toUpperCase() !== endsWith.toUpperCase()) {
      return false;
    }

    // 位置模式匹配
    if (pattern) {
      const patternChars = getWordChars(pattern.toUpperCase());
      const wordUpperChars = getWordChars(word.word.toUpperCase());

      // 长度必须匹配
      if (wordUpperChars.length !== patternChars.length) {
        return false;
      }

      // 逐字符匹配
      for (let i = 0; i < patternChars.length; i++) {
        const p = patternChars[i];
        const w = wordUpperChars[i];

        // 下划线表示未知位置，跳过
        if (p === '_') continue;

        // 其他字符必须精确匹配
        if (p !== w) return false;
      }
    }

    return true;
  });
}

/**
 * 验证模式格式是否有效
 */
export function isValidPattern(pattern: string): boolean {
  if (!pattern) return true; // 空模式有效

  const patternUpper = pattern.toUpperCase();
  for (const char of getWordChars(patternUpper)) {
    if (char !== '_' && !/[A-Z\u4e00-\u9fff]/u.test(char)) {
      return false;
    }
  }
  return true;
}

/**
 * 获取模式中已知字符的数量
 */
export function getKnownCharCount(pattern: string): number {
  if (!pattern) return 0;
  return getWordChars(pattern.toUpperCase()).filter(c => c !== '_').length;
}
