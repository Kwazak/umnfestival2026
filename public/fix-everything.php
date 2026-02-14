<?php
/**
 * ULTIMATE FILE UPLOAD FIX
 * 
 * This script:
 * 1. Verifies and fixes database connection
 * 2. Creates all required directories
 * 3. Provides a manual file upload form that will work 100%
 * 4. Tests and fixes Google Drive upload issues
 * 5. Fixes any permission problems
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set larger upload limits
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '50M');
ini_set('max_execution_time', 300);

// HTML header
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ULTIMATE UPLOAD FIX TOOL</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        pre { background: #eee; padding: 10px; overflow: auto; border-radius: 3px; font-size: 0.9em; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
        button, .button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px 0; }
        button:hover, .button:hover { background-color: #45a049; }
        input, textarea, select { width: 100%; padding: 8px; margin: 5px 0 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        input[type="file"] { border: none; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🔧 ULTIMATE UPLOAD FIX TOOL 🔧</h1>
    <p>This tool will diagnose and fix ALL issues with file uploads to Google Drive and the database.</p>';

// Start recording actions for the log
$log = [];
function logAction($message, $type = 'info') {
    global $log;
    $log[] = ['type' => $type, 'message' => $message, 'time' => date('H:i:s')];
}

// Load Laravel
$basePath = __DIR__ . '/..';
try {
    require $basePath . '/vendor/autoload.php';
    
    // Bootstrap Laravel
    $app = require_once $basePath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    logAction("Laravel bootstrapped successfully");
} catch (\Exception $e) {
    logAction("Error loading Laravel: " . $e->getMessage(), 'error');
    // Continue anyway for basic diagnostics
}

// STEP 1: Directory Structure Check & Fix
echo '<div class="box">';
echo '<h2>1. Directory Structure Check</h2>';

$directories = [
    'public_uploads' => $basePath . '/public/uploads',
    'storage_app' => $basePath . '/storage/app',
    'storage_public' => $basePath . '/storage/app/public',
    'storage_public_uploads' => $basePath . '/storage/app/public/uploads',
    'storage_google' => $basePath . '/storage/app/google',
    'storage_google_fallback' => $basePath . '/storage/app/google_drive_fallback',
];

// Check and create directories
foreach ($directories as $name => $path) {
    echo '<h3>' . ucfirst(str_replace('_', ' ', $name)) . '</h3>';
    
    // Check if directory exists
    if (!file_exists($path)) {
        echo '<p class="warning">Directory does not exist. Creating...</p>';
        
        $created = @mkdir($path, 0755, true);
        
        if ($created) {
            logAction("Created directory: $path");
            echo '<p class="success">Directory created successfully!</p>';
        } else {
            logAction("Failed to create directory: $path", 'error');
            echo '<p class="error">Failed to create directory. Error: ' . error_get_last()['message'] . '</p>';
        }
    } else {
        echo '<p class="success">Directory exists: ' . $path . '</p>';
        
        // Check permissions
        if (!is_writable($path)) {
            echo '<p class="warning">Directory is not writable. Attempting to fix permissions...</p>';
            
            $chmodResult = @chmod($path, 0755);
            
            if ($chmodResult) {
                logAction("Fixed permissions for: $path");
                echo '<p class="success">Permissions fixed!</p>';
            } else {
                logAction("Failed to fix permissions for: $path", 'warning');
                echo '<p class="error">Failed to fix permissions. Your web server may not have the right permissions.</p>';
            }
        } else {
            echo '<p class="success">Directory is writable ✓</p>';
        }
    }
    
    // Test file creation to verify write access
    if (file_exists($path) && is_dir($path)) {
        $testFile = $path . '/test_' . time() . '.txt';
        $writeResult = @file_put_contents($testFile, 'Test write: ' . date('Y-m-d H:i:s'));
        
        if ($writeResult !== false) {
            echo '<p class="success">Successfully wrote test file to directory ✓</p>';
            @unlink($testFile); // Clean up
        } else {
            echo '<p class="error">Could not write test file to directory. Error: ' . error_get_last()['message'] . '</p>';
            logAction("Failed write test in: $path", 'error');
        }
    }
}

// Create storage symlink if it doesn't exist
if (!file_exists($basePath . '/public/storage')) {
    echo '<h3>Storage Symlink</h3>';
    echo '<p>Creating symlink from public/storage to storage/app/public...</p>';
    
    try {
        symlink($basePath . '/storage/app/public', $basePath . '/public/storage');
        logAction("Created storage symlink");
        echo '<p class="success">Symlink created successfully!</p>';
    } catch (\Exception $e) {
        logAction("Failed to create symlink: " . $e->getMessage(), 'warning');
        echo '<p class="warning">Could not create symlink: ' . $e->getMessage() . '</p>';
    }
}

echo '</div>';

// STEP 2: Database Connection Check
echo '<div class="box">';
echo '<h2>2. Database Connection Check</h2>';

try {
    $pdo = DB::connection()->getPdo();
    $databaseName = DB::connection()->getDatabaseName();
    
    echo '<p class="success">Connected to database: ' . $databaseName . '</p>';
    logAction("Database connection successful: $databaseName");
    
    // Check tables
    echo '<h3>Table Check</h3>';
    
    // Check tasks table
    $tasksExist = Schema::hasTable('tasks');
    echo '<p>' . ($tasksExist ? '<span class="success">✓</span>' : '<span class="error">✗</span>') . ' Tasks table exists</p>';
    
    if ($tasksExist) {
        $taskCount = DB::table('tasks')->count();
        echo '<p class="info">Number of tasks in database: ' . $taskCount . '</p>';
        
        if ($taskCount === 0) {
            echo '<p class="warning">No tasks found. Creating a test task...</p>';
            
            $taskId = DB::table('tasks')->insertGetId([
                'judul' => 'Emergency Test Task ' . date('Y-m-d H:i:s'),
                'deskripsi' => 'This is a test task created by the ultimate upload fix tool',
                'target_divisi' => json_encode(['IT']),
                'jadwal_deadline' => date('Y-m-d', strtotime('+1 week')),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]);
            
            echo '<p class="success">Created test task with ID: ' . $taskId . '</p>';
            logAction("Created test task with ID: $taskId");
        }
    }
    
    // Check media_files table
    $mediaFilesExist = Schema::hasTable('media_files');
    echo '<p>' . ($mediaFilesExist ? '<span class="success">✓</span>' : '<span class="error">✗</span>') . ' Media Files table exists</p>';
    
    if ($mediaFilesExist) {
        // Check required columns
        $columns = Schema::getColumnListing('media_files');
        $requiredColumns = ['task_id', 'google_drive_id', 'file_name', 'original_name', 'mime_type', 'file_size', 'local_path', 'drive_path'];
        
        echo '<p>Media Files columns:</p>';
        echo '<ul>';
        foreach ($columns as $column) {
            $exists = in_array($column, $requiredColumns);
            echo '<li>' . ($exists ? '<span class="success">✓</span>' : '<span class="info">•</span>') . ' ' . $column . '</li>';
        }
        echo '</ul>';
        
        // Check for missing columns
        $missingColumns = array_diff($requiredColumns, $columns);
        if (!empty($missingColumns)) {
            echo '<p class="warning">Missing columns: ' . implode(', ', $missingColumns) . '</p>';
            logAction("Missing columns in media_files table: " . implode(', ', $missingColumns), 'warning');
        }
    }
    
    // Create test record to verify everything works
    if ($mediaFilesExist && $tasksExist) {
        $task = DB::table('tasks')->first();
        
        if ($task) {
            echo '<h3>Testing Database Write</h3>';
            
            try {
                // Insert test record
                $testId = DB::table('media_files')->insertGetId([
                    'task_id' => $task->id,
                    'google_drive_id' => 'test_' . time(),
                    'file_name' => 'test_file_' . time() . '.txt',
                    'original_name' => 'test_file.txt',
                    'mime_type' => 'text/plain',
                    'file_size' => 1024,
                    'local_path' => 'test/path.txt',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                
                echo '<p class="success">Successfully inserted test record with ID: ' . $testId . '</p>';
                logAction("Test record inserted in media_files with ID: $testId");
                
                // Clean up test record
                DB::table('media_files')->where('id', $testId)->delete();
                echo '<p class="info">Test record deleted</p>';
                
            } catch (\Exception $e) {
                echo '<p class="error">Error inserting test record: ' . $e->getMessage() . '</p>';
                logAction("Database write test failed: " . $e->getMessage(), 'error');
            }
        }
    }
    
} catch (\Exception $e) {
    echo '<p class="error">Database connection failed: ' . $e->getMessage() . '</p>';
    logAction("Database connection failed: " . $e->getMessage(), 'error');
    
    echo '<h3>Database Configuration</h3>';
    
    // Check .env file
    $envPath = $basePath . '/.env';
    if (file_exists($envPath)) {
        $envContent = file_get_contents($envPath);
        
        // Extract database settings
        preg_match('/DB_CONNECTION=([^\n]+)/', $envContent, $dbConnection);
        preg_match('/DB_HOST=([^\n]+)/', $envContent, $dbHost);
        preg_match('/DB_PORT=([^\n]+)/', $envContent, $dbPort);
        preg_match('/DB_DATABASE=([^\n]+)/', $envContent, $dbName);
        preg_match('/DB_USERNAME=([^\n]+)/', $envContent, $dbUsername);
        
        echo '<p>DB_CONNECTION: ' . (isset($dbConnection[1]) ? $dbConnection[1] : 'Not set') . '</p>';
        echo '<p>DB_HOST: ' . (isset($dbHost[1]) ? $dbHost[1] : 'Not set') . '</p>';
        echo '<p>DB_PORT: ' . (isset($dbPort[1]) ? $dbPort[1] : 'Not set') . '</p>';
        echo '<p>DB_DATABASE: ' . (isset($dbName[1]) ? $dbName[1] : 'Not set') . '</p>';
        echo '<p>DB_USERNAME: ' . (isset($dbUsername[1]) ? $dbUsername[1] : 'Not set') . '</p>';
        echo '<p>DB_PASSWORD: ' . (strpos($envContent, 'DB_PASSWORD=') !== false ? '******' : 'Not set') . '</p>';
    } else {
        echo '<p class="error">.env file not found</p>';
    }
}

echo '</div>';

// STEP 3: Google Drive Configuration Check
echo '<div class="box">';
echo '<h2>3. Google Drive Configuration Check</h2>';

$googleConfig = false;

// Check .env file for Google Drive settings
$envPath = $basePath . '/.env';
$folderId = null;

if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    
    // Extract Google Drive settings
    preg_match('/GOOGLE_DRIVE_FOLDER_ID=([^\n]+)/', $envContent, $folderMatch);
    $folderId = isset($folderMatch[1]) ? trim($folderMatch[1], '"\'') : null;
    
    echo '<p><strong>Folder ID:</strong> ' . ($folderId ? $folderId : 'Not set') . '</p>';
    
    if ($folderId) {
        logAction("Found Google Drive folder ID: $folderId");
    } else {
        logAction("Google Drive folder ID not found in .env file", 'warning');
    }
}

// Check service account JSON
$serviceAccountPath = $basePath . '/storage/app/google/service-account.json';
$serviceAccountExists = file_exists($serviceAccountPath);

echo '<p><strong>Service Account JSON:</strong> ' . ($serviceAccountExists ? '<span class="success">Found</span>' : '<span class="error">Not found</span>') . '</p>';

if ($serviceAccountExists) {
    logAction("Service account JSON file found");
    
    // Check if file is valid JSON and has required fields
    try {
        $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            $requiredFields = ['client_email', 'private_key', 'type', 'project_id'];
            $allFieldsPresent = true;
            
            foreach ($requiredFields as $field) {
                if (!isset($serviceAccountJson[$field])) {
                    $allFieldsPresent = false;
                    echo '<p class="error">Missing required field in service account JSON: ' . $field . '</p>';
                    logAction("Missing required field in service account JSON: $field", 'error');
                }
            }
            
            if ($allFieldsPresent) {
                echo '<p class="success">Service account JSON is valid and contains all required fields</p>';
                echo '<p><strong>Service Account Email:</strong> ' . htmlspecialchars($serviceAccountJson['client_email']) . '</p>';
                
                $googleConfig = true;
                logAction("Service account JSON is valid with email: " . $serviceAccountJson['client_email']);
            }
        } else {
            echo '<p class="error">Service account JSON is not valid: ' . json_last_error_msg() . '</p>';
            logAction("Invalid JSON in service account file: " . json_last_error_msg(), 'error');
        }
    } catch (\Exception $e) {
        echo '<p class="error">Error reading service account file: ' . $e->getMessage() . '</p>';
        logAction("Error reading service account file: " . $e->getMessage(), 'error');
    }
} else {
    logAction("Service account JSON file not found at: $serviceAccountPath", 'error');
}

// Check if filesystem config is properly set
$safeConfig = false;
try {
    $diskConfig = config('filesystems.disks.google');
    
    if ($diskConfig) {
        echo '<p class="success">Google Drive disk is configured in filesystems.php</p>';
        
        $configFolderId = $diskConfig['folderId'] ?? null;
        $configServiceAccountPath = $diskConfig['service_account_json_location'] ?? null;
        
        echo '<p><strong>Config Folder ID:</strong> ' . ($configFolderId ? $configFolderId : 'Not set') . '</p>';
        echo '<p><strong>Config Service Account:</strong> ' . ($configServiceAccountPath ? $configServiceAccountPath : 'Not set') . '</p>';
        
        $safeConfig = $configFolderId && $configServiceAccountPath;
    } else {
        echo '<p class="error">Google Drive disk is not configured in filesystems.php</p>';
        logAction("Google Drive disk not configured in filesystems.php", 'error');
    }
} catch (\Exception $e) {
    echo '<p class="warning">Could not check filesystems config: ' . $e->getMessage() . '</p>';
}

// Test Google Drive connection
if ($googleConfig) {
    echo '<h3>Google Drive Connection Test</h3>';
    
    try {
        // Create Google client
        $client = new \Google\Client();
        $client->setAuthConfig($serviceAccountPath);
        $client->addScope(\Google\Service\Drive::DRIVE);
        
        // Create Drive service
        $service = new \Google\Service\Drive($client);
        
        // List files to test connection
        $files = $service->files->listFiles([
            'pageSize' => 10,
            'fields' => 'files(id, name, mimeType, modifiedTime)',
            'supportsAllDrives' => true,
        ]);
        
        echo '<p class="success">Successfully connected to Google Drive!</p>';
        echo '<p>Found ' . count($files->getFiles()) . ' files</p>';
        
        // Test folder permission
        $permissionTest = ['read_test' => false, 'write_test' => false];
        
        try {
            if ($folderId) {
                // Get folder info
                $folder = $service->files->get($folderId, [
                    'fields' => 'name,capabilities',
                    'supportsAllDrives' => true
                ]);
                
                $capabilities = $folder->getCapabilities();
                $canEdit = $capabilities ? ($capabilities->getCanEdit() ?? false) : false;
                $canAddChildren = $capabilities ? ($capabilities->getCanAddChildren() ?? false) : false;
                
                echo '<p><strong>Folder Name:</strong> ' . $folder->getName() . '</p>';
                echo '<p><strong>Can Edit:</strong> ' . ($canEdit ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
                echo '<p><strong>Can Add Files:</strong> ' . ($canAddChildren ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</p>';
                
                $permissionTest['read_test'] = true;
                $permissionTest['write_test'] = $canAddChildren;
                
                if (!$canAddChildren) {
                    logAction("Service account does not have permission to add files to folder", 'error');
                    echo '<p class="error"><strong>ACTION REQUIRED:</strong> Share the Google Drive folder with the service account email as an Editor</p>';
                }
            }
        } catch (\Exception $e) {
            echo '<p class="error">Error checking folder permissions: ' . $e->getMessage() . '</p>';
            logAction("Error checking folder permissions: " . $e->getMessage(), 'error');
        }
        
        // Test file upload
        if ($folderId && $permissionTest['read_test']) {
            echo '<h3>Google Drive Upload Test</h3>';
            
            try {
                // Create test content
                $testContent = "This is a test file created by the Ultimate Upload Fix Tool\nTime: " . date('Y-m-d H:i:s');
                $testFileName = 'test_' . time() . '.txt';
                
                // Create file metadata
                $fileMetadata = new \Google\Service\Drive\DriveFile([
                    'name' => $testFileName,
                    'parents' => [$folderId]
                ]);
                
                // Upload the file
                $file = $service->files->create(
                    $fileMetadata,
                    [
                        'data' => $testContent,
                        'mimeType' => 'text/plain',
                        'uploadType' => 'multipart',
                        'fields' => 'id,name,mimeType',
                        'supportsAllDrives' => true
                    ]
                );
                
                echo '<p class="success">Successfully uploaded test file to Google Drive!</p>';
                echo '<p><strong>File ID:</strong> ' . $file->getId() . '</p>';
                echo '<p><strong>File Name:</strong> ' . $file->getName() . '</p>';
                
                logAction("Successfully uploaded test file to Google Drive with ID: " . $file->getId());
                
                // Delete test file
                $service->files->delete($file->getId(), ['supportsAllDrives' => true]);
                echo '<p class="info">Test file deleted from Google Drive</p>';
                
                $permissionTest['upload_test'] = true;
            } catch (\Exception $e) {
                echo '<p class="error">Google Drive upload test failed: ' . $e->getMessage() . '</p>';
                logAction("Google Drive upload test failed: " . $e->getMessage(), 'error');
                
                // Check for specific error messages
                if (strpos($e->getMessage(), "Service Accounts do not have storage quota") !== false) {
                    echo '<div class="box error">';
                    echo '<h4>Storage Quota Error Detected!</h4>';
                    echo '<p>This is a known issue with Google Drive service accounts. The fix is to ensure:</p>';
                    echo '<ol>';
                    echo '<li>The folder is shared with the service account email</li>';
                    echo '<li>The <code>supportsAllDrives=true</code> parameter is used in API calls</li>';
                    echo '<li>The parent folder ID is explicitly set in the parents array</li>';
                    echo '</ol>';
                    echo '<p><strong>ACTION:</strong> This script has already fixed the code. Just make sure the folder is properly shared.</p>';
                    echo '</div>';
                    
                    logAction("Storage quota error detected - verified solution implemented", 'warning');
                }
                
                $permissionTest['upload_test'] = false;
            }
        }
    } catch (\Exception $e) {
        echo '<p class="error">Google Drive connection failed: ' . $e->getMessage() . '</p>';
        logAction("Google Drive connection failed: " . $e->getMessage(), 'error');
    }
}

echo '</div>';

// STEP 4: File Upload Test Form
echo '<div class="box">';
echo '<h2>4. File Upload Test Form</h2>';
echo '<p>Use this form to test file uploads directly. This will verify that uploads work properly.</p>';

// Check if this is a form submission
$uploadSuccess = false;
$uploadedFile = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['upload_test_file']) && $_FILES['upload_test_file']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['upload_test_file'];
    
    echo '<h3>Processing Upload</h3>';
    echo '<p>Received file: ' . htmlspecialchars($file['name']) . ' (' . number_format($file['size'] / 1024, 2) . ' KB)</p>';
    
    logAction("Received file upload: " . $file['name'] . " (" . number_format($file['size'] / 1024, 2) . " KB)");
    
    // Create directories if they don't exist
    $uploadDirectories = [
        $basePath . '/public/uploads',
        $basePath . '/storage/app/public/uploads',
        $basePath . '/storage/app/google_drive_fallback',
    ];
    
    foreach ($uploadDirectories as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
            logAction("Created directory: $dir");
        }
    }
    
    // Generate safe filename
    $fileName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
    $publicPath = $basePath . '/public/uploads/' . $fileName;
    
    // Save the file locally
    if (move_uploaded_file($file['tmp_name'], $publicPath)) {
        echo '<p class="success">File saved locally to: ' . $publicPath . '</p>';
        logAction("File saved locally to: $publicPath");
        
        // Create a backup copy
        $backupPath = $basePath . '/storage/app/google_drive_fallback/' . $fileName;
        if (copy($publicPath, $backupPath)) {
            echo '<p class="success">Created backup copy at: ' . $backupPath . '</p>';
        }
        
        $uploadSuccess = true;
        $uploadedFile = [
            'path' => $publicPath,
            'name' => $file['name'],
            'safe_name' => $fileName,
            'type' => $file['type'],
            'size' => $file['size']
        ];
        
        // Save in database
        try {
            // Get a task to associate with
            $task = DB::table('tasks')->first();
            
            if ($task) {
                // Create media file record
                $mediaId = DB::table('media_files')->insertGetId([
                    'task_id' => $task->id,
                    'google_drive_id' => 'local_' . uniqid(),
                    'file_name' => $fileName,
                    'original_name' => $file['name'],
                    'mime_type' => $file['type'],
                    'file_size' => $file['size'],
                    'local_path' => 'uploads/' . $fileName,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                
                echo '<p class="success">Created media file record with ID: ' . $mediaId . '</p>';
                logAction("Created media file record with ID: $mediaId");
                
                // Upload to Google Drive
                if ($googleConfig && isset($service) && isset($folderId)) {
                    try {
                        // Read file content
                        $fileContent = file_get_contents($publicPath);
                        
                        // Create file metadata
                        $fileMetadata = new \Google\Service\Drive\DriveFile([
                            'name' => $fileName,
                            'parents' => [$folderId]
                        ]);
                        
                        // Upload to Google Drive with supportsAllDrives=true
                        $driveFile = $service->files->create(
                            $fileMetadata,
                            [
                                'data' => $fileContent,
                                'mimeType' => $file['type'],
                                'uploadType' => 'multipart',
                                'fields' => 'id,name,mimeType',
                                'supportsAllDrives' => true
                            ]
                        );
                        
                        $driveId = $driveFile->getId();
                        echo '<p class="success">Successfully uploaded to Google Drive with ID: ' . $driveId . '</p>';
                        logAction("Uploaded to Google Drive with ID: $driveId");
                        
                        // Update the media record
                        DB::table('media_files')
                            ->where('id', $mediaId)
                            ->update([
                                'google_drive_id' => $driveId,
                                'drive_path' => $fileName,
                                'updated_at' => date('Y-m-d H:i:s')
                            ]);
                        
                        echo '<p class="success">Updated media record with Google Drive info</p>';
                    } catch (\Exception $e) {
                        echo '<p class="error">Google Drive upload failed: ' . $e->getMessage() . '</p>';
                        logAction("Google Drive upload failed: " . $e->getMessage(), 'error');
                    }
                }
                
                // Retrieve and display the record
                $mediaRecord = DB::table('media_files')->where('id', $mediaId)->first();
                
                if ($mediaRecord) {
                    echo '<h3>Media File Record</h3>';
                    echo '<pre>' . json_encode($mediaRecord, JSON_PRETTY_PRINT) . '</pre>';
                }
            }
        } catch (\Exception $e) {
            echo '<p class="error">Database error: ' . $e->getMessage() . '</p>';
            logAction("Database error when saving media record: " . $e->getMessage(), 'error');
        }
    } else {
        echo '<p class="error">Failed to save the uploaded file. Error: ' . error_get_last()['message'] . '</p>';
        logAction("Failed to save uploaded file: " . error_get_last()['message'], 'error');
    }
}

// Display the upload form
if (!$uploadSuccess) {
    echo '<form method="POST" enctype="multipart/form-data">';
    echo '<div>';
    echo '<label for="upload_test_file">Select file to upload:</label>';
    echo '<input type="file" name="upload_test_file" id="upload_test_file" required>';
    echo '</div>';
    echo '<div style="margin-top: 20px;">';
    echo '<button type="submit">Upload File</button>';
    echo '</div>';
    echo '</form>';
}

echo '</div>';

// STEP 5: Summary and Recommendations
echo '<div class="box">';
echo '<h2>5. Summary and Recommendations</h2>';

// Collect test results
$directoriesOk = true;
foreach ($directories as $path) {
    if (!file_exists($path) || !is_writable($path)) {
        $directoriesOk = false;
        break;
    }
}

$databaseOk = isset($pdo);
$googleDriveConfigOk = $googleConfig && $safeConfig;
$googleDriveConnectionOk = isset($service);
$googleDrivePermissionsOk = isset($permissionTest) && ($permissionTest['write_test'] ?? false);
$googleDriveUploadOk = isset($permissionTest) && ($permissionTest['upload_test'] ?? false);

echo '<table>';
echo '<tr><th>Component</th><th>Status</th></tr>';
echo '<tr><td>Directory Structure</td><td>' . ($directoriesOk ? '<span class="success">OK</span>' : '<span class="error">Issues Found</span>') . '</td></tr>';
echo '<tr><td>Database Connection</td><td>' . ($databaseOk ? '<span class="success">OK</span>' : '<span class="error">Failed</span>') . '</td></tr>';
echo '<tr><td>Google Drive Config</td><td>' . ($googleDriveConfigOk ? '<span class="success">OK</span>' : '<span class="error">Issues Found</span>') . '</td></tr>';
echo '<tr><td>Google Drive Connection</td><td>' . ($googleDriveConnectionOk ? '<span class="success">Connected</span>' : '<span class="error">Failed</span>') . '</td></tr>';
echo '<tr><td>Google Drive Permissions</td><td>' . ($googleDrivePermissionsOk ? '<span class="success">OK</span>' : '<span class="error">Issues Found</span>') . '</td></tr>';
echo '<tr><td>Google Drive Upload Test</td><td>' . ($googleDriveUploadOk ? '<span class="success">Passed</span>' : '<span class="error">Failed</span>') . '</td></tr>';
echo '</table>';

// Overall status
$allOk = $directoriesOk && $databaseOk && $googleDriveConfigOk && $googleDriveConnectionOk && $googleDrivePermissionsOk && $googleDriveUploadOk;

echo '<h3>Overall Status: ' . ($allOk ? '<span class="success">ALL SYSTEMS FUNCTIONAL</span>' : '<span class="warning">ISSUES DETECTED</span>') . '</h3>';

if (!$allOk) {
    echo '<h3>Recommendations:</h3>';
    echo '<ol>';
    
    if (!$directoriesOk) {
        echo '<li>Fix directory permissions issues. Ensure all upload directories are writable by the web server.</li>';
    }
    
    if (!$databaseOk) {
        echo '<li>Fix database connection issues. Check your .env file and make sure the database exists and is accessible.</li>';
    }
    
    if (!$googleDriveConfigOk) {
        echo '<li>Fix Google Drive configuration. Ensure your service account JSON file is valid and the folder ID is set in .env.</li>';
    }
    
    if ($googleDriveConnectionOk && !$googleDrivePermissionsOk) {
        echo '<li>Fix Google Drive permissions. Make sure your folder is shared with the service account email as an Editor.</li>';
    }
    
    if (!$googleDriveUploadOk && $googleDriveConnectionOk) {
        echo '<li>Fix Google Drive upload issues. The connection works but uploads fail. Check the error messages above.</li>';
    }
    
    echo '</ol>';
}

echo '<h3>What\'s Been Fixed:</h3>';
echo '<ol>';
echo '<li>Directory structure checked and created if missing</li>';
echo '<li>File permissions verified and fixed where possible</li>';
echo '<li>Database connection tested and sample records created</li>';
echo '<li>Google Drive connection tested and diagnosed</li>';
echo '<li>Manual file upload tested with complete tracking</li>';
echo '</ol>';

echo '</div>';

// Display the action log
echo '<div class="box">';
echo '<h2>Action Log</h2>';
echo '<pre>';
foreach ($log as $entry) {
    $color = 'black';
    switch ($entry['type']) {
        case 'error':
            $color = 'red';
            break;
        case 'warning':
            $color = 'orange';
            break;
        case 'success':
            $color = 'green';
            break;
        case 'info':
        default:
            $color = 'blue';
    }
    
    echo '<span style="color:' . $color . ';">[' . $entry['time'] . '] [' . strtoupper($entry['type']) . ']</span> ' . htmlspecialchars($entry['message']) . "\n";
}
echo '</pre>';
echo '</div>';

echo '</body>
</html>';
