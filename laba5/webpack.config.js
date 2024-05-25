const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'src', 'index.js'),  // Entry point for your application
    output: {
        path: path.join(__dirname, 'dist'),  // Output directory for bundled files
        filename: 'index.[contenthash].js',  // Output filename with content hash for cache busting
        assetModuleFilename: path.join('images', '[name].[contenthash][ext]'),  // Output pattern for asset modules
    },
    module: {
        rules: [
            {
                test: /\.(woff2?|eot|ttf|otf)$/i,  // Match font files
                type: 'asset/resource',
                generator: {
                    filename: path.join('fonts', '[name].[contenthash][ext]'),  // Output pattern for fonts
                },
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,  // Match image files
                type: 'asset/resource',
            },
            {
                test: /\.svg$/,  // Match SVG files
                type: 'asset/resource',
                generator: {
                    filename: path.join('icons', '[name].[contenthash][ext]'),  // Output pattern for SVG icons
                },
            },
            {
                test: /\.js$/,  // Match JavaScript files
                use: 'babel-loader',
                exclude: /node_modules/,  // Exclude node_modules directory
            },
            {
                test: /\.pug$/,  // Match Pug template files
                loader: 'pug-loader',
            },
            {
                test: /\.(scss|css)$/,  // Match SCSS and CSS files
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            // template: path.join(__dirname, 'src', 'template.html'),  // Uncomment if using HTML template
            template: path.join(__dirname, 'src', 'main', 'template.pug'),  // Use Pug template
            filename: 'index.html',  // Output HTML file name
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'catalogue', 'catalogue.pug'),
            filename: 'catalogue.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'custom', 'custom.pug'),
            filename: 'custom.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'aboutus', 'aboutus.pug'),
            filename: 'aboutus.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'liked', 'liked.pug'),
            filename: 'liked.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'profile', 'profile.pug'),
            filename: 'profile.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'cart', 'cart.pug'),
            filename: 'cart.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'views', 'register.pug'),
            filename: 'register.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'views', 'login.pug'),
            filename: 'login.html'
        }),
        new FileManagerPlugin({
            events: {
                onStart: {
                    delete: ['dist'],  // Delete the dist folder before each build
                },
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',  // Output pattern for CSS files
        }),
    ],
    devServer: {
        watchFiles: path.join(__dirname, 'src'),  // Watch for changes in the src directory
        port: 9000,  // Development server port
    },
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        plugins: [
                            ['gifsicle', { interlaced: true }],
                            ['jpegtran', { progressive: true }],
                            ['optipng', { optimizationLevel: 5 }],
                            ['svgo', { name: 'preset-default' }],
                        ],
                    },
                },
            }),
        ],
    },
};
