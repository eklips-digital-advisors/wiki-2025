export const getPhpBackground = (data: {[key: string]: {name: string}}, searchString: string): string => {
  if (!searchString || !data) return 'bg-rose-100'

  if (Object.values(data).some(item => item.name.includes(searchString))) {
    return 'bg-emerald-100'
  } else {
    return 'bg-rose-100'
  }
}
