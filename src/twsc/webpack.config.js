
const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {VueLoaderPlugin} = require('vue-loader');
const {DefinePlugin} = require('webpack');

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
  entry: glob.sync('./bundles/**/*.js').reduce((acc, filepath) => {
    const entry = filepath.replace(/^.*[\\\/]/, '').replace('.js', '');
    acc[entry] = filepath;
    return acc;
  }, {}),
  output: {
    filename: 'bundle.[name].js',
    path: path.resolve(__dirname, '../../theme/assets'),
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts', '.tsx', '.scss'],
    alias: {
      Styles: path.resolve(__dirname, 'src/styles/'),
      vue: path.resolve('./node_modules/vue/dist/vue.esm-bundler.js'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './bundle.[name].css',
    }),
    new VueLoaderPlugin(),
    new DefinePlugin({
      __ENV__: mode,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
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
      {
        test: /\.vue$/,
        exclude: (file) => /node_modules/.test(file) && !/\.vue\.js/.test(file),
        use: {
          loader: 'vue-loader',
        },
      },
    ],
  },
};
