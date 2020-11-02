<?php

require __DIR__."/../api.php";

class Example extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("");
        $stmt->execute();

        $result = $stmt->setFetchMode(PDO::FETCH_ASSOC);


        echo json_encode($stmt->fetchAll());

    }


    function getToken($product_id) {
        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `verifyKey` FROM `products` WHERE `id` = :product_id LIMIT 1");
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();

        return $stmt->fetchColumn(); 
    }

    function verifyOrderCompletion()
    {
        $token = $this->getRequestValues(['id', 'key', 'token'], $req);
        $stmt = $this->conn->prepare("UPDATE products SET status = 'S' WHERE products.verifyKey = :key AND");
        $stmt->bindParam(':key', $token);
        $stmt->execute();
    }

    function sendOrderCompletion() {
        $req = $this->getRequest();
        $email = $this->getRequestValues(['email', 'e_mail', 'mail'], $req);
        $product_id = $this->getRequestValues(['product-id', 'product_id', 'productId'], $req);

        
        if($email == false || $product_id == false)
            return $this->formatResponse(false, ['msg' => "email or product-id not set"]);

        $token = $this->getToken($product_id);
        $subject = "Verificer dit køb på DinMarkedsplads";
        $message = "Du har købt produktet: http://".$_SERVER['HTTP_HOST']."/product/id=" . $product_id . "<br>
                    Når du har modtaget produktet korrekt bedes du følge nedenstående link: http://".$_SERVER['HTTP_HOST']."/api_v1/user?method=verifyOrderCompletion&id=" . $token;
        $headers = "From: dinmarkedspladsnoreply";

        mail($email,$subject,$message,[$headers]);

        return $this->formatResponse(true);
    }

}