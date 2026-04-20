import React, { useState, useEffect } from 'react';
import { WordListInfo } from '../../data/model/WordListInfo';
import { WordEntry } from '../../data/model/WordEntry';
import { searchWords, isValidPattern, SearchParams } from '../../domain/usecase/wordSearch';
import { colors } from '../theme/theme';
import { parseWordList } from '../../data/local/WordListLoader';

interface WordSearchScreenProps {
  wordLists: WordListInfo[];
  currentWordListId: string | null;
  onBackToGame: () => void;
}

export const WordSearchScreen: React.FC<WordSearchScreenProps> = ({
  wordLists,
  currentWordListId,
  onBackToGame,
}) => {
  const [selectedWordListId, setSelectedWordListId] = useState<string>(currentWordListId || 'general_knowledge');
  const [wordList, setWordList] = useState<WordEntry[]>([]);
  const [pattern, setPattern] = useState('');
  const [length, setLength] = useState<string>('');
  const [startsWith, setStartsWith] = useState('');
  const [endsWith, setEndsWith] = useState('');
  const [results, setResults] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const selectedWordList = wordLists.find(w => w.id === selectedWordListId);
  const isChineseList = selectedWordList?.language === 'zh';

  // 加载词表数据
  useEffect(() => {
    const wordListInfo = wordLists.find(w => w.id === selectedWordListId);
    if (wordListInfo && wordListInfo.filePath) {
      setLoading(true);
      fetch(wordListInfo.filePath)
        .then(response => response.text())
        .then(text => {
          setWordList(parseWordList(text));
          setLoading(false);
        });
    }
  }, [selectedWordListId, wordLists]);

  // 执行搜索
  const handleSearch = () => {
    const params: SearchParams = {
      wordList,
      pattern: pattern || undefined,
      length: length ? parseInt(length) : undefined,
      startsWith: startsWith || undefined,
      endsWith: endsWith || undefined,
    };

    const found = searchWords(params);
    setResults(found);
  };

  // 清空搜索
  const handleClear = () => {
    setPattern('');
    setLength('');
    setStartsWith('');
    setEndsWith('');
    setResults([]);
  };

  const isPatternValid = isValidPattern(pattern);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: colors.primary,
        color: colors.onPrimary,
      }}>
        <button
          onClick={onBackToGame}
          style={{
            background: 'none',
            border: 'none',
            color: colors.onPrimary,
            cursor: 'pointer',
            fontSize: 14,
            marginRight: 16,
          }}
        >
          ← 返回
        </button>
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>{isChineseList ? '搜索成语' : '搜索单词'}</span>
      </div>

      {/* 搜索表单 */}
      <div style={{
        padding: 16,
        backgroundColor: colors.surfaceVariant,
        borderBottom: `1px solid ${colors.outlineVariant}`,
      }}>
        {/* 选择词表 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: colors.onSurfaceVariant,
            marginBottom: 6,
          }}>
            选择词表
          </label>
          <select
            value={selectedWordListId}
            onChange={(e) => setSelectedWordListId(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              backgroundColor: colors.surface,
            }}
          >
            {wordLists.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.wordCount})</option>
            ))}
          </select>
        </div>

        {/* 已知位置模式 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: colors.onSurfaceVariant,
            marginBottom: 6,
          }}>
            {isChineseList ? '已知位置（用 _ 表示未知，如 _蛇__）' : '已知位置（用 _ 表示未知，如 _O__E）'}
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value.toUpperCase().replace(/\s+/g, ''))}
            placeholder={isChineseList ? '如：_蛇__' : '如：_O__E'}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              fontFamily: 'monospace',
              border: `1px solid ${!isPatternValid ? colors.error : colors.outline}`,
              borderRadius: 8,
              boxSizing: 'border-box',
            }}
          />
          {!isPatternValid && (
            <div style={{ color: colors.error, fontSize: 11, marginTop: 4 }}>
              {isChineseList ? '模式只能包含汉字和下划线' : '模式只能包含字母和下划线'}
            </div>
          )}
        </div>

        {/* 单词长度 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: colors.onSurfaceVariant,
            marginBottom: 6,
          }}>
            {isChineseList ? '字数' : '单词长度'}
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder={isChineseList ? '如：4' : '如：6'}
            min="1"
            max="30"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 首位和末位 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              color: colors.onSurfaceVariant,
              marginBottom: 6,
            }}>
              {isChineseList ? '首字' : '首位字母'}
            </label>
            <input
              type="text"
              value={startsWith}
              onChange={(e) => setStartsWith(e.target.value.toUpperCase())}
              placeholder={isChineseList ? '如：画' : '如：M'}
              maxLength={1}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                border: `1px solid ${colors.outline}`,
                borderRadius: 8,
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              color: colors.onSurfaceVariant,
              marginBottom: 6,
            }}>
              {isChineseList ? '末字' : '末位字母'}
            </label>
            <input
              type="text"
              value={endsWith}
              onChange={(e) => setEndsWith(e.target.value.toUpperCase())}
              placeholder={isChineseList ? '如：足' : '如：E'}
              maxLength={1}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                border: `1px solid ${colors.outline}`,
                borderRadius: 8,
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* 搜索按钮 */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: colors.primary,
              color: colors.onPrimary,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            搜索
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: colors.primary,
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            清空
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 16,
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>加载词表中...</div>
        ) : results.length > 0 ? (
          <>
            <div style={{
              fontSize: 12,
              color: colors.onSurfaceVariant,
              marginBottom: 12,
            }}>
              匹配结果 ({results.length} 个)
            </div>
            <div style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              border: `1px solid ${colors.outline}`,
              overflow: 'hidden',
            }}>
              {results.map((word, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < results.length - 1 ? `1px solid ${colors.outlineVariant}` : 'none',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    minWidth: 80,
                    fontWeight: 'bold',
                    color: colors.primary,
                    fontSize: 14,
                  }}>
                    {word.word}
                  </div>
                  <div style={{
                    flex: 1,
                    color: colors.onSurfaceVariant,
                    fontSize: 14,
                  }}>
                    {word.clue || <span style={{ fontStyle: 'italic', color: colors.outline }}>无提示</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: colors.onSurfaceVariant,
          }}>
            {pattern || length || startsWith || endsWith
              ? '未找到匹配的单词'
              : '输入搜索条件开始搜索'}
          </div>
        )}
      </div>
    </div>
  );
};
