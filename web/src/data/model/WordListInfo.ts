/**
 * 词表信息接口
 */
export interface WordListInfo {
  id: string;           // 唯一标识
  name: string;         // 显示名称
  filePath: string;     // 文件路径（自定义词表为空）
  wordCount: number;    // 单词数量
  isSystem: boolean;    // 是否为系统词库（系统词库不可删除）
  language?: 'en' | 'zh';
}

/**
 * 当前可用的词表列表
 * 后续可以扩展为从服务器加载或用户自定义
 */
export const WORD_LISTS: WordListInfo[] = [
  {
    id: 'python_xword',
    name: 'Monty Python 主题',
    filePath: '/wordlists/python_xword.txt',
    wordCount: 31,
    isSystem: true,
    language: 'en',
  },
  {
    id: 'general_knowledge',
    name: '常识词汇',
    filePath: '/wordlists/general_knowledge.txt',
    wordCount: 68,
    isSystem: true,
    language: 'en',
  },
  {
    id: 'chinese_idioms',
    name: '中文成语',
    filePath: '/wordlists/chinese_idioms_core.txt',
    wordCount: 5000,
    isSystem: true,
    language: 'zh',
  },
];

/**
 * 根据ID获取词表信息
 */
export function getWordListById(id: string): WordListInfo | undefined {
  return WORD_LISTS.find(w => w.id === id);
}
