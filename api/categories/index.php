<?php
// TODO: Get post/product by price or product name. Should this be under post/index.php or here? (categories/index.php)
require __DIR__."/../api.php";

session_start();

class Categories extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function _GET() 
    {
        $req = $this->getRequest();

        if(empty($req)) return $this->formatResponse(false, ['msg' => "No data was parsed"]);

        $this->conn = $this->getDbConn();

        $product_id    = $this->getRequestValues(['product_id', 'product-id', 'productId'], $req);
        $product_name  = $this->getRequestValues(['product_name', 'product-name', 'productName'], $req);
        $category_id   = $this->getRequestValues(['category_id', 'category-id', 'categoryId'], $req);
        $category_name = $this->getRequestValues(['category_name', 'category-name', 'categoryName'], $req);
       
        if(isset($product_id) && !empty($product_id) && isset($category_id) && !empty($category_id))
        {
            // Get products by category id
            $stmt = $this->conn->prepare("SELECT userId, title, description, address, price, status FROM products INNER JOIN productcategories ON products.id = productcategories.id INNER JOIN categories ON productcategories.categoryId = categories.id WHERE productcategories.categoryId = :id");
            $stmt->bindParam(":id", $category_id);
            $stmt->execute();

            if($stmt->rowCount() <= 0) // If no products found with in this category (?)
                return $this->formatResponse(true, ['msg' => "no products found in this category"]);
        }
        else if(isset($product_name) && !empty($product_name))
        {
            // Get products by name (should be moved?)
            $stmt = $this->conn->prepare("SELECT userId, title, description, address, price, status FROM products INNER JOIN productcategories ON products.id = productcategories.id INNER JOIN categories ON productcategories.categoryId = categories.id WHERE products.title LIKE ':name%'");
            $stmt->bindParam(":name", $product_name);
            $stmt->execute();

            
            if($stmt->rowCount() <= 0)
                return $this->formatResponse(true, ['msg' => "no products found with this name"]);
        }
        else
        {
            $stmt = $this->conn->prepare("SELECT * FROM categories");
            $stmt->execute();
        }
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode($result);
    }


    function getPost()
    {
        $id;
        $category;

        $req = $this->getRequest();

        $this->conn = $this->getDbConn();

        if(isset($req[1]) && !empty($req[1]))
        {
            $req = $req[1];
            if(isset($req['id'])) $id = $req['id'];
            if(isset($req['category_id'])) $id = $req['category_id'];
            if(isset($req['category'])) $category = $req['category'];
            if(isset($req['name'])) $category = $req['name'];
            if(isset($req['category_name'])) $category = $req['category_name'];
        }

        if(isset($id) && !empty($id))
        {
            //$stmt = $this->conn->prepare("SELECT posts.id, posts.title, posts.description, posts.file, posts.userID, users.name as name, users.username as username, posts.created, SUM(postvotes.vote = 'Upvote' AND postvotes.vote IS NOT NULL) AS 'UpVotes', SUM(postvotes.vote = 'Downvote' AND postvotes.vote IS NOT NULL) AS 'DownVotes', SUM(CASE WHEN postvotes.vote IS NOT NULL THEN IF(postvotes.vote = 'Upvote', 1, -1) END) AS `TotalVotes` FROM posts LEFT JOIN postvotes on posts.id = postvotes.postID LEFT JOIN users on posts.userID = users.id WHERE posts.id IN (SELECT postID FROM `postCategoryRelation` WHERE `categoryID` = :id) GROUP BY posts.id, postvotes.postID");
            $stmt = $this->conn->prepare("SELECT products.id, products.userId, products.title, products.description, products.price, products.address, products.zipcode, products.region");
            $stmt->bindParam(":id", $id);
            $stmt->execute();
        }
        else if(isset($category) && !empty($category))
        {
            $stmt = $this->conn->prepare("SELECT posts.id, posts.title, posts.description, posts.file, posts.userID, users.name as name, users.username as username, posts.created, SUM(postvotes.vote = 'Upvote' AND postvotes.vote IS NOT NULL) AS 'UpVotes', SUM(postvotes.vote = 'Downvote' AND postvotes.vote IS NOT NULL) AS 'DownVotes', SUM(CASE WHEN postvotes.vote IS NOT NULL THEN IF(postvotes.vote = 'Upvote', 1, -1) END) AS `TotalVotes` FROM posts LEFT JOIN postvotes on posts.id = postvotes.postID LEFT JOIN users on posts.userID = users.id WHERE posts.id IN (SELECT postID FROM `postCategoryRelation` WHERE `categoryID` = (SELECT categories.id FROM categories WHERE category = :category)) GROUP BY posts.id, postvotes.postID");
            $stmt->bindParam(":category", $category);
            $stmt->execute();
        }

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode($result);

    }

    function _POST()
    {
        $req = $this->getRequest()[1];
        $this->conn = $this->getDbConn();

        if(empty($req) || !isset($req['category']) || empty($req['category']))
            return true;

        $category = trim($req['category']);
        $description = (isset($req['description']) && !empty($req['description']))?trim($req['description']):null;


        if(isset($_FILES) && !empty($_FILES) && isset($_FILES["fileToUpload"]) && !empty($_FILES["fileToUpload"]))
        {
            $target_file = "sites/categories/images/" . date("Y-m-d_H:i:s") . "_" . basename($_FILES["fileToUpload"]["name"]);
    
            $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
            
            // Allow certain file formats
            if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
            && $imageFileType != "gif" && $imageFileType != "mp3" && $imageFileType != "mp4") {
                echo json_encode(array(
                    "success" => false,
                    "message" => "Sorry, only JPG, JPEG, PNG, GIF, MP3 & MP4 files are allowed."
                ));
                return true;
            }


            // Uploads file
            if(move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file) == false) 
            {
                echo "File upload failed";
                return true;
            }
        }
        else
        {
            $target_file = null;
        }

        $stmt = $this->conn->prepare("INSERT INTO categories (category, file, description) VALUES (:title, :file, :description)");
        $stmt->bindParam(':title', $category, PDO::PARAM_STR);
        $stmt->bindParam(':file', $target_file, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            echo "Record created";
        } else {
            echo "WONG";
        }
    }
}