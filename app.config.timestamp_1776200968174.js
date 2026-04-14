// app.config.ts
import { defineConfig } from "@tanstack/start-config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
var app_config_default = await defineConfig({
  vite: {
    plugins: [
      tsConfigPaths(),
      tailwindcss()
    ],
    ssr: {
      noExternal: ["react-joyride"]
    },
    optimizeDeps: {
      include: ["react-joyride"]
    }
  }
});
export {
  app_config_default as default
};
