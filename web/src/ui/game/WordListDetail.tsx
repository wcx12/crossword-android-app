import React, { useState, useEffect } from 'react';
import { WordListInfo } from '../../data/model/WordListInfo';
import { colors } from '../theme/theme';
import { WordEntry } from '../../data/model/WordEntry';

interface WordListDetailProps {
  wordList: WordListInfo;
  onStartGame: () => void;
  onBack: () => void;
}

export const WordListDetail: React.FC<WordListDetailProps> = ({
  wordList,
  onStartGame,
  onBack,
}) => {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(wordList.filePath)
      .then(response => response.text())
      .then(text => {
        const parsed = parseWordList(text);
        setWords(parsed);
        setLoading(false);
      });
  }, [wordList.filePath]);

  const parseWordList = (text: string) => {
    const lines = text.split('\n');
    return lines
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0) return null;
        const parts = trimmed.split(/\s+/);
        const word = parts[0].toUpperCase();
        if (!word.split('').every(c => /[a-zA-Z]/.test(c))) return null;
        const clue = parts.length > 1 ? parts.slice(1).join(' ') : '';
        return { word, clue, length: word.length };
      })
      .filter((entry): entry is WordEntry => entry !== null);
  };

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
          onClick={onBack}
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
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>{wordList.name}</span>
      </div>

      {/* 单词数量提示 */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: colors.surfaceVariant,
        fontSize: 12,
        color: colors.onSurfaceVariant,
      }}>
        共 {words.length} 个单词
      </div>

      {/* 单词列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 16,
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>
        ) : (
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            border: `1px solid ${colors.outline}`,
            overflow: 'hidden',
          }}>
            {words.map((word, index) => (
              <div
                key={index}
                style={{
                  padding: '12px 16px',
                  borderBottom: index < words.length - 1 ? `1px solid ${colors.outlineVariant}` : 'none',
                  display: 'flex',
                  gap: 16,
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
        )}
      </div>

      {/* 底部按钮 */}
      <div style={{
        padding: 16,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.outlineVariant}`,
      }}>
        <button
          onClick={onStartGame}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: colors.primary,
            color: colors.onPrimary,
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          使用此词表开始游戏
        </button>
      </div>
    </div>
  );
};