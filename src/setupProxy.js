const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api/v2/',
        createProxyMiddleware({
            target: 'http://localhost:4943/api/v2/',
            changeOrigin: true,
        })
    )
}
