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
        $title = $this->getRequestValues(['title', 'header', 'Title'], $req);
        $pice = $this->getRequestValues(['price', 'beløb', 'amount'], $req);
        $description = $this->getRequestValues(['description', 'beskrivelse', 'Description'], $req);
        $address = $this->getRequestValues(['address', 'addresse', 'adresse', 'location'], $req);
        $zipcode = $this->getRequestValues(['zipcode', 'postnr', 'post_nr'], $req);
        $region = $this->getRequestValues(['region', 'Region', 'område'], $req);
        $files = $this->getRequestValues(['files', 'images', 'file', "files[]"], $_FILES);
        $status = "A";

        $files_path = [];

        if($title == false || $pice == false || $description == false || $address == false || $zipcode == false || $region == false || $files == false || !isset($_SESSION["user_id"]))
            return $this->formatResponse(false, "something is not being parsed");


        for ($i=0; $i < count($files['name']); $i++) {

            $path = "assets/fileupload/" . date("Y-m-d_H:i:s") . "_" . basename($files["name"][$i]);

            if(move_uploaded_file($files["tmp_name"][$i], $path)) array_push($files_path, $path);   
        }

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("INSERT INTO `Products`(`userId`, `title`, `description`, `price`, `status`, `address`, `zipcode`, `region`) VALUES (:userid, :title, :description, :price, :status, :address, :zipcode, :region);");
        $stmt->bindParam(':userid', $_SESSION["user_id"]);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $pice);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':zipcode', $zipcode);
        $stmt->bindParam(':region', $region);
        $stmt->execute();
        $id = $this->conn->lastInsertId();

        if($stmt->rowCount() === 0)  return $this->formatResponse(false, ['msg' => "something went wrong with adding user", 'stmt' => $stmt]);

        for ($i=0; $i < count($files_path); $i++) { 
            
            $stmt = $this->conn->prepare("INSERT INTO `ProductAssets`(`productId`, `location`, `status`) VALUES (:pid, :location, :status);");
            $stmt->bindParam(':pid', $id);
            $stmt->bindParam(':location', $files_path[$i]);
            $stmt->bindParam(':status', $status);
            $stmt->execute();
        }

        $this->formatResponse(true, ['msg' => "product is now created", "id" => $id]);
    }
}   