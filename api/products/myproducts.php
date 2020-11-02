<?php

require __DIR__."/../api.php";

session_start();

class Myproducts extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }


    function _GET() {

        if(!isset($_SESSION["user_id"])) return $this->formatResponse(false, "You need to be logged in");

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("SELECT 
            product.id, 
            product.userId, 
            product.title, 
            product.description, 
            product.address, 
            product.price, 
            product.status, 
            product.created,
            product.zipcode,
            product.region,
            GROUP_CONCAT(assets.location) AS location 
        FROM 
            products AS product 
        INNER JOIN 
            productassets AS assets ON product.id = assets.productId 
        WHERE 
            product.userId = :userid
            GROUP BY product.id;");
        
        $stmt->bindParam(':userid', $_SESSION["user_id"]);
        $stmt->execute();
        
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        return $this->formatResponse(true, $result);
    }



}



?>