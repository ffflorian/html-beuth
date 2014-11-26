//============== Eventhandler ==================//

$(window).load(function() {										// warte darauf, dass der Inhalt geladen wurde
	$(document).keydown(function(event) {
		if (event.keyCode === 27) {								// Escape wurde gedrueckt
			$('#zoomWrap').hide();								// verstecke das Bildfenster
		}
	});

	$('#cityform .submitForm').click(function() {
		$('#cityform').submit();
	});

	$('#newcityform').submit(function(event) {
		if ($('#formemail').val().substring($('#formemail').val().length-20, $('#formemail').val().length) !== "@beuth-hochschule.de") {		// wenn die letzten 20 Zeichen nicht dem String entsprechen
			event.preventDefault();																// Abbruch
		}
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
	$.backstretch("img/wetter_bg.jpg");

	/*$.backstretch([
		"img/wetter_bg.jpg",
		"img/wetter/wetter1.jpg",
		"img/wetter/wetter2.jpg",
		"img/wetter/wetter3.jpg",
		"img/wetter/wetter4.jpg",
		"img/wetter/wetter5.jpg",
		"img/wetter/wetter6.jpg",
		"img/wetter/wetter7.jpg"
	], {duration: 4000, fade: 750});*/

	var today = new Date();									// neues Datum erzeugen
	var dd = today.getDate();								// hole den Tag
	var mm = today.getMonth()+1;							// hole den Monat; +1 weil hier Januar mit 0 gezaehlt wird
	var yyyy = today.getFullYear();							// hole das Jahr
	$('#formdate').val(yyyy + "-" + mm + "-" + dd);			// formdate auf das heutige Datum setzen
	$('select').each(function() {
		addCities($(this));
	});
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