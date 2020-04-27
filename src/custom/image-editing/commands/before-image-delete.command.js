import Command from '@ckeditor/ckeditor5-core/src/command';
import { isImage } from '@ckeditor/ckeditor5-image/src/image/utils';

export default class BeforeImageDelete extends Command {
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
			const nextElement = options.img.nextSibling;
			if ( nextElement && ( nextElement.name === 'paragraph' && nextElement.isEmpty ) ) {
				writer.remove( options.img.nextSibling );
			}
		} );
	}
}
