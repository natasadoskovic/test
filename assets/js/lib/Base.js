gcs.registerNS('gcs.Base');

/**
 * Gibt die aktuelle Sprache zurück
 *
 * @type Class
 */
gcs.Base.getLanguage = function () {
    if (!gcs.Base.language) {
        gcs.Base.language = gcs.Base.getVar('language');
        if (gcs.Base.language === undefined) {
            var url = new URI();
            url.get('directory').split('/').each(function (part) {
                if (part !== '') {
                    gcs.Base.language = part;
                }
            });
        }
    }
    return gcs.Base.language;
};

/**
 * Aktulle Sprache, wird beim ersten Aufruf von gcs.Base.getLanguage() gesetzt
 *
 * @type string
 */
gcs.Base.language = '';

/**
 * Basis Variable-Pool
 *
 * @type Object
 */
gcs.Base.vars = {};

/**
 * Fügt mehrere Variablen dem Variablen-Pool hinzu
 *
 * @param Object vars
 * @return void
 */
gcs.Base.addVars = function (vars) {
    Object.each(vars, function (value, key) {
        gcs.Base.vars[ key ] = value;
    });
};

/**
 * Gibt eine Variable aus dem Variablen-Pool zurück
 *
 * @param string key
 * @returns mixed
 */
gcs.Base.getVar = function (key) {
    return gcs.Base.vars[ key ];
};