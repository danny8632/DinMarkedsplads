<?php

require __DIR__. "/../includes/db.php";

class Api extends DB {

    private $req;

    function __construct() {

        $this->req[0] = $_SERVER['REQUEST_METHOD'];

        if(!empty($_REQUEST))
        {
            $this->req[1] = $_REQUEST;

            if(isset($_REQUEST['method']) && !empty($_REQUEST['method']))
            {
                if(method_exists($this, $_REQUEST['method']))
                {
                    $method = $_REQUEST['method'];
                    $this->$method();
                }
            }
            else if($this->req[0] == "get" || $this->req[0] == "GET")
            {
                if(method_exists($this, '_GET'))
                    $this->_GET();
            }
            else if($this->req[0] == "post" || $this->req[0] == "POST")
            {
                if(method_exists($this, '_POST'))
                    $this->_POST();
            }
        }
        else
        {
            if($this->req[0] == "get" || $this->req[0] == "GET")
            {
                if(method_exists($this, '_GET'))
                    $this->_GET();
            }
            else if($this->req[0] == "post" || $this->req[0] == "POST")
            {
                if(method_exists($this, '_POST'))
                    $this->_POST();
            }
        }

    }

    public function getRequest()
    {
        return $this->req;
    }

    public function getDbConn()
    {
        $db = DB::getInstance();
        return $db->getConnection();
        
    }

    public function formatResponse($success = true, $data = "")
    {
        echo json_encode(array(
            "success" => $success,
            "data" => $data
        ));
        return;
    }

    
    /**
     * Gets value from request by keys in array
     */
    public function getRequestValues($arr = [], $req = "")
    {
        $val = false;

        if(!empty($arr) && !empty($req))
        {
            for ($i=0; $i < count($arr); $i++) { 
             
                if(isset($req[$arr[$i]]))
                {
                    $val = $req[$arr[$i]];
                    break;
                }
            }
        }

        return $val;
    }

}


?>