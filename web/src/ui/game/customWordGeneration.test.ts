import { describe, expect, it } from 'vitest';
import { generateCustomWordPuzzle } from './customWordGeneration';

describe('customWordGeneration', () => {
  const disconnectedEntries = [
    { word: 'CAT', clue: 'animal' },
    { word: 'DOG', clue: 'animal' },
  ];

  it('rejects disconnected word lists in strict mode', () => {
    const result = generateCustomWordPuzzle(disconnectedEntries, 13, 13, {
      requireAllWords: true,
      timeLimitSeconds: 0.05,
    });

    expect(result.ok).toBe(false);
    expect(result.totalCount).toBe(2);
    expect(result.placedCount).toBe(1);
    expect(result.missingWords).toEqual(['DOG']);
    expect(result.placedEntries).toEqual([{ word: 'CAT', clue: 'animal' }]);
  });

  it('allows best-effort partial generation when strict mode is disabled', () => {
    const result = generateCustomWordPuzzle(disconnectedEntries, 13, 13, {
      requireAllWords: false,
      timeLimitSeconds: 0.05,
    });

    expect(result.ok).toBe(true);
    expect(result.totalCount).toBe(2);
    expect(result.placedCount).toBe(1);
    expect(result.missingWords).toEqual(['DOG']);
    expect(result.placedEntries).toEqual([{ word: 'CAT', clue: 'animal' }]);
  });

  it('accepts a strict list when every word can be placed', () => {
    const result = generateCustomWordPuzzle([
      { word: 'CAT', clue: 'animal' },
      { word: 'TAR', clue: 'black material' },
    ], 13, 13, {
      requireAllWords: true,
      timeLimitSeconds: 0.05,
    });

    expect(result.ok).toBe(true);
    expect(result.placedCount).toBe(2);
    expect(result.missingWords).toEqual([]);
  });
});
