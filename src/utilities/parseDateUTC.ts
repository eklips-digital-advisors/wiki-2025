export const parseDateUTC = (value: string) => {
  const parts = value.split('.');
  const [day, month, year] = parts.map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};
