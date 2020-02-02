const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: ['./src/popup/bootstrap.tsx'],
    setup: ['./src/setup/bootstrap.tsx'],
    background: ['./src/background/background.ts'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'eslint-loader',
            options: {
              emitError: true,
              emitWarning: true,
              extensions: ['.ts', '.tsx'],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { modules: true, importLoaders: 1 } }],
      },
      {
        test: /\.(woff|woff2|ttf|eot|png|ico|gif|jpeg|jpg|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /(node_modules|assets\/style).*\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['node_modules'],
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /src\/.*\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
              },
            },
          },
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
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  stats: 'normal',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'setup.html',
      chunks: ['setup'],
      template: 'src/index.html',
      title: 'Setup',
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      chunks: ['popup'],
      template: 'src/index.html',
      title: 'Popup',
    }),
    new MiniCssExtractPlugin({}),
    new CopyWebpackPlugin([
      {
        from: 'src/images/*',
        to: 'images/[name].[ext]',
      },
      {
        from: 'src/manifest.json',
        to: '.',
      },
    ]),
  ],
};
