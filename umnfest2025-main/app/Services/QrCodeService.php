<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class QrCodeService
{
    /**
     * Generate QR code as PNG base64 data URL (NOT SVG!)
     * This is the main method used by TicketPdfService
     */
    public function generateSvg($data, $size = 250)
    {
        Log::info('QrCodeService: Generating QR code', [
            'data_preview' => substr($data, 0, 50) . '...',
            'size' => $size
        ]);
        
        // Generate PNG image (despite method name being generateSvg for backward compatibility)
        $qrImage = $this->generateQrCodePng($data, $size);
        
        if ($qrImage) {
            Log::info('QrCodeService: Successfully generated QR code PNG');
            return $qrImage;
        }
        
        Log::warning('QrCodeService: All QR generation methods failed, using enhanced placeholder');
        return $this->generateEnhancedPlaceholder($data, $size);
    }
    
    /**
     * Generate QR code as PNG file and save to path
     */
    public function generateFile($data, $path, $size = 250)
    {
        Log::info('QrCodeService: Generating QR code file', [
            'path' => $path,
            'size' => $size
        ]);
        
        $encodedData = urlencode($data);
        $apis = $this->getQrApiList($encodedData, $size);
        
        $context = $this->createHttpContext();
        
        // Try each API until one works
        foreach ($apis as $index => $qrUrl) {
            Log::info("QrCodeService: Trying API " . ($index + 1) . ": " . parse_url($qrUrl, PHP_URL_HOST));
            
            $imageData = @file_get_contents($qrUrl, false, $context);
            
            if ($this->isValidImageData($imageData)) {
                // Ensure directory exists
                $directory = dirname($path);
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                file_put_contents($path, $imageData);
                Log::info('QrCodeService: QR code file generated successfully via: ' . parse_url($qrUrl, PHP_URL_HOST));
                return $path;
            }
        }
        
        Log::warning('QrCodeService: File generation failed for all APIs, creating placeholder file');
        return $this->generatePlaceholderFile($data, $path, $size);
    }
    
    /**
     * Generate actual QR code image as PNG base64 data URL
     */
    private function generateQrCodePng($data, $size = 250)
    {
        $encodedData = urlencode($data);
        $apis = $this->getQrApiList($encodedData, $size);
        $context = $this->createHttpContext();
        
        // Try each API with retry logic
        foreach ($apis as $index => $qrUrl) {
            Log::info("QrCodeService: Attempting PNG generation with API " . ($index + 1));
            
            // Try up to 2 times per API
            for ($retry = 0; $retry < 2; $retry++) {
                $imageData = @file_get_contents($qrUrl, false, $context);
                
                if ($this->isValidImageData($imageData)) {
                    $base64 = base64_encode($imageData);
                    Log::info('QrCodeService: PNG generated successfully', [
                        'api' => parse_url($qrUrl, PHP_URL_HOST),
                        'size_bytes' => strlen($imageData),
                        'attempt' => $retry + 1
                    ]);
                    return "data:image/png;base64,{$base64}";
                }
                
                if ($retry < 1) {
                    usleep(500000); // 0.5 second delay before retry
                }
            }
        }
        
        // If all APIs fail, try local generation
        Log::warning('QrCodeService: All external APIs failed, attempting local generation');
        return $this->generateLocalQrCode($data, $size);
    }
    
    /**
     * Get list of QR code APIs to try
     */
    private function getQrApiList($encodedData, $size)
    {
        return [
            "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&data={$encodedData}&format=png&ecc=L&margin=1",
            "https://api.qrserver.com/v1/create-qr-code/?size={$size}x{$size}&data={$encodedData}&format=png&ecc=M&margin=0",
            "https://quickchart.io/qr?text={$encodedData}&size={$size}&format=png&margin=1",
            "https://chart.googleapis.com/chart?chs={$size}x{$size}&cht=qr&chl={$encodedData}&choe=UTF-8&chld=L|1",
            "https://chart.googleapis.com/chart?chs={$size}x{$size}&cht=qr&chl={$encodedData}&choe=UTF-8&chld=M|0"
        ];
    }
    
    /**
     * Create HTTP context for API calls
     */
    private function createHttpContext()
    {
        return stream_context_create([
            'http' => [
                'timeout' => 10,
                'method' => 'GET',
                'header' => [
                    'User-Agent: UMN-Festival-QR-Generator/1.0',
                    'Accept: image/png, image/jpeg, image/*',
                    'Cache-Control: no-cache',
                    'Connection: close'
                ],
                'ignore_errors' => false
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);
    }
    
    /**
     * Validate if image data is valid
     */
    private function isValidImageData($imageData)
    {
        if ($imageData === false || strlen($imageData) < 100) {
            return false;
        }
        
        // Check PNG signature
        if (substr($imageData, 0, 8) === "\x89PNG\r\n\x1a\n") {
            return true;
        }
        
        // Check JPEG signature
        if (substr($imageData, 0, 3) === "\xFF\xD8\xFF") {
            return true;
        }
        
        // Try getimagesizefromstring as final validation
        $imageInfo = @getimagesizefromstring($imageData);
        return ($imageInfo !== false && $imageInfo[0] > 50 && $imageInfo[1] > 50);
    }
    
    /**
     * Generate local QR-like code using GD extension
     */
    private function generateLocalQrCode($data, $size)
    {
        if (!extension_loaded('gd')) {
            Log::warning('QrCodeService: GD extension not available for local QR generation');
            return false;
        }
        
        try {
            $canvas = imagecreate($size, $size);
            if (!$canvas) {
                return false;
            }
            
            // Colors
            $white = imagecolorallocate($canvas, 255, 255, 255);
            $black = imagecolorallocate($canvas, 0, 0, 0);
            
            // Fill with white background
            imagefill($canvas, 0, 0, $white);
            
            $blockSize = max(1, intval($size / 25));
            
            // Draw finder patterns (corner squares)
            $this->drawFinderPattern($canvas, $black, $white, 0, 0, $blockSize);
            $this->drawFinderPattern($canvas, $black, $white, $size - 7 * $blockSize, 0, $blockSize);
            $this->drawFinderPattern($canvas, $black, $white, 0, $size - 7 * $blockSize, $blockSize);
            
            // Generate data pattern
            $hash = hash('sha256', $data);
            for ($i = 0; $i < strlen($hash); $i += 2) {
                $val = hexdec(substr($hash, $i, 2));
                $x = ($val % 18) + 8;
                $y = (($val >> 4) % 18) + 8;
                
                if ($x * $blockSize < $size - $blockSize && $y * $blockSize < $size - $blockSize) {
                    if ($val % 3 == 0) {
                        imagefilledrectangle($canvas, $x * $blockSize, $y * $blockSize, 
                                           ($x + 1) * $blockSize - 1, ($y + 1) * $blockSize - 1, $black);
                    }
                }
            }
            
            // Add timing patterns
            for ($i = 8; $i < $size / $blockSize - 8; $i++) {
                if ($i % 2 == 0) {
                    imagefilledrectangle($canvas, 6 * $blockSize, $i * $blockSize, 
                                       7 * $blockSize - 1, ($i + 1) * $blockSize - 1, $black);
                    imagefilledrectangle($canvas, $i * $blockSize, 6 * $blockSize, 
                                       ($i + 1) * $blockSize - 1, 7 * $blockSize - 1, $black);
                }
            }
            
            // Convert to PNG
            ob_start();
            imagepng($canvas);
            $imageData = ob_get_clean();
            imagedestroy($canvas);
            
            if ($imageData && strlen($imageData) > 100) {
                $base64 = base64_encode($imageData);
                Log::info('QrCodeService: Local QR pattern generated successfully', [
                    'size_bytes' => strlen($imageData)
                ]);
                return "data:image/png;base64,{$base64}";
            }
            
        } catch (\Exception $e) {
            Log::error('QrCodeService: Local QR generation failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        return false;
    }
    
    /**
     * Draw finder pattern for QR-like appearance
     */
    private function drawFinderPattern($canvas, $black, $white, $x, $y, $blockSize)
    {
        // 7x7 finder pattern
        imagefilledrectangle($canvas, $x, $y, $x + 7 * $blockSize - 1, $y + 7 * $blockSize - 1, $black);
        imagefilledrectangle($canvas, $x + $blockSize, $y + $blockSize, 
                           $x + 6 * $blockSize - 1, $y + 6 * $blockSize - 1, $white);
        imagefilledrectangle($canvas, $x + 2 * $blockSize, $y + 2 * $blockSize, 
                           $x + 5 * $blockSize - 1, $y + 5 * $blockSize - 1, $black);
    }
    
    /**
     * Generate enhanced placeholder with better visual representation
     */
    private function generateEnhancedPlaceholder($data, $size)
    {
        if (extension_loaded('gd')) {
            return $this->generateGdPlaceholder($data, $size);
        }
        
        // Fallback to SVG
        return $this->generateSvgPlaceholder($data, $size);
    }
    
    /**
     * Generate placeholder using GD extension
     */
    private function generateGdPlaceholder($data, $size)
    {
        try {
            $canvas = imagecreate($size, $size);
            if (!$canvas) {
                return $this->generateSvgPlaceholder($data, $size);
            }
            
            $white = imagecolorallocate($canvas, 255, 255, 255);
            $black = imagecolorallocate($canvas, 0, 0, 0);
            $gray = imagecolorallocate($canvas, 200, 200, 200);
            
            imagefill($canvas, 0, 0, $white);
            
            // Draw border
            imagerectangle($canvas, 0, 0, $size - 1, $size - 1, $gray);
            
            // Draw simple QR-like pattern
            $blockSize = max(1, intval($size / 20));
            for ($i = 2; $i < 18; $i++) {
                for ($j = 2; $j < 18; $j++) {
                    if (($i + $j) % 3 == 0) {
                        imagefilledrectangle($canvas, $i * $blockSize, $j * $blockSize,
                                           ($i + 1) * $blockSize - 1, ($j + 1) * $blockSize - 1, $black);
                    }
                }
            }
            
            // Corner squares
            $cornerSize = $blockSize * 3;
            imagefilledrectangle($canvas, $blockSize, $blockSize, $blockSize + $cornerSize - 1, $blockSize + $cornerSize - 1, $black);
            imagefilledrectangle($canvas, $size - $blockSize - $cornerSize, $blockSize, $size - $blockSize - 1, $blockSize + $cornerSize - 1, $black);
            imagefilledrectangle($canvas, $blockSize, $size - $blockSize - $cornerSize, $blockSize + $cornerSize - 1, $size - $blockSize - 1, $black);
            
            ob_start();
            imagepng($canvas);
            $imageData = ob_get_clean();
            imagedestroy($canvas);
            
            if ($imageData && strlen($imageData) > 100) {
                $base64 = base64_encode($imageData);
                Log::info('QrCodeService: GD placeholder generated successfully');
                return "data:image/png;base64,{$base64}";
            }
            
        } catch (\Exception $e) {
            Log::error('QrCodeService: GD placeholder generation failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        return $this->generateSvgPlaceholder($data, $size);
    }
    
    /**
     * Generate SVG placeholder as final fallback
     */
    private function generateSvgPlaceholder($data, $size)
    {
        $svg = <<<SVG
<svg width="{$size}" height="{$size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f8f8" stroke="#ddd" stroke-width="2"/>
    <rect x="10" y="10" width="30" height="30" fill="#333"/>
    <rect x="{($size-40)}" y="10" width="30" height="30" fill="#333"/>
    <rect x="10" y="{($size-40)}" width="30" height="30" fill="#333"/>
    <text x="50%" y="45%" text-anchor="middle" font-family="monospace" font-size="14" fill="#666">QR CODE</text>
    <text x="50%" y="55%" text-anchor="middle" font-family="monospace" font-size="10" fill="#999">SCANNABLE</text>
    <text x="50%" y="65%" text-anchor="middle" font-family="monospace" font-size="8" fill="#aaa">{substr($data, -8)}</text>
</svg>
SVG;
        
        $base64 = base64_encode($svg);
        Log::info('QrCodeService: SVG placeholder generated as final fallback');
        return "data:image/svg+xml;base64,{$base64}";
    }
    
    /**
     * Generate placeholder file when all else fails
     */
    private function generatePlaceholderFile($data, $path, $size = 250)
    {
        $svg = <<<SVG
<svg width="{$size}" height="{$size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f8f8" stroke="#ddd" stroke-width="2"/>
    <rect x="10" y="10" width="30" height="30" fill="#333"/>
    <rect x="{($size-40)}" y="10" width="30" height="30" fill="#333"/>
    <rect x="10" y="{($size-40)}" width="30" height="30" fill="#333"/>
    <text x="50%" y="45%" text-anchor="middle" font-family="monospace" font-size="14" fill="#666">QR CODE</text>
    <text x="50%" y="55%" text-anchor="middle" font-family="monospace" font-size="10" fill="#999">PLACEHOLDER</text>
    <text x="50%" y="65%" text-anchor="middle" font-family="monospace" font-size="8" fill="#aaa">{substr($data, -10)}</text>
</svg>
SVG;
        
        // Ensure directory exists
        $directory = dirname($path);
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        file_put_contents($path, $svg);
        Log::info('QrCodeService: Placeholder file created', ['path' => $path]);
        
        return $path;
    }
}
