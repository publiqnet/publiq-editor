import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import searchIcon from '../assets/icons/Search.svg';

export default class Gallery extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'gallery', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Search Image',
				icon: searchIcon,
				tooltip: true,
				galleryIsOn: false,
				isOn: false
			} );
			const command = editor.commands.get( 'underline' );
			view.bind( 'galleryIsOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			this.listenTo( view, 'execute', () => editor.execute( 'underline' ) );
			return view;
		} );
	}
}
