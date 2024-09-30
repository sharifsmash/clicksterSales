const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": require.resolve('path-browserify'),
      "zlib": require.resolve('browserify-zlib'),
      "http": require.resolve('stream-http'),
      "https": require.resolve('https-browserify'),
      "stream": require.resolve('stream-browserify'),
      "crypto": require.resolve('crypto-browserify'),
      "os": require.resolve('os-browserify/browser'),
      "url": require.resolve('url/'),
      "assert": require.resolve('assert/'),
      "util": require.resolve('util/'),
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
};
