import { copyFileSync } from "node:fs"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
  },
  format: ["esm", "cjs"],
  outExtension({ format }) {
    return { js: format === "esm" ? ".js" : ".cjs" }
  },
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Emit one self-contained file per entry (no shared chunk-*.js).
  splitting: false,
  target: "es2020",
  // Bundle ONLY our own source. React + the two phone/flag libs ship as plain imports.
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "google-libphonenumber",
    "country-flag-icons",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
  // styles.css is never imported from JS; ship it as a standalone file the
  // consumer imports once (`react-intl-phone-input/styles.css`). Copying it
  // here (rather than relying on tsup's CSS-in-JS emission) guarantees the
  // emitted filename matches the `exports["./styles.css"]` path.
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css")
  },
})
