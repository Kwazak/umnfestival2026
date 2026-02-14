<?php
/**
 * Fix Instructions for Google Drive Upload Issue
 * This script provides clear instructions on how to resolve the Google Drive quota issue
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
    <title>Google Drive Upload Fix Instructions</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5; }
        h1, h2, h3 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; }
        .box { background: #f8f8f8; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
        pre { background: #eee; padding: 10px; overflow: auto; }
        code { background: #eee; padding: 2px 4px; }
        ol li, ul li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Google Drive Upload Fix Instructions</h1>
    <p>This guide will help you verify that the Google Drive upload fix has been properly applied.</p>

    <div class="box">
        <h2>Understanding the Issue</h2>
        <p>The error <span class="error">"Service Accounts do not have storage quota"</span> occurs because Google service accounts don\'t have their own Drive storage quota. To resolve this, we need to:</p>
        <ol>
            <li>Ensure the folder is properly shared with the service account</li>
            <li>Use <code>supportsAllDrives=true</code> parameter in API calls</li>
            <li>Explicitly specify the parent folder ID in uploads</li>
        </ol>
    </div>

    <div class="box">
        <h2>Verification Steps</h2>
        <ol>
            <li>
                <strong>Step 1: Check Service Account Permissions</strong>
                <p>Make sure your Google Drive folder is shared with the service account email as an <strong>Editor</strong>.</p>';

// Check if we can access the service account email
$serviceAccountPath = __DIR__ . '/../storage/app/google/service-account.json';
$serviceAccountEmail = null;

if (file_exists($serviceAccountPath)) {
    try {
        $serviceAccountJson = json_decode(file_get_contents($serviceAccountPath), true);
        if (isset($serviceAccountJson['client_email'])) {
            $serviceAccountEmail = $serviceAccountJson['client_email'];
            echo '<p><strong>Your service account email:</strong> <span class="info">' . htmlspecialchars($serviceAccountEmail) . '</span></p>';
            echo '<p>Share your Google Drive folder with this email address and give it "Editor" access.</p>';
        }
    } catch (Exception $e) {
        echo '<p class="error">Error reading service account file: ' . htmlspecialchars($e->getMessage()) . '</p>';
    }
} else {
    echo '<p class="error">Service account JSON file not found at: ' . htmlspecialchars($serviceAccountPath) . '</p>';
}

// Get folder ID from .env
$envPath = __DIR__ . '/../.env';
$folderId = null;

if (file_exists($envPath)) {
    $envFile = file_get_contents($envPath);
    if (preg_match('/GOOGLE_DRIVE_FOLDER_ID=([^\n]+)/', $envFile, $matches)) {
        $folderId = trim($matches[1], '"\'');
        echo '<p><strong>Your configured folder ID:</strong> <span class="info">' . htmlspecialchars($folderId) . '</span></p>';
    }
}

echo '
            </li>
            <li>
                <strong>Step 2: Run the Test Script</strong>
                <p>Run the <a href="test-drive-upload-fix.php" target="_blank">test-drive-upload-fix.php</a> script to verify that uploads are working.</p>
                <p>This script will:</p>
                <ul>
                    <li>Create a test file</li>
                    <li>Upload it to Google Drive using the direct API with <code>supportsAllDrives=true</code></li>
                    <li>Upload another file using the Laravel Storage facade</li>
                    <li>Report whether each upload was successful</li>
                </ul>
            </li>
            <li>
                <strong>Step 3: Test the Admin Form</strong>
                <p>Try using the admin form to upload media files and check if they appear in your Google Drive folder.</p>
            </li>
            <li>
                <strong>Step 4: Check Laravel Logs</strong>
                <p>If issues persist, check the Laravel logs at <code>storage/logs/laravel.log</code> for detailed error messages.</p>
            </li>
        </ol>
    </div>

    <div class="box">
        <h2>What We\'ve Fixed</h2>
        <ol>
            <li>Updated <code>GoogleDriveServiceProvider.php</code> to:
                <ul>
                    <li>Use the folder ID as the root instead of "root"</li>
                    <li>Set <code>sharedFolderId</code> option</li>
                    <li>Enable <code>supportsAllDrives</code> option</li>
                </ul>
            </li>
            <li>Updated <code>TaskController.php</code> to:
                <ul>
                    <li>Use <code>supportsAllDrives=true</code> in all Google Drive API calls</li>
                    <li>Explicitly set <code>parents</code> array with the folder ID</li>
                    <li>Improve error logging and validation</li>
                </ul>
            </li>
            <li>Created backup directories for local file storage as fallback</li>
        </ol>
    </div>
    
    <div class="box">
        <h2>Troubleshooting</h2>
        <h3>If uploads still fail:</h3>
        <ol>
            <li>Verify that the folder is properly shared with the service account email</li>
            <li>Try using a different Google account to share the folder</li>
            <li>Check if the folder is inside a Shared Drive or if it\'s a regular folder</li>
            <li>Ensure your Google Drive API is enabled in the Google Cloud Console</li>
            <li>Check if there are any quota or rate limits affecting your project</li>
        </ol>
    </div>
</body>
</html>';
