/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')
const dotenv = require('dotenv')
const { ezhTransformer } = require('ezh-trans')
const { DefinePlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { collectClassNames } = require('./collectClassNames.mjs')

const envFile = process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env'
dotenv.config({ path: path.resolve(__dirname, 'env', envFile) })

const httpsCert = process.env.HTTPS_CERT
const httpsKey = process.env.HTTPS_KEY

const serverType = httpsCert && httpsKey ? 'https' : 'http'
const serverOptions = serverType === 'http' ? undefined : {
    cert: httpsCert.replace(/\\n/g, '\n'),
    key: httpsKey.replace(/\\n/g, '\n'),
}

const classNames = collectClassNames('./src/splendor/models', true)

const mode = process.env.NODE_ENV ?? 'development'

let entry = 'try/benchmark.tsx'
let static = 'static/benchmark'
let externals = undefined

// entry = 'try/tryEzh.tsx'
// static = 'static/tryEzh'

// entry = 'try/tryEzhModel.tsx'
// static = 'static/tryEzh'

// entry = 'library/tryClusterClient.tsx'
// static = 'static/library'

// entry = 'splendor/index.tsx'
// static = 'static/splendor'

// if (mode === 'production') {
//     externals = {
//         'ezh': 'ezh',
//         'ezh-model': 'ezh-model',
//         'justrun-loader': 'justrun-loader',
//         'justrun-ws': 'justrun-ws',
//     }
// }

module.exports = {
    entry: `./src/${entry}`,
    experiments: {
        outputModule: true,
    },
    mode: mode,
    // stats: {
    //     errorDetails: true,
    //     errors: true,
    //     errorStack: true,
    //     moduleTrace: true,
    // },
    output: {
        chunkLoading: false,
        wasmLoading: false,
        path: path.resolve(__dirname, 'dist'),
        module: true,
        publicPath: '/',
        filename: 'main.js',
    },
    externalsType: 'module',
    externals: externals,
    optimization: {
        usedExports: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: {
                        reserved: classNames,
                    },
                },
            }),
        ],
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new DefinePlugin({
            'process.env.LOG_CLASS_LOG_LEVEL': 3,
        }),
    ],
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
        allowedHosts: 'all',
        devMiddleware: {
            // writeToDisk: true,
            writeToDisk: false,
        },
        static: {
            directory: path.join(__dirname, static),
            publicPath: '/',
        },
        proxy: [{
            context: ['/api'],
            target: 'http://host.docker.internal:8088',
            changeOrigin: 'http://localhost:8088',
            ws: true,
        }],
        server: {
            type: serverType,
            options: serverOptions,
        },
        port: 8080,
    },
}
