import React, { useState } from 'react';
import { WordListInfo } from '../../data/model/WordListInfo';
import { WordListDetail } from './WordListDetail';
import { AddWordList } from './AddWordList';
import { colors } from '../theme/theme';
import {
  navButtonStyle,
  pageHeaderLeftStyle,
  pageHeaderStyle,
  pageShellStyle,
  pageTitleStyle,
  primaryButtonStyle,
} from '../theme/pageStyles';

interface WordListScreenProps {
  wordLists: WordListInfo[];
  customWordData: Record<string, { word: string; clue: string }[]>;
  currentWordListId: string | null;
  onSelectWordList: (id: string) => void;
  onBackToGame: () => void;
  onAddCustomWordList: (entries: { word: string; clue: string }[]) => void;
  onDeleteCustomWordList: (id: string) => void;
  onUpdateCustomWordListName: (id: string, newName: string) => void;
}

export const WordListScreen: React.FC<WordListScreenProps> = ({
  wordLists,
  customWordData,
  currentWordListId,
  onSelectWordList,
  onBackToGame,
  onAddCustomWordList,
  onDeleteCustomWordList,
  onUpdateCustomWordListName,
}) => {
  const [detailWordList, setDetailWordList] = useState<WordListInfo | null>(null);
  const [showAddWordList, setShowAddWordList] = useState(false);

  // 分离系统词库和自定义词库
  const systemWordLists = wordLists.filter(w => w.isSystem);
  const customWordLists = wordLists.filter(w => !w.isSystem);

  // 如果显示添加词表页面
  if (showAddWordList) {
    return (
      <AddWordList
        onConfirm={(entries) => {
          onAddCustomWordList(entries);
          setShowAddWordList(false);
        }}
        onBack={() => setShowAddWordList(false)}
      />
    );
  }

  // 如果选中了某个词表，显示详情
  if (detailWordList) {
    const isCustom = !detailWordList.isSystem;
    const customWords = isCustom ? customWordData[detailWordList.id] : undefined;
    return (
      <WordListDetail
        wordList={detailWordList}
        customWords={customWords}
        onStartGame={() => {
          onSelectWordList(detailWordList.id);
          setDetailWordList(null);
        }}
        onBack={() => setDetailWordList(null)}
        onUpdateName={isCustom ? (newName: string) => onUpdateCustomWordListName(detailWordList.id, newName) : undefined}
      />
    );
  }

  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      {/* 顶部栏 */}
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button
            onClick={onBackToGame}
            style={navButtonStyle}
          >
            返回游戏
          </button>
          <span style={pageTitleStyle}>选择词表</span>
        </div>
      </div>

      {/* 词表列表 */}
      <div style={{
        flex: 1,
        padding: 16,
        overflow: 'auto',
      }}>
        {/* 添加自定义按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}>
          <button
            onClick={() => setShowAddWordList(true)}
            style={primaryButtonStyle()}
          >
            添加自定义词库
          </button>
        </div>

        {/* 系统词库 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: 12,
          }}>
            系统词库
          </div>
          {systemWordLists.map(wordList => (
            <WordListItem
              key={wordList.id}
              wordList={wordList}
              isSelected={currentWordListId === wordList.id}
              onClick={() => setDetailWordList(wordList)}
            />
          ))}
        </div>

        {/* 自定义词库 */}
        {customWordLists.length > 0 && (
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: colors.secondary,
              marginBottom: 12,
            }}>
              我的词库
            </div>
            {customWordLists.map(wordList => (
              <WordListItem
                key={wordList.id}
                wordList={wordList}
                isSelected={currentWordListId === wordList.id}
                onClick={() => setDetailWordList(wordList)}
                onDelete={() => onDeleteCustomWordList(wordList.id)}
                showDelete
              />
            ))}
          </div>
        )}

        {wordLists.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: colors.onSurfaceVariant,
          }}>
            暂没有可用的词表
          </div>
        )}
      </div>
    </div>
  );
};

// 词表项组件
interface WordListItemProps {
  wordList: WordListInfo;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const WordListItem: React.FC<WordListItemProps> = ({
  wordList,
  isSelected,
  onClick,
  onDelete,
  showDelete,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
        border: `1px solid ${colors.outline}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        boxShadow: 'var(--cw-card-shadow)',
      }}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
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
        {isSelected && (
          <div style={{
            fontSize: 12,
            color: colors.primary,
            marginTop: 4,
          }}>
            ✓ 当前使用
          </div>
        )}
      </div>
      {showDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            minHeight: 44,
            padding: '0 12px',
            backgroundColor: colors.error,
            color: colors.onError,
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          删除
        </button>
      )}
    </div>
  );
};
