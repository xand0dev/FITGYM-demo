export const getMonthsWord = (monthsStr) => {
  const m = parseInt(monthsStr, 10) || 0;
  const m10 = m % 10;
  const m100 = m % 100;
  if (m100 >= 11 && m100 <= 19) return 'МІСЯЦІВ';
  if (m10 === 1) return 'МІСЯЦЬ';
  if (m10 >= 2 && m10 <= 4) return 'МІСЯЦІ';
  return 'МІСЯЦІВ';
};

export const formatCurrency = (amount) => {
  return parseInt(amount, 10).toLocaleString('uk-UA');
};

export const cleanPlanName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\([\s\S]*?\)/g, '').trim();
};
