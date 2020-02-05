import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import DeleteCommand from '@ckeditor/ckeditor5-typing/src/deletecommand';
import count from '@ckeditor/ckeditor5-utils/src/count';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

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
					'data-link': 'data.link',
					'data-natural-width': data.width,
					'data-natural-height': data.height,
					'data-size': data.size.name,
					'imageStyle': data.size.alias
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
				notification.showWarning( error, {
					title: t( 'Upload failed' ),
					namespace: 'upload'
				} );
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
	if ( targetElement.textContent || targetElement.nodeName === 'FIGURE' ) {
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

export function getImageSizeName( width = 0 ) {
	if ( width >= 1440 ) {
		return {
			name: 'fullsize',
			alias: '_full'
		};
	} else if ( width >= 1310 ) {
		return {
			name: 'conatinersize',
			alias: '_container'
		};
	} else if ( width >= 870 ) {
		return {
			name: 'gridsize',
			alias: '_grid'
		};
	}

	return { name: null, alias: null };
}

export async function getImageParameters( options ) {
	const promise = new Promise( ( resolve, reject ) => { // eslint-disable-line
		const image = new Image(); // eslint-disable-line
		image.src = URL.createObjectURL( file ); // eslint-disable-line
		image.onload = () => {
			const attributes = {
				default: options.url,
				uri: options.uri,
				link: options.link,
				width: image.naturalWidth,
				height: image.naturalHeight,
				size: getImageSizeName( image.naturalWidth )
			};
			resolve( attributes );
		};
	} );
	return await promise;
}

export function toggleSizeButtons( size = 'defaultSize' ) {
	const $buttonFullsize = document.querySelector( '[data-size-toggler="fullsize"]' ).parentNode.parentNode; // eslint-disable-line
	const $buttonContainersize = document.querySelector( '[data-size-toggler="containersize"]' ).parentNode.parentNode; // eslint-disable-line
	const $buttonGridsize = document.querySelector( '[data-size-toggler="gridsize"]' ).parentNode.parentNode; // eslint-disable-line

	switch ( size ) {
		case 'fullsize':
			$buttonFullsize.classList.remove( 'ck-disabled' );
			$buttonContainersize.classList.remove( 'ck-disabled' );
			$buttonGridsize.classList.remove( 'ck-disabled' );

			$buttonFullsize.removeAttribute( 'disabled' );
			$buttonContainersize.removeAttribute( 'disabled' );
			$buttonGridsize.removeAttribute( 'disabled' );
			break;

		case 'containersize':
			$buttonFullsize.classList.add( 'ck-disabled' );
			$buttonContainersize.classList.remove( 'ck-disabled' );
			$buttonGridsize.classList.remove( 'ck-disabled' );

			$buttonFullsize.setAttribute( 'disabled', true );
			$buttonContainersize.removeAttribute( 'disabled' );
			$buttonGridsize.removeAttribute( 'disabled' );
			break;

		case 'gridsize':
			$buttonFullsize.classList.add( 'ck-disabled' );
			$buttonContainersize.classList.add( 'ck-disabled' );
			$buttonGridsize.classList.remove( 'ck-disabled' );

			$buttonFullsize.setAttribute( 'disabled', true );
			$buttonContainersize.setAttribute( 'disabled', true );
			$buttonGridsize.removeAttribute( 'disabled' );
			break;

		default:
			$buttonFullsize.classList.add( 'ck-disabled' );
			$buttonContainersize.classList.add( 'ck-disabled' );
			$buttonGridsize.classList.add( 'ck-disabled' );

			$buttonFullsize.setAttribute( 'disabled', true );
			$buttonContainersize.setAttribute( 'disabled', true );
			$buttonGridsize.setAttribute( 'disabled', true );
			break;
	}
}
