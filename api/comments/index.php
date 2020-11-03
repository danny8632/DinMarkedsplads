<?php
session_start();
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
        $product_id = $this->getRequestValues(['product_id', 'product-id', 'productId', 'id'], $req);
    
        if (isset($product_id) && !empty($product_id))
        {
            $stmt = $this->conn->prepare("SELECT comments.id, comments.productId, comments.userId, comments.comment, comments.created, users.username FROM comments
            INNER JOIN users ON comments.userId = users.id WHERE productId = :id");

            $stmt->bindParam(":id", $product_id);
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

        $user_id = $_SESSION["user_id"];
        $product_id = $this->getRequestValues(['product_id', 'product-id', 'productId'], $req);
        $comment = $this->getRequestValues(['comment', 'txt', 'text', 'message'], $req);

        if ($product_id == false || $user_id == false || $comment == false)
            return $this->formatResponse(false, [$user_id, $product_id, $comment]);

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("INSERT INTO `comments`(`userId`, `productId`, `comment`) VALUES (:user_id, :product_id, :comment)");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->bindParam(':comment', $comment);

        $stmt->execute();
    }

}