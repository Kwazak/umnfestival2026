<?php
/**
 * Debug DB Connection and File Upload
 * 
 * This script tests database connectivity and manually inserts a record into media_files table
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
    <title>Database Connection & File Upload Debug</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        pre { background: #f8f8f8; padding: 10px; border: 1px solid #ddd; overflow: auto; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>Database Connection & File Upload Debug</h1>';

// Load Laravel
$basePath = __DIR__ . '/..';
require $basePath . '/vendor/autoload.php';

try {
    // Bootstrap Laravel
    $app = require_once $basePath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo '<div class="box">';
    echo '<h2>Laravel Bootstrap</h2>';
    echo '<p class="success">Laravel bootstrapped successfully</p>';
    echo '</div>';
    
    // Test database connection
    echo '<div class="box">';
    echo '<h2>Database Connection Test</h2>';
    
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $connection = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
        
        echo '<p class="success">Connected to database: ' . $connection . '</p>';
    } catch (\Exception $e) {
        echo '<p class="error">Could not connect to the database. Error: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Check tasks table
    echo '<div class="box">';
    echo '<h2>Tasks Table Check</h2>';
    
    try {
        $taskCount = \Illuminate\Support\Facades\DB::table('tasks')->count();
        echo '<p class="info">Number of tasks in database: ' . $taskCount . '</p>';
        
        // Get the first task
        if ($taskCount > 0) {
            $task = \Illuminate\Support\Facades\DB::table('tasks')->first();
            echo '<p class="success">Found task with ID: ' . $task->id . '</p>';
            echo '<pre>' . json_encode($task, JSON_PRETTY_PRINT) . '</pre>';
        } else {
            echo '<p class="warning">No tasks found in the database</p>';
            
            // Create a test task
            echo '<h3>Creating a test task...</h3>';
            $taskId = \Illuminate\Support\Facades\DB::table('tasks')->insertGetId([
                'judul' => 'Test Task ' . date('Y-m-d H:i:s'),
                'deskripsi' => 'This is a test task created by the debug script',
                'target_divisi' => json_encode(['IT']),
                'jadwal_deadline' => date('Y-m-d', strtotime('+1 week')),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            
            echo '<p class="success">Created test task with ID: ' . $taskId . '</p>';
        }
    } catch (\Exception $e) {
        echo '<p class="error">Error querying tasks table: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Check media_files table schema
    echo '<div class="box">';
    echo '<h2>Media Files Table Schema</h2>';
    
    try {
        $columns = \Illuminate\Support\Facades\Schema::getColumnListing('media_files');
        echo '<p class="success">Media files table exists with the following columns:</p>';
        echo '<ul>';
        foreach ($columns as $column) {
            echo '<li>' . $column . '</li>';
        }
        echo '</ul>';
        
        // Count media files
        $mediaCount = \Illuminate\Support\Facades\DB::table('media_files')->count();
        echo '<p class="info">Number of media files in database: ' . $mediaCount . '</p>';
        
        // Show example if exists
        if ($mediaCount > 0) {
            $media = \Illuminate\Support\Facades\DB::table('media_files')->first();
            echo '<p>Example media file record:</p>';
            echo '<pre>' . json_encode($media, JSON_PRETTY_PRINT) . '</pre>';
        }
    } catch (\Exception $e) {
        echo '<p class="error">Error checking media_files table: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Test file upload and database insert
    echo '<div class="box">';
    echo '<h2>File Upload Test</h2>';
    
    // Create a test file
    $testFileName = 'debug_test_' . time() . '.txt';
    $testFilePath = public_path('uploads/' . $testFileName);
    
    if (!file_exists(public_path('uploads'))) {
        mkdir(public_path('uploads'), 0755, true);
    }
    
    file_put_contents($testFilePath, 'This is a test file created at ' . date('Y-m-d H:i:s'));
    
    if (file_exists($testFilePath)) {
        echo '<p class="success">Created test file: ' . $testFilePath . '</p>';
        
        // Get a task ID to associate with
        try {
            $task = \Illuminate\Support\Facades\DB::table('tasks')->first();
            
            if ($task) {
                $taskId = $task->id;
                
                // Create a media file record
                $mediaId = \Illuminate\Support\Facades\DB::table('media_files')->insertGetId([
                    'task_id' => $taskId,
                    'google_drive_id' => 'local_' . uniqid(),
                    'file_name' => $testFileName,
                    'original_name' => $testFileName,
                    'mime_type' => 'text/plain',
                    'file_size' => filesize($testFilePath),
                    'local_path' => 'uploads/' . $testFileName,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                
                echo '<p class="success">Created media file record with ID: ' . $mediaId . '</p>';
                
                // Verify the record was created
                $media = \Illuminate\Support\Facades\DB::table('media_files')->where('id', $mediaId)->first();
                echo '<p>Media file record details:</p>';
                echo '<pre>' . json_encode($media, JSON_PRETTY_PRINT) . '</pre>';
            } else {
                echo '<p class="error">No tasks found to associate with media file</p>';
            }
        } catch (\Exception $e) {
            echo '<p class="error">Error creating media file record: ' . $e->getMessage() . '</p>';
        }
    } else {
        echo '<p class="error">Failed to create test file</p>';
    }
    echo '</div>';
    
    // Test manual file upload to Google Drive
    echo '<div class="box">';
    echo '<h2>Google Drive Upload Test</h2>';
    
    try {
        // Get configuration
        $serviceAccountPath = storage_path('app/google/service-account.json');
        $folderId = config('filesystems.disks.google.folderId');
        
        if (file_exists($serviceAccountPath) && $folderId) {
            echo '<p class="info">Service account path: ' . $serviceAccountPath . '</p>';
            echo '<p class="info">Google Drive folder ID: ' . $folderId . '</p>';
            
            // Create Google client
            $client = new \Google\Client();
            $client->setAuthConfig($serviceAccountPath);
            $client->addScope(\Google\Service\Drive::DRIVE);
            
            // Create Drive service
            $service = new \Google\Service\Drive($client);
            
            // Create a test file for upload
            $uploadContent = "This is a test file for Google Drive upload created at " . date('Y-m-d H:i:s');
            $uploadFileName = 'direct_upload_test_' . time() . '.txt';
            
            // Prepare file metadata with explicit parents parameter
            $fileMetadata = new \Google\Service\Drive\DriveFile([
                'name' => $uploadFileName,
                'parents' => [$folderId]
            ]);
            
            // Upload with supportsAllDrives parameter
            $file = $service->files->create(
                $fileMetadata,
                [
                    'data' => $uploadContent,
                    'mimeType' => 'text/plain',
                    'uploadType' => 'multipart',
                    'fields' => 'id,name,mimeType,parents',
                    'supportsAllDrives' => true
                ]
            );
            
            echo '<p class="success">File uploaded successfully to Google Drive!</p>';
            echo '<p>File ID: ' . $file->getId() . '</p>';
            echo '<p>File Name: ' . $file->getName() . '</p>';
            
            // Now create a media file record for this Google Drive file
            try {
                $task = \Illuminate\Support\Facades\DB::table('tasks')->first();
                
                if ($task) {
                    $taskId = $task->id;
                    
                    // Create a media file record
                    $mediaId = \Illuminate\Support\Facades\DB::table('media_files')->insertGetId([
                        'task_id' => $taskId,
                        'google_drive_id' => $file->getId(),
                        'file_name' => $uploadFileName,
                        'original_name' => $uploadFileName,
                        'mime_type' => 'text/plain',
                        'file_size' => strlen($uploadContent),
                        'drive_path' => $uploadFileName,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                    
                    echo '<p class="success">Created Google Drive media file record with ID: ' . $mediaId . '</p>';
                }
            } catch (\Exception $e) {
                echo '<p class="error">Error creating Google Drive media file record: ' . $e->getMessage() . '</p>';
            }
            
        } else {
            echo '<p class="error">Missing service account file or folder ID</p>';
            
            if (!file_exists($serviceAccountPath)) {
                echo '<p class="error">Service account file not found at: ' . $serviceAccountPath . '</p>';
            }
            
            if (!$folderId) {
                echo '<p class="error">Google Drive folder ID not set in configuration</p>';
            }
        }
    } catch (\Exception $e) {
        echo '<p class="error">Google Drive upload error: ' . $e->getMessage() . '</p>';
        echo '<pre>' . $e->getTraceAsString() . '</pre>';
    }
    echo '</div>';
    
    // Form to test manual file upload
    echo '<div class="box">';
    echo '<h2>Manual File Upload Form</h2>';
    echo '<form action="/manual-upload-test.php" method="POST" enctype="multipart/form-data">';
    echo '<input type="hidden" name="_token" value="' . csrf_token() . '">';
    echo '<div>';
    echo '<label for="file">Select File:</label>';
    echo '<input type="file" name="media_file" id="file">';
    echo '</div>';
    echo '<div style="margin-top: 15px;">';
    echo '<button type="submit" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Upload File</button>';
    echo '</div>';
    echo '</form>';
    echo '</div>';
    
} catch (\Exception $e) {
    echo '<div class="box error">';
    echo '<h2>Error</h2>';
    echo '<p>' . $e->getMessage() . '</p>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
    echo '</div>';
}

echo '</body></html>';
