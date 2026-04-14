import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tanstackStart(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  ssr: {
    noExternal: ["react-joyride"],
  },
  optimizeDeps: {
    include: ["react-joyride"],
  },
});