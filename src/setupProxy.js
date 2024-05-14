const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api/v2/',
        createProxyMiddleware({
            target: 'http://127.0.0.1:4943/api/v2/',
            changeOrigin: true,
        })
    )
}
