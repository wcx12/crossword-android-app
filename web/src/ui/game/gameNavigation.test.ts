import { describe, expect, it } from 'vitest';
import { gameHeaderActionLabels } from './gameNavigation';

describe('gameNavigation', () => {
  it('keeps the game screen back action first and hides puzzle creation', () => {
    expect(gameHeaderActionLabels[0]).toBe('返回开始');
    expect(gameHeaderActionLabels).toEqual(['返回开始', '搜索', '词表', '设置', '新游戏']);
    expect(gameHeaderActionLabels).not.toContain('创建');
  });
});
