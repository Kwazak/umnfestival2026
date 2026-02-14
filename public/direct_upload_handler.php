<?php
// =====================================================================
// DIRECT UPLOAD HANDLER
// This file handles file uploads without any Laravel dependencies
// =====================================================================

// Display all PHP errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set runtime limits
ini_set('max_execution_time', 300);
ini_set('memory_limit', '256M');
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '40M');

// Header
header('Content-Type: text/html; charset=UTF-8');

// Start HTML output
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Result</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 0 20px; line-height: 1.5; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; }
        img { max-width: 300px; height: auto; }
        a.button { padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        a.button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>File Upload Result</h1>';

// Function to format file size
function formatFileSize($bytes) {
    if ($bytes < 1024) return "$bytes bytes";
    if ($bytes < 1048576) return round($bytes/1024, 2)." KB";
    return round($bytes/1048576, 2)." MB";
}

// Process the upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['emergency_file'])) {
    $file = $_FILES['emergency_file'];
    
    echo '<div class="result">';
    
    if ($file['error'] === UPLOAD_ERR_OK) {
        // Show file info
        echo '<h2>File Information</h2>';
        echo '<ul>';
        echo '<li>Name: '.htmlspecialchars($file['name']).'</li>';
        echo '<li>Type: '.$file['type'].'</li>';
        echo '<li>Size: '.formatFileSize($file['size']).'</li>';
        echo '<li>Temporary path: '.$file['tmp_name'].'</li>';
        echo '</ul>';
        
        // Determine destination based on selection
        $destination = '';
        $webPath = '';
        
        switch ($_POST['save_location']) {
            case 'public_uploads':
                $uploadDir = __DIR__ . '/uploads';
                $webPath = 'uploads';
                break;
                
            case 'storage_uploads':
                $uploadDir = __DIR__ . '/../storage/app/public/uploads';
                $webPath = 'storage/uploads';
                break;
                
            case 'storage_fallback':
                $uploadDir = __DIR__ . '/../storage/app/google_drive_fallback';
                $webPath = null; // No web access to this folder
                break;
                
            default:
                $uploadDir = __DIR__ . '/uploads';
                $webPath = 'uploads';
        }
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                echo '<p class="error">Failed to create upload directory!</p>';
                $error = error_get_last();
                if ($error) {
                    echo '<p>Error: ' . $error['message'] . '</p>';
                }
                die('</div></body></html>');
            }
        }
        
        // Generate filename with timestamp to avoid conflicts
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
        $destination = $uploadDir . '/' . $fileName;
        
        // Try to move the file
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo '<p class="success">File uploaded successfully!</p>';
            echo '<p>Saved to: ' . $destination . '</p>';
            
            // Create a simple database record
            $record = [
                'filename' => $fileName,
                'original_name' => $file['name'],
                'path' => $destination,
                'mime_type' => $file['type'],
                'size' => $file['size'],
                'uploaded_at' => date('Y-m-d H:i:s')
            ];
            
            // Save record to a simple CSV file for tracking
            $csvFile = __DIR__ . '/uploads/file_records.csv';
            $isNewFile = !file_exists($csvFile);
            
            $fp = fopen($csvFile, 'a');
            
            if ($isNewFile) {
                fputcsv($fp, array_keys($record));
            }
            
            fputcsv($fp, $record);
            fclose($fp);
            
            echo '<p>Record saved to tracking file.</p>';
            
            // Display image preview if applicable
            if ($webPath && strpos($file['type'], 'image/') === 0) {
                echo '<h2>Preview</h2>';
                echo '<img src="' . $webPath . '/' . $fileName . '" alt="Uploaded image">';
            }
            
            // Record upload in a log file
            $logMsg = date('Y-m-d H:i:s') . " - Uploaded: {$file['name']} ({$file['size']} bytes) to {$destination}\n";
            file_put_contents(__DIR__ . '/upload_log.txt', $logMsg, FILE_APPEND);
        } else {
            echo '<p class="error">Failed to move uploaded file!</p>';
            
            // Get detailed error
            $error = error_get_last();
            if ($error) {
                echo '<p>Error: ' . $error['message'] . '</p>';
            }
            
            // Check directory permissions
            echo '<h3>Directory Permissions:</h3>';
            echo '<ul>';
            echo '<li>Path: ' . $uploadDir . '</li>';
            echo '<li>Exists: ' . (is_dir($uploadDir) ? 'Yes' : 'No') . '</li>';
            echo '<li>Writable: ' . (is_writable($uploadDir) ? 'Yes' : 'No') . '</li>';
            echo '<li>Permissions: ' . substr(sprintf('%o', fileperms($uploadDir)), -4) . '</li>';
            echo '</ul>';
        }
    } else {
        echo '<p class="error">Upload failed with error code: ' . $file['error'] . '</p>';
        
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
        ];
        
        $errorMessage = $errorMessages[$file['error']] ?? 'Unknown error';
        echo '<p>Error details: ' . $errorMessage . '</p>';
    }
    
    echo '</div>';
} else {
    echo '<p class="error">No file upload detected or invalid request method.</p>';
}

// PHP configuration info
echo '<h2>PHP Configuration</h2>';
echo '<pre>';
echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . "\n";
echo 'post_max_size: ' . ini_get('post_max_size') . "\n";
echo 'max_file_uploads: ' . ini_get('max_file_uploads') . "\n";
echo 'memory_limit: ' . ini_get('memory_limit') . "\n";
echo 'PHP version: ' . phpversion() . "\n";
echo '</pre>';

// Navigation links
echo '<p>';
echo '<a href="fixupload.php" class="button">Back to Fix Tool</a> ';
echo '<a href="direct_upload.php" class="button">Direct Upload Test</a>';
echo '</p>';

// Close HTML
echo '</body></html>';
?>
