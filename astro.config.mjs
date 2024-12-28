import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import serviceWorker from "astrojs-service-worker";
import svelte from "@astrojs/svelte";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://astro.build/config
export default defineConfig({
  site: "https://winstonfassett.github.io",
  base: "/y-labs",
  integrations: [
    react(),
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    serviceWorker({
      registration: {
        autoRegister: false,
      },
    }),
  ],
  define: {
    "process.env": {},
  },
  vite: {
    plugins: [nodePolyfills({
      buffer: true,
      crypto: true,
      stream: true,
      http: true,
      https: true,
      os: true,
    })]
  }
});
