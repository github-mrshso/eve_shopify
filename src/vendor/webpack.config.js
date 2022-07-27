const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
  context: __dirname,
  entry: {
    vendor: "./bundles/vendor.js",
  },
  output: {
    filename: "bundle.[name].js",
    path: path.resolve(__dirname, "../../theme/assets"),
    publicPath: "/",
  },
  resolve: {
    extensions: ['.js', '.json', '.scss'],
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
  resolve: {
    alias: {
       handlebars: 'handlebars/dist/handlebars.min.js'
    }
  },
};
