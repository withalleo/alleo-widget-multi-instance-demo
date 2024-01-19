import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      'alleo/service': resolve(__dirname, "./alleo/service.d.ts"),
      alleo: resolve(__dirname, "./alleo/widget.d.ts"),
      alleoWidgetUtils: resolve(__dirname, "./lib/alleoWidgetUtils.ts"),
    },
  },
  plugins: [
    viteSingleFile(),
  ]
})
