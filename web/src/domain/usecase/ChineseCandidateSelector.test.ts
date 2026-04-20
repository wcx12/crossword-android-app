import { describe, expect, it } from 'vitest';
import { selectChineseCandidateWords } from './ChineseCandidateSelector';
import { WordEntry } from '../../data/model/WordEntry';

describe('selectChineseCandidateWords', () => {
  it('selects a crossword-friendly cluster around shared Han characters', () => {
    const words: WordEntry[] = [
      { word: '画蛇添足', clue: '比喻多此一举。', length: 4 },
      { word: '杯弓蛇影', clue: '比喻疑神疑鬼。', length: 4 },
      { word: '打草惊蛇', clue: '比喻行动不慎惊动对方。', length: 4 },
      { word: '虎头蛇尾', clue: '比喻开始声势大后来劲头小。', length: 4 },
      { word: '狐假虎威', clue: '比喻仗势欺人。', length: 4 },
      { word: '风花雪月', clue: '泛指诗文里的景物。', length: 4 },
      { word: '刻舟求剑', clue: '比喻拘泥成法。', length: 4 },
    ];

    const selected = selectChineseCandidateWords(words, 4);

    expect(new Set(selected.map(entry => entry.word))).toEqual(new Set([
      '画蛇添足',
      '杯弓蛇影',
      '打草惊蛇',
      '虎头蛇尾',
    ]));
    expect(selected.map(entry => entry.word)).not.toContain('风花雪月');
    expect(selected.map(entry => entry.word)).not.toContain('刻舟求剑');
  });
});
