export function promiseDelay(ms: number) {
  console.log(`delay ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}
