import React, { useState } from 'react';
import { GameState } from './GameViewModel';
import { CrosswordGrid } from './CrosswordGrid';
import { Keyboard } from './Keyboard';
import { HintBar } from './HintBar';
import { SettingsDialog } from './SettingsDialog';
import { colors } from '../theme/theme';
import {
  navButtonStyle,
  pageHeaderActionsStyle,
  pageHeaderLeftStyle,
  pageHeaderStyle,
  pageShellStyle,
  pageTitleStyle,
  primaryButtonStyle,
  quietButtonStyle,
} from '../theme/pageStyles';
import { gameHeaderActionLabels } from './gameNavigation';

interface GameScreenProps {
  state: GameState;
  onCellClick: (row: number, col: number) => void;
  onToggleDirection: () => void;
  onSetDirection: (direction: any) => void;
  onLetterInput: (letter: string) => void;
  onDelete: () => void;
  onShowSolution: () => void;
  onHideSolution: () => void;
  onNewGame: (rows?: number, cols?: number) => void;
  onShowWordList: () => void;
  onShowSearch: () => void;
  onBackToStart: () => void;
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
  onShowWordList,
  onShowSearch,
  onBackToStart,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [backLabel, searchLabel, wordListLabel, settingsLabel, newGameLabel] = gameHeaderActionLabels;
  const { isLoading, crossword, errorMessage, isSolved, selectedCell, currentWord, currentWords, currentDirection, showSolution, gridRows, gridCols, inputMode, candidateChars } = state;

  // 加载中
  if (isLoading) {
    return (
      <div style={centerStyle}>
        <span>生成谜题中...</span>
        <button onClick={onBackToStart} style={{ ...quietButtonStyle, marginTop: 16 }}>返回开始</button>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBackToStart} style={quietButtonStyle}>返回开始</button>
          <button onClick={() => onNewGame()} style={buttonStyle}>重试</button>
        </div>
      </div>
    );
  }

  // 空状态
  if (!crossword) {
    return (
      <div style={centerStyle}>
        <div style={{ marginBottom: 16 }}>点击下方按钮开始新游戏</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBackToStart} style={quietButtonStyle}>返回开始</button>
          <button onClick={() => onNewGame()} style={buttonStyle}>新游戏</button>
        </div>
      </div>
    );
  }

  // 游戏内容
  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      {/* 顶部栏 */}
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button
            onClick={onBackToStart}
            style={navButtonStyle}
          >
            {backLabel}
          </button>
          <span style={pageTitleStyle}>填字游戏</span>
        </div>
        <div style={pageHeaderActionsStyle}>
          <button
            onClick={onShowSearch}
            style={navButtonStyle}
          >
            {searchLabel}
          </button>
          <button
            onClick={onShowWordList}
            style={navButtonStyle}
          >
            {wordListLabel}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={navButtonStyle}
          >
            {settingsLabel}
          </button>
          <button
            onClick={() => onNewGame()}
            style={primaryButtonStyle()}
          >
            {newGameLabel}
          </button>
        </div>
      </div>

      {/* 当前尺寸提示 */}
      <div style={{
        padding: '4px 16px',
        backgroundColor: colors.surfaceVariant,
        fontSize: 12,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
      }}>
        网格尺寸: {gridRows} × {gridCols}
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
        backgroundColor: 'transparent',
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
        inputMode={inputMode}
        candidateChars={candidateChars}
      />

      {/* 设置弹窗 */}
      {showSettings && (
        <SettingsDialog
          rows={gridRows}
          cols={gridCols}
          onConfirm={(rows, cols) => {
            setShowSettings(false);
            onNewGame(rows, cols);
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

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
            borderRadius: 8,
            textAlign: 'center',
            minWidth: 200,
            border: `1px solid ${colors.outline}`,
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
  backgroundColor: colors.background,
  backgroundImage: 'var(--cw-background-pattern)',
  backgroundSize: '28px 28px',
  color: colors.onBackground,
};

const buttonStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0 16px',
  backgroundColor: colors.primary,
  color: colors.onPrimary,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
};
