<?php

require __DIR__."/../api.php";

session_start();

class Myproducts extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }


    function _GET() {

        if(!isset($_SESSION["user_id"])) return $this->formatResponse(false, "You need to be logged in");

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("SELECT 
            product.id, 
            product.userId, 
            product.title, 
            product.description, 
            product.address, 
            product.price, 
            product.status, 
            product.created,
            product.zipcode,
            product.region,
            GROUP_CONCAT(categories.categoryId) AS categories
        FROM 
            products AS product 
        INNER JOIN 
            productcategories AS categories ON product.id = categories.productId 
        WHERE 
            product.userId = :userid AND product.status = 'A'
        GROUP BY 
            product.id;
        ");
        
        $stmt->bindParam(':userid', $_SESSION["user_id"]);
        $stmt->execute();
        
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $data = [];

        for ($i=0; $i < count($result); $i++) { 
            $product = $result[$i];
            $product['categories'] = array_map('intval', explode(",", $product['categories']));

            $product['assets'] = $this->get_assets($product['id']);

            array_push($data, $product);
        }

        return $this->formatResponse(true, $data);
    }


    function get_assets($id) {

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("SELECT * FROM `productassets` WHERE `productId` = :id AND `status` = 'A';");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }


    function delete_assets($id) {

        $this->conn = $this->getDbConn();

        $stmt = $this->conn->prepare("UPDATE `productassets` SET `status`='D' WHERE `id` = :id;");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
    }


    function upload_assets($id, $files) {

        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("INSERT INTO `productassets`(`productId`, `location`, `status`) VALUES (:id, :location, :status);");

        $status = "A";
        $path = __DIR__.DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."assets".DIRECTORY_SEPARATOR."fileupload".DIRECTORY_SEPARATOR;

        if(is_dir($path) === false)
        {
            mkdir($path, 0777, true);
        }

        for ($i=0; $i < count($files['name']); $i++) {

            $file_name = date("Y-m-d_H_i_s") . "_" . basename($files["name"][$i]);

            $file_path = $path . $file_name;

            $db_file_path = implode(DIRECTORY_SEPARATOR, ["assets", "fileupload", $file_name]);

            if(move_uploaded_file($files["tmp_name"][$i], $file_path))
            {
                $stmt->bindParam(':id', $id);
                $stmt->bindParam(':location', $db_file_path);
                $stmt->bindParam(':status', $status);
                $stmt->execute();
            }
        }
    }

    function _UPDATE() {

        $req = $this->getRequest();

        $this->conn = $this->getDbConn();

        $sql = "UPDATE `products` SET ";

        $data = [
            'id'          => $this->getRequestValues(['id', 'product_id', 'pid'], $req),
            'title'       => $this->getRequestValues(['title', 'header', 'Title'], $req),
            'price'        => $this->getRequestValues(['price', 'beløb', 'amount'], $req),
            'description' => $this->getRequestValues(['description', 'beskrivelse', 'Description'], $req),
            'address'     => $this->getRequestValues(['address', 'addresse', 'adresse', 'location'], $req),
            'zipcode'     => $this->getRequestValues(['zipcode', 'postnr', 'post_nr'], $req),
            'region'      => $this->getRequestValues(['region', 'Region', 'område'], $req),
            'status'      => $this->getRequestValues(['status'], $req)
        ];

        $category           = $this->getRequestValues(['category'], $req);
        $delete_assets_arr  = $this->getRequestValues(['delete_assets'], $req);
        $files              = $this->getRequestValues(['files', 'images', 'file', "files[]"], $_FILES);

        $prep_data = [];

        $update_stmt = [];

        foreach ($data as $key => $value) {

            if($value === false) continue;

            if($key == "id")
            {
                $prep_data[":$key"] = $value;
                continue;
            }

            array_push($update_stmt, "$key=:$key");

            $prep_data[":$key"] = $value;
        }

        $sql .= implode(", ", $update_stmt) . " WHERE `id` = :id;";

        if(!empty($prep_data) && count($prep_data) > 1)
        {
            $stmt = $this->conn->prepare($sql);
    
            foreach ($prep_data as $key => &$value) {
                $stmt->bindParam($key, $value);
            }

            $stmt->execute();
        }

        if($category !== false)
        {
            $stmt = $this->conn->prepare("UPDATE `productcategories` SET `categoryId`=:categoryId WHERE `productId` = :id;");
            $stmt->bindParam(":categoryId", $category);
            $stmt->bindParam(":id", $data['id']);
            $stmt->execute();
        }

        if($delete_assets_arr !== false)
        {
            $delete_assets_arr = explode(",", $delete_assets_arr);            

            for ($i=0; $i < count($delete_assets_arr); $i++) { 
                $this->delete_assets($delete_assets_arr[$i]);
            }
        }

        if($files !== false)
        {
            $this->upload_assets($data['id'], $files);
        }

        $stmt = $this->conn->prepare("SELECT 
                product.id, 
                product.userId, 
                product.title, 
                product.description, 
                product.address, 
                product.price, 
                product.status, 
                product.created,
                product.zipcode,
                product.region,
                GROUP_CONCAT(assets.location) AS location,
                GROUP_CONCAT(categories.categoryId) AS categories
            FROM 
                products AS product 
            INNER JOIN 
                productassets AS assets ON product.id = assets.productId
            INNER JOIN 
                productcategories AS categories ON product.id = categories.productId 
            WHERE 
                product.id = :id AND product.status = 'A'
            GROUP BY 
            product.id
            LIMIT 1;
        ");
        $stmt->bindParam(":id", $data['id']);
        $stmt->execute();

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        $result['categories'] = array_map('intval', explode(",", $result['categories']));
        $result['assets'] = $this->get_assets($data['id']);

        return $this->formatResponse(true, $result);
    }

    function deleteproduct() {

        $req = $this->getRequest();
        $this->conn = $this->getDbConn();
        $id = $this->getRequestValues(['id', 'product_id', 'pid'], $req);

        if(!isset($_SESSION['user_id'])) return $this->formatResponse(false, ['msg' => "You cannot delete a post that is not yours"]);

        $stmt = $this->conn->prepare("SELECT id, userId FROM products WHERE id = :id LIMIT 1;");
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        if($result['userId'] != $_SESSION['user_id']) return $this->formatResponse(false, ['msg' => "You cannot delete a post that is not yours"]);

        $status = "D";

        $stmt = $this->conn->prepare("UPDATE `products` SET `status`=:status WHERE id = :id");
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":status", $status);
        $stmt->execute();

        return $this->formatResponse(true, ['id' => $id]);
    }


}



?>