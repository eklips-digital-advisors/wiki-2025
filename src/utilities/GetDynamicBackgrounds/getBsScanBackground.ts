export const getBsScanBackground = (isoDateString?: string): string => {
  if (!isoDateString) return ''; // Default for missing date

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return 'bg-gray-500'; // Handle invalid date

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  if (date < sixMonthsAgo) return 'bg-rose-100'; // Older than 6 months
  if (date < threeMonthsAgo) return 'bg-yellow-100'; // Older than 3 months
  return 'bg-emerald-100'; // Otherwise, recent
};
