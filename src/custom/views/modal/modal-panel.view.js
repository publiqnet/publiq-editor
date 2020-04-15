/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/modal/modalpanelview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import '../../../../theme/theme.scss';

/**
 * The modal panel view class.
 *
 * See {@link module:ui/modal/modalview~DropdownView} to learn about the common usage.
 *
 * @extends module:ui/view~View
 */
export default class ModalPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the panel is visible.
		 *
		 * @observable
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', false );

		/**
		 * The position of the panel, relative to the parent.
		 *
		 * This property is reflected in the CSS class set to {@link #element} that controls
		 * the position of the panel.
		 *
		 * @observable
		 * @default 'se'
		 * @member {'se'|'sw'|'ne'|'nw'} #position
		 */
		this.set( 'position', 'se' );

		/**
		 * Collection of the child views in this panel.
		 *
		 * A common child type is the {@link module:ui/list/listview~ListView} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
		 * See {@link module:ui/modal/utils~addListToDropdown} and
		 * {@link module:ui/modal/utils~addToolbarToDropdown} to learn more about child views of modals.
		 *
		 * @readonly
		 */
		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					// other classes
					'katex-popup-form',
					bind.to( 'position', value => `ck-modal__panel_${ value }` ),
				]
			},

			children: this.children,

			on: {
				// Drag and drop in the panel should not break the selection in the editor.
				// https://github.com/ckeditor/ckeditor5-ui/issues/228
				selectstart: bind.to( evt => evt.preventDefault() )
			}
		} );
	}

	/**
	 * Focuses the view element or first item in view collection on opening modal's panel.
	 *
	 * See also {@link module:ui/modal/modalpanelfocusable~DropdownPanelFocusable}.
	 */
	focus() {
		if ( this.children.length ) {
			this.children.first.focus();
		}
	}

	/**
	 * Focuses the view element or last item in view collection on opening modal's panel.
	 *
	 * See also {@link module:ui/modal/modalpanelfocusable~DropdownPanelFocusable}.
	 */
	focusLast() {
		if ( this.children.length ) {
			const lastChild = this.children.last;

			if ( typeof lastChild.focusLast === 'function' ) {
				lastChild.focusLast();
			} else {
				lastChild.focus();
			}
		}
	}
}
