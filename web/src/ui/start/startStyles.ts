export type StartStyleId = 'paper' | 'table' | 'candy';

export interface StartStyle {
  id: StartStyleId;
  name: string;
  tagline: string;
  description: string;
  modeLabel: string;
  screenBackground: string;
  backgroundPattern: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  border: string;
  softBorder: string;
  numberBackground: string;
  numberText: string;
  shadow: string;
  cardShadow: string;
}

export const startStyles: StartStyle[] = [
  {
    id: 'paper',
    name: '纸面棋盘',
    tagline: '清爽、克制，像一张准备好的谜题纸。',
    description: '适合默认工具入口，重点放在清晰的选择和稳定的创建流程。',
    modeLabel: '清爽模式',
    screenBackground: '#F5FAF6',
    backgroundPattern:
      'linear-gradient(90deg, rgba(21, 128, 61, 0.055) 1px, transparent 1px), linear-gradient(180deg, rgba(21, 128, 61, 0.055) 1px, transparent 1px)',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F7F3',
    text: '#0F172A',
    mutedText: '#52635A',
    primary: '#15803D',
    primaryText: '#FFFFFF',
    secondary: '#059669',
    accent: '#D97706',
    border: '#DDEBE2',
    softBorder: '#E8F3EC',
    numberBackground: '#EAF7EF',
    numberText: '#14532D',
    shadow: '0 22px 55px rgba(21, 128, 61, 0.12)',
    cardShadow: '0 12px 28px rgba(15, 23, 42, 0.07)',
  },
  {
    id: 'table',
    name: '深色牌桌',
    tagline: '更游戏化，像在一张安静的牌桌上开局。',
    description: '适合偏沉浸的游戏感入口，强调对比、聚焦和开始动作。',
    modeLabel: '沉浸模式',
    screenBackground: '#0F172A',
    backgroundPattern:
      'linear-gradient(90deg, rgba(34, 197, 94, 0.065) 1px, transparent 1px), linear-gradient(180deg, rgba(34, 197, 94, 0.065) 1px, transparent 1px)',
    surface: '#192134',
    surfaceAlt: '#111827',
    text: '#F8FAFC',
    mutedText: '#AAB7C7',
    primary: '#22C55E',
    primaryText: '#052E16',
    secondary: '#15803D',
    accent: '#F59E0B',
    border: 'rgba(255, 255, 255, 0.12)',
    softBorder: 'rgba(255, 255, 255, 0.07)',
    numberBackground: 'rgba(34, 197, 94, 0.15)',
    numberText: '#BBF7D0',
    shadow: '0 24px 70px rgba(0, 0, 0, 0.34)',
    cardShadow: '0 14px 35px rgba(0, 0, 0, 0.28)',
  },
  {
    id: 'candy',
    name: '活泼糖果',
    tagline: '轻快、有奖励感，适合休闲谜题体验。',
    description: '适合更亲和的玩法入口，让创建方式看起来更轻松。',
    modeLabel: '轻快模式',
    screenBackground: '#FDF2F8',
    backgroundPattern:
      'linear-gradient(90deg, rgba(236, 72, 153, 0.07) 1px, transparent 1px), linear-gradient(180deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px)',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF7FB',
    text: '#0F172A',
    mutedText: '#64748B',
    primary: '#EC4899',
    primaryText: '#FFFFFF',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    border: '#FCE9F2',
    softBorder: '#F9DCEB',
    numberBackground: '#FCE7F3',
    numberText: '#9D174D',
    shadow: '0 22px 55px rgba(236, 72, 153, 0.16)',
    cardShadow: '0 12px 28px rgba(157, 23, 77, 0.09)',
  },
];

export const defaultStartStyleId: StartStyleId = 'paper';

export function getStartStyle(styleId: StartStyleId): StartStyle {
  return startStyles.find(style => style.id === styleId) ?? startStyles[0];
}
