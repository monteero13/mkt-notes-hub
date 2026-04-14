import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths(),
      tailwindcss() as any,
    ],
    ssr: {
      noExternal: ["react-joyride"],
    },
    optimizeDeps: {
      include: ["react-joyride"],
    },
  },
});
