var path = require('path');
var webpack = require('webpack');
const merge = require('webpack-merge');

const development = require('./webpack.dev.config.js');
const production = require('./webpack.prod.config.js');

const TARGET = process.env.npm_lifecycle_event;

const common = {
  context: __dirname,
  output: {
    path: path.resolve('../public/dist'),
    filename: 'agentavery_bundle.js',
    publicPath: '/dist/',
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.css', '.scss', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.resolve('app'),
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel'],
        include: path.resolve('app'),
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      'React': 'react'
    }),
  ],
};

// TODO(ivan): Use development config for local development builds.
module.exports = merge(production, common);
