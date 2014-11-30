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

	$actions = array("getdata", "getcities", "entries");
	$formats = array("json", "text", "html");


	if ($json = file_get_contents('php://input')) {
		put_data($json);
		exit();
	};

	$actionGET = (isset($_GET['action']) ?  $_GET['action'] : "");
	$entryGET  = (isset($_GET['entry'])  && is_numeric($_GET['entry']) ? $_GET['entry']  : null);
	$formatGET = (isset($_GET['format']) && in_array($_GET['format'], $formats) ? $_GET['format']  : null);

	switch ($actionGET) {
		case "getdata":
			get_data($entryGET, $formatGET);
			break;
		case "getcities":
			get_cities();
			break;
		case "entries":
			get_entries();
			break;
		default:
			print ("No or wrong action specified! Available actions: ") . implode(", ", $actions);
			break;
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
		}

		if ($mysqli->error) {
			printf("Error: %s\n", $mysqli->error);
		}
	}


	/**
	* Function put_data
	*
	* Receives JSON data via POST and saves it to the database
	*
	*@param JSON $json The JSON object with data
	*/

	function put_data($json) {
		global $mysqli;
		header('Content-type: application/json');
		$obj = json_decode($json);
		$query = "INSERT INTO data (id, created_at, date, user_id, temp, city_id, image, comment)
				  VALUES (NULL, '". date('Y-m-d H:i:s') . "', '". $obj->date . "', '1', '". $obj->temp . "', '1', 'mitte20141001.jpg', '". $obj->comment . "');";
		if ($mysqli->query($query) === TRUE) {
			echo json_encode(array("status" => "success"));
		} else {
			//var_dump($obj);
			echo json_encode(array("status" => "error", "message" => "Error: " . $query . "<br>" . $mysqli->error));
		}
	}


	/**
	* Function get_cities
	*
	* Sends a query to the database to receive all cities
	* and returns the result(s) in JSON format.
	*
	* @return The result(s) in JSON.
	*/

	function get_cities() {
		global $mysqli;

		$query = "SELECT id, name_long as city, name_short as city_id
				  FROM cities";

		if ($result = $mysqli->query($query)) {
			while ($r = $result->fetch_object()) {
						$rows[] = $r;
			}
			header('Content-type: application/json');
			echo json_encode($rows);
		}
	}


	/**
	* Function get_data
	*
	* Sends a query to the database to receive weather data 
	* and returns the result(s) in a previously defined format.
	*
	* @param String $entry If only one entriy should be returned.
	* @param String $format The desired format.
	* @return The result(s) in different formats.
	*/

	function get_data($entry, $format) {
		global $mysqli;

		$rows = array();

		if ($entry) {
			$query = "SELECT c.id, c.name_long as city, d.id, d.date, d.temp, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE d.id = " . $entry;
		} else {
			$query = "SELECT c.id, c.name_long as city,       d.date, d.temp, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)";
		}

		if ($result = $mysqli->query($query)) {
			switch ($format) {
				case "html":
					while ($r = $result->fetch_object()) {
						echo "Datum: " . $r->date . "<br>\n".
						"Temperatur: " . $r->temp . " &deg; C<br>\n".
						"Ort: " . $r->name . "<br>\n".
						"Bild: <img src=\"../img/data/" . $r->image . "\" /><br>\n".
						"Kommentar: " . $r->comment . "<br>\n<br>\n";
					}
					break;
				case "text":
					while ($r = $result->fetch_object()) {
						echo "Datum: " . $r->date . "\n".
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
					header('Content-type: application/json');
					echo json_encode($rows);
					break;
			}
		}

		if ($mysqli->error) {
			printf("Error: %s\n", $mysqli->error);
		}
	}
?>
