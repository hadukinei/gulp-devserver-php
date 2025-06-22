<?php

$now = date('Y-m-d H:i:s');

$fp = fopen('date.log', 'a+');
if($fp){
  fwrite($fp, $now . "\r\n");
  fclose($fp);
}

error_log(json_encode([1, 2, 3, "あ"]), 4);
error_log(json_encode(true), 4);

?>