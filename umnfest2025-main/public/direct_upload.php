<?php

// This is the most basic file upload script with no Laravel dependencies

// Display any errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set time limit and memory
ini_set('max_execution_time', 300);
ini_set('memory_limit', '256M');

// HTTP headers
header('Content-Type: text/html; charset=UTF-8');

// Helper function
function getFilesizeStr($bytes) {
    if ($bytes < 1024) return "$bytes bytes";
    if ($bytes < 1048576) return round($bytes/1024, 2)." KB";
    return round($bytes/1048576, 2)." MB";
}

// Results container
$results = [];
$success = false;

// Process upload if form submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['direct_file'])) {
    $file = $_FILES['direct_file'];
    $results[] = [
        'name' => htmlspecialchars($file['name']),
        'type' => $file['type'],
        'tmp_name' => $file['tmp_name'],
        'error' => $file['error'],
        'size' => $file['size'],
        'size_str' => getFilesizeStr($file['size']),
    ];
    
    if ($file['error'] === UPLOAD_ERR_OK) {
        // Upload directory - ensure it exists and is writable
        $uploadDir = __DIR__ . '/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $file['name']);
        $filePath = $uploadDir . '/' . $fileName;
        
        // Try to move the file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            $success = true;
            $results[0]['moved_to'] = $filePath;
            $results[0]['url'] = 'uploads/' . $fileName;
        } else {
            $results[0]['error_message'] = 'Failed to move uploaded file';
            $results[0]['error_details'] = error_get_last()['message'] ?? 'Unknown error';
        }
    } else {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
            UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
        ];
        $results[0]['error_message'] = $errorMessages[$file['error']] ?? 'Unknown upload error';
    }
}

// Output HTML with form and results
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Direct PHP File Upload</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-container { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
        .result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <h1>Direct PHP File Upload</h1>
    <p>This is a standalone PHP file upload script with no framework dependencies.</p>
    
    <div class="form-container">
        <form method="post" enctype="multipart/form-data">
            <p>
                <label for="direct_file">Select file:</label><br>
                <input type="file" name="direct_file" id="direct_file">
            </p>
            <p>
                <button type="submit">Upload File</button>
            </p>
        </form>
    </div>
    
    <?php if ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
    <div class="result">
        <h2><?= $success ? '<span class="success">Upload Successful!</span>' : '<span class="error">Upload Failed!</span>' ?></h2>
        
        <?php foreach ($results as $result): ?>
        <div>
            <h3>File: <?= $result['name'] ?></h3>
            <ul>
                <li>Size: <?= $result['size_str'] ?></li>
                <li>Type: <?= $result['type'] ?></li>
                <li>Temporary name: <?= $result['tmp_name'] ?></li>
                <li>Error code: <?= $result['error'] ?></li>
                
                <?php if (isset($result['error_message'])): ?>
                <li class="error">Error message: <?= $result['error_message'] ?></li>
                    <?php if (isset($result['error_details'])): ?>
                    <li class="error">Details: <?= $result['error_details'] ?></li>
                    <?php endif; ?>
                <?php endif; ?>
                
                <?php if (isset($result['moved_to'])): ?>
                <li class="success">File saved to: <?= $result['moved_to'] ?></li>
                    <?php if (strpos($result['type'], 'image/') === 0): ?>
                    <li><img src="<?= htmlspecialchars($result['url']) ?>" alt="Uploaded image"></li>
                    <?php endif; ?>
                <?php endif; ?>
            </ul>
        </div>
        <?php endforeach; ?>
    </div>
    <?php endif; ?>
    
    <h2>PHP Configuration</h2>
    <pre>
upload_max_filesize: <?= ini_get('upload_max_filesize') ?>

post_max_size: <?= ini_get('post_max_size') ?>

max_file_uploads: <?= ini_get('max_file_uploads') ?>

memory_limit: <?= ini_get('memory_limit') ?>

PHP version: <?= phpversion() ?>

Server software: <?= $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown' ?>
    </pre>
    
    <p><a href="php_upload_test.php" style="color: blue;">Back to Upload Test Script</a></p>
</body>
</html>
