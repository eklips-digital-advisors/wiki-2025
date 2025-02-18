export const parseDate = (dateStr: string): Date | null => {
  const [month, day, year] = dateStr.split('.').map(Number);
  const date = new Date(year, month - 1, day); // JavaScript Date uses 0-based months

  return isNaN(date.getTime()) ? null : date;
};
