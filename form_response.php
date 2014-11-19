<html>
	<head>
		<meta charset="utf-8">
		<title>HTML5 FORM RESPONSE</title>
	</head>
	<body>
		<output>
			<h1>PHP ECHO OF POST REQUEST:</h1>
			<br>
			<table border="1" cellpadding="2" cellspacing="0" width="100%">
				<?php
					foreach ($_POST as $key => $value)
					print("<tr><td bgcolor=\"#bbbbbb\">
						   <strong>$key</strong></td>
						   <td>htmlspecialchars($value)</td></tr>");
				?>
			</table>
			<br>
			<h1>PHP ECHO OF GET REQUEST:</h1>
			<br>
			<table border="1" cellpadding="2" cellspacing="0" width="100%">
				<?php
					foreach ($_GET as $key => $value)
					print("<tr><td bgcolor=\"#bbbbbb\">
						   <strong>$key</strong></td>
						   <td>htmlspecialchars($value)</td></tr>");
				?>
			</table>
		</output>
	</body>
</html>