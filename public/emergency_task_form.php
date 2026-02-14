<?php
// Include Laravel bootstrap
require __DIR__.'/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/..');
$dotenv->safeLoad();

// Set PHP configuration for uploads
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '40M');
ini_set('max_file_uploads', 20);

// Connect to database (using Laravel's DB connection would be better, but this is for testing)
try {
    $db_connection = $_ENV['DB_CONNECTION'] ?? 'mysql';
    $db_host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db_port = $_ENV['DB_PORT'] ?? '3306';
    $db_database = $_ENV['DB_DATABASE'] ?? 'umnfest';
    $db_username = $_ENV['DB_USERNAME'] ?? 'root';
    $db_password = $_ENV['DB_PASSWORD'] ?? '';
    
    $pdo = new PDO(
        "{$db_connection}:host={$db_host};port={$db_port};dbname={$db_database}", 
        $db_username, 
        $db_password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db_connected = true;
} catch (PDOException $e) {
    $db_error = $e->getMessage();
    $db_connected = false;
}

// Process form submission
$success = false;
$error = null;
$uploaded_files = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check if database is connected
        if (!$db_connected) {
            throw new Exception("Database connection failed: " . $db_error);
        }
        
        // Validate basic fields
        $required_fields = ['judul', 'deskripsi', 'target_divisi', 'jadwal_deadline'];
        foreach ($required_fields as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("Field {$field} is required");
            }
        }
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Insert task
        $sql = "INSERT INTO tasks (judul, deskripsi, link_google_form, target_divisi, jadwal_deadline, 
                caption_konten, hashtags_konten, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $_POST['judul'],
            $_POST['deskripsi'],
            $_POST['link_google_form'] ?? null,
            json_encode($_POST['target_divisi'] ?? []),
            $_POST['jadwal_deadline'],
            $_POST['caption_konten'] ?? null,
            $_POST['hashtags_konten'] ?? null
        ]);
        
        $task_id = $pdo->lastInsertId();
        
        // Process file uploads
        if (isset($_FILES['media_files']) && !empty($_FILES['media_files']['name'][0])) {
            // Create upload directories if they don't exist
            $upload_dir = __DIR__ . '/../storage/app/public/uploads';
            $fallback_dir = __DIR__ . '/../storage/app/google_drive_fallback';
            
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            if (!is_dir($fallback_dir)) {
                mkdir($fallback_dir, 0755, true);
            }
            
            // Process each file
            for ($i = 0; $i < count($_FILES['media_files']['name']); $i++) {
                if ($_FILES['media_files']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmp_name = $_FILES['media_files']['tmp_name'][$i];
                    $name = $_FILES['media_files']['name'][$i];
                    $type = $_FILES['media_files']['type'][$i];
                    $size = $_FILES['media_files']['size'][$i];
                    
                    // Generate safe filename
                    $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $name);
                    $local_path = 'uploads/' . $filename;
                    $full_path = $upload_dir . '/' . $filename;
                    $fallback_path = $fallback_dir . '/' . $filename;
                    
                    // Move the uploaded file
                    if (move_uploaded_file($tmp_name, $full_path)) {
                        // Copy to fallback directory
                        copy($full_path, $fallback_path);
                        
                        // Insert record into media_files table
                        $sql = "INSERT INTO media_files (task_id, google_drive_id, file_name, original_name, 
                                mime_type, file_size, local_path, created_at, updated_at) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                                
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute([
                            $task_id,
                            'local_' . uniqid(),
                            $name,
                            $name,
                            $type,
                            $size,
                            $local_path
                        ]);
                        
                        $uploaded_files[] = [
                            'name' => $name,
                            'path' => $local_path,
                            'size' => $size,
                            'type' => $type
                        ];
                    } else {
                        throw new Exception("Failed to move uploaded file: " . $name);
                    }
                } else {
                    $error_code = $_FILES['media_files']['error'][$i];
                    $error_messages = [
                        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the upload',
                    ];
                    
                    throw new Exception("File upload failed: " . 
                        ($error_messages[$error_code] ?? "Unknown error ($error_code)") . 
                        " - File: " . $_FILES['media_files']['name'][$i]);
                }
            }
        }
        
        // Commit transaction
        $pdo->commit();
        $success = true;
        
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error = $e->getMessage();
    }
}

// HTML output
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Emergency Task Creation</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        h1 { color: #333; }
        form { 
            background: #f9f9f9; 
            border: 1px solid #ddd; 
            padding: 20px; 
            margin-bottom: 20px; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold; 
        }
        input[type="text"], 
        input[type="url"], 
        input[type="datetime-local"], 
        textarea, 
        select { 
            width: 100%; 
            padding: 8px; 
            margin-bottom: 15px; 
            border: 1px solid #ccc; 
            box-sizing: border-box; 
        }
        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
        }
        .checkbox-item input {
            margin-right: 5px;
        }
        button { 
            background: #4a5568; 
            color: white; 
            padding: 10px 15px; 
            border: none; 
            cursor: pointer; 
        }
        button:hover { 
            background: #2d3748; 
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            margin-bottom: 20px; 
            border: 1px solid #c3e6cb; 
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 15px; 
            margin-bottom: 20px; 
            border: 1px solid #f5c6cb; 
        }
        .uploaded-files {
            background: #e2e8f0;
            padding: 15px;
            margin-top: 15px;
        }
        .uploaded-file {
            background: white;
            padding: 10px;
            margin-bottom: 5px;
            border: 1px solid #cbd5e0;
        }
    </style>
</head>
<body>
    <h1>Emergency Task Creation Form</h1>
    
    <p>This is a direct PHP implementation to bypass any framework issues.</p>
    
    <?php if ($success): ?>
    <div class="success">
        <h2>Task Created Successfully!</h2>
        <p>Task ID: <?= htmlspecialchars($task_id) ?></p>
        
        <?php if (count($uploaded_files) > 0): ?>
        <div class="uploaded-files">
            <h3>Uploaded Files:</h3>
            <?php foreach($uploaded_files as $file): ?>
            <div class="uploaded-file">
                <p><strong>Name:</strong> <?= htmlspecialchars($file['name']) ?></p>
                <p><strong>Size:</strong> <?= number_format($file['size'] / 1024, 2) ?> KB</p>
                <p><strong>Type:</strong> <?= htmlspecialchars($file['type']) ?></p>
            </div>
            <?php endforeach; ?>
        </div>
        <?php else: ?>
        <p>No files were uploaded with this task.</p>
        <?php endif; ?>
        
        <p><a href="/admin/dashboard">Return to Dashboard</a></p>
    </div>
    <?php endif; ?>
    
    <?php if ($error): ?>
    <div class="error">
        <h2>Error</h2>
        <p><?= htmlspecialchars($error) ?></p>
    </div>
    <?php endif; ?>
    
    <?php if (!$success): ?>
    <form method="post" enctype="multipart/form-data">
        <div>
            <label for="judul">Task Title:</label>
            <input type="text" id="judul" name="judul" required>
        </div>
        
        <div>
            <label for="deskripsi">Description:</label>
            <textarea id="deskripsi" name="deskripsi" rows="4" required></textarea>
        </div>
        
        <div>
            <label for="link_google_form">Google Form Link (optional):</label>
            <input type="url" id="link_google_form" name="link_google_form">
        </div>
        
        <div>
            <label>Target Division:</label>
            <div class="checkbox-group">
                <?php
                $divisions = [
                    'All Divisions', 'Acara', 'Dekorasi', 'Dokumentasi', 'Humas',
                    'Keamanan', 'Konsumsi', 'Perlengkapan', 'Publikasi', 'Registrasi',
                    'Sekretaris', 'Sponsorship', 'Transportasi', 'Bendahara', 'Koordinator', 'Presenter'
                ];
                foreach ($divisions as $division):
                ?>
                <div class="checkbox-item">
                    <input type="checkbox" id="div_<?= strtolower(str_replace(' ', '_', $division)) ?>" 
                           name="target_divisi[]" value="<?= $division ?>">
                    <label for="div_<?= strtolower(str_replace(' ', '_', $division)) ?>"><?= $division ?></label>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div>
            <label for="jadwal_deadline">Deadline:</label>
            <input type="datetime-local" id="jadwal_deadline" name="jadwal_deadline" required>
        </div>
        
        <div>
            <label for="caption_konten">Content Caption (optional):</label>
            <textarea id="caption_konten" name="caption_konten" rows="3"></textarea>
        </div>
        
        <div>
            <label for="hashtags_konten">Hashtags (optional):</label>
            <textarea id="hashtags_konten" name="hashtags_konten" rows="2" placeholder="#hashtag1 #hashtag2"></textarea>
        </div>
        
        <div>
            <label for="media_files">Attach Files:</label>
            <input type="file" id="media_files" name="media_files[]" multiple>
            <p><small>You can select multiple files (images, videos, documents)</small></p>
        </div>
        
        <div>
            <button type="submit">Create Task</button>
        </div>
    </form>
    <?php endif; ?>
    
    <h2>PHP Configuration</h2>
    <pre>
upload_max_filesize: <?= ini_get('upload_max_filesize') ?>

post_max_size: <?= ini_get('post_max_size') ?>

max_file_uploads: <?= ini_get('max_file_uploads') ?>

memory_limit: <?= ini_get('memory_limit') ?>

PHP version: <?= phpversion() ?>

Database connected: <?= $db_connected ? 'Yes' : 'No' ?>
<?php if (!$db_connected): ?>
Database error: <?= htmlspecialchars($db_error) ?>
<?php endif; ?>
    </pre>
    
    <p>
        <a href="php_upload_test.php">Try Basic PHP Upload Test</a> | 
        <a href="direct_upload.php">Try Direct Upload</a> | 
        <a href="/admin/dashboard">Return to Dashboard</a>
    </p>
</body>
</html>
