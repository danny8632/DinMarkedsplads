<?php

require __DIR__."/../api.php";

class Sell extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $this->conn = $this->getDbConn();


        $req = $this->getRequest();
        $uname = $this->getRequestValues(['uname', 'username'], $req);
        $ids = $this->getRequestValues(['ids', 'id', 'user_id'], $req);
        $where = "";

        if($ids != false)
        {
            $ids = array_map("intval", explode(",", $ids));
            $in  = str_repeat('?,', count($ids) - 1) . '?';
            $where = "AND `id` NOT IN ($in)";
        }




        $uname = "$uname%";

        $stmt = $this->conn->prepare("SELECT id, username FROM `users` WHERE `username` LIKE ?$where;");


        if($ids != false) 
        {
            $stmt->execute(array_merge([$uname], $ids));
        }
        else
        {
            $stmt->execute([$uname]);
        }

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $this->formatResponse(true, $result);
    }


    function getToken($product_id) {
        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `verifyKey` FROM `products` WHERE `id` = :product_id LIMIT 1");
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();

        return $stmt->fetchColumn(); 
    }

    function getUserEmail($id) {
        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `email` FROM `users` WHERE `id` = :id LIMIT 1");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetchColumn(); 
    }

    function verifyOrderCompletion()
    {
        $this->conn = $this->getDbConn();
        
        $req = $this->getRequest();
        $token = $this->getRequestValues(['id', 'key', 'token'], $req);
        $stmt = $this->conn->prepare("UPDATE products SET status = 'S' WHERE products.verifyKey = :key");
        $stmt->bindParam(':key', $token);
        $stmt->execute();
    }

    function sendOrderCompletion() {
        $req = $this->getRequest();
        
        $id = $this->getRequestValues(['id', 'userid', 'user_id'], $req);
        $product_id = $this->getRequestValues(['product-id', 'product_id', 'productId'], $req);

        if($id == false || $product_id == false) return $this->formatResponse(false, ['msg' => "email or product-id not set"]);

        $email = $this->getUserEmail($id);

        $token = $this->getToken($product_id);
        $subject = "Verificer dit køb på DinMarkedsplads";
        $message = "Du har købt produktet: http://".$_SERVER['HTTP_HOST']."/product/id=" . $product_id . "<br>
                    Når du har modtaget produktet korrekt bedes du følge nedenstående link: http://".$_SERVER['HTTP_HOST']."/api_v1/products/sell?method=verifyOrderCompletion&id=" . $token;
        $headers = "From: dinmarkedspladsnoreply";

        mail($email,$subject,$message,[$headers]);

        return $this->formatResponse(true);
    }

}