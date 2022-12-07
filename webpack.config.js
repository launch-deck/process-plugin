const path = require('path');

module.exports = {
    target: 'electron-main',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'commonjs',
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.node$/,
                loader: "node-loader",
                exclude: /node_modules/,
            },

        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
