import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition, isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { insertNewLine } from '../customizations';
import TexEditing from '../plugins/tex-editing.plugin';

export default class RenderTexCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		const selectedElement = selection.getSelectedElement();

		let parent = position.parent;

		if ( parent != parent.root ) {
			parent = parent.parent;
		}

		this.value = selectedElement ? selectedElement.getAttributes( ) : null;
		this.isEnabled = schema.checkChild( parent, 'div' );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the Embed of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param {String} embed The Embed code of the media.
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const dataId = new Date().getTime();
		const type = options.type;
		this.editor.plugins.get( TexEditing ).texInput = options.texInput;

		const selectedElement = selection.getSelectedElement();
		if ( selectedElement && isWidget( selectedElement ) ) {
			model.change( writer => {
				writer.setAttributes( { 'data-type': type, 'data-id': `${ type }__${ dataId }` }, selectedElement );
			} );
		} else {
			const insertPosition = findOptimalInsertionPosition( selection, model );
			model.change( writer => {
				const widgetElement = writer.createElement( 'div', { 'data-type': type, 'data-id': `${ type }__${ dataId }` } );

				model.insertContent( widgetElement, insertPosition );
				insertNewLine( model, widgetElement );
				writer.setSelection( widgetElement, 'on' );
			} );
		}
	}
}
