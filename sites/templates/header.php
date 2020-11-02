<?php
    session_start();
?>

<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">

        <!-- CSS -->
        <link rel="stylesheet" type="text/css" href="/sites/templates/header.css">
        <link rel="stylesheet" type="text/css" href="/sites/templates/css/fontsRoboto.css">
        <link rel="stylesheet" type="text/css" href="/assets/global_css/button.css">
        <link rel="stylesheet" type="text/css" href="/assets/global_css/modal.css">
        <link rel="stylesheet" type="text/css" href="/assets/global_css/global.css">

        <!-- JS -->
        <script type="text/javascript" src="/sites/templates/js/navbar.js" defer></script>
        <script type="text/javascript" src="/sites/templates/js/fontAwesome.js" defer></script>
        <script type="text/javascript" src="/sites/templates/js/jquery.min.js"></script>
        <script type="text/javascript" src="/assets/global_js/global.js"></script>
        <script type="text/javascript" src="/assets/global_js/api.js"></script>
        <script type="text/javascript" src="/sites/templates/js/posts_global.js"></script>
        <script type="text/javascript" src="/sites/templates/js/vote_global.js"></script>

        
        <?php

            foreach ($this->includeArr as $type => $val) {
                if($type == 'css')
                {
                    foreach ($val as $data) {
                        echo '<link rel="stylesheet" type="text/css" href="'.$data.'">';
                    }
                }
                else if($type == 'js')
                {
                    foreach ($val as $data) {
                        echo '<script type="text/javascript" src="'.$data.'"></script>';
                    }
                }
            }
        ?>

        <title>DinMarkedsplads</title>
    </head>

    <body>

    <div class="topnav" id="navbar">
        <a class="logo" href="/home"><img src="/assets/LOGO/logo_white.png"></a>
        <div class="nav-btn-wrapper">
            <div class="search">
                <form>
                    <input placeholder="Search..." type="text">
                </form>
            </div>
            <a href="/home">Hjem</a>

            <?php

                if(isset($_SESSION['user_id']))
                {
                    ?>
                        <a href="/upload">Sælg vare</a>
                        <div class="dropdown">
                            <button class="dropbtn">
                                <?=$_SESSION['username']?><i class="fa fa-caret-down"></i>
                            </button>
                            <div class="dropdown-content">
                            <!-- <a href="/user?id=<?=$_SESSION['user_id']?>">My Page</a>
                            <a href="/usersettings">Settings</a> -->
                            <a href="/api_v1/user?method=logout">Logout</a>
                            </div>
                        </div> 
                    <?php
                    
                }
                else
                {
                    echo '<a href="/login">Login</a>';
                }

            

            ?>

        </div>
        <a href="javascript:void(0);" style="font-size:17px;" class="icon" onclick="myFunction()">&#9776;</a>
    </div>