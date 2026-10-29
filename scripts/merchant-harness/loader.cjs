// Test harness loader: strips TS types, resolves extensionless and "@/…" specifiers to
// .ts sources, and stubs the Next.js-coupled modules (@/lib/prisma, @/lib/auth) so the
// merchant service layer can run under plain node.
const fs = require("fs")
const path = require("path")
const { fileURLToPath, pathToFileURL } = require("url")

const ROOT = path.resolve(__dirname, "..", "..")

const STUBS = {
  "@/lib/prisma": path.join(__dirname, "stubs", "prisma.mjs"),
  "@/lib/auth": path.join(__dirname, "stubs", "auth.mjs"),
}

const asJs = (p) => String(p).replace(/\\/g, "/")
const isSource = (url) => /\.ts(x?)(\?|$)/.test(url) && !/\/node_modules\//.test(asJs(url))

function existingFile(candidate) {
  try {
    return fs.statSync(candidate).isFile() ? candidate : null
  } catch {
    return null
  }
}

function probeTs(base) {
  return existingFile(base + ".ts") || existingFile(base + ".tsx") || existingFile(path.join(base, "index.ts"))
}

exports.resolve = async (specifier, context, nextResolve) => {
  if (STUBS[specifier]) return { url: pathToFileURL(STUBS[specifier]).href, shortCircuit: true, format: "module" }

  if (specifier.startsWith("@/")) {
    const hit = probeTs(path.join(ROOT, specifier.slice(2)))
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true, format: "module-typescript" }
  }

  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier)
    if (!path.extname(base)) {
      const hit = probeTs(base)
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true, format: "module-typescript" }
    }
  }

  const resolved = await nextResolve(specifier, context)
  if (isSource(resolved.url) && !resolved.format) return { ...resolved, format: "module-typescript" }
  return resolved
}

exports.load = async (url, context, nextLoad) => {
  if (isSource(url)) {
    const file = fileURLToPath(url.split("?")[0])
    if (fs.existsSync(file)) {
      return { format: "module-typescript", source: fs.readFileSync(file, "utf8"), shortCircuit: true }
    }
  }
  return nextLoad(url, context)
}
