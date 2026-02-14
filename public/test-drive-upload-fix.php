<?php
/**
 * Test Script for Google Drive Upload with Storage Quota Fix
 * This script tests the storage quota fix by using supportsAllDrives parameter
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
    <title>Google Drive Upload Fix Tester</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
        pre { background: #eee; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Google Drive Upload Fix Test</h1>
    <p>This script tests the fix for the storage quota error by using the supportsAllDrives parameter.</p>
';

// Load the Composer autoloader
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    die('<div class="box error">Composer autoloader not found. Please run "composer install" first.</div>');
}

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) {
    die('<div class="box error">.env file not found.</div>');
}

$envFile = file_get_contents($envPath);
$lines = explode("\n", $envFile);
$env = [];

foreach ($lines as $line) {
    $line = trim($line);
    if (strpos($line, '=') !== false && substr($line, 0, 1) !== '#') {
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value, "'\"");
    }
}

// Get Google Drive configuration
$folderId = $env['GOOGLE_DRIVE_FOLDER_ID'] ?? null;
$serviceAccountPath = __DIR__ . '/../storage/app/google/service-account.json';

if (!$folderId) {
    die('<div class="box error">Google Drive folder ID not found in .env file.</div>');
}

if (!file_exists($serviceAccountPath)) {
    die('<div class="box error">Service account JSON file not found at: ' . htmlspecialchars($serviceAccountPath) . '</div>');
}

// Display configuration
echo '<div class="box">';
echo '<h2>Configuration</h2>';
echo '<p><strong>Folder ID:</strong> ' . htmlspecialchars($folderId) . '</p>';
echo '<p><strong>Service Account Path:</strong> ' . htmlspecialchars($serviceAccountPath) . '</p>';

// Get service account email
try {
    $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
    if (isset($serviceAccountJson['client_email'])) {
        echo '<p><strong>Service Account Email:</strong> ' . htmlspecialchars($serviceAccountJson['client_email']) . '</p>';
    }
} catch (Exception $e) {
    echo '<p class="error">Error reading service account file: ' . htmlspecialchars($e->getMessage()) . '</p>';
}
echo '</div>';

// Test uploads
echo '<div class="box">';
echo '<h2>Upload Tests</h2>';

// Create test file
$testFileName = 'fixed_test_' . time() . '.txt';
$testFilePath = __DIR__ . '/' . $testFileName;
$testContent = "This is a test file created at " . date('Y-m-d H:i:s') . "\nTesting storage quota fix.";

file_put_contents($testFilePath, $testContent);
echo '<p>Created test file: ' . htmlspecialchars($testFilePath) . '</p>';

// Method 1: Direct API with supportsAllDrives
echo '<h3>Method 1: Direct API with supportsAllDrives parameter</h3>';
try {
    // Initialize Google API client
    $client = new \Google\Client();
    $client->setAuthConfig($serviceAccountPath);
    $client->addScope(\Google\Service\Drive::DRIVE);
    $service = new \Google\Service\Drive($client);
    
    // Prepare file metadata
    $fileMetadata = new \Google\Service\Drive\DriveFile([
        'name' => $testFileName,
        'parents' => [$folderId]
    ]);
    
    echo '<p>Attempting upload with supportsAllDrives=true...</p>';
    
    // Upload with supportsAllDrives parameter
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
    
    echo '<p class="success">Success! File uploaded with ID: ' . htmlspecialchars($file->getId()) . '</p>';
    
    // Clean up - delete the test file
    $service->files->delete($file->getId(), ['supportsAllDrives' => true]);
    echo '<p>Test file deleted from Google Drive</p>';
    
} catch (Exception $e) {
    echo '<p class="error">Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
}

// Method 2: Using Laravel Storage (which now uses the updated GoogleDriveAdapter)
echo '<h3>Method 2: Using Laravel Storage with Updated Provider</h3>';
try {
    // Initialize Laravel
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    // Use Laravel's Storage facade
    $disk = \Illuminate\Support\Facades\Storage::disk('google');
    
    // Get adapter and service
    $adapter = $disk->getAdapter();
    $driveService = $adapter->getService();
    
    // Prepare file metadata
    $fileMetadata = new \Google\Service\Drive\DriveFile([
        'name' => 'laravel_' . $testFileName,
        'parents' => [$folderId]
    ]);
    
    // Upload with supportsAllDrives parameter
    $file = $driveService->files->create(
        $fileMetadata,
        [
            'data' => $testContent,
            'mimeType' => 'text/plain',
            'uploadType' => 'multipart',
            'fields' => 'id,name',
            'supportsAllDrives' => true
        ]
    );
    
    echo '<p class="success">Success! File uploaded with ID: ' . htmlspecialchars($file->getId()) . '</p>';
    
    // Clean up - delete the test file
    $driveService->files->delete($file->getId(), ['supportsAllDrives' => true]);
    echo '<p>Test file deleted from Google Drive</p>';
    
    // Also try the standard put method
    echo '<h3>Method 3: Using Laravel Storage Standard put() Method</h3>';
    $testFileName2 = 'laravel_standard_' . time() . '.txt';
    $result = $disk->put($testFileName2, 'Testing standard put method with fixes applied');
    
    if ($result) {
        echo '<p class="success">Success! File uploaded using standard put() method</p>';
        
        // Try to delete
        if ($disk->delete($testFileName2)) {
            echo '<p>File deleted successfully</p>';
        } else {
            echo '<p class="warning">Could not delete file using standard delete() method</p>';
        }
    } else {
        echo '<p class="error">Standard put() method failed</p>';
    }
    
} catch (Exception $e) {
    echo '<p class="error">Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
}

// Clean up local test file
unlink($testFilePath);
echo '<p>Local test file deleted</p>';

echo '</div>';

// Explanation of the fix
echo '<div class="box">
    <h2>Explanation of the Fix</h2>
    <p>The storage quota error occurs because service accounts don\'t have their own Google Drive storage quota. 
       When using a service account to upload files, you must explicitly upload to a folder that\'s been shared with the service account.</p>
    
    <p>The fix involves:</p>
    <ol>
        <li>Using the <code>supportsAllDrives</code> parameter set to <code>true</code> when creating files</li>
        <li>Making sure the folder ID is explicitly set in the file\'s <code>parents</code> array</li>
        <li>Ensuring the service account has proper permissions on the folder</li>
    </ol>
    
    <p>We\'ve updated the GoogleDriveServiceProvider and TaskController to implement these fixes.</p>
</div>';

// Next steps
echo '<div class="box">
    <h2>Next Steps</h2>
    <ol>
        <li>Try using the admin form to upload files</li>
        <li>Check the Laravel logs for any errors</li>
        <li>Make sure your Google Drive folder is still shared with the service account email</li>
    </ol>
</div>';

echo '</body>
</html>';
