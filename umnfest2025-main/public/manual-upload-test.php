<?php
/**
 * Manual Upload Test Handler
 * 
 * This script handles file uploads from the manual upload form and tests the complete upload flow
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
    <title>Manual Upload Test Result</title>
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
    <h1>Manual Upload Test Result</h1>';

// Load Laravel
$basePath = __DIR__ . '/..';
require $basePath . '/vendor/autoload.php';

try {
    // Bootstrap Laravel
    $app = require_once $basePath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo '<div class="box">';
    echo '<h2>Upload Processing</h2>';
    
    // Check if we received a file upload
    if (isset($_FILES['media_file']) && $_FILES['media_file']['error'] == UPLOAD_ERR_OK) {
        $uploadedFile = $_FILES['media_file'];
        
        echo '<p class="success">File received: ' . htmlspecialchars($uploadedFile['name']) . '</p>';
        echo '<p>File size: ' . number_format($uploadedFile['size'] / 1024, 2) . ' KB</p>';
        echo '<p>File type: ' . htmlspecialchars($uploadedFile['type']) . '</p>';
        echo '<p>Temporary path: ' . htmlspecialchars($uploadedFile['tmp_name']) . '</p>';
        
        // Create destination directory if needed
        $uploadDir = public_path('uploads');
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate safe filename
        $fileName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $uploadedFile['name']);
        $targetPath = $uploadDir . '/' . $fileName;
        
        // Move the uploaded file
        if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
            echo '<p class="success">File saved locally to: ' . $targetPath . '</p>';
            
            // Create a media file record
            try {
                // Get a task to associate with
                $task = \Illuminate\Support\Facades\DB::table('tasks')->first();
                
                if ($task) {
                    $taskId = $task->id;
                    
                    // Step 1: Create a media file record for local storage
                    $mediaId = \Illuminate\Support\Facades\DB::table('media_files')->insertGetId([
                        'task_id' => $taskId,
                        'google_drive_id' => 'local_' . uniqid(),
                        'file_name' => $fileName,
                        'original_name' => $uploadedFile['name'],
                        'mime_type' => $uploadedFile['type'],
                        'file_size' => $uploadedFile['size'],
                        'local_path' => 'uploads/' . $fileName,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                    
                    echo '<p class="success">Created local media file record with ID: ' . $mediaId . '</p>';
                    
                    // Step 2: Try uploading to Google Drive
                    $serviceAccountPath = storage_path('app/google/service-account.json');
                    $folderId = config('filesystems.disks.google.folderId');
                    
                    if (file_exists($serviceAccountPath) && $folderId) {
                        try {
                            // Create Google client
                            $client = new \Google\Client();
                            $client->setAuthConfig($serviceAccountPath);
                            $client->addScope(\Google\Service\Drive::DRIVE);
                            
                            // Create Drive service
                            $service = new \Google\Service\Drive($client);
                            
                            // Read the file content
                            $fileContent = file_get_contents($targetPath);
                            
                            if ($fileContent !== false) {
                                // Prepare file metadata with explicit parents parameter
                                $fileMetadata = new \Google\Service\Drive\DriveFile([
                                    'name' => $fileName,
                                    'parents' => [$folderId]
                                ]);
                                
                                // Upload with supportsAllDrives parameter
                                $file = $service->files->create(
                                    $fileMetadata,
                                    [
                                        'data' => $fileContent,
                                        'mimeType' => $uploadedFile['type'],
                                        'uploadType' => 'multipart',
                                        'fields' => 'id,name',
                                        'supportsAllDrives' => true
                                    ]
                                );
                                
                                echo '<p class="success">File uploaded to Google Drive with ID: ' . $file->getId() . '</p>';
                                
                                // Update the media file record with Google Drive info
                                \Illuminate\Support\Facades\DB::table('media_files')
                                    ->where('id', $mediaId)
                                    ->update([
                                        'google_drive_id' => $file->getId(),
                                        'drive_path' => $fileName,
                                        'updated_at' => date('Y-m-d H:i:s')
                                    ]);
                                
                                echo '<p class="success">Updated media file record with Google Drive information</p>';
                            } else {
                                echo '<p class="error">Could not read file content for Google Drive upload</p>';
                            }
                        } catch (\Exception $e) {
                            echo '<p class="error">Google Drive upload error: ' . $e->getMessage() . '</p>';
                            echo '<pre>' . $e->getTraceAsString() . '</pre>';
                        }
                    } else {
                        echo '<p class="warning">Google Drive not configured properly. Using local storage only.</p>';
                    }
                    
                    // Verify the record was created
                    $media = \Illuminate\Support\Facades\DB::table('media_files')->where('id', $mediaId)->first();
                    echo '<p>Final media file record:</p>';
                    echo '<pre>' . json_encode($media, JSON_PRETTY_PRINT) . '</pre>';
                } else {
                    echo '<p class="error">No tasks found to associate with the media file</p>';
                    
                    // Create a task
                    $taskId = \Illuminate\Support\Facades\DB::table('tasks')->insertGetId([
                        'judul' => 'Emergency Test Task ' . date('Y-m-d H:i:s'),
                        'deskripsi' => 'This is a test task created by the manual upload script',
                        'target_divisi' => json_encode(['IT']),
                        'jadwal_deadline' => date('Y-m-d', strtotime('+1 week')),
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                    
                    echo '<p class="success">Created emergency test task with ID: ' . $taskId . '</p>';
                    
                    // Now create the media file record
                    $mediaId = \Illuminate\Support\Facades\DB::table('media_files')->insertGetId([
                        'task_id' => $taskId,
                        'google_drive_id' => 'local_' . uniqid(),
                        'file_name' => $fileName,
                        'original_name' => $uploadedFile['name'],
                        'mime_type' => $uploadedFile['type'],
                        'file_size' => $uploadedFile['size'],
                        'local_path' => 'uploads/' . $fileName,
                        'created_at' => date('Y-m-d H:i:s'),
                        'updated_at' => date('Y-m-d H:i:s')
                    ]);
                    
                    echo '<p class="success">Created local media file record with ID: ' . $mediaId . '</p>';
                }
            } catch (\Exception $e) {
                echo '<p class="error">Database error: ' . $e->getMessage() . '</p>';
                echo '<pre>' . $e->getTraceAsString() . '</pre>';
            }
        } else {
            echo '<p class="error">Failed to move uploaded file to target location</p>';
            echo '<p>Error: ' . error_get_last()['message'] . '</p>';
        }
    } else {
        echo '<p class="error">No file uploaded or upload error occurred</p>';
        
        if (isset($_FILES['media_file'])) {
            $uploadErrors = [
                UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the form',
                UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
            ];
            
            $errorCode = $_FILES['media_file']['error'];
            $errorMessage = isset($uploadErrors[$errorCode]) ? $uploadErrors[$errorCode] : 'Unknown error code: ' . $errorCode;
            
            echo '<p>Upload error: ' . $errorMessage . '</p>';
        } else {
            echo '<p>$_FILES["media_file"] not set</p>';
        }
        
        // Debug form submission
        echo '<h3>Form Data:</h3>';
        echo '<pre>' . json_encode($_POST, JSON_PRETTY_PRINT) . '</pre>';
        
        echo '<h3>Files Data:</h3>';
        echo '<pre>' . json_encode($_FILES, JSON_PRETTY_PRINT) . '</pre>';
    }
    echo '</div>';
    
    // Add link to go back
    echo '<p><a href="/db-upload-debug.php">← Back to debug tool</a></p>';
    
} catch (\Exception $e) {
    echo '<div class="box error">';
    echo '<h2>Error</h2>';
    echo '<p>' . $e->getMessage() . '</p>';
    echo '<pre>' . $e->getTraceAsString() . '</pre>';
    echo '</div>';
}

echo '</body></html>';
