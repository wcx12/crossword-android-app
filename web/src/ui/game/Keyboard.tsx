import React from 'react';
import { colors, borderRadius, shadows } from '../theme/theme';

interface KeyboardProps {
  onLetterClick: (letter: string) => void;
  onDeleteClick: () => void;
  inputMode?: 'letters' | 'candidateChars';
  candidateChars?: string[];
}

export const Keyboard: React.FC<KeyboardProps> = ({
  onLetterClick,
  onDeleteClick,
  inputMode = 'letters',
  candidateChars = [],
}) => {
  const letters = inputMode === 'candidateChars' ? candidateChars : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const rowSize = inputMode === 'candidateChars' ? 10 : 9;

  const rows = [
    letters.slice(0, rowSize),
    letters.slice(rowSize, rowSize * 2),
    letters.slice(rowSize * 2, rowSize * 3),
    letters.slice(rowSize * 3),
  ];

  const keyStyle: React.CSSProperties = {
    width: inputMode === 'candidateChars' ? 34 : 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.outline}`,
    borderRadius: borderRadius.small,
    fontSize: inputMode === 'candidateChars' ? 18 : 16,
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: shadows.elevation1,
    transition: 'background-color 0.1s',
    padding: 0,
  };

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {inputMode === 'candidateChars' && (
        <div style={{ fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 4 }}>
          候选字
        </div>
      )}
      {rows.filter(row => row.length > 0).map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: 4 }}>
          {row.map(letter => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              style={keyStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceVariant;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface;
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
      <div style={{ height: 8 }} />
      <button
        onClick={onDeleteClick}
        style={{
          width: 120,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceVariant,
          border: `1px solid ${colors.outline}`,
          borderRadius: borderRadius.small,
          fontSize: 14,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.secondaryContainer;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.surfaceVariant;
        }}
      >
        删除
      </button>
    </div>
  );
};
