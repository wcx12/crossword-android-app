import React, { useMemo, useState } from 'react';
import { colors } from '../theme/theme';
import {
  inputStyle,
  navButtonStyle,
  pageHeaderLeftStyle,
  pageHeaderStyle,
  pageShellStyle,
  pageTitleStyle,
  primaryButtonStyle,
  quietButtonStyle,
} from '../theme/pageStyles';
import {
  deleteEntry,
  deriveGrid,
  getEntryChars,
  normalizeEntryWord,
  placeEntry,
  removePlacement,
  toPlayablePuzzle,
  validatePlacement,
} from './gridDraftLogic';
import type {
  DraftDirection,
  DraftEntry,
  DraftPlacement,
  ValidationResult,
} from './gridDraftLogic';

interface WordData {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: DraftDirection;
}

interface GridEditorScreenProps {
  onBack: () => void;
  onPlay: (grid: { isBlack: boolean; letter: string }[][], words: WordData[]) => void;
}

type DragSource = 'pool' | 'grid';

interface DragPayload {
  entryId: string;
  source: DragSource;
}

interface PreviewState {
  entryId: string;
  validation: ValidationResult;
  cells: Array<{ row: number; col: number; letter: string }>;
}

const DRAG_MIME = 'application/x-crossword-entry';

const createEntryId = () => `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const directionLabel = (direction: DraftDirection) => (direction === 'across' ? '横向' : '纵向');

const getPlacementCells = (
  entry: DraftEntry | undefined,
  placement: DraftPlacement,
): Array<{ row: number; col: number; letter: string }> => {
  if (!entry) return [];

  return getEntryChars(entry).map((letter, index) => ({
    row: placement.row + (placement.direction === 'down' ? index : 0),
    col: placement.col + (placement.direction === 'across' ? index : 0),
    letter,
  }));
};

const parseDragPayload = (event: React.DragEvent): DragPayload | null => {
  const rawPayload = event.dataTransfer.getData(DRAG_MIME);
  if (!rawPayload) return null;

  try {
    const payload = JSON.parse(rawPayload) as Partial<DragPayload>;
    if (
      typeof payload.entryId === 'string' &&
      (payload.source === 'pool' || payload.source === 'grid')
    ) {
      return { entryId: payload.entryId, source: payload.source };
    }
  } catch {
    return null;
  }

  return null;
};

export const GridEditorScreen: React.FC<GridEditorScreenProps> = ({ onBack, onPlay }) => {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [entries, setEntries] = useState<DraftEntry[]>([]);
  const [placements, setPlacements] = useState<DraftPlacement[]>([]);
  const [wordInput, setWordInput] = useState('');
  const [clueInput, setClueInput] = useState('');
  const [direction, setDirection] = useState<DraftDirection>('across');
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const grid = useMemo(
    () => deriveGrid(entries, placements, rows, cols),
    [entries, placements, rows, cols],
  );

  const placedEntryIds = useMemo(
    () => new Set(placements.map((placement) => placement.entryId)),
    [placements],
  );

  const waitingEntries = useMemo(
    () => entries.filter((entry) => !placedEntryIds.has(entry.id)),
    [entries, placedEntryIds],
  );

  const placedEntries = useMemo(
    () =>
      placements.flatMap((placement) => {
        const entry = entries.find((candidate) => candidate.id === placement.entryId);
        return entry ? [{ entry, placement }] : [];
      }),
    [entries, placements],
  );

  const previewByCell = useMemo(() => {
    const cellMap = new Map<string, { letter: string; valid: boolean }>();
    preview?.cells.forEach((cell) => {
      if (cell.row >= 0 && cell.row < rows && cell.col >= 0 && cell.col < cols) {
        cellMap.set(`${cell.row}:${cell.col}`, {
          letter: cell.letter,
          valid: preview.validation.valid,
        });
      }
    });
    return cellMap;
  }, [cols, preview, rows]);

  const canPlay = placements.length > 0;

  const resetPreview = () => {
    setPreview(null);
  };

  const setDragData = (
    event: React.DragEvent,
    entryId: string,
    source: DragSource,
  ) => {
    const payload = { entryId, source };
    event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    setActiveDrag(payload);
    setMessage(null);
  };

  const finishDrag = () => {
    setActiveDrag(null);
    resetPreview();
  };

  const handleAddEntry = () => {
    const normalizedWord = normalizeEntryWord(wordInput);
    if (!normalizedWord) {
      setMessage('请先输入词或成语。');
      return;
    }

    setEntries((currentEntries) => [
      ...currentEntries,
      {
        id: createEntryId(),
        word: normalizedWord,
        clue: clueInput.trim(),
      },
    ]);
    setWordInput('');
    setClueInput('');
    setMessage(null);
  };

  const resizeGrid = (nextRows: number, nextCols: number) => {
    const safeRows = Math.min(15, Math.max(5, nextRows || 10));
    const safeCols = Math.min(15, Math.max(5, nextCols || 10));

    setRows(safeRows);
    setCols(safeCols);
    setPlacements((currentPlacements) => {
      const keptPlacements = currentPlacements.filter((placement) =>
        validatePlacement(entries, currentPlacements, placement, safeRows, safeCols, {
          ignoreEntryId: placement.entryId,
        }).valid,
      );

      if (keptPlacements.length !== currentPlacements.length) {
        setMessage('网格尺寸变小后，超出范围的词条已回到待放入。');
      }

      return keptPlacements;
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    const result = deleteEntry(entries, placements, entryId);
    setEntries(result.entries);
    setPlacements(result.placements);
    setMessage(null);
  };

  const handleGridDragOver = (
    event: React.DragEvent,
    row: number,
    col: number,
  ) => {
    const payload = activeDrag;
    if (!payload) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const draftPlacement: DraftPlacement = {
      entryId: payload.entryId,
      row,
      col,
      direction,
    };
    const entry = entries.find((candidate) => candidate.id === payload.entryId);
    const validation = validatePlacement(
      entries,
      placements,
      draftPlacement,
      rows,
      cols,
      payload.source === 'grid' ? { ignoreEntryId: payload.entryId } : undefined,
    );

    setPreview({
      entryId: payload.entryId,
      validation,
      cells: getPlacementCells(entry, draftPlacement),
    });
  };

  const handleGridDrop = (
    event: React.DragEvent,
    row: number,
    col: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const payload = parseDragPayload(event) ?? activeDrag;
    finishDrag();
    if (!payload) return;

    const draftPlacement: DraftPlacement = {
      entryId: payload.entryId,
      row,
      col,
      direction,
    };

    const result = placeEntry(
      entries,
      placements,
      draftPlacement,
      rows,
      cols,
      payload.source === 'grid' ? { ignoreEntryId: payload.entryId } : undefined,
    );

    if (!result.validation.valid) {
      setMessage(result.validation.reason ?? '这个位置无法放置该词条。');
      return;
    }

    setPlacements(result.placements);
    setMessage(null);
  };

  const handleGridDragLeave = (event: React.DragEvent) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    resetPreview();
  };

  const handlePoolDragOver = (event: React.DragEvent) => {
    if (activeDrag?.source !== 'grid') return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handlePoolDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const payload = parseDragPayload(event) ?? activeDrag;
    finishDrag();
    if (!payload || payload.source !== 'grid') return;

    setPlacements((currentPlacements) => removePlacement(currentPlacements, payload.entryId));
    setMessage(null);
  };

  const handlePlay = () => {
    const puzzle = toPlayablePuzzle(entries, placements, rows, cols);
    if (puzzle.words.length === 0) {
      setMessage('请至少把一个词条拖入网格。');
      return;
    }

    onPlay(puzzle.grid, puzzle.words);
  };

  const renderEntryCard = (
    entry: DraftEntry,
    source: DragSource,
    placement?: DraftPlacement,
  ) => (
    <div
      key={entry.id}
      draggable
      onDragStart={(event) => setDragData(event, entry.id, source)}
      onDragEnd={finishDrag}
      style={{
        padding: '10px 12px',
        border: `1px solid ${colors.outline}`,
        borderRadius: 8,
        backgroundColor: colors.surface,
        boxShadow: 'var(--cw-card-shadow)',
        cursor: 'grab',
        display: 'grid',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: colors.onSurface,
              fontSize: 16,
              fontWeight: 900,
              lineHeight: 1.2,
              overflowWrap: 'anywhere',
            }}
          >
            {normalizeEntryWord(entry.word)}
          </div>
          <div
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 12,
              lineHeight: 1.35,
              overflowWrap: 'anywhere',
            }}
          >
            {entry.clue || '无提示'}
          </div>
        </div>
        <button
          onClick={() => handleDeleteEntry(entry.id)}
          style={{
            minHeight: 32,
            border: 'none',
            borderRadius: 8,
            backgroundColor: colors.error,
            color: colors.onError,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 800,
            padding: '0 10px',
          }}
        >
          删除
        </button>
      </div>
      {placement && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            color: colors.onSurfaceVariant,
            fontSize: 12,
          }}
        >
          <span>
            {directionLabel(placement.direction)} · 第 {placement.row + 1} 行，第 {placement.col + 1} 列
          </span>
          <button
            onClick={() => {
              setPlacements((currentPlacements) => removePlacement(currentPlacements, entry.id));
              setMessage(null);
            }}
            style={{
              ...quietButtonStyle,
              minHeight: 32,
              padding: '0 10px',
              fontSize: 12,
            }}
          >
            收回
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button onClick={onBack} style={navButtonStyle}>
            返回
          </button>
          <span style={pageTitleStyle}>创建谜题</span>
        </div>
      </div>

      <div
        style={{
          padding: '12px 16px',
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.outline}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          boxShadow: 'var(--cw-card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: 800 }}>网格</span>
          <input
            type="number"
            min={5}
            max={15}
            value={rows}
            onChange={(event) => resizeGrid(Number(event.target.value), cols)}
            style={{ ...inputStyle(), width: 68 }}
          />
          <span style={{ color: colors.onSurfaceVariant }}>x</span>
          <input
            type="number"
            min={5}
            max={15}
            value={cols}
            onChange={(event) => resizeGrid(rows, Number(event.target.value))}
            style={{ ...inputStyle(), width: 68 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: colors.onSurfaceVariant, fontSize: 12, fontWeight: 800 }}>方向</span>
          {(['across', 'down'] as DraftDirection[]).map((candidateDirection) => {
            const selected = direction === candidateDirection;
            return (
              <button
                key={candidateDirection}
                onClick={() => setDirection(candidateDirection)}
                style={{
                  minHeight: 36,
                  padding: '0 12px',
                  border: `1px solid ${selected ? colors.primary : colors.outline}`,
                  borderRadius: 999,
                  backgroundColor: selected ? colors.primary : colors.surface,
                  color: selected ? colors.onPrimary : colors.primary,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {directionLabel(candidateDirection)}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={handlePlay}
          disabled={!canPlay}
          style={primaryButtonStyle(!canPlay)}
        >
          开始游戏
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: colors.surfaceVariant,
            borderBottom: `1px solid ${colors.outline}`,
            color: message.includes('无法') || message.includes('请') ? colors.error : colors.onSurfaceVariant,
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '320px minmax(520px, 1fr)',
          gap: 16,
          padding: 16,
          overflow: 'auto',
        }}
      >
        <aside
          style={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflow: 'auto',
            paddingRight: 2,
          }}
        >
          <section
            style={{
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              backgroundColor: colors.surface,
              boxShadow: 'var(--cw-card-shadow)',
              padding: 12,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ color: colors.onSurface, fontSize: 15, fontWeight: 900 }}>新建词条</div>
            <input
              type="text"
              value={wordInput}
              onChange={(event) => setWordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleAddEntry();
                }
              }}
              placeholder="词或成语"
              style={inputStyle(!wordInput.trim() && message === '请先输入词或成语。')}
            />
            <input
              type="text"
              value={clueInput}
              onChange={(event) => setClueInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleAddEntry();
                }
              }}
              placeholder="提示（可选）"
              style={inputStyle()}
            />
            <button onClick={handleAddEntry} style={primaryButtonStyle(false)}>
              添加到词条池
            </button>
          </section>

          <section
            onDragOver={handlePoolDragOver}
            onDrop={handlePoolDrop}
            style={{
              border: `1px dashed ${activeDrag?.source === 'grid' ? colors.primary : colors.outline}`,
              borderRadius: 8,
              backgroundColor: activeDrag?.source === 'grid' ? colors.primaryContainer : colors.surfaceVariant,
              padding: 12,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ color: colors.onSurface, fontSize: 15, fontWeight: 900 }}>
              待放入 ({waitingEntries.length})
            </div>
            {waitingEntries.length === 0 ? (
              <div style={{ color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 1.5 }}>
                新词条会出现在这里。已放置词条拖回左侧可取消放置。
              </div>
            ) : (
              waitingEntries.map((entry) => renderEntryCard(entry, 'pool'))
            )}
          </section>

          <section
            style={{
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              backgroundColor: colors.surface,
              boxShadow: 'var(--cw-card-shadow)',
              padding: 12,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ color: colors.onSurface, fontSize: 15, fontWeight: 900 }}>
              已放置 ({placedEntries.length})
            </div>
            {placedEntries.length === 0 ? (
              <div style={{ color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 1.5 }}>
                从待放入拖到右侧网格后会显示在这里。
              </div>
            ) : (
              placedEntries.map(({ entry, placement }) => renderEntryCard(entry, 'grid', placement))
            )}
          </section>
        </aside>

        <main
          onDragLeave={handleGridDragLeave}
          style={{
            minHeight: 0,
            overflow: 'auto',
            border: `1px solid ${colors.outline}`,
            borderRadius: 8,
            backgroundColor: colors.surface,
            boxShadow: 'var(--cw-card-shadow)',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'inline-grid',
              gridTemplateColumns: `repeat(${cols}, 34px)`,
              gridTemplateRows: `repeat(${rows}, 34px)`,
              border: `2px solid ${colors.outline}`,
              backgroundColor: colors.outline,
              gap: 1,
              userSelect: 'none',
            }}
          >
            {grid.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const ownerId = cell.owners[0];
                const previewCell = previewByCell.get(`${rowIndex}:${colIndex}`);
                const previewIsValid = previewCell?.valid ?? false;
                const isPreview = Boolean(previewCell);
                const displayedLetter = previewCell?.letter ?? cell.letter;
                const isOpen = !cell.isBlack || isPreview;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    draggable={Boolean(ownerId)}
                    onDragStart={(event) => {
                      if (ownerId) {
                        setDragData(event, ownerId, 'grid');
                      }
                    }}
                    onDragEnd={finishDrag}
                    onDragOver={(event) => handleGridDragOver(event, rowIndex, colIndex)}
                    onDrop={(event) => handleGridDrop(event, rowIndex, colIndex)}
                    title={ownerId ? '拖动已放置词条' : undefined}
                    style={{
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      backgroundColor: isPreview
                        ? previewIsValid
                          ? colors.cellRelated
                          : '#FEE2E2'
                        : isOpen
                          ? colors.cellEmpty
                          : colors.cellBlocked,
                      color: isPreview && !previewIsValid
                        ? colors.error
                        : isOpen
                          ? colors.textPrimary
                          : colors.onPrimary,
                      border: isPreview
                        ? `2px solid ${previewIsValid ? colors.accent : colors.error}`
                        : `1px solid ${isOpen ? colors.outlineVariant : colors.cellBlocked}`,
                      cursor: ownerId ? 'grab' : activeDrag ? 'copy' : 'default',
                      fontSize: 15,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {displayedLetter}
                  </div>
                );
              }),
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
