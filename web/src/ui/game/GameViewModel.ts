import { useState, useCallback, useRef, useEffect } from 'react';
import { Crossword, Direction, WordPlacement, isCorrect, getWordsAt, Cell, Clue } from '../../domain/model/crossword';
import { CrosswordGenerator } from '../../domain/usecase/CrosswordGenerator';
import { WordEntry } from '../../data/model/WordEntry';
import { getCandidateChars, selectChineseCandidateWords } from '../../domain/usecase/ChineseCandidateSelector';
import { parseWordList } from '../../data/local/WordListLoader';
import {
  CustomWordGenerationOptions,
  CustomWordGenerationResult,
  CustomWordSourceEntry,
  GameWordSource,
  generateCustomWordPuzzle,
  hasHanText,
  resolveNewGameSource,
  toGeneratorWords,
} from './customWordGeneration';

export {
  resolveNewGameSource,
  toGeneratorWords,
  type CustomWordGenerationResult,
  type CustomWordSourceEntry,
  type GameWordSource,
} from './customWordGeneration';

export interface GameState {
  isLoading: boolean;
  crossword: Crossword | null;
  selectedCell: [number, number] | null;
  currentDirection: Direction;
  currentWord: WordPlacement | null;
  currentWords: WordPlacement[];
  showSolution: boolean;
  isSolved: boolean;
  errorMessage: string | null;
  gridRows: number;
  gridCols: number;
  inputMode: 'letters' | 'candidateChars';
  candidateChars: string[];
}

const initialState: GameState = {
  isLoading: false,
  crossword: null,
  selectedCell: null,
  currentDirection: Direction.HORIZONTAL,
  currentWord: null,
  currentWords: [],
  showSolution: false,
  isSolved: false,
  errorMessage: null,
  gridRows: 13,
  gridCols: 13,
  inputMode: 'letters',
  candidateChars: [],
};

const DEFAULT_WORD_LIST_PATH = '/wordlists/python_xword.txt';

export function useGameViewModel() {
  const [state, setState] = useState<GameState>(initialState);
  const generatorRef = useRef<CrosswordGenerator>(new CrosswordGenerator(13, 13));
  const currentWordSourceRef = useRef<GameWordSource>({
    type: 'file',
    filePath: DEFAULT_WORD_LIST_PATH,
  });

  // 初始化 - 加载词库并开始新游戏
  useEffect(() => {
    loadAndGenerate(DEFAULT_WORD_LIST_PATH);
  }, []);

  // 加载词库并生成谜题
  const loadAndGenerate = (filePath: string, rows?: number, cols?: number) => {
    setState(prev => ({ ...prev, isLoading: true, errorMessage: null }));

    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        const words = parseWordList(text);
        if (words.length > 0) {
          generatePuzzle(words, rows, cols);
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            errorMessage: '无法解析词库',
          }));
        }
      })
      .catch(error => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          errorMessage: '无法加载词库: ' + error.message,
        }));
      });
  };

  const applyGeneratedCrossword = useCallback((crossword: Crossword, rows: number, cols: number) => {
    const inputMode = crossword.placements.some(placement => hasHanText(placement.word))
      ? 'candidateChars'
      : 'letters';

    setState(prev => ({
      ...prev,
      crossword,
      isLoading: false,
      isSolved: false,
      showSolution: false,
      selectedCell: null,
      currentWord: null,
      currentWords: [],
      gridRows: rows,
      gridCols: cols,
      inputMode,
      candidateChars: inputMode === 'candidateChars'
        ? getCandidateChars(crossword.placements.map(placement => placement.word))
        : [],
    }));
  }, []);

  // 生成谜题
  const generatePuzzle = useCallback((words: WordEntry[], rows?: number, cols?: number) => {
    setState(prev => ({ ...prev, isLoading: true, errorMessage: null }));

    // 使用 setTimeout 让 UI 有机会更新
    setTimeout(() => {
      const generator = generatorRef.current;
      const actualRows = rows ?? state.gridRows;
      const actualCols = cols ?? state.gridCols;

      // 使用新的尺寸重新创建生成器
      const newGenerator = new CrosswordGenerator(actualRows, actualCols);
      generatorRef.current = newGenerator;

      const inputMode = words.some(entry => hasHanText(entry.word)) ? 'candidateChars' : 'letters';
      const generatorWords = inputMode === 'candidateChars'
        ? selectChineseCandidateWords(words, 80)
        : words;
      const crossword = newGenerator.generate(generatorWords, 3);

      if (crossword) {
        applyGeneratedCrossword(crossword, actualRows, actualCols);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          errorMessage: '无法生成谜题，请尝试更多单词',
        }));
      }
    }, 50);
  }, [applyGeneratedCrossword, state.gridRows, state.gridCols]);

  // 开始新游戏
  const newGame = useCallback((rows?: number, cols?: number, filePath?: string) => {
    const nextSource = resolveNewGameSource(currentWordSourceRef.current, filePath);
    currentWordSourceRef.current = nextSource;

    if (nextSource.type === 'file') {
      loadAndGenerate(nextSource.filePath, rows, cols);
    } else {
      generatePuzzle(toGeneratorWords(nextSource.entries), rows, cols);
    }
  }, [generatePuzzle]);

  // 切换词表
  const switchWordList = useCallback((filePath: string, rows?: number, cols?: number) => {
    currentWordSourceRef.current = { type: 'file', filePath };
    loadAndGenerate(filePath, rows, cols);
  }, []);

  // 使用自定义词表生成谜题
  const setCustomWords = useCallback((
    entries: CustomWordSourceEntry[],
    rows?: number,
    cols?: number,
    options: CustomWordGenerationOptions = {}
  ): CustomWordGenerationResult => {
    const sourceEntries = entries.map(entry => ({ word: entry.word, clue: entry.clue }));
    const actualRows = rows ?? state.gridRows;
    const actualCols = cols ?? state.gridCols;
    const result = generateCustomWordPuzzle(sourceEntries, actualRows, actualCols, options);

    setState(prev => ({ ...prev, isLoading: true, errorMessage: null }));

    if (result.ok && result.crossword) {
      currentWordSourceRef.current = { type: 'customWords', entries: sourceEntries };
      generatorRef.current = new CrosswordGenerator(actualRows, actualCols);
      applyGeneratedCrossword(result.crossword, actualRows, actualCols);
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        errorMessage: result.message,
      }));
    }

    return result;
  }, [applyGeneratedCrossword, state.gridRows, state.gridCols]);

  // 设置网格尺寸
  const setGridSize = useCallback((rows: number, cols: number) => {
    setState(prev => ({ ...prev, gridRows: rows, gridCols: cols }));
  }, []);

  // 从编辑器加载自定义谜题
  const loadCustomPuzzle = useCallback((
    customGrid: { isBlack: boolean; letter: string }[][],
    customWords: { word: string; clue: string; row: number; col: number; direction: 'across' | 'down' }[]
  ) => {
    const rows = customGrid.length;
    const cols = customGrid[0]?.length || 0;
    currentWordSourceRef.current = {
      type: 'customWords',
      entries: customWords.map(word => ({ word: word.word, clue: word.clue })),
    };

    // 构建 Cell 网格
    const grid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          row: r,
          col: c,
          char: null,  // 用户输入为空
          solutionChar: customGrid[r][c].letter || null,
          isBlocked: customGrid[r][c].isBlack,
        };
      }
    }

    // 构建 WordPlacement
    let wordId = 1;
    const placements: WordPlacement[] = customWords.map((w, index) => ({
      id: wordId++,
      word: w.word,
      clue: w.clue,
      row: w.row,
      col: w.col,
      direction: w.direction === 'across' ? Direction.HORIZONTAL : Direction.VERTICAL,
      number: index + 1,
      displayLabel: String(index + 1),
    }));

    // 构建 clues
    const clues: Clue[] = placements.map(p => ({
      number: p.number,
      word: p.word,
      clue: p.clue,
      direction: p.direction,
    }));

    const crossword: Crossword = {
      rows,
      cols,
      grid,
      placements,
      clues,
    };

    setState(prev => ({
      ...prev,
      crossword,
      gridRows: rows,
      gridCols: cols,
      isLoading: false,
      isSolved: false,
      showSolution: false,
      selectedCell: null,
      currentWord: null,
      currentWords: [],
      inputMode: customWords.some(word => hasHanText(word.word)) ? 'candidateChars' : 'letters',
      candidateChars: customWords.some(word => hasHanText(word.word))
        ? getCandidateChars(customWords.map(word => word.word))
        : [],
    }));
  }, []);

  // 选择格子
  const selectCell = useCallback((row: number, col: number) => {
    const { crossword, currentDirection } = state;
    if (!crossword) return;

    const cell = crossword.grid[row]?.[col];
    if (!cell || cell.isBlocked) return;

    const wordsAtCell = getWordsAt(crossword, row, col);
    const newWord = wordsAtCell.find(w => w.direction === currentDirection) || wordsAtCell[0];
    const newDirection = newWord?.direction || currentDirection;

    setState(prev => ({
      ...prev,
      selectedCell: [row, col],
      currentDirection: newDirection,
      currentWord: newWord || null,
      currentWords: wordsAtCell,
    }));
  }, [state]);

  // 切换方向
  const toggleDirection = useCallback(() => {
    const { selectedCell, crossword, currentDirection, currentWord } = state;

    const newDir = currentDirection === Direction.HORIZONTAL
      ? Direction.VERTICAL
      : Direction.HORIZONTAL;

    if (selectedCell && crossword) {
      const wordsAtCell = getWordsAt(crossword, selectedCell[0], selectedCell[1]);
      const word = wordsAtCell.find(w => w.direction === newDir);
      setState(prev => ({
        ...prev,
        currentDirection: newDir,
        currentWord: word || currentWord || null,
        currentWords: wordsAtCell,
      }));
    } else {
      setState(prev => ({ ...prev, currentDirection: newDir }));
    }
  }, [state]);

  // 设置方向
  const setDirection = useCallback((direction: Direction) => {
    const { selectedCell, crossword, currentWord } = state;

    if (selectedCell && crossword) {
      const wordsAtCell = getWordsAt(crossword, selectedCell[0], selectedCell[1]);
      const word = wordsAtCell.find(w => w.direction === direction);
      setState(prev => ({
        ...prev,
        currentDirection: direction,
        currentWord: word || currentWord || null,
        currentWords: wordsAtCell,
      }));
    } else {
      setState(prev => ({ ...prev, currentDirection: direction }));
    }
  }, [state]);

  // 输入字母
  const inputLetter = useCallback((letter: string) => {
    const { selectedCell, crossword } = state;
    if (!selectedCell || !crossword) return;

    const cell = crossword.grid[selectedCell[0]]?.[selectedCell[1]];
    if (!cell || cell.isBlocked) return;

    // 直接修改 char
    crossword.grid[selectedCell[0]][selectedCell[1]].char = hasHanText(letter) ? letter : letter.toUpperCase();

    // 自动移到下一个格子
    moveToNextCell();

    // 检查是否解决
    checkSolved();
  }, [state]);

  // 移动到下一个格子
  const moveToNextCell = useCallback(() => {
    const { selectedCell, crossword, currentDirection } = state;
    if (!selectedCell || !crossword) return;

    const [row, col] = selectedCell;
    const dr = currentDirection === Direction.HORIZONTAL ? 0 : 1;
    const dc = currentDirection === Direction.HORIZONTAL ? 1 : 0;

    let newRow = row + dr;
    let newCol = col + dc;

    while (
      newRow >= 0 && newRow < crossword.rows &&
      newCol >= 0 && newCol < crossword.cols
    ) {
      const cell = crossword.grid[newRow][newCol];
      if (!cell.isBlocked) {
        setState(prev => ({
          ...prev,
          selectedCell: [newRow, newCol],
        }));
        return;
      }
      newRow += dr;
      newCol += dc;
    }
  }, [state]);

  // 删除字母
  const deleteLetter = useCallback(() => {
    const { selectedCell, crossword } = state;
    if (!selectedCell || !crossword) return;

    const cell = crossword.grid[selectedCell[0]][selectedCell[1]];
    if (cell.isBlocked) return;

    crossword.grid[selectedCell[0]][selectedCell[1]].char = null;

    setState(prev => ({ ...prev }));
  }, [state]);

  // 显示答案
  const showSolution = useCallback(() => {
    setState(prev => ({ ...prev, showSolution: true }));
  }, []);

  // 隐藏答案
  const hideSolution = useCallback(() => {
    setState(prev => ({ ...prev, showSolution: false }));
  }, []);

  // 检查是否解决
  const checkSolved = useCallback(() => {
    const { crossword } = state;
    if (!crossword) return;

    const allCorrect = crossword.grid.flat()
      .filter(cell => !cell.isBlocked)
      .every(cell => isCorrect(cell));

    if (allCorrect) {
      setState(prev => ({ ...prev, isSolved: true }));
    }
  }, [state]);

  return {
    state,
    newGame,
    switchWordList,
    setCustomWords,
    setGridSize,
    loadCustomPuzzle,
    selectCell,
    toggleDirection,
    setDirection,
    inputLetter,
    deleteLetter,
    showSolution,
    hideSolution,
  };
}
