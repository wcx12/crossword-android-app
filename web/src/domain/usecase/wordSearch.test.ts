import { describe, expect, it } from 'vitest';
import { isValidPattern, searchWords } from './wordSearch';
import { WordEntry } from '../../data/model/WordEntry';

describe('wordSearch', () => {
  const idioms: WordEntry[] = [
    { word: '画蛇添足', clue: '比喻多此一举。', length: 4 },
    { word: '杯弓蛇影', clue: '比喻疑神疑鬼。', length: 4 },
    { word: '打草惊蛇', clue: '比喻行动不慎惊动对方。', length: 4 },
  ];

  it('accepts Chinese characters and underscores in position patterns', () => {
    expect(isValidPattern('画_添_')).toBe(true);
    expect(isValidPattern('_蛇__')).toBe(true);
  });

  it('matches Chinese idioms by known character positions', () => {
    const results = searchWords({ wordList: idioms, pattern: '_蛇__' });

    expect(results.map(entry => entry.word)).toEqual(['画蛇添足']);
  });

  it('matches Chinese idioms by first and last character', () => {
    const results = searchWords({ wordList: idioms, startsWith: '杯', endsWith: '影' });

    expect(results.map(entry => entry.word)).toEqual(['杯弓蛇影']);
  });
});
