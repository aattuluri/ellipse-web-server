var path = require("path");
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './app/index'
  ],
	plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
