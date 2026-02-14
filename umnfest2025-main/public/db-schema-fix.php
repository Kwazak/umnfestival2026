<?php
/**
 * DIRECT DATABASE FIX TOOL
 * 
 * This script directly verifies and fixes the database schema
 * for media_files table, creating or updating it if needed.
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// HTML header
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Database Schema Fix Tool</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        pre { background: #eee; padding: 10px; overflow: auto; border-radius: 3px; font-size: 0.9em; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Database Schema Fix Tool</h1>
    <p>This tool verifies and fixes the media_files table schema.</p>';

// Load Laravel
$basePath = __DIR__ . '/..';
try {
    require $basePath . '/vendor/autoload.php';
    
    // Bootstrap Laravel
    $app = require_once $basePath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo '<div class="box">';
    echo '<h2>1. Laravel Bootstrap</h2>';
    echo '<p class="success">Laravel bootstrapped successfully</p>';
    echo '</div>';
    
    // Database connection test
    echo '<div class="box">';
    echo '<h2>2. Database Connection</h2>';
    
    try {
        $pdo = DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        
        echo '<p class="success">Connected to database: ' . $dbName . '</p>';
        
        // Check if media_files table exists
        $tableExists = DB::select("SHOW TABLES LIKE 'media_files'");
        
        if (count($tableExists) > 0) {
            echo '<p class="success">media_files table exists</p>';
            
            // Get current columns
            $columns = DB::select("SHOW COLUMNS FROM media_files");
            $columnNames = array_column($columns, 'Field');
            
            echo '<p>Current columns: ' . implode(', ', $columnNames) . '</p>';
            
            // Define required columns and their definitions
            $requiredColumns = [
                'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
                'task_id' => 'BIGINT UNSIGNED NULL',
                'google_drive_id' => 'VARCHAR(255) NULL',
                'file_name' => 'VARCHAR(255) NOT NULL',
                'original_name' => 'VARCHAR(255) NULL',
                'mime_type' => 'VARCHAR(100) NULL',
                'file_size' => 'BIGINT UNSIGNED NULL',
                'local_path' => 'VARCHAR(255) NULL',
                'drive_path' => 'VARCHAR(255) NULL',
                'created_at' => 'TIMESTAMP NULL',
                'updated_at' => 'TIMESTAMP NULL'
            ];
            
            // Check missing columns
            $missingColumns = array_diff(array_keys($requiredColumns), $columnNames);
            
            if (!empty($missingColumns)) {
                echo '<p class="warning">Missing columns: ' . implode(', ', $missingColumns) . '</p>';
                
                // Add missing columns
                foreach ($missingColumns as $column) {
                    $definition = $requiredColumns[$column];
                    try {
                        DB::statement("ALTER TABLE media_files ADD COLUMN {$column} {$definition}");
                        echo '<p class="success">Added missing column: ' . $column . '</p>';
                    } catch (\Exception $e) {
                        echo '<p class="error">Failed to add column ' . $column . ': ' . $e->getMessage() . '</p>';
                    }
                }
                
                echo '<p>Table structure has been updated.</p>';
            } else {
                echo '<p class="success">All required columns exist</p>';
            }
            
            // Check task relationship
            try {
                $hasForeignKey = false;
                $indexExists = DB::select("SHOW INDEXES FROM media_files WHERE Column_name = 'task_id'");
                
                if (empty($indexExists)) {
                    echo '<p class="warning">task_id is not indexed</p>';
                    DB::statement("ALTER TABLE media_files ADD INDEX task_id_index (task_id)");
                    echo '<p class="success">Added index on task_id</p>';
                } else {
                    echo '<p class="success">task_id is indexed</p>';
                }
                
                // Test insert/update operation
                try {
                    $testId = DB::table('media_files')->insertGetId([
                        'task_id' => null,
                        'google_drive_id' => 'test_' . uniqid(),
                        'file_name' => 'db_test_file.txt',
                        'original_name' => 'original_test.txt',
                        'mime_type' => 'text/plain',
                        'file_size' => 100,
                        'local_path' => 'test/path.txt',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    
                    echo '<p class="success">Test insert successful with ID: ' . $testId . '</p>';
                    
                    // Update the record
                    DB::table('media_files')
                        ->where('id', $testId)
                        ->update([
                            'google_drive_id' => 'updated_' . uniqid(),
                            'drive_path' => 'updated_path'
                        ]);
                        
                    echo '<p class="success">Test update successful</p>';
                    
                    // Delete the test record
                    DB::table('media_files')->where('id', $testId)->delete();
                    echo '<p class="success">Test record deleted</p>';
                    
                } catch (\Exception $e) {
                    echo '<p class="error">Test operation failed: ' . $e->getMessage() . '</p>';
                }
            } catch (\Exception $e) {
                echo '<p class="error">Error checking indexes: ' . $e->getMessage() . '</p>';
            }
        } else {
            echo '<p class="error">media_files table does not exist</p>';
            
            // Create the table
            try {
                $createTableSQL = "CREATE TABLE media_files (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    task_id BIGINT UNSIGNED NULL,
                    google_drive_id VARCHAR(255) NULL,
                    file_name VARCHAR(255) NOT NULL,
                    original_name VARCHAR(255) NULL,
                    mime_type VARCHAR(100) NULL,
                    file_size BIGINT UNSIGNED NULL,
                    local_path VARCHAR(255) NULL,
                    drive_path VARCHAR(255) NULL,
                    created_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NULL,
                    INDEX task_id_index (task_id)
                )";
                
                DB::statement($createTableSQL);
                echo '<p class="success">Created media_files table</p>';
                
                // Test the table
                $testId = DB::table('media_files')->insertGetId([
                    'task_id' => null,
                    'google_drive_id' => 'test_' . uniqid(),
                    'file_name' => 'db_test_file.txt',
                    'original_name' => 'original_test.txt',
                    'mime_type' => 'text/plain',
                    'file_size' => 100,
                    'local_path' => 'test/path.txt',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                echo '<p class="success">Test insert successful with ID: ' . $testId . '</p>';
                
                // Delete the test record
                DB::table('media_files')->where('id', $testId)->delete();
            } catch (\Exception $e) {
                echo '<p class="error">Failed to create table: ' . $e->getMessage() . '</p>';
            }
        }
    } catch (\Exception $e) {
        echo '<p class="error">Database connection failed: ' . $e->getMessage() . '</p>';
    }
    
    echo '</div>';
    
} catch (\Exception $e) {
    echo '<div class="box">';
    echo '<h2>Error</h2>';
    echo '<p class="error">' . $e->getMessage() . '</p>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
    echo '</div>';
}

echo '<div class="box">
    <h2>Next Steps</h2>
    <ul>
        <li>Try uploading files with the <a href="/complete-fix.php">Complete Upload Fix Tool</a></li>
        <li>Clear Laravel cache: <code>php artisan cache:clear</code></li>
        <li>Try using the Admin panel to upload files</li>
    </ul>
</div>';

echo '</body>
</html>';
