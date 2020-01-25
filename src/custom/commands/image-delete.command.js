import Command from '@ckeditor/ckeditor5-core/src/command';
import { isImage } from '@ckeditor/ckeditor5-image/src/image/utils';

export default class ImageDeleteCommand extends Command {
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
	execute( ) {
		const model = this.editor.model;
		const imageElement = model.document.selection.getSelectedElement();
		this.value = { img: imageElement, date: new Date().getTime() };
		model.change( writer => {
			writer.remove( imageElement );
		} );
	}
}
