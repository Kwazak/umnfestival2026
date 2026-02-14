@echo off
echo ========================================
echo    QUICK DEPLOYMENT (Changed Files Only)
echo ========================================
echo.

REM Step 1: Build assets
echo [1/3] Building frontend assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: npm run build failed!
    pause
    exit /b 1
)
echo ✅ Build completed!
echo.

REM Step 2: Create quick deployment folder
echo [2/3] Preparing changed files...
if exist "quick_deploy" rmdir /s /q "quick_deploy"
mkdir "quick_deploy"

REM Copy most commonly changed files
echo Copying commonly changed files...

REM Controllers (most common changes)
if exist "app\Http\Controllers" xcopy "app\Http\Controllers" "quick_deploy\app\Http\Controllers\" /E /I /Y

REM Models
if exist "app\Models" xcopy "app\Models" "quick_deploy\app\Models\" /E /I /Y

REM React Components and Pages
if exist "resources\js" xcopy "resources\js" "quick_deploy\resources\js\" /E /I /Y

REM Views
if exist "resources\views" xcopy "resources\views" "quick_deploy\resources\views\" /E /I /Y

REM Routes
xcopy "routes" "quick_deploy\routes\" /E /I /Y

REM Build assets (ALWAYS needed for frontend changes)
xcopy "public\build" "quick_deploy\public\build\" /E /I /Y

REM Config files (if changed)
copy "composer.json" "quick_deploy\" 2>nul
copy "composer.lock" "quick_deploy\" 2>nul
copy "package.json" "quick_deploy\" 2>nul
copy "package-lock.json" "quick_deploy\" 2>nul

echo ✅ Quick deployment package ready!
echo.

REM Step 3: Instructions
echo [3/3] Upload Instructions:
echo.
echo 📁 Files ready in: quick_deploy\
echo.
echo 📋 FILEZILLA STEPS:
echo 1. Open FileZilla and connect
echo 2. Local side: Navigate to quick_deploy\
echo 3. Remote side: Navigate to /domains/umnfestival.com/laravel_app/
echo 4. Select ALL files in quick_deploy and drag to remote
echo 5. Confirm overwrite when asked
echo.
echo 🔧 SSH COMMANDS (run after upload):
echo cd /domains/umnfestival.com/laravel_app
echo php artisan config:clear
echo php artisan cache:clear
echo.
pause