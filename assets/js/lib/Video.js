;
window.addEvent('domready', function () {
    gcs.Video.init();
});

gcs.registerNS('gcs.Video');

gcs.Video = new Class({
    /**
     * GCS-Video-Container-Element
     *
     * @var Element
     */
    _element: null,
    /**
     * Gibt an, ob das Video fixiert ist, dann ist kein Wechsel zu einer anderen Größe mehr möglich
     *
     * @var bool
     */
    _fixed: false,

    /**
     * Konstruktor
     *
     * @param Element element
     */
    initialize: function (element) {
        this._element = element;

        this.initPeriodical = ( function() {
            var currentBreakpoints = RB.Breakpoint.current();
            for( var i = 0; i < currentBreakpoints.length; i++ ) {
                this.update( currentBreakpoints[ i ] );
            }
            if( currentBreakpoints.length > 0 ) {
                clearInterval( this.initPeriodical );
            }

        } ).periodical( 50, this );

        this._element.addEvent( 'click', function ( e ) {
            this.fix();
        }.bind( this ) );

        this._element.getElements( 'video' ).each( function( video ) {
            RB.Breakpoint.enter( 'phone', video.pause.bind( video ) );
            RB.Breakpoint.leave( 'phone', video.pause.bind( video ) );
        }.bind( this ) );
    },

    /**
     * Fixiert das Video, ein Switch zu einer anderen Video-Größe ist nicht mehr möglich
     *
     * @returns {gcs.Video}
     */
    fix: function () {
        if( !this.fixed ) {
           this._fixed = true;
            this._element.getElements( 'video.hidden' ).destroy();
        }
        return this;
    },

    /**
     * Zeigt das richtige Video an
     *
     * @param string switchTo Aktuelle Version
     * @returns {gcs.Video}
     */
    update: function ( switchTo ) {
        if (this._fixed) {
            return this;
        }

        if( switchTo === 'tablet-to-desktop' ) {
            switchTo = 'desktop';
        }

        this._element.getElements( 'video' ).addClass( 'hidden' );
        this._element.getElements( 'video.' + switchTo + 'Video' ).removeClass( 'hidden' );

        return this;
    }

});

/**
 * Erstellt für jedes Video eine JS-GcsVideo Instanz
 * @return void
 */
gcs.Video.init = function () {
    document.getElements( 'div.gcsVideo' ).each( function( video ) {
        video.store( 'video', new gcs.Video( video ) );
    });
};