/**
 * @module media-embed/ui/mediaformview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';
import '@ckeditor/ckeditor5-media-embed/theme/mediaform.css';
import TextareaView from './textarea.view';

/**
 * The Tex (especially LaTex) input form view controller class.
 *
 * See {@link module:media-embed/ui/mediaformview~MediaFormView}.
 *
 * @extends module:ui/view~View
 */
export default class TexInputFormView extends View {
	/**
	 */
	constructor( validators, locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * Tracks information about DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The Save button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.saveButtonView = this._createButton( t( 'Add' ), '', 'tex-button--save', 'add', true );

		/**
		 * The Cancel button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.cancelButtonView = this._createButton( t( 'Cancel' ), cancelIcon, 'tex-button--close', 'cancel' );

		this.previewButtonView = this._createButton( t( 'Preview' ), '', 'tex-button--preview', 'preview', true );

		/**
		 * The Tex input view.
		 *
		 * @member {module:ui/labeledinput/labeledinputview~LabeledTextareaView}
		 */
		this.texInputView = this._createTexInput();

		/**
		 * The form valid property.
		 *
		 * @member {}
		 */
		this.set( 'valid', false );

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		/**
		 * An array of form validators used by {@link #isValid}.
		 *
		 * @readonly
		 * @protected
		 * @member {Array.<Function>}
		 */
		this._validators = validators;

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-media-form'
				],

				tabindex: '-1'
			},

			children: [
				this.texInputView,
				this.cancelButtonView
			]
		} );

		/**
		 * The default info text for the {@link #texInputView}.
		 *
		 * @private
		 * @member {String} #_embedInputViewInfoDefault
		 */

		/**
		 * The info text with an additional tip for the {@link #texInputView},
		 * displayed when the input has some value.
		 *
		 * @private
		 * @member {String} #_embedInputViewInfoTip
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			this.texInputView,
			this.cancelButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		const stopPropagation = data => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the EMBED input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the "selectstart" event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		// TODO: blocking "selectstart" in the #panelView should be configurable per–drop–down instance.
		this.listenTo( this.texInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * The native DOM `value` of the {@link #texInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 *
	 * @type {Number}
	 */
	get texInput() {
		return this.texInputView.template.children[ 1 ].element.value.trim();
	}

	/**
	 * Sets the native DOM `value` of the {@link #texInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 *
	 * @param {String} tex input
	 */
	set texInput( texInput ) {
		this.texInputView.template.children[ 1 ].element.value = texInput && texInput.trim();
	}

	/**
	 * Validates the form and returns `false` when some fields are invalid.
	 *
	 * @returns {Boolean}
	 */
	isValid() {
		this.resetFormStatus();

		for ( const validator of this._validators ) {
			const errorText = validator( this );

			// One error per field is enough.
			if ( errorText ) {
				// Apply updated error.
				this.texInputView.errorText = errorText;
				this.valid = false;
				return this.valid;
			}
		}
		this.valid = true;
		return this.valid;
	}

	/**
	 * Cleans up the supplementary error and information text of the {@link #texInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	resetFormStatus() {
		this.texInputView.template.children[ 4 ].element.textContent = '';
		this.valid = false;
	}

	/**
	 * Creates preview and textarea view.
	 *
	 * @private
	 * @returns {}  preview and textarea view instance.
	 */
	_createTexInput() {
		const textareaView = new TextareaView( this.locale );
		textareaView.placeholder = 'Paste a Tex code to compile into formulas, e.g. \\f{x} compiled into ƒ(x)';

		textareaView.on( 'input', () => {
			this.valid = false;
		} );

		const inputCaptionView = new View( this.locale );
		inputCaptionView.setTemplate( {
			tag: 'h3',

			attributes: {
				class: [ 'tex-label' ],
			},
			children: [ 'Formula pad' ]
		} );

		const outputCaptionView = new View( this.locale );
		outputCaptionView.setTemplate( {
			tag: 'h3',

			attributes: {
				class: [ 'tex-label' ]
			},
			children: [ 'LaTex Formula Preview' ]
		} );

		const previewDivView = new View( this.locale );
		previewDivView.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'tex-output'
				],
			},
		} );

		const previewAndInputView = new View( this.locale );
		previewAndInputView.setTemplate(
			{
				tag: 'div',

				attributes: {
					class: [ 'ck' ],
					tabindex: '-1'
				},

				children: [
					inputCaptionView,
					textareaView,
					this.previewButtonView,
					outputCaptionView,
					previewDivView,
					this.saveButtonView
				]
			} );

		return previewAndInputView;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
	 * @param {String} className The additional button CSS class name.
	 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
	 * @returns {} The button view instance.
	 */
	_createButton( label, icon, className, eventName, withText = false ) {
		const button = new ButtonView( this.locale );
		const buttonOptions = {
			label,
			tooltip: true,
			withText
		};
		button.set( icon ? {
			label,
			icon,
			tooltip: true
		} : buttonOptions );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		if ( eventName ) {
			button.delegate( 'execute' ).to( this, eventName );
		}

		return button;
	}
}

/**
 * Fired when the form view is submitted (when one of the children triggered the submit event),
 * e.g. click on {@link #saveButtonView}.
 *
 * @event submit
 */

/**
 * Fired when the form view is canceled, e.g. click on {@link #cancelButtonView}.
 *
 * @event cancel
 */
