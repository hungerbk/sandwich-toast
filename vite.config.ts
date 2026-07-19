import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Demo playground config: bundles src/demo (index.html entry) for local dev
// and for building a static demo site. Never used for the published package —
// see vite.lib.config.ts for that.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-demo',
  },
})
