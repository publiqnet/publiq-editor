import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { getSelectedMediaModelWidget } from '@ckeditor/ckeditor5-media-embed/src/utils';
import { embedTypes } from '../customizations';

export default class SocialMediaEmbedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const position = selection.getFirstPosition();
		const selectedMedia = getSelectedMediaModelWidget( selection );

		let parent = position.parent;

		if ( parent != parent.root ) {
			parent = parent.parent;
		}

		this.value = selectedMedia ? selectedMedia.getAttributes( ) : null;
		this.isEnabled = schema.checkChild( parent, 'media' );
	}

	/**
	 * Executes the command, which either:
	 *
	 * * updates the Embed of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param {String} embed The Embed code of the media.
	 */
	execute( options ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedMedia = getSelectedMediaModelWidget( selection );
		const registry = options.registry;
		const embed = options.embed;

		const match = registry._getMatch( embed );
		const dataId = new Date().getTime();
		let type, code, script;
		if ( match && match[ 1 ] ) {
			type = this.checkType( match[ 0 ] );
			code = match[ 1 ];
			script = match[ 2 ];
		}
		if ( selectedMedia ) {
			model.change( writer => {
				writer.setAttributes( { 'data-embed-type': type, 'data-embed-code': code,
					'data-id': `${ type }__${ dataId }`, 'data-embed-script': script }, selectedMedia );
			} );
		} else {
			const insertPosition = findOptimalInsertionPosition( selection, model );
			model.change( writer => {
				const mediaElement = writer.createElement( 'media', { 'data-embed-type': type, 'data-embed-code': code,
					'data-id': `${ type }__${ dataId }`, 'data-embed-script': script
				} );

				model.insertContent( mediaElement, insertPosition );

				writer.setSelection( mediaElement, 'on' );
			} );
		}
	}

	checkType( embed ) {
		const types = embedTypes();
		for ( const [ type, value ] of Object.entries( types ) ) {
			if ( embed.includes( value ) ) {
				return type;
			}
		}

		return null;
	}
}
