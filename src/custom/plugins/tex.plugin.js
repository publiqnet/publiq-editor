import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import formulaIcon from '../assets/icons/formula (1).svg';
import TexInputFormView from '../views/tex-input-form.view';
import TexEditing from './tex-editing.plugin';
import { createModal } from '../customizations';
import katex from 'katex/dist/katex.mjs';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * The Tex editing UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TexPlugin extends Plugin {
	constructor( editor ) {
		super( editor );
		this._texViewElement = null;
		this.modal = null;
	}

	static get requires() {
		return [ TexEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TexPlugin';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'renderTex' );

		/**
		 * The form view displayed inside the modal.
		 *
		 * @member {}
		 */
		this.form = new TexInputFormView( getFormValidators( editor.t ), editor.locale );

		editor.ui.componentFactory.add( 'texEditing', locale => {
			const modal = createModal( locale );
			this.modal = modal;
			this.buttonView = new ButtonView( editor.locale ); // modal.buttonView;
			this.buttonView.set( {
				label: editor.t( 'Tex editing' ),
				icon: formulaIcon,
				tooltip: true
			} );
			this.buttonView.delegate( 'execute' ).to( this.buttonView, 'open' );
			this._setUpModal( modal, this.form, command, editor );
			this._setUpForm( this.form, modal );

			return this.buttonView;
		} );
	}

	_setUpModal( modal, form, command ) {
		const button = this.buttonView;
		const editor = this.editor;
		let html;

		// append model element to '.ck-balloon-panel's parent node
		modal.render();
		setTimeout( () => {//eslint-disable-line
			document.querySelector( '.ck-balloon-panel' ).parentNode.appendChild( modal.element );//eslint-disable-line
		}, 0 );

		// Toggle the modal when its button has been clicked.
		modal.listenTo( this.buttonView, 'open', () => {
			modal.isOpen = !modal.isOpen;
		} );

		modal.bind( 'isEnabled' ).to( this.buttonView );
		modal.panelView.children.add( form );
		modal.isOpen = false;

		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the modal is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		button.on( 'open', () => {
			// Make sure that each time the panel shows up, the URL field remains in sync with the value of
			// the command. If the user typed in the input, then canceled (`urlInputView#value` stays
			// unaltered) and re-opened it without changing the value of the media command (e.g. because they
			// didn't change the selection), they would see the old value instead of the actual value of the
			// command.
			form.texInput = command.value || '';
			form.texInputView.template.children[ 1 ].select();
			form.focus();
		}, { priority: 'low' } );

		modal.on( 'preview', () => {
			form.isValid();
			try {
				html = katex.renderToString( form.texInput, { output: 'html', macros: { '\\f': 'f(#1)' } } );
			} catch ( e ) {
				if ( e instanceof katex.ParseError ) {
					// KaTeX can't parse the expression
					html = ( 'Error in LaTeX \'' + form.texInput + '\': ' + e.message )
						.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
					html = `<p style="color:red">${ html }</p>`;
				} else {
					throw e; // other error
				}
			}
			form.texInputView.template.children[ 4 ].element.innerHTML = html;
		} );

		modal.on( 'add', event => {
			if ( form.isValid() ) {
				editor.execute( 'renderTex', { texInput: form.texInput, type: 'tex-input', 'data-curr-rendering': true } );
				const texElement = editor.editing.view.domConverter.viewToDom( this.texViewElement );
				texElement.replaceChild(
					new DOMParser().parseFromString( html, 'text/html' ).getElementsByClassName( 'katex' )[ 0 ],// eslint-disable-line
					texElement.children[ 1 ]
				);
				texElement.setAttribute( 'data-curr-rendering', 'true' );
				event.stop();
				closeUI();
			}
		} );

		modal.on( 'change:isOpen', () => form.resetFormStatus() );
		modal.on( 'cancel', () => closeUI() );

		function closeUI() {
			editor.editing.view.focus();
			modal.isOpen = false;
		}
	}

	_setUpForm( form, modal ) {
		form.delegate( 'add', 'cancel', 'preview' ).to( modal );
		// form.texInputView.bind( 'value' ).to( command, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		// form.texInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		form.saveButtonView.bind( 'isEnabled' ).to( form, 'valid' );
	}

	get texViewElement() {
		return this._texViewElement;
	}

	set texViewElement( value ) {
		this._texViewElement = value;
	}
}

function getFormValidators( t ) {
	return [
		form => {
			if ( !form.texInput.length ) {
				return t( 'The Tex input must not be empty.' );
			}
		},
		form => {
			try {
				katex.renderToString( form.texInput, { throwOnError: true, macros: { '\\f': 'f(#1)' } } );
			} catch ( e ) {
				return t( 'Wrong Tex input.' );
			}
		}
	];
}

