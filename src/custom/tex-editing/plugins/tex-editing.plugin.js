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
import TexPlugin from './tex.plugin';
import { renderTexInput, toBoolean } from '../../utils/utils';

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
		this._texInput = new Map();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		editor.commands.add( 'renderTex', new RenderTexCommand( editor ) );

		// Configure the schema.
		schema.register( 'div', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: [ 'data-type', 'data-id', 'data-curr-rendering' ]
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
		// data-id
		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: 'data-curr-rendering',
			model: 'data-curr-rendering'
		} );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-curr-rendering:div', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const texDiv = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setAttribute( 'data-curr-rendering', data.attributeNewValue, texDiv );
				} else {
					viewWriter.removeAttribute( 'data-curr-rendering', texDiv );
				}
			} );
		} );

		// Model -> Data
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'div',
			view: ( modelElement, viewWriter ) => {
				const type = modelElement.getAttribute( 'data-type' );
				const id = modelElement.getAttribute( 'data-id' );
				const input = this.texInput.get( modelElement );

				const texParagraph = viewWriter.createEditableElement( 'p', { style: 'display: none' } );
				viewWriter.insert( viewWriter.createPositionAt( texParagraph, 'end' ), viewWriter.createText( input ) );

				const texDiv = viewWriter.createContainerElement( 'div', { 'data-id': id, 'data-type': type } );
				viewWriter.insert( viewWriter.createPositionAt( texDiv, 0 ), texParagraph );

				texDiv.getFillerOffset = () => null;

				return texDiv;
			}
		} );

		// Model -> View (element)
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'div',
			view: ( modelElement, viewWriter ) => {
				const type = modelElement.getAttribute( 'data-type' );
				const id = modelElement.getAttribute( 'data-id' );
				const currentRendering = toBoolean( modelElement.getAttribute( 'data-curr-rendering' ) );
				const input = this.texInput.get( modelElement );

				const viewTexElement = viewWriter.createContainerElement( 'div',
					{ 'data-id': id, 'data-type': type, 'data-curr-rendering': 'false' } );

				const viewTexParagraph = viewWriter.createEditableElement( 'p', { style: 'display: none' } );
				viewWriter.insert( viewWriter.createPositionAt( viewTexParagraph, 'end' ), viewWriter.createText( input ) );

				viewWriter.insert( viewWriter.createPositionAt( viewTexElement, 0 ), viewTexParagraph );

				this.editor.plugins.get( TexPlugin ).texViewElement = viewTexElement;
				viewTexElement.getFillerOffset = () => null;

				if ( !currentRendering ) {
					setTimeout( () => {// eslint-disable-line
						const element = editor.editing.view.domConverter.viewToDom( viewTexElement );
						if ( element && element.children.length > 1 ) {
							const texOutput = renderTexInput( input, element );
							element.replaceChild( texOutput, element.children[ 1 ] );
							editor.editing.view.change( writer => {
								writer.setAttribute( 'data-curr-rendering', 'false', viewTexElement );
							} );
						}
					}, 0 );
				}

				return toWidget( viewTexElement, viewWriter, { hasSelectionHandle: true } );
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
						'data-id': true,
						'data-curr-rendering': true
					}
				},
				model: ( viewMedia, modelWriter ) => {
					const type = viewMedia.getAttribute( 'data-type' );
					const id = viewMedia.getAttribute( 'data-id' );
					const currentRendering = toBoolean( viewMedia.getAttribute( 'data-curr-rendering' ) );

					if ( type && id && !currentRendering ) {
						// eslint-disable-next-line
						const modelTexElement = modelWriter.createElement( 'div', { 'data-type': type, 'data-id': id, 'data-curr-rendering': 'false' } );
						if ( viewMedia.childCount && viewMedia.getChild( 0 ).childCount ) {
							this.texInput.set( modelTexElement, viewMedia.getChild( 0 ).getChild( 0 ).data );
						}
						return modelTexElement;
					} else if ( currentRendering ) {
						editor.model.change( writer => {
							writer.setAttribute( 'data-curr-rendering', 'false', viewMedia );
						} );
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
