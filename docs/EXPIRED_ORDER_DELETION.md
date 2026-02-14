# Sistem Penghapusan Otomatis Order yang Expired

## Overview
Sistem ini secara otomatis menghapus order dari database ketika statusnya berubah menjadi "expire" atau ketika order pending sudah lebih dari 10 menit.

## Komponen Sistem

### 1. OrderObserver (`app/Observers/OrderObserver.php`)
- **Fungsi**: Memantau perubahan status order secara real-time
- **Trigger**: Ketika status order berubah menjadi "expire"
- **Action**: Langsung menjalankan job `DeleteExpiredOrders`

### 2. DeleteExpiredOrders Job (`app/Jobs/DeleteExpiredOrders.php`)
- **Fungsi**: Menghapus semua order yang expired dari database
- **Kriteria Penghapusan**:
  - Order dengan status "expire"
  - Order dengan status "pending" yang dibuat lebih dari 10 menit yang lalu
- **Proses**:
  1. Hapus semua tiket yang terkait dengan order
  2. Hapus order dari database
  3. Log semua aktivitas

### 3. CleanupExpiredOrders Command (`app/Console/Commands/CleanupExpiredOrders.php`)
- **Fungsi**: Command manual untuk membersihkan order expired
- **Usage**: `php artisan orders:cleanup-expired`
- **Schedule**: Berjalan setiap menit via scheduler

### 4. TestExpiredOrderDeletion Command (`app/Console/Commands/TestExpiredOrderDeletion.php`)
- **Fungsi**: Command untuk testing sistem penghapusan
- **Usage**: `php artisan orders:test-expired-deletion`

### 5. Enhanced Order Model (`app/Models/Order.php`)
- **Method Baru**:
  - `isExpired()`: Cek apakah order expired
  - `shouldBeDeleted()`: Cek apakah order harus dihapus
  - `scopeExpiredForDeletion()`: Scope untuk query order yang harus dihapus

## Scheduling (Kernel.php)

### Real-time Deletion
- **Observer**: Trigger langsung ketika status berubah ke "expire"
- **Job Scheduler**: Berjalan setiap 30 detik untuk memastikan tidak ada yang terlewat

### Backup Cleanup
- **Command Scheduler**: Berjalan setiap menit sebagai backup
- **Sync Scheduler**: Setiap 10 detik untuk sinkronisasi status dengan Midtrans

## Cara Kerja

### 1. Real-time (Immediate)
```
Order Status → "expire" → OrderObserver → DeleteExpiredOrders Job → Order Deleted
```

### 2. Scheduled (Backup)
```
Every 30 seconds → DeleteExpiredOrders Job → Check & Delete Expired Orders
Every minute → CleanupExpiredOrders Command → Check & Delete Expired Orders
```

## Logging
Semua aktivitas penghapusan dicatat dalam log dengan informasi:
- Order number
- Status order
- Waktu created/updated
- Alasan penghapusan
- Jumlah tiket yang dihapus

## Testing
Untuk menguji sistem:
```bash
php artisan orders:test-expired-deletion
```

## Monitoring
Log file yang perlu dimonitor:
- `storage/logs/laravel.log` - Log utama aplikasi
- `storage/logs/cleanup-expired.log` - Log khusus cleanup command
- `storage/logs/scheduler.log` - Log scheduler

## Keamanan
- Sistem hanya menghapus order dengan kriteria yang jelas
- Referential integrity dijaga dengan menghapus tiket terlebih dahulu
- Semua operasi di-log untuk audit trail
- Menggunakan database transaction untuk konsistensi

## Konfigurasi
Timeout untuk order pending dapat diubah di:
- `Order::scopeExpiredForDeletion()` method
- `CleanupExpiredOrders` command
- Scheduler frequency di `Kernel.php`

## Troubleshooting

### Jika order expired tidak terhapus:
1. Cek apakah queue worker berjalan: `php artisan queue:work`
2. Cek log error di `storage/logs/laravel.log`
3. Jalankan manual: `php artisan orders:cleanup-expired`
4. Test sistem: `php artisan orders:test-expired-deletion`

### Jika ada error database:
1. Pastikan foreign key constraints benar
2. Cek apakah ada relasi yang menghalangi penghapusan
3. Periksa permission database

## Performance
- Job berjalan di background untuk tidak mengganggu user experience
- Menggunakan scope dan query yang efisien
- Batch processing untuk menghindari memory issues
- Logging yang optimal tanpa spam