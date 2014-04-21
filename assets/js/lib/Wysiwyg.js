/**
 * @see CKEDITOR::editorConfig
 */
CKEDITOR.editorConfig = function( config ) {
    // Nur plain Text erlauben
    config.forcePasteAsPlainText = true;

    // Konfiguration für nur Tabllen
    config.toolbar_table = [
        [
            'Table' // Tabelle
        ]
    ];

    // Konfiguration für den Basiseditor
    config.toolbar_simple = [
        [
            'Cut', //Ausschneiden
            'Copy', // Kopieren
            'PasteText', // Einfügen ohne Formatierung
            '-',
            'Undo', // Rückgängig
            'Redo' // Wiederherstellen
        ],[
            'Find', // Suchen
            'Replace', // Suchen und Ersetzen
            '-',
            'SelectAll' // alles auswählen
        ], [
            'Bold', // Fett
            'Subscript', // tiefgestellt
            'Superscript', // hochgestellt
            '-',
            'RemoveFormat' // Formatierung entfernen
        ], [
            'NumberedList', // Nummerierte Listen
            'BulletedList' // Bullet-Point Listen
        ], [
            'Link', // Link einfügen
            'Unlink', // Link entfernen
            'Anchor' // Anker (Sprungmarke)
        ],[
            'SpecialChar' // Sonderzeichen einfügen
        ], [
            'ShowBlocks' // Blöcke anzeigen
        ]
    ];
};