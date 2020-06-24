import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InputTransformation extends Plugin {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const clipboardPlugin = editor.plugins.get( 'Clipboard' );

		editingView.document.on( 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = dataTransfer.getData( 'text/html' );
			content = content.replace( new RegExp( /<figure .*?>.*?(<img.*?>).*?<\/figure>/, 'g' ), '' );
			content = clipboardPlugin._htmlDataProcessor.toView( content );

			clipboardPlugin.fire( 'inputTransformation', { content, dataTransfer } );
			editingView.scrollToTheSelection();

			evt.stop();
		} );
	}
}
