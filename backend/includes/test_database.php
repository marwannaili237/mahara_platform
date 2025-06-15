<?php
/**
 * Test Database Connection for SQLite
 */

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $this->connection = new PDO("sqlite:" . DB_NAME);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Create tables if they don't exist
            $this->createTables();
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    private function createTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            user_type VARCHAR(20) DEFAULT 'customer',
            phone VARCHAR(20),
            wilaya VARCHAR(100),
            city VARCHAR(100),
            preferred_language VARCHAR(5) DEFAULT 'ar',
            verification_token VARCHAR(255),
            is_verified BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            reset_token VARCHAR(255),
            reset_token_expires DATETIME,
            profile_image VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_ar VARCHAR(100) NOT NULL,
            name_fr VARCHAR(100),
            name_en VARCHAR(100),
            description_ar TEXT,
            description_fr TEXT,
            description_en TEXT,
            icon VARCHAR(100),
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2),
            price_type VARCHAR(20) DEFAULT 'fixed',
            duration INTEGER,
            location_type VARCHAR(20) DEFAULT 'provider',
            wilaya VARCHAR(100),
            city VARCHAR(100),
            address TEXT,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            is_active BOOLEAN DEFAULT 1,
            is_featured BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        ";
        
        $this->connection->exec($sql);
    }
    
    public function select($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Database select error: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    public function selectOne($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Database selectOne error: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    public function insert($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Database insert error: " . $e->getMessage());
            throw new Exception("Database insert failed");
        }
    }
    
    public function update($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Database update error: " . $e->getMessage());
            throw new Exception("Database update failed");
        }
    }
    
    public function delete($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Database delete error: " . $e->getMessage());
            throw new Exception("Database delete failed");
        }
    }
}

// Helper functions for database operations
function dbQuery($query, $params = []) {
    return Database::getInstance()->select($query, $params);
}

function dbQueryOne($query, $params = []) {
    return Database::getInstance()->selectOne($query, $params);
}

function dbInsert($query, $params = []) {
    return Database::getInstance()->insert($query, $params);
}

function dbUpdate($query, $params = []) {
    return Database::getInstance()->update($query, $params);
}

function dbDelete($query, $params = []) {
    return Database::getInstance()->delete($query, $params);
}
?>