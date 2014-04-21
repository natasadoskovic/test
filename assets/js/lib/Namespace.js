if (!gcs) {
	var gcs = {};
}


gcs.registerNS = function (namespace) {
	var spaces = namespace.split(".");
	// Erstelle den Haupt-Namespace
	if (typeof window[spaces[0]] != "object") {
		window[spaces[0]] = {};
	}
	var currentLevel = window[spaces[0]];

	// Alle Sub-Namespaces erstellen
	for (var i = 1; i <= (spaces.length - 1); i++) {
		if (typeof currentLevel[spaces[i]] != "object") {
			currentLevel[spaces[i]] = {};
		}
		currentLevel = currentLevel[spaces[i]];
	}
	return currentLevel;
};