const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = (env) => env.dev === true

const main = (env) => ({
    mode: isDev(env) ? 'development' : 'production',
    target: 'electron-main',
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
        ],
    },
    optimization: {
        minimizer: [new TerserWebpackPlugin()],
    },
    devtool: isDev(env) ? 'inline-source-map' : false,
})

const preload = (env) => ({
    mode: isDev(env) ? 'development' : 'production',
    target: 'electron-preload',
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    entry: './src/preload.ts',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'preload.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
        ],
    },
    optimization: {
        minimizer: [new TerserWebpackPlugin()],
    },
    devtool: isDev(env) ? 'inline-source-map' : false,
})

const renderer = (env) => ({
    mode: isDev(env) ? 'development' : 'production',
    target: 'web',
    watch: true,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    entry: {
        renderer: './src/renderer/app.tsx',
    },
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(bmp|ico|gif|jpe?g|png|svg|ttf|eot|woff?2?)$/,
                loader: 'url-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/public/index.html',
        }),
    ],
    optimization: {
        minimizer: [new TerserWebpackPlugin()],
    },
    performance: {
        hints: false,
    },
    devtool: isDev(env) ? 'inline-source-map' : false,
})

module.exports = [main, renderer]
