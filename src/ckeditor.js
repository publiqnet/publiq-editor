/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 * hello Sam
 */

// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
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
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import '../theme/theme.scss';
import Gallery from './custom/plugins/gallery';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

export default class BalloonEditor extends BalloonEditorBase {
}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	SimpleUploadAdapter,
	Enter,
	Essentials,
	UploadAdapter,
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
	Gallery,
	Underline
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
		] }, // '|', 'indent', 'outdent' undo, redo,
	image: {
		upload: {
			types: [ 'gif', 'jpg', 'jpeg', 'png' ]
		},
		toolbar: [ 'imageResize', 'imageTextAlternative', '|', 'imageStyle:alignCenter', 'imageStyle:full', 'imageStyle:side', 'undo' ],
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
