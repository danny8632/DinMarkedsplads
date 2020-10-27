

<?php

require __DIR__ . '/../sites.php';

class Colors Extends Sites {

    public $includeFiles = array(
        "html" => array(
            "colors/html/color.html",
        )
    );

    function __construct() {

        parent::__construct($this->includeFiles);
    }

}