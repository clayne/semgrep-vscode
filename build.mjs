#!/usr/bin/env node

import cssModulesPlugin from "esbuild-css-modules-plugin";
import esbuild from "esbuild";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
async function buildSentrySourceMap() {
  esbuild.build({
    sourcemap: true, // Source map generation must be turned on
    plugins: [
      // Put the Sentry esbuild plugin after all other plugins
      sentryEsbuildPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "semgrep",
        project: "ide-vscode",
      }),
    ],
  });
}
async function buildExtension(watch) {
  const options = {
    logLevel: "info",
    entryPoints: ["./src/extension.ts"],
    outfile: "./out/main.js",
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["vscode"],
    sourcemap: isSourcemap,
  };
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}
async function buildWebview(watch) {
  let options = {
    logLevel: "info",
    entryPoints: ["./src/webview-ui/index.tsx"],
    outfile: "./out/webview.js",
    bundle: true,
    plugins: [cssModulesPlugin()],
    sourcemap: isSourcemap,
  };
  if (watch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

const isWatch = process.argv.includes("--watch");
const isSourcemap = process.argv.includes("--sourcemap");

await Promise.all([
  buildExtension(isWatch, isSourcemap),
  buildWebview(isWatch, isSourcemap),
  buildSentrySourceMap(),
]);
