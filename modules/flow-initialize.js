/*!
 * Runs Flow code, using methods in FlowUI.
 */

( function ( $ ) {
	// Pretend we got some data and run with it
	/*
	 * Now do stuff
	 * @todo not like this
	 */
	$( document ).ready( function () {
		var dataBlob,
			$component = $( '.flow-component' );

		// HACK: If there is no component, we are not on a flow
		// board at all, and there's no need to load anything.
		// This is especially true for tests, though we should
		// fix this by telling ResourceLoader to not load
		// flow-initialize at all on tests.
		if ( $component.length === 0 ) {
			return;
		}

		mw.flow.initComponent( $component );

		// Load data model
		mw.flow.system = new mw.flow.dm.System( {
			pageTitle: mw.Title.newFromText( mw.config.get( 'wgPageName' ) ),
			tocPostsLimit: 50,
			renderedTopics: $( '.flow-topic' ).length,
			boardId: $component.data( 'flow-id' )
		} );

		dataBlob = mw.flow && mw.flow.data;
		if ( dataBlob && dataBlob.blocks && dataBlob.toc ) {
			// Populate the rendered topics
			mw.flow.system.populateBoardTopicsFromJson( dataBlob.blocks.topiclist );
			// Populate header
			mw.flow.system.populateBoardDescriptionFromJson( dataBlob.blocks.header );
			// Populate the ToC topics
			mw.flow.system.populateBoardTopicsFromJson( dataBlob.toc );
		} else {
			mw.flow.system.populateBoardFromApi();
		}

		// HACK: We need to populate the old code when the
		// new is populated
		mw.flow.system.on( 'populate', function ( topicTitlesById ) {
			var flowBoard = mw.flow.getPrototypeMethod( 'component', 'getInstanceByElement' )( $( '.flow-board' ) );
			$.extend( flowBoard.topicTitlesById, topicTitlesById );
		} );
	} );
}( jQuery ) );
