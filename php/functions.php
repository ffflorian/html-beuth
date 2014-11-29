<!doctype html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	</head>
	<body>
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

	$query = "SELECT d.date, d.temp, d.city_id, d.comment
			  FROM data d";

	if ($result = $mysqli->query($query)) {
		while ($row = $result->fetch_object()) {
			echo "Datum: " . $row->date . "<br>\n
			Temperatur: " . $row->temp . "<br>\n
			Ort: " . $row->city_id . "<br>\n
			Kommentar: " . $row->comment . "<br>\n<br>\n";
		}	
	}

	if ($mysqli->error) {
		printf("Error: %s\n", $mysqli->error);
	}
?>
	</body>
</html>