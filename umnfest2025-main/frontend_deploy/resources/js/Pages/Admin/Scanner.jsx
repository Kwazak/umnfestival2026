import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import QrScanner from 'qr-scanner';

export default function AdminScanner({ auth }) {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [scannerStatus, setScannerStatus] = useState('Ready to scan');
    const [cooldown, setCooldown] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const soundEffectsRef = useRef({});
    const frameBuffersRef = useRef({});
    const frameTimersRef = useRef([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const qrScannerRef = useRef(null);
    const lastScannedCodeRef = useRef('');
    const scanCooldownRef = useRef(false);
    const cooldownTimerRef = useRef(null);

    // Check if scanner is logged in
    useEffect(() => {
        if (!auth?.scanner_username) {
            router.visit('/admin/scanner/login');
        }
    }, [auth]);

    // Preload sound effects to avoid latency during scan events
    useEffect(() => {
        soundEffectsRef.current = {
            success: new Audio('/sound/success.mp3'),
            used: new Audio('/sound/used.mp3'),
            notfound: new Audio('/sound/notfound.mp3'),
        };
    }, []);

    const stopAllSounds = () => {
        Object.values(soundEffectsRef.current || {}).forEach(audio => {
            if (!audio) return;
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                // ignore pause errors
            }
        });
    };

    const playSound = (key) => {
        const audio = soundEffectsRef.current[key];
        if (!audio) return;
        try {
            stopAllSounds();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (e) {
            console.warn('Audio play failed', e);
        }
    };

    const clearFrameTimers = () => {
        frameTimersRef.current.forEach(t => clearTimeout(t));
        frameTimersRef.current = [];
    };

    const captureFrame = (label) => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) {
            console.warn('Capture skipped: video not ready', { label });
            return false;
        }

        let canvas = canvasRef.current;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvasRef.current = canvas;
        }

        const targetWidth = 480;
        const ratio = video.videoHeight / video.videoWidth || 0.75;
        const targetHeight = Math.max(1, Math.floor(targetWidth * ratio));

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        if (dataUrl && dataUrl.length > 1000) {
            frameBuffersRef.current[label] = dataUrl;
            console.log(`Captured ${label}, size=${dataUrl.length}`);
            return true;
        }
        console.warn(`Capture failed or too small for ${label}`);
        return false;
    };

    const uploadFrames = async (ticketCode, verifyParam = null, isManual = false) => {
        const frames = frameBuffersRef.current || {};
        const orderedKeys = ['frame_before_1500ms', 'frame_before_700ms', 'frame_after_700ms', 'frame_after_1500ms'];

        // Fill missing slots with the last available frame so kita tetap kirim 4 foto
        let lastAvailable = null;
        orderedKeys.forEach(key => {
            if (frames[key]) {
                lastAvailable = frames[key];
            } else if (lastAvailable) {
                frames[key] = lastAvailable;
            }
        });

        const payload = {};
        orderedKeys.forEach(key => {
            if (frames[key]) payload[key] = frames[key];
        });
        if (Object.keys(payload).length === 0) return;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const params = [];
            if (verifyParam) params.push(`verify=${encodeURIComponent(verifyParam)}`);
            if (isManual && !verifyParam) params.push('manual=1');
            const suffix = params.length ? `?${params.join('&')}` : '';
            const res = await fetch(`/api/tickets/${encodeURIComponent(ticketCode)}/frames${suffix}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                console.warn('Upload frames failed response', { status: res.status, data });
            } else {
                console.log('Frames uploaded', data);
            }
        } catch (e) {
            console.warn('Upload frames failed', e);
        }
        // Clear buffers after upload attempt
        frameBuffersRef.current = {};
    };

    const handleLogout = () => {
        if (confirm('Logout dari scanner?')) {
            router.post('/admin/scanner/logout');
        }
    };

    const clearCooldownTimer = () => {
        if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
        }
    };

    const startCooldown = (seconds = 6) => {
        if (qrScannerRef.current && qrScannerRef.current.stop) {
            try {
                const maybePromise = qrScannerRef.current.stop();
                if (maybePromise && typeof maybePromise.then === 'function') {
                    maybePromise.catch(() => {});
                }
            } catch {
                // ignore
            }
        }

        scanCooldownRef.current = true;
        setCooldown(true);
        setCountdownSeconds(seconds);
        setScannerStatus(`Cooldown... restarting in ${seconds}s`);

        clearCooldownTimer();
        cooldownTimerRef.current = setInterval(() => {
            setCountdownSeconds(prev => {
                const next = prev - 1;
                if (next <= 0) {
                    clearCooldownTimer();
                    setCooldown(false);
                    scanCooldownRef.current = false;
                    lastScannedCodeRef.current = '';
                    setScannerStatus('Ready to scan');
                    if (isScanning && qrScannerRef.current) {
                        qrScannerRef.current.start().catch(() => {});
                    }
                    return 0;
                }
                setScannerStatus(`Cooldown... restarting in ${next}s`);
                return next;
            });
        }, 1000);
    };

    // Function to validate ticket via API
    const validateTicket = async (ticketCode, verifyParam = null, isManual = false) => {
        try {
            console.log('Validating ticket:', ticketCode);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            console.log('CSRF Token found:', !!csrfToken);
            const baseHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
            };

            const params = [];
            if (verifyParam) params.push(`verify=${encodeURIComponent(verifyParam)}`);
            if (isManual && !verifyParam) params.push('manual=1');
            const verifySuffix = params.length ? `?${params.join('&')}` : '';

            // Use admin endpoint ONLY (session-protected) and forward verify hash
            const response = await fetch(`/api/admin/tickets/validate/${encodeURIComponent(ticketCode)}${verifySuffix}`, {
                method: 'GET',
                headers: baseHeaders,
                credentials: 'same-origin',
            });

            console.log('Admin validation response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log('Admin validation error:', errorData);
                return errorData;
            }
            
            const data = await response.json();
            console.log('Admin validation response data:', data);
            return data;
        } catch (error) {
            console.error('API validation error:', error);
            return {
                success: false,
                type: 'error',
                message: 'Network error: ' + error.message,
                ticketCode: ticketCode
            };
        }
    };

    // Function to check-in ticket via API
    const checkInTicket = async (ticketCode, verifyParam = null, isManual = false) => {
        try {
            console.log('Checking in ticket:', ticketCode);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const params = [];
            if (verifyParam) params.push(`verify=${encodeURIComponent(verifyParam)}`);
            if (isManual && !verifyParam) params.push('manual=1');
            const verifySuffix = params.length ? `?${params.join('&')}` : '';
            
            const response = await fetch(`/api/tickets/checkin/${encodeURIComponent(ticketCode)}${verifySuffix}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
                body: JSON.stringify({})
            });

            console.log('Check-in response status:', response.status);
            
            const data = await response.json();
            console.log('Check-in response data:', data);
            
            return data;
        } catch (error) {
            console.error('API check-in error:', error);
            return {
                success: false,
                type: 'error',
                message: 'Network error occurred: ' + error.message,
                ticketCode: ticketCode
            };
        }
    };

    // QR Code scanning logic
    const handleQRScan = async (rawResult) => {
        try {
            // Extract the actual QR code data from the result object
            let qrData = typeof rawResult === 'string' ? rawResult : rawResult?.data || rawResult;
            
            console.log('Raw QR scan result:', qrData);
            
            // Clean up the data
            qrData = qrData.trim();
            let verifyParam = null;
            
            // Extract ticket code from URL if it's a full URL
            if (qrData.includes('/api/tickets/validate/')) {
                // Extract ticket code from URL pattern: /api/tickets/validate/{ticketCode}?...
                try {
                    const urlObj = new URL(qrData, window.location.origin);
                    const pathAfter = urlObj.pathname.split('/api/tickets/validate/')[1] || '';
                    qrData = pathAfter.split('?')[0];
                    verifyParam = urlObj.searchParams.get('verify');
                } catch {
                    const urlParts = qrData.split('/api/tickets/validate/');
                    if (urlParts.length > 1) {
                        const right = urlParts[1];
                        const [code, query] = right.split('?');
                        qrData = code;
                        if (query) {
                            const m = /(?:^|&)verify=([^&]+)/.exec(query);
                            if (m) verifyParam = decodeURIComponent(m[1]);
                        }
                    }
                }
            } else if (qrData.includes('tickets/validate/')) {
                // Handle relative URLs
                try {
                    const urlObj = new URL(qrData, window.location.origin);
                    const pathAfter = urlObj.pathname.split('tickets/validate/')[1] || '';
                    qrData = pathAfter.split('?')[0];
                    verifyParam = urlObj.searchParams.get('verify');
                } catch {
                    const urlParts = qrData.split('tickets/validate/');
                    if (urlParts.length > 1) {
                        const right = urlParts[1];
                        const [code, query] = right.split('?');
                        qrData = code;
                        if (query) {
                            const m = /(?:^|&)verify=([^&]+)/.exec(query);
                            if (m) verifyParam = decodeURIComponent(m[1]);
                        }
                    }
                }
            }
            
            // Remove any URL encoding
            qrData = decodeURIComponent(qrData);
            
            console.log('Processed QR data:', qrData);
            if (verifyParam) console.log('Found verify param in QR:', verifyParam.substring(0,8) + '...');
            
            // Validate that we have a reasonable ticket code
            if (!qrData || qrData.length < 3) {
                console.log('Invalid QR data length:', qrData);
                return;
            }

            // Manual input boleh tanpa verify; kalau QR tanpa hash kita fallback ke manual agar tetap jalan di hari-H
            const isManual = typeof rawResult === 'string' && !rawResult.includes('/api/tickets/validate/');
            const effectiveManual = isManual || !verifyParam;
            
            // Prevent duplicate scans of the same code
            if (scanCooldownRef.current || lastScannedCodeRef.current === qrData) {
                console.log('Duplicate scan prevented:', qrData);
                return;
            }

            clearFrameTimers();
            frameBuffersRef.current = {};

            // Set cooldown to prevent rapid re-scanning
            scanCooldownRef.current = true;
            lastScannedCodeRef.current = qrData;
            
            setScannerStatus('Processing ticket...');

            // Pre-capture immediately (relative to detection), keep it quick
            captureFrame('frame_before_1500ms');
            const pre700 = setTimeout(() => captureFrame('frame_before_700ms'), 700);
            frameTimersRef.current.push(pre700);

                const processed = await processTicket(qrData, verifyParam, effectiveManual);

            const finalize = () => {
                setScanResult(processed);
                if (processed.sound) playSound(processed.sound);
            };

            if (processed.type === 'valid') {
                // Show result right after API success (no extra delay), then post-capture
                setScannerStatus('Scan done. Capturing post frames...');
                finalize();
                const post700 = setTimeout(() => captureFrame('frame_after_700ms'), 700);
                const post1500 = setTimeout(async () => {
                    captureFrame('frame_after_1500ms');
                    await uploadFrames(qrData, verifyParam, effectiveManual);
                    startCooldown(6);
                }, 1500);
                frameTimersRef.current.push(post700, post1500);
            } else {
                finalize();
                startCooldown(3);
            }
        } catch (error) {
            console.error('Error processing QR scan:', error);
            setScannerStatus('Error processing QR code');
            setTimeout(() => {
                setScannerStatus('Ready to scan');
            }, 2000);
        }
    };

    const startScanning = async () => {
        try {
            clearCooldownTimer();
            setCooldown(false);
            setCountdownSeconds(0);
            scanCooldownRef.current = false;
            setError(null);
            setIsScanning(true);
            setScannerStatus('Starting camera...');
            
        } catch (err) {
            console.error('Error starting scanner:', err);
            setError('Failed to start scanner');
            setIsScanning(false);
            setScannerStatus('Ready to scan');
        }
    };

    // Initialize scanner when isScanning becomes true
    const initializeScanner = async () => {
        try {
            // Wait a bit for the video element to be rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!videoRef.current) {
                setError('Video element not found');
                setIsScanning(false);
                setScannerStatus('Ready to scan');
                return;
            }

            // Initialize QR Scanner
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                result => handleQRScan(result),
                {
                    onDecodeError: err => {
                        // Ignore decode errors (normal when no QR code is visible)
                        // console.log('Decode error:', err);
                    },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    maxScansPerSecond: 5, // Limit scanning frequency
                    preferredCamera: 'environment' // Use back camera
                }
            );

            // Start the scanner
            await qrScannerRef.current.start();
            setScannerStatus('Scanning for QR codes...');
            
        } catch (err) {
            console.error('Camera start error:', err);
            let errorMessage = 'Unable to access camera. ';
            
            if (err.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera permissions and try again.';
            } else if (err.name === 'NotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (err.name === 'NotSupportedError') {
                errorMessage += 'Camera not supported in this browser.';
            } else {
                errorMessage += 'Please check permissions and try again.';
            }
            
            setError(errorMessage);
            setIsScanning(false);
            setScannerStatus('Ready to scan');
        }
    };

    const stopScanning = async () => {
        try {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
                qrScannerRef.current = null;
            }
            clearCooldownTimer();
            clearFrameTimers();
        } catch (err) {
            console.error('Error stopping scanner:', err);
        }
        
        setIsScanning(false);
        setScannerStatus('Ready to scan');
        lastScannedCodeRef.current = '';
        scanCooldownRef.current = false;
        setCooldown(false);
        setCountdownSeconds(0);
    };

    const handleManualInput = () => {
        if (!isScanning) {
            alert('Start scanning first supaya kamera aktif & frame bisa dicapture.');
            return;
        }
        const input = prompt('Masukkan data QR (URL lengkap yang mengandung verify=... lebih disarankan):');
        if (!input) return;
        const trimmed = input.trim();
        // Manual input: boleh tanpa verify (hash tidak wajib). Reuse handler.
        handleQRScan(trimmed);
    };

    const processTicket = async (ticketCode, verifyParam = null, isManual = false) => {
        console.log('Processing ticket:', ticketCode);
        
        // First validate the ticket
        const validationResult = await validateTicket(ticketCode, verifyParam, isManual);
        console.log('Validation result:', validationResult);
        
        // Handle validation response
        if (!validationResult.success) {
            if (validationResult.type === 'invalid') {
                return {
                    type: 'invalid',
                    message: validationResult.message || 'Ticket not found',
                    ticketCode,
                    sound: 'notfound'
                };
            } else if (validationResult.type === 'used') {
                return {
                    type: 'used',
                    message: validationResult.message || 'Ticket already used',
                    ticket: validationResult.ticket,
                    ticketCode,
                    sound: 'used'
                };
            }
            return {
                type: 'error',
                message: validationResult.message || 'Validation error',
                ticketCode,
                sound: 'notfound'
            };
        } else if (validationResult.success && validationResult.type === 'valid') {
            // Ticket is valid, now check it in
            console.log('Ticket is valid, proceeding to check-in...');
            const checkInResult = await checkInTicket(ticketCode, verifyParam, isManual);
            console.log('Check-in result:', checkInResult);
            
            if (checkInResult.success) {
                return {
                    type: 'valid',
                    message: checkInResult.message || 'Check-in successful!',
                    ticket: checkInResult.ticket,
                    ticketCode,
                    sound: 'success'
                };
            }
            return {
                type: 'error',
                message: checkInResult.message || 'Check-in failed',
                ticket: checkInResult.ticket || null,
                ticketCode,
                sound: 'notfound'
            };
        }
        return {
            type: 'error',
            message: 'Unexpected response from server',
            ticketCode,
            sound: 'notfound'
        };
    };

    // Function to simulate QR scan for demo purposes (now uses real API)
    const simulateQRScan = (ticketCode) => {
        processTicket(ticketCode);
    };

    // Test API connection
    const testAPIConnection = async () => {
        try {
            console.log('Testing API connection...');
            
            // Test basic connectivity
            const response = await fetch('/api/tickets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            console.log('API test response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API test response data:', data);
                
                setScanResult({
                    type: 'valid',
                    message: 'API Connection Successful',
                    ticketCode: 'API-TEST'
                });
            } else {
                setScanResult({
                    type: 'error',
                    message: `API Error: ${response.status}`,
                    ticketCode: 'API-TEST'
                });
            }
        } catch (error) {
            console.error('API test error:', error);
            setScanResult({
                type: 'error',
                message: 'API Connection Failed: ' + error.message,
                ticketCode: 'API-TEST'
            });
        }
        
        // Manual close only - removed auto-hide timeout
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Initialize scanner when isScanning becomes true
    useEffect(() => {
        if (isScanning) {
            initializeScanner();
        }
    }, [isScanning]);

    useEffect(() => {
        return () => {
            // Cleanup camera stream on unmount
            clearCooldownTimer();
            clearFrameTimers();
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-50 text-white p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-semibold">UMN Festival Scanner</h1>
                        {auth?.scanner_username && (
                            <div className="text-xs text-yellow-400 mt-1">
                                👤 Logged in as: <span className="font-mono font-bold">{auth.scanner_username}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleManualInput}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition"
                        >
                            Manual
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Camera View */}
            <div className="relative h-screen">
                {isScanning ? (
                    <div className="relative h-full">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                        />
                        
                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-[#FFC22F] border-dashed rounded-lg flex items-center justify-center relative">
                                <div className="text-white text-center">
                                    <div className="text-2xl mb-2">📱</div>
                                    <div>Point camera at QR code</div>
                                    <div className="text-sm text-[#FFC22F] mt-2">
                                        {scannerStatus}
                                    </div>
                                    {cooldown && (
                                        <div className="mt-2 text-lg font-bold text-red-300">
                                            Restart in {countdownSeconds}s
                                        </div>
                                    )}
                                </div>
                                
                                {/* Scanning animation */}
                                {!cooldown && (
                                    <div className="absolute inset-0 border-2 border-[#FFC22F] rounded-lg animate-pulse"></div>
                                )}
                            </div>
                        </div>

                        {/* Scanner Status */}
                        <div className="absolute top-20 left-4 right-4 text-center">
                            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                                <div className="text-sm">{scannerStatus}</div>
                                {cooldown && (
                                    <div className="text-xs text-[#FFC22F] mt-1">
                                        Cooling down... Please wait {countdownSeconds}s
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stop Button */}
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                            <button
                                onClick={stopScanning}
                                className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg"
                            >
                                Stop Scanning
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Start Screen */
                    <div className="h-full flex flex-col items-center justify-center text-white p-8">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📱</div>
                            <h2 className="text-2xl font-bold mb-2">Ticket Scanner</h2>
                            <p className="text-gray-300">Tap to start scanning QR codes</p>
                        </div>

                        <button
                            onClick={startScanning}
                            className="bg-[#FFC22F] text-black px-8 py-4 rounded-full text-xl font-semibold mb-6"
                        >
                            Start Scanning
                        </button>

                        {error && (
                            <div className="mt-6 bg-red-600 text-white px-4 py-2 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scan Result Overlay */}
            {scanResult && (
                <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-lg p-8 text-center text-white font-bold text-xl ${
                        scanResult.type === 'valid' ? 'bg-green-600' :
                        scanResult.type === 'used' ? 'bg-yellow-600' :
                        'bg-red-600'
                    }`}>
                        <div className="text-4xl mb-4">
                            {scanResult.type === 'valid' ? '✅' :
                             scanResult.type === 'used' ? '⚠️' :
                             '❌'}
                        </div>
                        
                        <h3 className="text-2xl mb-4">{scanResult.message}</h3>
                        
                        {scanResult.ticket && (
                            <div className="text-left bg-black bg-opacity-30 rounded p-4 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <strong>Code:</strong><br />
                                        {scanResult.ticket.ticket_code}
                                    </div>
                                    <div>
                                        <strong>Name:</strong><br />
                                        {scanResult.ticket.buyer_name}
                                    </div>
                                    <div className="col-span-2">
                                        <strong>Email:</strong><br />
                                        <span className="text-xs break-all">{scanResult.ticket.buyer_email}</span>
                                    </div>
                                    <div>
                                        <strong>Category:</strong><br />
                                        {scanResult.ticket.category.toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>Order:</strong><br />
                                        #{scanResult.ticket.order_id}
                                    </div>
                                </div>
                                
                                {scanResult.ticket.checked_in_at && (
                                    <div className="mt-2 pt-2 border-t border-gray-400">
                                        <strong>Checked in:</strong><br />
                                        {formatDate(scanResult.ticket.checked_in_at)}
                                        {scanResult.ticket.scanned_by && (
                                            <div className="mt-1">
                                                <strong>Scanned by:</strong><br />
                                                <span className={`font-mono font-bold ${scanResult.type === 'used' ? 'text-yellow-300' : 'text-yellow-300'}`}>
                                                    {scanResult.ticket.scanned_by}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {!scanResult.ticket && (
                            <div className="text-left bg-black bg-opacity-30 rounded p-4 text-sm">
                                <strong>Scanned Code:</strong> {scanResult.ticketCode}
                            </div>
                        )}
                        
                        <button
                            onClick={() => setScanResult(null)}
                            className="mt-6 bg-white text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Instructions */}
            {!scanResult && (
                <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm">
                    <p>Hold your device steady and point the camera at the QR code</p>
                </div>
            )}
        </div>
    );
}
