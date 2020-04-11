export function toBoolean( val ) {
	const stringToBoolean = new Map( [ [ 'true', true ], [ 'false', false ], [ '0', false ], [ '', false ], [ ' ', false ], [ 0, false ] ] );// eslint-disable-line
	if ( stringToBoolean.has( val ) ) return stringToBoolean.get( val );// eslint-disable-line
	return true;
}
