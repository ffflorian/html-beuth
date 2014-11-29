<?php
	/**
	* functions.php
	*
	* General functions for AJAX
	*
	* @author Florian Keller
	*/

	error_reporting(E_ALL);	
	date_default_timezone_set('Europe/Berlin');

	require_once('dbconnect.php');

	$actions = array('getdata', 'entries');

	$actionGET = (isset($_GET['action']) ? $_GET['action'] : "");
	$entryGET  = (isset($_GET['entry'])  ? $_GET['entry']  : "");

	if (in_array($actionGET, $actions)) {
		switch ($actionGET) {
			case 'getdata':
				if (is_numeric($entryGET)) {
					get_data($entryGET);
				} else {
					get_data(null);
				}
				break;
			case 'entries':
				get_entries();
		}
	}

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

	function get_data($entry) {
		global $mysqli;

		if ($entry) {
			$query = "SELECT c.id, c.name, d.id, d.date, d.temp, d.city_id, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)
					  WHERE d.id = " . $entry;
		} else {
			$query = "SELECT c.id, c.name, d.date, d.temp, d.city_id, d.image, d.comment
					  FROM data d
					  INNER JOIN cities c on (c.id = d.city_id)";
		}

		if ($result = $mysqli->query($query)) {
			while ($row = $result->fetch_object()) {
				echo "Datum: " . $row->date . "<br>\n
				Temperatur: " . $row->temp . "<br>\n
				Ort: " . $row->name . "<br>\n
				Bild: <img src=\"../img/data/" . $row->image . "\" /><br>\n
				Kommentar: " . $row->comment . "<br>\n<br>\n";
			}	
		}

		if ($mysqli->error) {
			printf("Error: %s\n", $mysqli->error);
		}
	}
?>
	</body>
</html>