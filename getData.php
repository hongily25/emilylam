<?php 

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// This is just an example of reading server side data and sending it to the client.
// It reads a json formatted text file and outputs it.

$string = file_get_contents("convertcsv.json");
echo $string;

// Instead you can query your database and parse into JSON etc etc

?>
