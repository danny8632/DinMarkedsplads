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
            GROUP_CONCAT(assets.location) AS location,
            GROUP_CONCAT(categories.categoryId) AS categories
        FROM 
            products AS product 
        INNER JOIN 
            productassets AS assets ON product.id = assets.productId
        INNER JOIN 
            productcategories AS categories ON product.id = categories.productId 
        WHERE 
            product.userId = :userid
        GROUP BY 
            product.id;
        ");
        
        $stmt->bindParam(':userid', $_SESSION["user_id"]);
        $stmt->execute();
        
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $data = [];

        for ($i=0; $i < count($result); $i++) { 
            $product = $result[$i];


            $product['categories'] = array_map('intval', explode(",", $product['categories']));

            array_push($data, $product);
        }



        return $this->formatResponse(true, $data);
    }



}



?>