import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
    vite: {
        ssr: {
            noExternal: ['react-joyride'],
        },
        optimizeDeps: {
            include: ['react-joyride'],
        },
    },
});