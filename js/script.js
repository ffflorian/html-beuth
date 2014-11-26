//============== Eventhandler ==================//

window.addEventListener('load', function() {					// warte darauf, dass der Inhalt geladen wurde
	document.addEventListener('keydown', function(event) {
		if (event.keyCode === 27) {								// Escape wurde gedrueckt
			hideZoom();											// verstecke das Bildfenster
		}
	}, false);

	document.getElementById('newcityform').addEventListener('submit', function(event) {
		var formemail  = document.getElementById('formemail');
		var emailerror = document.getElementById('emailerror');
		emailerror.style.visibility = 'hidden';
		if (formemail.value.substring(formemail.value.length-20,
									  formemail.value.length) != "@beuth-hochschule.de") {		// wenn die letzten 20 Zeichen nicht dem String entsprechen
			emailerror.style.visibility = 'visible';
			event.preventDefault();																// Abbruch
		}
	}, false);

	/*var trs = document.getElementsByTagName('tr');
	for (var x=0; x<trs.length; x++) {
		trs[x].addEventListener('mouseover', function() {
			var tds = this.getElementsByTagName('td');
			tds[10].style.visibility = 'visible';
		}, false);
		trs[x].addEventListener('mouseout', function() {
			var tds = this.getElementsByTagName('td');
			tds[10].style.visibility = 'hidden';
		}, false);
	}*/

	var trs = document.getElementsByTagName('tr');
	for (var x=1; x<trs.length; x++) {
		var entry = document.getElementById('entry'+x+'list');
		var link = document.getElementById('entry'+x+'link');
		entry.addEventListener('change', function() {
			checkSelect('entry'+x);
		}, false);
		link.addEventListener('click', function() {
			var image = this.getElementsByTagName('img')[0].src;
			showZoom(image);
		}, false);
	}

	document.getElementById('newcityformlist').addEventListener('change', function(event) {
		checkSelect('newcityform');
	}, false);

	initialize();
}, false);


//============== Hauptfunktionen ===============//

function initialize() {
	window.setTimeout(slideshow, 1000);						// Slideshow mit einer Verzoegerung von 1000ms starten.
	var today = new Date();									// neues Datum erzeugen
	var dd = today.getDate();								// hole den Tag
	var mm = today.getMonth()+1;							// hole den Monat; +1 weil hier Januar mit 0 gezaehlt wird
	var yyyy = today.getFullYear();							// hole das Jahr
	var formdate = document.getElementById('formdate');		// formdate-input ansprechen
	    formdate.value = yyyy + "-" + mm + "-" + dd;		// formdate auf das heutige Datum setzen
	fillLists();											// alle Staedte-Listen auffuellen
}

function fillLists() {
	var trs = document.getElementById('table').getElementsByTagName('tr');
	for (var i=1; i<trs.length-1; i++) {
		addCities(document.getElementById('entry'+i+'list'));
	}
	addCities(document.getElementById('newcityformlist'));
}

function makeEditable(entry) {
	var tr = document.getElementById(entry);				// DIV mit angegebenem Namen ansprechen
	var td = tr.getElementsByTagName('td');					// dessen td-Elemente ansprechen
	for (var i = 0; i < td.length; i++) {					// fuer alle td-Elemente
		if (td[i].className === 'edit') {					// wenn die jeweilige Klasse bearbeitbar ist
			td[i].style.display = 'table-cell';				// dann zeige sie an
		} else if (td[i].className === 'editable') {		// wenn die jeweilige Klasse nicht bearbeitbar ist
			td[i].style.display = 'none';					// dann verstecke sie
		}
	}
}

function save(entry) {
	var tr = document.getElementById(entry);											// DIV mit angegebenem Namen ansprechen
	var td = tr.getElementsByTagName('td');												// dessen td-Elemente ansprechen
	    td[0].innerHTML = formatDate(td[1].getElementsByTagName('input')[0].value);		// td mit Index 0 auf bearbeitetes Feld setzen
	    td[2].innerHTML = td[3].getElementsByTagName('input')[0].value + " &deg;C";		// usw...
	var td5 = td[5].getElementsByTagName('select')[0];									// td mit Index 5 abkuerzen
	    td[4].innerHTML = td5.options[td5.selectedIndex].innerHTML;
	    td[8].innerHTML = td[9].getElementsByTagName('input')[0].value;
	for (var i = 0; i < td.length; i++) {												// fuer alle td-Elemente
		if (td[i].className === 'edit') {												// wenn die jeweilige Klasse bearbeitbar ist
			td[i].style.display = 'none';												// dann verstecke sie
		} else if (td[i].className === 'editable') {									// wenn die jeweilige Klasse nicht bearbeitbar ist
			td[i].style.display = 'table-cell';											// dann zeige sie an
		}
	}
}

function deleteEntry(entry) {
	if (confirm("Eintrag wirklich löschen?")) {				// Wenn Ja/Nein-Dialog bestaetigt wurde
		var tr = document.getElementById(entry);			// DIV mit angegebenem Namen ansprechen
		var td = tr.getElementsByTagName('td');				// dessen td-Elemente ansprechen
		for (var i = 0; i < td.length; i++) {				// fuer alle td-Elemente
			td[i].style.display = 'none';					// verstecke alle Elemente (temporaer -
		}													//  spaeter werden sie in der DB geloescht)
	}
}

function slideshow() {
	var images = document.getElementById('slideshow').getElementsByTagName('img');		// spreche alle Bilder im DIV 'slideshow' an
	if (typeof(counter) != "number") {													// wenn Counter noch nicht gesetzt
		counter = 0;
	}
	counter++;																			// Index auf naechstes Bild setzen
	if (counter < images.length) {														// wenn noch nicht alle Bilder angezeigt werden
		fadeIn(0, images);																// starte das einblenden des Bildes
	} else {
		for (var x = 1; x<images.length; x++) {
			images[x].style.opacity = 0;
			images[x].style.filter = 'alpha(opacity=0)';
		}
		counter = 0;
		fadeIn(0, images);
	}
}

function fadeIn(step, obj) {
	obj[counter].style.opacity = step/100;												// setze die Transparenz des Objekts auf 1/100 von Step
	obj[counter].style.filter = 'alpha(opacity=' + step + ')';							// setze die Transparenz des Objekts auf 1/100 von Step

	step += 2;

	if (step <= 100) {
		window.setTimeout(function () { fadeIn(step, obj); }, 1);						// Objekt noch nicht ganz sichtbar, ruft sich selbst auf
	} else {
		window.setTimeout(slideshow, 8000);												// Objekt jetzt sichtbar, starte naechstes Objekt nach 8000ms
	}
}

function checkSelect(id) {
	var element = document.getElementById(id+"list");									// select mit angegebenem Namen ansprechen
	var i = element.selectedIndex;														// hole den Index des aktuell ausgewaehlten Eintrags
	var selValue = element.options[i].value;											// hole den Text des aktuell ausgewaehlten Eintrags
	if (selValue === "neuestadt") {														// wenn eine neue Stadt eingetragen werden soll
		var userInput = prompt("Geben Sie den Namen der neuen Stadt ein:");
		if (userInput != "" && userInput != null) {
			var opt = createOption(formatValue(userInput), userInput);					// erstelle neue Option mit der Benutzereingabe
			element.add(opt, element[i]);												// fuege neue Option hinzu
			element.options[i].selected = 'selected';									// selektiere den neuen Eintrag
		}
	}
}

function addCities(select) {															// damit man nicht alle Staedte mehrfach eintragen muss
	select.add(createOption('', 'Stadt', true));
	select.add(createOption('berlin', 'Berlin'));
	select.add(createOption('koeln', 'Köln'));
	select.add(createOption('frankfurt', 'Frankfurt'));
	select.add(createOption('hamburg', 'Hamburg'));
	select.add(createOption('muenchen', 'München'));
	select.add(createOption('neuestadt', 'Neue Stadt...'));
}

function showZoom(img) {
	var y = document.getElementById('zoomImage').src = img;
	document.getElementById('zoomwrap').style.visibility = 'visible';
}

function hideZoom() {
	var z = document.getElementById('zoomwrap').style.visibility = 'hidden';
}


//============== Helferfunktionen ==============//

function formatValue(str) {									// ersetze alle dt. Umlaute und gib das Wort in Kleinbuchstaben zurueck
	return str.toLowerCase().replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00fc/g, "ue").replace(/\u00df/g, "ss").replace(/ /g, "_");
}

function formatDate(date) {									// uebersetze ein Datum vom ISO 8601-Format in die dt. Schreibweise und gib es zurueck
	return date.replace(/(\d\d\d\d)-(\d\d)-(\d\d)/i, "$3.$2.$1");
}

function createOption(value, text, disabled) {				// neue Option erstellen
	var option = document.createElement("option");
	    option.value = value;
	    option.text = text;
	    option.disabled = disabled ? true : false;			// kurzform fuer if() {..} else {...}
	return option;
}