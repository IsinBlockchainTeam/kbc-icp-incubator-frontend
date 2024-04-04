module.exports = function override(config, env) {
    const loaders = config.resolve;
    loaders.fallback = {
        "stream": require.resolve('stream-browserify'),
        "buffer": require.resolve("buffer"),
    }

    return config;
}
