//============== Eventhandler ==================//

$(window).load(function() {										// warte darauf, dass der Inhalt geladen wurde
	$(document).keydown(function(event) {
		if (event.keyCode === 27) {								// Escape wurde gedrueckt
			$('#zoomWrap').hide();								// verstecke das Bildfenster
		}
	});

	$('#newcityform').submit(function(event) {
		$('button.submitForm').css('position', 'static');
		$('button.submitForm').css('top', '0');
		console.log($('#formemail').val());
		$('#emailerror').hide();
		if ($('#formemail').val().substring($('#formemail').val().length-20, $('#formemail').val().length) !== "@beuth-hochschule.de") {		// wenn die letzten 20 Zeichen nicht dem String entsprechen
			event.preventDefault();																// Abbruch
			$('#emailerror').show();
			$('button.submitForm').css('position', 'relative');
			$('button.submitForm').css('top', '-42px');
		}
	});

	$('#submitForm').click(function() {
		$('cityform').submit();
	});

	$('#zoom a').click(function() {
		$('#zoomWrap').hide();
	});

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

	$('select').change(function() {
		if ($(this).find('option:selected').val() === "neuestadt") {								// wenn eine neue Stadt eingetragen werden soll
			var userInput = prompt("Geben Sie den Namen der neuen Stadt ein:");
			if (userInput !== "" && userInput !== null) {
				$(this).append(new Option(userInput, formatValue(userInput), true, true));						// erstelle neue Option mit der Benutzereingabe
			}
		}
	});

	$('.zoomlink').click(function() {
		var img = $(this).find('img').attr('src');
		$('#zoomImage').attr('src', img);
		$('#zoomWrap').show();
	});

	$('.editlink').click(function() {
		$(this).parent().parent().find('.editable').hide();
		$(this).parent().parent().find('.edit').show();
	});

	$('.savelink').click(function() {
		var $tr = $(this).parent().parent();
		$tr.find('.editable.date').text(formatDate($tr.find('input[type=date]').val()));
		$tr.find('.editable.temp').html($tr.find('input[type=number]').val() + " &deg;C");
		$tr.find('.editable.city').text($tr.find('select option:selected').text());
		$tr.find('.editable.comment').text($tr.find('input[type=text]').val());
		$tr.find('.edit').hide();
		$tr.find('.editable').show();
	});

	$('.deletelink').click(function() {
		if (confirm("Eintrag wirklich löschen?")) {
			$(this).parent().parent().hide();
		}
	});

	initialize();
});


//============== Hauptfunktionen ===============//

function initialize() {
	window.setTimeout(slideshow, 1000);						// Slideshow mit einer Verzoegerung von 1000ms starten.
	var today = new Date();									// neues Datum erzeugen
	var dd = today.getDate();								// hole den Tag
	var mm = today.getMonth()+1;							// hole den Monat; +1 weil hier Januar mit 0 gezaehlt wird
	var yyyy = today.getFullYear();							// hole das Jahr
	$('#formdate').val(yyyy + "-" + mm + "-" + dd);			// formdate auf das heutige Datum setzen
	fillLists();											// alle Staedte-Listen auffuellen
}

function fillLists() {
	$('.cities').each(function() {
		addCities($(this));
	});
}

function slideshow() {
	var images = $('#slideshow').find('img');								// spreche alle Bilder im DIV 'slideshow' an
	if (typeof(counter) !== "number") {										// wenn Counter noch nicht gesetzt
		counter = 0;
	}
	counter++;																// Index auf naechstes Bild setzen
	if (counter < images.length) {											// wenn noch nicht alle Bilder angezeigt werden
		fadeIn(0, images);													// starte das einblenden des Bildes
	} else {
		$('#slideshow').find('img').each(function() {
			$(this).css('opacity', 0);
			$(this).css('filter', 'alpha(opacity=0');
		});
		counter = 0;
		fadeIn(0, images);
	}
}

function fadeIn($step, $obj) {
	$obj[counter].style.opacity = $step/100;									// setze die Transparenz des Objekts auf 1/100 von Step
	$obj[counter].style.filter = 'alpha(opacity=' + $step + ')';				// setze die Transparenz des Objekts auf 1/100 von Step

	$step += 2;

	if ($step <= 100) {
		window.setTimeout(function () {
			fadeIn($step, $obj);
		}, 1);																// Objekt noch nicht ganz sichtbar, ruft sich selbst auf
	} else {
		window.setTimeout(slideshow, 8000);									// Objekt jetzt sichtbar, starte naechstes Objekt nach 8000ms
	}
}

function addCities($select) {
	$select.append(new Option("Stadt", "", true));						// damit man nicht alle Staedte mehrfach eintragen muss
	$('select [value=""]').attr('disabled', true);
	$select.append(new Option("Berlin", "koeln"));
	$select.append(new Option("Köln", "berlin"));
	$select.append(new Option("Frankfurt", "frankfurt"));
	$select.append(new Option("Hamburg", "hamburg"));
	$select.append(new Option("München", "muenchen"));
	$select.append(new Option("Neue Stadt...", "neuestadt"));
}


//============== Helferfunktionen ==============//

function formatValue(str) {									// ersetze alle dt. Umlaute und gib das Wort in Kleinbuchstaben zurueck
	return str.toLowerCase().replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00fc/g, "ue").replace(/\u00df/g, "ss").replace(/ /g, "_");
}

function formatDate(date) {									// uebersetze ein Datum vom ISO 8601-Format in die dt. Schreibweise und gib es zurueck
	return date.replace(/(\d\d\d\d)-(\d\d)-(\d\d)/i, "$3.$2.$1");
}