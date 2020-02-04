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
import ImageDeletePlugin from './custom/plugins/image-delete.plugin';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import './custom/builtin-class-customizations';
import '../theme/theme.scss';
import { insertImage } from '@ckeditor/ckeditor5-image/src/image/utils';
import largeGrid from './custom/assets/icons/Large Grid.svg';
import middleGrid from './custom/assets/icons/Middle grid.svg';
import smallGrid from './custom/assets/icons/Small grid.svg';
import BeforeImgInsert from './custom/plugins/before-image-insert.plugin';
import BeforeImgDelete from './custom/plugins/before-image-delete.plugin';

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
	ImageDeletePlugin,
	BeforeImgInsert,
	BeforeImgDelete
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	placeholder: 'Let`s write an awesome story!',
	blockToolbar: [ 'imageUpload', 'mediaEmbed', 'gallery' ],
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
		toolbar: [ 'imageStyle:_grid', 'imageStyle:_container', 'imageStyle:_full', 'imageCrop', 'imageDelete' ],
		styles: [
			'side',
			'alignLeft',
			'alignCenter',
			'alignRight',
			{ name: '_grid', title: 'Grid size', icon: largeGrid, className: 'gridsize-image' },
			{ name: '_container', title: 'Container size', icon: smallGrid, className: 'containersize-image' },
			{ name: '_full', title: 'Full size', icon: middleGrid, className: 'fullsize-image' },
		]
	},
	simpleUpload: {
		uploadUrl: 'https://samoo.free.beeceptor.com/test'
	},
	table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] },
	language: 'en'
};
BalloonEditor.utils = {};
BalloonEditor.utils.fetchLocalImage = fetchLocalImage;
BalloonEditor.utils.insertImage = insertImage;
BalloonEditor.utils.toggleSizeButtons = toggleSizeButtons;

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
