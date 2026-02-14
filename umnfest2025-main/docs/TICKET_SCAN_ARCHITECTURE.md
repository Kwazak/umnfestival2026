# Arsitektur Fitur Scan Tiket - UMN Festival 2025

## 🎯 Overview

Fitur scan tiket adalah sistem untuk memvalidasi dan check-in peserta UMN Festival 2025 menggunakan QR code scanning. Sistem ini terdiri dari komponen frontend (React), backend (Laravel), dan security layer untuk mencegah penyalahgunaan.

## 🏗️ Komponen Utama

### 1. **Scanner Authentication System**

#### Login Page (`ScannerLogin.jsx`)
- **Tujuan**: Autentikasi petugas scanner sebelum menggunakan sistem
- **Username Format**: `ORANG-1` sampai `ORANG-50`
- **Password**: Sama dengan username (simple confirmation)
- **Session Management**: Menggunakan Laravel session
- **Route**: `/admin/scanner/login`

**Flow:**
```
User Input → Validasi Format → Submit ke Backend → Set Session → Redirect ke Scanner
```

**Security Features:**
- Regex validation untuk username: `/^ORANG-([1-9]|[1-4][0-9]|50)$/i`
- Password harus match dengan username
- Session tracking dengan `scanner_username` dan `scanner_logged_in_at`
- Logging setiap login/logout dengan IP address dan user agent

#### Controller: `TicketController@scannerLogin`
```php
Location: app/Http/Controllers/API/TicketController.php (lines 25-61)

Flow:
1. Validasi format username (ORANG-1 to ORANG-50)
2. Verify password matches username
3. Set session: scanner_username, scanner_logged_in_at
4. Log activity
5. Redirect ke /admin/scanner
```

---

### 2. **QR Code Generation & Security**

#### QR Code Service (`TicketSecurityService.php`)
- **Location**: `app/Services/TicketSecurityService.php`
- **Tujuan**: Generate dan validasi security hash untuk mencegah brute-force

**Hash Generation:**
```php
hash('sha256', ticket_code + order_number + ticket_id + app_key)
```

**Security Hash Features:**
- Mencegah ticket code guessing
- Setiap QR code memiliki verify parameter
- Hash validation menggunakan `hash_equals()` untuk mencegah timing attacks
- QR code URL format: `/api/tickets/validate/{ticketCode}?verify={hash}`

**Services Yang Digunakan:**
1. `TicketSecurityService` - Core security logic
2. `EnhancedQrCodeService` - Generate QR dengan BaconQRCode
3. `TicketQrCodeService` - Alternative QR generator
4. `TicketPdfService` - Generate PDF dengan QR code untuk tiket

---

### 3. **Scanner Interface (`Scanner.jsx`)**

#### Main Component
- **Location**: `resources/js/Pages/Admin/Scanner.jsx`
- **Library**: `qr-scanner` (QR code detection)
- **Framework**: React dengan Inertia.js

#### Key Features:

##### A. QR Scanning
```javascript
- Library: qr-scanner
- Camera: Prefer environment (back camera)
- Scan Rate: 5 scans per second (maxScansPerSecond: 5)
- Highlight: Scan region & code outline
```

##### B. Duplicate Prevention
```javascript
- lastScannedCodeRef: Track terakhir code yang di-scan
- scanCooldownRef: Prevent rapid re-scanning
- Cooldown timer: 6 detik untuk valid, 3 detik untuk invalid
```

##### C. Frame Capture System
**Tujuan**: Capture foto wajah peserta saat check-in untuk security audit

**Timing:**
```
Detection
    ↓
[Capture: frame_before_1500ms] → IMMEDIATELY
    ↓
+700ms → [Capture: frame_before_700ms]
    ↓
[API: Validate & Check-in]
    ↓
+700ms → [Capture: frame_after_700ms]
    ↓
+1500ms → [Capture: frame_after_1500ms] → Upload Frames
```

**Implementation:**
- Video resolution: 480px width (adaptive height)
- Format: JPEG with 0.6 quality
- Storage: `storage/public/ticket-frames/{ticketCode}/{frame_label}.jpg`
- Fallback: Jika ada frame yang gagal, duplicate frame terakhir yang berhasil

**Frame Buffers:**
```javascript
frameBuffersRef.current = {
    frame_before_1500ms: dataUrl,
    frame_before_700ms: dataUrl,
    frame_after_700ms: dataUrl,
    frame_after_1500ms: dataUrl
}
```

##### D. Sound Effects
```javascript
soundEffectsRef.current = {
    success: '/sound/success.mp3',    // Valid ticket checked in
    used: '/sound/used.mp3',          // Ticket already used
    notfound: '/sound/notfound.mp3'   // Invalid ticket
}
```

##### E. QR Code Processing
**Data Extraction:**
1. Raw QR data bisa berupa URL atau plain ticket code
2. Parser mencari pattern `/api/tickets/validate/{ticketCode}?verify={hash}`
3. Extract `ticketCode` dan `verify` parameter
4. Support both full URL dan relative URL
5. Fallback ke manual mode jika tidak ada verify parameter

**Code:**
```javascript
// Extract from URL
if (qrData.includes('/api/tickets/validate/')) {
    const urlObj = new URL(qrData, window.location.origin);
    ticketCode = urlObj.pathname.split('/api/tickets/validate/')[1].split('?')[0];
    verifyParam = urlObj.searchParams.get('verify');
}
```

---

### 4. **Backend Validation Flow**

#### A. Ticket Validation Endpoint

**Public Endpoint** (Rate Limited):
```
GET /api/tickets/validate/{ticketCode}?verify={hash}
Controller: TicketController@validateTicket
Throttle: 100 requests per minute
```

**Admin Endpoint** (Session Protected):
```
GET /api/admin/tickets/validate/{ticketCode}?verify={hash}
Controller: TicketController@adminValidateTicket
Middleware: web, admin.api.auth
```

**Validation Flow:**
```
1. Find ticket by ticket_code
2. Validate security hash (REQUIRED untuk public, OPTIONAL untuk admin)
3. Check order status (paid/settlement/capture)
4. Check ticket status:
   - 'valid' → Allow check-in
   - 'used' → Return already used
   - Other → Invalid
5. Return ticket details
```

**Response Types:**
```javascript
// Valid
{
    success: true,
    type: 'valid',
    ticket: { ticket_code, status, buyer_name, buyer_email, category, ... }
}

// Already Used
{
    success: false,
    type: 'used',
    ticket: { ..., checked_in_at, scanned_by }
}

// Invalid
{
    success: false,
    type: 'invalid',
    message: 'Ticket not found / not valid'
}
```

#### B. Check-in Endpoint

```
POST /api/tickets/checkin/{ticketCode}?verify={hash}
Controller: TicketController@checkIn
Middleware: web (requires scanner session)
```

**Check-in Flow:**
```
1. Verify scanner authenticated (session: scanner_username)
2. Find ticket
3. Validate security hash (OPTIONAL - fallback to manual)
4. Check order paid
5. Check not already used
6. Update ticket:
   - status = 'used'
   - checked_in_at = Carbon::now()
   - scanned_by = scanner_username (e.g., 'ORANG-5')
7. Log check-in activity
8. Return success with updated ticket
```

#### C. Frame Storage Endpoint

```
POST /api/tickets/{ticketCode}/frames?verify={hash}
Controller: TicketController@storeFrames
```

**Upload Flow:**
```
1. Receive base64 encoded frames
2. Validate data URL format (image/png or image/jpeg)
3. Decode base64
4. Validate minimum size (>1000 bytes)
5. Save to storage/public/ticket-frames/{ticketCode}/
6. Update ticket record with file paths
7. Return success
```

---

### 5. **Database Schema**

#### Tickets Table

**Key Columns:**
```sql
id                      - Primary key
order_id               - Foreign key ke orders table
ticket_code            - Unique ticket identifier (e.g., 'UMNF-ABC123')
status                 - Enum: 'pending', 'valid', 'used'
checked_in_at          - Timestamp saat check-in
scanned_by             - Scanner username (e.g., 'ORANG-5')
frame_before_1500ms    - Path ke frame capture 1
frame_before_700ms     - Path ke frame capture 2
frame_after_700ms      - Path ke frame capture 3
frame_after_1500ms     - Path ke frame capture 4
created_at, updated_at
```

**Migrations:**
- `2025_11_05_134711_add_scanned_by_to_tickets_table.php` - Menambah kolom scanned_by
- `2025_11_26_000001_add_frame_captures_to_tickets.php` - Menambah kolom frame captures

**Relationships:**
```php
Ticket belongsTo Order
Order hasMany Tickets
Order belongsTo User (buyer)
```

---

### 6. **API Routes**

#### Web Routes (`routes/web.php`)
```php
// Scanner Login Pages
GET  /admin/scanner/login  → Inertia 'ScannerLogin'
POST /admin/scanner/login  → TicketController@scannerLogin
POST /admin/scanner/logout → TicketController@scannerLogout

// Scanner Interface
GET /admin/scanner → AdminController@scanner (requires admin.auth)
```

#### API Routes (`routes/api.php`, `routes/api_secure.php`)
```php
// Admin-only endpoints (requires session)
GET  /api/admin/tickets/validate/{code} → TicketController@adminValidateTicket
GET  /api/tickets → List all tickets (admin only)

// Public endpoints (rate limited)
GET  /api/tickets/validate/{code} → TicketController@validateTicket
POST /api/tickets/checkin/{code}  → TicketController@checkIn
POST /api/tickets/{code}/frames   → TicketController@storeFrames

// Admin utilities (requires secret)
POST /api/admin/tickets/reset     → TicketController@resetAll
POST /api/admin/tickets/{code}/reset → TicketController@adminResetSingle
```

---

### 7. **Security Features**

#### A. Hash-based Security
- Setiap QR code memiliki unique hash
- Hash tidak bisa di-guess tanpa akses ke database
- Menggunakan app key sebagai salt
- Hash validation menggunakan `hash_equals()` untuk constant-time comparison

#### B. Rate Limiting
```php
// Public endpoints
'throttle:100,1' → 100 requests per minute

// Admin endpoints
'throttle:admin-scanner:300,1' → 300 requests per minute
```

#### C. Session Protection
- Scanner harus login terlebih dahulu
- Session timeout automatic
- Logout tracking dengan IP address

#### D. Duplicate Prevention
- Frontend: Cooldown timer & last scanned code tracking
- Backend: Status check before check-in

#### E. Brute Force Prevention
- Hash validation required (public endpoints)
- Rate limiting
- Logging suspicious activities

---

### 8. **Error Handling**

#### Frontend
```javascript
// Error types
'invalid'  → Ticket not found / not valid (sound: notfound)
'used'     → Ticket already scanned (sound: used)
'error'    → System error (sound: notfound)
'valid'    → Success (sound: success)
'auth_required' → Scanner not logged in
```

#### Backend
```php
// HTTP Status Codes
200 → Success
400 → Bad request (invalid hash, already used)
401 → Unauthorized (scanner not logged in)
403 → Forbidden (invalid secret)
404 → Ticket not found
500 → Server error
```

---

### 9. **Monitoring & Logging**

#### Log Points:
```php
// Authentication
- Scanner login/logout dengan IP & user agent

// Validation
- Ticket validation attempt (success/failure)
- Hash validation (success/failure)
- Invalid ticket/order status

// Check-in
- Successful check-in dengan ticket_code, order_number, scanner_username
- Duplicate check-in attempt

// Frame Capture
- Frame saved (ticket_code, label, path, bytes)
- Frame rejected (invalid format, too small)

// Admin Actions
- Reset all tickets
- Reset single ticket
```

#### Log Location:
```
storage/logs/laravel.log
```

---

### 10. **Flow Diagram**

```
┌──────────────────────────────────────────────────────────────┐
│                     SCANNER LOGIN                            │
│  Scanner menggunakan credentials ORANG-1 to ORANG-50        │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  START SCANNING                              │
│  - Initialize camera                                         │
│  - Preload sound effects                                     │
│  - Ready for QR detection                                    │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                   QR CODE DETECTED                           │
│  1. Extract ticket_code dan verify hash dari QR              │
│  2. Capture frame_before_1500ms (immediate)                  │
│  3. Set cooldown untuk prevent duplicate                     │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              VALIDATE TICKET (API Call 1)                    │
│  GET /api/admin/tickets/validate/{code}?verify={hash}        │
│  Response:                                                   │
│  - valid: Continue to check-in                               │
│  - used: Show "sudah di-scan"                                │
│  - invalid: Show "tidak valid"                               │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│               CHECK-IN TICKET (API Call 2)                   │
│  POST /api/tickets/checkin/{code}?verify={hash}              │
│  Update:                                                     │
│  - status = 'used'                                           │
│  - checked_in_at = now()                                     │
│  - scanned_by = scanner_username                             │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  CAPTURE POST-FRAMES                         │
│  +700ms  → Capture frame_after_700ms                         │
│  +1500ms → Capture frame_after_1500ms                        │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                   UPLOAD FRAMES                              │
│  POST /api/tickets/{code}/frames                             │
│  Upload all 4 frames untuk security audit                    │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  DISPLAY RESULT                              │
│  - Play sound (success/used/notfound)                        │
│  - Show ticket info                                          │
│  - Start cooldown (6s valid, 3s invalid)                     │
│  - Auto restart scanning after cooldown                      │
└──────────────────────────────────────────────────────────────┘
```

---

### 11. **Admin Utilities**

#### A. Reset All Tickets
```
POST /api/admin/tickets/reset
Body: { secret: "JANGANLAKUKANINIDIHARIH" }

Action:
- Set all non-pending tickets to 'valid'
- Clear checked_in_at
- Clear scanned_by
```

#### B. Reset Single Ticket
```
POST /api/admin/tickets/{code}/reset
Body: {
    secret: "JANGANLAKUKANINIDIHARIH",
    confirm_code: "{ticket_code}"
}

Action:
- Set specific ticket to 'valid'
- Clear checked_in_at
- Clear scanned_by
```

**Security:**
- Requires secret code
- Requires confirmation code (must match ticket code)
- Cannot reset pending tickets
- All resets are logged with IP and user agent

---

### 12. **Manual Input Fallback**

**Purpose**: Jika QR code tidak bisa di-scan (rusak/blur/masalah kamera)

**Flow:**
1. Scanner tetap aktif (untuk frame capture)
2. User click "Manual Input" button
3. Prompt untuk input QR data atau ticket code
4. Process seperti normal QR scan
5. Support both URL lengkap atau ticket code only
6. Jika tidak ada verify parameter, fallback ke manual mode (skip hash validation di admin endpoint)

**Code:**
```javascript
const handleManualInput = () => {
    if (!isScanning) {
        alert('Start scanning first supaya kamera aktif & frame bisa dicapture.');
        return;
    }
    const input = prompt('Masukkan data QR (URL lengkap yang mengandung verify=... lebih disarankan):');
    if (!input) return;
    handleQRScan(input.trim());
};
```

---

### 13. **Frontend State Management**

#### React State Variables:
```javascript
scanResult         → Result dari scan terakhir
isScanning         → Boolean camera active
error              → Error message
scannerStatus      → Status text (e.g., "Scanning...", "Ready to scan")
cooldown           → Boolean cooldown active
countdownSeconds   → Countdown timer value
```

#### Refs (untuk persist across renders):
```javascript
soundEffectsRef       → Preloaded audio objects
frameBuffersRef       → Captured frame data
frameTimersRef        → setTimeout IDs untuk frame capture
videoRef              → Video element reference
canvasRef             → Canvas untuk capture frames
qrScannerRef          → QrScanner instance
lastScannedCodeRef    → Last scanned code untuk duplicate prevention
scanCooldownRef       → Cooldown flag
cooldownTimerRef      → Interval ID untuk countdown
```

---

### 14. **Dependencies**

#### Frontend:
```json
"qr-scanner": "^1.4.2"      // QR code detection
"@inertiajs/react": "^2.0"  // SPA navigation
"react": "^18"              // UI framework
```

#### Backend:
```php
"bacon/bacon-qr-code": "^2.0"  // QR code generation
"endroid/qr-code": "^4.0"      // Alternative QR generator
```

---

### 15. **Best Practices & Tips**

#### Untuk Scanner Operator:
1. Pastikan login dengan username yang benar
2. Allow camera permission saat diminta
3. Gunakan kamera belakang untuk hasil lebih baik
4. Tunggu cooldown selesai sebelum scan ticket berikutnya
5. Gunakan manual input jika QR code rusak
6. Check internet connection jika ada error

#### Untuk Developer:
1. Hash validation WAJIB untuk public endpoints
2. Selalu log security-critical operations
3. Use constant-time comparison untuk hash validation
4. Rate limit semua public endpoints
5. Monitor log files untuk suspicious activities
6. Test dengan berbagai kondisi network
7. Handle camera permission errors gracefully

---

### 16. **Troubleshooting**

#### Camera tidak bisa akses:
```
- Check browser permissions
- Pastikan HTTPS (camera hanya bisa akses di secure context)
- Coba browser lain
- Check camera tidak digunakan aplikasi lain
```

#### Ticket validation failed:
```
- Check internet connection
- Verify ticket belum expired
- Check order status sudah paid
- Verify scanner sudah login
```

#### Frame upload failed:
```
- Check storage permission
- Check disk space
- Check network connection
- Frame akan di-skip tapi check-in tetap success
```

---

## 🚀 Quick Start Guide

### Setup Development:
```bash
# Backend
php artisan migrate
php artisan serve

# Frontend
npm install
npm run dev
```

### Testing Scanner:
1. Go to `/admin/scanner/login`
2. Login dengan `ORANG-1` / `ORANG-1`
3. Allow camera permission
4. Click "Start Scanning"
5. Scan QR code dari PDF ticket

### Generate Test Ticket:
```php
// Buat order
$order = Order::create([...]);

// Generate ticket dengan QR code
$ticket = Ticket::create([
    'order_id' => $order->id,
    'ticket_code' => 'UMNF-TEST123',
    'status' => 'valid'
]);

// Generate PDF dengan QR code
$pdf = TicketPdfService::generate($ticket);
```

---

## 📝 Conclusion

Arsitektur fitur scan tiket UMN Festival 2025 dirancang dengan fokus pada:
- **Security**: Hash-based validation, rate limiting, session protection
- **Reliability**: Error handling, fallback mechanisms, logging
- **User Experience**: Fast scanning, visual/audio feedback, cooldown prevention
- **Audit Trail**: Frame capture, detailed logging, scanner tracking

Sistem ini menggabungkan modern web technologies (React, Laravel, QR Scanner) dengan security best practices untuk memberikan pengalaman check-in yang smooth dan aman untuk event dengan ribuan peserta.

**Let's vibe code! 🎉**
