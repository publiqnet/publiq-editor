import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

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
				// console.log( 'new era' );
				writer.setAttributes( { uploadStatus: 'complete', src: data.default, 'data-uri': data.uri }, imageElement );
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
