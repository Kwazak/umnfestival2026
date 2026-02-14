<?php
// This file tests PHP upload configuration directly

// Display all PHP configuration related to file uploads
echo "<h1>PHP Upload Configuration</h1>";
echo "<pre>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "max_input_time: " . ini_get('max_input_time') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "file_uploads: " . (ini_get('file_uploads') ? 'On' : 'Off') . "\n";
echo "upload_tmp_dir: " . (ini_get('upload_tmp_dir') ?: 'System Default') . "\n";
echo "</pre>";

// Check if temp directory exists and is writable
$tempDir = ini_get('upload_tmp_dir') ?: sys_get_temp_dir();
echo "<h2>Temporary Directory Check</h2>";
echo "<p>Temp directory: $tempDir</p>";
echo "<p>Exists: " . (is_dir($tempDir) ? 'Yes' : 'No') . "</p>";
echo "<p>Writable: " . (is_writable($tempDir) ? 'Yes' : 'No') . "</p>";

// Check storage directories
echo "<h2>Storage Directory Check</h2>";
$storageDirectories = [
    'public/uploads' => storage_path('app/public/uploads'),
    'google_drive_fallback' => storage_path('app/google_drive_fallback'),
    'public' => storage_path('app/public'),
    'app' => storage_path('app'),
    'storage' => storage_path(),
];

echo "<ul>";
foreach ($storageDirectories as $name => $path) {
    echo "<li>";
    echo "$name: $path<br>";
    echo "Exists: " . (is_dir($path) ? 'Yes' : 'No') . "<br>";
    echo "Writable: " . (is_writable($path) ? 'Yes' : 'No');
    echo "</li>";
}
echo "</ul>";

// Test basic file write operation
echo "<h2>File Write Test</h2>";
try {
    $testFile = storage_path('app/public/test_' . time() . '.txt');
    $success = file_put_contents($testFile, "This is a test file created at " . date('Y-m-d H:i:s'));
    if ($success) {
        echo "<p style='color: green'>Successfully wrote test file: $testFile</p>";
        echo "<p>File size: " . filesize($testFile) . " bytes</p>";
        unlink($testFile);
        echo "<p>Test file removed.</p>";
    } else {
        echo "<p style='color: red'>Failed to write test file!</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red'>Error: " . $e->getMessage() . "</p>";
}

// Try to create a simple HTML form for file upload
echo "<h1>Simple File Upload Test</h1>";
echo "<p>This is the most basic file upload form possible:</p>";

echo "<form action='' method='post' enctype='multipart/form-data'>";
echo "<input type='hidden' name='MAX_FILE_SIZE' value='10000000' />";
echo "<input type='file' name='test_file' />";
echo "<input type='submit' name='submit' value='Upload' />";
echo "</form>";

// Process the upload if form submitted
if (isset($_POST['submit'])) {
    echo "<h2>Upload Results:</h2>";
    echo "<pre>";
    echo "FILES array: ";
    print_r($_FILES);
    echo "</pre>";
    
    if (isset($_FILES['test_file']) && $_FILES['test_file']['error'] === UPLOAD_ERR_OK) {
        $uploadedFile = $_FILES['test_file'];
        $tmpName = $uploadedFile['tmp_name'];
        $name = $uploadedFile['name'];
        $size = $uploadedFile['size'];
        $type = $uploadedFile['type'];
        
        echo "<p>File received: $name ($type, $size bytes)</p>";
        echo "<p>Temporary location: $tmpName</p>";
        
        // Try to move the file
        $destination = storage_path('app/public/uploads/' . time() . '_' . $name);
        if (move_uploaded_file($tmpName, $destination)) {
            echo "<p style='color: green'>File successfully moved to: $destination</p>";
        } else {
            echo "<p style='color: red'>Failed to move uploaded file!</p>";
            echo "<p>Error: " . error_get_last()['message'] . "</p>";
        }
    } else {
        echo "<p style='color: red'>Upload failed!</p>";
        if (isset($_FILES['test_file'])) {
            $errorCode = $_FILES['test_file']['error'];
            $errorMessage = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the upload',
            ][$errorCode] ?? "Unknown error ($errorCode)";
            echo "<p>Error: $errorMessage</p>";
        } else {
            echo "<p>No file data received in \$_FILES</p>";
        }
    }
}

// Output PHP version and environment info
echo "<h2>PHP Environment</h2>";
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "Server API: " . php_sapi_name() . "\n";
echo "Operating System: " . PHP_OS . "\n";
echo "Web User: " . get_current_user() . "\n";
echo "</pre>";
