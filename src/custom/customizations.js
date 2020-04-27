import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import BlockButtonView from '@ckeditor/ckeditor5-ui/src/toolbar/block/blockbuttonview';
import iconPilcrow from './assets/icons/Plus.svg';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import DeleteCommand from '@ckeditor/ckeditor5-typing/src/deletecommand';
import count from '@ckeditor/ckeditor5-utils/src/count';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import MediaEmbedCommand from '@ckeditor/ckeditor5-media-embed/src/mediaembedcommand';
import { createMediaFigureElement, toMediaWidget } from '@ckeditor/ckeditor5-media-embed/src/utils';
import { modelToViewUrlAttributeConverter } from '@ckeditor/ckeditor5-media-embed/src/converters';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting';
import ImageEditing, { createImageViewElement } from '@ckeditor/ckeditor5-image/src/image/imageediting';
import ImageLoadObserver from '@ckeditor/ckeditor5-image/src/image/imageloadobserver';
import { toImageWidget } from '@ckeditor/ckeditor5-image/src/image/utils';
import { modelToViewAttributeConverter, srcsetAttributeConverter, viewFigureToModel } from '@ckeditor/ckeditor5-image/src/image/converters';
import ImageInsertCommand from '@ckeditor/ckeditor5-image/src/image/imageinsertcommand';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { toggleSizeButtons } from './utils/utils';

const MaxFileSizeError = 'max file size error';

ImageUploadEditing.prototype._readAndUpload = function( loader, imageElement ) {
	const editor = this.editor;
	const model = editor.model;
	const t = editor.locale.t;
	const fileRepository = editor.plugins.get( 'FileRepository' );
	const notification = editor.plugins.get( 'Notification' );

	model.enqueueChange( 'transparent', writer => {
		writer.setAttribute( 'uploadStatus', 'reading', imageElement );
	} );

	return loader.read()
		.then( () => {
			const promise = loader.upload();

			// Force re–paint in Safari. Without it, the image will display with a wrong size.
			// https://github.com/ckeditor/ckeditor5/issues/1975
			/* istanbul ignore next */
			if ( env.isSafari ) {
				const viewFigure = editor.editing.mapper.toViewElement( imageElement );
				const viewImg = viewFigure.getChild( 0 );

				editor.editing.view.once( 'render', () => {
					// Early returns just to be safe. There might be some code ran
					// in between the outer scope and this callback.
					if ( !viewImg.parent ) {
						return;
					}

					const domFigure = editor.editing.view.domConverter.mapViewToDom( viewImg.parent );

					if ( !domFigure ) {
						return;
					}

					const originalDisplay = domFigure.style.display;

					domFigure.style.display = 'none';

					// Make sure this line will never be removed during minification for having "no effect".
					domFigure._ckHack = domFigure.offsetHeight;

					domFigure.style.display = originalDisplay;
				} );
			}

			model.enqueueChange( 'transparent', writer => {
				writer.setAttribute( 'uploadStatus', 'uploading', imageElement );
			} );

			return promise;
		} )
		.then( data => {
			model.enqueueChange( 'transparent', writer => {
				writer.setAttributes( {
					uploadStatus: 'complete',
					src: data.default,
					'data-uri': data.uri,
					'data-link': data.link,
					'data-natural-width': data.width,
					'data-natural-height': data.height,
					'imageStyle': data.size
				}, imageElement );
				this._parseAndSetSrcsetAttributeOnImage( data, imageElement, writer );
			} );

			clean();
		} )
		.catch( error => {
			// If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
			// it might be generic error and it would be real pain to find what is going on.
			if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
				throw error;
			}

			// Might be 'aborted'.
			if ( loader.status == 'error' && error ) {
				const data = {
					message: error === MaxFileSizeError ? 'max file size error' : error,
					type: 'caution',
					namespace: error === MaxFileSizeError ? 'size-error' : 'upload',
					title: error === MaxFileSizeError ? t( 'Upload failed due to file size' ) : t( 'Upload failed' )
				};
				notification._showNotification( data );
			}

			clean();

			// Permanently remove image from insertion batch.
			model.enqueueChange( 'transparent', writer => {
				writer.remove( imageElement );
			} );
		} );

	function clean() {
		model.enqueueChange( 'transparent', writer => {
			writer.removeAttribute( 'uploadId', imageElement );
			writer.removeAttribute( 'uploadStatus', imageElement );
		} );

		fileRepository.destroyLoader( loader );
	}
};

BlockToolbar.prototype._attachButtonToElement = function( targetElement ) {
	if ( targetElement && ( targetElement.textContent || targetElement.closest( 'figure' ) ) ) {
		this._hideButton();
		return;
	}
	// eslint-disable-next-line no-undef
	const contentStyles = window.getComputedStyle( targetElement );
	const editableRect = new Rect( this.editor.ui.getEditableElement() );
	const contentPaddingTop = parseInt( contentStyles.paddingTop, 10 );
	// When line height is not an integer then thread it as "normal".
	// MDN says that 'normal' == ~1.2 on desktop browsers.
	const contentLineHeight = parseInt( contentStyles.lineHeight, 10 ) || parseInt( contentStyles.fontSize, 10 ) * 1.2;
	const position = getOptimalPosition( {
		element: this.buttonView.element,
		target: targetElement,
		positions: [ ( contentRect, buttonRect ) => {
			let left;
			if ( this.editor.locale.uiLanguageDirection === 'ltr' ) {
				left = editableRect.left - buttonRect.width;
			} else {
				left = editableRect.right;
			}
			return {
				top: contentRect.top + contentPaddingTop + ( contentLineHeight - buttonRect.height ) / 2,
				left
			};
		} ]
	} );
	this.buttonView.top = position.top;
	this.buttonView.left = position.left;
};

BlockToolbar.prototype._createButtonView = function() {
	const editor = this.editor;
	const t = editor.t;
	const buttonView = new BlockButtonView( editor.locale );

	buttonView.set( {
		label: t( 'Edit block' ),
		icon: iconPilcrow,
		withText: false
	} );

	// Bind the panelView observable properties to the buttonView.
	buttonView.bind( 'isOn' ).to( this.panelView, 'isVisible' );
	buttonView.bind( 'tooltip' ).to( this.panelView, 'isVisible', isVisible => !isVisible );

	// Toggle the panelView upon buttonView#execute.
	this.listenTo( buttonView, 'execute', () => {
		if ( !this.panelView.isVisible ) {
			this._showPanel();
		} else {
			this._hidePanel( true );
		}
	} );

	this.listenTo( buttonView, 'change:isOn', () => {
		const position = editor.model.document.selection.getLastPosition();
		if ( !buttonView.isOn && position.path[ 0 ] && position.path[ 1 ] ) {
			const element = document.querySelector( '[data-placeholder]:not(figcaption)' ); //eslint-disable-line
			if ( element ) {
				element.classList.add( 'ck-placeholder' );
			}
		}
	} );

	editor.ui.view.body.add( buttonView );
	editor.ui.focusTracker.add( buttonView.element );

	buttonView.element.addEventListener( 'click', function() {
		const element = document.querySelector( '[data-placeholder]:not(figcaption)' ); //eslint-disable-line
		const position = editor.model.document.selection.getLastPosition();
		if ( element && !position.path[ 0 ] && !position.path[ 1 ] ) {
			element.classList.remove( 'ck-placeholder' );
		}
	} );

	return buttonView;
};

DeleteCommand.prototype.execute = function( options = {} ) {
	const model = this.editor.model;
	const doc = model.document;

	model.enqueueChange( this._buffer.batch, writer => {
		this._buffer.lock();

		const selection = writer.createSelection( options.selection || doc.selection );

		// Do not replace the whole selected content if selection was collapsed.
		// This prevents such situation:
		//
		// <h1></h1><p>[]</p>	-->  <h1>[</h1><p>]</p> 		-->  <p></p>
		// starting content		-->   after `modifySelection`	-->  after `deleteContent`.
		const doNotResetEntireContent = selection.isCollapsed;

		// Try to extend the selection in the specified direction.
		if ( selection.isCollapsed ) {
			model.modifySelection( selection, { direction: this.direction, unit: options.unit } );
		}

		// Check if deleting in an empty editor. See #61.
		if ( this._shouldEntireContentBeReplacedWithParagraph( options.sequence || 1 ) ) {
			this._replaceEntireContentWithParagraph( writer );

			return;
		}

		// If selection is still collapsed, then there's nothing to delete.
		if ( selection.isCollapsed ) {
			return;
		}

		let changeCount = 0;

		selection.getFirstRange().getMinimalFlatRanges().forEach( range => {
			changeCount += count(
				range.getWalker( { singleCharacters: true, ignoreElementEnd: true, shallow: true } )
			);
		} );
		const element = doc.selection.getSelectedElement();
		if ( element && element.name === 'image' ) {
			this.editor.execute( 'beforeImageDelete', { img: element, date: new Date().getTime() } );
		}
		model.deleteContent( selection, { doNotResetEntireContent } );
		writer.setSelection( selection );
		this._buffer.input( changeCount );
		this._buffer.unlock();
	} );
};

BlockToolbar.prototype._createPanelView = function() {
	const editor = this.editor;
	const panelView = new BalloonPanelView( editor.locale );
	panelView.content.add( this.toolbarView );
	panelView.class = 'ck-toolbar-container ck-toolbar-circular';
	editor.ui.view.body.add( panelView );
	editor.ui.focusTracker.add( panelView.element );
	// Close #panelView on `Esc` press.
	this.toolbarView.keystrokes.set( 'Esc', ( evt, cancel ) => {
		this._hidePanel( true );
		cancel();
	} );
	return panelView;
};

WidgetToolbarRepository.prototype._showToolbar = function( toolbarDefinition, relatedElement ) {
	if ( this._isToolbarVisible( toolbarDefinition ) ) {
		repositionContextualBalloon( this.editor, relatedElement );
	} else if ( !this._isToolbarInBalloon( toolbarDefinition ) ) {
		this._balloon.add( {
			view: toolbarDefinition.view,
			position: getBalloonPositionData( this.editor, relatedElement ),
			balloonClassName: toolbarDefinition.balloonClassName
		} );

		// Update toolbar position each time stack with toolbar view is switched to visible.
		// This is in a case target element has changed when toolbar was in invisible stack
		// e.g. target image was wrapped by a block quote.
		// See https://github.com/ckeditor/ckeditor5-widget/issues/92.
		this.listenTo( this._balloon, 'change:visibleView', () => {
			for ( const definition of this._toolbarDefinitions.values() ) {
				if ( this._isToolbarVisible( definition ) ) {
					const relatedElement = definition.getRelatedElement( this.editor.editing.view.document.selection );
					repositionContextualBalloon( this.editor, relatedElement );
				}
			}
		} );
	}
	const view = this.editor.editing.view;
	const element = view.domConverter.mapViewToDom( view.document.selection.getSelectedElement() );
	const img = element && element.querySelector( 'img' );
	if ( img && img.naturalWidth ) { toggleSizeButtons( img.naturalWidth ); } // eslint-disable-line
};

MediaEmbedEditing.prototype.init = function() {
	const editor = this.editor;
	const schema = editor.model.schema;
	const t = editor.t;
	const conversion = editor.conversion;
	const renderMediaPreview = editor.config.get( 'mediaEmbed.previewsInData' );
	const registry = this.registry;

	editor.commands.add( 'mediaEmbed', new MediaEmbedCommand( editor ) );

	// Configure the schema.
	schema.register( 'media', {
		isObject: true,
		isBlock: true,
		allowWhere: '$block',
		allowAttributes: [ 'url' ]
	} );

	// Model -> Data
	conversion.for( 'dataDowncast' ).elementToElement( {
		model: 'media',
		view: ( modelElement, viewWriter ) => {
			const url = modelElement.getAttribute( 'url' );
			if ( !url ) { return; } //eslint-disable-line
			return createMediaFigureElement( viewWriter, registry, url, {
				renderMediaPreview: url && renderMediaPreview
			} );
		}
	} );

	// Model -> Data (url -> data-oembed-url)
	conversion.for( 'dataDowncast' ).add(
		modelToViewUrlAttributeConverter( registry, {
			renderMediaPreview
		} ) );

	// Model -> View (element)
	conversion.for( 'editingDowncast' ).elementToElement( {
		model: 'media',
		view: ( modelElement, viewWriter ) => {
			const url = modelElement.getAttribute( 'url' );
			if ( !url ) { return; } //eslint-disable-line
			const figure = createMediaFigureElement( viewWriter, registry, url, {
				renderForEditingView: true
			} );

			return toMediaWidget( figure, viewWriter, t( 'media widget' ) );
		}
	} );

	// Model -> View (url -> data-oembed-url)
	conversion.for( 'editingDowncast' ).add(
		modelToViewUrlAttributeConverter( registry, {
			renderForEditingView: true
		} ) );

	// View -> Model (data-oembed-url -> url)
	conversion.for( 'upcast' )
	// Upcast semantic media.
		.elementToElement( {
			view: {
				name: 'oembed',
				attributes: {
					url: true
				}
			},
			model: ( viewMedia, modelWriter ) => {
				const url = viewMedia.getAttribute( 'url' );

				if ( registry.hasMedia( url ) ) {
					return modelWriter.createElement( 'media', { url } );
				}
			}
		} )
		// Upcast non-semantic media.
		.elementToElement( {
			view: {
				name: 'div',
				attributes: {
					'data-oembed-url': true
				}
			},
			model: ( viewMedia, modelWriter ) => {
				const url = viewMedia.getAttribute( 'data-oembed-url' );

				if ( registry.hasMedia( url ) ) {
					return modelWriter.createElement( 'media', { url } );
				}
			}
		} );
};

ImageEditing.prototype.init = function() {
	const editor = this.editor;
	const schema = editor.model.schema;
	const t = editor.t;
	const conversion = editor.conversion;

	// See https://github.com/ckeditor/ckeditor5-image/issues/142.
	editor.editing.view.addObserver( ImageLoadObserver );

	// Configure schema.
	schema.register( 'image', {
		isObject: true,
		isBlock: true,
		allowWhere: '$block',
		allowAttributes: [ 'alt', 'src', 'srcset', 'data-uri', 'data-link', 'data-natural-height', 'data-natural-width' ]
	} );

	conversion.for( 'dataDowncast' ).elementToElement( {
		model: 'image',
		view: ( modelElement, viewWriter ) => createImageViewElement( viewWriter )
	} );

	conversion.for( 'editingDowncast' ).elementToElement( {
		model: 'image',
		view: ( modelElement, viewWriter ) => toImageWidget( createImageViewElement( viewWriter ), viewWriter, t( 'image widget' ) )
	} );

	conversion.for( 'downcast' )
		.add( modelToViewAttributeConverter( 'src' ) )
		.add( modelToViewAttributeConverter( 'alt' ) )
		.add( modelToViewAttributeConverter( 'data-uri' ) )
		.add( modelToViewAttributeConverter( 'data-link' ) )
		.add( modelToViewAttributeConverter( 'data-natural-width' ) )
		.add( modelToViewAttributeConverter( 'data-natural-height' ) )
		.add( srcsetAttributeConverter() );

	conversion.for( 'upcast' )
		.elementToElement( {
			view: {
				name: 'img',
				attributes: {
					src: true
				}
			},
			model: ( viewImage, modelWriter ) => modelWriter.createElement( 'image', { src: viewImage.getAttribute( 'src' ) } )
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'data-uri'
			},
			model: 'data-uri'
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'data-link'
			},
			model: 'data-link'
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'data-natural-height'
			},
			model: 'data-natural-height'
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'data-natural-width'
			},
			model: 'data-natural-width'
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'alt'
			},
			model: 'alt'
		} )
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'srcset'
			},
			model: {
				key: 'srcset',
				value: viewImage => {
					const value = {
						data: viewImage.getAttribute( 'srcset' )
					};

					if ( viewImage.hasAttribute( 'width' ) ) {
						value.width = viewImage.getAttribute( 'width' );
					}

					return value;
				}
			}
		} )
		.add( viewFigureToModel() );

	// Register imageUpload command.
	editor.commands.add( 'imageInsert', new ImageInsertCommand( editor ) );
};

Widget.prototype._onMousedown = function( eventInfo, domEventData ) {
	const editor = this.editor;
	const view = editor.editing.view;
	const viewDocument = view.document;
	let element = domEventData.target;

	if ( !element ) return; // eslint-disable-line

	// Do nothing for single or double click inside nested editable.
	if ( isInsideNestedEditable( element ) ) {
		// But at least triple click inside nested editable causes broken selection in Safari.
		// For such event, we select the entire nested editable element.
		// See: https://github.com/ckeditor/ckeditor5/issues/1463.
		if ( env.isSafari && domEventData.domEvent.detail >= 3 ) {
			const mapper = editor.editing.mapper;
			const modelElement = mapper.toModelElement( element );

			this.editor.model.change( writer => {
				domEventData.preventDefault();
				writer.setSelection( modelElement, 'in' );
			} );
		}

		return;
	}

	// If target is not a widget element - check if one of the ancestors is.
	if ( !isWidget( element ) ) {
		element = element.findAncestor( isWidget );

		if ( !element ) {
			return;
		}
	}

	domEventData.preventDefault();

	// Focus editor if is not focused already.
	if ( !viewDocument.isFocused ) {
		view.focus();
	}

	// Create model selection over widget.
	const modelElement = editor.editing.mapper.toModelElement( element );

	this._setSelectionOverElement( modelElement );
};

function isInsideNestedEditable( element ) {
	while ( element ) {
		if ( element.is( 'editableElement' ) && !element.is( 'rootElement' ) ) {
			return true;
		}

		// Click on nested widget should select it.
		if ( isWidget( element ) ) {
			return false;
		}

		element = element.parent;
	}

	return false;
}

function repositionContextualBalloon( editor, relatedElement ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );
	const position = getBalloonPositionData( editor, relatedElement );

	balloon.updatePosition( position );
}

function getBalloonPositionData( editor, relatedElement ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: editingView.domConverter.mapViewToDom( relatedElement ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}
