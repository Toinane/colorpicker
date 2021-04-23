require('dotenv/config')

const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default

const appEnv = process.env.APP_ENVIRONNEMENT || 'development'
const isDevEnv = appEnv === 'development'
const styledComponentsTransformer = createStyledComponentsTransformer()

const main = {
    mode: appEnv,
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
    devtool: isDevEnv ? 'inline-source-map' : false,
}

const preload = {
    mode: appEnv,
    target: 'electron-preload',
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    entry: './src/main/preload.ts',
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
    devtool: isDevEnv ? 'inline-source-map' : false,
}

const renderer = {
    mode: appEnv,
    target: 'web',
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
        fallback: {
            path: require.resolve('path-browserify'),
        },
        alias: {
            react: 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react-dom': 'preact/compat',
        },
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
                options: {
                    compiler: 'ttypescript',
                    getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
                },
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
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
        }),
    ],
    optimization: {
        minimizer: [new TerserWebpackPlugin()],
    },
    performance: {
        hints: false,
    },
    devtool: isDevEnv ? 'inline-source-map' : false,
}

module.exports = [main, preload, renderer]
