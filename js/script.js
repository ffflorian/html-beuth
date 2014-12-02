/**
* File script.js
*
* All scripts for the site
*
* @author Florian Keller
*/

$(window).load(function() {										// warte darauf, dass der Inhalt geladen wurde
	$.ajaxSetup({ cache: false });

	$('#searchform .submitForm').on('click', function() {
		$('#searchform').submit();
	});

	$('#results .close').on('click', function() {
		$('#results').slideUp();
	});

	$('#searchform input').on('keyup', function() {
		if ($('#searchform input').val() === "") {
			$('#results').slideUp();
		}
		console.log($('#searchform input').val());
	});

	$(document).on('submit', '#searchform', function(event) {
		event.preventDefault();
		searchData();
	});

	$(document).on('submit', '#newdataform', function(event) {
		event.preventDefault();
		var formEmail = $('#formemail').val();
		if (formEmail.substring(formEmail.length-20,
								formEmail.length) !== "@beuth-hochschule.de") {		// wenn die letzten 20 Zeichen nicht dem String entsprechen
			$('#formemail').popover('show');
		} else {
			$('#formemail').popover('hide');
			sendEntries('#newdataform');
		}
	});

	$(document).on('change', 'select', function() {
		if ($(this).find('option:selected').val() === "neuestadt") {								// wenn eine neue Stadt eingetragen werden soll
			var userInput = prompt("Geben Sie den Namen der neuen Stadt ein:");
			if (userInput !== "" && userInput !== null) {
				var JSONdata = {};
				JSONdata['id'] = generateID();
				JSONdata['user'] = "lkf4vyxn9";
				JSONdata['name_short'] = formatValue(userInput);
				JSONdata['name_long'] = userInput;
				JSONdata['lat'] = 5.333;
				JSONdata['lng'] = 1.222;
				JSONdata['country'] = "";
				JSONdata['website'] = "";
				JSONdata['comment'] = "";
				var request = $.ajax({
					type: 'POST',
					dataType: 'json',
					url: 'php/functions.php',
					data: JSON.stringify({
						"type": "city",
						"data": JSONdata
					}),
					contentType: "application/json"
				});

				request.done(function(data) {
					//console.log(data);
					$.each($('select'), function(id, obj) {
						$('<option/>', {
							text: JSONdata['name_long'],
							name: JSONdata['name_short'],
							value: JSONdata['id'],
							selected: true
						}).appendTo(obj);
					});
				});

				request.fail(function(jqXHR, textStatus) {
					console.log("Request failed: " + textStatus);
					console.log("Received: " + JSON.stringify(jqXHR));
				});
			}
		}
	});

	$('table').on('click', '.wetterbild', function() {
		var img = $(this).attr('src');
		var text = $(this).attr('alt');
		$('#zoom')
			.find('#zoomtitle').html(text)
			.end().find('#zoombody').html('<img src="' + img + '" alt="Wetterbild" />')
			.end().modal('show');
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

	$('table').on('click', '.removelink', function(e) {
		e.preventDefault();
		//var el = $(this).parent();
		var id = $(this).parent().parent().attr('data-id');
		var title = $(this).attr('data-title');
		var msg = $(this).attr('data-message');
		var type = $(this).attr('data-type');
		$('#frm_submit').attr('remove-id', id);
		if (msg === "" && type === 'remove') {
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
		//console.log('remove-id: ' + $(this).attr('remove-id'));
		var tr = $('table').find('[data-id="' + $(this).attr('remove-id') + '"]');
		//console.log(tr);
		var entryID = $(tr).attr('data-id');
		//console.log(entryID);
		var request = $.ajax({
			url: 'php/functions.php',
			type: 'GET',
			dataType: 'json',
			data: {
				action: "removeentry",
				entry: entryID
			}
		});

		request.done(function() {
			tr.remove();
		});

		request.fail(function(jqXHR, textStatus) {
			console.log("Request failed: " + textStatus);
			console.log("Received: " + JSON.stringify(jqXHR));
		});
		
	});

	var today = new Date();									// neues Datum erzeugen
	var dateString = today.getFullYear() + '-'
		+ ('0' + (today.getMonth()+1)).slice(-2) + '-'
		+ ('0' + today.getDate()).slice(-2);
	$('#formdate').val(dateString);							// formdate auf das heutige Datum setzen

	$('#status').text("Daten werden geladen...");

	var request1 = $.ajax({
		url: 'php/functions.php',
		type: 'GET',
		dataType: 'json',
		data: {
			action: "getdata"
		}
	});

	request1.done(function(data) {
		$('#status').hide();
		$('#datawrap').show();
		$.each(data, function(i, item) {
			var entry = data[i];
			addEntry(entry.id, entry.date, entry.temp, entry.city, entry.image, entry.comment);
		});
	});

	request1.fail(function(jqXHR, textStatus) {
		$('#status').text("Request failed: " + textStatus);
		console.log("Received: " + JSON.stringify(jqXHR));
	});

	var citiesJSON = {};
	var request2 = $.ajax({
		url: 'php/functions.php',
		type: 'GET',
		dataType: 'json',
		data: {
			action: "getcities"
		}
	});

	request2.done(function(data) {
		$('select').each(function() {
			addCities($(this), data);
		});
	});

	request2.fail(function(jqXHR, textStatus) {
		console.log("Request failed: " + textStatus);
		console.log("Received: " + JSON.stringify(jqXHR));
	});

	function addEntry(id, date, temp, city, image, comment) {
		var tr = $('<tr class="entry" data-id="' + id + '">' +
			'<form class="form-horizontal" role="form" action="" method="post" class="editform">' +
			'<td class="editable date">' + formatDate(date) + '</td>' +
			'<td class="edit date"><input type="date" class="form-control" value="' + date + '" /></td>' +
			'<td class="editable temp">' + temp + '&deg; C</td>' +
			'<td class="edit temp"><input type="number" class="form-control" value="' + temp + '" min="-72" max="100" /> &deg;C</td>' +
			'<td class="editable city">' + city + '</td>' +
			'<td class="edit city">' +
				'<select class="form-control">' +
				'</select>' +
			'</td>' +
			'<td class="editable img"><img src="img/data/' + image + '" class="wetterbild" alt="Wetterbild am ' + formatDate(date) + '" /></td>' +
			'<td class="edit img"><button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-upload" aria-hidden="true"></span></button></td>' +
			'<td class="editable comment">' + comment + '</td>' +
			'<td class="edit comment"><input type="text" class="form-control" value="' + comment + '" /></td>' +
			'<td class="editable buttons">' +
				'<button type="button" class="btn btn-primary btn-xs editlink"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button>' +
				'<button type="button" class="btn btn-danger btn-xs removelink" data-type="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
			'</td>' +
			'<td class="edit buttons">' +
				'<button type="button" class="btn btn-success btn-xs savelink"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>' +
				'<button type="button" class="btn btn-danger btn-xs removelink" data-type="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>' +
			'</td>' +
			'</form>' +
			'</tr>').appendTo($('table tbody'));
		//console.log("id: " + id);
		addCities(tr.find('select'), citiesJSON);
	}

	function addCities(select, data) {
		//console.log(select);
		$('<option/>', {
			text: "Stadt",
			value: "",
			disabled: true
		}).appendTo(select);

		$.each(data, function(id, obj) {
			$('<option/>', {
				text: obj.name_long,
				name: obj.name_short,
				value: obj.id
			}).appendTo(select);
		});

		/*$(select).sort(function(a, b) {
			a = a.name;
			b = b.name;

			return a-b;
		});*/

		$('<option/>', {
			text: "Neue Stadt...",
			value: "neuestadt"
		}).appendTo(select);
	}

	function searchData() {
		var keyword = $('#searchform .searchbox').val();
		var request = $.ajax({
			url: 'php/functions.php',
			type: 'GET',
			dataType: 'json',
			data: {
				action: "searchcity",
				key: keyword
			}
		});

		request.done(function(data) {
			if (data.status === "success") {
				data = data.results;
				$('#results .panel-body').html("Suchergebnisse: ");
				$.each(data, function(id, obj) {
					$('#results .panel-body').append(obj.name_long + " ");
				});
				//console.log(data);
			} else {
				$('#results .panel-body').html(data.message);
			}
			$('#results').slideDown();
		});

		request.fail(function(jqXHR, textStatus) {
			console.log("Request failed: " + textStatus);
			console.log("Received: " + JSON.stringify(jqXHR));
		});
	}

	function sendImage(form) {

	}

	function sendEntries(form) {
		var JSONdata = {};
		JSONdata['id'] = generateID();
		JSONdata['user'] = "lkf4vyxn9";
		JSONdata['image'] = "mitte20141001.jpg";
		$(form + ' *').filter(':input').each(function(i, obj) {
			JSONdata[$(obj).attr('name')] = $(obj).val();
			delete JSONdata['undefined'];
		});
		//console.log(JSONdata);
		var formId = $('table tr').length;
		var request = $.ajax({
			type: 'POST',
			dataType: 'json',
			url: 'php/functions.php',
			data: JSON.stringify({
				"type": "entries",
				"data": JSONdata
			}),
			contentType: "application/json"
		});

		request.done(function() {
			addEntry(JSONdata['id'], JSONdata['date'], JSONdata['temp'], $(form + ' option:selected').text(), JSONdata['image'], JSONdata['comment']);
		});

		request.fail(function(jqXHR, textStatus) {
			console.log("Request failed: " + textStatus);
			console.log("Received: " + JSON.stringify(jqXHR));
		});
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

	function generateID() {
		return Math.random().toString(36).substr(2, 9);
	}

	var mapOptions = {
		center: {
			lat: 52.5167,
			lng: 13.3833
		},
		zoom: 13,
		disableDefaultUI: true,
		draggable: false,
		scrollwheel: false,
		disableDoubleClickZoom: true
	};
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	$('#map').fadeIn();
});
