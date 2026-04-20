import { describe, expect, it } from 'vitest';
import { parseWordList } from './WordListLoader';

describe('parseWordList', () => {
  it('keeps Chinese idioms when loading word list details', () => {
    const entries = parseWordList([
      '画蛇添足 比喻多此一举，反而坏事。',
      '杯弓蛇影 比喻疑神疑鬼。',
    ].join('\n'));

    expect(entries.map(entry => entry.word)).toEqual(['画蛇添足', '杯弓蛇影']);
    expect(entries[0].length).toBe(4);
  });
});
