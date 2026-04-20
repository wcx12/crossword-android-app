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
    padding: '4px 12px',
    border: `2px solid ${isSelected ? colors.primary : colors.outline}`,
    borderRadius: 8,
    backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
    color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
    fontWeight: isSelected ? 'bold' : 'normal',
    cursor: 'pointer',
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      backgroundColor: colors.surfaceVariant,
      width: '100%',
      boxSizing: 'border-box',
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
          background: 'none',
          border: 'none',
          color: colors.primary,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {showSolution ? '隐藏答案' : '显示答案'}
      </button>
    </div>
  );
};