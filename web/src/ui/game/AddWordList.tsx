import React, { useState } from 'react';
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

interface AddWordListProps {
  onConfirm: (entries: { word: string; clue: string }[]) => void;
  onBack: () => void;
}

export const AddWordList: React.FC<AddWordListProps> = ({ onConfirm, onBack }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 解析用户输入的内容
  const parseEntries = (text: string): { word: string; clue: string }[] => {
    const lines = text.split('\n');
    const entries: { word: string; clue: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      const parts = trimmed.split(/\s+/);
      const word = parts[0];

      // 验证单词只包含字母
      if (!word.split('').every(c => /[a-zA-Z]/.test(c))) {
        continue;
      }

      const clue = parts.length > 1 ? parts.slice(1).join(' ') : '';
      entries.push({ word, clue });
    }

    return entries;
  };

  const handleConfirm = () => {
    const entries = parseEntries(content);

    if (entries.length < 2) {
      setError('词库至少需要2个单词');
      return;
    }

    onConfirm(entries);
  };

  // 预览条目数
  const previewEntries = parseEntries(content);
  const validCount = previewEntries.length;

  return (
    <div style={{ ...pageShellStyle, height: '100vh' }}>
      {/* 顶部栏 */}
      <div style={pageHeaderStyle}>
        <div style={pageHeaderLeftStyle}>
          <button
            onClick={onBack}
            style={navButtonStyle}
          >
            返回词表
          </button>
          <span style={pageTitleStyle}>添加自定义词表</span>
        </div>
      </div>

      {/* 说明 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.outline}`,
        fontSize: 12,
        color: colors.onSurfaceVariant,
        lineHeight: 1.5,
      }}>
        每行一个词条，格式：<br/>
        <code style={{ backgroundColor: colors.surface, padding: '2px 6px', borderRadius: 4 }}>
          单词 线索文本
        </code>
        <br/>
        例如：PYTHON 一种编程语言
      </div>

      {/* 输入框 */}
      <div style={{
        flex: 1,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="输入词表，每行一个&#10;&#10;例如：&#10;PYTHON 一种编程语言&#10;FUNCTION 函数&#10;LOOP 循环"
          style={{
            ...inputStyle(Boolean(error)),
            flex: 1,
            fontSize: 14,
            fontFamily: 'monospace',
            resize: 'none',
            lineHeight: 1.6,
          }}
        />

        {error && (
          <div style={{
            color: colors.error,
            fontSize: 12,
            marginTop: 8,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* 预览和确认 */}
      <div style={{
        padding: 16,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.outlineVariant}`,
      }}>
        <div style={{
          fontSize: 12,
          color: colors.onSurfaceVariant,
          marginBottom: 12,
        }}>
          有效词条：{validCount} 个
          {validCount < 2 && validCount > 0 && '（至少需要2个）'}
        </div>
        <button
          onClick={handleConfirm}
          disabled={validCount < 2}
          style={{
            width: '100%',
            ...primaryButtonStyle(validCount < 2),
            fontSize: 16,
          }}
        >
          开始游戏
        </button>
      </div>
    </div>
  );
};
