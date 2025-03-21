/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')
const { ezhTransformer } = require('ezh-trans')

let mode = 'production'
mode = 'development'

let entry = 'try/benchmark.tsx'
let static = 'static/benchmark'

// entry = 'try/tryEzh.tsx'
// static = 'static/tryEzh'

// entry = 'try/tryEzhModel.tsx'
// static = 'static/tryEzh'

entry = 'library/tryClusterClient.tsx'
static = 'static/library'

module.exports = {
    entry: `./src/${entry}`,
    // experiments: {
    //     outputModule: true,
    // },
    mode: mode,
    output: {
        chunkLoading: false,
        wasmLoading: false,
        path: path.resolve(__dirname, 'dist'),
        // module: true,
        publicPath: '/',
    },
    optimization: {
        usedExports: true,
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: () => ({
                            after: [
                                ezhTransformer,
                            ],
                        }),
                    },
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [path.join(__dirname, static)],
                            },
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        hot: false,
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true,
        },
        static: {
            directory: path.join(__dirname, static),
            publicPath: '/',
        },
        port: 8080,
    },
}
