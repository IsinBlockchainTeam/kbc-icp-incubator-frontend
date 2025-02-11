const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = function override(config, env) {
    // Add Dotenv plugin
    config.plugins.push(
        new Dotenv({
            ignoreStub: true
        })
    );

    // Add fallback configuration
    const loaders = config.resolve;
    loaders.fallback = {
        stream: require.resolve('stream-browserify'),
        buffer: false
    };

    // Add alias configuration
    config.resolve.alias = {
        '@': path.resolve(__dirname, './src')
    };

    return config;
};
