/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')
const dotenv = require('dotenv')
const { ezhTransformer } = require('ezh-trans')

const envFile = process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env'
dotenv.config({ path: path.resolve(__dirname, 'env', envFile) })

const httpsCert = process.env.HTTPS_CERT
const httpsKey = process.env.HTTPS_KEY

const serverType = httpsCert && httpsKey ? 'https' : 'http'
const serverOptions = serverType === 'http' ? undefined : {
    cert: httpsCert.replace(/\\n/g, '\n'),
    key: httpsKey.replace(/\\n/g, '\n'),
}

let mode = 'production'
mode = 'development'

let entry = 'try/benchmark.tsx'
let static = 'static/benchmark'

// entry = 'try/tryEzh.tsx'
// static = 'static/tryEzh'

// entry = 'try/tryEzhModel.tsx'
// static = 'static/tryEzh'

// entry = 'library/tryClusterClient.tsx'
// static = 'static/library'

entry = 'splendor/index.tsx'
static = 'static/splendor'

module.exports = {
    entry: `./src/${entry}`,
    // experiments: {
    //     outputModule: true,
    // },
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
