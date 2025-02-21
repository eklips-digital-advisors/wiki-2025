import { getServerSideURL } from '@/utilities/getURL'

export function promiseDelay() {
  if (getServerSideURL() === 'http://localhost:3000') {
    return 0;
  }

  console.log(`delay 1200ms`);
  return new Promise(resolve => setTimeout(resolve, 1200));
}
