import { describe, expect, it } from 'vitest';
import { fromLine } from './WordEntry';

describe('fromLine', () => {
  it('parses a four-character Chinese idiom and counts Han characters', () => {
    const entry = fromLine('画蛇添足 比喻多此一举，反而坏事。');

    expect(entry).toEqual({
      word: '画蛇添足',
      clue: '比喻多此一举，反而坏事。',
      length: 4,
    });
  });
});
