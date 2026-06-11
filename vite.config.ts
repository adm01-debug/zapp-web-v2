import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// PWA/service worker desativado de propósito (problemas de preview) —
// useServiceWorker atua como kill-switch limpando workers legados.
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "framer-motion"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "lucide-react"],
    force: true,
  },
  esbuild: {
    drop: [], // Mantém logs para facilitar a depuração no preview
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
            return 'vendor-core';
          }
          // Lucide icons - split into a separate chunk to avoid bloating other chunks
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Data layer
          if (id.includes('@tanstack/react-query') || id.includes('@supabase/supabase-js')) {
            return 'vendor-data';
          }
          // UI components from node_modules
          if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'vendor-ui';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'vendor-utils';
          }
          // Charts
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
        },
      },
    },
  },
}));
