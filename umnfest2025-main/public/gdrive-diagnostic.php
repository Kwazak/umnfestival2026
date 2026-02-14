<?php
// Google Drive Upload Diagnostic Tool
// This script tests Google Drive uploads in various ways and helps diagnose permission issues

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the storage facade and other utilities
use Illuminate\Support\Facades\Storage;
use Google\Client;
use Google\Service\Drive;

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// HTML header
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive Upload Diagnostic</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Google Drive Upload Diagnostic Tool</h1>';

// Part 1: Configuration Check
echo '<div class="box">
    <h2>1. Configuration Check</h2>';

// Get disk configuration
$config = config('filesystems.disks.google');
$serviceAccountPath = $config['service_account_json_location'] ?? null;
$folderId = $config['folderId'] ?? null;

// Display safe config
echo '<table>
    <tr>
        <th>Setting</th>
        <th>Value</th>
        <th>Status</th>
    </tr>';

// Check driver
echo '<tr>
    <td>Driver</td>
    <td>' . ($config['driver'] ?? 'Not set') . '</td>
    <td>' . (($config['driver'] ?? '') === 'google_drive' ? '<span class="success">OK</span>' : '<span class="error">Should be "google_drive"</span>') . '</td>
</tr>';

// Check folder ID
echo '<tr>
    <td>Folder ID</td>
    <td>' . ($folderId ?? 'Not set') . '</td>
    <td>' . (!empty($folderId) ? '<span class="success">OK</span>' : '<span class="error">Missing</span>') . '</td>
</tr>';

// Check service account path
echo '<tr>
    <td>Service Account JSON</td>
    <td>' . ($serviceAccountPath ?? 'Not set') . '</td>
    <td>';
    
if (empty($serviceAccountPath)) {
    echo '<span class="error">Missing</span>';
} elseif (!file_exists($serviceAccountPath)) {
    echo '<span class="error">File not found</span>';
} elseif (!is_readable($serviceAccountPath)) {
    echo '<span class="error">File not readable</span>';
} else {
    echo '<span class="success">File exists and is readable</span>';
}

echo '</td></tr>';

// Check service account content if available
if (!empty($serviceAccountPath) && file_exists($serviceAccountPath) && is_readable($serviceAccountPath)) {
    $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
    
    // Check if valid JSON
    echo '<tr>
        <td>Service Account JSON Validity</td>
        <td colspan="2">';
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo '<span class="error">Invalid JSON: ' . json_last_error_msg() . '</span>';
    } else {
        echo '<span class="success">Valid JSON</span>';
        
        // Check required fields
        $requiredFields = ['client_email', 'private_key', 'type'];
        $missingFields = [];
        
        foreach ($requiredFields as $field) {
            if (empty($serviceAccountJson[$field])) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            echo '<br><span class="error">Missing required fields: ' . implode(', ', $missingFields) . '</span>';
        } else {
            echo '<br><span class="success">All required fields present</span>';
            
            // Display client email for verification
            echo '<br>Service Account Email: <strong>' . htmlspecialchars($serviceAccountJson['client_email']) . '</strong>';
        }
    }
    
    echo '</td></tr>';
}

echo '</table>';
echo '</div>';

// Part 2: Connection Test
echo '<div class="box">
    <h2>2. Google Drive Connection Test</h2>';

try {
    $startTime = microtime(true);
    $files = Storage::disk('google')->files();
    $endTime = microtime(true);
    
    echo '<div class="success">Connection successful! ✓</div>';
    echo '<p>Successfully connected to Google Drive and retrieved file list in ' . round(($endTime - $startTime) * 1000, 2) . ' ms</p>';
    
    // Display file count
    echo '<p>Files found: ' . count($files) . '</p>';
    
    if (count($files) > 0) {
        echo '<table>
            <tr>
                <th>#</th>
                <th>File Name</th>
            </tr>';
        
        foreach ($files as $index => $file) {
            echo '<tr>
                <td>' . ($index + 1) . '</td>
                <td>' . htmlspecialchars($file) . '</td>
            </tr>';
        }
        
        echo '</table>';
    } else {
        echo '<p class="warning">No files found in the folder. The folder might be empty or you might not have read access.</p>';
    }
    
} catch (\Exception $e) {
    echo '<div class="error">Connection failed! ✗</div>';
    echo '<p>Error message: ' . htmlspecialchars($e->getMessage()) . '</p>';
}

echo '</div>';

// Part 3: Upload Test with Direct Service
echo '<div class="box">
    <h2>3. Direct API Upload Test</h2>
    <p>This test uses the Google Drive API directly to upload a file.</p>';

try {
    // Load the service account JSON
    if (!empty($serviceAccountPath) && file_exists($serviceAccountPath)) {
        $client = new Client();
        $client->setAuthConfig($serviceAccountPath);
        $client->addScope(Drive::DRIVE);
        
        $service = new Drive($client);
        
        // Create a simple text file for testing
        $fileName = 'test_upload_' . time() . '.txt';
        $fileContent = 'This is a test file created at ' . date('Y-m-d H:i:s');
        
        echo '<p>Attempting to upload file: <strong>' . $fileName . '</strong></p>';
        
        // Create the file metadata
        $fileMetadata = new \Google\Service\Drive\DriveFile([
            'name' => $fileName,
            'parents' => [$folderId]
        ]);
        
        // Upload the file
        $startTime = microtime(true);
        
        $file = $service->files->create(
            $fileMetadata,
            [
                'data' => $fileContent,
                'mimeType' => 'text/plain',
                'uploadType' => 'multipart',
                'fields' => 'id,name,mimeType,size,webViewLink'
            ]
        );
        
        $endTime = microtime(true);
        
        // Display success result
        echo '<div class="success">Direct upload successful! ✓</div>';
        echo '<p>File uploaded in ' . round(($endTime - $startTime) * 1000, 2) . ' ms</p>';
        echo '<p>File ID: ' . $file->getId() . '</p>';
        echo '<p>File Name: ' . $file->getName() . '</p>';
        echo '<p>File Size: ' . ($file->getSize() ? formatBytes($file->getSize()) : 'Unknown') . '</p>';
        
        if ($file->getWebViewLink()) {
            echo '<p>View Link: <a href="' . $file->getWebViewLink() . '" target="_blank">Open in Google Drive</a></p>';
        }
        
        // Clean up by deleting the test file
        $service->files->delete($file->getId());
        echo '<p>Test file deleted.</p>';
        
    } else {
        echo '<div class="error">Cannot perform direct upload test: Service account JSON file not available</div>';
    }
} catch (\Exception $e) {
    echo '<div class="error">Direct upload failed! ✗</div>';
    echo '<p>Error message: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
}

echo '</div>';

// Part 4: Upload Test with Storage Facade
echo '<div class="box">
    <h2>4. Laravel Storage Upload Test</h2>
    <p>This test uses Laravel\'s Storage facade to upload a file.</p>';

try {
    // Create a simple text file for testing
    $fileName = 'laravel_test_' . time() . '.txt';
    $fileContent = 'This is a Laravel Storage test file created at ' . date('Y-m-d H:i:s');
    $tempFile = storage_path('app/' . $fileName);
    
    // Save file locally first
    file_put_contents($tempFile, $fileContent);
    
    echo '<p>Created local file: <strong>' . $tempFile . '</strong></p>';
    echo '<p>File size: ' . formatBytes(filesize($tempFile)) . '</p>';
    
    // Try to upload using Storage
    $startTime = microtime(true);
    $uploaded = Storage::disk('google')->put($fileName, file_get_contents($tempFile));
    $endTime = microtime(true);
    
    if ($uploaded) {
        echo '<div class="success">Laravel Storage upload successful! ✓</div>';
        echo '<p>File uploaded in ' . round(($endTime - $startTime) * 1000, 2) . ' ms</p>';
        
        // Verify file exists
        if (Storage::disk('google')->exists($fileName)) {
            echo '<p>File exists verification: <span class="success">Passed</span></p>';
            
            // Read file back
            $downloadedContent = Storage::disk('google')->get($fileName);
            if ($downloadedContent === $fileContent) {
                echo '<p>Content verification: <span class="success">Passed - content matches</span></p>';
            } else {
                echo '<p>Content verification: <span class="error">Failed - content doesn\'t match</span></p>';
            }
            
            // Delete the file
            Storage::disk('google')->delete($fileName);
            echo '<p>Test file deleted.</p>';
        } else {
            echo '<p>File exists verification: <span class="error">Failed - file not found after upload</span></p>';
        }
    } else {
        echo '<div class="error">Laravel Storage upload failed! ✗</div>';
    }
    
    // Clean up local file
    @unlink($tempFile);
    
} catch (\Exception $e) {
    echo '<div class="error">Laravel Storage upload failed! ✗</div>';
    echo '<p>Error message: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
}

echo '</div>';

// Part 5: File Upload Form
echo '<div class="box">
    <h2>5. Manual File Upload Test</h2>
    <p>Upload your own file to test Google Drive integration:</p>
    
    <form action="" method="post" enctype="multipart/form-data">
        <input type="hidden" name="_token" value="' . csrf_token() . '">
        <input type="hidden" name="test_type" value="manual_upload">
        <p>
            <input type="file" name="test_file">
        </p>
        <p>
            <button type="submit">Upload to Google Drive</button>
        </p>
    </form>';

// Handle file upload if submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test_type']) && $_POST['test_type'] === 'manual_upload') {
    if (isset($_FILES['test_file']) && $_FILES['test_file']['error'] === UPLOAD_ERR_OK) {
        $uploadedFile = $_FILES['test_file'];
        
        echo '<h3>Upload Results</h3>';
        echo '<p>File received: <strong>' . htmlspecialchars($uploadedFile['name']) . '</strong></p>';
        echo '<p>Size: ' . formatBytes($uploadedFile['size']) . '</p>';
        echo '<p>Type: ' . $uploadedFile['type'] . '</p>';
        
        try {
            // Read the file content
            $fileContent = file_get_contents($uploadedFile['tmp_name']);
            $fileName = time() . '_' . $uploadedFile['name'];
            
            // Try to upload using Storage
            $startTime = microtime(true);
            $uploaded = Storage::disk('google')->put($fileName, $fileContent);
            $endTime = microtime(true);
            
            if ($uploaded) {
                echo '<div class="success">File upload successful! ✓</div>';
                echo '<p>File uploaded in ' . round(($endTime - $startTime) * 1000, 2) . ' ms</p>';
                
                // For image files, we could try to get a public URL but that's more complex with Google Drive
                echo '<p>File saved to Google Drive as: ' . $fileName . '</p>';
            } else {
                echo '<div class="error">File upload failed! ✗</div>';
            }
        } catch (\Exception $e) {
            echo '<div class="error">Upload error: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
    } else {
        echo '<h3>Upload Error</h3>';
        if (isset($_FILES['test_file'])) {
            $errorCodes = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
            ];
            
            $errorMessage = $errorCodes[$_FILES['test_file']['error']] ?? 'Unknown error';
            echo '<div class="error">Upload failed: ' . $errorMessage . '</div>';
        } else {
            echo '<div class="error">No file was submitted</div>';
        }
    }
}

echo '</div>';

// Part 6: Troubleshooting Guide
echo '<div class="box">
    <h2>6. Troubleshooting Guide</h2>
    
    <h3>If File Listing Works But Uploads Fail:</h3>
    <ol>
        <li><strong>Permission Issue:</strong> Make sure the Google Drive folder is shared with your service account email with "Editor" permissions, not just "Viewer"</li>
        <li><strong>Check the Service Account:</strong> The service account must have domain-wide delegation if you\'re working with a Google Workspace domain</li>
        <li><strong>API Scope:</strong> Verify that your app has the proper scope (https://www.googleapis.com/auth/drive) for write operations</li>
    </ol>
    
    <h3>Common Error Messages:</h3>
    <ul>
        <li><strong>"The caller does not have permission":</strong> Your service account doesn\'t have write access to the folder</li>
        <li><strong>"File not found":</strong> The folder ID is incorrect or the service account can\'t access it</li>
        <li><strong>"Invalid credentials":</strong> The service account JSON is invalid or expired</li>
    </ul>
    
    <h3>Check These Items:</h3>
    <ol>
        <li>Google Drive API is enabled in Google Cloud Console</li>
        <li>The service account has the required API scopes</li>
        <li>The service account email is added to the shared folder with Editor access</li>
        <li>The folder ID in your .env file is correct</li>
    </ol>
</div>';

echo '</body>
</html>';
?>
