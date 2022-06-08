//@ts-check
'use strict';

const path = require('path');

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const common = {
    mode: 'development',
    devtool: 'inline-source-map',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            os: require.resolve('os-browserify/browser'),
            util: require.resolve('util')
        }
    },
    entry: {
        webbluetooth: './src/index.ts'
    }
};

/** @type WebpackConfig[] */
module.exports = [
    {
        ...common,
        output: {
            filename: '[name].umd.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'umd'
            }
        }
    },
    {
        ...common,
        output: {
            filename: '[name].esm.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'commonjs-static'
            }
        }
    }
];
