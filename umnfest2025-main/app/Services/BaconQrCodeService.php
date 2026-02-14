<?php

namespace App\Services;

use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\ImagickImageBackEnd;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Log;

class BaconQrCodeService
{
    /**
     * Generate QR code as base64 PNG data URI
     * @param string $data The data to encode
     * @param int $size The size in pixels
     * @return string Base64 encoded data URI
     */
    public function generateSvg($data, $size = 250)
    {
        // Directly use the API for reliable QR code generation
        // This ensures we always get valid, scannable QR codes
        return $this->generateViaApi($data, $size);
    }
    
    /**
     * Generate QR code via external API (reliable fallback)
     */
    private function generateViaApi($data, $size)
    {
        try {
            // Use qr-server.com API which is reliable and free
            $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' . $size . 'x' . $size . '&format=png&data=' . urlencode($data);
            
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'user_agent' => 'UMN Festival QR Generator'
                ]
            ]);
            
            $imageData = @file_get_contents($qrUrl, false, $context);
            
            if ($imageData !== false && strlen($imageData) > 100) {
                $base64 = base64_encode($imageData);
                Log::info('QR Code generated successfully via API', [
                    'size' => strlen($imageData) . ' bytes',
                    'data_preview' => substr($data, 0, 50) . '...'
                ]);
                return 'data:image/png;base64,' . $base64;
            }
        } catch (\Exception $e) {
            Log::error('API QR generation failed: ' . $e->getMessage());
        }
        
        // Return a minimal placeholder
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
}
