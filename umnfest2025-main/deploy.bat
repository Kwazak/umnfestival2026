@echo off
echo ========================================
echo    UMN FESTIVAL DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Step 1: Build assets
echo [1/4] Building frontend assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: npm run build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
echo.

REM Step 2: Create deployment folder
echo [2/4] Preparing deployment files...
if exist "deployment_temp" rmdir /s /q "deployment_temp"
mkdir "deployment_temp"

REM Step 3: Copy necessary files
echo [3/4] Copying files for deployment...

REM Copy Laravel app files
xcopy "app" "deployment_temp\app\" /E /I /Y
xcopy "bootstrap" "deployment_temp\bootstrap\" /E /I /Y
xcopy "config" "deployment_temp\config\" /E /I /Y
xcopy "database" "deployment_temp\database\" /E /I /Y
xcopy "resources" "deployment_temp\resources\" /E /I /Y
xcopy "routes" "deployment_temp\routes\" /E /I /Y
xcopy "storage\app" "deployment_temp\storage\app\" /E /I /Y
xcopy "storage\framework" "deployment_temp\storage\framework\" /E /I /Y

REM Copy build assets to public folder
xcopy "public\build" "deployment_temp\public\build\" /E /I /Y

REM Copy configuration files
copy "composer.json" "deployment_temp\"
copy "composer.lock" "deployment_temp\"
copy "package.json" "deployment_temp\"
copy "package-lock.json" "deployment_temp\"
copy "artisan" "deployment_temp\"
copy "vite.config.js" "deployment_temp\"
copy "tailwind.config.js" "deployment_temp\"
copy "postcss.config.cjs" "deployment_temp\"

REM Copy .env.production as .env
copy ".env.production" "deployment_temp\.env"

echo ✅ Files copied successfully!
echo.

REM Step 4: Instructions
echo [4/4] Deployment package ready!
echo.
echo 📁 Files ready in: deployment_temp\
echo.
echo 📋 NEXT STEPS:
echo 1. Open FileZilla
echo 2. Navigate to: deployment_temp\ (local)
echo 3. Navigate to: /domains/umnfestival.com/laravel_app/ (remote)
echo 4. Upload ALL files from deployment_temp to laravel_app
echo 5. Run SSH commands (optional):
echo    cd /domains/umnfestival.com/laravel_app
echo    php artisan config:clear
echo    php artisan cache:clear
echo    php artisan view:clear
echo.
echo ⚠️  IMPORTANT: Don't upload .env if production .env already exists!
echo.
pause