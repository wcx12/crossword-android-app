import React, { useState, useEffect } from 'react';
import { GameScreen } from './ui/game/GameScreen';
import { WordListScreen } from './ui/game/WordListScreen';
import { WordSearchScreen } from './ui/game/WordSearchScreen';
import { GridEditorScreen } from './ui/game/GridEditorScreen';
import { useGameViewModel } from './ui/game/GameViewModel';
import { WORD_LISTS, WordListInfo } from './data/model/WordListInfo';

type Screen = 'game' | 'wordList' | 'search' | 'editor';

// localStorage keys
const STORAGE_KEY_CUSTOM_LISTS = 'crossword_custom_word_lists';
const STORAGE_KEY_LIST_INFOS = 'crossword_word_list_infos';
const STORAGE_KEY_CURRENT_ID = 'crossword_current_word_list_id';

// 默认的编程术语测试词库
const DEFAULT_CUSTOM_SAMPLE = {
  'custom_sample': [
    { word: 'Python', clue: '广受欢迎的解释型语言' },
    { word: 'Java', clue: '跨平台面向对象语言' },
    { word: 'Rust', clue: '安全并发编程语言' },
    { word: 'React', clue: 'Facebook开发的UI库' },
    { word: 'Linux', clue: '开源Unix-like系统' },
    { word: 'Git', clue: '分布式版本控制系统' },
    { word: 'Docker', clue: '容器化部署平台' },
    { word: 'Array', clue: '编程中的数组' },
    { word: 'Class', clue: '面向对象中的类' },
    { word: 'Loop', clue: '程序中的循环结构' },
    { word: 'Stack', clue: '后进先出的数据结构' },
    { word: 'Queue', clue: '先进先出的数据结构' },
    { word: 'Cache', clue: '高速缓存存储器' },
    { word: 'Query', clue: '数据库查询语句' },
    { word: 'Async', clue: '异步编程关键字' },
    { word: 'Token', clue: '身份验证令牌' },
    { word: 'Parse', clue: '解析数据格式' },
    { word: 'Debug', clue: '程序调试过程' },
    { word: 'Build', clue: '项目编译构建' },
    { word: 'Deploy', clue: '应用部署发布' },
  ],
};

// 默认的自定义词表信息
const DEFAULT_LIST_INFOS: WordListInfo[] = [
  ...WORD_LISTS,
  {
      id: 'custom_sample',
      name: '编程术语',
      filePath: '',
      wordCount: 20,
      isSystem: false,
      language: 'en',
  },
];

// 从localStorage加载数据
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return defaultValue;
}

// 保存数据到localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

function mergeDefaultWordLists(stored: WordListInfo[]): WordListInfo[] {
  const customLists = stored.filter(item => !item.isSystem);
  const storedSystemById = new Map(stored.filter(item => item.isSystem).map(item => [item.id, item]));
  const systemLists = WORD_LISTS.map(defaultList => ({
    ...defaultList,
    wordCount: storedSystemById.get(defaultList.id)?.wordCount ?? defaultList.wordCount,
  }));
  return [...systemLists, ...customLists];
}

function App() {
  const [screen, setScreen] = useState<Screen>('game');

  // 从localStorage加载当前词表ID
  const [currentWordListId, setCurrentWordListId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEY_CURRENT_ID, 'python_xword')
  );

  // 从localStorage加载词表信息列表
  const [wordListInfos, setWordListInfos] = useState<WordListInfo[]>(() =>
    mergeDefaultWordLists(loadFromStorage(STORAGE_KEY_LIST_INFOS, DEFAULT_LIST_INFOS))
  );

  // 从localStorage加载自定义词库
  const [customWordLists, setCustomWordLists] = useState<Record<string, { word: string; clue: string }[]>>(() =>
    loadFromStorage(STORAGE_KEY_CUSTOM_LISTS, DEFAULT_CUSTOM_SAMPLE)
  );

  // 当数据变化时，自动保存到localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEY_CUSTOM_LISTS, customWordLists);
  }, [customWordLists]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_LIST_INFOS, wordListInfos);
  }, [wordListInfos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_CURRENT_ID, currentWordListId);
  }, [currentWordListId]);

  const {
    state,
    newGame,
    switchWordList,
    setCustomWords,
    loadCustomPuzzle,
    selectCell,
    toggleDirection,
    setDirection,
    inputLetter,
    deleteLetter,
    showSolution,
    hideSolution,
  } = useGameViewModel();

  // 当选择词表时，加载该词表并开始新游戏
  const handleSelectWordList = (id: string) => {
    setCurrentWordListId(id);

    // 如果是自定义词表
    if (id.startsWith('custom_')) {
      const entries = customWordLists[id];
      if (entries && entries.length >= 2) {
        setScreen('game');
        setCustomWords(entries, state.gridRows, state.gridCols);
      }
      return;
    }

    const wordList = WORD_LISTS.find(w => w.id === id);
    if (wordList) {
      setScreen('game');
      switchWordList(wordList.filePath, state.gridRows, state.gridCols);

      // 更新词表信息中的数量（异步更新）
      fetch(wordList.filePath)
        .then(response => response.text())
        .then(text => {
          const count = text.split('\n').filter(line => line.trim().length > 0).length;
          setWordListInfos(prev => prev.map(w =>
            w.id === id ? { ...w, wordCount: count } : w
          ));
        });
    }
  };

  // 当添加自定义词表时
  const handleAddCustomWordList = (entries: { word: string; clue: string }[]) => {
    const newId = `custom_${Date.now()}`;
    const newWordList: WordListInfo = {
      id: newId,
      name: `自定义词表 ${Object.keys(customWordLists).length + 1}`,
      filePath: '',
      wordCount: entries.length,
      isSystem: false,
      language: entries.some(entry => /[\u4e00-\u9fff]/u.test(entry.word)) ? 'zh' : 'en',
    };

    // 更新词表列表
    setWordListInfos(prev => [...prev, newWordList]);
    // 存储词库内容
    setCustomWordLists(prev => ({ ...prev, [newId]: entries }));

    // 自动开始游戏
    setScreen('game');
    setCurrentWordListId(newId);
    setCustomWords(entries, state.gridRows, state.gridCols);
  };

  // 删除自定义词表
  const handleDeleteCustomWordList = (id: string) => {
    // 从词表列表移除
    setWordListInfos(prev => prev.filter(w => w.id !== id));
    // 从自定义词库中移除
    setCustomWordLists(prev => {
      const newList = { ...prev };
      delete newList[id];
      return newList;
    });
    // 如果删除的是当前使用的词表，切换到默认词表
    if (currentWordListId === id) {
      setCurrentWordListId('python_xword');
      switchWordList('/wordlists/python_xword.txt', state.gridRows, state.gridCols);
    }
  };

  // 更新自定义词表名称
  const handleUpdateCustomWordListName = (id: string, newName: string) => {
    setWordListInfos(prev => prev.map(w =>
      w.id === id ? { ...w, name: newName } : w
    ));
  };

  // 点击"选择词表"按钮
  const handleShowWordList = () => {
    setScreen('wordList');
  };

  // 点击"搜索"按钮
  const handleShowSearch = () => {
    setScreen('search');
  };

  // 返回游戏
  const handleBackToGame = () => {
    setScreen('game');
  };

  // 打开编辑器
  const handleOpenEditor = () => {
    setScreen('editor');
  };

  // 从编辑器开始游戏
  const handlePlayFromEditor = (grid: { isBlack: boolean; letter: string }[][], words: any[]) => {
    loadCustomPuzzle(grid, words);
    setScreen('game');
  };

  if (screen === 'wordList') {
    return (
      <WordListScreen
        wordLists={wordListInfos}
        customWordData={customWordLists}
        currentWordListId={currentWordListId}
        onSelectWordList={handleSelectWordList}
        onBackToGame={handleBackToGame}
        onAddCustomWordList={handleAddCustomWordList}
        onDeleteCustomWordList={handleDeleteCustomWordList}
        onUpdateCustomWordListName={handleUpdateCustomWordListName}
      />
    );
  }

  if (screen === 'search') {
    return (
      <WordSearchScreen
        wordLists={wordListInfos}
        currentWordListId={currentWordListId}
        onBackToGame={handleBackToGame}
      />
    );
  }

  if (screen === 'editor') {
    return (
      <GridEditorScreen
        onBack={handleBackToGame}
        onPlay={handlePlayFromEditor}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      onCellClick={selectCell}
      onToggleDirection={toggleDirection}
      onSetDirection={setDirection}
      onLetterInput={inputLetter}
      onDelete={deleteLetter}
      onShowSolution={showSolution}
      onHideSolution={hideSolution}
      onNewGame={(rows, cols) => newGame(rows ?? state.gridRows, cols ?? state.gridCols)}
      onShowWordList={handleShowWordList}
      onShowSearch={handleShowSearch}
      onShowEditor={handleOpenEditor}
    />
  );
}

export default App;
