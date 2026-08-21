/**
 * Keep puppeteer's Chrome download inside node_modules/.cache so Vercel's
 * build cache preserves it between deploys (the default ~/.cache/puppeteer
 * is NOT cached by Vercel, which would re-download ~170MB every build).
 * Locally this also keeps the browser install next to the project.
 */
const { join } = require("path");

module.exports = {
  cacheDir: join(__dirname, "node_modules", ".cache", "puppeteer"),
};
