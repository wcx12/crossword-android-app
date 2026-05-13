# Word List Input Design

## Goal

Build the `输入词表生成` entry as a complete strict-import flow: users paste a word list, review parsed results and invalid lines, then start a game that is automatically saved into `我的词库`.

## Scope

- Replace the current placeholder page for `word-list`.
- Accept one word entry per line.
- The first whitespace-separated token is the word or idiom.
- Remaining text on the line is the optional clue.
- Empty lines are ignored.
- Words may contain English letters, Chinese characters, or a mix of both.
- Non-Chinese characters are normalized to uppercase.
- A word must contain at least two characters.
- Duplicate normalized words are invalid.
- Strict mode: any invalid line disables `开始游戏`.
- At least two valid entries are required.
- On success, call the existing custom-list flow so the list is saved to `我的词库` and the game starts.

## UI

- Use the same top-left return placement as the other pages.
- Use app-wide theme variables through the existing `pageStyles` helpers.
- Main area has a large paste textarea and a preview panel.
- Preview shows valid entries and invalid line reasons.
- The primary action is disabled until the import is valid.

## Testing

- Add parser unit tests for valid entries, empty lines, optional clues, normalization, illegal characters, short words, duplicates, and the minimum-entry rule.
- Run the full web test suite and production build after implementation.
