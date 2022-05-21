const siteMetadata = require('./site-metadata.json');

siteMetadata.siteUrl = `https://bgoonz-blog.netlify.app/`;

plugins: [`gatsby-plugin-sitemap`];
module.exports = {
    pathPrefix: '/',
    siteMetadata: siteMetadata,
    plugins: [
        `gatsby-plugin-react-helmet`,
        'gatsby-plugin-dark-mode',
        `gatsby-source-data`,
        `gatsby-transformer-remark`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `pages`,
                path: `${__dirname}/src/pages`
            }
        },
        {
            resolve: `gatsby-plugin-sass`,
            options: {}
        },
        {
            resolve: `gatsby-remark-page-creator`,
            options: {}
        },
        {
            resolve: `@stackbit/gatsby-plugin-menus`,
            options: {
                sourceUrlPath: `fields.url`,
                pageContextProperty: `menus`
            }
        }
    ]
};
