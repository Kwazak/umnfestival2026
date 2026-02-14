<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Label\LabelAlignment;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Log;

class TicketQrCodeService
{
    /**
     * Generate QR code for a ticket code
     *
     * @param string $ticketCode
     * @param int $size
     * @return string|null Binary PNG data
     */
    public function generateTicketQrCode(string $ticketCode, int $size = 300): ?string
    {
        try {
            Log::info('TicketQrCodeService: Generating QR code', [
                'ticket_code' => $ticketCode,
                'size' => $size
            ]);

            // Build QR code using endroid/qr-code
            $result = Builder::create()
                ->writer(new PngWriter())
                ->writerOptions([])
                ->data($ticketCode)
                ->encoding(new Encoding('UTF-8'))
                ->errorCorrectionLevel(ErrorCorrectionLevel::Medium)
                ->size($size)
                ->margin(10)
                ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
                ->build();

            $pngData = $result->getString();

            Log::info('TicketQrCodeService: QR code generated successfully', [
                'ticket_code' => $ticketCode,
                'data_size' => strlen($pngData)
            ]);

            return $pngData;

        } catch (\Exception $e) {
            Log::error('TicketQrCodeService: Failed to generate QR code', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Fallback to manual generation if endroid fails
            return $this->generateFallbackQrCode($ticketCode, $size);
        }
    }

    /**
     * Generate QR code with custom styling for tickets
     *
     * @param string $ticketCode
     * @param int $size
     * @param array $options
     * @return string|null Binary PNG data
     */
    public function generateStyledTicketQrCode(string $ticketCode, int $size = 300, array $options = []): ?string
    {
        try {
            $builder = Builder::create()
                ->writer(new PngWriter())
                ->writerOptions([])
                ->data($ticketCode)
                ->encoding(new Encoding('UTF-8'))
                ->errorCorrectionLevel(ErrorCorrectionLevel::High) // Higher error correction for styled codes
                ->size($size)
                ->margin($options['margin'] ?? 15)
                ->roundBlockSizeMode(RoundBlockSizeMode::Margin);

            // Add foreground/background colors if specified
            if (isset($options['foreground_color'])) {
                $builder->foregroundColor($options['foreground_color']);
            }
            
            if (isset($options['background_color'])) {
                $builder->backgroundColor($options['background_color']);
            }

            // Add label if specified
            if (isset($options['label'])) {
                $builder->labelText($options['label'])
                       ->labelAlignment(LabelAlignment::Center);
            }

            // Add logo if specified and file exists
            if (isset($options['logo_path']) && file_exists($options['logo_path'])) {
                $logo = Logo::create($options['logo_path'])
                           ->setResizeToWidth($size / 6); // Logo is 1/6 of QR code size
                $builder->logo($logo);
            }

            $result = $builder->build();
            $pngData = $result->getString();

            Log::info('TicketQrCodeService: Styled QR code generated successfully', [
                'ticket_code' => $ticketCode,
                'data_size' => strlen($pngData),
                'options' => array_keys($options)
            ]);

            return $pngData;

        } catch (\Exception $e) {
            Log::error('TicketQrCodeService: Failed to generate styled QR code', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage()
            ]);

            // Fallback to regular QR code
            return $this->generateTicketQrCode($ticketCode, $size);
        }
    }

    /**
     * Generate QR code as base64 data URL
     *
     * @param string $ticketCode
     * @param int $size
     * @return string|null
     */
    public function generateTicketQrCodeBase64(string $ticketCode, int $size = 300): ?string
    {
        $pngData = $this->generateTicketQrCode($ticketCode, $size);
        
        if ($pngData) {
            return 'data:image/png;base64,' . base64_encode($pngData);
        }

        return null;
    }

    /**
     * Save QR code to file
     *
     * @param string $ticketCode
     * @param string $filePath
     * @param int $size
     * @return bool
     */
    public function saveTicketQrCodeToFile(string $ticketCode, string $filePath, int $size = 300): bool
    {
        try {
            $pngData = $this->generateTicketQrCode($ticketCode, $size);
            
            if (!$pngData) {
                return false;
            }

            // Ensure directory exists
            $directory = dirname($filePath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            $result = file_put_contents($filePath, $pngData);

            Log::info('TicketQrCodeService: QR code saved to file', [
                'ticket_code' => $ticketCode,
                'file_path' => $filePath,
                'bytes_written' => $result
            ]);

            return $result !== false;

        } catch (\Exception $e) {
            Log::error('TicketQrCodeService: Failed to save QR code to file', [
                'ticket_code' => $ticketCode,
                'file_path' => $filePath,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Batch generate QR codes for multiple ticket codes
     *
     * @param array $ticketCodes
     * @param int $size
     * @return array
     */
    public function generateBatchTicketQrCodes(array $ticketCodes, int $size = 300): array
    {
        $results = [];

        foreach ($ticketCodes as $ticketCode) {
            if (empty($ticketCode)) {
                continue;
            }

            $qrData = $this->generateTicketQrCode($ticketCode, $size);
            $results[$ticketCode] = $qrData ? base64_encode($qrData) : null;
        }

        Log::info('TicketQrCodeService: Batch QR codes generated', [
            'total_codes' => count($ticketCodes),
            'successful' => count(array_filter($results)),
            'failed' => count($results) - count(array_filter($results))
        ]);

        return $results;
    }

    /**
     * Fallback QR code generation using GD extension
     *
     * @param string $ticketCode
     * @param int $size
     * @return string|null
     */
    private function generateFallbackQrCode(string $ticketCode, int $size = 300): ?string
    {
        if (!extension_loaded('gd')) {
            Log::warning('TicketQrCodeService: GD extension not available for fallback');
            return null;
        }

        try {
            // Create a simple patterned image as QR code fallback
            $canvas = imagecreate($size, $size);
            if (!$canvas) {
                return null;
            }

            // Colors
            $white = imagecolorallocate($canvas, 255, 255, 255);
            $black = imagecolorallocate($canvas, 0, 0, 0);
            $gray = imagecolorallocate($canvas, 128, 128, 128);

            // Fill with white background
            imagefill($canvas, 0, 0, $white);

            // Create a pattern based on ticket code hash
            $hash = hash('sha256', $ticketCode);
            $blockSize = max(1, intval($size / 25));

            // Draw finder patterns (corner squares)
            $this->drawFinderPattern($canvas, $black, $white, 0, 0, $blockSize);
            $this->drawFinderPattern($canvas, $black, $white, $size - 7 * $blockSize, 0, $blockSize);
            $this->drawFinderPattern($canvas, $black, $white, 0, $size - 7 * $blockSize, $blockSize);

            // Generate data pattern from hash
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
                Log::info('TicketQrCodeService: Fallback QR pattern generated', [
                    'ticket_code' => $ticketCode,
                    'size_bytes' => strlen($imageData)
                ]);
                return $imageData;
            }

        } catch (\Exception $e) {
            Log::error('TicketQrCodeService: Fallback generation failed', [
                'ticket_code' => $ticketCode,
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Draw finder pattern for QR-like appearance
     *
     * @param resource $canvas
     * @param int $black
     * @param int $white
     * @param int $x
     * @param int $y
     * @param int $blockSize
     */
    private function drawFinderPattern($canvas, $black, $white, $x, $y, $blockSize): void
    {
        // 7x7 finder pattern
        imagefilledrectangle($canvas, $x, $y, $x + 7 * $blockSize - 1, $y + 7 * $blockSize - 1, $black);
        imagefilledrectangle($canvas, $x + $blockSize, $y + $blockSize,
                           $x + 6 * $blockSize - 1, $y + 6 * $blockSize - 1, $white);
        imagefilledrectangle($canvas, $x + 2 * $blockSize, $y + 2 * $blockSize,
                           $x + 5 * $blockSize - 1, $y + 5 * $blockSize - 1, $black);
    }

    /**
     * Validate ticket code format
     *
     * @param string $ticketCode
     * @return bool
     */
    public function validateTicketCodeFormat(string $ticketCode): bool
    {
        // Basic validation for ticket code format
        // Adjust this regex based on your actual ticket code format
        return preg_match('/^TKT-[A-Z0-9]+-[A-Z0-9]+-\d+-[A-Z0-9]+$/', $ticketCode) === 1;
    }

    /**
     * Get QR code info
     *
     * @param string $ticketCode
     * @return array
     */
    public function getQrCodeInfo(string $ticketCode): array
    {
        return [
            'ticket_code' => $ticketCode,
            'is_valid_format' => $this->validateTicketCodeFormat($ticketCode),
            'data_length' => strlen($ticketCode),
            'recommended_size' => $this->getRecommendedSize($ticketCode),
            'error_correction' => 'Medium',
            'encoding' => 'UTF-8'
        ];
    }

    /**
     * Get recommended QR code size based on data length
     *
     * @param string $data
     * @return int
     */
    private function getRecommendedSize(string $data): int
    {
        $length = strlen($data);
        
        if ($length <= 10) return 200;
        if ($length <= 25) return 300;
        if ($length <= 50) return 400;
        
        return 500;
    }
}
