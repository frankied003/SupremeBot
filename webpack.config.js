module.exports = {
    entry: "./src/index.js",//path relative to this file
    output: {
        filename: "../frontEnd/bundle.js",//path relative to this file
    },
    externals: {
        puppeteer: 'require("puppeteer")',
    },
    mode: 'development'
  }