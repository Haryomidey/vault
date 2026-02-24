#!/usr/bin/env node
import { runCLI } from "./cli.js";

(async () => {
  try {
    await runCLI();
  } catch (e: any) {
    console.error("Fatal error:", e.message);
  }
})();