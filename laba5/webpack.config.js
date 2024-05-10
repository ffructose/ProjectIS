const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node-modules/,
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', 'postcss-loader', 'sass-loader'
                ]
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            // template: path.join(__dirname, 'src', 'template.html'),
            template: path.join(__dirname, 'src', 'template.pug'),
            filename: 'index.html'
        }),
        new FileManagerPlugin({
            events: {
                onStart: {
                    delete: ['dist'],
                },
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
    devServer: {
        watchFiles: path.join(__dirname, 'src'),
        port: 9000,
    },
};