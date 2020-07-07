const path = require('path')

module.exports = {
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: false,
    entry: './src/main.ts',
    target: 'electron-main',
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
    },
}
