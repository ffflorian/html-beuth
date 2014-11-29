<?php
	/**
	* dbconnect.php
	*
	* Establish a database connection
	*
	* @author Florian Keller
	*/

	error_reporting(E_ALL);

	require_once('credentials.php');
	$mysqli = new mysqli('localhost', $db_user, $db_pass, 'weather');
	if ($mysqli->connect_errno) {
		printf("Connect failed: %s\n", $mysqli->connect_error);
		exit();
	}
	$mysqli->set_charset('utf8');
?>