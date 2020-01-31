import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import BeforeImageInsert from '../commands/before-image-insert.command';

/**
 *
 * minimal configuration of before image insert plugin.
 * We only want that this plugin fires value change event
 *
 */
export default class BeforeImgInsert extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'beforeImgInsert', locale => {
			const view = new ButtonView( locale );
			view.set( {
				beforeInsert: null,
				isOn: false
			} );
			editor.commands.add( 'beforeImageInsert', new BeforeImageInsert( editor ) );
			const command = editor.commands.get( 'beforeImageInsert' );
			view.bind( 'beforeInsert', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			return view;
		} );
	}
}
