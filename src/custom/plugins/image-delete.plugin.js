import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import deleteIcon from '../assets/icons/Delete.svg';
import ImageDeleteCommand from '../commands/image-delete.command';

/**
 *
 * minimal configuration of image Delete plugin.
 * We only want that this plugin fires value change event
 *
 */
export default class ImageDeletePlugin extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'imageDelete', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Remove Image',
				icon: deleteIcon,
				tooltip: true,
				deleteIsOn: false,
				isOn: false
			} );
			editor.commands.add( 'imageDelete', new ImageDeleteCommand( editor ) );
			const command = editor.commands.get( 'imageDelete' );
			view.bind( 'deleteIsOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.on( 'execute', () => editor.execute( 'imageDelete' ) );
			return view;
		} );
	}
}
