@echo off
title Pembuat Program EXE - Aplikasi Rapor SDN 3 Loloan Timur
color 0b

echo ========================================================
echo   PEMBUAT PROGRAM .EXE OTOMATIS (WINDOWS)
echo   Aplikasi Rapor SD Negeri 3 Loloan Timur
echo   Developer: Susilo Fitri Yatmoko
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Node.js belum terinstall di komputer Anda!
    echo Silakan unduh dan install Node.js terlebih dahulu di: https://nodejs.org/
    echo Setelah menginstall Node.js, jalankan kembali file ini.
    echo.
    pause
    exit /b
)

echo [1/3] Menginstall dependensi (termasuk Electron)...
call npm install
if %errorlevel% neq 0 (
    echo Gagal menginstall dependensi dasar.
    pause
    exit /b
)

echo.
echo [2/3] Menginstall electron & electron-builder...
call npm install --save-dev electron electron-builder

echo.
echo [3/3] Membangun program .EXE...
call npm run electron:build

echo.
echo ========================================================
echo  SELESAI! Program .EXE berhasil dibuat.
echo  File aplikasi ada di dalam folder "release"
echo ========================================================
echo.
pause
