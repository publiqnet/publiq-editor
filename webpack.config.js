/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	devtool: 'source-map',
	performance: { hints: false },

	entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),

	output: {
		// The name under which the editor will be exported.
		library: 'BalloonEditor',

		path: path.resolve( __dirname, 'build' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},

	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	plugins: [
		new CKEditorWebpackPlugin( {
			// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			// When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
			language: 'en',
			additionalLanguages: 'all'
		} ),
		// new webpack.BannerPlugin( {
		// 	banner: bundler.getLicenseBanner(),
		// 	raw: true
		// } ),
		new webpack.NormalModuleReplacementPlugin(
			/bold\.svg/,
			'../../../../../src/custom/assets/icons/Bold.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/italic\.svg/,
			'../../../../../src/custom/assets/icons/Italic.svg'
		),
		// new webpack.NormalModuleReplacementPlugin(
		// 	/link\.svg/,
		// 	'../../../../../src/custom/icons/Link.svg'
		// ),
		// new webpack.NormalModuleReplacementPlugin(
		// 	/media\.svg/,
		// 	'../../../../src/custom/icons/Video.svg'
		// )
		new webpack.NormalModuleReplacementPlugin(
			/pilcrow\.svg/,
			'../../../../../../src/custom/assets/icons/Plus.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/image\.svg/,
			'../../../../../src/custom/assets/icons/Image.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/media\.svg/,
			'../../../../src/custom/assets/icons/Video.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/quote\.svg/,
			'../../../../src/custom/assets/icons/Quote.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/bulletedlist\.svg/,
			'../../../../src/custom/assets/icons/Bulleted_list.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/numberedlist\.svg/,
			'../../../../src/custom/assets/icons/Numbered_list.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/\/link\.svg/,
			'../../../../src/custom/assets/icons/Link.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/\/unlink\.svg/,
			'../../../../../src/custom/assets/icons/Unlink.svg'
		),
		new webpack.NormalModuleReplacementPlugin(
			/\/pencil\.svg/,
			'../../../../../src/custom/assets/icons/Pencil.svg'
		)
	],

	module: {
		rules: [
			{
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag'
						}
					},
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					},
				]
			},
			{
				test: /\.s[ca]ss/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag'
						}
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				]
			},
			{
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
		]
	}
};
