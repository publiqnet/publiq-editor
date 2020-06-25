import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import plainTextToHtml from '@ckeditor/ckeditor5-clipboard/src/utils/plaintexttohtml';
import normalizeClipboardHtml from '@ckeditor/ckeditor5-clipboard/src/utils/normalizeclipboarddata';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

export default class InputTransformation extends Plugin {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const clipboardPlugin = editor.plugins.get( 'Clipboard' );
		this._htmlDataProcessor = new HtmlDataProcessor();

		editingView.document.on( 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				content = dataTransfer.getData( 'text/html' )
					.replace( new RegExp( /<figure .*?>.*?(<img.*?>).*?<\/figure>/, 'g' ), '' );
				content = normalizeClipboardHtml( content );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );
			}
			content = this._htmlDataProcessor.toView( content );

			clipboardPlugin.fire( 'inputTransformation', { content, dataTransfer } );

			editingView.scrollToTheSelection();

			evt.stop();
		} );
		// prevent default action and upload image file to server when pasting it.
		editingView.document.on( 'clipboardInput', ( evt, data ) => {
			if ( data.dataTransfer.files.length ) {
				editor.execute( 'delete' );
				editor.execute( 'imageUpload', { file: data.dataTransfer.files[ 0 ] } );

				evt.stop();
			}
		}, { priority: 'high' } );
	}
}
