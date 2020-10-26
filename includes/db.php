<?php

require '../php_env.php';

class DB {
    private $connection;
    private static $_instance;

    private $dbhost = "localhost"; // Ip Address of database if external connection.
    private $dbuser = db_uname; // Username for DB
    private $dbpass = db_password; // Password for DB
    private $dbname = "dinmarkedsplads"; // DB Name



    public static function getInstance(){
    if(!self::$_instance) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    private function __construct() {
        try{


            $this->connection = new PDO('mysql:host='.$this->dbhost.';dbname='.$this->dbname, $this->dbuser, $this->dbpass);
            // set the PDO error mode to exception
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

   

            //$this->connection = new PDO('mysql:host='.$this->dbhost.';dbname='.$this->dbname, $this->dbuser, $this->dbpass);
            //$this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        }catch(PDOException $e){
            die("Failed to connect to DB: ". $e->getMessage());
        }
    }

    private function __clone(){}

    public function getConnection(){
        return $this->connection;
    }
}



?>