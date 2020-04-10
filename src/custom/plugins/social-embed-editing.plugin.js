/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import '@ckeditor/ckeditor5-media-embed/theme/mediaembedediting.css';
import SocialMediaEmbedRegistry from '../views/social-media-embed.registry';
import SocialMediaEmbedCommand from '../commands/social-embed.command';
import { createMediaFigureElement, toMediaWidget } from '@ckeditor/ckeditor5-media-embed/src/utils';
import { runEmbedScript } from '../customizations';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/**
 * The media embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SocialMediaEmbedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SocialMediaEmbedEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The media registry managing social media embed providers in the editor.
		 */
		this.registry = new SocialMediaEmbedRegistry( editor.locale, editor.config.get( 'mediaEmbed' ) );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;
		const renderMediaPreview = editor.config.get( 'mediaEmbed.previewsInData' );
		const registry = this.registry;

		editor.commands.add( 'socialMediaEmbed', new SocialMediaEmbedCommand( editor ) );

		// Configure the schema.
		schema.extend( 'media', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'data-embed-type', 'data-id', 'data-embed-code', 'data-embed-script' ]
		} );

		// data-embed-type
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'data-embed-type',
			model: 'data-embed-type'
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-embed-type:media', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'data-embed-type', data.attributeNewValue, figure );
				} else {
					viewWriter.removeAttribute( 'data-embed-type', figure );
				}
			} );
		} );
		// data-id
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'data-id',
			model: 'data-id'
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-id:media', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'data-id', data.attributeNewValue, figure );
				} else {
					viewWriter.removeAttribute( 'data-id', figure );
				}
			} );
		} );

		// Model -> Data
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				if ( modelElement.getAttribute( 'url' ) ) { return; } // eslint-disable-line
				const type = modelElement.getAttribute( 'data-embed-type' );
				const id = modelElement.getAttribute( 'data-id' );
				const code = modelElement.getAttribute( 'data-embed-code' );
				const script = modelElement.getAttribute( 'data-embed-script' );

				return createMediaFigureElement( viewWriter, registry, { type, id, code, script }, {
					renderMediaPreview: type && renderMediaPreview
				} );
			}
		} );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'media',
			view: ( modelElement, viewWriter ) => {
				if ( modelElement.getAttribute( 'url' ) ) { return; } // eslint-disable-line
				const type = modelElement.getAttribute( 'data-embed-type' );
				const id = modelElement.getAttribute( 'data-id' );
				const code = modelElement.getAttribute( 'data-embed-code' );
				const script = modelElement.getAttribute( 'data-embed-script' );
				const figure = createMediaFigureElement( viewWriter, registry, { type, id, code, script }, {
					renderForEditingView: true
				} );
				// const src = script && script.match( /src="(.*?)"/ );
				// if ( src && src[ 1 ] ) { runEmbedScript( src[ 1 ], type ); } // eslint-disable-line
				runEmbedScript( '', type );
				return toMediaWidget( figure, viewWriter, t( 'media widget' ) );
			}
		} );
		// View -> Model
		conversion.for( 'upcast' )
		// Upcast semantic media.
			.elementToElement( {
				view: {
					name: 'figure',
					attributes: {
						'data-embed-type': true,
						'data-id': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					if ( viewMedia.getAttribute( 'url' ) ) { return; } // eslint-disable-line
					const type = viewMedia.getAttribute( 'data-embed-type' );
					const id = viewMedia.getAttribute( 'data-id' );
					let code = '';
					if ( viewMedia.childCount && viewMedia._children[ 0 ]._children.length ) {
						code = `${ stringify( viewMedia._children[ 0 ]._children[ 0 ] ) }`;
					}
					// eslint-disable-next-line
					if ( type && id ) {
						return modelWriter.createElement( 'media', { 'data-embed-type': type, 'data-id': id,
							'data-embed-code': code, 'data-embed-script': '' } );
					}
				}
			} );
	}
}
