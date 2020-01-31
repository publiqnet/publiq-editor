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
		this.value = { ...options };
		// model.change( writer => {
		// 	writer.setAttribute( 'data-temp', option, imageElement );
		// 	writer.removeAttribute( 'data-temp', imageElement );
		// } );
	}
}
