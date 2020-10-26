<?php

// TODO: Add email functionality

session_start();

require __DIR__."/../api.php";

class User extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    function signUp() {

        $req = $this->getRequest()[1];

        $email = false;
        foreach (['email', 'e_mail', 'mail'] as $key) {
            if(isset($req[$key])) $email = $req[$key];
        }

        $password = false;
        foreach (['password', 'pwd'] as $key) {
            if(isset($req[$key])) $password = $req[$key];
        }

        $username = false;
        foreach (['username', 'uname', 'name'] as $key) {
            if(isset($req[$key])) $username = $req[$key];
        }

        if($email == false || $password == false || $username == false)
            return $this->formatResponse(false, ['msg' => "email, password, username is not set"]);


        $password = password_hash($password, PASSWORD_DEFAULT);


        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT * FROM `users` WHERE `username` = :username OR `email` = :email");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        
        $stmt->execute();

        if($stmt->rowCount() > 0) return $this->formatResponse(false, ['msg' => "email, password, username is not set"]);


        $stmt = $this->conn->prepare("INSERT INTO `Users`(`email`, `password`, `username`) VALUES (:email, :password, :username)");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($stmt->rowCount() > 0) 
            return $this->formatResponse(true, ['msg' => "user has ben created"]);
        else
            return $this->formatResponse(false, ['msg' => "something went wrong with adding user", 'stmt' => $stmt]);
    }


    function login() {

        $req = $this->getRequest()[1];

        if(empty($req))
        {
            echo "Req empty";
            return;
        }

        $username = $req['username'];
        $password = $req['password'];

        if(empty($username) || empty($password))
        {
            echo json_encode($req);
            return;
        }

        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT * FROM `users` WHERE `username` = :username LIMIT 1");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($stmt->rowCount() == 0)
        {
            echo json_encode(array(
                "success" => false,
                "msg" => "User dosn't exists"
            ));
        }
        else
        {
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];
            if(password_verify($password, $result['password']))
            {
                $_SESSION["user_id"] = $result['id'];
                $_SESSION["user_name"] = $result['name'];
                $_SESSION['username'] = $result['username'];

                echo json_encode(array(
                    "id" => $result['id'],
                    'name' => $result['name']
                    )
                );
            }
            else
            {
                echo "wong";
            }
        }
    }

    function logout()
    {
        session_start();
        session_destroy();
        echo json_encode(array(
            "success" => true
        ));
        header("Location: ./../");
    }

    function getUserInfo()
    {
        $req = $this->getRequest();

        $user_id;

        if(isset($req[1]) && !empty($req[1]))
        {
            $req = $req[1];

            if(isset($req['user_id'])) $user_id = $req['user_id'];
        }


        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `users`.`id`, `users`.`username`, `users`.`created` FROM `users` WHERE `users`.`id` = :id");
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        echo json_encode($result);
    }
}