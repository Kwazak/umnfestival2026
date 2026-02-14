<?php
// Google Drive Permission Verification and Fix Tool

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;
use Google\Client;
use Google\Service\Drive;

// Get configuration
$config = config('filesystems.disks.google');
$serviceAccountPath = $config['service_account_json_location'] ?? null;
$folderId = $config['folderId'] ?? null;

// Start HTML output
echo "<!DOCTYPE html>
<html>
<head>
    <title>Google Drive Permissions Fix</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .box { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .steps { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #007bff; }
        button, .btn { 
            background-color: #4CAF50; 
            border: none; 
            color: white; 
            padding: 10px 20px; 
            text-align: center; 
            text-decoration: none; 
            display: inline-block; 
            font-size: 16px; 
            margin: 4px 2px; 
            cursor: pointer; 
            border-radius: 4px;
        }
        .secondary {
            background-color: #2196F3;
        }
    </style>
</head>
<body>
    <h1>Google Drive Permissions Verification and Fix</h1>";

// Function to load service account JSON
function loadServiceAccountEmail($serviceAccountPath) {
    try {
        if (!file_exists($serviceAccountPath)) {
            return null;
        }
        
        $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        
        return $serviceAccountJson['client_email'] ?? null;
    } catch (\Exception $e) {
        return null;
    }
}

// Function to check folder permissions
function checkFolderPermissions($service, $folderId) {
    try {
        $folder = $service->files->get($folderId, ['fields' => 'name,id,capabilities']);
        
        $result = [
            'success' => true,
            'name' => $folder->getName(),
            'id' => $folder->getId(),
            'canEdit' => false,
            'canAddChildren' => false
        ];
        
        $capabilities = $folder->getCapabilities();
        if ($capabilities) {
            $result['canEdit'] = $capabilities->getCanEdit() ?? false;
            $result['canAddChildren'] = $capabilities->getCanAddChildren() ?? false;
            $result['canShare'] = $capabilities->getCanShare() ?? false;
        }
        
        return $result;
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Function to test write permissions
function testWritePermissions($service, $folderId) {
    try {
        $testContent = 'Test file created at ' . date('Y-m-d H:i:s');
        $testFile = 'permissions_test_' . time() . '.txt';
        
        $fileMetadata = new \Google\Service\Drive\DriveFile([
            'name' => $testFile,
            'parents' => [$folderId]
        ]);
        
        $file = $service->files->create(
            $fileMetadata,
            [
                'data' => $testContent,
                'mimeType' => 'text/plain',
                'uploadType' => 'multipart',
                'fields' => 'id,name'
            ]
        );
        
        // Try to delete the test file
        $fileId = $file->getId();
        $service->files->delete($fileId);
        
        return [
            'success' => true,
            'fileId' => $fileId,
            'fileName' => $file->getName()
        ];
    } catch (\Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// MAIN EXECUTION

// Check if service account file exists
if (!file_exists($serviceAccountPath)) {
    echo "<div class='box error'>";
    echo "<h2>Error: Service Account File Not Found</h2>";
    echo "<p>The service account file does not exist at: " . htmlspecialchars($serviceAccountPath) . "</p>";
    echo "</div>";
    exit;
}

// Get service account email
$serviceAccountEmail = loadServiceAccountEmail($serviceAccountPath);

if (!$serviceAccountEmail) {
    echo "<div class='box error'>";
    echo "<h2>Error: Invalid Service Account File</h2>";
    echo "<p>Could not read the client_email from the service account JSON.</p>";
    echo "</div>";
    exit;
}

echo "<div class='box'>";
echo "<h2>Google Drive Configuration</h2>";
echo "<ul>";
echo "<li><strong>Service Account Email:</strong> " . htmlspecialchars($serviceAccountEmail) . "</li>";
echo "<li><strong>Folder ID:</strong> " . htmlspecialchars($folderId) . "</li>";
echo "<li><strong>Service Account JSON:</strong> " . htmlspecialchars($serviceAccountPath) . "</li>";
echo "</ul>";
echo "</div>";

// Initialize Google client
try {
    $client = new Client();
    $client->setAuthConfig($serviceAccountPath);
    $client->addScope(Drive::DRIVE);
    $service = new Drive($client);
    
    // Check folder permissions
    echo "<div class='box'>";
    echo "<h2>Folder Permissions Check</h2>";
    
    $folderPermissions = checkFolderPermissions($service, $folderId);
    
    if ($folderPermissions['success']) {
        echo "<p><strong>Folder Name:</strong> " . htmlspecialchars($folderPermissions['name']) . "</p>";
        echo "<p><strong>Folder ID:</strong> " . htmlspecialchars($folderPermissions['id']) . "</p>";
        
        echo "<h3>Permission Status:</h3>";
        echo "<ul>";
        echo "<li>Can Edit: " . ($folderPermissions['canEdit'] ? "<span class='success'>Yes</span>" : "<span class='error'>No</span>") . "</li>";
        echo "<li>Can Add Children: " . ($folderPermissions['canAddChildren'] ? "<span class='success'>Yes</span>" : "<span class='error'>No</span>") . "</li>";
        
        if (isset($folderPermissions['canShare'])) {
            echo "<li>Can Share: " . ($folderPermissions['canShare'] ? "<span class='success'>Yes</span>" : "<span class='warning'>No</span>") . "</li>";
        }
        
        echo "</ul>";
        
        if (!$folderPermissions['canEdit'] || !$folderPermissions['canAddChildren']) {
            echo "<div class='error'><strong>PERMISSION ISSUE DETECTED!</strong> The service account does not have proper permissions on this folder.</div>";
        } else {
            echo "<div class='success'><strong>PERMISSIONS LOOK GOOD!</strong> The service account has proper edit permissions on this folder.</div>";
        }
    } else {
        echo "<div class='error'><strong>ERROR ACCESSING FOLDER:</strong> " . htmlspecialchars($folderPermissions['error']) . "</div>";
    }
    
    echo "</div>";
    
    // Test write permissions
    echo "<div class='box'>";
    echo "<h2>Write Permission Test</h2>";
    
    $writeTest = testWritePermissions($service, $folderId);
    
    if ($writeTest['success']) {
        echo "<div class='success'><strong>WRITE TEST PASSED!</strong> Successfully created and deleted a test file.</div>";
        echo "<p>Test file ID: " . htmlspecialchars($writeTest['fileId']) . "</p>";
    } else {
        echo "<div class='error'><strong>WRITE TEST FAILED!</strong> Could not create a test file.</div>";
        echo "<p>Error: " . htmlspecialchars($writeTest['error']) . "</p>";
    }
    
    echo "</div>";
    
    // If we have issues, show the fix instructions
    if (!($folderPermissions['success'] && $folderPermissions['canEdit'] && $folderPermissions['canAddChildren'] && $writeTest['success'])) {
        echo "<div class='box steps'>";
        echo "<h2>How to Fix the Permission Issues</h2>";
        echo "<ol>";
        echo "<li>Go to <a href='https://drive.google.com/drive/folders/" . htmlspecialchars($folderId) . "' target='_blank'>your Google Drive folder</a></li>";
        echo "<li>Right-click on the folder and select 'Share'</li>";
        echo "<li>Add the service account email: <strong>" . htmlspecialchars($serviceAccountEmail) . "</strong></li>";
        echo "<li>Set the permission to <strong>Editor</strong></li>";
        echo "<li>Click the 'Share' or 'Done' button</li>";
        echo "<li>Return to this page and refresh to verify the fix worked</li>";
        echo "</ol>";
        
        // Display a link to copy the service account email
        echo "<div>";
        echo "<input type='text' id='serviceEmail' value='" . htmlspecialchars($serviceAccountEmail) . "' readonly style='width: 100%; padding: 5px; margin-bottom: 10px;'>";
        echo "<button onclick='copyEmail()'>Copy Service Account Email</button>";
        echo "</div>";
        
        echo "<script>
        function copyEmail() {
            var emailField = document.getElementById('serviceEmail');
            emailField.select();
            document.execCommand('copy');
            alert('Service account email copied to clipboard!');
        }
        </script>";
        
        echo "</div>";
    }
    
    // Add links to other diagnostics
    echo "<div class='box'>";
    echo "<h2>Additional Diagnostic Tools</h2>";
    echo "<p>Use these additional tools to further diagnose Google Drive integration:</p>";
    echo "<div>";
    echo "<a href='test-google-drive.php' class='btn'>Basic Google Drive Test</a> ";
    echo "<a href='gdrive-diagnostic.php' class='btn secondary'>Full Google Drive Diagnostic</a>";
    echo "</div>";
    echo "</div>";
    
} catch (\Exception $e) {
    echo "<div class='box error'>";
    echo "<h2>Error Initializing Google Client</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}

echo "</body>
</html>";
?>
