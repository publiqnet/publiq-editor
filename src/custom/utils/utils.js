import { findAncestor } from '@ckeditor/ckeditor5-table/src/commands/utils';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

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
