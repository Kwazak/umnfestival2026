<?php
// =====================================================================
// FILE UPLOAD DIAGNOSTIC AND REPAIR TOOL
// This script will diagnose and fix file upload issues
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
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Fix Tool</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 20px auto; padding: 0 20px; line-height: 1.5; }
        h1, h2, h3 { color: #333; }
        .section { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .info { color: blue; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .actions { margin-top: 15px; }
        button, .button { padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin-right: 5px; }
        button:hover, .button:hover { background: #45a049; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .fix-btn { background: #2196F3; }
        .fix-btn:hover { background: #0b7dda; }
    </style>
</head>
<body>
    <h1>File Upload Diagnostic and Repair Tool</h1>';

// Function definitions
function checkDirectoryPermissions($path, $autoFix = false) {
    $result = [
        'path' => $path,
        'exists' => false,
        'writable' => false,
        'perms' => '',
        'owner' => '',
        'group' => '',
        'fixed' => false,
        'error' => null
    ];
    
    try {
        // Check if directory exists
        if (!file_exists($path)) {
            if ($autoFix) {
                if (mkdir($path, 0755, true)) {
                    $result['exists'] = true;
                    $result['fixed'] = true;
                    $result['message'] = "Created directory";
                } else {
                    $result['error'] = "Failed to create directory";
                }
            } else {
                $result['error'] = "Directory does not exist";
            }
        } else {
            $result['exists'] = true;
            
            // Check if it's a directory
            if (!is_dir($path)) {
                $result['error'] = "Path exists but is not a directory";
                return $result;
            }
        }
        
        // Get permissions if directory exists
        if ($result['exists']) {
            $result['perms'] = substr(sprintf('%o', fileperms($path)), -4);
            $result['writable'] = is_writable($path);
            
            // Get owner/group info if function exists
            if (function_exists('posix_getpwuid') && function_exists('posix_getgrgid')) {
                $owner = posix_getpwuid(fileowner($path));
                $group = posix_getgrgid(filegroup($path));
                $result['owner'] = $owner['name'] ?? 'unknown';
                $result['group'] = $group['name'] ?? 'unknown';
            }
            
            // Try to fix permissions if not writable
            if (!$result['writable'] && $autoFix) {
                if (@chmod($path, 0755)) {
                    $result['writable'] = true;
                    $result['fixed'] = true;
                    $result['perms'] = '0755';
                    $result['message'] = "Fixed permissions";
                } else {
                    $result['error'] = "Failed to set directory permissions";
                }
            }
        }
    } catch (Exception $e) {
        $result['error'] = $e->getMessage();
    }
    
    return $result;
}

function displayDirectoryCheck($result) {
    $statusClass = $result['exists'] && $result['writable'] ? 'success' : 'error';
    $statusIcon = $result['exists'] && $result['writable'] ? '✓' : '✗';
    
    echo "<tr>";
    echo "<td>{$result['path']}</td>";
    echo "<td class='{$statusClass}'>{$statusIcon} " . ($result['exists'] ? 'Yes' : 'No') . "</td>";
    echo "<td class='{$statusClass}'>{$statusIcon} " . ($result['writable'] ? 'Yes' : 'No') . "</td>";
    echo "<td>{$result['perms']}</td>";
    
    if (!empty($result['owner'])) {
        echo "<td>{$result['owner']}:{$result['group']}</td>";
    } else {
        echo "<td>N/A</td>";
    }
    
    echo "<td>";
    if ($result['error']) {
        echo "<span class='error'>{$result['error']}</span>";
    } else if ($result['fixed']) {
        echo "<span class='success'>{$result['message']}</span>";
    } else if (!$result['exists'] || !$result['writable']) {
        echo "<form method='post'>
                <input type='hidden' name='action' value='fix_directory'>
                <input type='hidden' name='path' value='{$result['path']}'>
                <button type='submit' class='fix-btn'>Fix</button>
              </form>";
    } else {
        echo "<span class='success'>OK</span>";
    }
    echo "</td>";
    echo "</tr>";
}

// Process actions if any
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'fix_directory':
                if (isset($_POST['path'])) {
                    $result = checkDirectoryPermissions($_POST['path'], true);
                    if ($result['fixed']) {
                        $message = "<div class='success'>Successfully fixed directory: {$_POST['path']}</div>";
                    } else {
                        $message = "<div class='error'>Failed to fix directory: {$_POST['path']} - {$result['error']}</div>";
                    }
                }
                break;
                
            case 'test_upload':
                // Process will happen below
                break;
        }
    }
}

// Show message if any
if ($message) {
    echo "<div class='section'>{$message}</div>";
}

// =====================================================================
// SECTION 1: PHP CONFIGURATION
// =====================================================================
echo "<div class='section'>
    <h2>1. PHP Configuration</h2>
    <table>
        <tr>
            <th>Setting</th>
            <th>Current Value</th>
            <th>Recommended</th>
            <th>Status</th>
        </tr>";

$phpSettings = [
    'upload_max_filesize' => ['20M', 'Size limit for individual files'],
    'post_max_size' => ['40M', 'Total size limit for all POST data'],
    'max_file_uploads' => ['20', 'Maximum number of files per upload'],
    'max_execution_time' => ['300', 'Script timeout in seconds'],
    'memory_limit' => ['256M', 'Memory allocated to PHP scripts'],
    'file_uploads' => ['1', 'Whether file uploads are enabled'],
    'upload_tmp_dir' => ['', 'Temporary directory for uploads']
];

foreach ($phpSettings as $setting => $details) {
    $currentValue = ini_get($setting);
    $recommended = $details[0];
    $description = $details[1];
    
    // Check if the value is sufficient
    $isOk = true;
    if ($setting === 'upload_max_filesize' || $setting === 'post_max_size' || $setting === 'memory_limit') {
        // Convert to bytes for comparison
        $currentBytes = intval($currentValue) * (strpos($currentValue, 'G') !== false ? 1073741824 : (strpos($currentValue, 'M') !== false ? 1048576 : (strpos($currentValue, 'K') !== false ? 1024 : 1)));
        $recommendedBytes = intval($recommended) * (strpos($recommended, 'G') !== false ? 1073741824 : (strpos($recommended, 'M') !== false ? 1048576 : (strpos($recommended, 'K') !== false ? 1024 : 1)));
        
        $isOk = $currentBytes >= $recommendedBytes;
    } else if ($setting === 'max_execution_time' || $setting === 'max_file_uploads') {
        $isOk = intval($currentValue) >= intval($recommended);
    } else if ($setting === 'file_uploads') {
        $isOk = $currentValue == $recommended;
    }
    
    $statusClass = $isOk ? 'success' : 'warning';
    $statusText = $isOk ? 'OK' : 'Too low';
    
    echo "<tr>
            <td>{$setting}<br><small>{$description}</small></td>
            <td>{$currentValue}</td>
            <td>{$recommended}</td>
            <td class='{$statusClass}'>{$statusText}</td>
          </tr>";
}

echo "</table>
<p><b>Note:</b> Some PHP settings cannot be changed at runtime and require changes to php.ini, .user.ini, or through your hosting control panel.</p>
</div>";

// =====================================================================
// SECTION 2: DIRECTORY PERMISSIONS
// =====================================================================
echo "<div class='section'>
    <h2>2. Directory Permissions</h2>
    <table>
        <tr>
            <th>Directory</th>
            <th>Exists</th>
            <th>Writable</th>
            <th>Permissions</th>
            <th>Owner:Group</th>
            <th>Action</th>
        </tr>";

// Important directories for Laravel and file uploads
$directories = [
    __DIR__ . '/uploads',
    __DIR__ . '/../storage/app/public',
    __DIR__ . '/../storage/app/public/uploads',
    __DIR__ . '/../storage/app/google_drive_fallback',
    __DIR__ . '/../storage/logs',
    __DIR__ . '/../bootstrap/cache'
];

foreach ($directories as $directory) {
    $result = checkDirectoryPermissions($directory);
    displayDirectoryCheck($result);
}

// Check the temp directory
$tempDir = ini_get('upload_tmp_dir') ?: sys_get_temp_dir();
$result = checkDirectoryPermissions($tempDir);
echo "<tr>
        <td>{$result['path']} <small>(Temporary upload directory)</small></td>
        <td class='" . ($result['exists'] ? 'success' : 'error') . "'>" . ($result['exists'] ? 'Yes' : 'No') . "</td>
        <td class='" . ($result['writable'] ? 'success' : 'error') . "'>" . ($result['writable'] ? 'Yes' : 'No') . "</td>
        <td>{$result['perms']}</td>
        <td>" . (!empty($result['owner']) ? "{$result['owner']}:{$result['group']}" : 'N/A') . "</td>
        <td>" . ($result['exists'] && $result['writable'] ? '<span class="success">OK</span>' : '<span class="error">Cannot fix - check server config</span>') . "</td>
      </tr>";

echo "</table>
</div>";

// =====================================================================
// SECTION 3: SYMLINKS CHECK
// =====================================================================
echo "<div class='section'>
    <h2>3. Storage Symlinks Check</h2>";

$publicStoragePath = __DIR__ . '/storage';
$targetPath = realpath(__DIR__ . '/../storage/app/public');

if (is_link($publicStoragePath)) {
    $currentTarget = readlink($publicStoragePath);
    echo "<p>Storage symlink exists: <span class='success'>Yes</span></p>";
    echo "<p>Current target: {$currentTarget}</p>";
    echo "<p>Expected target: {$targetPath}</p>";
    
    if ($currentTarget === $targetPath) {
        echo "<p>Status: <span class='success'>Valid symlink</span></p>";
    } else {
        echo "<p>Status: <span class='warning'>Target mismatch</span></p>";
        echo "<p>Action: <a href='?action=recreate_symlink' class='button fix-btn'>Recreate Symlink</a></p>";
    }
} else {
    echo "<p>Storage symlink exists: <span class='error'>No</span></p>";
    echo "<p>Action: <a href='?action=create_symlink' class='button fix-btn'>Create Symlink</a></p>";
}

if (isset($_GET['action']) && ($_GET['action'] === 'create_symlink' || $_GET['action'] === 'recreate_symlink')) {
    // Remove existing symlink if needed
    if ($_GET['action'] === 'recreate_symlink' && is_link($publicStoragePath)) {
        unlink($publicStoragePath);
    }
    
    if (!file_exists($publicStoragePath)) {
        if (symlink($targetPath, $publicStoragePath)) {
            echo "<p><span class='success'>Successfully created symlink</span></p>";
        } else {
            echo "<p><span class='error'>Failed to create symlink. You may need to run 'php artisan storage:link' from command line.</span></p>";
        }
    }
}

echo "</div>";

// =====================================================================
// SECTION 4: FILE UPLOAD TEST
// =====================================================================
echo "<div class='section'>
    <h2>4. File Upload Test</h2>
    <form action='' method='post' enctype='multipart/form-data'>
        <input type='hidden' name='action' value='test_upload'>
        <p>
            <label for='test_file'>Select a file:</label><br>
            <input type='file' name='test_file' id='test_file'>
        </p>
        <p>
            <label for='upload_destination'>Upload destination:</label><br>
            <select name='upload_destination' id='upload_destination'>
                <option value='public_uploads'>public/uploads (Direct PHP)</option>
                <option value='storage_public'>storage/app/public (Laravel Storage)</option>
                <option value='fallback_storage'>google_drive_fallback (Backup Storage)</option>
            </select>
        </p>
        <button type='submit'>Test Upload</button>
    </form>";

// Process test upload if submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'test_upload') {
    echo "<h3>Upload Results</h3>";
    
    if (isset($_FILES['test_file']) && $_FILES['test_file']['error'] === UPLOAD_ERR_OK) {
        $uploadedFile = $_FILES['test_file'];
        $tmpName = $uploadedFile['tmp_name'];
        $name = $uploadedFile['name'];
        $size = $uploadedFile['size'];
        $type = $uploadedFile['type'];
        
        echo "<p>File received: <span class='success'>{$name}</span> ({$type}, " . number_format($size) . " bytes)</p>";
        echo "<p>Temporary location: {$tmpName}</p>";
        
        // Determine destination based on selection
        $destination = '';
        switch ($_POST['upload_destination']) {
            case 'public_uploads':
                $uploadDir = __DIR__ . '/uploads';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $destination = $uploadDir . '/' . time() . '_' . $name;
                break;
                
            case 'storage_public':
                $uploadDir = __DIR__ . '/../storage/app/public/uploads';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $destination = $uploadDir . '/' . time() . '_' . $name;
                break;
                
            case 'fallback_storage':
                $uploadDir = __DIR__ . '/../storage/app/google_drive_fallback';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $destination = $uploadDir . '/' . time() . '_' . $name;
                break;
        }
        
        // Try to move the file
        if (move_uploaded_file($tmpName, $destination)) {
            echo "<p><span class='success'>File successfully moved to: {$destination}</span></p>";
            
            // Show the file if it's an image
            if (strpos($type, 'image/') === 0) {
                $webPath = '';
                
                if ($_POST['upload_destination'] === 'public_uploads') {
                    $webPath = 'uploads/' . basename($destination);
                } else if ($_POST['upload_destination'] === 'storage_public') {
                    $webPath = 'storage/uploads/' . basename($destination);
                }
                
                if ($webPath) {
                    echo "<p><img src='{$webPath}' alt='Uploaded image' style='max-width: 300px; max-height: 300px;'></p>";
                }
            }
        } else {
            echo "<p><span class='error'>Failed to move uploaded file!</span></p>";
            
            // Get detailed error
            $error = error_get_last();
            if ($error) {
                echo "<p><span class='error'>Error: {$error['message']}</span></p>";
            }
            
            // Check directory permissions
            $destDir = dirname($destination);
            $permCheck = checkDirectoryPermissions($destDir);
            
            echo "<p>Destination directory check:</p>";
            echo "<ul>";
            echo "<li>Path: {$destDir}</li>";
            echo "<li>Exists: " . ($permCheck['exists'] ? 'Yes' : 'No') . "</li>";
            echo "<li>Writable: " . ($permCheck['writable'] ? 'Yes' : 'No') . "</li>";
            echo "<li>Permissions: {$permCheck['perms']}</li>";
            echo "</ul>";
        }
    } else {
        echo "<p><span class='error'>Upload failed!</span></p>";
        
        if (isset($_FILES['test_file'])) {
            $errorCode = $_FILES['test_file']['error'];
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form',
                UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
            ];
            
            $errorMessage = $errorMessages[$errorCode] ?? "Unknown error code: {$errorCode}";
            echo "<p><span class='error'>Error: {$errorMessage}</span></p>";
            
            // Additional guidance for specific errors
            if ($errorCode === UPLOAD_ERR_INI_SIZE) {
                echo "<p><span class='info'>Your file exceeds the limit of " . ini_get('upload_max_filesize') . 
                     ". You need to change this in php.ini or .user.ini.</span></p>";
            } else if ($errorCode === UPLOAD_ERR_NO_TMP_DIR) {
                echo "<p><span class='info'>Temporary directory is missing or not writable. Check the value of 'upload_tmp_dir' in PHP settings.</span></p>";
            }
        } else {
            echo "<p><span class='error'>No file data received in \$_FILES array.</span></p>";
            echo "<p><span class='info'>This might indicate a configuration issue with PHP or your server.</span></p>";
        }
        
        echo "<pre>POST data: " . print_r($_POST, true) . "</pre>";
        echo "<pre>FILES data: " . print_r($_FILES, true) . "</pre>";
    }
}

echo "</div>";

// =====================================================================
// SECTION 5: FALLBACK UPLOAD FORM
// =====================================================================
echo "<div class='section'>
    <h2>5. Emergency File Upload Form</h2>
    <p>If all else fails, you can use this ultra-basic upload form to save files to the server.</p>
    <p>This form uses direct PHP file handling with zero dependencies on Laravel or any framework.</p>
    
    <form action='direct_upload_handler.php' method='post' enctype='multipart/form-data'>
        <p>
            <label for='emergency_file'>Select file:</label><br>
            <input type='file' name='emergency_file' id='emergency_file'>
        </p>
        <p>
            <label for='save_location'>Save location:</label><br>
            <select name='save_location' id='save_location'>
                <option value='public_uploads'>public/uploads</option>
                <option value='storage_uploads'>storage/app/public/uploads</option>
                <option value='storage_fallback'>storage/app/google_drive_fallback</option>
            </select>
        </p>
        <button type='submit'>Upload File</button>
    </form>
</div>";

// =====================================================================
// SECTION 6: SYSTEM INFORMATION
// =====================================================================
echo "<div class='section'>
    <h2>6. System Information</h2>
    <table>
        <tr>
            <th>Setting</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>PHP Version</td>
            <td>" . phpversion() . "</td>
        </tr>
        <tr>
            <td>Server Software</td>
            <td>" . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</td>
        </tr>
        <tr>
            <td>Server API</td>
            <td>" . php_sapi_name() . "</td>
        </tr>
        <tr>
            <td>Operating System</td>
            <td>" . PHP_OS . "</td>
        </tr>
        <tr>
            <td>Web User</td>
            <td>" . get_current_user() . "</td>
        </tr>
    </table>
</div>";

// =====================================================================
// SECTION 7: LINKS AND ACTIONS
// =====================================================================
echo "<div class='section'>
    <h2>7. Related Tools</h2>
    <p>
        <a href='phpinfo.php' class='button' target='_blank'>View Full PHP Info</a>
        <a href='storage_test.php' class='button' target='_blank'>Test Storage Access</a>
        <a href='direct_upload.php' class='button' target='_blank'>Direct Upload Test</a>
        <a href='php_upload_test.php' class='button' target='_blank'>PHP Upload Test</a>
    </p>
    <p>
        <a href='emergency_task_form.php' class='button' target='_blank'>Emergency Task Form</a>
        <a href='../resources/views/direct-task-form.blade.php' class='button' target='_blank'>Laravel Task Form</a>
    </p>
</div>";

// Page footer
echo "</body></html>";
?>
