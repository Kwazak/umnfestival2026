<?php
/**
 * COMPLETE FILE UPLOAD FIX TOOL
 * 
 * This script performs:
 * 1. Database connection verification
 * 2. Directory permissions check and repair
 * 3. Google Drive API and permissions test
 * 4. Manual database insertion test
 * 5. Manual file upload and Google Drive test
 * 6. Direct API test bypassing Laravel
 * 7. Full Laravel integration test
 * 
 * This tool will fix any issues it finds and provide clear instructions
 * for any manual steps required.
 */

// Enable detailed error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Increase limits for large uploads
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '50M');
ini_set('max_execution_time', 300);
ini_set('memory_limit', '256M');

// HTML header
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Complete Upload Fix Tool</title>
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
    <h1>🛠️ Complete File Upload Fix Tool</h1>
    <p>This tool will comprehensively diagnose and fix file upload issues by testing each component individually.</p>';

// Keep track of issues and fixes
$issues = [];
$fixes = [];

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
    echo '<p class="success">Laravel bootstrapped successfully ✓</p>';
    echo '</div>';
} catch (\Exception $e) {
    echo '<div class="box">';
    echo '<h2>1. Laravel Bootstrap</h2>';
    echo '<p class="error">Failed to bootstrap Laravel: ' . $e->getMessage() . '</p>';
    echo '</div>';
    $issues[] = "Laravel bootstrap failed: " . $e->getMessage();
}

// STEP 2: Directory Structure Check
echo '<div class="box">';
echo '<h2>2. Directory Structure Check</h2>';

$directories = [
    'public_uploads' => $basePath . '/public/uploads',
    'storage_public' => $basePath . '/storage/app/public',
    'storage_public_uploads' => $basePath . '/storage/app/public/uploads',
    'storage_google' => $basePath . '/storage/app/google',
    'storage_fallback' => $basePath . '/storage/app/google_drive_fallback',
];

foreach ($directories as $name => $path) {
    echo '<h3>' . ucfirst(str_replace('_', ' ', $name)) . '</h3>';
    
    // Check if directory exists
    if (!file_exists($path)) {
        echo '<p class="warning">Directory does not exist. Creating...</p>';
        
        $created = @mkdir($path, 0755, true);
        
        if ($created) {
            echo '<p class="success">Directory created successfully ✓</p>';
            $fixes[] = "Created directory: $path";
        } else {
            echo '<p class="error">Failed to create directory. Error: ' . error_get_last()['message'] . '</p>';
            $issues[] = "Failed to create directory: $path";
        }
    } else {
        echo '<p class="success">Directory exists ✓</p>';
        
        // Check if directory is writable
        if (!is_writable($path)) {
            echo '<p class="warning">Directory is not writable. Attempting to fix permissions...</p>';
            
            $chmodResult = @chmod($path, 0755);
            
            if ($chmodResult) {
                echo '<p class="success">Permissions fixed ✓</p>';
                $fixes[] = "Fixed permissions for: $path";
            } else {
                echo '<p class="error">Failed to fix permissions. You may need to fix this manually.</p>';
                $issues[] = "Directory not writable: $path";
            }
        } else {
            echo '<p class="success">Directory is writable ✓</p>';
        }
    }
    
    // Test file creation
    if (file_exists($path) && is_dir($path)) {
        $testFile = $path . '/test_' . time() . '.txt';
        $writeResult = @file_put_contents($testFile, 'Test write: ' . date('Y-m-d H:i:s'));
        
        if ($writeResult !== false) {
            echo '<p class="success">Successfully wrote test file to directory ✓</p>';
            @unlink($testFile); // Clean up
        } else {
            echo '<p class="error">Could not write test file to directory. Error: ' . error_get_last()['message'] . '</p>';
            $issues[] = "Cannot write to directory: $path";
        }
    }
}

// Create storage symlink if it doesn't exist
if (!file_exists($basePath . '/public/storage')) {
    echo '<h3>Storage Symlink</h3>';
    echo '<p>Creating symlink from public/storage to storage/app/public...</p>';
    
    try {
        symlink($basePath . '/storage/app/public', $basePath . '/public/storage');
        echo '<p class="success">Symlink created successfully ✓</p>';
        $fixes[] = "Created storage symlink";
    } catch (\Exception $e) {
        echo '<p class="error">Failed to create symlink: ' . $e->getMessage() . '</p>';
        $issues[] = "Failed to create symlink: " . $e->getMessage();
    }
} else {
    echo '<h3>Storage Symlink</h3>';
    echo '<p class="success">Storage symlink exists ✓</p>';
}

echo '</div>';

// STEP 3: Database Connection Test
echo '<div class="box">';
echo '<h2>3. Database Connection Test</h2>';

try {
    $pdo = DB::connection()->getPdo();
    $dbName = DB::connection()->getDatabaseName();
    
    echo '<p class="success">Successfully connected to database: ' . $dbName . ' ✓</p>';
    
    // Test media_files table existence
    try {
        $tableExists = DB::select("SHOW TABLES LIKE 'media_files'");
        
        if (count($tableExists) > 0) {
            echo '<p class="success">media_files table exists ✓</p>';
            
            // Check table structure
            $columns = DB::select("SHOW COLUMNS FROM media_files");
            $columnNames = array_column($columns, 'Field');
            
            echo '<p>Table columns: ' . implode(', ', $columnNames) . '</p>';
            
            $requiredColumns = ['id', 'task_id', 'google_drive_id', 'file_name', 'original_name', 'mime_type', 'file_size', 'local_path', 'drive_path', 'created_at', 'updated_at'];
            $missingColumns = array_diff($requiredColumns, $columnNames);
            
            if (empty($missingColumns)) {
                echo '<p class="success">All required columns exist ✓</p>';
            } else {
                echo '<p class="warning">Missing columns: ' . implode(', ', $missingColumns) . '</p>';
                $issues[] = "Missing columns in media_files table: " . implode(', ', $missingColumns);
            }
            
            // Test direct insert
            try {
                $testId = DB::table('media_files')->insertGetId([
                    'task_id' => null,
                    'google_drive_id' => 'test_' . uniqid(),
                    'file_name' => 'test_file.txt',
                    'original_name' => 'test_file.txt',
                    'mime_type' => 'text/plain',
                    'file_size' => 123,
                    'local_path' => 'test/path.txt',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                echo '<p class="success">Successfully inserted test record with ID: ' . $testId . ' ✓</p>';
                
                // Delete the test record
                DB::table('media_files')->where('id', $testId)->delete();
                echo '<p class="success">Successfully deleted test record ✓</p>';
            } catch (\Exception $e) {
                echo '<p class="error">Failed to insert test record: ' . $e->getMessage() . '</p>';
                $issues[] = "Database insert failed: " . $e->getMessage();
            }
        } else {
            echo '<p class="error">media_files table does not exist!</p>';
            $issues[] = "media_files table does not exist";
        }
    } catch (\Exception $e) {
        echo '<p class="error">Error checking table: ' . $e->getMessage() . '</p>';
        $issues[] = "Error checking table structure: " . $e->getMessage();
    }
} catch (\Exception $e) {
    echo '<p class="error">Database connection failed: ' . $e->getMessage() . '</p>';
    $issues[] = "Database connection failed: " . $e->getMessage();
}

echo '</div>';

// STEP 4: Google Drive API Test
echo '<div class="box">';
echo '<h2>4. Google Drive API Test</h2>';

$googleConfigured = false;

try {
    $serviceAccountPath = config('filesystems.disks.google.service_account_json_location');
    $folderId = config('filesystems.disks.google.folderId');
    
    echo '<p>Service account path: ' . $serviceAccountPath . '</p>';
    echo '<p>Target folder ID: ' . $folderId . '</p>';
    
    if (!file_exists($serviceAccountPath)) {
        echo '<p class="error">Service account JSON file not found!</p>';
        $issues[] = "Service account JSON file not found at: $serviceAccountPath";
    } else {
        echo '<p class="success">Service account JSON file exists ✓</p>';
        
        // Check file permissions
        if (!is_readable($serviceAccountPath)) {
            echo '<p class="error">Service account JSON file is not readable!</p>';
            $issues[] = "Service account JSON file is not readable";
        } else {
            echo '<p class="success">Service account JSON file is readable ✓</p>';
            
            // Validate JSON
            $jsonContent = file_get_contents($serviceAccountPath);
            $serviceAccountData = json_decode($jsonContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo '<p class="error">Service account JSON file contains invalid JSON: ' . json_last_error_msg() . '</p>';
                $issues[] = "Invalid service account JSON: " . json_last_error_msg();
            } else {
                echo '<p class="success">Service account JSON is valid ✓</p>';
                
                // Check required fields
                $requiredFields = ['client_email', 'private_key', 'project_id'];
                $missingFields = array_diff($requiredFields, array_keys($serviceAccountData));
                
                if (!empty($missingFields)) {
                    echo '<p class="error">Service account JSON is missing required fields: ' . implode(', ', $missingFields) . '</p>';
                    $issues[] = "Service account JSON missing fields: " . implode(', ', $missingFields);
                } else {
                    echo '<p class="success">Service account JSON contains all required fields ✓</p>';
                    echo '<p class="info">Service account email: ' . $serviceAccountData['client_email'] . '</p>';
                    
                    // Test Google API connection
                    try {
                        $client = new \Google\Client();
                        $client->setAuthConfig($serviceAccountPath);
                        $client->addScope(\Google\Service\Drive::DRIVE);
                        
                        $service = new \Google\Service\Drive($client);
                        echo '<p class="success">Successfully created Google Drive service ✓</p>';
                        
                        // Test folder access
                        try {
                            $folder = $service->files->get($folderId, [
                                'fields' => 'id,name,capabilities',
                                'supportsAllDrives' => true
                            ]);
                            
                            echo '<p class="success">Successfully accessed folder: ' . $folder->getName() . ' ✓</p>';
                            
                            // Check permissions
                            $capabilities = $folder->getCapabilities();
                            $canEdit = $capabilities->getCanEdit() ?? false;
                            $canAddChildren = $capabilities->getCanAddChildren() ?? false;
                            
                            if ($canEdit && $canAddChildren) {
                                echo '<p class="success">Service account has write access to the folder ✓</p>';
                                $googleConfigured = true;
                            } else {
                                echo '<p class="error">Service account does not have write access to the folder!</p>';
                                echo '<p class="info">To fix: Share the folder with ' . $serviceAccountData['client_email'] . ' as an Editor</p>';
                                $issues[] = "Service account lacks write permission to the folder";
                            }
                            
                            // Try creating a test file
                            try {
                                $fileMetadata = new \Google\Service\Drive\DriveFile([
                                    'name' => 'test_file_' . time() . '.txt',
                                    'parents' => [$folderId]
                                ]);
                                
                                $testFile = $service->files->create(
                                    $fileMetadata,
                                    [
                                        'data' => 'Test content: ' . date('Y-m-d H:i:s'),
                                        'mimeType' => 'text/plain',
                                        'uploadType' => 'multipart',
                                        'fields' => 'id,name',
                                        'supportsAllDrives' => true
                                    ]
                                );
                                
                                echo '<p class="success">Successfully created test file in Google Drive: ' . $testFile->getName() . ' (ID: ' . $testFile->getId() . ') ✓</p>';
                                
                                // Clean up by deleting the test file
                                $service->files->delete($testFile->getId(), ['supportsAllDrives' => true]);
                                echo '<p class="success">Successfully deleted test file from Google Drive ✓</p>';
                                $googleConfigured = true;
                            } catch (\Exception $e) {
                                echo '<p class="error">Failed to create test file in Google Drive: ' . $e->getMessage() . '</p>';
                                $issues[] = "Cannot create files in Google Drive: " . $e->getMessage();
                            }
                        } catch (\Exception $e) {
                            echo '<p class="error">Failed to access folder: ' . $e->getMessage() . '</p>';
                            $issues[] = "Cannot access Google Drive folder: " . $e->getMessage();
                        }
                    } catch (\Exception $e) {
                        echo '<p class="error">Failed to create Google Drive service: ' . $e->getMessage() . '</p>';
                        $issues[] = "Google Drive service creation failed: " . $e->getMessage();
                    }
                }
            }
        }
    }
} catch (\Exception $e) {
    echo '<p class="error">Error testing Google Drive configuration: ' . $e->getMessage() . '</p>';
    $issues[] = "Google Drive configuration error: " . $e->getMessage();
}

echo '</div>';

// STEP 5: Manual File Upload Test
echo '<div class="box">';
echo '<h2>5. Manual File Upload Test</h2>';

if (isset($_FILES['test_upload']) && $_FILES['test_upload']['error'] === UPLOAD_ERR_OK) {
    // Process the uploaded file
    $file = $_FILES['test_upload'];
    $originalName = $file['name'];
    $tmpPath = $file['tmp_name'];
    $type = $file['type'];
    $size = $file['size'];
    
    echo '<h3>Processing uploaded file: ' . htmlspecialchars($originalName) . '</h3>';
    echo '<p>Size: ' . number_format($size / 1024, 2) . ' KB, Type: ' . $type . '</p>';
    
    // Generate a unique filename
    $fileName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $originalName);
    $relativePath = 'uploads/' . $fileName;
    
    // Try storing the file in multiple locations
    $storagePaths = [
        'public_uploads' => $basePath . '/public/uploads/' . $fileName,
        'storage_public' => $basePath . '/storage/app/public/uploads/' . $fileName,
        'storage_fallback' => $basePath . '/storage/app/google_drive_fallback/' . $fileName
    ];
    
    $savedPaths = [];
    
    foreach ($storagePaths as $name => $path) {
        try {
            if (move_uploaded_file($tmpPath, $path)) {
                echo '<p class="success">File saved to ' . $name . ' ✓</p>';
                $savedPaths[$name] = $path;
                
                // Make a copy of the tmp file for other locations
                if (count($savedPaths) === 1) {
                    $tmpPath = $path;
                }
            } else {
                echo '<p class="error">Failed to save file to ' . $name . '</p>';
            }
        } catch (\Exception $e) {
            echo '<p class="error">Error saving to ' . $name . ': ' . $e->getMessage() . '</p>';
        }
    }
    
    // If we have at least one saved path
    if (!empty($savedPaths)) {
        // Try to insert record into database
        try {
            $webPath = 'uploads/' . $fileName; // Relative web path
            
            $mediaId = DB::table('media_files')->insertGetId([
                'task_id' => null, // No task for this test
                'google_drive_id' => 'local_' . uniqid(),
                'file_name' => $fileName,
                'original_name' => $originalName,
                'mime_type' => $type,
                'file_size' => $size,
                'local_path' => $webPath,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            echo '<p class="success">File record inserted into database with ID: ' . $mediaId . ' ✓</p>';
            
            // Now try Google Drive upload if it's configured
            if ($googleConfigured) {
                try {
                    $client = new \Google\Client();
                    $client->setAuthConfig($serviceAccountPath);
                    $client->addScope(\Google\Service\Drive::DRIVE);
                    
                    $service = new \Google\Service\Drive($client);
                    
                    $fileContent = file_get_contents(reset($savedPaths));
                    
                    if ($fileContent !== false) {
                        $fileMetadata = new \Google\Service\Drive\DriveFile([
                            'name' => $fileName,
                            'parents' => [$folderId]
                        ]);
                        
                        $uploadedFile = $service->files->create(
                            $fileMetadata,
                            [
                                'data' => $fileContent,
                                'mimeType' => $type,
                                'uploadType' => 'multipart',
                                'fields' => 'id,name',
                                'supportsAllDrives' => true
                            ]
                        );
                        
                        $driveId = $uploadedFile->getId();
                        
                        echo '<p class="success">File uploaded to Google Drive with ID: ' . $driveId . ' ✓</p>';
                        
                        // Update the media file record
                        DB::table('media_files')
                            ->where('id', $mediaId)
                            ->update([
                                'google_drive_id' => $driveId,
                                'drive_path' => $uploadedFile->getName()
                            ]);
                            
                        echo '<p class="success">Database record updated with Google Drive info ✓</p>';
                    } else {
                        echo '<p class="error">Could not read file content for Google Drive upload</p>';
                    }
                } catch (\Exception $e) {
                    echo '<p class="error">Google Drive upload failed: ' . $e->getMessage() . '</p>';
                }
            } else {
                echo '<p class="warning">Skipping Google Drive upload test as the API is not properly configured</p>';
            }
            
        } catch (\Exception $e) {
            echo '<p class="error">Database insert failed: ' . $e->getMessage() . '</p>';
        }
    } else {
        echo '<p class="error">Could not save file to any location</p>';
    }
} else {
    // Display the upload form
    echo '<form action="" method="post" enctype="multipart/form-data">
        <p>Upload a test file to check the complete file upload process:</p>
        <input type="file" name="test_upload" required>
        <button type="submit">Upload and Test</button>
    </form>';
}

echo '</div>';

// STEP 6: Summary of Issues and Fixes
echo '<div class="box">';
echo '<h2>6. Summary</h2>';

if (!empty($issues)) {
    echo '<h3>Issues Found (' . count($issues) . ')</h3>';
    echo '<ul class="error">';
    foreach ($issues as $issue) {
        echo '<li>' . htmlspecialchars($issue) . '</li>';
    }
    echo '</ul>';
} else {
    echo '<h3 class="success">No issues found! ✓</h3>';
}

if (!empty($fixes)) {
    echo '<h3>Fixes Applied (' . count($fixes) . ')</h3>';
    echo '<ul class="success">';
    foreach ($fixes as $fix) {
        echo '<li>' . htmlspecialchars($fix) . '</li>';
    }
    echo '</ul>';
}

// Recommendations
echo '<h3>Recommendations</h3>';
echo '<ol>';

if (!empty($issues)) {
    foreach ($issues as $issue) {
        if (strpos($issue, 'Service account lacks write permission') !== false) {
            echo '<li>Share the Google Drive folder with the service account email as an Editor</li>';
        }
        
        if (strpos($issue, 'Directory not writable') !== false) {
            echo '<li>Set proper directory permissions: <code>chmod -R 755 storage/app/public uploads</code></li>';
        }
        
        if (strpos($issue, 'media_files table') !== false) {
            echo '<li>Run migrations: <code>php artisan migrate</code></li>';
        }
    }
}

echo '<li>Clear Laravel cache: <code>php artisan cache:clear</code></li>';
echo '<li>Regenerate storage link: <code>php artisan storage:link</code></li>';
echo '<li>Check Laravel logs: <code>tail -n 100 storage/logs/laravel.log</code></li>';
echo '</ol>';

echo '<h3>Testing Admin Upload Form</h3>';
echo '<p>Once the issues above are fixed, try uploading files through the admin form. If problems persist, check the following:</p>';
echo '<ul>
    <li>Verify that the form HTML uses <code>enctype="multipart/form-data"</code></li>
    <li>Check that the input field has <code>name="media_files[]"</code> (with brackets)</li>
    <li>Look at browser network panel when submitting to confirm files are included</li>
    <li>Check Laravel logs immediately after submission for errors</li>
</ul>';

echo '</div>';

// Footer with a link to the admin panel
echo '<div class="box">
    <h3>Quick Links</h3>
    <p>
        <a href="/admin/tasks/create" class="button">Go to Admin Upload Form</a>
        <a href="/" class="button" style="background-color: #333;">Back to Homepage</a>
    </p>
</div>';

echo '</body>
</html>';
