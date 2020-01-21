import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class InsertImage extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert image',
				// eslint-disable-next-line max-len
				icon: `<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						 <g id="Justify-Center" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<rect id="Rectangle" x="0" y="0" width="24" height="24"></rect>
							<path d="M15.8571429,17.25 C16.2713564,17.25 16.6071429,17.5857864 16.6071429,18 C16.6071429,18.3796958
							16.324989,18.693491 15.9589134,18.7431534
							 // eslint-disable-next-line max-len
							 L15.8571429,18.75 L8.14285714,18.75 C7.72864358,18.75 7.39285714,18.4142136 7.39285714,18 C7.39285714,
							 17.6203042 7.67501102,17.306509 8.04108659,
							 17.2568466 L8.14285714,17.25 L15.8571429,17.25 Z M21,13.25 C21.4142136,13.25 21.75,13.5857864 21.75,14
							 C21.75,14.3796958 21.4678461,14.693491 21.1017706,
							 14.7431534 L21,14.75 L3,14.75 C2.58578644,14.75 2.25,14.4142136 2.25,14 C2.25,13.6203042 2.53215388,13.306509
							 2.89822944,13.2568466 L3,13.25 L21,13.25
							 Z M18.4285714,9.25 C18.842785,9.25 19.1785714,9.58578644 19.1785714,10 C19.1785714,10.3796958 18.8964175,
							 10.693491 18.530342,10.7431534 L18.4285714,10.75
							  L5.57142857,10.75 C5.15721501,10.75 4.82142857,10.4142136 4.82142857,10 C4.82142857,9.62030423 5.10358245
							  ,9.30650904 5.46965801,9.25684662 L5.57142857,9.25
							  L18.4285714,9.25 Z M21,5.25 C21.4142136,5.25 21.75,5.58578644 21.75,6 C21.75,6.37969577 21.4678461,
							  6.69349096 21.1017706,6.74315338 L21,6.75 L3,6.75
							  C2.58578644,6.75 2.25,6.41421356 2.25,6 C2.25,5.62030423 2.53215388,5.30650904 2.89822944
							  ,5.25684662 L3,5.25 L21,5.25 Z"
							   id="Combined-Shape" fill="#3366FF"></path> </g></svg>`,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				// eslint-disable-next-line no-undef,no-alert
				const imageUrl = prompt( 'Image URL' );

				editor.model.change( writer => {
					const imageElement = writer.createElement( 'image', {
						src: imageUrl
					} );

					// Insert the image in the current selection location.
					editor.model.insertContent( imageElement, editor.model.document.selection );
				} );
			} );
			view.render();
			return view;
		} );
	}
}
