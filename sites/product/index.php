<?php
require __DIR__ . '/../sites.php';

class Product Extends Sites {

    public $includeFiles = array(
        "css" => array(
            "/sites/product/css/product.css"
        ),
        "html" => array(
            "product/html/product.html"
        ),
        "js" => array(
            "/sites/product/js/product.js"
        )
    );

    function __construct() {

        parent::__construct($this->includeFiles);


        //echo '';
    }

}