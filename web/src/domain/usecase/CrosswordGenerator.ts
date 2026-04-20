import { WordEntry } from '../../data/model/WordEntry';
import { getWordChars } from '../../data/model/WordEntry';
import { Direction, Cell, Crossword, WordPlacement } from '../model/crossword';

// 类型别名
type Char = string;
type Grid = Char[][];

// 字母坐标映射
type LetCoords = Map<Char, [number, number, boolean][]>;

// 位置信息
interface PlacementInfo {
  row: number;
  col: number;
  direction: Direction;
  score: number;
}

/**
 * CrosswordGenerator - 纵横字谜谜题生成器
 *
 * 使用贪心算法在有限时间内生成纵横字谜
 * 从Android版本的Kotlin一一对应移植
 */
export class CrosswordGenerator {
  private rows: number;
  private cols: number;
  private emptyChar: Char = '-';

  // 可用词库
  private availableWords: WordEntry[] = [];

  // 当前成功放置的词列表
  private currentWordlist: WordEntry[] = [];

  // 当前网格状态
  private grid: Grid = [];

  // 字母坐标映射
  private letCoords: LetCoords = new Map();

  // 历史最佳词列表
  private bestWordlist: WordEntry[] = [];

  // 历史最佳网格
  private bestGrid: Grid = [];

  constructor(rows: number = 15, cols: number = 15) {
    this.rows = rows;
    this.cols = cols;
  }

  /**
   * generate - 生成纵横字谜
   * 与Kotlin版本完全一致
   */
  generate(words: WordEntry[], timeLimit: number = 1): Crossword | null {
    if (words.length < 2) return null;

    // 复制词库（深拷贝）
    this.availableWords = words.map(w => ({ ...w }));

    // 重置最佳解
    this.bestWordlist = [];

    // 记录时间
    const startTime = Date.now();
    const endTime = startTime + timeLimit * 1000;

    while (Date.now() < endTime) {
      // 重置并放置第一个词
      this.prepGridWords();

      // 贪心添加 - 两轮遍历
      for (let round = 0; round < 2; round++) {
        for (const word of this.availableWords) {
          // 只尝试未放置的词
          if (!this.currentWordlist.some(w => w.word === word.word)) {
            this.addWord(word);
          }
        }
      }

      // 更新最佳解
      if (this.currentWordlist.length > this.bestWordlist.length) {
        // 深拷贝当前方案
        this.bestWordlist = [...this.currentWordlist];
        this.bestGrid = this.grid.map(row => [...row]);
      }

      // 找到完美解，提前终止
      if (this.bestWordlist.length === this.availableWords.length) {
        break;
      }
    }

    // 构建并返回谜题对象
    return this.buildCrossword();
  }

  /**
   * prepGridWords - 准备网格和初始词
   * 与Kotlin版本完全一致
   */
  private prepGridWords(): void {
    // 清空当前词列表
    this.currentWordlist = [];

    // 清空交叉点索引
    this.letCoords.clear();

    // 初始化rows x cols的空网格
    this.grid = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(this.emptyChar)
    );

    // 如果词库不为空，放置第一个词
    if (this.availableWords.length > 0) {
      // availableWords已按长度降序排序
      this.placeFirstWord(this.availableWords[0]);
    }
  }

  /**
   * findPossiblePositions - 查找可能的放置位置
   * 与Kotlin版本完全一致
   */
  private findPossiblePositions(word: WordEntry): PlacementInfo | null {
    const wordChars = getWordChars(word.word);
    const wordLength = wordChars.length;
    const coordList: PlacementInfo[] = [];

    // 阶段1：收集所有交叉点
    const tempList: [number, [number, number, boolean][]][] = [];
    for (let i = 0; i < wordChars.length; i++) {
      const letter = wordChars[i];
      const coords = this.letCoords.get(letter);
      if (coords) {
        for (const coord of coords) {
          tempList.push([i, [coord]]);
        }
      }
    }

    // 阶段2：评估每个交叉点
    for (const [letterIndex, coords] of tempList) {
      for (const [row, col, vert] of coords) {
        if (vert) {
          // 交叉点是垂直词 -> 尝试水平放置
          if (col - letterIndex >= 0 && col - letterIndex + wordLength <= this.cols) {
            const score = this.scoreHorizontal(word, row, col - letterIndex, wordLength);
            if (score > 0) {
              coordList.push({
                row,
                col: col - letterIndex,
                direction: Direction.HORIZONTAL,
                score
              });
            }
          }
        } else {
          // 交叉点是水平词 -> 尝试垂直放置
          if (row - letterIndex >= 0 && row - letterIndex + wordLength <= this.rows) {
            const score = this.scoreVertical(word, row - letterIndex, col, wordLength);
            if (score > 0) {
              coordList.push({
                row: row - letterIndex,
                col,
                direction: Direction.VERTICAL,
                score
              });
            }
          }
        }
      }
    }

    // 返回得分最高的位置 - 与Kotlin的maxByOrNull完全一致
    let best: PlacementInfo | null = null;
    for (const info of coordList) {
      if (best === null || info.score > best.score) {
        best = info;
      }
    }
    return best;
  }

  /**
   * placeFirstWord - 放置第一个词
   * 与Kotlin版本完全一致
   */
  private placeFirstWord(word: WordEntry): void {
    // 随机选择方向
    const vertical = Math.random() > 0.5;

    // 计算最大起始位置（虽然没用到，但保持与Kotlin一致）
    const maxPos = vertical ? this.rows - word.length : this.cols - word.length;

    // 随机选择起始坐标
    const row = vertical
      ? Math.floor(Math.random() * (this.rows - word.length + 1))
      : Math.floor(Math.random() * this.rows);

    const col = vertical
      ? Math.floor(Math.random() * this.cols)
      : Math.floor(Math.random() * (this.cols - word.length + 1));

    // 执行放置
    this.placeWord(word, row, col, vertical);
  }

  /**
   * addWord - 添加词语到网格
   * 与Kotlin版本完全一致
   */
  private addWord(word: WordEntry): boolean {
    // 查找最佳位置
    const position = this.findPossiblePositions(word);
    if (!position) return false;

    // 放置到最佳位置
    this.placeWord(word, position.row, position.col, position.direction === Direction.VERTICAL);
    return true;
  }

  /**
   * scoreHorizontal - 计算水平方向得分
   * 与Kotlin版本完全一致
   */
  private scoreHorizontal(word: WordEntry, row: number, col: number, wordLength: number, baseScore: number = 1): number {
    const wordChars = getWordChars(word.word);
    // 检查左边是否有邻居
    if (col > 0 && this.grid[row][col - 1] !== this.emptyChar) return 0;
    // 检查右边是否有邻居
    if (col + wordLength < this.cols && this.grid[row][col + wordLength] !== this.emptyChar) return 0;

    let score = baseScore;

    // 遍历每个字母
    for (let i = 0; i < wordLength; i++) {
      const cell = this.grid[row][col + i];

      if (cell === this.emptyChar) {
        // 空格：检查上下是否有邻居
        if (row > 0 && this.grid[row - 1][col + i] !== this.emptyChar) return 0;
        if (row + 1 < this.rows && this.grid[row + 1][col + i] !== this.emptyChar) return 0;
      } else if (cell === wordChars[i]) {
        // 交叉点：得分+1
        score += 1;
      } else {
        // 冲突：不能放置
        return 0;
      }
    }
    return score;
  }

  /**
   * scoreVertical - 计算垂直方向得分
   * 与Kotlin版本完全一致
   */
  private scoreVertical(word: WordEntry, row: number, col: number, wordLength: number, baseScore: number = 1): number {
    const wordChars = getWordChars(word.word);
    // 检查上方是否有邻居
    if (row > 0 && this.grid[row - 1][col] !== this.emptyChar) return 0;
    // 检查下方是否有邻居
    if (row + wordLength < this.rows && this.grid[row + wordLength][col] !== this.emptyChar) return 0;

    let score = baseScore;

    for (let i = 0; i < wordLength; i++) {
      const cell = this.grid[row + i][col];

      if (cell === this.emptyChar) {
        // 检查左右
        if (col > 0 && this.grid[row + i][col - 1] !== this.emptyChar) return 0;
        if (col + 1 < this.cols && this.grid[row + i][col + 1] !== this.emptyChar) return 0;
      } else if (cell === wordChars[i]) {
        score += 1;
      } else {
        return 0;
      }
    }
    return score;
  }

  /**
   * placeWord - 将词语放置到网格中
   * 与Kotlin版本完全一致
   */
  private placeWord(word: WordEntry, row: number, col: number, vertical: boolean): void {
    // 添加到已放置列表
    this.currentWordlist.push(word);

    const horizontal = !vertical;

    // 逐字符放置
    const wordChars = getWordChars(word.word);
    for (let i = 0; i < wordChars.length; i++) {
      // 计算当前字母的实际位置
      const r = vertical ? row + i : row;
      const c = vertical ? col : col + i;

      // 写入网格
      this.grid[r][c] = wordChars[i];

      // 更新交叉点索引
      const coord: [number, number, boolean] = [r, c, vertical];
      const existing: [number, number, boolean] = [r, c, horizontal];

      let list = this.letCoords.get(wordChars[i]);
      if (!list) {
        list = [];
        this.letCoords.set(wordChars[i], list);
      }

      // 移除旧的反方向记录
      const existingIdx = list.findIndex(c => c[0] === existing[0] && c[1] === existing[1] && c[2] === existing[2]);
      if (existingIdx !== -1) {
        list.splice(existingIdx, 1);
      }
      // 添加新记录（如果不存在）
      if (!list.some(c => c[0] === coord[0] && c[1] === coord[1] && c[2] === coord[2])) {
        list.push(coord);
      }
    }
  }

  /**
   * buildCrossword - 构建Crossword对象
   * 与Kotlin版本完全一致
   */
  private buildCrossword(): Crossword | null {
    // 无解
    if (this.bestWordlist.length === 0) return null;

    // 构建Cell网格
    const cellGrid: Cell[][] = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          row: r,
          col: c,
          char: null,
          solutionChar: this.bestGrid[r][c] !== this.emptyChar ? this.bestGrid[r][c] : null,
          isBlocked: this.bestGrid[r][c] === this.emptyChar
        });
      }
      cellGrid.push(row);
    }

    // 找出所有词语位置并编号
    const placements = this.findPlacements();
    const clues = placements.map(p => ({ number: p.number, word: p.word, clue: p.clue, direction: p.direction }));

    return {
      rows: this.rows,
      cols: this.cols,
      grid: cellGrid,
      placements,
      clues
    };
  }

  /**
   * findPlacements - 找出所有词语位置
   * 与Kotlin版本完全一致
   */
  private findPlacements(): WordPlacement[] {
    const placements: WordPlacement[] = [];
    const seenPlacements = new Set<string>();

    // 按长度排序（先处理长词），长度相同按原顺序
    // 这与Kotlin的 compareBy({ it.length }, { bestWordlist.indexOf(it) }) 等价
    const indexedWords = this.bestWordlist.map((word, index) => ({ word, index }));
    const words = indexedWords
      .sort((a, b) => {
        if (a.word.length !== b.word.length) {
          return getWordChars(a.word.word).length - getWordChars(b.word.word).length;
        }
        return a.index - b.index;
      })
      .map(item => item.word);

    let number = 1;

    // 扫描网格
    for (const word of words) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          // 找到词的第一个字母
          const wordChars = getWordChars(word.word);
          if (this.bestGrid[r][c] !== wordChars[0]) continue;

          // 尝试水平匹配
          if (c + wordChars.length <= this.cols) {
            let match = true;
            for (let i = 0; i < wordChars.length; i++) {
              if (this.bestGrid[r][c + i] !== wordChars[i]) {
                match = false;
                break;
              }
            }
            if (match) {
              const key = `${word.word},${r},${c},HORIZONTAL`;
              if (seenPlacements.add(key)) {
                placements.push({
                  id: placements.length,
                  word: word.word,
                  clue: word.clue,
                  row: r,
                  col: c,
                  direction: Direction.HORIZONTAL,
                  number: number++,
                  displayLabel: ''
                });
              }
            }
          }

          // 尝试垂直匹配
          if (r + wordChars.length <= this.rows) {
            let match = true;
            for (let i = 0; i < wordChars.length; i++) {
              if (this.bestGrid[r + i][c] !== wordChars[i]) {
                match = false;
                break;
              }
            }
            if (match) {
              const key = `${word.word},${r},${c},VERTICAL`;
              if (seenPlacements.add(key)) {
                placements.push({
                  id: placements.length,
                  word: word.word,
                  clue: word.clue,
                  row: r,
                  col: c,
                  direction: Direction.VERTICAL,
                  number: number++,
                  displayLabel: ''
                });
              }
            }
          }
        }
      }
    }

    // 重新编号
    const horizontalPlacements = placements
      .filter(p => p.direction === Direction.HORIZONTAL)
      .sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });

    const verticalPlacements = placements
      .filter(p => p.direction === Direction.VERTICAL)
      .sort((a, b) => {
        if (a.col !== b.col) return a.col - b.col;
        return a.row - b.row;
      });

    const numberedPlacements: WordPlacement[] = [];

    // 水平词编号：1,2,3...
    let num = 1;
    for (const placement of horizontalPlacements) {
      numberedPlacements.push({ ...placement, number: num, displayLabel: String(num) });
      num++;
    }

    // 垂直词编号：A,B,C...
    let letterNum = 0;
    for (const placement of verticalPlacements) {
      const letter = String.fromCharCode(65 + letterNum);
      numberedPlacements.push({ ...placement, number: letterNum + 1, displayLabel: letter });
      letterNum++;
    }

    return numberedPlacements;
  }
}
