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
        '@/api': path.resolve(__dirname, './src/api'),
        '@/assets': path.resolve(__dirname, './src/assets'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/constants': path.resolve(__dirname, './src/constants'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/providers': path.resolve(__dirname, './src/providers'),
        '@/redux': path.resolve(__dirname, './src/redux'),
        '@/utils': path.resolve(__dirname, './src/utils')
    };

    return config;
};
