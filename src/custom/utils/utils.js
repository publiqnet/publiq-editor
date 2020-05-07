import { findAncestor } from '@ckeditor/ckeditor5-table/src/commands/utils';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import SwitchButtonView from '@ckeditor/ckeditor5-ui/src/button/switchbuttonview';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ModalPanelView from '../views/modal/modal-panel.view';
import ModalView from '../views/modal/modal.view';
import katex from 'katex/dist/katex';

export function toBoolean( val ) {
	const stringToBoolean = new Map( [ [ 'true', true ], [ 'false', false ], [ '0', false ], [ '', false ], [ ' ', false ], [ 0, false ] ] );// eslint-disable-line
	if ( stringToBoolean.has( val ) ) return stringToBoolean.get( val );// eslint-disable-line
	return true;
}

export function getSelectedTexWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && viewElement.name === 'div' &&
		viewElement.getAttribute( 'data-type' ) === 'tex-input' &&
		isWidget( viewElement )
	) {
		return viewElement;
	}

	return null;
}

/**
 * Returns a tex widget editing view element if one is among selection's ancestors.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {module:engine/view/element~Element|null}
 */
export function getTexWidgetAncestor( selection ) {
	const parentTex = findAncestor( 'div', selection.getFirstPosition() );

	if ( parentTex && isWidget( parentTex ) ) {
		return parentTex;
	}

	return null;
}

export function closeModalOnExecute( modalView ) {
	// Close the dropdown when one of the list items has been executed.
	modalView.on( 'execute', evt => {
		// Toggling a switch button view should not close the dropdown.
		if ( evt.source instanceof SwitchButtonView ) {
			return;
		}

		modalView.isOpen = false;
	} );
}

export function focusModalContentsOnArrows( modalView ) {
	// If the dropdown panel is already open, the arrow down key should focus the first child of the #panelView.
	modalView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( modalView.isOpen ) {
			modalView.panelView.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should focus the last child of the #panelView.
	modalView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( modalView.isOpen ) {
			modalView.panelView.focusLast();
			cancel();
		}
	} );
}

export function closeModalOnBlur( modalView ) {
	modalView.on( 'render', () => {
		clickOutsideHandler( {
			emitter: modalView,
			activator: () => modalView.isOpen,
			callback: () => {
				modalView.isOpen = false;
			},
			contextElements: [ modalView.element ]
		} );
	} );
}

export function createModal( locale ) {
	const panelView = new ModalPanelView( locale );
	const modalView = new ModalView( locale, panelView );
	addDefaultBehavior( modalView );

	return modalView;
}

export function addDefaultBehavior( modalView ) {
	closeModalOnBlur( modalView );
	closeModalOnExecute( modalView );
	focusModalContentsOnArrows( modalView );
}

export function getImageSizeName( width = 0 ) {
	if ( width >= 1440 ) {
		return '_full';
	} else if ( width >= 1310 ) {
		return '_container';
	} else if ( width >= 870 ) {
		return '_grid';
	}

	return null;
}

export async function getImageProperties( options, file, editor ) {
	const promise = new Promise( ( resolve, reject ) => { // eslint-disable-line
		const image = new Image(); // eslint-disable-line
		const url = URL.createObjectURL( file ); // eslint-disable-line
		image.src = url;
		image.onload = () => {
			const attributes = {
				default: options.url,
				uri: options.uri,
				link: options.link,
				width: image.naturalWidth,
				height: image.naturalHeight,
				size: getImageSizeName( image.naturalWidth )
			};
			editor.execute( 'beforeImageInsert', attributes );
			resolve( attributes );
		};
	} );
	return await promise;
}

export	function toggleSizeButtons( width = 0 ) {
	const $buttonFullsize = document.querySelector( '[data-size-toggler="fullsize"]' ).parentNode.parentNode; // eslint-disable-line
	const $buttonContainersize = document.querySelector( '[data-size-toggler="containersize"]' ).parentNode.parentNode; // eslint-disable-line
	const $buttonGridsize = document.querySelector( '[data-size-toggler="gridsize"]' ).parentNode.parentNode; // eslint-disable-line

	if ( width >= 1440 ) {
		$buttonFullsize.classList.remove( 'ck-disabled' );
		$buttonContainersize.classList.remove( 'ck-disabled' );
		$buttonGridsize.classList.remove( 'ck-disabled' );

		$buttonFullsize.removeAttribute( 'disabled' );
		$buttonContainersize.removeAttribute( 'disabled' );
		$buttonGridsize.removeAttribute( 'disabled' );
	} else if ( width >= 1310 ) {
		$buttonFullsize.classList.add( 'ck-disabled' );
		$buttonContainersize.classList.remove( 'ck-disabled' );
		$buttonGridsize.classList.remove( 'ck-disabled' );

		$buttonFullsize.setAttribute( 'disabled', true );
		$buttonContainersize.removeAttribute( 'disabled' );
		$buttonGridsize.removeAttribute( 'disabled' );
	} else if ( width >= 870 ) {
		$buttonFullsize.classList.add( 'ck-disabled' );
		$buttonContainersize.classList.add( 'ck-disabled' );
		$buttonGridsize.classList.remove( 'ck-disabled' );

		$buttonFullsize.setAttribute( 'disabled', true );
		$buttonContainersize.setAttribute( 'disabled', true );
		$buttonGridsize.removeAttribute( 'disabled' );
	} else {
		$buttonFullsize.classList.add( 'ck-disabled' );
		$buttonContainersize.classList.add( 'ck-disabled' );
		$buttonGridsize.classList.add( 'ck-disabled' );

		$buttonFullsize.setAttribute( 'disabled', true );
		$buttonContainersize.setAttribute( 'disabled', true );
		$buttonGridsize.setAttribute( 'disabled', true );
	}
}

export function insertNewLine( model, afterElement = '' ) {
	model.change( writer => {
		const caretPosition = model.document.selection.getLastPosition();
		if ( !caretPosition.nodeAfter || caretPosition.nodeAfter.name !== 'paragraph' ) {
			const pElement = writer.createElement( 'paragraph' );
			const position = afterElement ? writer.createPositionAfter( afterElement ) : model.document.selection.getLastPosition();
			writer.insert( pElement, position );
		}
	} );
}

export const embedTypes = ( ) => {
	return {
		instagram: 'data-instgrm-permalink',
		twitter: 'twitter-tweet',
		facebook: 'src="https://www.facebook.com/',
		youtube: 'src="https://www.youtube.com/',
		pinterest: 'href="https://www.pinterest.com'
	};
};

export const embedScripts = () => {
	return {
		instagram: '//www.instagram.com/embed.js',
		twitter: 'https://platform.twitter.com/widgets.js',
		pinterest: '//assets.pinterest.com/js/pinit.js'
	};
};

export function runEmbedScript( src, type ) {
	const runScript = () => {
		const script = document.createElement( 'script' ); // eslint-disable-line
		script.src = embedScripts()[ type ];
		script.async = true;
		script.defer = true;
		document.body.appendChild( script ); // eslint-disable-line
	};
	switch ( type ) {
		case 'instagram' :
			if ( window.instgrm ) { // eslint-disable-line
				setTimeout(() => { // eslint-disable-line
					instgrm.Embeds.process(); // eslint-disable-line
				}, 0 );
			} else { runScript(); }
			break;
		case 'twitter' :
			if ( window.twttr ) { // eslint-disable-line
				setTimeout(() => { // eslint-disable-line
					twttr.widgets.load(); // eslint-disable-line
				}, 0 );
			} else { runScript(); }
			break;
		case 'pinterest' :
			if ( window.PinUtils ) { // eslint-disable-line
				setTimeout(() => { // eslint-disable-line
					PinUtils.build(); // eslint-disable-line
				}, 0 );
			} else { runScript(); }
			break;
	}
}

export function renderTexInput( texInput, element ) {
	try {
		const options = { output: 'html', macros: { '\\f': 'f(#1)' }, displayMode: true };
		const containerElement = document.createElement( 'div' ); // eslint-disable-line
		containerElement.appendChild( element.cloneNode( true ) );
		katex.render( texInput, containerElement, options );
		return containerElement.children[ 0 ];
	} catch ( e ) {
		return document.createElement( 'p' );// eslint-disable-line
	}
}
