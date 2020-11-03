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


    function _UPDATE() {

        $req = $this->getRequest();

        $this->conn = $this->getDbConn();

        $sql = "UPDATE `products` SET ";

        $data = [
            'id'          => $this->getRequestValues(['id', 'product_id', 'pid'], $req),
            'title'       => $this->getRequestValues(['title', 'header', 'Title'], $req),
            'price'        => $this->getRequestValues(['price', 'beløb', 'amount'], $req),
            'description' => $this->getRequestValues(['description', 'beskrivelse', 'Description'], $req),
            'address'     => $this->getRequestValues(['address', 'addresse', 'adresse', 'location'], $req),
            'zipcode'     => $this->getRequestValues(['zipcode', 'postnr', 'post_nr'], $req),
            'region'      => $this->getRequestValues(['region', 'Region', 'område'], $req),
            'status'      => $this->getRequestValues(['status'], $req)
        ];

        $prep_data = [];

        foreach ($data as $key => $value) {

            if($value === false) continue;

            if($key == "id")
            {
                $prep_data[":$key"] = $value;
                continue;
            }

            $sql .= "$key=:$key ";

            $prep_data[":$key"] = $value;
        }

        $sql .= "WHERE `id` = :id;";

        if(!empty($prep_data) && count($prep_data) > 1)
        {
            $stmt = $this->conn->prepare($sql);
    
            foreach ($prep_data as $key => &$value) {
                $stmt->bindParam($key, $value);
            }
    
            $stmt->execute();
        }

        $category = $this->getRequestValues(['category'], $req);

        if($category !== false)
        {
            $stmt = $this->conn->prepare("UPDATE `productcategories` SET `categoryId`=:categoryId WHERE `productId` = :id;");
            $stmt->bindParam(":categoryId", $category);
            $stmt->bindParam(":id", $data['id']);
            $stmt->execute();
        }


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
                product.id = :id
            GROUP BY 
            product.id
            LIMIT 1;
        ");
        $stmt->bindParam(":id", $data['id']);
        $stmt->execute();

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        $result['categories'] = array_map('intval', explode(",", $result['categories']));

        return $this->formatResponse(true, $result);
    }


}



?>