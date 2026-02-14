<?php
// Database connection test

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Database Connection Test</h1>";

// Test DB connection
try {
    $pdo = DB::connection()->getPdo();
    
    echo "<p class='success'>Successfully connected to database: <strong>" . 
         DB::connection()->getDatabaseName() . "</strong></p>";
    
    // Check tables
    $tables = DB::select('SHOW TABLES');
    echo "<h2>Database Tables</h2>";
    echo "<ul>";
    foreach ($tables as $table) {
        $tableName = reset($table);
        echo "<li>$tableName</li>";
    }
    echo "</ul>";
    
    // Check if media_files table exists and show structure
    if (Schema::hasTable('media_files')) {
        echo "<h2>Media Files Table Structure</h2>";
        $columns = DB::select('SHOW COLUMNS FROM media_files');
        echo "<table border='1' cellspacing='0' cellpadding='5'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $column) {
            echo "<tr>";
            echo "<td>{$column->Field}</td>";
            echo "<td>{$column->Type}</td>";
            echo "<td>{$column->Null}</td>";
            echo "<td>{$column->Key}</td>";
            echo "<td>{$column->Default}</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Check record count
        $count = DB::table('media_files')->count();
        echo "<p>Total media file records: <strong>$count</strong></p>";
    } else {
        echo "<p class='error'>The media_files table does not exist!</p>";
    }
    
    // Test INSERT and DELETE
    echo "<h2>INSERT/DELETE Test</h2>";
    
    try {
        // Create a test record
        $id = DB::table('media_files')->insertGetId([
            'task_id' => 1,  // Assuming task ID 1 exists
            'google_drive_id' => 'test_' . time(),
            'file_name' => 'database_test_file.txt',
            'original_name' => 'test_file.txt',
            'mime_type' => 'text/plain',
            'file_size' => 123,
            'local_path' => 'test/path',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        echo "<p class='success'>Successfully inserted test record with ID: $id</p>";
        
        // Delete the test record
        DB::table('media_files')->where('id', $id)->delete();
        echo "<p class='success'>Successfully deleted test record</p>";
        
    } catch (\Exception $e) {
        echo "<p class='error'>INSERT/DELETE Test failed: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
} catch (\Exception $e) {
    echo "<p class='error'>Failed to connect to database: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "</body>
</html>";
