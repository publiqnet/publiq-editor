/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tabletoolbar
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';
import { getSelectedTexWidget } from '../../utils/utils';

/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for a table cell content).
 *
 * Table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/table~TableConfig#tableToolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/table~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TexToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TexToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		// const texContentToolbarItems = editor.config.get( 'tex.contentToolbar' );

		const texToolbarItems = editor.config.get( 'tex.texToolbar' );

		// if ( texContentToolbarItems ) {
		// 	widgetToolbarRepository.register( 'texContent', {
		// 		ariaLabel: t( 'Tex toolbar' ),
		// 		items: texContentToolbarItems,
		// 		getRelatedElement: getTexWidgetAncestor
		// 	} );
		// }

		if ( texToolbarItems ) {
			widgetToolbarRepository.register( 'tex', {
				ariaLabel: t( 'Tex toolbar' ),
				items: texToolbarItems,
				getRelatedElement: getSelectedTexWidget
			} );
		}

		editor.editing.view.document.on( 'click', ( evInfo, data ) => {
			const target = data.domTarget;
			const domTexDiv = target.closest( 'div' );
			const converter = data.view.domConverter;
			const viewTexDiv = converter.domToView( domTexDiv );

			if ( viewTexDiv && viewTexDiv.getAttribute( 'data-type' ) === 'tex-input' ) {
				const modelTexDiv = editor.editing.mapper.toModelElement( viewTexDiv );
				editor.model.change( writer => {
					writer.setSelection( modelTexDiv, 'on' );
				} );
			}
		}, { priority: 'highest' } );
	}
}
