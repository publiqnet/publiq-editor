import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import TexEditing from '../plugins/tex-editing.plugin';
import { insertNewLine } from '../../utils/utils';

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
	 * * updates the Tex of the selected widget,
	 * * inserts the new Tex element into the editor and puts the selection around it.
	 *
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		options.dataId = new Date().getTime();

		const selectedElement = selection.getSelectedElement();
		const isTexWidget = ( selectedElement && selectedElement.getAttribute( 'data-type' ) === 'tex-input' );

		const insertPosition = findOptimalInsertionPosition( selection, model );
		if ( selectedElement && isTexWidget ) {
			this._addModelTexElement( insertPosition, options, 'edit', selectedElement );
		} else {
			this._addModelTexElement( insertPosition, options, 'create' );
		}
	}

	_addModelTexElement( insertPosition, options, type = 'create', selectedElement = null ) {
		const editor = this.editor;
		const model = editor.model;
		model.change( writer => {
			const modelTexElement = writer.createElement( 'div', { 'data-type': options.type,
				'data-id': `${ options.type }__${ options.dataId }`, 'data-curr-rendering': 'false' } );
			modelTexElement.getFillerOffset = () => null;
			model.insertContent( modelTexElement, insertPosition );
			writer.setSelection( modelTexElement, 'on' );
			editor.plugins.get( TexEditing ).texInput.set( modelTexElement, options.texInput );
			if ( type === 'create' ) {
				insertNewLine( model, modelTexElement );
			} else {
				writer.remove( selectedElement );
			}
		} );
	}
}

