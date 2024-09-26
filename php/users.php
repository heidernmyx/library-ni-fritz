<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');

class Users {
  function getUser($json) {
    include '../php/connection/connection.php';

    $sql = 'SELECT
        `UserID`,
        `Name`,
        `ContactInfo`,
        `UserType`,
        `Email`
    FROM
        `user`
    WHERE
        Email = :email AND Password = :password';

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $json['email'], PDO::PARAM_STR);
    $stmt->bindParam(':password', $json['password'], PDO::PARAM_STR);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    unset($conn);
    unset($stmt);
    echo json_encode($result);
  }

}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  $operation = $_GET['operation'];
  $json = isset($_GET['json']) ? json_decode($_GET['json'], true) : null;
}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $operation = $_POST['operation'];
  $json = isset($_POST['json']) ? json_decode($_POST['json'], true) : null;
}

$user = new Users();
switch ($operation) {
  case "getUser": 
    $user->getUser($json);
    break;
  case "addUser":

    break;
}

