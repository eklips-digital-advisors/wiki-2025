export const getStatusBg = (status: string) => {
  switch (status.toLowerCase()) {
    case 'planning':
      return 'bg-indigo-300';
    case 'development':
      return 'bg-emerald-300';
    case 'test':
    case 'content':
      return 'bg-yellow-300';
    case 'launch':
      return 'bg-rose-300';
    default:
      return 'bg-gray-300';
  }
};
