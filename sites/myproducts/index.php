<?php

require __DIR__ . '/../sites.php';

class Myproducts Extends Sites {

    public $includeFiles = array(
        "css" => array(
            "/sites/myproducts/css/style.css"
        ),
        "js" => array(
            "/sites/myproducts/js/main.js"
        ),
        "html" => array(
            "myproducts/html/myproduct.html"
        )
    );

    function __construct() {

        parent::__construct($this->includeFiles);
    }

}