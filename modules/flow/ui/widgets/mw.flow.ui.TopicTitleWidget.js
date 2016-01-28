( function ( $ ) {
	/**
	 * Topic title widget
	 *
	 * @class
	 * @extends OO.ui.Widget
	 *
	 * @constructor
	 * @param {string} topicId
	 * @param {Object} [config]
	 */
	mw.flow.ui.TopicTitleWidget = function mwFlowUiTopicTitleWidget( topicId, config ) {
		var widget = this;
		config = config || {};
		mw.flow.ui.TopicTitleWidget.parent.call( this, config );

		this.topicId = topicId;
		this.api = new mw.flow.dm.APIHandler(
			'Topic:' + topicId
		);

		this.anonWarning = new mw.flow.ui.AnonWarningWidget();
		this.anonWarning.toggle( true );

		this.error = new OO.ui.LabelWidget( {
			classes: [ 'flow-ui-topicTitleWidget-error flow-errors errorbox' ]
		} );
		this.error.toggle( false );

		this.captcha = new mw.flow.dm.Captcha();
		this.captchaWidget = new mw.flow.ui.CaptchaWidget( this.captcha );

		this.input = new OO.ui.TextInputWidget( {
			classes: [ 'flow-ui-topicTitleWidget-titleInput' ],
			autofocus: true
		} );

		this.termsLabel = new OO.ui.LabelWidget( {
			classes: [ 'flow-ui-topicTitleWidget-termsLabel' ],
			label: $( $.parseHTML( mw.message( 'flow-terms-of-use-edit' ).parse() ) )
		} );

		this.$controls = $( '<div>' ).addClass( 'flow-ui-topicTitleWidget-controls' );
		this.$buttons = $( '<div>' ).addClass( 'flow-ui-topicTitleWidget-buttons' );
		this.saveButton = new OO.ui.ButtonWidget( {
			flags: [ 'primary', 'constructive' ],
			label: mw.msg( 'flow-edit-title-submit' ),
			classes: [ 'flow-ui-topicTitleWidget-saveButton' ]
		} );

		this.cancelButton = new OO.ui.ButtonWidget( {
			flags: 'destructive',
			framed: false,
			label: mw.msg( 'flow-cancel' ),
			classes: [ 'flow-ui-topicTitleWidget-cancelButton' ]
		} );
		this.$buttons.append(
			this.cancelButton.$element,
			this.saveButton.$element
		);
		this.$controls.append(
			this.termsLabel.$element,
			this.$buttons,
			$( '<div>' ).css( 'clear', 'both' )
		);

		// Events
		this.saveButton.connect( this, { click: [ 'onSaveButtonClick' ] } );
		this.cancelButton.connect( this, { click: [ 'emit', 'cancel' ] } );

		this.$element
			.addClass( 'flow-ui-topicTitleWidget' )
			.append(
				this.anonWarning.$element,
				this.error.$element,
				this.captchaWidget.$element,
				this.input.$element,
				this.$controls
			);

		this.input.pushPending();
		this.api.getPost( topicId, topicId, 'wikitext' ).then(
			function ( topic ) {
				var content = OO.getProp( topic, 'content', 'content' ),
					currentRevisionId = topic.revisionId;

				widget.api.setCurrentRevision( currentRevisionId );
				widget.input.setValue( content );
			},
			function ( error ) {
				widget.error.setLabel( mw.msg( 'flow-error-external', error ) );
				widget.error.toggle( true );
			}
		).always(
			function () {
				widget.input.popPending();
			}
		);

	};

	/* Initialization */

	OO.inheritClass( mw.flow.ui.TopicTitleWidget, OO.ui.Widget );

	/* Methods */

	mw.flow.ui.TopicTitleWidget.prototype.onSaveButtonClick = function () {
		var content = this.input.getValue(),
			captcha = this.captchaWidget.getResponse(),
			widget = this;
		this.api.saveTopicTitle( this.topicId, content, captcha ).then(
			function ( workflowId ) {
				widget.emit( 'saveContent', workflowId );
			},
			function ( errorCode, errorObj ) {
				widget.captcha.update( errorCode, errorObj );
				if ( !widget.captcha.isRequired() ) {
					widget.error.setLabel( errorObj.error && errorObj.error.info || errorObj.exception );
					widget.error.toggle( true );
				}
			}
		);
	};

}( jQuery ) );