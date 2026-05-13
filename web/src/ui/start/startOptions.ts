export type StartOptionId = 'manual-placement' | 'word-list' | 'layout-fill' | 'play-game';

export interface StartOption {
  id: StartOptionId;
  title: string;
  summary: string;
  actionLabel: string;
}

export const startOptions: StartOption[] = [
  {
    id: 'manual-placement',
    title: '指定词和位置',
    summary: '逐个输入答案、提示、起点和方向，手动排出完整谜题。',
    actionLabel: '开始创建',
  },
  {
    id: 'word-list',
    title: '输入词表生成',
    summary: '粘贴一组词和提示，由系统直接生成一局填字游戏。',
    actionLabel: '输入词表',
  },
  {
    id: 'layout-fill',
    title: '输入布局自动填词',
    summary: '先给出黑白格布局，再从词表里自动匹配可填入的答案。',
    actionLabel: '设计布局',
  },
  {
    id: 'play-game',
    title: '开始游戏',
    summary: '跳过创建流程，直接进入原本的填字游戏界面。',
    actionLabel: '进入游戏',
  },
];
