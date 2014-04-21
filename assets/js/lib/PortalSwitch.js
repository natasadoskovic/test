;
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