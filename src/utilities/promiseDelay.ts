export function promiseDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
