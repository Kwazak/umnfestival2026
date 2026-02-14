@echo off
echo ========================================
echo    FRONTEND-ONLY DEPLOYMENT
echo ========================================
echo.

REM Step 1: Build assets
echo [1/2] Building frontend assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: npm run build failed!
    pause
    exit /b 1
)
echo ✅ Build completed!
echo.

REM Step 2: Create frontend deployment folder
echo [2/2] Preparing frontend files...
if exist "frontend_deploy" rmdir /s /q "frontend_deploy"
mkdir "frontend_deploy"

REM Copy frontend files only
echo Copying frontend files...

REM React/JS files
xcopy "resources\js" "frontend_deploy\resources\js\" /E /I /Y

REM Views (Blade templates)
xcopy "resources\views" "frontend_deploy\resources\views\" /E /I /Y

REM CSS files (if any)
if exist "resources\css" xcopy "resources\css" "frontend_deploy\resources\css\" /E /I /Y

REM Build assets (MOST IMPORTANT!)
xcopy "public\build" "frontend_deploy\public\build\" /E /I /Y

REM Config files for frontend
copy "package.json" "frontend_deploy\" 2>nul
copy "package-lock.json" "frontend_deploy\" 2>nul
copy "vite.config.js" "frontend_deploy\" 2>nul
copy "tailwind.config.js" "frontend_deploy\" 2>nul
copy "postcss.config.cjs" "frontend_deploy\" 2>nul

echo ✅ Frontend deployment package ready!
echo.

echo 📁 Files ready in: frontend_deploy\
echo.
echo 📋 UPLOAD STEPS:
echo 1. Open FileZilla
echo 2. Upload contents of frontend_deploy\ to /domains/umnfestival.com/laravel_app/
echo 3. Make sure public\build\ folder is uploaded completely!
echo.
echo 🔧 SSH COMMAND (optional):
echo cd /domains/umnfestival.com/laravel_app
echo php artisan view:clear
echo.
pause