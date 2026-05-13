import React from 'react';
import { Direction, WordPlacement } from '../../domain/model/crossword';
import { colors } from '../theme/theme';

interface HintBarProps {
  currentWord: WordPlacement | null;
  direction: Direction;
  showSolution: boolean;
  onToggleDirection: () => void;
  onSetDirection: (direction: Direction) => void;
  onShowSolution: () => void;
}

export const HintBar: React.FC<HintBarProps> = ({
  currentWord,
  direction,
  showSolution,
  onToggleDirection,
  onSetDirection,
  onShowSolution,
}) => {
  const buttonStyle = (isSelected: boolean): React.CSSProperties => ({
    minHeight: 44,
    padding: '0 14px',
    border: `1px solid ${isSelected ? colors.primary : colors.outline}`,
    borderRadius: 999,
    backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
    color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
    fontWeight: 800,
    cursor: 'pointer',
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      backgroundColor: colors.surfaceVariant,
      borderBottom: `1px solid ${colors.outline}`,
      width: '100%',
      boxSizing: 'border-box',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      {/* 左侧：当前线索 */}
      <div style={{ flex: 1 }}>
        {currentWord ? (
          <>
            <div style={{ fontSize: 12, color: colors.primary }}>
              {currentWord.displayLabel}. {direction === Direction.HORIZONTAL ? '横' : '竖'}
            </div>
            <div style={{ fontSize: 14 }}>
              {currentWord.clue || currentWord.word}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, color: colors.onSurfaceVariant }}>
            点击格子开始
          </div>
        )}
      </div>

      {/* 中间：方向切换 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => onSetDirection(Direction.HORIZONTAL)}
          style={buttonStyle(direction === Direction.HORIZONTAL)}
        >
          横
        </button>
        <button
          onClick={() => onSetDirection(Direction.VERTICAL)}
          style={buttonStyle(direction === Direction.VERTICAL)}
        >
          竖
        </button>
      </div>

      {/* 右侧：显示答案按钮 */}
      <button
        onClick={onShowSolution}
        style={{
          minHeight: 44,
          background: colors.surface,
          border: `1px solid ${colors.outline}`,
          borderRadius: 999,
          color: colors.primary,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 800,
          padding: '0 14px',
        }}
      >
        {showSolution ? '隐藏答案' : '显示答案'}
      </button>
    </div>
  );
};
