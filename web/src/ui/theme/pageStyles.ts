import React from 'react';
import { colors, shadows } from './theme';

export const pageShellStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  backgroundColor: colors.background,
  backgroundImage: 'var(--cw-background-pattern)',
  backgroundSize: '28px 28px',
  color: colors.onBackground,
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
};

export const pageHeaderStyle: React.CSSProperties = {
  minHeight: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  padding: '10px 16px',
  backgroundColor: colors.surface,
  color: colors.onSurface,
  borderBottom: `1px solid ${colors.outline}`,
  boxShadow: shadows.elevation1,
  boxSizing: 'border-box',
};

export const pageHeaderLeftStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flex: '1 1 220px',
};

export const pageHeaderActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 8,
  flexWrap: 'wrap',
  flex: '0 1 auto',
};

export const pageTitleStyle: React.CSSProperties = {
  minWidth: 0,
  color: colors.onSurface,
  fontSize: 18,
  fontWeight: 800,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const navButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: `1px solid ${colors.outline}`,
  borderRadius: 999,
  backgroundColor: colors.surfaceVariant,
  color: colors.onSurface,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 800,
  padding: '0 14px',
};

export const quietButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: `1px solid ${colors.outline}`,
  borderRadius: 999,
  backgroundColor: colors.surface,
  color: colors.primary,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 800,
  padding: '0 14px',
};

export const primaryButtonStyle = (disabled = false): React.CSSProperties => ({
  minHeight: 44,
  border: 'none',
  borderRadius: 8,
  backgroundColor: disabled ? colors.outline : colors.primary,
  color: colors.onPrimary,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 14,
  fontWeight: 800,
  padding: '0 16px',
});

export const panelStyle: React.CSSProperties = {
  border: `1px solid ${colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  boxShadow: shadows.elevation1,
  boxSizing: 'border-box',
};

export const inputStyle = (hasError = false): React.CSSProperties => ({
  width: '100%',
  minHeight: 44,
  padding: '8px 12px',
  fontSize: 14,
  border: `1px solid ${hasError ? colors.error : colors.outline}`,
  borderRadius: 8,
  backgroundColor: colors.surface,
  color: colors.onSurface,
  boxSizing: 'border-box',
});

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: colors.onSurfaceVariant,
  marginBottom: 6,
  fontWeight: 700,
};
