;
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
};