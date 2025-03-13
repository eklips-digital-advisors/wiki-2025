export const getLabel = (value: string, frameworkOptions: {label: string, value: string}[]) => {
  if (!value) return

  const option = frameworkOptions.find(option => option.value === value);
  return option ? option.label : value;
};
