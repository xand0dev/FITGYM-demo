import { getMonthsWord, formatCurrency, cleanPlanName } from '../utils/formatters';

describe('Formatters Utilities', () => {
  it('should format currency correctly by removing decimals and adding separators', () => {
    expect(formatCurrency('15000.00')).toBe('15\u00A0000'); // toLocaleString uses non-breaking space
    expect(formatCurrency(2000)).toBe('2\u00A0000');
  });

  it('should return МІСЯЦЬ for 1, 21, 31', () => {
    expect(getMonthsWord(1)).toBe('МІСЯЦЬ');
    expect(getMonthsWord('21')).toBe('МІСЯЦЬ');
  });

  it('should return МІСЯЦІ for 2, 3, 4, 22, 23, 24', () => {
    expect(getMonthsWord(2)).toBe('МІСЯЦІ');
    expect(getMonthsWord('4')).toBe('МІСЯЦІ');
    expect(getMonthsWord(23)).toBe('МІСЯЦІ');
  });

  it('should return МІСЯЦІВ for 5-20, 11, 12', () => {
    expect(getMonthsWord(5)).toBe('МІСЯЦІВ');
    expect(getMonthsWord(11)).toBe('МІСЯЦІВ');
    expect(getMonthsWord('12')).toBe('МІСЯЦІВ');
    expect(getMonthsWord(20)).toBe('МІСЯЦІВ');
    expect(getMonthsWord(0)).toBe('МІСЯЦІВ');
  });

  it('should clean parenthetical sub-strings from plan names', () => {
    expect(cleanPlanName('Повний (1 місяць)')).toBe('Повний');
    expect(cleanPlanName('Ранковий (6 місяців)')).toBe('Ранковий');
    expect(cleanPlanName('Ранковий повний\n(12 місяців)')).toBe('Ранковий повний');
  });
});
