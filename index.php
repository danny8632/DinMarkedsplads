<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$redirect = explode('?',$_SERVER['REQUEST_URI']); // You can also use $_SERVER['REDIRECT_URL'];

$redirect_exploded = explode("/", $redirect[0]);

$uri_length = count($redirect_exploded);
$dir = [__DIR__];

if(!in_array("api_v1", $redirect_exploded)) array_push($dir, "/sites");

for ($i=0; $i < $uri_length; $i++) { 
    $uri_block = $redirect_exploded[$i];

    if($uri_block == "" || $uri_block == "DinMarkedsplads") continue;

    if($uri_block == "api_v1") { array_push($dir, "/api"); continue; }

    array_push($dir, "/", $uri_block);
}

if(count($dir) == 2) array_push($dir, "/home");

$customNameFile = implode("", $dir) . ".php";
$indexFile = implode("", $dir) . "/index.php";

if((file_exists($customNameFile) || file_exists($indexFile)) && count($dir) > 0)
{
    require file_exists($customNameFile) ? $customNameFile : $indexFile;
    $class = str_replace("/", "", $dir[count($dir)-1]);

    new $class();

    return true;
}
else
{
    require __DIR__ . '/404.php';

    http_response_code(404);

    return true;
}