import fs from "node:fs"
import path from "node:path"
import express from "express"
import { renderToString } from "react-dom/server"
import { createElement } from "react"

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const isDev = process.env.NODE_ENV !== "production"
const PORT = Number(process.env.PORT || 3000)

async function start() {
  const app = express()

  let vite: any
  if (isDev) {
    const { createServer: createViteServer } = await import("vite")
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    })
    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.resolve(__dirname, "../dist"), { index: false }))
  }

  async function loadModule(id: string) {
    if (isDev) return vite.ssrLoadModule(id)
    const serverDir = path.resolve(__dirname, "../dist/server")
    const filePath = id.replace(/^\//, "").replace(/\.tsx?$/, ".js")
    return import(path.resolve(serverDir, filePath))
  }

  app.use(async (req, res, next) => {
    if (req.method !== "GET") return next()

    if (isDev) {
      if (req.url.startsWith("/@") || req.url.startsWith("/node_modules/") || req.url.startsWith("/src/")) {
        return next()
      }
    }
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/)) {
      return next()
    }

    try {
      let template: string
      if (isDev) {
        const raw = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8")
        template = await vite.transformIndexHtml(req.url, raw)
      } else {
        template = fs.readFileSync(path.resolve(__dirname, "../dist/index.html"), "utf-8")
      }

      const fd = await loadModule("/server/fetchData.ts")
      const route = fd.parseURL(req.url)
      const pageData = await fd.fetchData(route)
      const initialData = { ...pageData, __route: route }

      const entry = await loadModule("/server/entry.tsx")
      const { App, HelmetProvider } = entry

      const helmetContext: any = {}
      const appHtml = renderToString(
        createElement(HelmetProvider, { context: helmetContext },
          createElement(App, { initialData })
        )
      )

      const helmet = helmetContext.helmet || {}
      const headTags = [
        helmet.title?.toString() || "",
        helmet.meta?.toString() || "",
        helmet.link?.toString() || "",
        helmet.script?.toString() || "",
      ].join("")

      const dataScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`
      const html = template
        .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
        .replace("</head>", `${headTags}${dataScript}</head>`)

      res.status(200).set({ "Content-Type": "text/html" }).end(html)
    } catch (e) {
      if (isDev && vite) vite.ssrFixStacktrace(e)
      console.error("SSR error:", e)
      res.status(500).end("Internal Server Error")
    }
  })

  app.listen(PORT, () => {
    console.log(`SSR server listening on http://localhost:${PORT}`)
  })
}

start()
