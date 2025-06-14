<?php
/**
 * Database Connection and Utility Functions
 * Handles database connections and common database operations
 */

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
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
    
    /**
     * Execute a SELECT query and return results
     */
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
    
    /**
     * Execute a SELECT query and return single row
     */
    public function selectOne($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Database select error: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }
    
    /**
     * Execute an INSERT query and return last insert ID
     */
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
    
    /**
     * Execute an UPDATE query and return affected rows
     */
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
    
    /**
     * Execute a DELETE query and return affected rows
     */
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
    
    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollback();
    }
    
    /**
     * Get paginated results
     */
    public function paginate($query, $params = [], $page = 1, $perPage = DEFAULT_PAGE_SIZE) {
        $page = max(1, intval($page));
        $perPage = min(MAX_PAGE_SIZE, max(1, intval($perPage)));
        $offset = ($page - 1) * $perPage;
        
        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM (" . $query . ") as count_table";
        $totalResult = $this->selectOne($countQuery, $params);
        $total = $totalResult['total'];
        
        // Get paginated results
        $paginatedQuery = $query . " LIMIT " . $perPage . " OFFSET " . $offset;
        $data = $this->select($paginatedQuery, $params);
        
        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage),
                'has_next' => $page < ceil($total / $perPage),
                'has_prev' => $page > 1
            ]
        ];
    }
}

/**
 * Get database instance
 */
function getDB() {
    return Database::getInstance();
}

/**
 * Execute database query with error handling
 */
function dbQuery($query, $params = []) {
    return getDB()->select($query, $params);
}

/**
 * Get single row from database
 */
function dbQueryOne($query, $params = []) {
    return getDB()->selectOne($query, $params);
}

/**
 * Insert data into database
 */
function dbInsert($query, $params = []) {
    return getDB()->insert($query, $params);
}

/**
 * Update data in database
 */
function dbUpdate($query, $params = []) {
    return getDB()->update($query, $params);
}

/**
 * Delete data from database
 */
function dbDelete($query, $params = []) {
    return getDB()->delete($query, $params);
}
?>

