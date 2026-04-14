import { loadConfig } from "vinxi/lib/load-config.js";

async function test() {
  try {
    const config = await loadConfig({ configFile: "app.config.ts" });
    console.log("Config loaded successfully!");
  } catch (err) {
    console.error("FAILED TO LOAD CONFIG:");
    console.error(err);
  }
}

test();
