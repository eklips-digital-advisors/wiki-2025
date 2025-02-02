export const getWpVersionBackground = (current: string, latest: string) => {
  if (current === latest) {
    return 'bg-emerald-100'
  }
  if (+current.replace(/\./g, '') + 1 === +latest.replace(/\./g, '')) {
    return 'bg-yellow-100'
  } else {
    return 'bg-rose-100'
  }
}
