// Registers the harness loader hook before the test modules run.
const { register } = await import("node:module")
const { fileURLToPath, pathToFileURL } = await import("node:url")

register(pathToFileURL(fileURLToPath(new URL("./loader.cjs", import.meta.url))).href)
