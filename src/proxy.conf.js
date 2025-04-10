module.exports = {
    "/api": {
        target: "https://data.nasdaq.com",
        secure: false,
        changeOrigin: true,
        pathRewrite: {
            "^/api": "/api"
        },
        bypass: function(req, res, proxyOptions) {
            // This might help with certain inspection issues
            req.headers["Accept-Encoding"] = "identity";
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    }
};