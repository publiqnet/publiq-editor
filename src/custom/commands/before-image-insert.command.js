import Command from '@ckeditor/ckeditor5-core/src/command';
import { isImage } from '@ckeditor/ckeditor5-image/src/image/utils';

export default class BeforeImageInsert extends Command {
	/**
	 * *
	 * @readonly
	 * @observable
	 * @member {String|Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();
		this.isEnabled = isImage( element );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		this.value = { ...options };
		model.change( writer => {
			const caretPosition = model.document.selection.getLastPosition();
			if ( !caretPosition.nodeAfter || caretPosition.nodeAfter.name !== 'paragraph' ) {
				const pElement = writer.createElement( 'paragraph' );
				writer.insert( pElement, model.document.selection.getLastPosition() );
			}
		} );
	}
}
