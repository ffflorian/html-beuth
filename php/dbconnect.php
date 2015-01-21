<?php
	/**
	* dbconnect.php
	*
	* Establish a database connection.
	*
	* To make the connection work, a file 'credentials.php'
	* is needed with the following variables set:
	*
	* $db_user The name of the database user
	* $db_pass The password for the database user
	* $db_name The database name
	*
	*
	* Example:
	* $db_user = "florian";
	* $db_pass = "mypassword";
	* $db_name = "weather";
	*
	* @author Florian Keller
	*/

	error_reporting(E_ALL);

	require_once('credentials.php');
	$mysqli = new mysqli('localhost', $db_user, $db_pass, $db_name);
	if ($mysqli->connect_errno) {
		printf("Connect failed: %s\n", $mysqli->connect_error);
		exit();
	}
	$mysqli->set_charset('utf8');
?>
