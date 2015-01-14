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

	if (isset($_GET['file'])) {
		put_data("file", $_FILES[0]);
		exit();
	}

	if ($data = file_get_contents('php://input')) {
		if ($_SERVER['CONTENT_TYPE'] === "application/json") {
			put_data("JSON", $data);
		}
		exit();
	}

	$actionGET = (isset($_GET['action']) ? $_GET['action'] : "");
	$entryGET  = (isset($_GET['entry']) ? $mysqli->real_escape_string($_GET['entry']) : null);
	$formatGET = (isset($_GET['format']) && in_array($_GET['format'], $formats) ? $_GET['format']  : null);
	$cityGET   = (isset($_GET['city']) ? $mysqli->real_escape_string($_GET['city']) : null);
	$cityIDGET = (isset($_GET['cityID']) ? $mysqli->real_escape_string($_GET['cityID']) : null);
	$keyGET    = (isset($_GET['key']) ? $mysqli->real_escape_string($_GET['key']) : null);

	switch ($actionGET) {
		case "getdata":
			get_data($entryGET, $formatGET, $cityGET);
			break;
		case "getcities":
			get_cities($cityIDGET);
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
			if ($obj->action === "insert") {
				if ($obj->type === "entries") {
					$obj = $obj->data;
					$query = "INSERT INTO `data` (`id`, `created_at`, `date`, `user_id`, `temp`, `city_id`, `image`, `comment`)
							  VALUES ('$obj->id', '". date('Y-m-d H:i:s') . "', '$obj->date', '$obj->user', '$obj->temp', '$obj->city', '$obj->image', '$obj->comment');";
				} elseif ($obj->type === "city") {
					$obj = $obj->data;
					$query = "INSERT INTO `cities` (`id`, `created_at`, `user_id`, `name_short`, `name_long`, `latitude`, `longitude`, `country`, `website`, `comment`)
								VALUES ('$obj->id', '". date('Y-m-d H:i:s') . "', '$obj->user', '$obj->name_short', '$obj->name_long', '$obj->latitude', '$obj->longitude', '$obj->country', '$obj->website', '$obj->comment');";
				}
				if ($mysqli->query($query) === true) {
					echo json_encode(array("status" => "success",
										   "action" => "insert",
										   "id" => $obj->id));
				} else {
					//var_dump($obj);
					echo json_encode(array("status" => "error",
										   "action" => "insert",
										   "message" => "Error: " . $query . "\n" . $mysqli->error));
				}
			} else if ($obj->action === "update") {
				if ($obj->type === "entries") {
					$obj = $obj->data;
					$query = "UPDATE `data`
							  SET `date` = '$obj->date', `user_id` = '$obj->user', `temp` = '$obj->temp', `city_id` = '$obj->city', " . ($obj->image != "" ? "`image` = '$obj->image', " : "") . "`comment` = '$obj->comment'
							  WHERE `id` = '$obj->id';";
					if ($mysqli->query($query) === true) {
						echo json_encode(array("status" => "success",
											   "action" => "update",
											   "id" => $obj->id));
					} else {
						//var_dump($obj);
						echo json_encode(array("status" => "error",
											   "action" => "update",
											   "message" => "Error: " . $query . "\n" . $mysqli->error));
					}
				}
			}
		} else if ($type === "file") {
			$uploaddir = '../img/data/';
			$filename = $uploaddir . basename($data['name']);
			if (move_uploaded_file($data['tmp_name'], $filename)) {
					echo json_encode(array("status" => "success",
										   "action" => "upload",
										   "filename" => $filename));
				} else {
					echo json_encode(array("status" => "error",
										   "action" => "upload",
										   "message" => "Dateifehler!"));
				}
		}
	}


	/**
	* Function search_city
	*
	* Searches the database for a specified entry and returns
	* the results as JSON.
	*
	* @param String $keyword The keyword for search
	* @return The entries in JSON
	*/

	function search_city($keyword) {
		header('Content-type: application/json');
		global $mysqli;
		$query = "SELECT id, name_short, name_long, latitude, longitude, country, website, comment FROM cities
				  WHERE name_long LIKE '%$keyword%'
				  ORDER BY name_short";

		if ($result = $mysqli->query($query)) {
			if ($result->num_rows != 0) {
				$rows = array("status" => "success");
				$rows["results"] = array();
				while ($r = $result->fetch_object()) {
					array_push($rows["results"], $r);
				}
				echo json_encode($rows, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK);
			} else {
				echo json_encode(array("status" => "error", "message" => "Fehler: Keine Stadt gefunden!"));
			}
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

	function get_cities($cityID) {
		header('Content-type: application/json');
		global $mysqli;

		if ($cityID) {
			$query = "SELECT id, name_long, name_short, latitude, longitude
					  FROM cities
					  WHERE id = '$cityID'
					  ORDER BY name_short ASC";
		} else {
			$query = "SELECT id, name_long, name_short, latitude, longitude
					  FROM cities
					  ORDER BY name_short ASC";
		}

		if ($result = $mysqli->query($query)) {
			if ($result->num_rows != 0) {
				/*$rows = array("status" => "success");
				$rows["results"] = array();*/
				while ($r = $result->fetch_object()) {
						$rows[] = $r;
				}
				echo json_encode($rows, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK);
			} else {
				echo json_encode(array("status" => "error", "message" => "Fehler: Keine Stadt gefunden!"));
			}
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

	function get_data($entry, $format, $cityID) {
		header('Content-type: application/json');
		global $mysqli;

		$rows = array();

		if ($entry && $entry != "undefined") {
			$query = "SELECT d.id, d.date, d.temp, d.image, d.comment, c.latitude, c.longitude, c.name_long, c.name_short
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE d.id = '$entry'
					  ORDER BY `date` ASC";
		} else if ($cityID && $cityID != "undefined") {
			$query = "SELECT d.id, d.date, d.temp, d.image, d.comment, c.latitude, c.longitude, c.name_long, c.name_short
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE c.id = '$cityID'
					  ORDER BY `date` ASC";
		} else {
			$query = "SELECT d.id, d.date, d.temp, d.image, d.comment, c.latitude, c.longitude, c.name_long, c.name_short
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  ORDER BY `date` ASC";
		}

		if ($result = $mysqli->query($query)) {
			switch ($format) {
				case "html":
					if ($result->num_rows != 0) {
						while ($r = $result->fetch_object()) {
							echo "Datum: " . $r->date . "<br>\n".
							"Temperatur: " . $r->temp . " &deg;C<br>\n".
							"Ort: " . htmlentities($r->city) . "<br>\n".
							"Bild: <img src=\"../img/data/" . $r->image . "\" /><br>\n".
							"Kommentar: " . htmlentities($r->comment) . "<br>\n<br>\n";
						}
					} else {
						echo("Keine Daten gefunden!");
					}
					break;
				case "text":
					if ($result->num_rows != 0) {
						while ($r = $result->fetch_object()) {
							echo "Datum: " . $r->date . "\n".
							"Temperatur: " . $r->temp . " °C\n".
							"Ort: " . $r->city . "\n".
							"Bild: ../img/data/" . $r->image . "\n".
							"Kommentar: " . $r->comment . "\n\n";
						}
					} else {
						echo("Keine Daten gefunden!");
					}
					break;
				default:
					if ($result->num_rows != 0) {
						while ($r = $result->fetch_object()) {
							$rows[] = $r;
						}
						echo json_encode($rows, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK);
					} else {
						get_cities($cityID);
					}
					break;
			}
		}

		if ($mysqli->error) {
			echo json_encode(array("status" => "error", "message" => "Fehler: " . $mysqli->error));
		}
	}

	function remove_entry($entry) {
		global $mysqli;

		header('Content-type: application/json');
		if ($entry) {
			$query = "DELETE FROM data
					  WHERE id = '$entry'";
			if ($mysqli->query($query) === TRUE) {
				echo json_encode(array("status" => "success",
									   "id" => $entry));
			} else {
				//var_dump($obj);
				echo json_encode(array("status" => "error", "message" => "Fehler: " . $query . "\n" . $mysqli->error));
			}
		} else {
			echo json_encode(array("status" => "error", "message" => "Fehler: Keine Stadt angegeben!"));
		}
	}

	function remove_city($city) {
		global $mysqli;

		header('Content-type: application/json');
		if ($city) {
			$query = "DELETE FROM cities
					  WHERE id = '$city'";
			if ($mysqli->query($query) === TRUE) {
				echo json_encode(array("status" => "success",
										   "id" => $city));
			} else {
				//var_dump($obj);
				echo json_encode(array("status" => "error", "message" => "Fehler: " . $query . "\n" . $mysqli->error));
			}
		} else {
			echo json_encode(array("status" => "error", "message" => "Fehler: Keine Stadt angegeben!"));
		}
	}
?>
