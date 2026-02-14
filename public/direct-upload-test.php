<?php
/**
 * Emergency Direct Upload and Database Test Script
 * This script bypasses Laravel to test direct database and file operations
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Increase memory and upload limits
ini_set('memory_limit', '256M');
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '40M');
ini_set('max_file_uploads', '20');
ini_set('max_execution_time', '300');

// HTML header
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Emergency Direct Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
        .code { font-family: monospace; background: #eee; padding: 2px 5px; }
        form { margin-bottom: 30px; }
        input, textarea, button { margin-bottom: 10px; padding: 8px; }
        input[type="file"] { border: 1px solid #ddd; }
        button { background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>Emergency Direct Upload Test</h1>
    <p>This tool bypasses Laravel to test database connections and file uploads directly.</p>
';

// Results container
$messages = [];
$errors = [];

// Test PHP configuration
$messages[] = "PHP Version: " . phpversion();
$messages[] = "upload_max_filesize: " . ini_get('upload_max_filesize');
$messages[] = "post_max_size: " . ini_get('post_max_size');
$messages[] = "max_file_uploads: " . ini_get('max_file_uploads');

// Ensure directories exist
$requiredDirs = [
    __DIR__ . '/../storage/app/public/uploads',
    __DIR__ . '/../storage/app/google_drive_fallback',
    __DIR__ . '/uploads'
];

foreach ($requiredDirs as $dir) {
    if (!file_exists($dir)) {
        if (mkdir($dir, 0755, true)) {
            $messages[] = "Created directory: $dir";
        } else {
            $errors[] = "Failed to create directory: $dir";
        }
    } else if (!is_writable($dir)) {
        if (@chmod($dir, 0755)) {
            $messages[] = "Fixed permissions for: $dir";
        } else {
            $errors[] = "Directory exists but is not writable: $dir";
        }
    } else {
        $messages[] = "Directory OK: $dir";
    }
}

// Create storage symlink if needed
if (!file_exists(__DIR__ . '/storage') && function_exists('symlink')) {
    try {
        if (symlink(__DIR__ . '/../storage/app/public', __DIR__ . '/storage')) {
            $messages[] = "Created storage symlink";
        } else {
            $errors[] = "Failed to create storage symlink";
        }
    } catch (Exception $e) {
        $errors[] = "Error creating symlink: " . $e->getMessage();
    }
}

// Try to load .env file
$dbConfig = [];

if (file_exists(__DIR__ . '/../.env')) {
    $envFile = file_get_contents(__DIR__ . '/../.env');
    $lines = explode("\n", $envFile);
    $env = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, '=') !== false && substr($line, 0, 1) !== '#') {
            list($key, $value) = explode('=', $line, 2);
            $env[trim($key)] = trim($value, "'\"");
        }
    }
    
    $dbConfig = [
        'connection' => $env['DB_CONNECTION'] ?? 'mysql',
        'host' => $env['DB_HOST'] ?? '127.0.0.1',
        'port' => $env['DB_PORT'] ?? '3306',
        'database' => $env['DB_DATABASE'] ?? 'umnfest',
        'username' => $env['DB_USERNAME'] ?? 'root',
        'password' => $env['DB_PASSWORD'] ?? '',
    ];
    
    $messages[] = "Loaded database configuration from .env";
} else {
    $errors[] = ".env file not found";
    $dbConfig = [
        'connection' => 'mysql',
        'host' => '127.0.0.1',
        'port' => '3306',
        'database' => 'umnfest',
        'username' => 'root',
        'password' => '',
    ];
}

// Test database connection
$dbConnected = false;
try {
    $dsn = "{$dbConfig['connection']}:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbConnected = true;
    
    $messages[] = "Database connection successful!";
    
    // Check tables
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $messages[] = "Tables found: " . implode(', ', $tables);
    
    // Check for media_files table
    if (in_array('media_files', $tables)) {
        $messages[] = "media_files table exists";
        
        // Check structure
        $stmt = $pdo->query('DESCRIBE media_files');
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $messages[] = "media_files columns: " . implode(', ', $columns);
        
        // Test insert
        $stmt = $pdo->prepare(
            "INSERT INTO media_files 
            (task_id, google_drive_id, file_name, original_name, mime_type, file_size, local_path, created_at, updated_at)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())"
        );
        
        $result = $stmt->execute([
            1, // Assuming task ID 1 exists
            'test_direct_' . time(),
            'test_direct.txt',
            'test_direct.txt',
            'text/plain',
            123,
            'test/direct_path'
        ]);
        
        if ($result) {
            $id = $pdo->lastInsertId();
            $messages[] = "Test database record created with ID: $id";
            
            // Clean up
            $pdo->exec("DELETE FROM media_files WHERE id = $id");
            $messages[] = "Test database record deleted successfully";
        } else {
            $errors[] = "Failed to insert test record";
        }
    } else {
        $errors[] = "media_files table does not exist";
    }
    
} catch (PDOException $e) {
    $errors[] = "Database connection failed: " . $e->getMessage();
}

// Process file upload if form submitted
$uploadResults = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['test_file'])) {
    $file = $_FILES['test_file'];
    
    if ($file['error'] === UPLOAD_ERR_OK) {
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
        $localPath = __DIR__ . '/uploads/' . $fileName;
        $storagePath = __DIR__ . '/../storage/app/public/uploads/' . $fileName;
        $fallbackPath = __DIR__ . '/../storage/app/google_drive_fallback/' . $fileName;
        $webPath = 'uploads/' . $fileName;
        
        $uploadResults[] = "Received file: {$file['name']} ({$file['size']} bytes, {$file['type']})";
        
        // Try different upload methods
        $uploadSuccess = false;
        
        // Method 1: Direct move_uploaded_file
        if (move_uploaded_file($file['tmp_name'], $localPath)) {
            $uploadSuccess = true;
            $uploadResults[] = "SUCCESS: File saved to public/uploads using move_uploaded_file()";
            
            // Make copies to other locations
            if (copy($localPath, $storagePath)) {
                $uploadResults[] = "File copied to storage/app/public/uploads";
            } else {
                $uploadResults[] = "Failed to copy to storage/app/public/uploads";
            }
            
            if (copy($localPath, $fallbackPath)) {
                $uploadResults[] = "File copied to storage/app/google_drive_fallback";
            } else {
                $uploadResults[] = "Failed to copy to storage/app/google_drive_fallback";
            }
        } else {
            $uploadResults[] = "Method 1 failed: " . error_get_last()['message'] ?? 'Unknown error';
            
            // Method 2: file_put_contents
            $content = file_get_contents($file['tmp_name']);
            if ($content !== false) {
                if (file_put_contents($localPath, $content) !== false) {
                    $uploadSuccess = true;
                    $uploadResults[] = "SUCCESS: File saved using file_put_contents()";
                    
                    // Make copies
                    file_put_contents($storagePath, $content);
                    file_put_contents($fallbackPath, $content);
                } else {
                    $uploadResults[] = "Method 2 failed: " . error_get_last()['message'] ?? 'Unknown error';
                }
            } else {
                $uploadResults[] = "Could not read uploaded file content";
            }
        }
        
        // Create database record if connected
        if ($uploadSuccess && $dbConnected) {
            try {
                $stmt = $pdo->prepare(
                    "INSERT INTO media_files 
                    (task_id, google_drive_id, file_name, original_name, mime_type, file_size, local_path, created_at, updated_at)
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())"
                );
                
                $result = $stmt->execute([
                    1, // Assuming task ID 1 exists
                    'direct_upload_' . time(),
                    $file['name'],
                    $file['name'],
                    $file['type'],
                    $file['size'],
                    $webPath
                ]);
                
                if ($result) {
                    $id = $pdo->lastInsertId();
                    $uploadResults[] = "Database record created with ID: $id";
                } else {
                    $uploadResults[] = "Failed to create database record";
                }
            } catch (Exception $e) {
                $uploadResults[] = "Database error: " . $e->getMessage();
            }
        }
    } else {
        // Handle upload error
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the form',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
        ];
        
        $errorMessage = $errorMessages[$file['error']] ?? "Unknown error code: {$file['error']}";
        $uploadResults[] = "Upload failed: $errorMessage";
    }
}

// Display messages and errors
echo '<div class="box">';
echo '<h2>System Checks</h2>';
foreach ($messages as $msg) {
    echo '<p>' . htmlspecialchars($msg) . '</p>';
}
foreach ($errors as $err) {
    echo '<p class="error">' . htmlspecialchars($err) . '</p>';
}
echo '</div>';

// Display upload form
echo '
<div class="box">
    <h2>Direct File Upload Test</h2>
    <form action="" method="post" enctype="multipart/form-data">
        <div>
            <label for="test_file">Select a file to upload:</label><br>
            <input type="file" name="test_file" id="test_file" required>
        </div>
        <button type="submit">Upload File</button>
    </form>
</div>';

// Show upload results if any
if (!empty($uploadResults)) {
    echo '<div class="box">';
    echo '<h2>Upload Results</h2>';
    foreach ($uploadResults as $result) {
        if (strpos($result, 'SUCCESS') !== false) {
            echo '<p class="success">' . htmlspecialchars($result) . '</p>';
        } elseif (strpos($result, 'failed') !== false || strpos($result, 'Failed') !== false || strpos($result, 'error') !== false || strpos($result, 'Error') !== false) {
            echo '<p class="error">' . htmlspecialchars($result) . '</p>';
        } else {
            echo '<p>' . htmlspecialchars($result) . '</p>';
        }
    }
    echo '</div>';
}

// Display Google Drive info if service account exists
$serviceAccountPath = __DIR__ . '/../storage/app/google/service-account.json';
if (file_exists($serviceAccountPath)) {
    echo '<div class="box">';
    echo '<h2>Google Drive Information</h2>';
    echo '<p>Service account file found at: ' . htmlspecialchars($serviceAccountPath) . '</p>';
    
    try {
        $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo '<p>Service account file is valid JSON</p>';
            if (isset($serviceAccountJson['client_email'])) {
                echo '<p>Service account email: <span class="code">' . htmlspecialchars($serviceAccountJson['client_email']) . '</span></p>';
                echo '<p>IMPORTANT: Make sure your Google Drive folder is shared with this email address with Editor permissions.</p>';
            }
        } else {
            echo '<p class="error">Service account file is not valid JSON: ' . json_last_error_msg() . '</p>';
        }
        
        $folderId = $env['GOOGLE_DRIVE_FOLDER_ID'] ?? null;
        if ($folderId) {
            echo '<p>Google Drive folder ID: <span class="code">' . htmlspecialchars($folderId) . '</span></p>';
            echo '<p>Drive folder URL: <a href="https://drive.google.com/drive/folders/' . htmlspecialchars($folderId) . '" target="_blank">Open in Google Drive</a></p>';
        } else {
            echo '<p class="warning">Google Drive folder ID not found in .env file</p>';
        }
    } catch (Exception $e) {
        echo '<p class="error">Error reading service account file: ' . htmlspecialchars($e->getMessage()) . '</p>';
    }
    echo '</div>';
}

// Footer
echo '
<div class="box">
    <h2>Next Steps</h2>
    <p>If all tests pass but you still have issues, check the following:</p>
    <ol>
        <li>Google Drive folder permissions - make sure the service account has Editor access</li>
        <li>PHP upload limits - check your server\'s php.ini configuration</li>
        <li>Laravel cache - try clearing the cache with <span class="code">php artisan cache:clear</span></li>
        <li>Storage symlink - ensure <span class="code">php artisan storage:link</span> has been run</li>
        <li>File permissions - ensure storage directories are writable</li>
    </ol>
</div>';

echo '</body></html>';
