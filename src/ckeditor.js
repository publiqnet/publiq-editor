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
import ImageGalleryPlugin from './custom/image-editing/plugins/image-gallery.plugin';
import ImageCropPlugin from './custom/image-editing/plugins/image-crop.plugin';
import SimpleUploadAdapterCustom from './custom/adapter/custom-upload.adapter';
import ImageDeletePlugin from './custom/image-editing/plugins/image-delete.plugin';
import largeGrid from './custom/assets/icons/Large Grid.svg';
import middleGrid from './custom/assets/icons/Middle grid.svg';
import smallGrid from './custom/assets/icons/Small grid.svg';
import BeforeImageInsertPlugin from './custom/image-editing/plugins/before-image-insert.plugin';
import BeforeImageDeletePlugin from './custom/image-editing/plugins/before-image-delete.plugin';
import SocialMediaEmbedEditing from './custom/social-embedding/plugins/social-embed-editing.plugin';
import SocialEmbedPlugin from './custom/social-embedding/plugins/social-embed.plugin';
import TexPlugin from './custom/tex-editing/plugins/tex.plugin';
import TexToolbar from './custom/tex-editing/plugins/tex-toolbar.plugin';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import SpecialCharacters from './custom/special-characters/plugins/specialcharacters';
import SpecialCharactersEssentials from './custom/special-characters/plugins/specialcharactersessentials';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import { insertImage } from '@ckeditor/ckeditor5-image/src/image/utils';
import { GreekCharacters } from './custom/special-characters/plugins/specialcharactersgreek';
import { getImageProperties, toggleSizeButtons } from './custom/utils/utils';
import * as customizations from './custom/customizations'; //eslint-disable-line
import '../theme/theme.scss';

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
	BeforeImageInsertPlugin,
	BeforeImageDeletePlugin,
	SocialMediaEmbedEditing,
	SocialEmbedPlugin,
	TexPlugin,
	TexToolbar,
	Strikethrough,
	Code,
	Subscript,
	Superscript,
	SpecialCharacters,
	SpecialCharactersEssentials,
	GreekCharacters
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	placeholder: `Let's write an awesome story!`, // eslint-disable-line
	blockToolbar: [ 'imageUpload', 'mediaEmbed', 'gallery', 'socialMediaEmbed' ],
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
			'|',
			'strikethrough',
			'code',
			'subscript',
			'superscript',
			'specialCharacters'
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
			{ name: '_full', title: 'Full size', icon: middleGrid, className: 'fullsize-image' }
		]
	},
	table: { contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ] },
	tex: { texToolbar: [ 'copyTex', 'editTex' ] },
	language: 'en',
	link: {
		addTargetToExternalLinks: true
	},
	mediaEmbed: {
		previewsInData: true,
		extraProviders: [
			{
				name: 'pinterest',
				url: [
					/(<a data-pin-do="embedPin" .*?href="https:\/\/www\.pinterest\.com\/pin\/.*?".*?><\/a>)\s?(<script .*?>.*?<\/script>)/,
					/(<a data-pin-do="embedPin" .*?href="https:\/\/www\.pinterest\.com\/pin\/.*?".*?><\/a>)/
				],
				html: match => {
					return ( match[ 1 ] );
				}
			},
			{
				name: 'twitter',
				url: [
					/(<blockquote .*?class="twitter-tweet".*?>.*?<a href="https:\/\/t\.co\/.*?".*?>.*?<\/a>.*?<\/blockquote>)\s?(<script .*?>.*?<\/script>)/, // eslint-disable-line
					/(<blockquote .*?class="twitter-tweet".*?>.*?<a href="https:\/\/t\.co\/.*?".*?>.*?<\/a>.*?<\/blockquote>)/,
					/(<blockquote .*?class="twitter-tweet".*?>.*?<a href="https:\/\/twitter\.com\/.*?".*?>.*?<\/a>.*?<\/blockquote>)\s?(<script .*?>.*?<\/script>)/, // eslint-disable-line
					/(<blockquote .*?class="twitter-tweet".*?>.*?<a href="https:\/\/twitter\.com\/.*?".*?>.*?<\/a>.*?<\/blockquote>)/
				],
				html: match => {
					return ( match[ 1 ] );
				}
			},
			{
				name: 'facebook',
				url: [
					/(<iframe .*?src="https:\/\/www\.facebook\.com\/plugins\/.*?".*?>\s?<\/iframe>)/
				],
				html: match => {
					return ( match[ 1 ] );
				}
			},
			{
				name: 'instagram',
				url: [
					/(<blockquote .*?class="instagram-media" .*?data-instgrm-permalink="https:\/\/www\.instagram\.com\/p\/.*?" .*?>.*?<\/blockquote>)\s?(<script .*?>.*?<\/script>)/, // eslint-disable-line
					/(<blockquote .*?class="instagram-media" .*?data-instgrm-permalink="https:\/\/www\.instagram\.com\/p\/.*?" .*?>.*?<\/blockquote>)/ // eslint-disable-line
				],
				html: match => {
					return ( match[ 1 ] );
				}
			},
			{
				name: 'youtube',
				url: [
					/(<iframe .*?src="https:\/\/www\.youtube\.com\/embed\/.*?".*?>\s?<\/iframe>)/
				],
				html: match => {
					return ( match[ 1 ] );
				}
			}
		]
	}
};
BalloonEditor.utils = {};
BalloonEditor.utils.fetchLocalImage = fetchLocalImage;
BalloonEditor.utils.insertImage = insertImage;
BalloonEditor.utils.toggleSizeButtons = toggleSizeButtons;
BalloonEditor.utils.getImageProperties = getImageProperties;
