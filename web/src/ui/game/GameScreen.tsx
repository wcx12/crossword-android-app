import React from 'react';
import { GameState } from './GameViewModel';
import { CrosswordGrid } from './CrosswordGrid';
import { Keyboard } from './Keyboard';
import { HintBar } from './HintBar';
import { colors } from '../theme/theme';

interface GameScreenProps {
  state: GameState;
  onCellClick: (row: number, col: number) => void;
  onToggleDirection: () => void;
  onSetDirection: (direction: any) => void;
  onLetterInput: (letter: string) => void;
  onDelete: () => void;
  onShowSolution: () => void;
  onHideSolution: () => void;
  onNewGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  state,
  onCellClick,
  onToggleDirection,
  onSetDirection,
  onLetterInput,
  onDelete,
  onShowSolution,
  onHideSolution,
  onNewGame,
}) => {
  const { isLoading, crossword, errorMessage, isSolved, selectedCell, currentWord, currentWords, currentDirection, showSolution } = state;

  // 加载中
  if (isLoading) {
    return (
      <div style={centerStyle}>
        <span>生成谜题中...</span>
      </div>
    );
  }

  // 错误
  if (errorMessage) {
    return (
      <div style={centerStyle}>
        <div style={{ color: colors.error, textAlign: 'center', marginBottom: 16 }}>
          {errorMessage}
        </div>
        <button onClick={onNewGame} style={buttonStyle}>重试</button>
      </div>
    );
  }

  // 空状态
  if (!crossword) {
    return (
      <div style={centerStyle}>
        <div style={{ marginBottom: 16 }}>点击下方按钮开始新游戏</div>
        <button onClick={onNewGame} style={buttonStyle}>新游戏</button>
      </div>
    );
  }

  // 游戏内容
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
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: colors.primary,
        color: colors.onPrimary,
      }}>
        <span style={{ fontSize: 18, fontWeight: 'bold' }}>填字游戏</span>
        <button
          onClick={onNewGame}
          style={{
            background: 'none',
            border: 'none',
            color: colors.onPrimary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          新游戏
        </button>
      </div>

      {/* 提示栏 */}
      <HintBar
        currentWord={currentWord}
        direction={currentDirection}
        showSolution={showSolution}
        onToggleDirection={onToggleDirection}
        onSetDirection={onSetDirection}
        onShowSolution={showSolution ? onHideSolution : onShowSolution}
      />

      {/* 网格 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        padding: 8,
      }}>
        <CrosswordGrid
          crossword={crossword}
          selectedCell={selectedCell}
          currentWord={currentWord}
          currentWords={currentWords}
          currentDirection={currentDirection}
          showSolution={showSolution}
          onCellClick={onCellClick}
        />
      </div>

      {/* 键盘 */}
      <Keyboard
        onLetterClick={onLetterInput}
        onDeleteClick={onDelete}
      />

      {/* 完成弹窗 */}
      {isSolved && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: colors.surface,
            padding: 24,
            borderRadius: 16,
            textAlign: 'center',
            minWidth: 200,
          }}>
            <h2 style={{ margin: '0 0 16px 0', color: colors.onSurface }}>恭喜！</h2>
            <p style={{ margin: '0 0 16px 0', color: colors.onSurfaceVariant }}>你已完成所有填词！</p>
            <button
              onClick={() => onNewGame()}
              style={{
                ...buttonStyle,
                padding: '8px 24px',
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100vw',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: colors.primary,
  color: colors.onPrimary,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
};