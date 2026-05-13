import { describe, expect, it } from 'vitest';
import { canStartFromParse, parseWordListInput } from './wordListInputParser';

describe('wordListInputParser', () => {
  it('parses words with optional clues and ignores empty lines', () => {
    const result = parseWordListInput(`
PYTHON A programming language

HONOR
画蛇添足 多此一举
`);

    expect(result.entries).toEqual([
      { word: 'PYTHON', clue: 'A programming language' },
      { word: 'HONOR', clue: '' },
      { word: '画蛇添足', clue: '多此一举' },
    ]);
    expect(result.issues).toEqual([]);
    expect(result.nonEmptyLineCount).toBe(3);
    expect(canStartFromParse(result)).toBe(true);
  });

  it('normalizes lowercase English inside mixed Chinese words', () => {
    const result = parseWordListInput('ai智能 mixed clue\nreact front end');

    expect(result.entries).toEqual([
      { word: 'AI智能', clue: 'mixed clue' },
      { word: 'REACT', clue: 'front end' },
    ]);
    expect(result.issues).toEqual([]);
  });

  it('rejects illegal characters without silently dropping lines', () => {
    const result = parseWordListInput('HTML5 web\nC++ language\nREACT ui');

    expect(result.entries).toEqual([{ word: 'REACT', clue: 'ui' }]);
    expect(result.issues).toEqual([
      { lineNumber: 1, text: 'HTML5 web', reason: '词只能包含中文或英文字母' },
      { lineNumber: 2, text: 'C++ language', reason: '词只能包含中文或英文字母' },
    ]);
    expect(canStartFromParse(result)).toBe(false);
  });

  it('rejects one-character words', () => {
    const result = parseWordListInput('A letter\n我 self\nGO valid');

    expect(result.entries).toEqual([{ word: 'GO', clue: 'valid' }]);
    expect(result.issues).toEqual([
      { lineNumber: 1, text: 'A letter', reason: '词至少需要 2 个字符' },
      { lineNumber: 2, text: '我 self', reason: '词至少需要 2 个字符' },
    ]);
  });

  it('rejects duplicate normalized words', () => {
    const result = parseWordListInput('Python language\npython duplicate\nPYTHON another duplicate\nREACT ui');

    expect(result.entries).toEqual([
      { word: 'PYTHON', clue: 'language' },
      { word: 'REACT', clue: 'ui' },
    ]);
    expect(result.issues).toEqual([
      { lineNumber: 2, text: 'python duplicate', reason: '重复词：PYTHON' },
      { lineNumber: 3, text: 'PYTHON another duplicate', reason: '重复词：PYTHON' },
    ]);
    expect(canStartFromParse(result)).toBe(false);
  });

  it('requires at least two valid entries', () => {
    expect(canStartFromParse(parseWordListInput('PYTHON language'))).toBe(false);
    expect(canStartFromParse(parseWordListInput('PYTHON language\nREACT ui'))).toBe(true);
  });
});
