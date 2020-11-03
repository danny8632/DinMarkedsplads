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


    function _POST()
    {
        $req = $this->getRequest();

        $user_id = $this->getRequestValues('user_id', 'user-id', 'userId', $req);
        $product_id = $this->getRequestValues(['product_id', 'product-id', 'productId'], $req);
        $comment = $this->getRequestValues(['comment', 'txt', 'text', 'message'], $req);

        if ($product_id == false || !isset($user_id) || $comment == false)
            return $this->formatResponse(false, "product-id, user-id or comment is missing");

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("INSERT INTO `comments`(`userId`, `productId`, `comment`) VALUES (:userid, :productId, :comment)");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $user_id);
        $stmt->bindParam(':comment', $comment);

        $stmt->execute();
    }

}