const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---cache-dev-404-page-js": hot(preferDefault(require("/workspace/BGOONZ-BLOG-3.0/.cache/dev-404-page.js"))),
  "component---src-pages-blog-js": hot(preferDefault(require("/workspace/BGOONZ-BLOG-3.0/src/pages/blog.js"))),
  "component---src-pages-nature-js": hot(preferDefault(require("/workspace/BGOONZ-BLOG-3.0/src/pages/nature.js"))),
  "component---src-templates-page-js": hot(preferDefault(require("/workspace/BGOONZ-BLOG-3.0/src/templates/page.js"))),
  "component---src-templates-post-js": hot(preferDefault(require("/workspace/BGOONZ-BLOG-3.0/src/templates/post.js")))
}

