import React from 'react';
import { getStartStyle, StartStyle, StartStyleId } from './startStyles';

interface PendingCreationScreenProps {
  title: string;
  message: string;
  styleId: StartStyleId;
  onBack: () => void;
}

export const PendingCreationScreen: React.FC<PendingCreationScreenProps> = ({
  title,
  message,
  styleId,
  onBack,
}) => {
  const style = getStartStyle(styleId);

  return (
    <div style={screenStyle(style)}>
      <header style={topBarStyle(style)}>
        <button type="button" onClick={onBack} style={backButtonStyle(style)}>
          返回
        </button>
        <span style={topTitleStyle(style)}>{title}</span>
      </header>
      <main style={contentStyle}>
        <section style={panelStyle(style)}>
          <p style={eyebrowStyle(style)}>{style.modeLabel}</p>
          <h1 style={titleStyle(style)}>{title}</h1>
          <p style={messageStyle(style)}>{message}</p>
          <div style={previewGridStyle(style)} aria-hidden="true">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} style={previewCellStyle(style, index)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const screenStyle = (style: StartStyle): React.CSSProperties => ({
  minHeight: '100vh',
  backgroundColor: style.screenBackground,
  backgroundImage: style.backgroundPattern,
  backgroundSize: '28px 28px',
  color: style.text,
});

const topBarStyle = (style: StartStyle): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '12px 16px',
  backgroundColor: style.surface,
  borderBottom: `1px solid ${style.border}`,
  color: style.text,
  boxShadow: style.cardShadow,
});

const backButtonStyle = (style: StartStyle): React.CSSProperties => ({
  minHeight: 44,
  border: `1px solid ${style.border}`,
  borderRadius: 999,
  backgroundColor: style.primary,
  color: style.primaryText,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 800,
  padding: '0 18px',
});

const topTitleStyle = (style: StartStyle): React.CSSProperties => ({
  minWidth: 0,
  color: style.text,
  fontSize: 18,
  fontWeight: 800,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const contentStyle: React.CSSProperties = {
  padding: 24,
  display: 'flex',
  justifyContent: 'center',
};

const panelStyle = (style: StartStyle): React.CSSProperties => ({
  width: '100%',
  maxWidth: 680,
  border: `1px solid ${style.border}`,
  borderRadius: 8,
  backgroundColor: style.surface,
  padding: 24,
  boxSizing: 'border-box',
  boxShadow: style.shadow,
});

const eyebrowStyle = (style: StartStyle): React.CSSProperties => ({
  margin: '0 0 8px',
  color: style.primary,
  fontSize: 13,
  fontWeight: 800,
});

const titleStyle = (style: StartStyle): React.CSSProperties => ({
  margin: '0 0 12px',
  color: style.text,
  fontSize: 28,
  lineHeight: 1.2,
  letterSpacing: 0,
});

const messageStyle = (style: StartStyle): React.CSSProperties => ({
  margin: 0,
  color: style.mutedText,
  fontSize: 15,
  lineHeight: 1.6,
});

const previewGridStyle = (style: StartStyle): React.CSSProperties => ({
  width: 180,
  maxWidth: '100%',
  aspectRatio: '1 / 1',
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: 4,
  marginTop: 24,
  padding: 10,
  borderRadius: 8,
  border: `1px solid ${style.softBorder}`,
  backgroundColor: style.surfaceAlt,
  boxSizing: 'border-box',
});

const previewCellStyle = (style: StartStyle, index: number): React.CSSProperties => {
  const filled = [1, 3, 5, 6, 8, 12, 16, 18, 21, 23].includes(index);

  return {
    borderRadius: 3,
    backgroundColor: filled ? style.primary : style.surface,
    border: `1px solid ${filled ? style.primary : style.border}`,
  };
};
