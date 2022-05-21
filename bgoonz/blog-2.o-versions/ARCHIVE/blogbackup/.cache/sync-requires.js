const { hot } = require("react-hot-loader/root");

// prefer default export if available
const preferDefault = (m) => (m && m.default) || m;

exports.components = {
  "component---cache-dev-404-page-js": hot(
    preferDefault(
      require("/workspace/blog-2.o-versions/blogbackup/.cache/dev-404-page.js")
    )
  ),
};
