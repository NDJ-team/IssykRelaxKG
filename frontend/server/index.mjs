import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import { renderToString } from "react-dom/server"
import { createElement } from "react"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.env.NODE_ENV !== "production"
const PORT = Number(process.env.PORT || 3000)

async function start() {
  const app = express()

  let vite
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

  // Dev: load modules via Vite SSR. Prod: use prebuilt bundle from dist/server/
  async function loadEntry() {
    if (isDev) {
      const fd = await vite.ssrLoadModule("/server/entry.tsx")
      return fd
    }
    return import("../dist/server/entry.js")
  }

  app.get("/sitemap.xml", async (req, res) => {
    const BASE_URL = "https://issykrelax.kg"
    const apiBase = process.env.API_INTERNAL_URL || (isDev ? "http://localhost:8000/api/v1" : "http://backend:8000/api/v1")
    const cacheMaxAge = isDev ? 0 : 3600

    try {
      const [cats, cities, props, exps] = await Promise.all([
        fetch(`${apiBase}/properties/categories`).then(r => r.ok ? r.json() : []),
        fetch(`${apiBase}/properties/cities`).then(r => r.ok ? r.json() : []),
        fetch(`${apiBase}/properties/?limit=1000&status=active`).then(r => r.ok ? r.json() : { items: [] }),
        fetch(`${apiBase}/experiences?limit=1000`).then(r => r.ok ? r.json() : { items: [] }),
      ])

      const today = new Date().toISOString().split("T")[0]
      const items = props.items || props || []
      const catsArr = Array.isArray(cats) ? cats : []
      const citiesArr = Array.isArray(cities) ? cities : []
      const expsArr = Array.isArray(exps) ? exps : (exps.items || [])

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

      const add = (loc, freq, prio) => {
        xml += `  <url><loc>${BASE_URL}${loc}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>\n`
      }

      add("/", "daily", "1.0")
      add("/search", "daily", "0.8")
      add("/experiences", "daily", "0.9")
      add("/routes", "daily", "0.8")
      add("/transports", "weekly", "0.7")
      add("/planner", "weekly", "0.8")
      add("/map", "weekly", "0.8")
      add("/restaurants", "weekly", "0.7")
      add("/tours", "weekly", "0.7")
      add("/activities", "weekly", "0.7")
      add("/transfers", "weekly", "0.7")
      add("/tour-packages", "weekly", "0.7")
      add("/about", "monthly", "0.5")
      add("/feedback", "monthly", "0.5")
      add("/pricing", "monthly", "0.5")
      add("/privacy", "monthly", "0.3")
      add("/terms", "monthly", "0.3")
      add("/faq", "monthly", "0.5")

      for (const p of items) {
        add(`/property/${p.id}`, "weekly", "0.8")
      }

      for (const c of catsArr) {
        add(`/category/${c.slug}`, "weekly", "0.7")
      }

      for (const c of citiesArr) {
        add(`/city/${c.slug}`, "weekly", "0.7")
      }

      for (const e of expsArr) {
        add(`/local-experience/${e.id}`, "weekly", "0.6")
      }

      xml += "</urlset>"

      res.header("Content-Type", "application/xml")
      res.header("Cache-Control", `public, max-age=${cacheMaxAge}`)
      res.send(xml)
    } catch (e) {
      console.error("Sitemap generation error:", e)
      res.status(500).type("text/plain").send("Sitemap generation failed")
    }
  })

  app.use(async (req, res, next) => {
    if (req.method !== "GET") return next()

    // Skip Vite internal paths (dev only) and static asset files
    if (isDev && (req.url.startsWith("/@") || req.url.startsWith("/node_modules/") || req.url.startsWith("/src/"))) {
      return next()
    }
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/)) {
      return next()
    }

    try {
      const template = isDev
        ? await vite.transformIndexHtml(req.url, fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8"))
        : fs.readFileSync(path.resolve(__dirname, "../dist/index.html"), "utf-8")

      const entry = await loadEntry()
      const { parseURL, fetchData } = entry
      const route = parseURL(req.url)
      const pageData = await fetchData(route)
      const initialData = { ...pageData, __route: route }

      const { App, HelmetProvider } = entry

      const helmetContext = {}
      const appHtml = renderToString(
        createElement(HelmetProvider, { context: helmetContext },
          createElement(App, { initialData })
        )
      )

      const helmet = helmetContext.helmet || {}
      const helmetTitle = helmet.title?.toString() || ""
      const fallbackHead = helmetTitle
        ? ""
        : `<title>IssykRelax — маркетплейс отдыха на Иссык-Куле, Кыргызстан</title><meta name="description" content="IssykRelax — маркетплейс отдыха на Иссык-Куле, Кыргызстан. Жильё, впечатления, маршруты и транспорт в одном месте." />`
      const headTags = [
        fallbackHead,
        helmetTitle,
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
