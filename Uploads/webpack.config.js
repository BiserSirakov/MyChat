var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.(js)$/, exclude: /(node_modules)/, use: {loader: 'babel-loader', options: { presets: ['env', 'react']}} },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ]}
    ]
  },
  devServer: {
    historyApiFallback: true,  inline: true, port: 1234, host: '62.44.100.149',
  },
    plugins: [
        new HtmlWebpackPlugin({template: './src/app/index.html'})
    ]
};
                    
