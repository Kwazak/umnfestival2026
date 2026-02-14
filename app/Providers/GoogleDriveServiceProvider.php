<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use Masbug\Flysystem\GoogleDriveAdapter;
use Google\Client;
use Google\Service\Drive;

class GoogleDriveServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Storage::extend('google_drive', function ($app, $config) {
            $options = [];

            if (!empty($config['teamDriveId'] ?? null)) {
                $options['teamDriveId'] = $config['teamDriveId'];
            }

            if (!empty($config['sharedFolderId'] ?? null)) {
                $options['sharedFolderId'] = $config['sharedFolderId'];
            }

            try {
                $client = new Client();
                $client->setAuthConfig($config['service_account_json_location']);
                $client->addScope(Drive::DRIVE);
                $service = new Drive($client);

                // Log successful connection
                \Log::info('Google Drive connection successful, using folder ID: ' . ($config['folderId'] ?? '/'));
                
                // Add shared folder ID to options if not already set
                if (!isset($options['sharedFolderId']) && isset($config['folderId'])) {
                    $options['sharedFolderId'] = $config['folderId'];
                    \Log::info('Set sharedFolderId option to: ' . $config['folderId']);
                }
                
                // Create the adapter with more verbose logging
                // Explicitly set the root to the shared folder ID (not 'root')
                $rootFolderId = isset($config['folderId']) ? $config['folderId'] : 'root';
                $options['sharedFolderId'] = $rootFolderId;
                $options['supportsAllDrives'] = true; // Enable support for all drives (crucial for service accounts)
                
                $adapter = new GoogleDriveAdapter($service, $rootFolderId, $options);
                $driver = new Filesystem($adapter);
                
                \Log::info("GoogleDriveAdapter created with root=$rootFolderId and supportsAllDrives=true");
                
                // Test write permissions by creating a small test file
                try {
                    $testContent = 'Test file created at ' . date('Y-m-d H:i:s');
                    $testFile = 'permissions_test_' . time() . '.txt';
                    
                    // First try to get the folder capabilities to check permissions
                    try {
                        $folder = $service->files->get($config['folderId'], ['fields' => 'capabilities,name']);
                        $capabilities = $folder->getCapabilities();
                        
                        if ($capabilities) {
                            $canEdit = $capabilities->getCanEdit() ?? false;
                            $canAddChildren = $capabilities->getCanAddChildren() ?? false;
                            
                            if (!$canEdit || !$canAddChildren) {
                                \Log::warning('Google Drive permission issue: Service account does not have edit permission on folder "' . $folder->getName() . '"');
                                \Log::warning('ACTION REQUIRED: Share the folder with ' . $config['service_account_json_location'] . ' as an Editor');
                            } else {
                                \Log::info('Google Drive folder permissions check: Service account has proper edit permissions');
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Could not check folder capabilities: ' . $e->getMessage());
                    }
                    
                    // Now try the actual write test
                    $createdFile = $service->files->create(
                        new \Google\Service\Drive\DriveFile([
                            'name' => $testFile,
                            'parents' => [$config['folderId']]
                        ]),
                        [
                            'data' => $testContent,
                            'mimeType' => 'text/plain',
                            'uploadType' => 'multipart',
                            'fields' => 'id,name'
                        ]
                    );
                    
                    \Log::info('Google Drive write permission test: SUCCESS - Created file with ID: ' . $createdFile->getId());
                    
                    // Clean up the test file
                    try {
                        $service->files->delete($createdFile->getId());
                        \Log::info('Test file deleted successfully');
                    } catch (\Exception $deleteError) {
                        \Log::warning('Could not delete test file: ' . $deleteError->getMessage());
                    }
                } catch (\Exception $writeError) {
                    \Log::error('Google Drive write permission test: FAILED - ' . $writeError->getMessage());
                    \Log::warning('SOLUTION: Make sure the folder is shared with the service account email with "Editor" permissions');
                    
                    // Get the service account email from the JSON file for better error messages
                    try {
                        $serviceAccountJson = json_decode(file_get_contents($config['service_account_json_location']), true);
                        if (isset($serviceAccountJson['client_email'])) {
                            \Log::warning('Share the Google Drive folder with this email address: ' . $serviceAccountJson['client_email']);
                        }
                    } catch (\Exception $e) {
                        // Silently ignore if we can't get the email
                    }
                }

                return new \Illuminate\Filesystem\FilesystemAdapter($driver, $adapter);
            } catch (\Exception $e) {
                // Log error but don't fail completely
                \Log::error('Google Drive configuration failed: ' . $e->getMessage());
                
                // Return a fallback to local storage
                $localAdapter = new \League\Flysystem\Local\LocalFilesystemAdapter(storage_path('app/google_drive_fallback'));
                $localDriver = new Filesystem($localAdapter);
                return new \Illuminate\Filesystem\FilesystemAdapter($localDriver, $localAdapter);
            }
        });
    }
}
