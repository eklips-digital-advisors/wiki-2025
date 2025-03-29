export const getStatusBg = (status: string) => {
  switch (status.toLowerCase()) {
    case 'planning':
      return 'bg-indigo-500';
    case 'development':
      return 'bg-emerald-500';
    case 'test':
    case 'content':
      return 'bg-yellow-500';
    case 'launch':
      return 'bg-rose-500';
    default:
      return 'bg-gray-500';
  }
};
