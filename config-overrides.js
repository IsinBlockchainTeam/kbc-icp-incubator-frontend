const Dotenv = require('dotenv-webpack');

module.exports = function override(config, env) {
    config.plugins.push(new Dotenv());

    const loaders = config.resolve;
    loaders.fallback = {
        "stream": require.resolve('stream-browserify'),
        "buffer": false,
    }

    return config;
}
