<?php
	/**
	* File functions.php
	*
	* General PHP functions for AJAX
	*
	* @author Florian Keller
	*/

	error_reporting(E_ALL);	
	date_default_timezone_set('Europe/Berlin');

	require_once('dbconnect.php');

	$actions = array("getdata", "entries");
	$formats = array("json", "text", "html");

	$actionGET = (isset($_GET['action']) ?  $_GET['action'] : "");
	$entryGET  = (isset($_GET['entry'])  && is_numeric($_GET['entry']) ? $_GET['entry']  : null);
	$formatGET = (isset($_GET['format']) && in_array($_GET['format'], $formats) ? $_GET['format']  : null);

	if (in_array($actionGET, $actions)) {
		switch ($actionGET) {
			case "getdata":
				get_data($entryGET, $formatGET);
				break;
			case "entries":
				get_entries();
		}
	}

	/**
	* Function get_entries
	*
	* Returns the number of entries
	*
	* @return The number of entries in plain text
	*/

	function get_entries() {
		global $mysqli;

		$query = "SELECT id
				  FROM data";
		if ($result = $mysqli->query($query)) {
			echo (mysqli_num_rows($result));
		} else {
			echo "error";
		}
	}


	/**
	* Function get_data
	*
	* Sends a query to the database and returns the result(s) in
	* a previously defined format
	*
	* @param String $entry If only one entriy should be returned.
	* @param String $format The desired format.
	* @return The result(s) in different formats.
	*/

	function get_data($entry, $format) {
		global $mysqli;

		$rows = array();

		if ($entry) {
			$query = "SELECT c.id, c.name, d.id, d.date, d.temp, d.city_id, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE d.id = " . $entry;
		} else {
			$query = "SELECT c.id, c.name,       d.date, d.temp, d.city_id, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)";
		}

		if ($result = $mysqli->query($query)) {
			switch ($format) {
				case "html":
					while ($r = $result->fetch_object()) {
						print "Datum: " . $r->date . "<br>\n".
						"Temperatur: " . $r->temp . " &deg; C<br>\n".
						"Ort: " . $r->name . "<br>\n".
						"Bild: <img src=\"../img/data/" . $r->image . "\" /><br>\n".
						"Kommentar: " . $r->comment . "<br>\n<br>\n";
					}
					break;
				case "text":
					while ($r = $result->fetch_object()) {
						print "Datum: " . $r->date . "\n".
						"Temperatur: " . $r->temp . " ° C\n".
						"Ort: " . $r->name . "\n".
						"Bild: ../img/data/" . $r->image . "\n".
						"Kommentar: " . $r->comment . "\n\n";
					}
					break;
				default:
					while ($r = $result->fetch_object()) {
						$rows[] = $r;
					}

					//$rows = htmlentities($rows);
					print json_encode($rows);
					break;
			}
		}

		if ($mysqli->error) {
			printf("Error: %s\n", $mysqli->error);
		}
	}
?>
