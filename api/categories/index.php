<?php
// TODO: Get post/product by price or product name. Should this be under post/index.php or here? (categories/index.php)
require __DIR__."/../api.php";

session_start();

class Categories extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $req = $this->getRequest();

        if(empty($req)) return $this->formatResponse(false, ['msg' => "No data was parsed"]);

        $this->conn = $this->getDbConn();

        $category_id   = $this->getRequestValues(['category_id', 'category-id', 'categoryId'], $req);
    
        if (isset($category_id) && !empty($category_id))
        {
            $stmt = $this->conn->prepare("SELECT userId, title, description, address, price, status
                                          FROM products INNER JOIN productcategories
                                          ON products.id = productcategories.id INNER JOIN categories
                                          ON productcategories.categoryId = categories.id WHERE productcategories.categoryId = :category_id");

            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->execute();


            if($stmt->rowCount() <= 0)
                return $this->formatResponse(true, ['msg' => "no products found in this category"]);
        }
        else
        {
            $stmt = $this->conn->prepare("SELECT * FROM categories");
            $stmt->execute();
        }
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode($result);
    }
    
}