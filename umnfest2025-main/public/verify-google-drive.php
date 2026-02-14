<?php
/**
 * Google Drive Permissions Verification and Fix Tool
 * This tool checks and helps fix Google Drive folder permissions
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
    <title>Google Drive Permissions Checker</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
        .code { font-family: monospace; background: #eee; padding: 2px 5px; }
        input, button { margin: 10px 0; padding: 8px; }
        button { background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Google Drive Permissions Checker & Fixer</h1>
    <p>This tool checks and helps fix Google Drive folder permissions for file uploads.</p>
';

// Require Composer autoloader for Google API
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    die('<div class="box error">Composer autoloader not found. Please run "composer install" first.</div>');
}

require_once __DIR__ . '/../vendor/autoload.php';

// Results container
$messages = [];
$errors = [];
$folderInfo = null;
$serviceAccountEmail = null;
$folderId = null;

// Load configuration
try {
    // Try to load .env file
    $envPath = __DIR__ . '/../.env';
    if (!file_exists($envPath)) {
        throw new Exception(".env file not found at: $envPath");
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
    
    $folderId = $env['GOOGLE_DRIVE_FOLDER_ID'] ?? null;
    if (empty($folderId)) {
        throw new Exception("GOOGLE_DRIVE_FOLDER_ID not found in .env file");
    }
    
    $messages[] = "Google Drive folder ID: $folderId";
    
    // Check for service account file
    $serviceAccountPath = __DIR__ . '/../storage/app/google/service-account.json';
    if (!file_exists($serviceAccountPath)) {
        throw new Exception("Service account JSON file not found at: $serviceAccountPath");
    }
    
    if (!is_readable($serviceAccountPath)) {
        throw new Exception("Service account JSON file exists but is not readable");
    }
    
    $messages[] = "Service account file found at: $serviceAccountPath";
    
    // Load and validate JSON
    $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Service account file is not valid JSON: " . json_last_error_msg());
    }
    
    // Check for required fields
    $requiredFields = ['client_email', 'private_key', 'project_id'];
    foreach ($requiredFields as $field) {
        if (!isset($serviceAccountJson[$field]) || empty($serviceAccountJson[$field])) {
            throw new Exception("Service account file is missing required field: $field");
        }
    }
    
    $serviceAccountEmail = $serviceAccountJson['client_email'];
    $messages[] = "Service account email: $serviceAccountEmail";
    
    // Initialize Google API client
    $client = new Google\Client();
    $client->setAuthConfig($serviceAccountPath);
    $client->addScope(Google\Service\Drive::DRIVE);
    
    // Create Drive service
    $service = new Google\Service\Drive($client);
    $messages[] = "Google Drive API service initialized";
    
    // Check folder permissions
    try {
        $folder = $service->files->get($folderId, ['fields' => 'id,name,capabilities,owners,permissions']);
        $capabilities = $folder->getCapabilities();
        
        $folderInfo = [
            'id' => $folder->getId(),
            'name' => $folder->getName(),
            'canEdit' => $capabilities->getCanEdit(),
            'canAddChildren' => $capabilities->getCanAddChildren(),
            'canDelete' => $capabilities->getCanDelete(),
            'canDownload' => $capabilities->getCanDownload(),
            'canListChildren' => $capabilities->getCanListChildren(),
            'canMoveItemIntoTeamDrive' => $capabilities->getCanMoveItemIntoTeamDrive(),
            'canMoveItemOutOfDrive' => $capabilities->getCanMoveItemOutOfDrive(),
            'canMoveItemWithinDrive' => $capabilities->getCanMoveItemWithinDrive(),
            'canRename' => $capabilities->getCanRename(),
            'canShare' => $capabilities->getCanShare(),
            'canTrash' => $capabilities->getCanTrash(),
        ];
        
        $messages[] = "Successfully retrieved folder information for: " . $folder->getName();
        
        // Test write access by creating a small test file
        try {
            $testContent = 'Test file created at ' . date('Y-m-d H:i:s');
            $testFile = 'permissions_test_' . time() . '.txt';
            
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
            
            $messages[] = "✅ Write permission test PASSED! Created test file: " . $createdFile->getName();
            
            // Delete the test file
            $service->files->delete($createdFile->getId());
            $messages[] = "Test file deleted successfully";
            
            // Check for any existing permissions
            $permissions = $folder->getPermissions();
            if ($permissions) {
                $permissionList = [];
                foreach ($permissions as $permission) {
                    $permissionList[] = [
                        'id' => $permission->getId(),
                        'type' => $permission->getType(),
                        'emailAddress' => $permission->getEmailAddress(),
                        'role' => $permission->getRole(),
                    ];
                }
                
                // Check if service account already has permission
                $serviceAccountHasPermission = false;
                foreach ($permissionList as $permission) {
                    if (isset($permission['emailAddress']) && $permission['emailAddress'] === $serviceAccountEmail) {
                        $serviceAccountHasPermission = true;
                        $messages[] = "Service account already has permission on the folder: " . $permission['role'];
                        break;
                    }
                }
                
                if (!$serviceAccountHasPermission) {
                    $messages[] = "Service account is not explicitly shared on the folder, but has access via other means.";
                }
            }
            
        } catch (Exception $e) {
            $errors[] = "❌ Write permission test FAILED: " . $e->getMessage();
            
            // Check if it's a permission issue
            if (strpos($e->getMessage(), "permission") !== false || 
                strpos($e->getMessage(), "Permission") !== false || 
                strpos($e->getMessage(), "access") !== false || 
                strpos($e->getMessage(), "Access") !== false) {
                $errors[] = "This appears to be a permissions issue. You need to share the Google Drive folder with the service account.";
            }
        }
        
    } catch (Exception $e) {
        $errors[] = "Failed to get folder information: " . $e->getMessage();
        
        // Check if it's a "not found" error
        if (strpos($e->getMessage(), "File not found") !== false || 
            strpos($e->getMessage(), "not found") !== false) {
            $errors[] = "The folder ID '$folderId' was not found. Check that the folder exists and the service account has access to it.";
        }
    }
    
} catch (Exception $e) {
    $errors[] = "Configuration error: " . $e->getMessage();
}

// Process actions if requested
$actionResults = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        try {
            switch ($_POST['action']) {
                case 'test_upload':
                    // Initialize Google API client
                    $client = new Google\Client();
                    $client->setAuthConfig($serviceAccountPath);
                    $client->addScope(Google\Service\Drive::DRIVE);
                    
                    // Create Drive service
                    $service = new Google\Service\Drive($client);
                    
                    // Create test file
                    $testContent = 'Manual test file created at ' . date('Y-m-d H:i:s');
                    $testFile = 'manual_test_' . time() . '.txt';
                    
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
                    
                    $actionResults[] = "✅ Manual upload test SUCCESSFUL! Created test file: " . $createdFile->getName();
                    
                    // Delete the test file
                    $service->files->delete($createdFile->getId());
                    $actionResults[] = "Test file deleted successfully";
                    break;
                    
                case 'list_files':
                    // Initialize Google API client
                    $client = new Google\Client();
                    $client->setAuthConfig($serviceAccountPath);
                    $client->addScope(Google\Service\Drive::DRIVE);
                    
                    // Create Drive service
                    $service = new Google\Service\Drive($client);
                    
                    // List files
                    $files = $service->files->listFiles([
                        'q' => "'$folderId' in parents and trashed=false",
                        'fields' => 'files(id, name, mimeType, size, createdTime)'
                    ]);
                    
                    $fileList = $files->getFiles();
                    $actionResults[] = "Found " . count($fileList) . " files in folder";
                    
                    // Store for display later
                    $folderFiles = $fileList;
                    break;
                    
                case 'add_permission':
                    if (empty($serviceAccountEmail)) {
                        throw new Exception("Service account email not available");
                    }
                    
                    // Initialize Google API client
                    $client = new Google\Client();
                    $client->setAuthConfig($serviceAccountPath);
                    $client->addScope(Google\Service\Drive::DRIVE);
                    
                    // Create Drive service
                    $service = new Google\Service\Drive($client);
                    
                    // Create new permission
                    $newPermission = new Google\Service\Drive\Permission([
                        'type' => 'user',
                        'role' => 'writer',
                        'emailAddress' => $serviceAccountEmail
                    ]);
                    
                    $permission = $service->permissions->create(
                        $folderId,
                        $newPermission,
                        ['fields' => 'id,emailAddress,role']
                    );
                    
                    $actionResults[] = "✅ Permission added successfully! The service account now has Editor access to the folder.";
                    break;
            }
        } catch (Exception $e) {
            $actionResults[] = "❌ Action failed: " . $e->getMessage();
        }
    }
}

// Display messages and errors
echo '<div class="box">';
echo '<h2>Configuration Check</h2>';

if (!empty($errors)) {
    echo '<div class="error">';
    foreach ($errors as $err) {
        echo '<p>' . htmlspecialchars($err) . '</p>';
    }
    echo '</div>';
}

foreach ($messages as $msg) {
    if (strpos($msg, '✅') === 0) {
        echo '<p class="success">' . htmlspecialchars($msg) . '</p>';
    } else if (strpos($msg, '❌') === 0) {
        echo '<p class="error">' . htmlspecialchars($msg) . '</p>';
    } else {
        echo '<p>' . htmlspecialchars($msg) . '</p>';
    }
}
echo '</div>';

// Display folder info if available
if ($folderInfo) {
    echo '<div class="box">';
    echo '<h2>Google Drive Folder Information</h2>';
    echo '<table>';
    echo '<tr><td>Folder Name:</td><td>' . htmlspecialchars($folderInfo['name']) . '</td></tr>';
    echo '<tr><td>Folder ID:</td><td>' . htmlspecialchars($folderInfo['id']) . '</td></tr>';
    echo '<tr><td>Can Edit:</td><td>' . ($folderInfo['canEdit'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td></tr>';
    echo '<tr><td>Can Add Children:</td><td>' . ($folderInfo['canAddChildren'] ? '<span class="success">Yes</span>' : '<span class="error">No</span>') . '</td></tr>';
    echo '<tr><td>Can Delete:</td><td>' . ($folderInfo['canDelete'] ? 'Yes' : 'No') . '</td></tr>';
    echo '<tr><td>Can List Children:</td><td>' . ($folderInfo['canListChildren'] ? 'Yes' : 'No') . '</td></tr>';
    echo '<tr><td>Can Rename:</td><td>' . ($folderInfo['canRename'] ? 'Yes' : 'No') . '</td></tr>';
    echo '</table>';
    
    echo '<p>Google Drive folder URL: <a href="https://drive.google.com/drive/folders/' . htmlspecialchars($folderInfo['id']) . 
         '" target="_blank">Open in Google Drive</a></p>';
    
    // Determine overall status
    $permissionOk = $folderInfo['canEdit'] && $folderInfo['canAddChildren'];
    
    if ($permissionOk) {
        echo '<div class="success">✅ Your service account has proper permissions on this folder!</div>';
    } else {
        echo '<div class="error">❌ Your service account does not have sufficient permissions on this folder.</div>';
        
        if ($serviceAccountEmail) {
            echo '<div class="box">';
            echo '<h3>How to Fix</h3>';
            echo '<p>Share your Google Drive folder with the service account email address:</p>';
            echo '<input type="text" value="' . htmlspecialchars($serviceAccountEmail) . '" readonly style="width:100%" onclick="this.select()">';
            echo '<ol>
                <li>Go to <a href="https://drive.google.com/drive/folders/' . htmlspecialchars($folderInfo['id']) . '" target="_blank">your Google Drive folder</a></li>
                <li>Right-click on the folder and select "Share"</li>
                <li>Copy and paste the service account email above into the "People" field</li>
                <li>Set the permission to "Editor"</li>
                <li>Click "Send" (no need to send notification)</li>
                <li>Come back here and click "Test Upload" below to verify</li>
            </ol>';
            echo '<form method="post">
                <input type="hidden" name="action" value="add_permission">
                <button type="submit">Add Permission Automatically</button>
                <small>(This may not work if your account doesn\'t have owner/manager permission on the folder)</small>
            </form>';
            echo '</div>';
        }
    }
    
    echo '</div>';
}

// Display action buttons
echo '<div class="box">';
echo '<h2>Actions</h2>';
echo '<form method="post" style="display:inline-block; margin-right: 10px;">
    <input type="hidden" name="action" value="test_upload">
    <button type="submit">Test Upload</button>
</form>';

echo '<form method="post" style="display:inline-block;">
    <input type="hidden" name="action" value="list_files">
    <button type="submit">List Files</button>
</form>';
echo '</div>';

// Display action results
if (!empty($actionResults)) {
    echo '<div class="box">';
    echo '<h2>Action Results</h2>';
    foreach ($actionResults as $result) {
        if (strpos($result, '✅') === 0) {
            echo '<p class="success">' . htmlspecialchars($result) . '</p>';
        } else if (strpos($result, '❌') === 0) {
            echo '<p class="error">' . htmlspecialchars($result) . '</p>';
        } else {
            echo '<p>' . htmlspecialchars($result) . '</p>';
        }
    }
    echo '</div>';
}

// Display files if available
if (isset($folderFiles) && !empty($folderFiles)) {
    echo '<div class="box">';
    echo '<h2>Files in Folder</h2>';
    echo '<table>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Created</th>
        </tr>';
    
    foreach ($folderFiles as $file) {
        $size = $file->getSize() ? number_format($file->getSize() / 1024, 2) . ' KB' : 'N/A';
        $created = $file->getCreatedTime() ? date('Y-m-d H:i:s', strtotime($file->getCreatedTime())) : 'N/A';
        
        echo '<tr>
            <td>' . htmlspecialchars($file->getName()) . '</td>
            <td>' . htmlspecialchars($file->getMimeType()) . '</td>
            <td>' . htmlspecialchars($size) . '</td>
            <td>' . htmlspecialchars($created) . '</td>
        </tr>';
    }
    
    echo '</table>';
    echo '</div>';
}

// Display service account info and instructions
if ($serviceAccountEmail) {
    echo '<div class="box">';
    echo '<h2>Service Account Information</h2>';
    echo '<p>Service Account Email:</p>';
    echo '<input type="text" value="' . htmlspecialchars($serviceAccountEmail) . '" readonly style="width:100%" onclick="this.select()">';
    echo '<p>This is the email address you need to share your Google Drive folder with.</p>';
    
    echo '<h3>How to Share a Google Drive Folder</h3>
    <ol>
        <li>Go to <a href="https://drive.google.com" target="_blank">Google Drive</a></li>
        <li>Navigate to your folder (or <a href="https://drive.google.com/drive/folders/' . htmlspecialchars($folderId) . '" target="_blank">click here</a> if the folder ID is correct)</li>
        <li>Right-click on the folder and select "Share"</li>
        <li>Copy and paste the service account email above into the "People" field</li>
        <li>Set the permission to "Editor"</li>
        <li>Click "Send" (no need to send notification)</li>
        <li>Come back here and click "Test Upload" to verify</li>
    </ol>';
    echo '</div>';
}

// Footer with troubleshooting section
echo '
<div class="box">
    <h2>Troubleshooting Tips</h2>
    <ul>
        <li><strong>Permission Issues:</strong> Make sure the Google Drive folder is shared with the service account email as an "Editor".</li>
        <li><strong>Folder ID Issues:</strong> Verify the folder ID in your .env file matches the actual folder ID in Google Drive.</li>
        <li><strong>Service Account Issues:</strong> Ensure your service account JSON file is valid and has all required fields.</li>
        <li><strong>API Access:</strong> Make sure the Google Drive API is enabled for your project in the Google Cloud Console.</li>
    </ul>
    <p>For more information, check the <a href="https://developers.google.com/drive/api/guides/folder" target="_blank">Google Drive API documentation</a>.</p>
</div>';

echo '</body></html>';
