/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/modal/modalview
 */

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '@ckeditor/ckeditor5-ui/theme/components/dropdown/dropdown.css';
import '../../../../theme/theme.scss';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import View from '@ckeditor/ckeditor5-ui/src/view';

export default class ModalView extends View {
	/**
	 * Creates an instance of the modal.
	 *
	 * Also see {@link #render}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {module:ui/modal/button/modalbutton~DropdownButton} buttonView
	 * @param {} panelView
	 */
	constructor( locale, panelView ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Panel of the modal. It opens when the {@link #buttonView} is
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed} (i.e. clicked).
		 *
		 * Child views can be added to the panel's `children` collection:
		 *
		 *		modal.panelView.children.add( childView );
		 *
		 * See {@link module:ui/modal/modalpanelview~DropdownPanelView#children} and
		 * {@link module:ui/viewcollection~ViewCollection#add}.
		 *
		 * @readonly
		 * @member {module:ui/modal/modalpanelview~DropdownPanelView} #panelView
		 */
		this.panelView = panelView;

		/**
		 * Controls whether the modal view is open, i.e. shows or hides the {@link #panelView panel}.
		 *
		 * @observable
		 * @member {Boolean} #isOpen
		 */
		this.set( 'isOpen', false );

		/**
		 * Controls whether the modal is enabled, i.e. it can be clicked and execute an action.
		 *
		 * See {@link module:ui/button/buttonview~ButtonView#isEnabled}.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * (Optional) The additional CSS class set on the modal {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * The position of the panel, relative to the modal.
		 *
		 * **Note**: When `'auto'`, the panel will use one of the remaining positions to stay
		 * in the viewport, visible to the user. The positions correspond directly to
		 * {@link module:ui/modal/modalview~DropdownView.defaultPanelPositions default panel positions}.
		 *
		 * **Note**: This value has an impact on the
		 * {@link module:ui/modal/modalpanelview~DropdownPanelView#position} property
		 * each time the panel becomes {@link #isOpen open}.
		 *
		 * @observable
		 * @default 'auto'
		 * @member {'auto'|'se'|'sw'|'ne'|'nw'} #panelPosition
		 */
		this.set( 'panelPosition', 'auto' );

		/**
		 * Tracks information about DOM focus in the modal.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
		 * keystrokes of the modal:
		 *
		 * * <kbd>▼</kbd> opens the modal,
		 * * <kbd>◀</kbd> and <kbd>Esc</kbd> closes the modal.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'modal-overlay',
					// other classes
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value ),
					bind.if( 'isOpen', 'modal-overlay--visible' ),
				]
			},

			children: [
				panelView
			]
		} );

		/**
		 * A child {@link module:ui/list/listview~ListView list view} of the modal located
		 * in its {@link module:ui/modal/modalview~DropdownView#panelView panel}.
		 *
		 * **Note**: Only supported when modal has list view added using {@link module:ui/modal/utils~addListToDropdown}.
		 *
		 * @readonly
		 * @member {module:ui/list/listview~ListView} #listView
		 */

		/**
		 * A child toolbar of the modal located in the
		 * {@link module:ui/modal/modalview~DropdownView#panelView panel}.
		 *
		 * **Note**: Only supported when modal has list view added using {@link module:ui/modal/utils~addToolbarToDropdown}.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView} #toolbarView
		 */

		/**
		 * Fired when the toolbar button or list item is executed.
		 *
		 * For {@link #listView} It fires when a child of some {@link module:ui/list/listitemview~ListItemView}
		 * fired `execute`.
		 *
		 * For {@link #toolbarView} It fires when one of the buttons has been
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed}.
		 *
		 * **Note**: Only supported when modal has list view added using {@link module:ui/modal/utils~addListToDropdown}
		 * or {@link module:ui/modal/utils~addToolbarToDropdown}.
		 *
		 * @event execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Toggle the visibility of the panel when the modal becomes open.
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element );

		// Register #element in the focus tracker.
		this.focusTracker.add( this.element );

		const closeModal = ( data, cancel ) => {
			if ( this.isOpen ) {
				// this.buttonView.focus();
				this.isOpen = false;
				cancel();
			}
		};

		// Open the modal panel using the arrow up key, just like with return or space.
		this.keystrokes.set( 'arrowup', ( data, cancel ) => {
			// Don't open if the modal is disabled or already open.
			if ( !this.isOpen ) {
				this.isOpen = true;
				cancel();
			}
		} );

		// Block the right arrow key (until nested modals are implemented).
		this.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( this.isOpen ) {
				cancel();
			}
		} );

		// Close the modal using the arrow left/escape key.
		this.keystrokes.set( 'arrowleft', closeModal );
		this.keystrokes.set( 'esc', closeModal );
	}

	/**
	 * Focuses the {@link #buttonView}.
	 */
	focus() {
		// this.buttonView.focus();
	}

	/**
	 * Returns {@link #panelView panel} positions to be used by the
	 * {@link module:utils/dom/position~getOptimalPosition `getOptimalPosition()`}
	 * utility considering the direction of the language the UI of the editor is displayed in.
	 *
	 * @type {module:utils/dom/position~Options#positions}
	 * @private
	 */
	get _panelPositions() {
		const { southEast, southWest, northEast, northWest } = ModalView.defaultPanelPositions;

		if ( this.locale.uiLanguageDirection === 'ltr' ) {
			return [ southEast, southWest, northEast, northWest ];
		} else {
			return [ southWest, southEast, northWest, northEast ];
		}
	}
}

/**
 * A set of positioning functions used by the modal view to determine
 * the optimal position (i.e. fitting into the browser viewport) of its
 * {@link module:ui/modal/modalview~DropdownView#panelView panel} when
 * {@link module:ui/modal/modalview~DropdownView#panelPosition} is set to 'auto'`.
 *
 * The available positioning functions are as follow:
 *
 * **South**
 *
 * * `southEast`
 *
 *		[ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * * `southWest`
 *
 *		         [ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * **North**
 *
 * * `northEast`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		[ Button ]
 *
 * * `northWest`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		         [ Button ]
 *
 * Positioning functions are compatible with {@link module:utils/dom/position~Position}.
 *
 * The name that position function returns will be reflected in modal panel's class that
 * controls its placement. See {@link module:ui/modal/modalview~DropdownView#panelPosition}
 * to learn more.
 *
 * @member {Object} module:ui/modal/modalview~DropdownView.defaultPanelPositions
 */
ModalView.defaultPanelPositions = {
	southEast: buttonRect => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left,
			name: 'se'
		};
	},
	southWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'sw'
		};
	},
	northEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left,
			name: 'ne'
		};
	},
	northWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom - panelRect.height,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'nw'
		};
	}
};

/**
 * A function used to calculate the optimal position for the modal panel.
 *
 * @protected
 * @member {Function} module:ui/modal/modalview~ModalView._getOptimalPosition
 */
ModalView._getOptimalPosition = getOptimalPosition;
