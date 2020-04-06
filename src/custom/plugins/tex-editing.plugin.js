/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import '@ckeditor/ckeditor5-media-embed/theme/mediaembedediting.css';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import RenderTexCommand from '../commands/tex-render.command';
// import { renderTexInput } from '../customizations';
import TexPlugin from './tex.plugin';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The media embed editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TexEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TexEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		this._texInput = '';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;
		// const renderMediaPreview = editor.config.get( 'mediaEmbed.previewsInData' );
		// const registry = this.registry;

		editor.commands.add( 'renderTex', new RenderTexCommand( editor ) );

		// Configure the schema.
		schema.register( 'div', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'data-type', 'data-id' ]
		} );

		// data-embed-type
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'data-type',
			model: 'data-type'
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-type:div', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const texDiv = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'data-type', data.attributeNewValue, texDiv );
				} else {
					viewWriter.removeAttribute( 'data-type', texDiv );
				}
			} );
		} );
		// data-id
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'data-id',
			model: 'data-id'
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-id:div', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const texDiv = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'data-id', data.attributeNewValue, texDiv );
				} else {
					viewWriter.removeAttribute( 'data-id', texDiv );
				}
			} );
		} );

		// Model -> Data
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'div',
			view: ( modelElement, viewWriter ) => {
				if ( modelElement.getAttribute( 'url' ) ) {
					return;
				} // eslint-disable-line
				const type = modelElement.getAttribute( 'data-type' );
				const id = modelElement.getAttribute( 'data-id' );

				const texParagraph = viewWriter.createEditableElement( 'p' );
				viewWriter.insert( viewWriter.createPositionAt( texParagraph, 'end' ), viewWriter.createText( this.texInput ) );

				const texDiv = viewWriter.createContainerElement( 'div', { 'data-id': id, 'data-type': type } );
				viewWriter.insert( viewWriter.createPositionAt( texDiv, 0 ), texParagraph );

				return texDiv;
			}
		} );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'div',
			view: ( modelElement, viewWriter ) => {
				const type = modelElement.getAttribute( 'data-type' );
				const id = modelElement.getAttribute( 'data-id' );

				const texParagraph = viewWriter.createEditableElement( 'p' );
				viewWriter.insert( viewWriter.createPositionAt( texParagraph, 'end' ), viewWriter.createText( this.texInput ) );

				const texDiv = viewWriter.createContainerElement( 'div', { 'data-id': id, 'data-type': type } );
				viewWriter.insert( viewWriter.createPositionAt( texDiv, 0 ), createTexInputParagraph( this.texInput, viewWriter ) );

				this.editor.plugins.get( TexPlugin ).texViewElement = texDiv;
				// renderTexInput( editor.editing.view.domConverter.viewToDom( texDiv ) );

				return toWidget( texDiv, viewWriter, t( 'tex container' ) );
			}
		} );
		// View -> Model
		conversion.for( 'upcast' )
		// Upcast semantic media.
			.elementToElement( {
				view: {
					name: 'div',
					attributes: {
						'data-type': true,
						'data-id': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					const type = viewMedia.getAttribute( 'data-type' );
					const id = viewMedia.getAttribute( 'data-id' );
					// eslint-disable-next-line
					if (type && id) {
						return modelWriter.createElement( 'div', { 'data-type': type, 'data-id': id } );
					}
				}
			} );
	}

	get texInput() {
		return this._texInput;
	}

	set texInput( texInput ) {
		this._texInput = texInput;
	}
}

function createTexInputParagraph( texInput, writer, attributes = {} ) {
	return writer.createUIElement( 'p', attributes, function( domDocument ) {
		const domElement = this.toDomElement( domDocument );
		domElement.innerHTML = new Template( {
			tag: 'span',
			children: [ texInput ]
		} ).render().innerHTML;

		return domElement;
	} );
}
