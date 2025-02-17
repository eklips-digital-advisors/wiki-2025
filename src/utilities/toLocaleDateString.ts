export const toLocaleDateString = (date: any) => {
  return new Date(date * 1000).toLocaleDateString('et-ET', {
    month: '2-digit',
    year: 'numeric',
    day: '2-digit',
  })
}
