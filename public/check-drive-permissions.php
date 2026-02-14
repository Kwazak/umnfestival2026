<?php
// Enhanced Google Drive permissions checking tool

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get configuration
$config = config('filesystems.disks.google');
$serviceAccountPath = $config['service_account_json_location'] ?? null;
$folderId = $config['folderId'] ?? null;

echo "<!DOCTYPE html>
<html>
<head>
    <title>Google Drive Permissions Check</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .box { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .steps { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <h1>Google Drive Permissions Check</h1>
";

if (!file_exists($serviceAccountPath)) {
    echo "<div class='error'>Service account file not found at: " . htmlspecialchars($serviceAccountPath) . "</div>";
    exit;
}

try {
    // Load the service account credentials
    $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "<div class='error'>Invalid JSON in service account file: " . json_last_error_msg() . "</div>";
        exit;
    }
    
    // Get the service account email
    $serviceAccountEmail = $serviceAccountJson['client_email'] ?? null;
    
    if (!$serviceAccountEmail) {
        echo "<div class='error'>No client_email found in service account JSON</div>";
        exit;
    }
    
    echo "<div class='box'>";
    echo "<h2>Service Account Information</h2>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($serviceAccountEmail) . "</p>";
    echo "<p><strong>Folder ID:</strong> " . htmlspecialchars($folderId) . "</p>";
    echo "</div>";
    
    // Create Google API client
    $client = new Google\Client();
    $client->setAuthConfig($serviceAccountPath);
    $client->addScope(Google\Service\Drive::DRIVE);
    $service = new Google\Service\Drive($client);
    
    // Try to get folder metadata
    try {
        $folder = $service->files->get($folderId, ['fields' => 'name,id,capabilities']);
        
        echo "<div class='box'>";
        echo "<h2>Folder Information</h2>";
        echo "<p><strong>Name:</strong> " . htmlspecialchars($folder->getName()) . "</p>";
        echo "<p><strong>ID:</strong> " . htmlspecialchars($folder->getId()) . "</p>";
        
        // Check capabilities
        $capabilities = $folder->getCapabilities();
        
        if ($capabilities) {
            echo "<h3>Permission Capabilities:</h3>";
            echo "<ul>";
            
            $canEdit = $capabilities->getCanEdit() ?? false;
            $canCopy = $capabilities->getCanCopy() ?? false;
            $canShare = $capabilities->getCanShare() ?? false;
            $canAddChildren = $capabilities->getCanAddChildren() ?? false;
            
            echo "<li>Can Edit: <span class='" . ($canEdit ? "success'>Yes" : "error'>No") . "</span></li>";
            echo "<li>Can Add Children: <span class='" . ($canAddChildren ? "success'>Yes" : "error'>No") . "</span></li>";
            echo "<li>Can Copy: <span class='" . ($canCopy ? "success'>Yes" : "error'>No") . "</span></li>";
            echo "<li>Can Share: <span class='" . ($canShare ? "success'>Yes" : "error'>No") . "</span></li>";
            
            echo "</ul>";
            
            if (!$canEdit || !$canAddChildren) {
                echo "<div class='error'><strong>PROBLEM DETECTED:</strong> The service account doesn't have proper edit/write permissions on this folder.</div>";
            } else {
                echo "<div class='success'><strong>GOOD:</strong> The service account appears to have proper edit permissions on this folder.</div>";
            }
        }
        echo "</div>";
        
        // Try a write test
        echo "<div class='box'>";
        echo "<h2>Permission Test - Attempting Write Operation</h2>";
        
        $testContent = 'Test file created at ' . date('Y-m-d H:i:s');
        $testFile = 'permissions_test_' . time() . '.txt';
        
        try {
            $fileMetadata = new Google\Service\Drive\DriveFile([
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
            
            echo "<div class='success'><strong>SUCCESS!</strong> Test file was created successfully.</div>";
            echo "<p>File ID: " . $createdFile->getId() . "</p>";
            echo "<p>File Name: " . $createdFile->getName() . "</p>";
            
            // Try to delete the test file
            $service->files->delete($createdFile->getId());
            echo "<p>Test file deleted successfully.</p>";
            
            echo "<div class='success'><strong>PERMISSION CHECK PASSED:</strong> Your service account has proper read and write permissions.</div>";
        } catch (Exception $e) {
            echo "<div class='error'><strong>WRITE TEST FAILED:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
            echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        }
        
        echo "</div>";
        
    } catch (Exception $e) {
        echo "<div class='box error'>";
        echo "<h2>Error Accessing Folder</h2>";
        echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
        echo "</div>";
    }
    
    // Show fix instructions
    echo "<div class='box steps'>";
    echo "<h2>How to Fix Permission Issues</h2>";
    echo "<p>If the permission test failed, follow these steps:</p>";
    echo "<ol>";
    echo "<li>Go to <a href='https://drive.google.com' target='_blank'>Google Drive</a> and navigate to the folder with ID: <strong>" . htmlspecialchars($folderId) . "</strong></li>";
    echo "<li>Right-click the folder and select 'Share'</li>";
    echo "<li>Add the service account email address: <strong>" . htmlspecialchars($serviceAccountEmail) . "</strong></li>";
    echo "<li>Make sure to assign <strong>Editor</strong> role (not Viewer)</li>";
    echo "<li>Click 'Share' or 'Done'</li>";
    echo "<li>Return to this page and refresh to run the tests again</li>";
    echo "</ol>";
    echo "<p><strong>Note:</strong> It may take a few minutes for permission changes to propagate in Google's systems.</p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h2>Error</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}
?>
</body>
</html>
