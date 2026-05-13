import React from 'react';
import { getStartStyle, StartStyleId } from '../start/startStyles';

export type StyleVariableMap = React.CSSProperties & {
  [key: `--cw-${string}`]: string;
};

export function createStyleVariables(styleId: StartStyleId): StyleVariableMap {
  const style = getStartStyle(styleId);
  const isDark = style.id === 'table';
  const isCandy = style.id === 'candy';

  return {
    '--cw-background': style.screenBackground,
    '--cw-background-pattern': style.backgroundPattern,
    '--cw-on-background': style.text,
    '--cw-surface': style.surface,
    '--cw-on-surface': style.text,
    '--cw-surface-variant': style.surfaceAlt,
    '--cw-on-surface-variant': style.mutedText,
    '--cw-primary': style.primary,
    '--cw-on-primary': style.primaryText,
    '--cw-primary-container': style.numberBackground,
    '--cw-on-primary-container': style.numberText,
    '--cw-secondary': style.secondary,
    '--cw-on-secondary': style.primaryText,
    '--cw-secondary-container': style.surfaceAlt,
    '--cw-on-secondary-container': style.text,
    '--cw-accent': style.accent,
    '--cw-outline': style.border,
    '--cw-outline-variant': style.softBorder,
    '--cw-cell-empty': isDark ? '#F8FAFC' : '#FFFFFF',
    '--cw-cell-selected': style.numberBackground,
    '--cw-cell-highlight': isDark ? 'rgba(34, 197, 94, 0.18)' : isCandy ? '#FFF1F8' : '#F0F7F3',
    '--cw-cell-related': isDark ? 'rgba(245, 158, 11, 0.18)' : isCandy ? '#F6EEFF' : '#FFF7E6',
    '--cw-cell-blocked': isDark ? '#020617' : '#0F172A',
    '--cw-correct': '#15803D',
    '--cw-incorrect': '#DC2626',
    '--cw-error': '#DC2626',
    '--cw-on-error': '#FFFFFF',
    '--cw-shadow': style.shadow,
    '--cw-card-shadow': style.cardShadow,
  };
}
