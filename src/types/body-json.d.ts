export {}

declare global {
  interface Body {
    // Use `any` to avoid pervasive `unknown` from Response.json() in TS 5.7.
    json(): Promise<any>
  }
}
