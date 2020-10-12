const dev = process.env.NODE_ENV !== 'production'
const path = require('path') // eslint-disable-line @typescript-eslint/no-var-requires
const nodeExternals = require('webpack-node-externals') // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
	target: 'async-node',
	mode: dev ? 'development' : 'production',
	devtool: 'inline-source-map',
	entry: './src/server.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'server.bundle.js',
	},
	resolve: {
		extensions: ['.ts'],
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'ts-loader',
			},
		],
	},
	externals: [
		nodeExternals(),
	],
}
