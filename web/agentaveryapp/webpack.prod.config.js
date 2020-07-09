var path = require("path");
var webpack = require('webpack');

module.exports = {
  entry: [
    './app/index'
  ],
	plugins: [
		new webpack.ProvidePlugin({
			'React': 'react'
		}),
	]
}
