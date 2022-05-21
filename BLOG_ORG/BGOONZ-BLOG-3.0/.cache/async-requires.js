// prefer default export if available
const preferDefault = m => (m && m.default) || m

exports.components = {
  "component---cache-dev-404-page-js": () => import("./../../dev-404-page.js" /* webpackChunkName: "component---cache-dev-404-page-js" */),
  "component---src-pages-blog-js": () => import("./../../../src/pages/blog.js" /* webpackChunkName: "component---src-pages-blog-js" */),
  "component---src-pages-nature-js": () => import("./../../../src/pages/nature.js" /* webpackChunkName: "component---src-pages-nature-js" */),
  "component---src-templates-page-js": () => import("./../../../src/templates/page.js" /* webpackChunkName: "component---src-templates-page-js" */),
  "component---src-templates-post-js": () => import("./../../../src/templates/post.js" /* webpackChunkName: "component---src-templates-post-js" */)
}

