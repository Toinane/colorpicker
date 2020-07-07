const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        mainFields: ['main', 'module', 'browser'],
    },
    entry: './src/renderer/app.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {
                            limit: 10000,
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, '../dist'),
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 4000,
        publicPath: '/',
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].js',
        publicPath: './',
    },
    plugins: [new HtmlWebpackPlugin()],
}
