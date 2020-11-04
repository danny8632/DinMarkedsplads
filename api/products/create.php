<?php

require __DIR__."/../api.php";

session_start();

class Create extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _POST() 
    {
        $req = $this->getRequest();

        //  Fetch variables
        $title       = $this->getRequestValues(['title', 'header', 'Title'], $req);
        $pice        = $this->getRequestValues(['price', 'beløb', 'amount'], $req);
        $description = $this->getRequestValues(['description', 'beskrivelse', 'Description'], $req);
        $address     = $this->getRequestValues(['address', 'addresse', 'adresse', 'location'], $req);
        $zipcode     = $this->getRequestValues(['zipcode', 'postnr', 'post_nr'], $req);
        $region      = $this->getRequestValues(['region', 'Region', 'område'], $req);
        $category    = $this->getRequestValues(['category'], $req);
        $files       = $this->getRequestValues(['files', 'images', 'file', "files[]"], $_FILES);
        $status      = "A";
        $token       = bin2hex(openssl_random_pseudo_bytes(16));

        $files_path = [];

        if($title == false || $pice == false || $description == false || $address == false || $zipcode == false || $region == false || $files == false || !isset($_SESSION["user_id"]))
            return $this->formatResponse(false, "something is not being parsed");

        if(is_string($category)) $category = [$category];

        $path = __DIR__.DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."assets".DIRECTORY_SEPARATOR."fileupload".DIRECTORY_SEPARATOR;

        if(is_dir($path) === false)
        {
            mkdir($path, 0777, true);
        }

        for ($i=0; $i < count($files['name']); $i++) {

            $file_name = date("Y-m-d_H_i_s") . "_" . basename($files["name"][$i]);

            $file_path = $path . $file_name;

            $db_file_path = implode(DIRECTORY_SEPARATOR, ["assets", "fileupload", $file_name]);

            if(move_uploaded_file($files["tmp_name"][$i], $file_path)) array_push($files_path, $db_file_path);
        }

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("INSERT INTO `products`(`userId`, `title`, `description`, `price`, `status`, `address`, `zipcode`, `region`, `verifyKey`) VALUES (:userid, :title, :description, :price, :status, :address, :zipcode, :region, :verifyKey);");
        $stmt->bindParam(':userid', $_SESSION["user_id"]);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $pice);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':zipcode', $zipcode);
        $stmt->bindParam(':region', $region);
        $stmt->bindParam(':verifyKey', $token);

        $stmt->execute();
        $id = $this->conn->lastInsertId();

        if($stmt->rowCount() === 0)  return $this->formatResponse(false, ['msg' => "something went wrong with adding user", 'stmt' => $stmt]);

        for ($i=0; $i < count($files_path); $i++) { 
            
            $stmt = $this->conn->prepare("INSERT INTO `productassets`(`productId`, `location`, `status`) VALUES (:pid, :location, :status);");
            $stmt->bindParam(':pid', $id);
            $stmt->bindParam(':location', $files_path[$i]);
            $stmt->bindParam(':status', $status);
            $stmt->execute();
        }

        for ($i=0; $i < count($category); $i++) { 
            
            $stmt = $this->conn->prepare("INSERT INTO `productcategories`(`productId`, `categoryId`) VALUES (:prodid, :catid);");
            $stmt->bindParam(':prodid', $id);
            $stmt->bindParam(':catid', $category[$i]);
            $stmt->execute();

        }

        $this->formatResponse(true, ['msg' => "product is now created", "id" => $id]);
    }
}   