<?php

require __DIR__."/../api.php";

class Comments extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $req = $this->getRequest();

        if(empty($req)) return $this->formatResponse(false, ['msg' => "No data was parsed"]);

        $this->conn = $this->getDbConn();

        //$comment_id = $this->getRequestValues(['comment_id', 'comment-id', 'commentId'], $req);
        $product_id = $this->getRequestValues(['product_id', 'product-id', 'productId'], $req);
    
        if (isset($product_id) && !empty($product_id))
        {
            $stmt = $this->conn->prepare("");

            $stmt->bindParam(":comment_id", $comment_id);
            $stmt->execute();
        }
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if($stmt->rowCount() > 0)
            return $this->formatResponse(true, $result); 
        else
            return $this->formatResponse(false, ['msg' => "No data found"]);
            
    }

}