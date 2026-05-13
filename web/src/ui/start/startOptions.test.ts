import { describe, expect, it } from 'vitest';
import { startOptions } from './startOptions';
import { defaultStartStyleId, startStyles } from './startStyles';
import { createStyleVariables } from '../theme/styleVariables';

describe('startOptions', () => {
  it('defines the four start entry points in order', () => {
    expect(startOptions.map(option => option.id)).toEqual([
      'manual-placement',
      'word-list',
      'layout-fill',
      'play-game',
    ]);
    expect(startOptions).toHaveLength(4);
  });

  it('defines the three selectable visual styles', () => {
    expect(startStyles.map(style => style.id)).toEqual(['paper', 'table', 'candy']);
    expect(defaultStartStyleId).toBe('paper');
  });

  it('maps a selected visual style into app-wide CSS variables', () => {
    const variables = createStyleVariables('table');

    expect(variables['--cw-background']).toBe('#0F172A');
    expect(variables['--cw-primary']).toBe('#22C55E');
    expect(variables['--cw-cell-blocked']).toBe('#020617');
  });
});
