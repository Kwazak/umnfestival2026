<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Log;

class SimpleQrCodeService
{
    /**
     * Generate QR code as base64 PNG data URI
     * @param string $data The data to encode
     * @param int $size The size in pixels
     * @return string Base64 encoded PNG data URI
     */
    public function generateQr($data, $size = 250)
    {
        try {
            // Generate QR code as PNG
            $qrCode = QrCode::format('png')
                ->size($size)
                ->margin(2)
                ->errorCorrection('M')
                ->generate($data);
            
            // Convert to base64 data URI
            $base64 = base64_encode($qrCode);
            $dataUri = 'data:image/png;base64,' . $base64;
            
            Log::info('QR code generated successfully', [
                'data_length' => strlen($data),
                'image_size' => strlen($qrCode),
                'size' => $size
            ]);
            
            return $dataUri;
        } catch (\Exception $e) {
            Log::error('QR code generation failed', [
                'error' => $e->getMessage(),
                'data' => substr($data, 0, 100) . '...'
            ]);
            
            // Return a placeholder if generation fails
            return $this->getPlaceholder();
        }
    }
    
    /**
     * Generate SVG QR code (for compatibility)
     * @param string $data
     * @param int $size
     * @return string
     */
    public function generateSvg($data, $size = 250)
    {
        // For compatibility, we convert to PNG data URI
        return $this->generateQr($data, $size);
    }
    
    /**
     * Get placeholder image
     * @return string
     */
    private function getPlaceholder()
    {
        // Simple 1x1 transparent PNG
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
}
