export const info = (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`);
export const success = (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`);
export const error = (msg: string) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`);