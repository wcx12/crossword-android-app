import { describe, expect, it } from 'vitest';
import { resolveNewGameSource, toGeneratorWords, type GameWordSource } from './GameViewModel';

describe('GameViewModel word source helpers', () => {
  it('keeps the current custom word source when starting a new game without switching lists', () => {
    const customSource: GameWordSource = {
      type: 'customWords',
      entries: [
        { word: 'apple', clue: 'fruit' },
        { word: 'banana', clue: 'yellow fruit' },
      ],
    };

    expect(resolveNewGameSource(customSource)).toBe(customSource);
  });

  it('switches to a file word source when a new file path is provided', () => {
    const customSource: GameWordSource = {
      type: 'customWords',
      entries: [{ word: 'apple', clue: 'fruit' }],
    };

    expect(resolveNewGameSource(customSource, '/wordlists/python_xword.txt')).toEqual({
      type: 'file',
      filePath: '/wordlists/python_xword.txt',
    });
  });

  it('normalizes custom words before sending them to the generator', () => {
    expect(toGeneratorWords([{ word: 'react', clue: 'ui' }])).toEqual([
      { word: 'REACT', clue: 'ui', length: 5 },
    ]);
  });
});
