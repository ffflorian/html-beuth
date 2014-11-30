/**
* File script.js
*
* All scripts for the site
*
* @author Florian Keller
*/

$(window).load(function() {										// warte darauf, dass der Inhalt geladen wurde
	$(document).keydown(function(event) {
		if (event.keyCode === 27) {								// Escape wurde gedrueckt
			$('#zoomWrap').hide();								// verstecke das Bildfenster
		}
	});

	$('#searchform .submitForm').on('click', function() {
		$('#searchform').submit();
	});

	$(document).on('submit', '#newdataform', function(event) {
		event.preventDefault();
		var formEmail = $('#formemail').val();
		if (formEmail.substring(formEmail.length-20,
								formEmail.length) !== "@beuth-hochschule.de") {		// wenn die letzten 20 Zeichen nicht dem String entsprechen
			$('#formemail').popover('show');

		} else {
			var formDate = $('#formdate').val();
			var formTemp = $('#formtemp').val();
			var formCity = $('#formcity :selected').text();
			var formComment = $('#formcomment').val();
			$('#formemail').popover('hide');
			var entries = $('table tr').length;
			addEntry(entries, formDate, formTemp, formCity, 0, formComment);
		}
	});

	$('#zoom a').on('click', function() {
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

	$(document).on('change', 'select', function() {
		if ($(this).find('option:selected').val() === "neuestadt") {								// wenn eine neue Stadt eingetragen werden soll
			var userInput = prompt("Geben Sie den Namen der neuen Stadt ein:");
			if (userInput !== "" && userInput !== null) {
				$(this).append(new Option(userInput, formatValue(userInput), true, true));			// erstelle neue Option mit der Benutzereingabe
			}
		}
	});

	$('table').on('click', '.zoomlink', function() {
		var img = $(this).find('img').attr('src');
		$('#zoomImage').attr('src', img);
		$('#zoomWrap').show();
	});

	$('table').on('click', '.editlink', function() {
		$(this).parent().parent().find('.editable').hide();
		$(this).parent().parent().find('.edit').show();
	});

	$('table').on('click', '.savelink', function() {
		var tr = $(this).parent().parent();
		tr.find('.editable.date').text(formatDate(tr.find('input[type=date]').val()));
		tr.find('.editable.temp').html(tr.find('input[type=number]').val() + " &deg;C");
		tr.find('.editable.city').text(tr.find('select option:selected').text());
		tr.find('.editable.comment').text(tr.find('input[type=text]').val());
		tr.find('.edit').hide();
		tr.find('.editable').show();
	});

	$('table').on('click', '.deletelink', function(e) {
		e.preventDefault();
		//var el = $(this).parent();
		var id = $(this).parent().parent().attr('id');
		var title = $(this).attr('data-title');
		var msg = $(this).attr('data-message');
		var type = $(this).attr('data-type');
		$('#frm_submit').attr('data-form', '#'+id);
		if (msg === "" && type === 'delete') {
			title = "L&ouml;schen?";
			msg = "Diesen Eintrag wirklich l&ouml;schen?";
		}

		$('#formConfirm')
			.find('#frm_body').html(msg)
			.end().find('#frm_submit').html("Ja")
			.end().find('#frm_cancel').html("Nein")
			.end().find('#frm_title').html(title)
			.end().modal('show');

		//$('#formConfirm').find('#frm_submit').attr('data-form', dataForm);
	});

	$('#formConfirm').on('click', '#frm_submit', function(e) {
		/*var id = $(this).attr('data-form');
		$(id).submit();*/
		var tr = $(this).attr('data-form');
		$(tr).remove();
	});

	$.backstretch("img/wetter_bg.jpg");

	/*$.backstretch([
		"img/wetter_bg.jpg",
		"img/wallpaper/wetter1.jpg",
		"img/wallpaper/wetter2.jpg",
		"img/wallpaper/wetter3.jpg",
		"img/wallpaper/wetter4.jpg",
		"img/wallpaper/wetter5.jpg",
		"img/wallpaper/wetter6.jpg",
		"img/wallpaper/wetter7.jpg"
	], {duration: 4000, fade: 750});*/

	var today = new Date();									// neues Datum erzeugen
	var dd = today.getDate();								// hole den Tag
	var mm = today.getMonth()+1;							// hole den Monat; +1 weil hier Januar mit 0 gezaehlt wird
	var yyyy = today.getFullYear();							// hole das Jahr
	$('#formdate').val(yyyy + "-" + mm + "-" + dd);			// formdate auf das heutige Datum setzen

	$.ajax({
			url: 'php/functions.php',
			data: {
				action: 'getdata'
			},
			error: function(request, status, error) {
				$('#ajax').html('<strong>An error has occurred: </strong>' + error);
			},
			dataType: 'json',
			success: function(data) {
				$(data).each(function(id, el) {
					var entry = data[id];
					addEntry(id, entry.date, entry.temp, entry.city, entry.image, entry.comment);
				});
			},
			type: 'GET'
	});
	
	$('select').each(function() {
		addCities($(this));
	});
});

function addEntry(id, date, temp, city, image, comment) {
	$('table tbody').append('<tr id="entry' + id + '">' +
		'<td class="editable date">' + formatDate(date) + '</td>' +
		'<td class="edit date"><input type="date" class="form-control" value="' + date + '" /></td>' +
		'<td class="editable temp">' + temp + '&deg; C</td>' +
		'<td class="edit temp"><input type="number" class="form-control" value="' + temp + '" min="-72" max="100" /> &deg;C</td>' +
		'<td class="editable city">' + city + '</td>' +
		'<td class="edit city">' +
			'<select class="form-control">' +
			'</select>' +
		'</td>' +
		'<td class="editable img"><a href="#" class="zoomlink"><img src="img/data/' + image + '" class="wetterbild" alt="Wetterbild am ' + formatDate(date) + '" /></a></td>' +
		'<td class="edit img"><button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span></button></td>' +
		'<td class="editable comment">' + comment + '</td>' +
		'<td class="edit comment"><input type="text" class="form-control" value="' + comment + '" /></td>' +
		'<td class="editable buttons">' +
			'<button type="button" class="btn btn-primary btn-xs editlink"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>' +
			'<button type="button" class="btn btn-danger btn-xs deletelink" data-type="delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
		'</td>' +
		'<td class="edit buttons">' +
			'<button type="button" class="btn btn-success btn-xs savelink"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>' +
			'<button type="button" class="btn btn-danger btn-xs deletelink" data-type="delete"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
		'</td>');
	addCities($('#entry'  + id + ' select'));
}

function addCities(select) {
	select.append(new Option("Stadt", "", true));			// damit man nicht alle Staedte mehrfach eintragen muss
	$('select [value=""]').attr('disabled', true);
	select.append(new Option("Berlin", "koeln"));
	select.append(new Option("Köln", "berlin"));
	select.append(new Option("Frankfurt", "frankfurt"));
	select.append(new Option("Hamburg", "hamburg"));
	select.append(new Option("München", "muenchen"));
	select.append(new Option("Neue Stadt...", "neuestadt"));
}


/**
* Function formatValue
*
* Returns a String with umlauts replaced to ae, oe, etc.
*
* @param String str The string with umlauts
* @return The replaced string without umlauts
*/

function formatValue(str) {									// ersetze alle dt. Umlaute und gib das Wort in Kleinbuchstaben zurueck
	return str.toLowerCase().replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00fc/g, "ue").replace(/\u00df/g, "ss").replace(/ /g, "_");
}


/**
* Function formatDate
*
* Returns a date String in the dd.mm.yyyy format
*
* @param String date The date in the format yyyy-mm-dd
* @return The replaced date string
*/

function formatDate(date) {									// uebersetze ein Datum vom ISO 8601-Format in die dt. Schreibweise und gib es zurueck
	return date.replace(/(\d\d\d\d)-(\d\d)-(\d\d)/i, "$3.$2.$1");
}
