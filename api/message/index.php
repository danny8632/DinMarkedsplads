<?php

require __DIR__."/../api.php";

session_start();

class Message extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }


    function _GET()
    {
        $req = $this->getRequest();
        
        $this->conn = $this->getDbConn();

        $user_id = $_SESSION["user_id"];

        if ($user_id = false)
            return $this->formatResponse(false, $user_id);

        if(isset($req) && !empty($req))
        {
            // Get messages by userId
            $stmt = $this->conn->prepare("SELECT directmessages.id, directmessages.userId, directmessages.productId, directmessages.reciverId, directmessages.title, directmessages.message, directmessages.created FROM directmessages
            INNER JOIN users ON directmessages.userId = users.id
            WHERE directmessages.reciverId = :id");
            $stmt->bindParam(':id', $user_id);
            $stmt->execute();
        }
    }

    // Post direct message. Might need a function to get receiver_id somewhere
    function _POST()
    {
        $req = $this->getRequest();
        
        $user_id = $_SESSION["user_id"];
        $product_id  = $this->getRequestValues(['product_id', 'product-id', 'productId'], $req);
        $receiver_id = $this->getRequestValues(['receiver_id', 'receiver-id', 'receiverId'], $req);
        $text        = $this->getRequestValues(['txt', 'text', 'message', 'msg'], $req);

        if ($user_id == false || $receiver_id == false || $text == false)
            return $this->formatResponse(false, [$user_id, $receiver_id, $text]);

        $stmt = $this->conn->prepare("");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->bindParam(':receiver_id', $receiver_id);
        $stmt->bindParam(':text', $text);
        

        $stmt->execute();
    }

}