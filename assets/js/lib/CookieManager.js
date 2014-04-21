;
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
});