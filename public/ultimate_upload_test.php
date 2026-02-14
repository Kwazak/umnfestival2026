<?php
// ========================================================================
// STANDALONE FILE UPLOAD TEST SCRIPT - NO LARAVEL DEPENDENCIES
// This file tests the most basic PHP file upload functionality
// ========================================================================

// Display all PHP errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set time and memory limits
set_time_limit(300); // 5 minutes
ini_set('memory_limit', '256M');

// Manually increase upload limits at runtime
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '40M');
ini_set('max_file_uploads', '20');

// Header information
header('Content-Type: text/html; charset=UTF-8');

// Start output
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate PHP Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; border-radius: 4px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .info { color: blue; font-weight: bold; }
        .box { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 4px; }
        button { background: #4CAF50; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>Ultimate PHP Upload Test</h1>
    <p>This script tests file uploads with no framework dependencies. It attempts all possible methods for saving files.</p>';

// Function to format file sizes
function formatSize($bytes) {
    if ($bytes < 1024) return "$bytes bytes";
    if ($bytes < 1048576) return round($bytes/1024, 2)." KB";
    return round($bytes/1048576, 2)." MB";
}

// Function to run a series of diagnostic tests
function runDiagnostics() {
    // Test 1: PHP Version and environment
    echo '<div class="box">
        <h2>1. PHP Environment</h2>
        <pre>';
    
    echo "PHP Version: " . phpversion() . "\n";
    echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
    echo "Server API: " . php_sapi_name() . "\n";
    echo "Operating System: " . PHP_OS . "\n";
    echo "Current User: " . get_current_user() . "\n";
    echo "Current Script: " . $_SERVER['SCRIPT_NAME'] . "\n";
    echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
    
    echo '</pre>
    </div>';
    
    // Test 2: PHP Upload Settings
    echo '<div class="box">
        <h2>2. PHP Upload Configuration</h2>
        <pre>';
    
    echo "file_uploads: " . (ini_get('file_uploads') ? 'Enabled' : 'Disabled') . "\n";
    echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
    echo "post_max_size: " . ini_get('post_max_size') . "\n";
    echo "max_file_uploads: " . ini_get('max_file_uploads') . "\n";
    echo "max_input_time: " . ini_get('max_input_time') . " seconds\n";
    echo "max_execution_time: " . ini_get('max_execution_time') . " seconds\n";
    echo "memory_limit: " . ini_get('memory_limit') . "\n";
    
    // Get the temporary upload directory
    $tmpDir = ini_get('upload_tmp_dir');
    if (empty($tmpDir)) {
        $tmpDir = sys_get_temp_dir();
        echo "upload_tmp_dir: Not set, using system temp: $tmpDir\n";
    } else {
        echo "upload_tmp_dir: $tmpDir\n";
    }
    
    // Check if the temp directory exists and is writable
    echo "Temp directory exists: " . (is_dir($tmpDir) ? 'Yes' : 'No') . "\n";
    echo "Temp directory writable: " . (is_writable($tmpDir) ? 'Yes' : 'No') . "\n";
    
    echo '</pre>
    </div>';
    
    // Test 3: Directory Access and Permissions
    echo '<div class="box">
        <h2>3. Directory Access Check</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr>
            <th>Directory</th>
            <th>Exists</th>
            <th>Writable</th>
            <th>Permissions</th>
            <th>Status</th>
        </tr>';
    
    $directories = [
        'Current directory' => dirname(__FILE__),
        'Parent directory' => dirname(dirname(__FILE__)),
        'Uploads directory' => dirname(__FILE__) . '/uploads',
        '/tmp directory' => '/tmp',
        'System temp' => sys_get_temp_dir()
    ];
    
    foreach ($directories as $name => $dir) {
        $exists = is_dir($dir);
        $writable = is_writable($dir);
        $perms = $exists ? substr(sprintf('%o', fileperms($dir)), -4) : 'N/A';
        $status = '';
        
        if (!$exists) {
            $status = '<span class="error">Directory does not exist</span>';
        } else if (!$writable) {
            $status = '<span class="error">Directory not writable</span>';
        } else {
            $status = '<span class="success">OK</span>';
        }
        
        echo "<tr>
            <td>$name<br><small>$dir</small></td>
            <td>" . ($exists ? 'Yes' : 'No') . "</td>
            <td>" . ($writable ? 'Yes' : 'No') . "</td>
            <td>$perms</td>
            <td>$status</td>
        </tr>";
    }
    
    echo '</table>
    </div>';
    
    // Test 4: Create test file
    echo '<div class="box">
        <h2>4. File Write Test</h2>';
    
    $testFile = dirname(__FILE__) . '/test_' . time() . '.txt';
    $content = 'This is a test file. Created at: ' . date('Y-m-d H:i:s');
    
    $writeResult = @file_put_contents($testFile, $content);
    
    if ($writeResult !== false) {
        echo "<p><span class='success'>Successfully wrote test file:</span> " . $testFile . "</p>";
        echo "<p>File size: " . filesize($testFile) . " bytes</p>";
        echo "<p>Content: " . htmlspecialchars($content) . "</p>";
        
        // Try to read it back
        $readResult = @file_get_contents($testFile);
        if ($readResult === $content) {
            echo "<p><span class='success'>Successfully read back the test file content</span></p>";
        } else {
            echo "<p><span class='error'>Failed to read back the test file content</span></p>";
        }
        
        // Remove the test file
        if (@unlink($testFile)) {
            echo "<p><span class='success'>Successfully deleted the test file</span></p>";
        } else {
            echo "<p><span class='error'>Failed to delete the test file</span></p>";
        }
    } else {
        echo "<p><span class='error'>Failed to write test file!</span></p>";
        $error = error_get_last();
        if ($error) {
            echo "<p>Error: " . $error['message'] . "</p>";
        }
    }
    
    // Try to create the uploads directory if it doesn't exist
    $uploadsDir = dirname(__FILE__) . '/uploads';
    if (!is_dir($uploadsDir)) {
        if (@mkdir($uploadsDir, 0755)) {
            echo "<p><span class='success'>Created uploads directory:</span> $uploadsDir</p>";
        } else {
            echo "<p><span class='error'>Failed to create uploads directory!</span></p>";
            $error = error_get_last();
            if ($error) {
                echo "<p>Error: " . $error['message'] . "</p>";
            }
        }
    } else {
        echo "<p>Uploads directory already exists: $uploadsDir</p>";
    }
    
    echo '</div>';
}

// Display the upload form
echo '<div class="box">
    <h2>Upload Test Form</h2>
    <p>Select a file to upload:</p>
    <form action="" method="post" enctype="multipart/form-data">
        <p>
            <input type="file" name="test_file" />
        </p>
        <p>
            <button type="submit" name="submit_upload">Upload File</button>
        </p>
    </form>
</div>';

// Process the upload if submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_upload'])) {
    echo '<div class="box">
        <h2>Upload Results</h2>';
    
    if (isset($_FILES['test_file'])) {
        $file = $_FILES['test_file'];
        
        echo '<h3>File Information</h3>';
        echo '<pre>';
        echo "Name: " . htmlspecialchars($file['name']) . "\n";
        echo "Type: " . $file['type'] . "\n";
        echo "Size: " . formatSize($file['size']) . " (" . $file['size'] . " bytes)\n";
        echo "Temp Name: " . $file['tmp_name'] . "\n";
        echo "Error Code: " . $file['error'] . "\n";
        echo '</pre>';
        
        if ($file['error'] === UPLOAD_ERR_OK) {
            echo "<p><span class='success'>File successfully uploaded to temporary location</span></p>";
            
            // Check if the temp file exists
            if (file_exists($file['tmp_name'])) {
                echo "<p><span class='success'>Temporary file exists and is accessible</span></p>";
                echo "<p>Temp file size: " . formatSize(filesize($file['tmp_name'])) . "</p>";
            } else {
                echo "<p><span class='error'>Temporary file does not exist or is not accessible!</span></p>";
            }
            
            // Create uploads directory if needed
            $uploadsDir = dirname(__FILE__) . '/uploads';
            if (!is_dir($uploadsDir)) {
                if (mkdir($uploadsDir, 0755, true)) {
                    echo "<p><span class='success'>Created uploads directory</span></p>";
                } else {
                    echo "<p><span class='error'>Failed to create uploads directory!</span></p>";
                }
            }
            
            // Try all possible methods to save the file
            
            // METHOD 1: move_uploaded_file (the standard way)
            echo "<h3>Method 1: move_uploaded_file</h3>";
            $destination = $uploadsDir . '/' . time() . '_' . $file['name'];
            
            if (move_uploaded_file($file['tmp_name'], $destination)) {
                echo "<p><span class='success'>Method 1 successful!</span></p>";
                echo "<p>File saved to: " . $destination . "</p>";
                
                // Display image preview if it's an image
                if (strpos($file['type'], 'image/') === 0) {
                    $webPath = 'uploads/' . basename($destination);
                    echo "<p><img src='$webPath' alt='Uploaded image' style='max-width: 300px; max-height: 300px;'></p>";
                }
                
                // No need to try other methods
                echo "<p>File successfully saved using the preferred method.</p>";
            } else {
                echo "<p><span class='error'>Method 1 failed!</span></p>";
                $error = error_get_last();
                if ($error) {
                    echo "<p>Error: " . $error['message'] . "</p>";
                }
                
                // METHOD 2: copy
                echo "<h3>Method 2: copy</h3>";
                $destination = $uploadsDir . '/copy_' . time() . '_' . $file['name'];
                
                if (copy($file['tmp_name'], $destination)) {
                    echo "<p><span class='success'>Method 2 successful!</span></p>";
                    echo "<p>File saved to: " . $destination . "</p>";
                } else {
                    echo "<p><span class='error'>Method 2 failed!</span></p>";
                    $error = error_get_last();
                    if ($error) {
                        echo "<p>Error: " . $error['message'] . "</p>";
                    }
                    
                    // METHOD 3: file_put_contents
                    echo "<h3>Method 3: file_put_contents</h3>";
                    $content = file_get_contents($file['tmp_name']);
                    
                    if ($content !== false) {
                        $destination = $uploadsDir . '/put_' . time() . '_' . $file['name'];
                        $result = file_put_contents($destination, $content);
                        
                        if ($result !== false) {
                            echo "<p><span class='success'>Method 3 successful!</span></p>";
                            echo "<p>File saved to: " . $destination . "</p>";
                        } else {
                            echo "<p><span class='error'>Method 3 failed!</span></p>";
                            $error = error_get_last();
                            if ($error) {
                                echo "<p>Error: " . $error['message'] . "</p>";
                            }
                        }
                    } else {
                        echo "<p><span class='error'>Could not read temporary file content!</span></p>";
                    }
                }
            }
        } else {
            // There was an upload error
            echo "<p><span class='error'>Upload failed with error code: " . $file['error'] . "</span></p>";
            
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
                UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
            ];
            
            if (isset($errorMessages[$file['error']])) {
                echo "<p>Error explanation: " . $errorMessages[$file['error']] . "</p>";
                
                // Additional guidance for specific errors
                if ($file['error'] === UPLOAD_ERR_INI_SIZE) {
                    echo "<p>Your file size (" . formatSize($file['size']) . ") exceeds the limit of " . ini_get('upload_max_filesize') . "</p>";
                    echo "<p>To fix this, edit php.ini or .user.ini and increase the upload_max_filesize value.</p>";
                } else if ($file['error'] === UPLOAD_ERR_NO_TMP_DIR) {
                    echo "<p>The server's temporary directory is missing or not writable.</p>";
                    echo "<p>Contact your server administrator to fix this issue.</p>";
                }
            }
        }
    } else {
        echo "<p><span class='error'>No file data received in \$_FILES array!</span></p>";
        echo "<p>This suggests a server configuration issue or that the form wasn't submitted properly.</p>";
    }
    
    // DEBUG: Show raw POST and FILES data
    echo "<h3>Raw Request Data</h3>";
    echo "<p>POST Data:</p>";
    echo "<pre>" . print_r($_POST, true) . "</pre>";
    
    echo "<p>FILES Data:</p>";
    echo "<pre>" . print_r($_FILES, true) . "</pre>";
    
    echo '</div>';
}

// Run diagnostic tests
runDiagnostics();

// Page footer
echo '<div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
    Ultimate PHP Upload Test v1.0 - ' . date('Y-m-d H:i:s') . '
</div>
</body>
</html>';
?>
