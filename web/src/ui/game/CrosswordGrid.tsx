import React, { useMemo } from 'react';
import { Crossword, Direction, WordPlacement, getCells } from '../../domain/model/crossword';
import { colors, borderRadius } from '../theme/theme';

interface CrosswordGridProps {
  crossword: Crossword;
  selectedCell: [number, number] | null;
  currentWord: WordPlacement | null;
  currentWords: WordPlacement[];
  currentDirection: Direction;
  showSolution: boolean;
  onCellClick: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  crossword,
  selectedCell,
  currentWord,
  currentWords,
  currentDirection,
  showSolution,
  onCellClick,
}) => {
  // 计算格子大小
  const cellSize = useMemo(() => {
    // 简单计算 - 可以根据需要调整
    return Math.min(36, Math.max(24, 400 / Math.max(crossword.rows, crossword.cols)));
  }, [crossword.rows, crossword.cols]);

  // 获取格子背景色
  const getCellColor = (row: number, col: number, cell: { isBlocked: boolean; char: string | null; solutionChar: string | null }): string => {
    if (cell.isBlocked) return colors.cellBlocked;

    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    if (isSelected) return colors.cellSelected;

    const currentCells = currentWord ? getCells(currentWord) : [];
    const isInCurrentWord = currentCells.some(([r, c]) => r === row && c === col);
    if (isInCurrentWord) return colors.cellHighlight;

    const isInRelatedWord = currentWords.some(w => {
      if (w.id === currentWord?.id) return false;
      return getCells(w).some(([r, c]) => r === row && c === col);
    });
    if (isInRelatedWord) return colors.cellHighlight + '99'; // 透明度

    return colors.cellEmpty;
  };

  // 获取文字颜色
  const getTextColor = (cell: { isBlocked: boolean; char: string | null; solutionChar: string | null }): string => {
    if (cell.isBlocked) return 'transparent';
    if (cell.char && showSolution) {
      return cell.char === cell.solutionChar ? colors.correct : colors.incorrect;
    }
    return colors.textPrimary;
  };

  // 查找格子标号
  const getLabel = (row: number, col: number): { horizontal: string | null; vertical: string | null } => {
    const hPlacement = crossword.placements.find(p =>
      p.direction === Direction.HORIZONTAL && p.row === row && p.col === col
    );
    const vPlacement = crossword.placements.find(p =>
      p.direction === Direction.VERTICAL && p.row === row && p.col === col
    );
    return {
      horizontal: hPlacement?.displayLabel || null,
      vertical: vPlacement?.displayLabel || null,
    };
  };

  return (
    <div style={{ padding: 4, overflow: 'auto', maxWidth: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {crossword.grid.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: 0 }}>
            {row.map((cell, colIdx) => {
              const label = getLabel(rowIdx, colIdx);
              const bgColor = getCellColor(rowIdx, colIdx, cell);
              const textColor = getTextColor(cell);

              // 显示的字母
              let displayChar: string | null = null;
              if (showSolution && !cell.isBlocked) {
                displayChar = cell.solutionChar?.toLowerCase() || null;
              } else if (!cell.isBlocked) {
                displayChar = cell.char;
              }

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => !cell.isBlocked && onCellClick(rowIdx, colIdx)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: bgColor,
                    border: `1px solid ${colors.outline}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: cell.isBlocked ? 'default' : 'pointer',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* 横排标号 - 左上角 */}
                  {label.horizontal && !cell.isBlocked && (
                    <span style={{
                      position: 'absolute',
                      top: 1,
                      left: 2,
                      fontSize: cellSize * 0.22,
                      color: colors.textSecondary,
                      lineHeight: 1,
                    }}>
                      {label.horizontal}
                    </span>
                  )}
                  {/* 竖排标号 - 右下角 */}
                  {label.vertical && !cell.isBlocked && (
                    <span style={{
                      position: 'absolute',
                      bottom: 1,
                      right: 2,
                      fontSize: cellSize * 0.22,
                      color: colors.textSecondary,
                      lineHeight: 1,
                    }}>
                      {label.vertical}
                    </span>
                  )}
                  {/* 字母 */}
                  <span style={{
                    fontSize: cellSize * 0.55,
                    fontWeight: 'bold',
                    color: textColor,
                    textAlign: 'center',
                  }}>
                    {displayChar || ''}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};