/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembedui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import embedIcon from '../assets/icons/Embed.svg';
import SocialMediaEmbedFormView from '../views/social-embed-form.view';
import SocialMediaEmbedEditing from './social-embed-editing.plugin';

/**
 * The media embed UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SocialEmbedPlugin extends Plugin {
	static get requires() {
		return [ SocialMediaEmbedEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SocialEmbedPlugin';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'socialMediaEmbed' );
		const registry = editor.plugins.get( SocialMediaEmbedEditing ).registry;
		this.registry = registry;

		/**
		 * The form view displayed inside the drop-down.
		 *
		 * @member {module:media-embed/ui/mediaformview~MediaFormView}
		 */
		this.form = new SocialMediaEmbedFormView( getFormValidators( editor.t, registry ), editor.locale );

		// Setup `imageUpload` button.
		editor.ui.componentFactory.add( 'socialMediaEmbed', locale => {
			const dropdown = createDropdown( locale );

			this._setUpDropdown( dropdown, this.form, command, editor );
			this._setUpForm( this.form, dropdown, command );

			return dropdown;
		} );
	}

	_setUpDropdown( dropdown, form, command ) {
		const editor = this.editor;
		const t = editor.t;
		const button = dropdown.buttonView;

		dropdown.bind( 'isEnabled' ).to( command );
		dropdown.panelView.children.add( form );

		button.set( {
			label: t( 'Insert social media embed code' ),
			icon: embedIcon,
			tooltip: true
		} );

		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		button.on( 'open', () => {
			// Make sure that each time the panel shows up, the URL field remains in sync with the value of
			// the command. If the user typed in the input, then canceled (`urlInputView#value` stays
			// unaltered) and re-opened it without changing the value of the media command (e.g. because they
			// didn't change the selection), they would see the old value instead of the actual value of the
			// command.
			form.embed = command.value || '';
			form.embedInputView.select();
			form.focus();
		}, { priority: 'low' } );

		dropdown.on( 'submit', () => {
			if ( form.isValid() ) {
				editor.execute( 'socialMediaEmbed', { embed: form.embed, registry: this.registry } );
				closeUI();
			}
		} );

		dropdown.on( 'change:isOpen', () => form.resetFormStatus() );
		dropdown.on( 'cancel', () => closeUI() );

		function closeUI() {
			editor.editing.view.focus();
			dropdown.isOpen = false;
		}
	}

	_setUpForm( form, dropdown, command ) {
		form.delegate( 'submit', 'cancel' ).to( dropdown );
		form.embedInputView.bind( 'value' ).to( command, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		form.embedInputView.bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		form.saveButtonView.bind( 'isEnabled' ).to( command );
	}
}

function getFormValidators( t, registry ) {
	return [
		form => {
			if ( !form.embed.length ) {
				return t( 'The EMBED must not be empty.' );
			}
		},
		form => {
			if ( !registry.hasMedia( form.embed ) ) {
				return t( 'This media EMBED is not supported.' );
			}
		}
	];
}

