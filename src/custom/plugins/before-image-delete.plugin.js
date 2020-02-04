import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import BeforeImageDelete from '../commands/before-image-delete.command';

/**
 *
 * minimal configuration of before image insert plugin.
 * We only want that this plugin fires value change event
 *
 */
export default class BeforeImgDelete extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'beforeImgDelete', locale => {
			const view = new ButtonView( locale );
			view.set( {
				beforeDelete: null,
				isOn: false
			} );
			editor.commands.add( 'beforeImageDelete', new BeforeImageDelete( editor ) );
			const command = editor.commands.get( 'beforeImageDelete' );
			view.bind( 'beforeDelete', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			return view;
		} );
	}
}
