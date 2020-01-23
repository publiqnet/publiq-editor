import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import cropIcon from '../assets/icons/Crop.svg';
import ImageCropCommand from '../commands/crop.command';

/**
 *
 * minimal configuration of Image crop plugin.
 * We only want that this plugin fires value change event
 *
 */
export default class ImageCrop extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'imageCrop', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Crop Image',
				icon: cropIcon,
				tooltip: true,
				cropIsOn: false,
				isOn: false
			} );
			editor.commands.add( 'imageCrop', new ImageCropCommand( editor ) );
			const command = editor.commands.get( 'imageCrop' );
			view.bind( 'cropIsOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.on( 'execute', () => editor.execute( 'imageCrop' ) );
			return view;
		} );
	}
}
