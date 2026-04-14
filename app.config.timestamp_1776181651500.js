// app.config.ts
import { defineConfig } from "vinxi/config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
var app_config_default = defineConfig({
  routers: {
    client: {
      url: "/",
      type: "client",
      handler: "./src/entry-client.tsx",
      target: "browser",
      plugins: () => [
        tanstackStart(),
        tsConfigPaths(),
        tailwindcss()
      ]
    },
    ssr: {
      url: "/",
      type: "http",
      handler: "./src/entry-server.tsx",
      target: "server",
      plugins: () => [
        tanstackStart(),
        tsConfigPaths(),
        tailwindcss()
      ]
    }
  }
});
export {
  app_config_default as default
};
