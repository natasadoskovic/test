gcs.registerNS('gcs.Request');

/**
 * Wert der angibt das der Request ok ist
 * @const string
 */
gcs.Request.STATUS_OKAY = 'OKAY';


;;
window.addEvent('domready', function () {
    gcs.Form.createAll();
});

gcs.registerNS('gcs.Form');
/**
 * Klasse für die Frontend-Formular Logik
 * @type Class
 */
gcs.Form = new Class({
    /**
     * Formular Element
     *
     * @var Element
     */
    _element: null,
    /**
     * Request zum Absenden
     *
     * @var Request.JSON
     */
    _request: null,
    /**
     * Request zum Validieren
     *
     * @var Request.JSON
     */
    _validateRequest: null,
    /**
     * Interner Speicher für den Delay der einzelne Feld Validierungen
     *
     * @var Object
     */
    _delay: {},

    /**
     * Konstruktor
     *
     * @param Element element
     */
    initialize: function (element) {
        this._element = element;

        this._validateFormRequest = new Request.JSON({
            url: '/' + gcs.Base.getLanguage() + '/api/form/validate/form/' + this._element.get('data-name'),
            onSuccess: this._validateCompleteForm.bind(this)
        });
        this._validateFieldRequest = new Request.JSON({
            url: '/' + gcs.Base.getLanguage() + '/api/form/validate/field/' + this._element.get('data-name') + '/',
            onSuccess: this._validateCompleteField.bind(this)
        });

        this._request = new Request.JSON({
            url: '/' + gcs.Base.getLanguage() + '/api/form/' + this._element.get('data-name'),
            onSuccess: this._submitComplete.bind(this)
        });

        element.addEvent('submit', function (e) {
            e.stop();
            this._validateForm();
        }.bind(this));

        element.getElements('select').addEvent('change', this._validateForm.bind(this));
        element.getElements('input,checkbox,textarea').addEvent('keyup', this._validateField.bind(this));
    },

    /**
     * Formular-Validierung
     *
     * @private
     * @return gcs.Form
     */
    _validateForm: function () {
        this._validateFormRequest.send({
            data: this._element.toQueryString()
        });
        return this;
    },

    /**
     * Feld-Validierung
     *
     * @param Object e
     * @private
     * @return gcs.Form
     */
    _validateField: function (e) {
        var timer = this._delay[ e.target.get('name') ];
        if (timer) {
            clearTimeout(timer);
        }

        this._delay[ e.target.get('name') ] = ( function () {
            this._validateFieldRequest.send({
                data: this._element.toQueryString(),
                url: this._validateFieldRequest.options.url + e.target.get('name')
            });
        } ).delay(gcs.Form.VALDATION_DELAY, this);
        return this;
    },

    /**
     * Aufruf nach der Formular-Validierung
     *
     * @param Object data
     * @private
     * @return gcs.Form
     */
    _validateCompleteForm: function (data) {
        this._element.getElements('.errorMessage').destroy();
        if (data.status === gcs.Request.STATUS_OKAY) {
            // Gesamtes Formular wurde ohne Fehler validiert -> absenden
            this._request.send(this._element.toQueryString());
        } else {
            // Alle Fehler anzeigen
            this._showErrors(data.data);
        }
        return this;
    },

    /**
     * Aufruf nach der Feld-Validierung
     *
     * @param Object data
     * @private
     * @return gcs.Form
     */
    _validateCompleteField: function (data) {
        return this._showErrors(data.data);
    },

    /**
     * Zeigt Fehler bei den entsprechenden Inputs an
     *
     * @param Object fields
     * @private
     * @return gcs.Form
     */
    _showErrors: function (fields) {
        Object.each(fields, function (messages, name) {
            var inputElement = this._element.getElement('[name=' + name + ']');

            // Alte Fehlermeldung(en) löschen
            var errorElement = inputElement.getParent('fieldset').getElement('.errorMessage');
            if (errorElement) {
                errorElement.destroy();
            }

            this._messageElement = new Element('div');
            this._messageElement.addClass('errorMessage');

            Object.each(messages, function (message) {
                var messageElement = new Element('p');
                messageElement.set('html', message).inject(this._messageElement);

            }.bind(this));
            this._messageElement.inject(inputElement, 'after');
        }.bind(this));
        return this;
    },

    /**
     * Funktion wird nach dem submitten des Formulars aufgerufen
     *
     * @param Object data
     * @private
     *
     * @return gcs.Form
     */
    _submitComplete: function (data) {
        if (data.status === gcs.Request.STATUS_OKAY) {
            // Submit war erfolgreich, hier weitere Aktionen machen
            // @TODO: Hier den Code schreiben
        } else {
            if (data.data.validate) {
                this._showErrors(data.data.validate);
            } else {
                // Andere Fehler sind aufgetreten
            }
        }
        return this;
    }
});

/**
 * Validierungs delay nach einem Tastendruck in einem Input Feld in ms
 * @const int
 */
gcs.Form.VALDATION_DELAY = 500;

/**
 * Erstellt für jedes Formular eine JS-Form Instanz
 * @return void
 */
gcs.Form.createAll = function () {
    document.getElements('form').each(function (form) {
        form.store('form', new gcs.Form(form));
    });
};;;
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
};;;
window.addEvent('domready', function () {
    if (document.getElement('.cookie-holder')) {
        new gcs.CookieManager(document.getElement('.cookie-holder'));
    }
});

gcs.registerNS('gcs.CookieManager');
/**
 * Klasse für den Cookie Manager
 * @type Class
 */
gcs.CookieManager = new Class({
    /**
     * Request zum Absenden
     *
     * @var Request.JSON
     */
    _request: null,
    /**
     * Inputfeld des Values
     *
     * @var element
     */
    _input: null,

    /**
     * Konstruktor
     *
     * @param Element element
     */
    initialize: function (element) {

        this._request = new Request.JSON({
            url: '/' + gcs.Base.getLanguage() + '/api/cookie/level/',
            method: 'get',
            onSuccess: this._requestComplete.bind(this)
        });

        this._input = element.getElement('input.rb-slider-value');

        var barSaveCloseButton = document.getElement('.cookie-bar .icon-link');
        if (barSaveCloseButton) {
            barSaveCloseButton.addEvent('click', function (e) {
                e.stop();
                this._sendRequest();
            }.bind(this));
        }

        var managerSaveButton = element.getElement('.cookie-slider-save');
        if (managerSaveButton) {
            managerSaveButton.addEvent('click', function (e) {
                e.stop();
                this._sendRequest();
            }.bind(this));
        }
    },

    /**
     * Gibt den aktuellen Value des Sliders zurück
     *
     * @private
     * @return string
     */
    _getValue: function () {
        var value = null;
        if (this._input) {
            value = this._input.get('value').substring(4);
        }
        return value;
    },

    /**
     * Sendet den Request
     *
     * @private
     * @return gcs.CookieManager
     */
    _sendRequest: function () {
        // @TODO: Lade-Overlay einblenden
        this._request.send({
            data: {
                level: this._getValue()
            }
        });
        return this;
    },

    /**
     * Aufruf nach der Feld-Validierung
     *
     * @param Object data
     * @private
     * @return gcs.CookieManager
     */
    _requestComplete: function (data) {
        // @TODO: Lade-Overlay ausblenden
        if (data.status === gcs.Request.STATUS_OKAY) {
            if (data.data.reload === true) {
                window.location.reload();
            }
        } else {
            // @TODO: Fehler Overlay anzeigen
        }
        return this;
    }
});;;
window.addEvent('domready', function () {
    if (gcs.Base.getVar('cookies').contains(gcs.PortalSwitch.COOKIE_NAME)
        && document.getElement('.portal-item-holder')) {
        new gcs.PortalSwitch();
    }
});

gcs.registerNS('gcs.PortalSwitch');
/**
 * Klasse für den Portal Switch
 * @type Class
 */
gcs.PortalSwitch = new Class({
    /**
     * Request zum Absenden
     *
     * @var Request.JSON
     */
    _request: null,
    /**
     * Url des Links
     *
     * @var string
     */
    _url: null,
    /**
     * Portal Id
     *
     * @var string
     */
    _id: null,

    /**
     * Konstruktor
     */
    initialize: function () {
        this._request = new Request.JSON({
            url: '/' + gcs.Base.getLanguage() + '/api/cookie/',
            onSuccess: this._requestComplete.bind(this)
        });

        if (Cookie.read(gcs.PortalSwitch.COOKIE_NAME) === null && gcs.Base.getVar('portal')) {
            $(window).on('closed.rb-slide-out', function (e, trigger, name) {
                if (name === 'portal-switch') {
                    this._id = gcs.Base.getVar('portal');
                    this._sendRequest();
                }
            }.bind(this))
        }

        document.getElement('.portal-item-holder').addEvent('click:relay(a)', function (e, target) {
            e.stop();
            this._url = target.get('href');
            this._id = target.get('data-portal-id');
            if (Cookie.read(gcs.PortalSwitch.COOKIE_NAME) != (this._id === '' ? null : this._id)) {
                this._sendRequest();
            } else {
                this._redirect();
            }
        }.bind(this));
    },

    /**
     * Sendet den Request
     *
     * @private
     * @return gcs.PortalSwitch
     */
    _sendRequest: function () {
        var data = {};
        data[gcs.PortalSwitch.COOKIE_NAME] = this._id;
        this._request.send({
            data: data
        });
        return this;
    },

    /**
     * Aufruf nach dem Request
     *
     * @param Object data
     * @private
     * @return gcs.PortalSwitch
     */
    _requestComplete: function (data) {
        this._redirect();
        return this;
    },

    /**
     * Leitet weiter falls Link gesetzt
     *
     * @private
     * @return gcs.PortalSwitch
     */
    _redirect: function () {
        if (this._url !== null) {
            new URI(this._url).go();
        }
        return this;
    }
});

/**
 * Name des Cookies
 * @const string
 */
gcs.PortalSwitch.COOKIE_NAME = 'portalSwitch';