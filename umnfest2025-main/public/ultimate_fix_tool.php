<?php
// Ultimate Upload and Database Test/Fix Tool

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Google\Client;
use Google\Service\Drive;

// Initialize variables
$messages = [];
$errors = [];
$fixes = [];
$systemChecks = [];

// Helper function to format bytes
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// Helper function to check directory and permissions
function checkDirectory($path, $name) {
    $result = [
        'name' => $name,
        'path' => $path,
        'exists' => file_exists($path),
        'is_dir' => is_dir($path),
        'writable' => is_writable($path),
        'permissions' => null,
    ];
    
    if ($result['exists']) {
        $result['permissions'] = substr(sprintf('%o', fileperms($path)), -4);
    }
    
    // Create directory if it doesn't exist
    if (!$result['exists']) {
        $created = @mkdir($path, 0755, true);
        $result['created'] = $created;
        if ($created) {
            @chmod($path, 0755);
            $result['exists'] = true;
            $result['is_dir'] = true;
            $result['writable'] = is_writable($path);
            $result['permissions'] = substr(sprintf('%o', fileperms($path)), -4);
        }
    }
    
    // Write test
    if ($result['exists'] && $result['is_dir'] && $result['writable']) {
        $testFile = $path . '/test_' . uniqid() . '.txt';
        $writeResult = @file_put_contents($testFile, 'Test write: ' . date('Y-m-d H:i:s'));
        $result['write_test'] = ($writeResult !== false);
        if ($result['write_test']) {
            @unlink($testFile);
        }
    } else {
        $result['write_test'] = false;
    }
    
    return $result;
}

// Function to test Google Drive folder permissions
function testGoogleDrivePermissions($service, $folderId) {
    try {
        // Check if folder exists and get its capabilities
        $folder = $service->files->get($folderId, ['fields' => 'capabilities,name']);
        
        $result = [
            'success' => true,
            'name' => $folder->getName(),
            'canEdit' => $folder->getCapabilities()->getCanEdit(),
            'canAddChildren' => $folder->getCapabilities()->getCanAddChildren(),
        ];
        
        // Test write by creating a small file
        $testContent = 'Test file created at ' . date('Y-m-d H:i:s');
        $testFile = 'permissions_test_' . time() . '.txt';
        
        try {
            $fileMetadata = new \Google\Service\Drive\DriveFile([
                'name' => $testFile,
                'parents' => [$folderId]
            ]);
            
            $createdFile = $service->files->create(
                $fileMetadata,
                [
                    'data' => $testContent,
                    'mimeType' => 'text/plain',
                    'uploadType' => 'multipart',
                    'fields' => 'id,name'
                ]
            );
            
            $result['write_test'] = true;
            $result['test_file_id'] = $createdFile->getId();
            
            // Delete the test file
            $service->files->delete($createdFile->getId());
            $result['cleanup'] = true;
        } catch (\Exception $e) {
            $result['write_test'] = false;
            $result['write_error'] = $e->getMessage();
        }
        
        return $result;
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Run system checks
try {
    // Check PHP version and extensions
    $systemChecks['php_version'] = PHP_VERSION;
    $systemChecks['php_extensions'] = get_loaded_extensions();
    
    // Check important extensions
    $requiredExtensions = ['pdo_mysql', 'fileinfo', 'curl', 'json', 'openssl'];
    $missingExtensions = array_filter($requiredExtensions, function($ext) {
        return !extension_loaded($ext);
    });
    
    $systemChecks['missing_extensions'] = $missingExtensions;
    
    // Check Laravel version
    $systemChecks['laravel_version'] = app()->version();
    
    // Check file upload limits
    $systemChecks['upload_max_filesize'] = ini_get('upload_max_filesize');
    $systemChecks['post_max_size'] = ini_get('post_max_size');
    $systemChecks['memory_limit'] = ini_get('memory_limit');
    
    // Check temp directory
    $systemChecks['temp_dir'] = sys_get_temp_dir();
    $tempDirCheck = checkDirectory(sys_get_temp_dir(), 'PHP Temp Directory');
    $systemChecks['temp_dir_writable'] = $tempDirCheck['writable'];
    
    // Check important directories
    $directories = [
        'storage_app' => storage_path('app'),
        'storage_public' => storage_path('app/public'),
        'storage_uploads' => storage_path('app/public/uploads'),
        'storage_google_fallback' => storage_path('app/google_drive_fallback'),
        'public_uploads' => public_path('uploads'),
        'public_storage' => public_path('storage'),
    ];
    
    $systemChecks['directories'] = [];
    
    foreach ($directories as $key => $path) {
        $systemChecks['directories'][$key] = checkDirectory($path, $key);
        
        // Fix permissions if needed
        if ($systemChecks['directories'][$key]['exists'] && !$systemChecks['directories'][$key]['write_test']) {
            @chmod($path, 0755);
            $systemChecks['directories'][$key]['permissions'] = substr(sprintf('%o', fileperms($path)), -4);
            $systemChecks['directories'][$key]['writable'] = is_writable($path);
            
            // Try write test again
            $testFile = $path . '/test_' . uniqid() . '.txt';
            $writeResult = @file_put_contents($testFile, 'Test write: ' . date('Y-m-d H:i:s'));
            $systemChecks['directories'][$key]['write_test'] = ($writeResult !== false);
            if ($systemChecks['directories'][$key]['write_test']) {
                @unlink($testFile);
            }
        }
    }
    
    // Check storage link
    $storageLinkExists = file_exists(public_path('storage'));
    $systemChecks['storage_link_exists'] = $storageLinkExists;
    
    // Create storage link if it doesn't exist
    if (!$storageLinkExists) {
        try {
            symlink(storage_path('app/public'), public_path('storage'));
            $fixes[] = "Created missing storage symlink";
            $systemChecks['storage_link_created'] = true;
            $systemChecks['storage_link_exists'] = true;
        } catch (\Exception $e) {
            $errors[] = "Failed to create storage symlink: " . $e->getMessage();
            $systemChecks['storage_link_created'] = false;
        }
    }
    
    // Check database connection
    try {
        $pdo = DB::connection()->getPdo();
        $databaseName = DB::connection()->getDatabaseName();
        $systemChecks['database_connection'] = true;
        $systemChecks['database_name'] = $databaseName;
        
        // Check tables
        $tables = DB::select('SHOW TABLES');
        $tableNames = [];
        foreach ($tables as $table) {
            $tableNames[] = reset($table);
        }
        $systemChecks['database_tables'] = $tableNames;
        
        // Check if media_files table exists
        if (Schema::hasTable('media_files')) {
            $systemChecks['media_files_table_exists'] = true;
            
            // Check media_files table structure
            $columns = Schema::getColumnListing('media_files');
            $systemChecks['media_files_columns'] = $columns;
            
            // Check required columns
            $requiredColumns = ['task_id', 'google_drive_id', 'file_name', 'original_name', 'mime_type', 'file_size'];
            $missingColumns = array_diff($requiredColumns, $columns);
            
            if (empty($missingColumns)) {
                $systemChecks['media_files_columns_ok'] = true;
            } else {
                $systemChecks['media_files_columns_ok'] = false;
                $systemChecks['missing_columns'] = $missingColumns;
                $errors[] = "The media_files table is missing required columns: " . implode(', ', $missingColumns);
            }
            
            // Test INSERT and DELETE
            try {
                // Create a test record
                $id = DB::table('media_files')->insertGetId([
                    'task_id' => 1,  // Assuming task ID 1 exists, or use a task that does exist
                    'google_drive_id' => 'test_' . time(),
                    'file_name' => 'test_file.txt',
                    'original_name' => 'test_file.txt',
                    'mime_type' => 'text/plain',
                    'file_size' => 123,
                    'local_path' => 'test/path',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $systemChecks['database_insert_test'] = true;
                
                // Delete the test record
                DB::table('media_files')->where('id', $id)->delete();
                $systemChecks['database_delete_test'] = true;
            } catch (\Exception $e) {
                $systemChecks['database_insert_test'] = false;
                $errors[] = "Database insert/delete test failed: " . $e->getMessage();
            }
        } else {
            $systemChecks['media_files_table_exists'] = false;
            $errors[] = "The media_files table does not exist in the database";
        }
    } catch (\Exception $e) {
        $systemChecks['database_connection'] = false;
        $errors[] = "Database connection failed: " . $e->getMessage();
    }
    
    // Check Google Drive configuration
    $googleConfig = config('filesystems.disks.google');
    $systemChecks['google_drive_config'] = $googleConfig ? true : false;
    
    if ($googleConfig) {
        // Sanitize the output to avoid displaying sensitive information
        $safeConfig = [];
        foreach ($googleConfig as $key => $value) {
            if (in_array($key, ['clientId', 'folderId'])) {
                $safeConfig[$key] = $value;
            } elseif ($key === 'service_account_json_location') {
                $safeConfig[$key] = $value;
                $safeConfig['file_exists'] = file_exists($value) ? 'Yes' : 'No';
                $safeConfig['file_readable'] = is_readable($value) ? 'Yes' : 'No';
                if (file_exists($value)) {
                    $jsonContent = json_decode(file_get_contents($value), true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $safeConfig['json_valid'] = 'Yes';
                        $safeConfig['client_email_present'] = isset($jsonContent['client_email']) ? 'Yes' : 'No';
                        if (isset($jsonContent['client_email'])) {
                            $safeConfig['client_email'] = $jsonContent['client_email'];
                        }
                    } else {
                        $safeConfig['json_valid'] = 'No - ' . json_last_error_msg();
                    }
                }
            } else {
                $safeConfig[$key] = '[masked]';
            }
        }
        
        $systemChecks['google_drive_safe_config'] = $safeConfig;
        
        // Test Google Drive connection
        try {
            $client = new Client();
            $client->setAuthConfig($googleConfig['service_account_json_location']);
            $client->addScope(Drive::DRIVE);
            $service = new Drive($client);
            
            // List files to test connection
            $files = $service->files->listFiles([
                'q' => "'{$googleConfig['folderId']}' in parents and trashed=false",
                'fields' => 'files(id, name)',
            ]);
            
            $systemChecks['google_drive_connection'] = true;
            $systemChecks['google_drive_files_count'] = count($files->getFiles());
            
            // Test folder permissions
            $permissionTest = testGoogleDrivePermissions($service, $googleConfig['folderId']);
            $systemChecks['google_drive_permissions'] = $permissionTest;
            
            if ($permissionTest['success'] && $permissionTest['write_test']) {
                $messages[] = "Google Drive folder permissions check PASSED - you have write access!";
            } else if ($permissionTest['success'] && !$permissionTest['write_test']) {
                $errors[] = "Google Drive folder permissions check FAILED - you only have read access, need write access.";
                
                // Get the service account email
                if (isset($safeConfig['client_email'])) {
                    $errors[] = "Share your Google Drive folder with this email as Editor: " . $safeConfig['client_email'];
                }
            } else {
                $errors[] = "Google Drive folder permissions check failed: " . ($permissionTest['error'] ?? 'Unknown error');
            }
            
            // Test upload
            try {
                // Create a test file
                $testContent = 'This is a test file uploaded at ' . date('Y-m-d H:i:s');
                $testFileName = 'test_' . time() . '.txt';
                $testFilePath = storage_path('app/' . $testFileName);
                
                file_put_contents($testFilePath, $testContent);
                
                // Try to upload to Google Drive
                $uploaded = Storage::disk('google')->put($testFileName, file_get_contents($testFilePath));
                
                if ($uploaded) {
                    $systemChecks['google_drive_upload_test'] = true;
                    $messages[] = "Google Drive upload test PASSED";
                    
                    // Clean up
                    Storage::disk('google')->delete($testFileName);
                    @unlink($testFilePath);
                } else {
                    $systemChecks['google_drive_upload_test'] = false;
                    $errors[] = "Google Drive upload test FAILED";
                }
            } catch (\Exception $e) {
                $systemChecks['google_drive_upload_test'] = false;
                $errors[] = "Google Drive upload test failed: " . $e->getMessage();
            }
        } catch (\Exception $e) {
            $systemChecks['google_drive_connection'] = false;
            $errors[] = "Google Drive connection failed: " . $e->getMessage();
        }
    } else {
        $errors[] = "Google Drive configuration is missing";
    }
    
} catch (\Exception $e) {
    $errors[] = "System check error: " . $e->getMessage();
}

// Run fixes if requested
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'fix_permissions':
                // Fix directory permissions
                $directories = [
                    storage_path('app'),
                    storage_path('app/public'),
                    storage_path('app/public/uploads'),
                    storage_path('app/google_drive_fallback'),
                    public_path('uploads'),
                    public_path('storage'),
                ];
                
                foreach ($directories as $dir) {
                    if (!file_exists($dir)) {
                        mkdir($dir, 0755, true);
                        $fixes[] = "Created directory: $dir";
                    }
                    
                    chmod($dir, 0755);
                    $fixes[] = "Fixed permissions for: $dir";
                }
                break;
                
            case 'create_storage_link':
                try {
                    if (!file_exists(public_path('storage'))) {
                        symlink(storage_path('app/public'), public_path('storage'));
                        $fixes[] = "Created storage symlink";
                    } else {
                        $fixes[] = "Storage symlink already exists";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to create storage symlink: " . $e->getMessage();
                }
                break;
                
            case 'clear_cache':
                try {
                    // Clear Laravel caches
                    Artisan::call('config:clear');
                    Artisan::call('cache:clear');
                    Artisan::call('view:clear');
                    Artisan::call('route:clear');
                    $fixes[] = "Laravel cache cleared";
                } catch (\Exception $e) {
                    $errors[] = "Failed to clear cache: " . $e->getMessage();
                }
                break;
                
            case 'upload_test':
                // Handle manual file upload test
                if (isset($_FILES['test_file']) && $_FILES['test_file']['error'] === UPLOAD_ERR_OK) {
                    $file = $_FILES['test_file'];
                    $messages[] = "Received file: {$file['name']} ({$file['size']} bytes)";
                    
                    // First save locally
                    $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
                    $localPath = storage_path('app/public/uploads/' . $fileName);
                    $webPath = 'storage/uploads/' . $fileName;
                    
                    if (move_uploaded_file($file['tmp_name'], $localPath)) {
                        $messages[] = "File saved locally to: $localPath";
                        
                        // Create media file record in database
                        try {
                            $id = DB::table('media_files')->insertGetId([
                                'task_id' => 1, // Assuming task ID 1 exists
                                'google_drive_id' => 'local_' . uniqid(),
                                'file_name' => $file['name'],
                                'original_name' => $file['name'],
                                'mime_type' => $file['type'],
                                'file_size' => $file['size'],
                                'local_path' => $webPath,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                            
                            $messages[] = "Database record created with ID: $id";
                            
                            // Try Google Drive upload
                            if ($systemChecks['google_drive_connection'] ?? false) {
                                try {
                                    $uploaded = Storage::disk('google')->put($fileName, file_get_contents($localPath));
                                    
                                    if ($uploaded) {
                                        $messages[] = "File uploaded to Google Drive successfully";
                                        
                                        // Update database record
                                        $driveId = 'gd_' . time() . '_' . uniqid();
                                        
                                        // Try to get the actual file ID
                                        try {
                                            $service = new Drive((new Client())->setAuthConfig($googleConfig['service_account_json_location'])->addScope(Drive::DRIVE));
                                            $searchResults = $service->files->listFiles([
                                                'q' => "name='$fileName' and trashed=false",
                                                'fields' => 'files(id, name)',
                                            ]);
                                            
                                            if (count($searchResults->getFiles()) > 0) {
                                                foreach ($searchResults->getFiles() as $file) {
                                                    if ($file->getName() === $fileName) {
                                                        $driveId = $file->getId();
                                                        break;
                                                    }
                                                }
                                            }
                                        } catch (\Exception $e) {
                                            // Ignore
                                        }
                                        
                                        DB::table('media_files')
                                            ->where('id', $id)
                                            ->update([
                                                'google_drive_id' => $driveId,
                                                'drive_path' => $fileName
                                            ]);
                                            
                                        $messages[] = "Database record updated with Google Drive ID: $driveId";
                                    } else {
                                        $errors[] = "Failed to upload to Google Drive";
                                    }
                                } catch (\Exception $e) {
                                    $errors[] = "Google Drive upload error: " . $e->getMessage();
                                }
                            }
                        } catch (\Exception $e) {
                            $errors[] = "Database error: " . $e->getMessage();
                        }
                    } else {
                        $errors[] = "Failed to save file locally";
                    }
                } else if (isset($_FILES['test_file'])) {
                    $errorCode = $_FILES['test_file']['error'];
                    $errorMessages = [
                        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
                        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the form',
                        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
                        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
                    ];
                    $errorMessage = $errorMessages[$errorCode] ?? "Unknown error ($errorCode)";
                    $errors[] = "File upload error: $errorMessage";
                }
                break;
        }
        
        // Refresh system checks after fixes
        header("Location: " . $_SERVER['PHP_SELF'] . "?refresh=1");
        exit;
    }
}

// HTML output
echo '<!DOCTYPE html>
<html>
<head>
    <title>Ultimate Upload Fix Tool</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .fixes { background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; }
        .errors { background-color: #fff2f0; border-left: 4px solid #ff4d4f; padding: 15px; }
        .messages { background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 15px; }
        .action-button {
            background-color: #1890ff;
            color: white;
            border: none;
            padding: 8px 16px;
            margin: 5px;
            border-radius: 4px;
            cursor: pointer;
        }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        summary { cursor: pointer; padding: 10px; background-color: #f5f5f5; border-radius: 4px; }
        details { margin-bottom: 15px; }
    </style>
</head>
<body>
    <h1>Ultimate Upload Fix Tool</h1>
    
    <p>This tool diagnoses and fixes common issues with file uploads and Google Drive integration.</p>';

// Display errors
if (!empty($errors)) {
    echo '<div class="errors">
        <h2>Errors Found</h2>
        <ul>';
    foreach ($errors as $error) {
        echo '<li>' . htmlspecialchars($error) . '</li>';
    }
    echo '</ul>
    </div>';
}

// Display messages
if (!empty($messages)) {
    echo '<div class="messages">
        <h2>Messages</h2>
        <ul>';
    foreach ($messages as $message) {
        echo '<li>' . htmlspecialchars($message) . '</li>';
    }
    echo '</ul>
    </div>';
}

// Display fixes
if (!empty($fixes)) {
    echo '<div class="fixes">
        <h2>Fixes Applied</h2>
        <ul>';
    foreach ($fixes as $fix) {
        echo '<li>' . htmlspecialchars($fix) . '</li>';
    }
    echo '</ul>
    </div>';
}

// System Check Summary
echo '<div class="box">
    <h2>System Check Summary</h2>
    
    <table>
        <tr>
            <th>Component</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>PHP Version</td>
            <td>' . ($systemChecks['php_version'] ?? 'Unknown') . '</td>
        </tr>
        <tr>
            <td>Laravel Version</td>
            <td>' . ($systemChecks['laravel_version'] ?? 'Unknown') . '</td>
        </tr>
        <tr>
            <td>Database Connection</td>
            <td>' . (isset($systemChecks['database_connection']) && $systemChecks['database_connection'] ? '<span class="success">Connected</span>' : '<span class="error">Failed</span>') . '</td>
        </tr>
        <tr>
            <td>Media Files Table</td>
            <td>' . (isset($systemChecks['media_files_table_exists']) && $systemChecks['media_files_table_exists'] ? '<span class="success">Exists</span>' : '<span class="error">Missing</span>') . '</td>
        </tr>
        <tr>
            <td>Database Write Test</td>
            <td>' . (isset($systemChecks['database_insert_test']) && $systemChecks['database_insert_test'] ? '<span class="success">Passed</span>' : '<span class="error">Failed</span>') . '</td>
        </tr>
        <tr>
            <td>Storage Directory</td>
            <td>' . (isset($systemChecks['directories']['storage_app']['write_test']) && $systemChecks['directories']['storage_app']['write_test'] ? '<span class="success">OK</span>' : '<span class="error">Issues</span>') . '</td>
        </tr>
        <tr>
            <td>Public Storage Link</td>
            <td>' . (isset($systemChecks['storage_link_exists']) && $systemChecks['storage_link_exists'] ? '<span class="success">Exists</span>' : '<span class="error">Missing</span>') . '</td>
        </tr>
        <tr>
            <td>Google Drive Connection</td>
            <td>' . (isset($systemChecks['google_drive_connection']) && $systemChecks['google_drive_connection'] ? '<span class="success">Connected</span>' : '<span class="error">Failed</span>') . '</td>
        </tr>
        <tr>
            <td>Google Drive Write Access</td>
            <td>' . (isset($systemChecks['google_drive_permissions']['write_test']) && $systemChecks['google_drive_permissions']['write_test'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td>
        </tr>
        <tr>
            <td>Google Drive Upload Test</td>
            <td>' . (isset($systemChecks['google_drive_upload_test']) && $systemChecks['google_drive_upload_test'] ? '<span class="success">Passed</span>' : '<span class="error">Failed</span>') . '</td>
        </tr>
    </table>
</div>';

// Actions section
echo '<div class="box">
    <h2>Available Fixes</h2>
    
    <form method="post" action="">
        <button type="submit" name="action" value="fix_permissions" class="action-button">Fix Directory Permissions</button>
        <button type="submit" name="action" value="create_storage_link" class="action-button">Create Storage Link</button>
        <button type="submit" name="action" value="clear_cache" class="action-button">Clear Laravel Cache</button>
    </form>
</div>';

// Manual upload test
echo '<div class="box">
    <h2>Manual File Upload Test</h2>
    
    <p>Upload a test file to verify the complete upload process (local storage + database + Google Drive):</p>
    
    <form method="post" action="" enctype="multipart/form-data">
        <input type="hidden" name="action" value="upload_test">
        <input type="file" name="test_file" required>
        <button type="submit" class="action-button">Test Upload</button>
    </form>
</div>';

// Google Drive Folder Permissions Fix
if (isset($systemChecks['google_drive_safe_config']['client_email'])) {
    echo '<div class="box fixes">
        <h2>Google Drive Permissions Fix</h2>
        
        <p>If Google Drive uploads are failing but connection works, you need to share your folder with the service account:</p>
        
        <ol>
            <li>Go to <a href="https://drive.google.com/drive/folders/' . htmlspecialchars($systemChecks['google_drive_safe_config']['folderId']) . '" target="_blank">your Google Drive folder</a></li>
            <li>Right-click the folder and select "Share"</li>
            <li>Add this email address: <strong>' . htmlspecialchars($systemChecks['google_drive_safe_config']['client_email']) . '</strong></li>
            <li>Make sure to set the role to <strong>Editor</strong> (not Viewer)</li>
            <li>Click "Share" or "Done" to save the changes</li>
            <li>Return to this page and click "Clear Laravel Cache" to refresh the connection</li>
        </ol>
        
        <input type="text" value="' . htmlspecialchars($systemChecks['google_drive_safe_config']['client_email']) . '" 
               style="width: 100%; padding: 8px; margin-bottom: 10px;" id="serviceAccountEmail" readonly>
        <button onclick="copyEmail()" class="action-button">Copy Email Address</button>
        
        <script>
        function copyEmail() {
            var emailField = document.getElementById(\'serviceAccountEmail\');
            emailField.select();
            document.execCommand(\'copy\');
            alert(\'Email address copied to clipboard\');
        }
        </script>
    </div>';
}

// Detailed System Information
echo '<details>
    <summary>Show Detailed System Information</summary>
    <div class="box">
        <h3>PHP Information</h3>
        <table>
            <tr>
                <td>PHP Version:</td>
                <td>' . ($systemChecks['php_version'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Upload Max Filesize:</td>
                <td>' . ($systemChecks['upload_max_filesize'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Post Max Size:</td>
                <td>' . ($systemChecks['post_max_size'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Memory Limit:</td>
                <td>' . ($systemChecks['memory_limit'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Temp Directory:</td>
                <td>' . ($systemChecks['temp_dir'] ?? 'Unknown') . ' (Writable: ' . (($systemChecks['temp_dir_writable'] ?? false) ? 'Yes' : 'No') . ')</td>
            </tr>
        </table>';

// Extensions check
if (isset($systemChecks['php_extensions'])) {
    echo '<h3>Required PHP Extensions</h3>
        <table>
            <tr>
                <th>Extension</th>
                <th>Status</th>
            </tr>';
            
    foreach (['pdo_mysql', 'fileinfo', 'curl', 'json', 'openssl'] as $ext) {
        echo '<tr>
                <td>' . $ext . '</td>
                <td>' . (in_array($ext, $systemChecks['php_extensions']) ? '<span class="success">Loaded</span>' : '<span class="error">Missing</span>') . '</td>
              </tr>';
    }
    
    echo '</table>';
}

// Directory checks
if (isset($systemChecks['directories']) && !empty($systemChecks['directories'])) {
    echo '<h3>Directory Permissions</h3>
        <table>
            <tr>
                <th>Directory</th>
                <th>Path</th>
                <th>Exists</th>
                <th>Writable</th>
                <th>Permissions</th>
                <th>Write Test</th>
            </tr>';
            
    foreach ($systemChecks['directories'] as $name => $dir) {
        echo '<tr>
                <td>' . htmlspecialchars($name) . '</td>
                <td>' . htmlspecialchars($dir['path']) . '</td>
                <td>' . ($dir['exists'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td>
                <td>' . ($dir['exists'] && $dir['writable'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td>
                <td>' . ($dir['permissions'] ?? 'N/A') . '</td>
                <td>' . ($dir['write_test'] ? '<span class="success">Passed</span>' : '<span class="error">Failed</span>') . '</td>
              </tr>';
    }
    
    echo '</table>';
}

// Database information
if (isset($systemChecks['database_connection']) && $systemChecks['database_connection']) {
    echo '<h3>Database Information</h3>
        <table>
            <tr>
                <td>Database Name:</td>
                <td>' . ($systemChecks['database_name'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Tables:</td>
                <td>' . count($systemChecks['database_tables'] ?? []) . ' tables found</td>
            </tr>';
            
    if (isset($systemChecks['media_files_table_exists']) && $systemChecks['media_files_table_exists']) {
        echo '<tr>
                <td>media_files Columns:</td>
                <td>' . implode(', ', $systemChecks['media_files_columns'] ?? []) . '</td>
              </tr>';
    }
    
    echo '</table>';
}

// Google Drive information
if (isset($systemChecks['google_drive_connection']) && $systemChecks['google_drive_connection']) {
    echo '<h3>Google Drive Information</h3>
        <table>
            <tr>
                <td>Service Account:</td>
                <td>' . ($systemChecks['google_drive_safe_config']['client_email'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Folder ID:</td>
                <td>' . ($systemChecks['google_drive_safe_config']['folderId'] ?? 'Unknown') . '</td>
            </tr>
            <tr>
                <td>Files in Folder:</td>
                <td>' . ($systemChecks['google_drive_files_count'] ?? 'Unknown') . '</td>
            </tr>';
    
    if (isset($systemChecks['google_drive_permissions']) && $systemChecks['google_drive_permissions']['success']) {
        echo '<tr>
                <td>Folder Name:</td>
                <td>' . ($systemChecks['google_drive_permissions']['name'] ?? 'Unknown') . '</td>
              </tr>
              <tr>
                <td>Can Edit:</td>
                <td>' . (($systemChecks['google_drive_permissions']['canEdit'] ?? false) ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td>
              </tr>
              <tr>
                <td>Can Add Children:</td>
                <td>' . (($systemChecks['google_drive_permissions']['canAddChildren'] ?? false) ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td>
              </tr>
              <tr>
                <td>Write Test:</td>
                <td>' . (($systemChecks['google_drive_permissions']['write_test'] ?? false) ? '<span class="success">Passed</span>' : '<span class="error">Failed</span>') . '</td>
              </tr>';
    }
    
    echo '</table>';
}

echo '</div>
</details>';

echo '<div class="box">
    <h2>Other Diagnostic Tools</h2>
    <p>
        <a href="verify-and-fix-gdrive.php" class="action-button">Google Drive Permissions Tool</a>
        <a href="test-google-drive.php" class="action-button">Basic Google Drive Test</a>
        <a href="gdrive-diagnostic.php" class="action-button">Full Google Drive Diagnostic</a>
        <a href="db-test.php" class="action-button">Database Test</a>
    </p>
</div>';

echo '</body>
</html>';
