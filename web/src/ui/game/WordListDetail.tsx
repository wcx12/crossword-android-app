import React, { useState, useEffect } from 'react';
import { WordListInfo } from '../../data/model/WordListInfo';
import { colors } from '../theme/theme';
import { WordEntry, getWordChars } from '../../data/model/WordEntry';
import { parseWordList } from '../../data/local/WordListLoader';

interface WordListDetailProps {
  wordList: WordListInfo;
  customWords?: { word: string; clue: string }[];  // 自定义词库的词条
  onStartGame: () => void;
  onBack: () => void;
  onUpdateName?: (newName: string) => void;  // 仅自定义词库可用
}

export const WordListDetail: React.FC<WordListDetailProps> = ({
  wordList,
  customWords,
  onStartGame,
  onBack,
  onUpdateName,
}) => {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(wordList.name);

  const isCustom = !wordList.isSystem;

  useEffect(() => {
    // 如果有自定义词库数据，直接使用
    if (customWords) {
      setWords(customWords.map(w => ({ word: w.word, clue: w.clue, length: getWordChars(w.word).length })));
      setLoading(false);
      return;
    }

    // 否则从文件加载
    if (wordList.filePath) {
      fetch(wordList.filePath)
        .then(response => response.text())
        .then(text => {
          const parsed = parseWordList(text);
          setWords(parsed);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [wordList.filePath, customWords]);

  useEffect(() => {
    setEditName(wordList.name);
  }, [wordList.name]);

  const handleSaveName = () => {
    if (editName.trim() && onUpdateName) {
      onUpdateName(editName.trim());
      setIsEditing(false);
    }
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
        {isEditing && isCustom ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: 'bold',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              color: colors.onPrimary,
            }}
          />
        ) : (
          <span style={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}>{wordList.name}</span>
        )}
        {isCustom && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.onPrimary,
              cursor: 'pointer',
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            ✏️
          </button>
        )}
        {isEditing && (
          <>
            <button
              onClick={handleSaveName}
              style={{
                background: 'none',
                border: 'none',
                color: colors.onPrimary,
                cursor: 'pointer',
                fontSize: 14,
                marginLeft: 8,
              }}
            >
              ✓
            </button>
            <button
              onClick={() => {
                setEditName(wordList.name);
                setIsEditing(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: colors.onPrimary,
                cursor: 'pointer',
                fontSize: 14,
                marginLeft: 4,
              }}
            >
              ✕
            </button>
          </>
        )}
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
