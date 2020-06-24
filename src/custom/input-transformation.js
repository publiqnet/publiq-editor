import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

export default class InputTransformation extends Plugin {
	init() {
		const editor = this.editor;
		const writer = new UpcastWriter();
		const editingView = editor.editing.view;
		const clipboardPlugin = editor.plugins.get( 'Clipboard' );

		editingView.document.on( 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			let content = dataTransfer.getData( 'text/html' );
			content = clipboardPlugin._htmlDataProcessor.toView( content );
			const elements = content.getChildren();
			const newContent = [];

			let result = elements.next();
			while ( !result.done ) {
				const element = result.value;
				if ( element.name === 'figure' ) {
					let hasImageElement = false;
					const figureNodes = element.getChildren();
					let nestedResult = figureNodes.next();
					while ( !nestedResult.done ) {
						const node = nestedResult.value;
						if ( node.name === 'img' ) {
							newContent.push( node );
							hasImageElement = true;
							break;
						}
						nestedResult = elements.next();
					}
					if ( !hasImageElement ) {
						newContent.push( element );
					}
				} else {
					newContent.push( element );
				}
				result = elements.next();
			}
			content = writer.createDocumentFragment( newContent );
			clipboardPlugin.fire( 'inputTransformation', { content, dataTransfer } );
			editingView.scrollToTheSelection();

			evt.stop();
		} );
	}
}
