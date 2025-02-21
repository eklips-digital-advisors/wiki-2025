import { getServerSideURL } from '@/utilities/getURL'

export function promiseDelay() {
  if (getServerSideURL() === 'http://localhost:3000') {
    return 0;
  }

  console.log(`delay 4200ms`);
  return new Promise(resolve => setTimeout(resolve, 4200));
}
