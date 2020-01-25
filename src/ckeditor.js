/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 * hello Sam
 */

// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ImageGalleryPlugin from './custom/plugins/image-gallery.plugin';
import ImageCropPlugin from './custom/plugins/image-crop.plugin';
import SimpleUploadAdapterCustom from './custom/adapter/custom-upload.adapter';
import env from '@ckeditor/ckeditor5-utils/src/env';
import '../theme/theme.scss';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageDeletePlugin from './custom/plugins/image-delete.plugin';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';

export default class BalloonEditor extends BalloonEditorBase {
}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	SimpleUploadAdapterCustom,
	Enter,
	Essentials,
	Autoformat,
	BlockToolbar,
	Bold,
	Italic,
	BlockQuote,
	CKFinder,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	ImageGalleryPlugin,
	ImageCropPlugin,
	ImageDeletePlugin
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	placeholder: 'Let`s write an awesome story!',
	blockToolbar: [ 'imageUpload', 'mediaEmbed', 'gallery' ],
	simpleUpload: {
		uploadUrl: 'https://publiq.free.beeceptor.com/test'
	},
	toolbar: {
		items: [
			'blockQuote',
			'bulletedList',
			'numberedList',
			'|',
			'heading',
			'bold',
			'italic',
			'link',
		]
	}, // '|', 'indent', 'outdent' undo, redo,
	image: {
		upload: {
			types: [ 'gif', 'jpg', 'jpeg', 'png' ]
		},
		toolbar: [ 'imageStyle:alignCenter', 'imageStyle:full', 'imageCrop', 'imageDelete' ],
		styles: [
			'full',
			'side',
			'alignLeft',
			'alignCenter',
			'alignRight'
		]
	},
	table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] },
	language: 'en'
};
BalloonEditor.utils = {};
BalloonEditor.utils.fetchLocalImage = fetchLocalImage;

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
				console.log( 'new era' );
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

/* BlockToolbar.prototype.init = function() {
	const editor = this.editor;
	this.listenTo( editor.editing.view.document, 'click', ( eventInfo, event ) => {
		if ( !event.target.isEmpty && event.target.nodeName !== 'DIV' ) {
			this._hideButton();
		}
	} );
	// this.listenTo( editor.editing.view.document, 'enter', ( eventInfo, event ) => {
	// 	if ( !event.target.isEmpty && event.target.nodeName !== 'DIV' ) {
	// 		this._hideButton();
	// 	}
	// } );
	// Hides panel on a direct selection change.
	this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
		if ( data.directChange ) {
			this._hidePanel();
		}
	} );

	this.listenTo( editor.ui, 'update', () => this._updateButton() );
	// `low` priority is used because of https://github.com/ckeditor/ckeditor5-core/issues/133.
	this.listenTo( editor, 'change:isReadOnly', () => this._updateButton(), { priority: 'low' } );
	this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._updateButton() );
	// Reposition button on resize.
	this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
		if ( isVisible ) {
			// Keep correct position of button and panel on window#resize.
			this.buttonView.listenTo( window, 'resize', () => this._updateButton() );
		} else {
			// Stop repositioning button when is hidden.
			this.buttonView.stopListening( window, 'resize' );

			// Hide the panel when the button disappears.
			this._hidePanel();
		}
	} );
};*/
BlockToolbar.prototype._updateButton = function() {
	const editor = this.editor;
	const model = editor.model;
	const view = editor.editing.view;

	// Hides the button when the editor is not focused.
	if ( !editor.ui.focusTracker.isFocused ) {
		this._hideButton();

		return;
	}

	// Hides the button when the editor switches to the read-only mode.
	if ( editor.isReadOnly ) {
		this._hideButton();

		return;
	}

	// Get the first selected block, button will be attached to this element.
	const modelTarget = Array.from( model.document.selection.getSelectedBlocks() )[ 0 ];

	// Hides the button when there is no enabled item in toolbar for the current block element.
	if ( !modelTarget || Array.from( this.toolbarView.items ).every( item => !item.isEnabled ) ) {
		this._hideButton();

		return;
	}

	// Get DOM target element.
	const domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget ) );

	// Show block button.
	this.buttonView.isVisible = true;

	// Attach block button to target DOM element.
	this._attachButtonToElement( domTarget );

	// When panel is opened then refresh it position to be properly aligned with block button.
	if ( this.panelView.isVisible ) {
		this._showPanel();
	}
	doStuff( editor );
};

function doStuff( editor ) {
	const pos = editor.model.document.selection.getFirstPosition();

	const posStart = Position._createAt( pos.root, 'after' );
	const posEnd = Position._createAt( pos.root, 'end' );

	const rangeBefore = new Range( posStart, pos );
	const rangeAfter = new Range( pos, posEnd );

	const fragBefore = editor.data.getSelectedContent( new Selection( [ rangeBefore ] ) );
	const fragAfter = editor.data.getSelectedContent( new Selection( [ rangeAfter ] ) );

	const before = editor.data.stringify( fragBefore );
	const after = editor.data.stringify( fragAfter );
	console.log( before );
	console.log( after );
	return [ before, after ];
}
