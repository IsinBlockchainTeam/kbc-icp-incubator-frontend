const { createProxyMiddleware } = require('http-proxy-middleware');

const { DFX_NETWORK } = process.env;
const network = DFX_NETWORK === "ic" ? "https://icp0.io/" : "http://127.0.0.1:4943/";

module.exports = function(app) {
    app.use(
        '/api/v2/',
        createProxyMiddleware({
            target: network + "api/v2/",
            changeOrigin: true,
        })
    )
}
