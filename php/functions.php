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

	$actions = array("getdata", "getcities", "entries", "removeentry", "removecity", "searchcity");
	$formats = array("json", "text", "html");

	if ($data = file_get_contents('php://input')) {
		if ($_SERVER['CONTENT_TYPE'] === "application/json") {
			put_data("JSON", $data);
		} else {
			put_data("file", $data);
		}
		exit();
	}

	$actionGET = (isset($_GET['action']) ? $_GET['action'] : "");
	$entryGET  = (isset($_GET['entry']) ? $mysqli->real_escape_string($_GET['entry']) : null);
	$formatGET = (isset($_GET['format']) && in_array($_GET['format'], $formats) ? $_GET['format']  : null);
	$cityGET   = (isset($_GET['city']) ? $mysqli->real_escape_string($_GET['city']) : null);
	$keyGET    = (isset($_GET['key']) ? $mysqli->real_escape_string($_GET['key']) : null);

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
		case "removeentry":
			remove_entry($entryGET);
			break;
		case "removecity":
			remove_city($cityGET);
			break;
		case "searchcity":
			search_city($keyGET);
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

	function put_data($type, $data) {
		if ($type === "JSON") {
			global $mysqli;

			header('Content-type: application/json');
			$obj = json_decode($data);
			if ($obj->type === "entries") {
				$obj = $obj->data;
				$query = "INSERT INTO `data` (`id`, `created_at`, `date`, `user_id`, `temp`, `city_id`, `image`, `comment`)
						  VALUES ('$obj->id', '". date('Y-m-d H:i:s') . "', '$obj->date', '$obj->user', '$obj->temp', '$obj->city', '$obj->image', '$obj->comment');";
			} elseif ($obj->type === "city") {
				$obj = $obj->data;
				$query = "INSERT INTO `cities` (`id`, `created_at`, `user_id`, `name_short`, `name_long`, `latitude`, `longitude`, `country`, `website`, `comment`)
							VALUES ('$obj->id', '". date('Y-m-d H:i:s') . "', '$obj->user', '$obj->name_short', '$obj->name_long', '$obj->lat', '$obj->lng', '$obj->country', '$obj->website', '$obj->comment');";
			}
			if ($mysqli->query($query) === true) {
				echo json_encode(array("status" => "success"));
			} else {
				//var_dump($obj);
				echo json_encode(array("status" => "error", "message" => "Error: " . $query . "<br>" . $mysqli->error));
			}
		} else if ($type === "image") {

		}
	}


	/**
	* Function search_city
	*
	* Searches the database for a specified entry and returns
	* the results as JSON.
	*
	* @param String $keyword The keyword for search
	* @return The number of entries in plain text
	*/

	function search_city($keyword) {
		if ($keyword) {
			global $mysqli;
			$query = "SELECT name_long FROM cities
					  WHERE name_long LIKE '%$keyword%'
					  ORDER BY name_long";

			if ($result = $mysqli->query($query)) {
				if ($result->num_rows != 0) {
					$row = ["status" => "success"];
					while ($r = $result->fetch_object()) {
						$row['results'] = $r;
					}
				} else {
					$row = ["status"  => "error",
							  "message" => "Keine Stadt gefunden!"];
				}
			}
			header('Content-type: application/json');
			echo json_encode($row);
		} else {
			echo "Search city: No keyword specified!";
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

		$query = "SELECT id, name_long, name_short
				  FROM cities
				  ORDER BY name_short ASC";

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
			$query = "SELECT d.id, d.date, d.temp, d.image, d.comment, c.name_long as city
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE d.id = $entry
					  ORDER BY `date` ASC";
		} else {
			$query = "SELECT d.id, d.date, d.temp, d.image, d.comment, c.name_long as city
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  ORDER BY `date` ASC";
		}

		if ($result = $mysqli->query($query)) {
			switch ($format) {
				case "html":
					while ($r = $result->fetch_object()) {
						echo "Datum: " . $r->date . "<br>\n".
						"Temperatur: " . $r->temp . " &deg;C<br>\n".
						"Ort: " . htmlentities($r->city) . "<br>\n".
						"Bild: <img src=\"../img/data/" . $r->image . "\" /><br>\n".
						"Kommentar: " . htmlentities($r->comment) . "<br>\n<br>\n";
					}
					break;
				case "text":
					while ($r = $result->fetch_object()) {
						echo "Datum: " . $r->date . "\n".
						"Temperatur: " . $r->temp . " °C\n".
						"Ort: " . $r->city . "\n".
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

	function remove_entry($entry) {
		global $mysqli;

		if ($entry) {
			$query = "DELETE FROM data
					  WHERE id = '$entry'";
			if ($mysqli->query($query) === TRUE) {
				echo json_encode(array("status" => "success"));
			} else {
				//var_dump($obj);
				echo json_encode(array("status" => "error", "message" => "Error: " . $query . "<br>" . $mysqli->error));
			}
		} else {
			echo "Remove entry: No entry specified!";
		}
	}

	function remove_city($city) {
		global $mysqli;

		if ($city) {
			$query = "DELETE FROM cities
					  WHERE id = " . $city;
			if ($mysqli->query($query) === TRUE) {
				echo json_encode(array("status" => "success"));
			} else {
				//var_dump($obj);
				echo json_encode(array("status" => "error", "message" => "Error: " . $query . "<br>" . $mysqli->error));
			}
		} else {
			echo "Remove city: No city specified!";
		}
	}
?>
