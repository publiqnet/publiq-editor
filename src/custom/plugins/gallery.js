import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import searchIcon from '../assets/icons/Search.svg';
import GalleryCommand from '../commands/gallery.command';

/**
 *
 * minimal configuration of image Gallery plugin.
 * We only want that this plugin fires value change event
 *
 */
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
			editor.commands.add( 'gallery', new GalleryCommand( editor ) );
			const command = editor.commands.get( 'gallery' );
			view.bind( 'galleryIsOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.on( 'execute', () => editor.execute( 'gallery' ) );
			return view;
		} );
	}
}
