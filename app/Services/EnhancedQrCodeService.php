<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class EnhancedQrCodeService extends QrCodeService
{
    /**
     * Generate QR code using Endroid QR Code library (local generation)
     */
    public function generateSvg($data, $size = 200)
    {
        try {
            // First try local generation with Endroid
            $result = $this->generateLocalQr($data, $size);
            if ($result !== false) {
                $this->logInfo('QR code generated successfully using Endroid library');
                return $result;
            }
            
            // Fall back to parent method (external APIs)
            return parent::generateSvg($data, $size);
        } catch (\Exception $e) {
            $this->logWarning('Enhanced QR generation failed: ' . $e->getMessage());
            return parent::generateSvg($data, $size);
        }
    }
    
    private function generateLocalQr($data, $size)
    {
        try {
            $result = Builder::create()
                ->writer(new PngWriter())
                ->data($data)
                ->encoding(new Encoding('UTF-8'))
                ->errorCorrectionLevel(ErrorCorrectionLevel::Medium)
                ->size($size)
                ->margin(10)
                ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
                ->build();
            
            $base64 = base64_encode($result->getString());
            return 'data:image/png;base64,' . $base64;
            
        } catch (\Exception $e) {
            $this->logWarning('Endroid QR generation failed: ' . $e->getMessage());
            return false;
        }
    }
}
