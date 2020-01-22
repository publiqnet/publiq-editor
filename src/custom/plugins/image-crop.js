import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import cropIcon from '../assets/icons/Crop.svg';

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
			const command = editor.commands.get( 'imageTextAlternative' );
			view.bind( 'cropIsOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			this.listenTo( view, 'execute', () =>
				editor.execute( 'imageTextAlternative', { newValue: 'publiq' + new Date().getMilliseconds() } ) );
			return view;
		} );
	}
}
