import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import BeforeImageDelete from '../commands/before-image-delete.command';

/**
 *
 * minimal configuration of before image delete plugin.
 * We only want that this plugin fires value change event
 *
 */
export default class BeforeImageDeletePlugin extends Plugin {
	init() {
		const editor = this.editor;
		editor.commands.add( 'beforeImageDelete', new BeforeImageDelete( editor ) );
		editor.ui.componentFactory.add( 'beforeImgDelete', locale => {
			const view = new ButtonView( locale );
			view.set( {
				beforeDelete: null,
				isOn: false
			} );
			const command = editor.commands.get( 'beforeImageDelete' );
			view.bind( 'beforeDelete', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.on( 'execute', () => editor.execute( 'beforeImageDelete' ) );
			return view;
		} );
	}
}
