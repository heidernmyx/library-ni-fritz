<?php
// users.php

header('Content-Type: application/json'); // Set response type to JSON


require_once 'config.php';

class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function register($data) {
        // Extract and sanitize input data
        $name = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $roleId = isset($data['role_id']) ? (int)$data['role_id'] : null; // Ensure it's an integer
        // Basic validation
        if (empty($name) || empty($email) || empty($password) || empty($roleId)) {
            http_response_code(400); // Bad Request
            echo json_encode(['success' => false, 'message' => 'Name, email, password, and role_id are required.']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
            exit;
        }
        // Validate the provided role_id
        if (!$this->isValidRoleId($roleId)) {
            http_response_code(400); // Bad Request
            echo json_encode(['success' => false, 'message' => 'Invalid role_id provided.']);
            exit;
        }
        try {
            // Check if email already exists in contacts
            $stmt = $this->pdo->prepare("SELECT * FROM contacts WHERE Email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(409); // Conflict
                echo json_encode(['success' => false, 'message' => 'Email already exists.']);
                exit;
            }
            // Begin transaction
            $this->pdo->beginTransaction();
            // Insert into contacts
            $stmt = $this->pdo->prepare("INSERT INTO contacts (Phone, Email) VALUES (?, ?)");
            $stmt->execute([$phone, $email]);
            $contactId = $this->pdo->lastInsertId();
            // Hash the password. PASSWORD_DEFAULT ang gi gamit para sa php rata mag hash
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            // Insert into users with the provided role_id
            $stmt = $this->pdo->prepare("INSERT INTO users (Name, PasswordHash, RoleID, ContactID) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $passwordHash, $roleId, $contactId]);
            $userId = $this->pdo->lastInsertId();
            // Commit transaction
            $this->pdo->commit();
            // Respond with success
            http_response_code(201); // Created
            echo json_encode(['success' => true, 'message' => 'User registered successfully.', 'user_id' => $userId]);
        } catch (\PDOException $e) {
            // Rollback transaction on error
            $this->pdo->rollBack();
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Registration failed.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Validate if the provided role_id exists in the user_roles table.
     *
     * @param int $roleId The role ID to validate
     * @return bool True if valid, False otherwise
     */
    private function isValidRoleId($roleId) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM user_roles WHERE RoleID = ?");
            $stmt->execute([$roleId]);
            return $stmt->fetch() ? true : false;
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Log in a user.
     *
     * @param array $data Associative array containing 'email' and 'password'
     * @return void Outputs JSON response and exits
     */
    public function login($data) {
        // Extract and sanitize input data
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        // Basic validation
        if (empty($email) || empty($password)) {
            http_response_code(400); // Bad Request
            echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
            exit;
        }

        try {
            // Retrieve user information by joining users and contacts tables
            $stmt = $this->pdo->prepare("
                SELECT users.UserID, users.Name, users.PasswordHash, users.RoleID, user_roles.RoleName
                FROM users
                JOIN contacts ON users.ContactID = contacts.ContactID
                JOIN user_roles ON users.RoleID = user_roles.RoleID
                WHERE contacts.Email = ?
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(401); // Unauthorized
                echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
                exit;
            }

            // Verify the password
            // Diri e 'translate' or more specifically, decrypt ,ni php ang password from the frontend 
	          // ang password_verify mao na ang decryption function
            if (!password_verify($password, $user['PasswordHash'])) {
                http_response_code(401); // Unauthorized
                echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
                exit;
            }

            // Return the user data (excluding sensitive information... password)
            echo json_encode([
                'success' => true,
                'message' => 'Login successful.',
                'user' => [
                    'user_id' => $user['UserID'],
                    'name' => $user['Name'],
                    'role' => $user['RoleName']
                ]
            ]);
        } catch (\PDOException $e) {
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Login failed.', 'error' => $e->getMessage()]);
        }
    }
}

// Retrieve the request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Only accept POST requests for both actions
//ps. May add PATCH or PUT method Later on if need natag update Functions
if ($method !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

// Get the raw POST data 
// Dili mo gana ang POST method usahay maong need ang raw data 
$input = json_decode(file_get_contents('php://input'), true);

// Instantiate the User class
$user = new User($pdo);
//Diri sa switch gina pasa nato ang raw data from the frontend ($input)
switch ($action) {
    case 'register':
        $user->register($input);
        break;
    case 'login':
        $user->login($input);
        break;
    default:
        http_response_code(400); // Bad Request
        echo json_encode(['success' => false, 'message' => 'Invalid action specified.']);
        break;
}
?>