<?php

require __DIR__."/../api.php";

class Get extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $req = $this->getRequest();
        
        $this->conn = $this->getDbConn();
        $post_id = $this->getRequestValues(['id', 'post-id', 'post_id'], $req);

        if (isset($post_id) && !empty($post_id))
        {
            // Get specific product
            $stmt = $this->conn->prepare("SELECT id, userId, title, description, address, price, status, created FROM products WHERE products.id = :id AND status = 'A'");
            $stmt->bindParam(":id", $post_id);
            $stmt->execute();
        }
        else
        {
            // SELECT products.id, products.userId, products.title, products.description, products.address, products.price, products.status, products.created FROM products INNER JOIN productassets ON products.id = productassets.productId WHERE products.status = 'A'
            $stmt = $this->conn->prepare("SELECT id, userId, title, description, address, price, status, created FROM products WHERE status = 'A'");
            $stmt->execute();
        }

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $this->formatResponse(true, $result);

    }


    function orderProductsBy()
    {
        $req = $this->getRequest();

        $this->conn = $this->getDbConn();
        
        if(empty($req)) return $this->formatResponse(false, ['msg' => "No data was parsed"]);
        
        $order_type = $this->getRequestValues(['order_by', 'order-by', 'orderBy'], $req); // order by created/price - should this be handled client side??
        $asc_desc = $this->getRequestValues(['type']); // order by ascending/desc

        if(isset($order_by) && !empty($order_by))
        {
            $stmt = $this->conn->prepare("SELECT userId, title, description, address, price, status, created FROM products INNER JOIN productcategories ON products.id = productcategories.id INNER JOIN categories ON productcategories.categoryId = categories.id ORDER BY :order_type :asc_desc");
            $stmt->bindParam(":order_by", $order_by);
            $stmt->bindParam(":asc_desc", $asc_desc);
            $stmt->execute();
        } 
    
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if($stmt->rowCount() > 0)
            return $this->formatResponse(true, $result); 
        else
            return $this->formatResponse(false, ['msg' => "No products found"]);
            
    }

}   