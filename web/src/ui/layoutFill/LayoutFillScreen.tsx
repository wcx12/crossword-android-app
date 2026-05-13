import React, { useEffect, useMemo, useState } from 'react';
import type { WordEntry } from '../../data/model/WordEntry';
import { parseWordList } from '../../data/local/WordListLoader';
import { WordListInfo } from '../../data/model/WordListInfo';
import { colors } from '../theme/theme';
import {
  inputStyle,
  labelStyle,
  navButtonStyle,
  pageHeaderActionsStyle,
  pageHeaderLeftStyle,
  pageHeaderStyle,
  pageShellStyle,
  pageTitleStyle,
  panelStyle,
  primaryButtonStyle,
  quietButtonStyle,
} from '../theme/pageStyles';
import { analyzeLayout } from './layoutAnalysis';
import { solveLayout } from './layoutSolver';

type LayoutCell = { isBlack: boolean };
type LayoutMatrix = LayoutCell[][];
type LayoutSolution = Extract<ReturnType<typeof solveLayout>, { ok: true }>;

interface LayoutFillScreenProps {
  wordLists: WordListInfo[];
  customWordData: Record<string, { word: string; clue: string }[]>;
  currentWordListId: string | null;
  onBack: () => void;
  onPlay: (
    grid: { isBlack: boolean; letter: string }[][],
    words: { word: string; clue: string; row: number; col: number; direction: 'across' | 'down' }[]
  ) => void;
}

const MIN_SIZE = 3;
const MAX_SIZE = 15;

export const LayoutFillScreen: React.FC<LayoutFillScreenProps> = ({
  wordLists,
  customWordData,
  currentWordListId,
  onBack,
  onPlay,
}) => {
  const initialListId = currentWordListId && wordLists.some(list => list.id === currentWordListId)
    ? currentWordListId
    : wordLists[0]?.id ?? '';

  const [layout, setLayout] = useState<LayoutMatrix>(() => createSingleSlotLayout(4));
  const [selectedListId, setSelectedListId] = useState(initialListId);
  const [message, setMessage] = useState('选择词库后可按当前黑白布局自动填词。');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<LayoutSolution | null>(null);

  const rows = layout.length;
  const cols = layout[0]?.length ?? 0;
  const selectedList = wordLists.find(list => list.id === selectedListId);
  const analysis = useMemo(() => analyzeLayout(layout), [layout]);
  const issueMessages = getIssueMessages(analysis);
  const lengthSummary = formatLengthRequirements(analysis.lengthRequirements);

  useEffect(() => {
    if (selectedListId && wordLists.some(list => list.id === selectedListId)) return;
    setSelectedListId(wordLists[0]?.id ?? '');
  }, [selectedListId, wordLists]);

  const clearSolution = (nextMessage?: string) => {
    setSolution(null);
    if (nextMessage) setMessage(nextMessage);
  };

  const updateRows = (nextRows: number) => {
    setLayout(prev => resizeLayout(prev, clampSize(nextRows), cols || clampSize(nextRows)));
    clearSolution('布局尺寸已更新。');
  };

  const updateCols = (nextCols: number) => {
    setLayout(prev => resizeLayout(prev, rows || clampSize(nextCols), clampSize(nextCols)));
    clearSolution('布局尺寸已更新。');
  };

  const toggleCell = (row: number, col: number) => {
    setLayout(prev => prev.map((line, rowIndex) =>
      line.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? { isBlack: !cell.isBlack } : cell
      )
    ));
    clearSolution('布局已更新。');
  };

  const applySample = (size: number) => {
    setLayout(createSingleSlotLayout(size));
    clearSolution(`${size} 格示例布局已载入。`);
  };

  const clearLayout = () => {
    setLayout(createLayout(rows, cols, false));
    clearSolution('已切换为空白布局。');
  };

  const fillBlackLayout = () => {
    setLayout(createLayout(rows, cols, true));
    clearSolution('已清空所有开放格。');
  };

  const handleSolve = async () => {
    if (isSolving) return;
    if (!selectedList) {
      setMessage('请先选择一个词库。');
      return;
    }

    setIsSolving(true);
    setSolution(null);

    try {
      const entries = await loadEntries(selectedList, customWordData);
      if (entries.length === 0) {
        setMessage('当前词库没有可用词条。');
        return;
      }

      const result = solveLayout(layout, entries);
      if (result.ok) {
        setSolution(result);
        setMessage(`已填满 ${result.words.length} 个位置，可以开始游戏。`);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`词库加载失败：${errorMessage}`);
    } finally {
      setIsSolving(false);
    }
  };

  const handleStart = () => {
    if (!solution) return;
    onPlay(solution.grid, solution.words);
  };

  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button type="button" onClick={onBack} style={navButtonStyle}>
            返回
          </button>
          <span style={pageTitleStyle}>输入布局自动填词</span>
        </div>
        <div style={pageHeaderActionsStyle}>
          <button type="button" onClick={() => applySample(4)} style={quietButtonStyle}>
            四格示例
          </button>
          <button type="button" onClick={() => applySample(5)} style={quietButtonStyle}>
            五格示例
          </button>
          <button type="button" onClick={handleSolve} disabled={isSolving} style={primaryButtonStyle(isSolving)}>
            {isSolving ? '填词中...' : '自动填词'}
          </button>
          <button type="button" onClick={handleStart} disabled={!solution} style={primaryButtonStyle(!solution)}>
            开始游戏
          </button>
        </div>
      </div>

      <div style={screenBodyStyle}>
        <section style={{ ...panelStyle, ...layoutPanelStyle }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h1 style={sectionTitleStyle}>布局</h1>
              <div style={sectionMetaStyle}>
                {analysis.slots.length} 个位置 · {analysis.isConnected ? '连通' : '未连通'}
              </div>
            </div>

            <div style={sizeControlsStyle}>
              <label style={compactFieldStyle}>
                <span style={labelStyle}>行</span>
                <input
                  id="layout-fill-rows"
                  name="layout-fill-rows"
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={rows}
                  onChange={event => updateRows(Number(event.target.value))}
                  style={numberInputStyle}
                />
              </label>
              <label style={compactFieldStyle}>
                <span style={labelStyle}>列</span>
                <input
                  id="layout-fill-cols"
                  name="layout-fill-cols"
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={cols}
                  onChange={event => updateCols(Number(event.target.value))}
                  style={numberInputStyle}
                />
              </label>
            </div>
          </div>

          <div style={gridWrapStyle}>
            <div
              style={{
                ...layoutGridStyle,
                gridTemplateColumns: `repeat(${cols}, 42px)`,
                gridTemplateRows: `repeat(${rows}, 42px)`,
              }}
            >
              {layout.map((line, row) =>
                line.map((cell, col) => {
                  const solvedLetter = solution?.grid[row]?.[col]?.letter ?? '';
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      aria-label={`${row + 1}-${col + 1}`}
                      onClick={() => toggleCell(row, col)}
                      style={layoutCellStyle(cell.isBlack, Boolean(solvedLetter))}
                    >
                      {cell.isBlack ? '' : solvedLetter}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div style={layoutActionsStyle}>
            <button type="button" onClick={clearLayout} style={quietButtonStyle}>
              全部开放
            </button>
            <button type="button" onClick={fillBlackLayout} style={quietButtonStyle}>
              全部封黑
            </button>
          </div>
        </section>

        <aside style={{ ...panelStyle, ...sidePanelStyle }}>
          <label style={fieldBlockStyle}>
            <span style={labelStyle}>词库</span>
            <select
              id="layout-fill-word-list"
              name="layout-fill-word-list"
              value={selectedListId}
              onChange={event => {
                setSelectedListId(event.target.value);
                clearSolution('词库已更新。');
              }}
              style={inputStyle(false)}
            >
              {wordLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.wordCount})
                </option>
              ))}
            </select>
          </label>

          <section style={summaryGridStyle}>
            <div style={summaryCardStyle}>
              <span style={summaryValueStyle}>{analysis.slots.length}</span>
              <span style={summaryLabelStyle}>位置</span>
            </div>
            <div style={summaryCardStyle}>
              <span style={summaryValueStyle}>{lengthSummary || '无'}</span>
              <span style={summaryLabelStyle}>长度需求</span>
            </div>
          </section>

          <div style={statusStyle(issueMessages.length > 0, Boolean(solution))}>
            {message}
          </div>

          <section style={infoSectionStyle}>
            <h2 style={infoTitleStyle}>布局检查</h2>
            {issueMessages.length === 0 ? (
              <p style={emptyTextStyle}>当前布局可以尝试填词。</p>
            ) : (
              <div style={issueListStyle}>
                {issueMessages.map((issue, index) => (
                  <div key={`${issue}-${index}`} style={issueRowStyle}>
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={infoSectionStyle}>
            <h2 style={infoTitleStyle}>位置列表</h2>
            {analysis.slots.length === 0 ? (
              <p style={emptyTextStyle}>暂无可填位置。</p>
            ) : (
              <div style={slotListStyle}>
                {analysis.slots.slice(0, 12).map(slot => (
                  <div key={slot.id} style={slotRowStyle}>
                    <span style={slotLabelStyle}>{slot.direction === 'across' ? '横' : '竖'}</span>
                    <span style={slotTextStyle}>
                      {slot.row + 1},{slot.col + 1} · {slot.length} 格
                    </span>
                  </div>
                ))}
                {analysis.slots.length > 12 && (
                  <div style={moreTextStyle}>还有 {analysis.slots.length - 12} 个位置</div>
                )}
              </div>
            )}
          </section>

          {solution && (
            <section style={infoSectionStyle}>
              <h2 style={infoTitleStyle}>已填词</h2>
              <div style={slotListStyle}>
                {solution.words.slice(0, 10).map(word => (
                  <div key={`${word.direction}-${word.row}-${word.col}`} style={wordRowStyle}>
                    <span style={wordTextStyle}>{word.word}</span>
                    <span style={wordMetaStyle}>{word.direction === 'across' ? '横' : '竖'}</span>
                  </div>
                ))}
                {solution.words.length > 10 && (
                  <div style={moreTextStyle}>还有 {solution.words.length - 10} 个词</div>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

async function loadEntries(
  wordList: WordListInfo,
  customWordData: Record<string, { word: string; clue: string }[]>
): Promise<{ word: string; clue: string }[]> {
  if (!wordList.isSystem) {
    return (customWordData[wordList.id] ?? []).map(entry => ({
      word: entry.word,
      clue: entry.clue,
    }));
  }

  const response = await fetch(wordList.filePath);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  return parseWordList(text).map((entry: WordEntry) => ({
    word: entry.word,
    clue: entry.clue,
  }));
}

function createLayout(rows: number, cols: number, isBlack: boolean): LayoutMatrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isBlack }))
  );
}

function createSingleSlotLayout(size: number): LayoutMatrix {
  const next = createLayout(size, size, true);
  const row = Math.floor(size / 2);
  for (let col = 0; col < size; col += 1) {
    next[row][col] = { isBlack: false };
  }
  return next;
}

function resizeLayout(layout: LayoutMatrix, rows: number, cols: number): LayoutMatrix {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      isBlack: layout[row]?.[col]?.isBlack ?? true,
    }))
  );
}

function clampSize(value: number): number {
  if (!Number.isFinite(value)) return MIN_SIZE;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value)));
}

function formatLengthRequirements(requirements: Record<number, number>): string {
  return Object.entries(requirements)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([length, count]) => `${length}x${count}`)
    .join('、');
}

function getIssueMessages(analysis: ReturnType<typeof analyzeLayout>): string[] {
  return analysis.issues.map(issue => issue.message);
}

const screenBodyStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 360px',
  gap: 16,
  padding: 16,
  boxSizing: 'border-box',
};

const layoutPanelStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const sidePanelStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: 16,
  overflow: 'auto',
};

const sectionHeaderStyle: React.CSSProperties = {
  minHeight: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '14px 16px',
  borderBottom: `1px solid ${colors.outline}`,
  boxSizing: 'border-box',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.15,
  color: colors.onSurface,
};

const sectionMetaStyle: React.CSSProperties = {
  marginTop: 6,
  color: colors.onSurfaceVariant,
  fontSize: 13,
  fontWeight: 700,
};

const sizeControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const compactFieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
};

const numberInputStyle: React.CSSProperties = {
  width: 72,
  minHeight: 38,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  padding: '6px 8px',
  backgroundColor: colors.surface,
  color: colors.onSurface,
  fontSize: 14,
  fontWeight: 800,
  boxSizing: 'border-box',
};

const gridWrapStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  padding: 20,
  overflow: 'auto',
  backgroundColor: colors.surfaceVariant,
};

const layoutGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 2,
  padding: 10,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
};

const layoutCellStyle = (isBlack: boolean, hasSolvedLetter: boolean): React.CSSProperties => ({
  width: 42,
  height: 42,
  border: `1px solid ${isBlack ? colors.cellBlocked : colors.outline}`,
  borderRadius: 4,
  backgroundColor: isBlack ? colors.cellBlocked : hasSolvedLetter ? colors.cellRelated : colors.cellEmpty,
  color: colors.textPrimary,
  cursor: 'pointer',
  fontSize: 21,
  fontWeight: 900,
  lineHeight: 1,
});

const layoutActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: 12,
  borderTop: `1px solid ${colors.outline}`,
  backgroundColor: colors.surface,
};

const fieldBlockStyle: React.CSSProperties = {
  display: 'block',
};

const summaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const summaryCardStyle: React.CSSProperties = {
  minHeight: 78,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 4,
  padding: 12,
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
  boxSizing: 'border-box',
};

const summaryValueStyle: React.CSSProperties = {
  color: colors.primary,
  fontSize: 18,
  fontWeight: 900,
  overflowWrap: 'anywhere',
};

const summaryLabelStyle: React.CSSProperties = {
  color: colors.onSurfaceVariant,
  fontSize: 12,
  fontWeight: 800,
};

const statusStyle = (hasIssue: boolean, isSolved: boolean): React.CSSProperties => ({
  border: `1px solid ${hasIssue ? colors.error : isSolved ? colors.primary : colors.outline}`,
  borderRadius: 8,
  padding: '12px 14px',
  backgroundColor: isSolved ? colors.primaryContainer : colors.surface,
  color: hasIssue ? colors.error : isSolved ? colors.onPrimaryContainer : colors.onSurfaceVariant,
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.45,
});

const infoSectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const infoTitleStyle: React.CSSProperties = {
  margin: 0,
  color: colors.onSurface,
  fontSize: 14,
  fontWeight: 900,
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.onSurfaceVariant,
  fontSize: 13,
  lineHeight: 1.5,
};

const issueListStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const issueRowStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${colors.error}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  color: colors.error,
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.4,
};

const slotListStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
};

const slotRowStyle: React.CSSProperties = {
  minHeight: 36,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxSizing: 'border-box',
};

const slotLabelStyle: React.CSSProperties = {
  minWidth: 26,
  height: 24,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 6,
  backgroundColor: colors.primaryContainer,
  color: colors.onPrimaryContainer,
  fontSize: 12,
  fontWeight: 900,
};

const slotTextStyle: React.CSSProperties = {
  color: colors.onSurface,
  fontSize: 13,
  fontWeight: 800,
};

const wordRowStyle: React.CSSProperties = {
  minHeight: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '6px 8px',
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxSizing: 'border-box',
};

const wordTextStyle: React.CSSProperties = {
  color: colors.onSurface,
  fontSize: 13,
  fontWeight: 900,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const wordMetaStyle: React.CSSProperties = {
  color: colors.primary,
  fontSize: 12,
  fontWeight: 900,
};

const moreTextStyle: React.CSSProperties = {
  color: colors.onSurfaceVariant,
  fontSize: 12,
  fontWeight: 800,
};
