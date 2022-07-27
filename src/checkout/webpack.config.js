const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {DefinePlugin} = require('webpack');
const sass = require('sass');

const mode = (process.env.NODE_ENV === 'development')
  ? 'development'
  : 'production';
const devtool = (mode === 'development')
  ? 'eval-source-map'
  : 'hidden-source-map';
const stats = (mode === 'development')
  ? 'errors-warnings'
  : {children: false};

module.exports = {
  mode,
  devtool,
  stats,
  entry: {
    checkout: "./bundles/checkout.js",
  },
  output: {
    filename: 'bundle.[name].js',
    path: path.resolve(__dirname, '../../theme/assets'),
  },
  resolve: {
    extensions: ['.js', '.json', '.scss'],
    alias: {
      handlebars: 'handlebars/dist/cjs/handlebars',
      jquery: path.resolve('./node_modules/jquery'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.[name].css',
    }),
    new DefinePlugin({
      __ENV__: mode,
      DEVELOPMENT: (mode === 'development'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
