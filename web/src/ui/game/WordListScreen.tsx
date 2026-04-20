import React, { useState } from 'react';
import { WordListInfo } from '../../data/model/WordListInfo';
import { WordListDetail } from './WordListDetail';
import { colors } from '../theme/theme';

interface WordListScreenProps {
  wordLists: WordListInfo[];
  currentWordListId: string | null;
  onSelectWordList: (id: string) => void;
  onBackToGame: () => void;
}

export const WordListScreen: React.FC<WordListScreenProps> = ({
  wordLists,
  currentWordListId,
  onSelectWordList,
  onBackToGame,
}) => {
  const [detailWordList, setDetailWordList] = useState<WordListInfo | null>(null);

  // 如果选中了某个词表，显示详情
  if (detailWordList) {
    return (
      <WordListDetail
        wordList={detailWordList}
        onStartGame={() => {
          onSelectWordList(detailWordList.id);
          setDetailWordList(null);
        }}
        onBack={() => setDetailWordList(null)}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
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
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>选择词表</span>
      </div>

      {/* 词表列表 */}
      <div style={{
        flex: 1,
        padding: 16,
        overflow: 'auto',
      }}>
        <div style={{ fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 16 }}>
          点击词表查看详情
        </div>

        {wordLists.map(wordList => (
          <div
            key={wordList.id}
            onClick={() => setDetailWordList(wordList)}
            style={{
              padding: 16,
              marginBottom: 12,
              backgroundColor: currentWordListId === wordList.id
                ? colors.primaryContainer
                : colors.surface,
              border: `1px solid ${colors.outline}`,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentWordListId !== wordList.id) {
                e.currentTarget.style.backgroundColor = colors.surfaceVariant;
              }
            }}
            onMouseLeave={(e) => {
              if (currentWordListId !== wordList.id) {
                e.currentTarget.style.backgroundColor = colors.surface;
              }
            }}
          >
            <div style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.onSurface,
              marginBottom: 4,
            }}>
              {wordList.name}
            </div>
            <div style={{
              fontSize: 12,
              color: colors.onSurfaceVariant,
            }}>
              单词数量: {wordList.wordCount}
            </div>
            {currentWordListId === wordList.id && (
              <div style={{
                fontSize: 12,
                color: colors.primary,
                marginTop: 4,
              }}>
                ✓ 当前使用
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};