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
	 * * updates the Tex of the selected widget,
	 * * inserts the new Tex element into the editor and puts the selection around it.
	 *
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const dataId = new Date().getTime();
		const type = options.type;
		const currRendering = options[ 'data-curr-rendering' ];
		this.editor.plugins.get( TexEditing ).texInput = options.texInput;

		const selectedElement = selection.getSelectedElement();
		let _isWidget;
		try {
			_isWidget = isWidget( selectedElement );
		} catch ( e ) {
			_isWidget = false;
		}

		if ( selectedElement && _isWidget ) {
			model.change( writer => {
				writer.setAttributes( { 'data-type': type, 'data-id': `${ type }__${ dataId }`,
					'data-curr-rendering': currRendering }, selectedElement );
			} );
		} else {
			const insertPosition = findOptimalInsertionPosition( selection, model );
			model.change( writer => {
				const widgetElement = writer.createElement( 'div', { 'data-type': type, 'data-id': `${ type }__${ dataId }`,
					'data-curr-rendering': currRendering } );

				model.insertContent( widgetElement, insertPosition );
				insertNewLine( model, widgetElement );
				writer.setSelection( widgetElement, 'on' );
			} );
		}
	}
}
