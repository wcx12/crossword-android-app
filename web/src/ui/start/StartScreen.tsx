import React from 'react';
import { StartOptionId, startOptions } from './startOptions';
import { getStartStyle, StartStyle, StartStyleId, startStyles } from './startStyles';

interface StartScreenProps {
  activeStyleId: StartStyleId;
  onStyleChange: (styleId: StartStyleId) => void;
  onSelectOption: (optionId: StartOptionId) => void;
}

const optionAccents = ['#15803D', '#059669', '#D97706', '#2563EB'];

export const StartScreen: React.FC<StartScreenProps> = ({
  activeStyleId,
  onStyleChange,
  onSelectOption,
}) => {
  const activeStyle = getStartStyle(activeStyleId);

  return (
    <div style={screenStyle(activeStyle)}>
      <main style={contentStyle}>
        <section style={heroStyle(activeStyle)}>
          <div style={heroCopyStyle}>
            <p style={eyebrowStyle(activeStyle)}>Crossword Studio</p>
            <h1 style={titleStyle(activeStyle)}>选择创建方式</h1>
            <p style={subtitleStyle(activeStyle)}>
              四个入口统一放在这里：可以继续手动创建，也可以先进入后续两种生成流程，或者直接开始游戏。
            </p>
          </div>

          <div style={stylePanelStyle(activeStyle)} aria-label="外观风格">
            <div>
              <span style={stylePanelLabelStyle(activeStyle)}>界面风格</span>
              <p style={stylePanelTextStyle(activeStyle)}>{activeStyle.tagline}</p>
            </div>
            <div style={styleSwitchStyle}>
              {startStyles.map(style => {
                const selected = style.id === activeStyleId;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onStyleChange(style.id)}
                    aria-pressed={selected}
                    style={styleButtonStyle(activeStyle, style, selected)}
                  >
                    <span style={styleSwatchStyle(style)} />
                    <span style={styleButtonTextStyle}>{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section style={optionGridStyle}>
          {startOptions.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              style={optionButtonStyle(activeStyle)}
            >
              <span style={cardAccentStyle(activeStyle, optionAccents[index])} />
              <span style={numberStyle(activeStyle)}>{index + 1}</span>
              <span style={optionBodyStyle}>
                <span style={optionTitleStyle(activeStyle)}>{option.title}</span>
                <span style={optionSummaryStyle(activeStyle)}>{option.summary}</span>
                <span style={actionStyle(activeStyle)}>{option.actionLabel}</span>
              </span>
            </button>
          ))}
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
  display: 'flex',
  justifyContent: 'center',
  padding: '30px 18px',
  boxSizing: 'border-box',
});

const contentStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1100,
  display: 'flex',
  flexDirection: 'column',
  gap: 22,
};

const heroStyle = (style: StartStyle): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
  gap: 18,
  alignItems: 'stretch',
  padding: 22,
  border: `1px solid ${style.border}`,
  borderRadius: 8,
  backgroundColor: style.surface,
  boxShadow: style.shadow,
  boxSizing: 'border-box',
});

const heroCopyStyle: React.CSSProperties = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '10px 0',
};

const eyebrowStyle = (style: StartStyle): React.CSSProperties => ({
  margin: '0 0 10px',
  color: style.primary,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 0,
});

const titleStyle = (style: StartStyle): React.CSSProperties => ({
  margin: 0,
  color: style.text,
  fontSize: 36,
  lineHeight: 1.12,
  letterSpacing: 0,
});

const subtitleStyle = (style: StartStyle): React.CSSProperties => ({
  margin: '14px 0 0',
  maxWidth: 640,
  color: style.mutedText,
  fontSize: 16,
  lineHeight: 1.55,
});

const stylePanelStyle = (style: StartStyle): React.CSSProperties => ({
  minWidth: 0,
  border: `1px solid ${style.softBorder}`,
  borderRadius: 8,
  backgroundColor: style.surfaceAlt,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 16,
  boxSizing: 'border-box',
});

const stylePanelLabelStyle = (style: StartStyle): React.CSSProperties => ({
  display: 'block',
  color: style.primary,
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 6,
});

const stylePanelTextStyle = (style: StartStyle): React.CSSProperties => ({
  margin: 0,
  color: style.mutedText,
  fontSize: 14,
  lineHeight: 1.5,
});

const styleSwitchStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))',
  gap: 8,
};

const styleButtonStyle = (
  activeStyle: StartStyle,
  style: StartStyle,
  selected: boolean,
): React.CSSProperties => ({
  minHeight: 44,
  border: `1px solid ${selected ? activeStyle.primary : activeStyle.border}`,
  borderRadius: 999,
  backgroundColor: selected ? activeStyle.primary : activeStyle.surface,
  color: selected ? activeStyle.primaryText : activeStyle.text,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '8px 12px',
  fontSize: 13,
  fontWeight: 800,
  boxSizing: 'border-box',
});

const styleSwatchStyle = (style: StartStyle): React.CSSProperties => ({
  width: 14,
  height: 14,
  borderRadius: 999,
  background: `linear-gradient(135deg, ${style.primary}, ${style.accent})`,
  border: `1px solid ${style.border}`,
  flex: '0 0 auto',
});

const styleButtonTextStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const optionGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  gap: 14,
};

const optionButtonStyle = (style: StartStyle): React.CSSProperties => ({
  position: 'relative',
  minHeight: 188,
  padding: 18,
  border: `1px solid ${style.border}`,
  borderRadius: 8,
  backgroundColor: style.surface,
  color: style.text,
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  gap: 14,
  alignItems: 'flex-start',
  overflow: 'hidden',
  boxShadow: style.cardShadow,
  boxSizing: 'border-box',
});

const cardAccentStyle = (style: StartStyle, color: string): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  backgroundColor: style.id === 'table' ? style.primary : color,
});

const numberStyle = (style: StartStyle): React.CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: style.numberBackground,
  color: style.numberText,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  flex: '0 0 auto',
});

const optionBodyStyle: React.CSSProperties = {
  minWidth: 0,
  minHeight: 148,
  display: 'flex',
  flexDirection: 'column',
  gap: 9,
};

const optionTitleStyle = (style: StartStyle): React.CSSProperties => ({
  color: style.text,
  fontSize: 18,
  fontWeight: 800,
  lineHeight: 1.25,
});

const optionSummaryStyle = (style: StartStyle): React.CSSProperties => ({
  color: style.mutedText,
  fontSize: 14,
  lineHeight: 1.45,
});

const actionStyle = (style: StartStyle): React.CSSProperties => ({
  marginTop: 'auto',
  color: style.primary,
  fontSize: 14,
  fontWeight: 800,
});
