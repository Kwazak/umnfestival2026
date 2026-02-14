<?php
// Direct Google Drive test script

// Include the Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the storage facade
use Illuminate\Support\Facades\Storage;

echo '<h1>Google Drive Connection Test</h1>';

// Test the connection
try {
    // Print configuration for debugging
    echo '<h2>Configuration</h2>';
    echo '<pre>';
    $config = config('filesystems.disks.google');
    
    // Sanitize the output to avoid displaying sensitive information
    $safeConfig = [];
    foreach ($config as $key => $value) {
        if (in_array($key, ['clientId', 'folderId'])) {
            $safeConfig[$key] = $value;
        } elseif ($key === 'service_account_json_location') {
            $safeConfig[$key] = $value;
            $safeConfig['file_exists'] = file_exists($value) ? 'Yes' : 'No';
            $safeConfig['file_readable'] = is_readable($value) ? 'Yes' : 'No';
            if (file_exists($value)) {
                $jsonContent = json_decode(file_get_contents($value), true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $safeConfig['json_valid'] = 'Yes';
                    $safeConfig['client_email_present'] = isset($jsonContent['client_email']) ? 'Yes' : 'No';
                    if (isset($jsonContent['client_email'])) {
                        $safeConfig['client_email'] = $jsonContent['client_email'];
                    }
                } else {
                    $safeConfig['json_valid'] = 'No - ' . json_last_error_msg();
                }
            }
        } else {
            $safeConfig[$key] = '[masked]';
        }
    }
    
    print_r($safeConfig);
    echo '</pre>';
    
    // Test getting files from Google Drive
    echo '<h2>Connection Test</h2>';
    
    $startTime = microtime(true);
    $files = Storage::disk('google')->files();
    $endTime = microtime(true);
    
    echo '<div style="color: green; font-weight: bold;">SUCCESS!</div>';
    echo '<p>Successfully connected to Google Drive and retrieved file list.</p>';
    echo '<p>Time taken: ' . round(($endTime - $startTime) * 1000, 2) . ' ms</p>';
    
    echo '<h3>Files Found (' . count($files) . ')</h3>';
    echo '<ul>';
    foreach ($files as $file) {
        echo '<li>' . htmlspecialchars($file) . '</li>';
    }
    echo '</ul>';
    
    // Test uploading a file
    echo '<h2>Upload Test</h2>';
    
    try {
        // Create a test file
        $testContent = 'This is a test file uploaded at ' . date('Y-m-d H:i:s');
        $testFileName = 'test_' . time() . '.txt';
        $testFilePath = storage_path('app/' . $testFileName);
        
        file_put_contents($testFilePath, $testContent);
        
        // Try to upload to Google Drive
        $uploaded = Storage::disk('google')->put($testFileName, file_get_contents($testFilePath));
        
        if ($uploaded) {
            echo '<div style="color: green; font-weight: bold;">File upload successful!</div>';
            echo '<p>File uploaded: ' . $testFileName . '</p>';
            
            // Try to download the file back
            $downloadedContent = Storage::disk('google')->get($testFileName);
            
            if ($downloadedContent === $testContent) {
                echo '<div style="color: green; font-weight: bold;">File download successful!</div>';
                echo '<p>Downloaded content matches the original.</p>';
            } else {
                echo '<div style="color: orange; font-weight: bold;">File download issue</div>';
                echo '<p>Downloaded content does not match the original.</p>';
            }
        } else {
            echo '<div style="color: red; font-weight: bold;">File upload failed</div>';
        }
        
        // Clean up
        @unlink($testFilePath);
        if (Storage::disk('google')->exists($testFileName)) {
            Storage::disk('google')->delete($testFileName);
            echo '<p>Test file deleted from Google Drive.</p>';
        }
        
    } catch (Exception $e) {
        echo '<div style="color: red; font-weight: bold;">Upload test error: ' . htmlspecialchars($e->getMessage()) . '</div>';
    }
    
} catch (Exception $e) {
    echo '<div style="color: red; font-weight: bold;">ERROR!</div>';
    echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
    
    echo '<h3>Stack Trace</h3>';
    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
    
    // Provide guidance
    echo '<h3>Troubleshooting Guide</h3>';
    echo '<ul>';
    echo '<li>Make sure the service account JSON file exists at the configured path</li>';
    echo '<li>Ensure the Google Drive API is enabled in your Google Cloud Console</li>';
    echo '<li>Verify that you have shared the Google Drive folder with the service account email</li>';
    echo '<li>Check if the folder ID in your .env file is correct</li>';
    echo '</ul>';
}
?>
