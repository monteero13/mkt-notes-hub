import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    tsConfigPaths(),
    tailwindcss() as any,
  ],
  ssr: {
    noExternal: ["react-joyride"],
  },
  optimizeDeps: {
    include: ["react-joyride"],
  },
});
