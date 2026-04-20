// 方向枚举 - 表示词语在网格中的放置/输入方向
export enum Direction {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

// 单个格子数据类
export interface Cell {
  readonly row: number;          // 所在行索引（从0开始）
  readonly col: number;          // 所在列索引（从0开始）
  char: string | null;            // 用户输入的字母，null表示尚未填写
  readonly solutionChar: string | null;  // 正确答案，null表示墙或未设置
  readonly isBlocked: boolean;   // 是否是墙格子，true=黑色不可填，false=白色可填
}

// 快捷属性：检查格子是否尚未输入
export function isEmpty(cell: Cell): boolean {
  return cell.char === null;
}

// 快捷属性：检查用户输入是否正确
export function isCorrect(cell: Cell): boolean {
  return cell.char === cell.solutionChar;
}

// 词语位置数据类
export interface WordPlacement {
  readonly id: number;           // 唯一标识符
  readonly word: string;         // 单词字符串，如"HELLO"
  readonly clue: string;         // 线索/提示文本
  readonly row: number;          // 起始格子行索引
  readonly col: number;          // 起始格子列索引
  readonly direction: Direction; // 词语方向（横/竖）
  readonly number: number;       // 编号
  readonly displayLabel: string; // 显示用标签
}

// 快捷属性：词语长度
export function getWordLength(word: WordPlacement): number {
  return word.word.length;
}

// 获取词语占据的所有格子坐标
export function getCells(word: WordPlacement): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < word.word.length; i++) {
    if (word.direction === Direction.HORIZONTAL) {
      cells.push([word.row, word.col + i]);
    } else {
      cells.push([word.row + i, word.col]);
    }
  }
  return cells;
}

// 线索数据类
export interface Clue {
  readonly number: number;       // 编号
  readonly word: string;         // 单词
  readonly clue: string;         // 线索
  readonly direction: Direction  // 方向
}

// 纵横字谜数据类
export interface Crossword {
  readonly rows: number;                          // 行数
  readonly cols: number;                          // 列数
  readonly grid: Cell[][];                        // 二维单元格矩阵，grid[row][col]访问
  readonly placements: WordPlacement[];            // 所有词语位置列表
  readonly clues: Clue[];                         // 所有线索列表
}

// 获取指定位置的词语
export function getWordAt(crossword: Crossword, row: number, col: number, direction?: Direction): WordPlacement | undefined {
  return crossword.placements.find(placement => {
    const cells = getCells(placement);
    const contains = cells.some(([r, c]) => r === row && c === col);
    return contains && (direction === undefined || placement.direction === direction);
  });
}

// 获取指定位置的所有词语
export function getWordsAt(crossword: Crossword, row: number, col: number): WordPlacement[] {
  const cell: [number, number] = [row, col];
  return crossword.placements.filter(placement => {
    return getCells(placement).some(([r, c]) => r === row && c === col);
  });
}

// 检查是否全部填满
export function isFilled(crossword: Crossword): boolean {
  return crossword.grid.flat()
    .filter(cell => !cell.isBlocked)
    .every(cell => !isEmpty(cell));
}

// 检查是否全部正确
export function isSolved(crossword: Crossword): boolean {
  return crossword.grid.flat()
    .filter(cell => !cell.isBlocked)
    .every(cell => isCorrect(cell));
}

// 统计正确率
export function getCorrectRate(crossword: Crossword): number {
  const cells = crossword.grid.flat().filter(cell => !cell.isBlocked);
  if (cells.length === 0) return 1;
  const correct = cells.filter(cell => isCorrect(cell)).length;
  return correct / cells.length;
}