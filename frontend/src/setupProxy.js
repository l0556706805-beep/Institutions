const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://institutions-93gl.onrender.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying request:', req.method, req.url, '->', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
      }
    })
  );
};
