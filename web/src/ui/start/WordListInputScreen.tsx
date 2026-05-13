import React, { useMemo } from 'react';
import { colors } from '../theme/theme';
import {
  inputStyle,
  navButtonStyle,
  pageHeaderLeftStyle,
  pageHeaderStyle,
  pageShellStyle,
  pageTitleStyle,
  primaryButtonStyle,
} from '../theme/pageStyles';
import { CustomWordGenerationOptions, CustomWordGenerationResult } from '../game/customWordGeneration';
import { canStartFromParse, parseWordListInput, WordListInputEntry } from './wordListInputParser';

interface WordListInputScreenProps {
  onBack: () => void;
  onConfirm: (
    entries: WordListInputEntry[],
    options?: CustomWordGenerationOptions
  ) => CustomWordGenerationResult | Promise<CustomWordGenerationResult>;
}

const sampleText = `PYTHON 一种编程语言
REACT 前端 UI 库
画蛇添足 多此一举
HONOR`;

export const WordListInputScreen: React.FC<WordListInputScreenProps> = ({
  onBack,
  onConfirm,
}) => {
  const [content, setContent] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationResult, setGenerationResult] = React.useState<CustomWordGenerationResult | null>(null);
  const parseResult = useMemo(() => parseWordListInput(content), [content]);
  const canStart = canStartFromParse(parseResult);
  const hasContent = parseResult.nonEmptyLineCount > 0;
  const disabledReason = getDisabledReason(parseResult.entries.length, parseResult.issues.length, hasContent);
  const strictFailure = generationResult && !generationResult.ok ? generationResult : null;
  const canUsePartial = (strictFailure?.placedEntries.length ?? 0) >= 2;

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    setGenerationResult(null);
  };

  const handleStart = async () => {
    if (!canStart || isGenerating) return;
    setIsGenerating(true);
    const result = await onConfirm(parseResult.entries, { requireAllWords: true });
    setGenerationResult(result.ok ? null : result);
    setIsGenerating(false);
  };

  const handleUsePartial = async () => {
    if (!strictFailure || !canUsePartial || isGenerating) return;
    setIsGenerating(true);
    const result = await onConfirm(strictFailure.placedEntries, { requireAllWords: false });
    setGenerationResult(result.ok ? null : result);
    setIsGenerating(false);
  };

  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button type="button" onClick={onBack} style={navButtonStyle}>
            返回
          </button>
          <span style={pageTitleStyle}>输入词表生成</span>
        </div>
      </div>

      <div style={screenBodyStyle}>
        <section style={inputPanelStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h1 style={sectionTitleStyle}>粘贴词表</h1>
              <p style={sectionCopyStyle}>
                每行一个词条，第一段是词，后面是可选提示。通过后会自动保存到我的词库并开始游戏。
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setContent(sampleText);
                setGenerationResult(null);
              }}
              style={sampleButtonStyle}
            >
              填入示例
            </button>
          </div>

          <div style={formatBoxStyle}>
            <span style={formatLabelStyle}>格式</span>
            <code style={formatCodeStyle}>PYTHON 一种编程语言</code>
            <code style={formatCodeStyle}>画蛇添足 多此一举</code>
          </div>

          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="每行一个词条，例如：&#10;PYTHON 一种编程语言&#10;REACT 前端 UI 库&#10;画蛇添足 多此一举&#10;HONOR"
            style={textAreaStyle(parseResult.issues.length > 0)}
          />
        </section>

        <aside style={previewPanelStyle}>
          <div style={summaryStyle}>
            <div style={summaryItemStyle}>
              <span style={summaryNumberStyle}>{parseResult.entries.length}</span>
              <span style={summaryLabelStyle}>有效词条</span>
            </div>
            <div style={summaryItemStyle}>
              <span style={{
                ...summaryNumberStyle,
                color: parseResult.issues.length > 0 ? colors.error : colors.primary,
              }}>
                {parseResult.issues.length}
              </span>
              <span style={summaryLabelStyle}>问题行</span>
            </div>
          </div>

          <div style={statusBoxStyle(canStart && !strictFailure, parseResult.issues.length > 0 || Boolean(strictFailure))}>
            {strictFailure?.message ?? (canStart ? '词表校验通过，可以开始游戏。' : disabledReason)}
          </div>

          <section style={previewSectionStyle}>
            <h2 style={previewTitleStyle}>有效预览</h2>
            {parseResult.entries.length === 0 ? (
              <p style={emptyTextStyle}>还没有可用词条。</p>
            ) : (
              <div style={entryListStyle}>
                {parseResult.entries.slice(0, 8).map(entry => (
                  <div key={entry.word} style={entryRowStyle}>
                    <span style={entryWordStyle}>{entry.word}</span>
                    <span style={entryClueStyle}>{entry.clue || '无提示'}</span>
                  </div>
                ))}
                {parseResult.entries.length > 8 && (
                  <div style={moreTextStyle}>还有 {parseResult.entries.length - 8} 个词条</div>
                )}
              </div>
            )}
          </section>

          {parseResult.issues.length > 0 && (
            <section style={previewSectionStyle}>
              <h2 style={previewTitleStyle}>需要修正</h2>
              <div style={issueListStyle}>
                {parseResult.issues.map(issue => (
                  <div key={`${issue.lineNumber}-${issue.reason}`} style={issueRowStyle}>
                    <div style={issueMetaStyle}>第 {issue.lineNumber} 行 · {issue.reason}</div>
                    <div style={issueTextStyle}>{issue.text}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {strictFailure && (
            <section style={previewSectionStyle}>
              <h2 style={previewTitleStyle}>生成结果</h2>
              <div style={generationIssueStyle}>
                <div style={issueMetaStyle}>
                  已放入 {strictFailure.placedCount}/{strictFailure.totalCount} 个词
                </div>
                <div style={issueTextStyle}>
                  未能放入：{strictFailure.missingWords.join('、')}
                </div>
                {!canUsePartial && (
                  <div style={partialHintStyle}>可连通部分不足 2 个词，暂时不能直接开始游戏。</div>
                )}
              </div>
              <div style={generationActionsStyle}>
                <button
                  type="button"
                  onClick={() => setGenerationResult(null)}
                  style={secondaryActionStyle}
                >
                  继续编辑词表
                </button>
                <button
                  type="button"
                  onClick={handleUsePartial}
                  disabled={!canUsePartial || isGenerating}
                  style={partialActionStyle(!canUsePartial || isGenerating)}
                >
                  只用可连通部分生成
                </button>
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || isGenerating}
            style={{ ...primaryButtonStyle(!canStart || isGenerating), width: '100%', marginTop: 'auto' }}
          >
            {isGenerating ? '正在生成...' : '开始游戏并保存到我的词库'}
          </button>
        </aside>
      </div>
    </div>
  );
};

function getDisabledReason(validCount: number, issueCount: number, hasContent: boolean): string {
  if (!hasContent) return '请先粘贴至少 2 个词条。';
  if (issueCount > 0) return '当前有无效行，请修正后再开始。';
  if (validCount < 2) return '至少需要 2 个有效词条。';
  return '请检查词表内容。';
}

const screenBodyStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 360px',
  gap: 16,
  padding: 16,
  overflow: 'auto',
  boxSizing: 'border-box',
};

const inputPanelStyle: React.CSSProperties = {
  minWidth: 0,
  minHeight: 520,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxShadow: 'var(--cw-card-shadow)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  boxSizing: 'border-box',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: colors.onSurface,
  fontSize: 22,
  lineHeight: 1.2,
};

const sectionCopyStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: colors.onSurfaceVariant,
  fontSize: 14,
  lineHeight: 1.5,
};

const sampleButtonStyle: React.CSSProperties = {
  minHeight: 40,
  border: `1px solid ${colors.outline}`,
  borderRadius: 999,
  backgroundColor: colors.surfaceVariant,
  color: colors.primary,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 800,
  padding: '0 14px',
};

const formatBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  padding: 10,
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
};

const formatLabelStyle: React.CSSProperties = {
  color: colors.onSurfaceVariant,
  fontSize: 12,
  fontWeight: 800,
};

const formatCodeStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 6,
  backgroundColor: colors.surface,
  color: colors.onSurface,
  fontSize: 12,
};

const textAreaStyle = (hasError: boolean): React.CSSProperties => ({
  ...inputStyle(hasError),
  flex: 1,
  minHeight: 320,
  resize: 'none',
  fontFamily: 'Consolas, "SFMono-Regular", monospace',
  fontSize: 14,
  lineHeight: 1.6,
});

const previewPanelStyle: React.CSSProperties = {
  minWidth: 0,
  minHeight: 520,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxShadow: 'var(--cw-card-shadow)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  boxSizing: 'border-box',
};

const summaryStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const summaryItemStyle: React.CSSProperties = {
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
  padding: 12,
};

const summaryNumberStyle: React.CSSProperties = {
  display: 'block',
  color: colors.primary,
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1,
};

const summaryLabelStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 6,
  color: colors.onSurfaceVariant,
  fontSize: 12,
  fontWeight: 800,
};

const statusBoxStyle = (valid: boolean, hasError: boolean): React.CSSProperties => ({
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${valid ? colors.primary : hasError ? colors.error : colors.outline}`,
  backgroundColor: valid ? colors.primaryContainer : colors.surfaceVariant,
  color: valid ? colors.onPrimaryContainer : hasError ? colors.error : colors.onSurfaceVariant,
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.45,
});

const previewSectionStyle: React.CSSProperties = {
  minHeight: 0,
};

const previewTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: colors.onSurface,
  fontSize: 15,
  fontWeight: 900,
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: colors.onSurfaceVariant,
  fontSize: 13,
};

const entryListStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const entryRowStyle: React.CSSProperties = {
  display: 'grid',
  gap: 3,
  padding: '8px 10px',
  border: `1px solid ${colors.outlineVariant}`,
  borderRadius: 8,
  backgroundColor: colors.surfaceVariant,
};

const entryWordStyle: React.CSSProperties = {
  color: colors.onSurface,
  fontSize: 14,
  fontWeight: 900,
  overflowWrap: 'anywhere',
};

const entryClueStyle: React.CSSProperties = {
  color: colors.onSurfaceVariant,
  fontSize: 12,
  overflowWrap: 'anywhere',
};

const moreTextStyle: React.CSSProperties = {
  color: colors.primary,
  fontSize: 12,
  fontWeight: 800,
};

const issueListStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  maxHeight: 180,
  overflow: 'auto',
};

const issueRowStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: `1px solid ${colors.error}`,
  borderRadius: 8,
  backgroundColor: 'rgba(220, 38, 38, 0.08)',
};

const issueMetaStyle: React.CSSProperties = {
  color: colors.error,
  fontSize: 12,
  fontWeight: 900,
};

const issueTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: colors.onSurface,
  fontSize: 12,
  overflowWrap: 'anywhere',
};

const generationIssueStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${colors.error}`,
  borderRadius: 8,
  backgroundColor: 'rgba(220, 38, 38, 0.08)',
};

const partialHintStyle: React.CSSProperties = {
  marginTop: 6,
  color: colors.onSurfaceVariant,
  fontSize: 12,
  lineHeight: 1.4,
};

const generationActionsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 8,
  marginTop: 10,
};

const secondaryActionStyle: React.CSSProperties = {
  minHeight: 38,
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  color: colors.onSurface,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 800,
};

const partialActionStyle = (disabled: boolean): React.CSSProperties => ({
  minHeight: 38,
  border: `1px solid ${disabled ? colors.outlineVariant : colors.primary}`,
  borderRadius: 8,
  backgroundColor: disabled ? colors.surfaceVariant : colors.primaryContainer,
  color: disabled ? colors.onSurfaceVariant : colors.onPrimaryContainer,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 13,
  fontWeight: 800,
});
