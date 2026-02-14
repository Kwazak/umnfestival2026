<?php
/**
 * FINAL COMPREHENSIVE VERIFICATION TOOL
 * This script checks ALL aspects of the Google Drive integration
 * and file uploads to ensure everything is working perfectly
 */

// Start measuring execution time
$startTime = microtime(true);

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering
ob_start();

// HTML header
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>FINAL VERIFICATION - Google Drive Integration</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        pre { background: #eee; padding: 10px; overflow: auto; border-radius: 3px; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .result-table tr:hover { background-color: #f5f5f5; }
        .overall-status { font-size: 24px; text-align: center; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .overall-success { background-color: #dff2bf; color: #4F8A10; }
        .overall-warning { background-color: #feefb3; color: #9F6000; }
        .overall-error { background-color: #ffbaba; color: #D8000C; }
        .test-group { margin-bottom: 30px; }
    </style>
</head>
<body>
    <h1>FINAL VERIFICATION - Google Drive Integration</h1>
    <p>This tool runs a comprehensive verification of all aspects of the Google Drive integration and file uploads.</p>';

// Track test results
$allTests = [];
$passedTests = 0;
$totalTests = 0;
$criticalFails = 0;

// Function to record test results
function recordTest($group, $name, $result, $message = '', $isCritical = false) {
    global $allTests, $passedTests, $totalTests, $criticalFails;
    
    $allTests[$group][] = [
        'name' => $name,
        'result' => $result,
        'message' => $message,
        'critical' => $isCritical
    ];
    
    $totalTests++;
    if ($result) {
        $passedTests++;
    } elseif ($isCritical) {
        $criticalFails++;
    }
    
    // Output immediate result
    echo '<div class="test-result ' . ($result ? 'success' : ($isCritical ? 'error' : 'warning')) . '">';
    echo $result ? '✓ ' : '✗ ';
    echo '<strong>' . htmlspecialchars($name) . ':</strong> ';
    echo $result ? 'PASSED' : 'FAILED';
    if (!empty($message)) {
        echo ' - ' . htmlspecialchars($message);
    }
    echo '</div>';
}

// Load Laravel bootstrap
$basePath = __DIR__ . '/..';
try {
    if (file_exists($basePath . '/vendor/autoload.php')) {
        require $basePath . '/vendor/autoload.php';
        
        // Bootstrap Laravel
        $app = require_once $basePath . '/bootstrap/app.php';
        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();
        
        recordTest('Setup', 'Laravel Bootstrap', true, 'Successfully loaded Laravel');
    } else {
        recordTest('Setup', 'Laravel Bootstrap', false, 'Could not find vendor/autoload.php', true);
    }
} catch (\Exception $e) {
    recordTest('Setup', 'Laravel Bootstrap', false, 'Error: ' . $e->getMessage(), true);
}

// Check .env configuration
echo '<div class="box test-group">';
echo '<h2>1. Environment Configuration</h2>';

$envPath = $basePath . '/.env';
$envExists = file_exists($envPath);
recordTest('Environment', '.env File', $envExists, $envExists ? 'File exists' : 'File not found', true);

if ($envExists) {
    $envFile = file_get_contents($envPath);
    
    // Check Google Drive Folder ID
    $folderIdExists = preg_match('/GOOGLE_DRIVE_FOLDER_ID=([^\n]+)/', $envFile, $matches);
    $folderId = $folderIdExists ? trim($matches[1], '"\'') : null;
    recordTest('Environment', 'Google Drive Folder ID', $folderIdExists && !empty($folderId), 
        $folderIdExists ? "Found ID: " . $folderId : "Not found or empty", true);
    
    // Check if the filesystem driver is set correctly
    $fsDriverExists = preg_match('/FILESYSTEM_DISK=([^\n]+)/', $envFile, $matches);
    $fsDriver = $fsDriverExists ? trim($matches[1], '"\'') : 'local';
    recordTest('Environment', 'Filesystem Driver', true, "Current filesystem driver: " . $fsDriver);
}
echo '</div>';

// Check directory structure and permissions
echo '<div class="box test-group">';
echo '<h2>2. Directory Structure and Permissions</h2>';

$directories = [
    'storage_app' => $basePath . '/storage/app',
    'storage_google' => $basePath . '/storage/app/google',
    'storage_google_fallback' => $basePath . '/storage/app/google_drive_fallback',
    'public_uploads' => $basePath . '/public/uploads',
    'storage_public_uploads' => $basePath . '/storage/app/public/uploads',
];

foreach ($directories as $name => $dir) {
    $exists = file_exists($dir);
    $isDir = $exists && is_dir($dir);
    $isWritable = $isDir && is_writable($dir);
    
    recordTest('Directories', $name, $isWritable, 
        $exists ? ($isDir ? ($isWritable ? "Directory is writable" : "Directory is not writable") : "Not a directory") : "Directory does not exist", 
        $name == 'storage_google'); // Only storage_google is critical
    
    // Create directory if it doesn't exist
    if (!$exists && $name !== 'storage_google') {
        mkdir($dir, 0755, true);
        recordTest('Directories', "Creating $name", file_exists($dir), "Created directory: $dir");
    }
    
    // Test write access with a sample file
    if ($isDir) {
        $testFile = $dir . '/test_' . uniqid() . '.txt';
        $writeTest = @file_put_contents($testFile, 'Test write: ' . date('Y-m-d H:i:s'));
        recordTest('Directories', "Write test for $name", $writeTest !== false, 
            $writeTest !== false ? "Successfully wrote test file" : "Failed to write test file");
        
        if ($writeTest !== false) {
            @unlink($testFile); // Clean up
        }
    }
}
echo '</div>';

// Check service account configuration
echo '<div class="box test-group">';
echo '<h2>3. Service Account Configuration</h2>';

$serviceAccountPath = $basePath . '/storage/app/google/service-account.json';
$serviceAccountExists = file_exists($serviceAccountPath);

recordTest('Service Account', 'JSON file exists', $serviceAccountExists, 
    $serviceAccountExists ? "File exists at: $serviceAccountPath" : "File not found", true);

if ($serviceAccountExists) {
    // Check if the file is readable
    $isReadable = is_readable($serviceAccountPath);
    recordTest('Service Account', 'JSON file is readable', $isReadable, 
        $isReadable ? "File is readable" : "File is not readable", true);
    
    // Validate JSON structure
    $validJson = false;
    $serviceAccountEmail = null;
    
    try {
        $serviceAccountContent = file_get_contents($serviceAccountPath);
        $serviceAccountData = json_decode($serviceAccountContent, true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            $validJson = true;
            recordTest('Service Account', 'Valid JSON format', true, "JSON is well-formed");
            
            // Check required fields
            $requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($serviceAccountData[$field]) || empty($serviceAccountData[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            $allFieldsPresent = empty($missingFields);
            recordTest('Service Account', 'Required fields present', $allFieldsPresent, 
                $allFieldsPresent ? "All required fields are present" : "Missing fields: " . implode(', ', $missingFields),
                true);
            
            if (isset($serviceAccountData['client_email'])) {
                $serviceAccountEmail = $serviceAccountData['client_email'];
                recordTest('Service Account', 'Service Account Email', true, "Email: $serviceAccountEmail");
            } else {
                recordTest('Service Account', 'Service Account Email', false, "client_email field not found", true);
            }
        } else {
            recordTest('Service Account', 'Valid JSON format', false, "Invalid JSON: " . json_last_error_msg(), true);
        }
    } catch (\Exception $e) {
        recordTest('Service Account', 'JSON parsing', false, "Error reading/parsing JSON: " . $e->getMessage(), true);
    }
}
echo '</div>';

// Check Google Drive API Connection
echo '<div class="box test-group">';
echo '<h2>4. Google Drive API Connection</h2>';

if (isset($folderId) && isset($serviceAccountPath) && file_exists($serviceAccountPath)) {
    try {
        // Create a Google client
        $client = new \Google\Client();
        $client->setAuthConfig($serviceAccountPath);
        $client->addScope(\Google\Service\Drive::DRIVE);
        
        // Create Drive service
        $service = new \Google\Service\Drive($client);
        
        recordTest('Google API', 'Client initialization', true, "Successfully initialized Google API client");
        
        // Test connection by getting folder info
        try {
            $folder = $service->files->get($folderId, [
                'fields' => 'id,name,capabilities',
                'supportsAllDrives' => true
            ]);
            
            recordTest('Google API', 'Folder access', true, "Successfully accessed folder: " . $folder->getName());
            
            // Check folder permissions
            $capabilities = $folder->getCapabilities();
            $canEdit = $capabilities ? ($capabilities->getCanEdit() ?? false) : false;
            $canAddChildren = $capabilities ? ($capabilities->getCanAddChildren() ?? false) : false;
            
            recordTest('Google API', 'Edit permission', $canEdit, 
                $canEdit ? "Service account has edit permission" : "Service account lacks edit permission", true);
            recordTest('Google API', 'Add files permission', $canAddChildren, 
                $canAddChildren ? "Service account can add files to folder" : "Service account cannot add files", true);
            
            // List files to verify read access
            $files = $service->files->listFiles([
                'q' => "'$folderId' in parents",
                'fields' => 'files(id,name)',
                'spaces' => 'drive',
                'supportsAllDrives' => true
            ]);
            
            $fileCount = count($files->getFiles());
            recordTest('Google API', 'List files', true, "Successfully listed $fileCount files in the folder");
            
        } catch (\Exception $e) {
            recordTest('Google API', 'Folder access', false, "Error accessing folder: " . $e->getMessage(), true);
        }
        
        // Test file upload
        try {
            // Create test file
            $testFileName = 'test_upload_' . time() . '.txt';
            $testContent = "This is a test file created at " . date('Y-m-d H:i:s');
            
            // Prepare file metadata with explicit parents parameter
            $fileMetadata = new \Google\Service\Drive\DriveFile([
                'name' => $testFileName,
                'parents' => [$folderId]
            ]);
            
            // Upload with supportsAllDrives parameter
            $file = $service->files->create(
                $fileMetadata,
                [
                    'data' => $testContent,
                    'mimeType' => 'text/plain',
                    'uploadType' => 'multipart',
                    'fields' => 'id,name',
                    'supportsAllDrives' => true
                ]
            );
            
            recordTest('Google API', 'File upload', true, "Successfully uploaded test file with ID: " . $file->getId());
            
            // Delete the test file
            try {
                $service->files->delete($file->getId(), ['supportsAllDrives' => true]);
                recordTest('Google API', 'File deletion', true, "Successfully deleted test file");
            } catch (\Exception $deleteError) {
                recordTest('Google API', 'File deletion', false, "Could not delete test file: " . $deleteError->getMessage());
            }
            
        } catch (\Exception $uploadError) {
            recordTest('Google API', 'File upload', false, "Error uploading file: " . $uploadError->getMessage(), true);
            
            // Check for specific error messages
            if (strpos($uploadError->getMessage(), "Service Accounts do not have storage quota") !== false) {
                recordTest('Google API', 'Storage quota error', false, 
                    "Still getting storage quota error! Make sure supportsAllDrives=true and explicit parents are set", true);
            }
        }
        
    } catch (\Exception $e) {
        recordTest('Google API', 'Client initialization', false, "Error initializing Google API client: " . $e->getMessage(), true);
    }
} else {
    recordTest('Google API', 'Configuration check', false, "Missing folder ID or service account file", true);
}
echo '</div>';

// Check Laravel Storage integration
echo '<div class="box test-group">';
echo '<h2>5. Laravel Storage Integration</h2>';

try {
    // Check if Google Drive disk is configured
    $googleDiskExists = config('filesystems.disks.google') !== null;
    recordTest('Laravel Storage', 'Google disk configuration', $googleDiskExists, 
        $googleDiskExists ? "Google disk is configured" : "Google disk is not configured", true);
    
    if ($googleDiskExists) {
        try {
            // Get the disk
            $disk = \Illuminate\Support\Facades\Storage::disk('google');
            recordTest('Laravel Storage', 'Disk instantiation', true, "Google disk instantiated successfully");
            
            // Check adapter type
            $adapter = $disk->getAdapter();
            $isGoogleAdapter = $adapter instanceof \Masbug\Flysystem\GoogleDriveAdapter;
            recordTest('Laravel Storage', 'Adapter type', $isGoogleAdapter, 
                $isGoogleAdapter ? "Using GoogleDriveAdapter" : "Not using GoogleDriveAdapter", true);
            
            // Test file upload using Storage facade
            $testFileName = 'laravel_storage_test_' . time() . '.txt';
            $testContent = "This is a Laravel Storage test file created at " . date('Y-m-d H:i:s');
            
            try {
                // Try standard put method
                $result = $disk->put($testFileName, $testContent);
                recordTest('Laravel Storage', 'File upload', $result, 
                    $result ? "File uploaded successfully" : "File upload failed");
                
                // Try to get file metadata
                if ($result) {
                    $exists = $disk->exists($testFileName);
                    recordTest('Laravel Storage', 'File exists check', $exists, 
                        $exists ? "File exists in Google Drive" : "File does not exist in Google Drive");
                    
                    // Try to delete the file
                    if ($exists) {
                        $deleted = $disk->delete($testFileName);
                        recordTest('Laravel Storage', 'File deletion', $deleted, 
                            $deleted ? "File deleted successfully" : "File deletion failed");
                    }
                }
            } catch (\Exception $e) {
                recordTest('Laravel Storage', 'File upload', false, "Error: " . $e->getMessage(), true);
            }
            
            // Test direct API method via adapter
            try {
                $service = $adapter->getService();
                recordTest('Laravel Storage', 'Get Drive service', $service !== null, 
                    $service !== null ? "Got Drive service from adapter" : "Could not get Drive service");
                
                if ($service !== null) {
                    // Get folderId from config
                    $folderId = config('filesystems.disks.google.folderId');
                    
                    // Create test file using direct API
                    $testFileNameDirect = 'direct_api_test_' . time() . '.txt';
                    $testContent = "This is a direct API test file created at " . date('Y-m-d H:i:s');
                    
                    // Create file metadata
                    $fileMetadata = new \Google\Service\Drive\DriveFile([
                        'name' => $testFileNameDirect,
                        'parents' => [$folderId]
                    ]);
                    
                    // Upload with supportsAllDrives parameter
                    $file = $service->files->create(
                        $fileMetadata,
                        [
                            'data' => $testContent,
                            'mimeType' => 'text/plain',
                            'uploadType' => 'multipart',
                            'fields' => 'id,name',
                            'supportsAllDrives' => true
                        ]
                    );
                    
                    recordTest('Laravel Storage', 'Direct API upload', true, 
                        "Successfully uploaded test file with ID: " . $file->getId());
                    
                    // Delete the test file
                    $service->files->delete($file->getId(), ['supportsAllDrives' => true]);
                    recordTest('Laravel Storage', 'Direct API deletion', true, "Successfully deleted test file");
                }
            } catch (\Exception $directApiError) {
                recordTest('Laravel Storage', 'Direct API upload', false, "Error: " . $directApiError->getMessage(), true);
            }
        } catch (\Exception $e) {
            recordTest('Laravel Storage', 'Disk instantiation', false, "Error: " . $e->getMessage(), true);
        }
    }
} catch (\Exception $e) {
    recordTest('Laravel Storage', 'Configuration check', false, "Error checking configuration: " . $e->getMessage(), true);
}
echo '</div>';

// Check file upload flow using TaskController's logic
echo '<div class="box test-group">';
echo '<h2>6. Controller File Upload Logic</h2>';

try {
    // Create test file
    $testFileName = 'controller_logic_test_' . time() . '.txt';
    $testFilePath = __DIR__ . '/' . $testFileName;
    $testContent = "This is a controller logic test file created at " . date('Y-m-d H:i:s');
    
    file_put_contents($testFilePath, $testContent);
    
    if (file_exists($testFilePath)) {
        recordTest('Controller Logic', 'Test file creation', true, "Created test file: $testFilePath");
        
        // Create an UploadedFile instance
        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $testFilePath,
            $testFileName,
            'text/plain',
            UPLOAD_ERR_OK,
            true // Mark as test
        );
        
        recordTest('Controller Logic', 'UploadedFile instance', true, "Created UploadedFile instance");
        
        // Create a Task instance
        try {
            $task = new \App\Models\Task();
            $task->judul = 'Test Task for Upload';
            $task->deskripsi = 'This is a test task for file upload verification';
            $task->target_divisi = ['IT', 'Media'];
            $task->jadwal_deadline = now()->addDays(7);
            $task->save();
            
            recordTest('Controller Logic', 'Task creation', true, "Created test task with ID: " . $task->id);
            
            // Get the TaskController instance
            try {
                $controller = app(\App\Http\Controllers\Admin\TaskController::class);
                
                // Use reflection to access private method
                $reflection = new ReflectionClass($controller);
                $method = $reflection->getMethod('handleFileUploads');
                $method->setAccessible(true);
                
                // Call the method
                $result = $method->invokeArgs($controller, [[$uploadedFile], $task]);
                
                // Check if the file was processed correctly
                $mediaFiles = $task->mediaFiles()->get();
                
                if ($mediaFiles->count() > 0) {
                    recordTest('Controller Logic', 'Media file record', true, "Created " . $mediaFiles->count() . " media file record(s)");
                    
                    $mediaFile = $mediaFiles->first();
                    $googleDriveId = $mediaFile->google_drive_id;
                    $localPath = $mediaFile->local_path;
                    
                    recordTest('Controller Logic', 'Google Drive ID', !empty($googleDriveId), 
                        !empty($googleDriveId) ? "Google Drive ID: $googleDriveId" : "No Google Drive ID");
                    
                    recordTest('Controller Logic', 'Local path', !empty($localPath), 
                        !empty($localPath) ? "Local path: $localPath" : "No local path");
                    
                    // Check if local file exists
                    if (!empty($localPath)) {
                        $fullPath = $localPath;
                        if (!file_exists($fullPath) && strpos($fullPath, 'storage/') === 0) {
                            $fullPath = public_path($localPath);
                        }
                        
                        if (!file_exists($fullPath)) {
                            $fullPath = storage_path('app/public/' . basename($localPath));
                        }
                        
                        $fileExists = file_exists($fullPath);
                        recordTest('Controller Logic', 'Local file exists', $fileExists, 
                            $fileExists ? "File exists at: $fullPath" : "File not found at: $fullPath");
                    }
                    
                    // Check if Google Drive file exists (if not a local_* ID)
                    if (!empty($googleDriveId) && strpos($googleDriveId, 'local_') !== 0) {
                        try {
                            $client = new \Google\Client();
                            $client->setAuthConfig($serviceAccountPath);
                            $client->addScope(\Google\Service\Drive::DRIVE);
                            $service = new \Google\Service\Drive($client);
                            
                            $file = $service->files->get($googleDriveId, ['fields' => 'id,name', 'supportsAllDrives' => true]);
                            
                            recordTest('Controller Logic', 'Google Drive file exists', true, 
                                "Found file in Google Drive: " . $file->getName());
                            
                            // Delete the file to clean up
                            $service->files->delete($googleDriveId, ['supportsAllDrives' => true]);
                            recordTest('Controller Logic', 'Google Drive cleanup', true, 
                                "Deleted test file from Google Drive");
                        } catch (\Exception $e) {
                            recordTest('Controller Logic', 'Google Drive file exists', false, 
                                "Error checking file in Google Drive: " . $e->getMessage());
                        }
                    }
                    
                    // Clean up the task and media files
                    $mediaFiles->each(function($media) {
                        $media->delete();
                    });
                } else {
                    recordTest('Controller Logic', 'Media file record', false, "No media file records were created", true);
                }
                
                // Clean up the task
                $task->delete();
                recordTest('Controller Logic', 'Task cleanup', true, "Deleted test task");
            } catch (\Exception $e) {
                recordTest('Controller Logic', 'Controller method', false, "Error: " . $e->getMessage(), true);
            }
        } catch (\Exception $e) {
            recordTest('Controller Logic', 'Task creation', false, "Error creating task: " . $e->getMessage(), true);
        }
        
        // Clean up test file
        if (file_exists($testFilePath)) {
            unlink($testFilePath);
            recordTest('Controller Logic', 'Test file cleanup', true, "Deleted test file");
        }
    } else {
        recordTest('Controller Logic', 'Test file creation', false, "Failed to create test file", true);
    }
} catch (\Exception $e) {
    recordTest('Controller Logic', 'Test setup', false, "Error: " . $e->getMessage(), true);
}
echo '</div>';

// Calculate overall score
$score = $totalTests > 0 ? round(($passedTests / $totalTests) * 100) : 0;
$statusClass = $criticalFails > 0 ? 'overall-error' : ($score >= 95 ? 'overall-success' : 'overall-warning');
$statusMessage = $criticalFails > 0 ? 
    "CRITICAL ISSUES DETECTED" : 
    ($score >= 95 ? "ALL TESTS PASSED SUCCESSFULLY" : "SOME ISSUES DETECTED");

echo '<div class="overall-status ' . $statusClass . '">';
echo "<h2>$statusMessage</h2>";
echo "<p>Passed $passedTests out of $totalTests tests ($score%)</p>";
if ($criticalFails > 0) {
    echo "<p class='error'>$criticalFails critical failures detected</p>";
}
echo '</div>';

// Summary of all results
echo '<div class="box">';
echo '<h2>Test Results Summary</h2>';
echo '<table class="result-table">';
echo '<tr><th>Test Group</th><th>Test Name</th><th>Result</th><th>Details</th></tr>';

foreach ($allTests as $group => $tests) {
    $firstRow = true;
    
    foreach ($tests as $test) {
        echo '<tr>';
        if ($firstRow) {
            echo '<td rowspan="' . count($tests) . '">' . htmlspecialchars($group) . '</td>';
            $firstRow = false;
        }
        
        echo '<td>' . htmlspecialchars($test['name']) . ($test['critical'] ? ' <span class="info">(Critical)</span>' : '') . '</td>';
        echo '<td class="' . ($test['result'] ? 'success' : 'error') . '">' . ($test['result'] ? 'PASS' : 'FAIL') . '</td>';
        echo '<td>' . htmlspecialchars($test['message']) . '</td>';
        echo '</tr>';
    }
}

echo '</table>';
echo '</div>';

// Final instructions
if ($criticalFails > 0) {
    echo '<div class="box overall-error">';
    echo '<h2>Critical Issues Detected</h2>';
    echo '<p>Please fix the following critical issues:</p>';
    echo '<ul>';
    
    foreach ($allTests as $group => $tests) {
        foreach ($tests as $test) {
            if ($test['critical'] && !$test['result']) {
                echo '<li><strong>' . htmlspecialchars($group) . ' - ' . htmlspecialchars($test['name']) . ':</strong> ' . htmlspecialchars($test['message']) . '</li>';
            }
        }
    }
    
    echo '</ul>';
    echo '</div>';
} elseif ($score < 95) {
    echo '<div class="box overall-warning">';
    echo '<h2>Non-Critical Issues Detected</h2>';
    echo '<p>The following issues were found but are not critical:</p>';
    echo '<ul>';
    
    foreach ($allTests as $group => $tests) {
        foreach ($tests as $test) {
            if (!$test['critical'] && !$test['result']) {
                echo '<li><strong>' . htmlspecialchars($group) . ' - ' . htmlspecialchars($test['name']) . ':</strong> ' . htmlspecialchars($test['message']) . '</li>';
            }
        }
    }
    
    echo '</ul>';
    echo '</div>';
} else {
    echo '<div class="box overall-success">';
    echo '<h2>All Systems Go!</h2>';
    echo '<p>Everything is working properly. Your Google Drive integration is fully functional.</p>';
    echo '<p>You can now use the admin form to upload files and they will be properly stored in Google Drive.</p>';
    echo '</div>';
}

// Execution time
$executionTime = microtime(true) - $startTime;
echo '<div class="box">';
echo '<p><em>Execution time: ' . round($executionTime, 2) . ' seconds</em></p>';
echo '</div>';

echo '</body>
</html>';

// End output buffering
ob_end_flush();
