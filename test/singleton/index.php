<?php

$now = date('Y-m-d H:i:s');

$fp = fopen('date.log', 'a+');
if($fp){
  fwrite($fp, $now . "\r\n");
  fclose($fp);
}

var_dump([1, 2, 3]);
error_log(json_encode([4, 5, 6]), 4);

?>