var plugins = [{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-mdx/gatsby-ssr'),
      options: {"plugins":[{"resolve":"/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-remark-images","id":"3626c0e0-58d4-5046-b0e5-cb7731a052f2","name":"gatsby-remark-images","version":"3.3.33","pluginOptions":{"plugins":[]},"nodeAPIs":[],"browserAPIs":["onRouteUpdate"],"ssrAPIs":[]},{"resolve":"/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-remark-autolink-headers","id":"df380aaa-460e-51a2-8830-e6712dc1f436","name":"gatsby-remark-autolink-headers","version":"2.3.15","pluginOptions":{"plugins":[]},"nodeAPIs":[],"browserAPIs":["onInitialClientRender","shouldUpdateScroll"],"ssrAPIs":["onRenderBody"]}],"gatsbyRemarkPlugins":["gatsby-remark-smartypants","gatsby-remark-embed-video","gatsby-remark-responsive-iframe","gatsby-remark-copy-linked-files","gatsby-remark-code-titles","gatsby-remark-sub-sup","gatsby-remark-autolink-headers",{"resolve":"gatsby-remark-vscode","options":{"extensions":["mdx","vscode-styled-components"]}},{"resolve":"gatsby-remark-katex","options":{"macros":{"\\dif":"\\mathrm d","\\vec":"{\\boldsymbol{#1}}","\\mat":"{\\boldsymbol{#1}}","\\reals":"{\\mathbb{R}}","\\comps":"{\\mathbb{C}}","\\ints":"{\\mathbb{Z}}","\\expec":"\\mathbb{E}","\\var":"\\operatorname{var}","\\diag":"\\operatorname{diag}","\\unity":"\\mat{\\mathbb{I}}","\\const":"\\text{const}","\\abs":"\\left|#1\\right|","\\paren":"\\mathopen{}\\left(#1\\right)\\mathclose{}","\\brkt":"\\mathopen{}\\left[#1\\right]\\mathclose{}","\\cbrkt":"\\mathopen{}\\left\\{#1\\right\\}\\mathclose{}","\\Acal":"\\mathcal{A}","\\Abb":"\\mathbb{A}","\\Bcal":"\\mathcal{B}","\\Bbb":"\\mathbb{B}","\\Ccal":"\\mathcal{C}","\\Cbb":"\\mathbb{C}","\\Dcal":"\\mathcal{D}","\\Dbb":"\\mathbb{D}","\\Ecal":"\\mathcal{E}","\\Ebb":"\\mathbb{E}","\\Fcal":"\\mathcal{F}","\\Fbb":"\\mathbb{F}","\\Gcal":"\\mathcal{G}","\\Gbb":"\\mathbb{G}","\\Hcal":"\\mathcal{H}","\\Hbb":"\\mathbb{H}","\\Ical":"\\mathcal{I}","\\Ibb":"\\mathbb{I}","\\Jcal":"\\mathcal{J}","\\Jbb":"\\mathbb{J}","\\Kcal":"\\mathcal{K}","\\Kbb":"\\mathbb{K}","\\Lcal":"\\mathcal{L}","\\Lbb":"\\mathbb{L}","\\Mcal":"\\mathcal{M}","\\Mbb":"\\mathbb{M}","\\Ncal":"\\mathcal{N}","\\Nbb":"\\mathbb{N}","\\Ocal":"\\mathcal{O}","\\Obb":"\\mathbb{O}","\\Pcal":"\\mathcal{P}","\\Pbb":"\\mathbb{P}","\\Qcal":"\\mathcal{Q}","\\Qbb":"\\mathbb{Q}","\\Rcal":"\\mathcal{R}","\\Rbb":"\\mathbb{R}","\\Scal":"\\mathcal{S}","\\Sbb":"\\mathbb{S}","\\Tcal":"\\mathcal{T}","\\Tbb":"\\mathbb{T}","\\Ucal":"\\mathcal{U}","\\Ubb":"\\mathbb{U}","\\Vcal":"\\mathcal{V}","\\Vbb":"\\mathbb{V}","\\Wcal":"\\mathcal{W}","\\Wbb":"\\mathbb{W}","\\Xcal":"\\mathcal{X}","\\Xbb":"\\mathbb{X}","\\Ycal":"\\mathcal{Y}","\\Ybb":"\\mathbb{Y}","\\Zcal":"\\mathcal{Z}","\\Zbb":"\\mathbb{Z}"},"throwOnError":false}},{"resolve":"gatsby-remark-images","options":{"maxWidth":1200,"linkImagesToOriginal":false,"wrapperStyle":"border-radius: 0.5em; overflow: hidden;"}},{"resolve":"gatsby-remark-emojis","options":{"active":true,"size":24}}],"extensions":[".mdx",".md"]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-remark-autolink-headers/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-styled-components/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-google-analytics/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-feed/gatsby-ssr'),
      options: {"plugins":[],"query":"{\n    site {\n      meta: siteMetadata {\n        title\n        url\n        site_url: url\n        description\n      }\n    }\n  }","feeds":[{"query":"{\n        posts: allMdx(\n          filter: { fileAbsolutePath: { regex: \"/posts/\" } }\n          sort: { fields: frontmatter___date, order: DESC }\n        ) {\n          nodes {\n            frontmatter {\n              title\n              slug\n              date(formatString: \"MMM D, YYYY\")\n            }\n            timeToRead\n            excerpt(pruneLength: 300)\n            html\n          }\n        }\n      }","output":"/rss.xml"}]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-sitemap/gatsby-ssr'),
      options: {"plugins":[],"output":"/sitemap.xml","query":"{\n    site {\n      meta: siteMetadata {\n        url\n      }\n    }\n    pages: allSitePage {\n      nodes {\n        path\n      }\n    }\n  }"},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-manifest/gatsby-ssr'),
      options: {"plugins":[],"name":"janosh.dev","short_name":"janosh.dev","display":"standalone","icon":"content/favicon.svg","background_color":"#150956","theme_color":"#150956","cache_busting_mode":"query","include_favicon":true,"legacy":true,"theme_color_in_head":true,"cacheDigest":"4b9c3a13873229a0e7353936b411f594"},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/node_modules/gatsby-plugin-react-helmet/gatsby-ssr'),
      options: {"plugins":[]},
    },{
      plugin: require('/workspace/BGOONZ-BLOG-3.0/gatsby-ssr'),
      options: {"plugins":[]},
    }]
// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   {
//     plugin: require("/path/to/plugin1/gatsby-ssr.js"),
//     options: { ... },
//   },
//   {
//     plugin: require("/path/to/plugin2/gatsby-ssr.js"),
//     options: { ... },
//   },
// ]

const apis = require(`./api-ssr-docs`)

// Run the specified API in any plugins that have implemented it
module.exports = (api, args, defaultReturn, argTransform) => {
  if (!apis[api]) {
    console.log(`This API doesn't exist`, api)
  }

  // Run each plugin in series.
  // eslint-disable-next-line no-undef
  let results = plugins.map(plugin => {
    if (!plugin.plugin[api]) {
      return undefined
    }
    const result = plugin.plugin[api](args, plugin.options)
    if (result && argTransform) {
      args = argTransform({ args, result })
    }
    return result
  })

  // Filter out undefined results.
  results = results.filter(result => typeof result !== `undefined`)

  if (results.length > 0) {
    return results
  } else {
    return [defaultReturn]
  }
}
