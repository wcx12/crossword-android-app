import React, { useState } from 'react';
import { colors } from '../theme/theme';

interface SettingsDialogProps {
  rows: number;
  cols: number;
  onConfirm: (rows: number, cols: number) => void;
  onCancel: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  rows,
  cols,
  onConfirm,
  onCancel,
}) => {
  const [inputRows, setInputRows] = useState(rows);
  const [inputCols, setInputCols] = useState(cols);

  const handleConfirm = () => {
    // 限制范围 5-25
    const validRows = Math.max(5, Math.min(25, inputRows));
    const validCols = Math.max(5, Math.min(25, inputCols));
    onConfirm(validRows, validCols);
  };

  return (
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
        minWidth: 280,
        border: `1px solid ${colors.outline}`,
        boxShadow: 'var(--cw-shadow)',
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: colors.onSurface }}>设置网格尺寸</h2>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: colors.onSurfaceVariant }}>
              行数 (5-25)
            </label>
            <input
              type="number"
              value={inputRows}
              onChange={(e) => setInputRows(parseInt(e.target.value) || 5)}
              min={5}
              max={25}
              style={{
                width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              backgroundColor: colors.surface,
              color: colors.onSurface,
              fontSize: 16,
              boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: colors.onSurfaceVariant }}>
              列数 (5-25)
            </label>
            <input
              type="number"
              value={inputCols}
              onChange={(e) => setInputCols(parseInt(e.target.value) || 5)}
              min={5}
              max={25}
              style={{
                width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              backgroundColor: colors.surface,
              color: colors.onSurface,
              fontSize: 16,
              boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              minHeight: 44,
              padding: '0 16px',
              backgroundColor: 'transparent',
              color: colors.primary,
              border: `1px solid ${colors.outline}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              minHeight: 44,
              padding: '0 16px',
              backgroundColor: colors.primary,
              color: colors.onPrimary,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
