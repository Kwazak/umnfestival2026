<?php
// Create a test file in storage
$filePath = __DIR__ . '/../storage/test_file.txt';
$content = 'This is a test file. Created at ' . date('Y-m-d H:i:s');

echo "<h1>Storage Access Test</h1>";

try {
    if (file_put_contents($filePath, $content)) {
        echo "<p style='color: green'>Successfully wrote file to: $filePath</p>";
        echo "<p>Content: $content</p>";
        echo "<p>File size: " . filesize($filePath) . " bytes</p>";
    } else {
        echo "<p style='color: red'>Failed to write file!</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red'>Error: " . $e->getMessage() . "</p>";
}

// Try to create directory
$dirPath = __DIR__ . '/../storage/test_dir';
echo "<h2>Directory Creation Test</h2>";

try {
    if (!is_dir($dirPath)) {
        if (mkdir($dirPath, 0755)) {
            echo "<p style='color: green'>Successfully created directory: $dirPath</p>";
        } else {
            echo "<p style='color: red'>Failed to create directory!</p>";
        }
    } else {
        echo "<p style='color: green'>Directory already exists: $dirPath</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red'>Error: " . $e->getMessage() . "</p>";
}

// Show file permissions
echo "<h2>File Permissions</h2>";
echo "<pre>";
echo "Storage directory: " . __DIR__ . '/../storage' . "\n";
echo "Exists: " . (is_dir(__DIR__ . '/../storage') ? 'Yes' : 'No') . "\n";
echo "Permissions: " . substr(sprintf('%o', fileperms(__DIR__ . '/../storage')), -4) . "\n";
echo "Writable: " . (is_writable(__DIR__ . '/../storage') ? 'Yes' : 'No') . "\n";
echo "</pre>";

// Show current user
echo "<h2>PHP Process Information</h2>";
echo "<pre>";
echo "Current user: " . get_current_user() . "\n";
echo "PHP version: " . phpversion() . "\n";
echo "Server API: " . php_sapi_name() . "\n";
echo "</pre>";
