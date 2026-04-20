import { useState, useCallback, useRef, useEffect } from 'react';
import { Crossword, Direction, WordPlacement, isCorrect, getWordsAt } from '../../domain/model/crossword';
import { WordEntry } from '../../data/model/WordEntry';
import { CrosswordGenerator } from '../../domain/usecase/CrosswordGenerator';
import { loadWordList } from '../../data/local/WordListLoader';

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
};

export function useGameViewModel() {
  const [state, setState] = useState<GameState>(initialState);
  const generatorRef = useRef<CrosswordGenerator>(new CrosswordGenerator(13, 13));

  // 初始化 - 加载词库并开始新游戏
  useEffect(() => {
    loadWordList().then(words => {
      if (words.length > 0) {
        generatePuzzle(words);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          errorMessage: '无法加载词库',
        }));
      }
    });
  }, []);

  // 生成谜题
  const generatePuzzle = useCallback((words: WordEntry[]) => {
    setState(prev => ({ ...prev, isLoading: true, errorMessage: null }));

    // 使用 setTimeout 让 UI 有机会更新
    setTimeout(() => {
      const generator = generatorRef.current;
      const crossword = generator.generate(words, 3);

      if (crossword) {
        setState(prev => ({
          ...prev,
          crossword,
          isLoading: false,
          isSolved: false,
          showSolution: false,
          selectedCell: null,
          currentWord: null,
          currentWords: [],
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          errorMessage: '无法生成谜题，请尝试更多单词',
        }));
      }
    }, 50);
  }, []);

  // 开始新游戏
  const newGame = useCallback(() => {
    loadWordList().then(words => {
      if (words.length > 0) {
        generatePuzzle(words);
      }
    });
  }, [generatePuzzle]);

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
    crossword.grid[selectedCell[0]][selectedCell[1]].char = letter.toUpperCase();

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
    selectCell,
    toggleDirection,
    setDirection,
    inputLetter,
    deleteLetter,
    showSolution,
    hideSolution,
  };
}