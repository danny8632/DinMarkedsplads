<?php
// TODO: Comments api - specification of user_id is no longer needed. Sum of upvotes/downvotes are also no longer required.
require __DIR__."/../api.php";

session_start();

class Message extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    // Get message(s). Should get message based on productId(buyer) or userId & productId (seller) 
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


    function updateComment() {

        $comment_id;
        $req;
        $text;

        if(isset($this->getRequest()[1]))
            $req = $this->getRequest()[1];
        else
        {
            echo json_encode(array(
                "success" => false,
                "message" => "U need to specify comment_id"
            ));
            return true;
        }

        $this->conn = $this->getDbConn();

        if(isset($req) && !empty($req))
        {
            if(isset($req['id'])) $comment_id = $req['id'];
            if(isset($req['comment_id'])) $comment_id = $req['comment_id'];
            if(isset($req['commentID'])) $comment_id = $req['commentID'];
            if(isset($req['text'])) $text = trim($req['text']);
            if(isset($req['comment'])) $text = trim($req['comment']);
        }


        $stmt = $this->conn->prepare("SELECT * FROM `comments` WHERE `id` = :id LIMIT 1");
        $stmt->bindParam(":id", $comment_id);
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        if(empty($comment_id) || !isset($_SESSION["user_id"]) || empty($_SESSION["user_id"]) || empty($text) || $_SESSION["user_id"] != $result['userID'])
        {
            echo json_encode(array(
                "success" => false,
                "message" => "Post or userid or text wasen't specified"
            ));
            return true;
        }

        $stmt = $this->conn->prepare("UPDATE `comments` SET `text`= :text WHERE `id` = :id");
        $stmt->bindParam(':text', $text, PDO::PARAM_STR);
        $stmt->bindParam(":id", $comment_id);
        
        if ($stmt->execute()) {
            echo "Comment was updated";
        } else {
            echo "WONG";
        }

    }

    function deleteComment() {

        $comment_id;
        $req;

        if(isset($this->getRequest()[1]))
            $req = $this->getRequest()[1];
        else
        {
            echo json_encode(array(
                "success" => false,
                "message" => "U need to specify comment_id"
            ));
            return true;
        }

        $this->conn = $this->getDbConn();

        if(isset($req) && !empty($req))
        {
            if(isset($req['id'])) $comment_id = $req['id'];
            if(isset($req['comment_id'])) $comment_id = $req['comment_id'];
            if(isset($req['commentID'])) $comment_id = $req['commentID'];
        }

        $stmt = $this->conn->prepare("SELECT * FROM `comments` WHERE `id` = :id LIMIT 1");
        $stmt->bindParam(":id", $comment_id);
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        if(empty($comment_id) || !isset($_SESSION["user_id"]) || empty($_SESSION["user_id"]) || $_SESSION["user_id"] != $result['userID'])
        {
            echo json_encode(array(
                "success" => false,
                "message" => "Post or userid wasen't specified"
            ));
            return true;
        }

        $stmt = $this->conn->prepare("DELETE FROM `comments` WHERE `id` = :id");
        $stmt->bindParam(':id', $comment_id, PDO::PARAM_INT);

        
        if ($stmt->execute()) {
            echo "Comment was deleted";
        } else {
            echo "WONG";
        }

    }

}