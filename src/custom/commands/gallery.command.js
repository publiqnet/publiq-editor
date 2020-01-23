import Command from '@ckeditor/ckeditor5-core/src/command';

export default class GalleryCommand extends Command {
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
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute( ) {
		this.value = new Date().getTime();
	}
}
