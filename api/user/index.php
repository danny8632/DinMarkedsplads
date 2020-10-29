<?php

session_start();

require __DIR__."/../api.php";

class User extends Api {

    private $conn;

    function __construct() {

        parent::__construct();

    }

    //  TODO: Add email functionality
    function signUp() {

        $req = $this->getRequest();

        $email    = $this->getRequestValues(['email', 'e_mail', 'mail'], $req);
        $password = $this->getRequestValues(['password', 'pwd'], $req);
        $username = $this->getRequestValues(['username', 'uname', 'name'], $req);
        $verify   = 1;

        if($email == false || $password == false || $username == false)
            return $this->formatResponse(false, ['msg' => "email, password, username is not set"]);

        $password = password_hash($password, PASSWORD_DEFAULT);


        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT * FROM `users` WHERE `username` = :username OR `email` = :email;");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) return $this->formatResponse(false, ['msg' => "email, password, username is not set"]);


        $stmt = $this->conn->prepare("INSERT INTO `users`(`email`, `password`, `username`, `isVerified`) VALUES (:email, :password, :username, :isVerified);");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':isVerified', $verify);
        $stmt->execute();

        if($stmt->rowCount() > 0) 
            return $this->formatResponse(true, ['msg' => "user has ben created"]);
        else
            return $this->formatResponse(false, ['msg' => "something went wrong with adding user", 'stmt' => $stmt]);
    }


    function login() {

        $req = $this->getRequest();

        $username = $this->getRequestValues(['username', 'uname', 'name'], $req);
        $password = $this->getRequestValues(['password', 'pwd'], $req);

        if($password == false || $username == false) return $this->formatResponse(false, ['msg' => "password or username is not set"]);

            
        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `id`, `email`, `password`, `username`, `isVerified` FROM `users` WHERE `username` = :username LIMIT 1");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if($stmt->rowCount() == 0) return $this->formatResponse(false, ['msg' => "User does not exists"]);


        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];
        if(password_verify($password, $result['password']))
        {
            if($result['isVerified'] == 0) return $this->formatResponse(false, ['msg' => "User not activated"]);

            $_SESSION["user_id"] = $result['id'];
            $_SESSION['username'] = $result['username'];
            $_SESSION['useremail'] = $result['email'];

            return $this->formatResponse(true);
        }
        else
        {
            return $this->formatResponse(false, ['msg' => "User details not correct"]);
        }
    }

    function logout() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        header("Location: ./../");
    }

    function getUserInfo() {
        
        $req = $this->getRequest();

        $userid = $this->getRequestValues(['id', 'user_id', 'uid', 'userid', 'userId', 'userID'], $req);

        if($userid == false) return $this->formatResponse(false, ['msg' => "userid is not set"]);

        $this->conn = $this->getDbConn();
        $stmt = $this->conn->prepare("SELECT `fname`, `lname`, `phone`, `address`, `zipcode`, `region` FROM `userdetails` WHERE `userId` = :userid;");
        $stmt->bindParam(':userid', $userid);
        $stmt->execute();
        
        if($stmt->rowCount() == 0) return $this->formatResponse(false, ["msg" => "User does not exists"]);

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC)[0];

        return $this->formatResponse(true, $result);
    }
}