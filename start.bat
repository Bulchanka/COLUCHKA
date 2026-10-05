@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Koluchka Launcher
cd /d "%~dp0"

echo.
echo ==========================================
echo        KOLUCHKA
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js не найден.
    echo Установите Node.js LTS и запустите батник снова.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm не найден.
    echo Переустановите Node.js LTS и запустите батник снова.
    pause
    exit /b 1
)

if not exist "node_modules\next\package.json" (
    echo [INFO] Устанавливаю зависимости...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Не удалось установить зависимости.
        pause
        exit /b 1
    )
)

rem 8080 обычно не блокируется браузерами и сетевыми политиками.
set "PORT=8080"
:find_port
powershell -NoProfile -Command "$connection = Get-NetTCPConnection -State Listen -LocalPort !PORT! -ErrorAction SilentlyContinue; if ($connection) { exit 1 } else { exit 0 }"
if errorlevel 1 (
    set /a PORT+=1
    goto find_port
)

echo [INFO] Запускаю Next.js на http://localhost:!PORT! ...
start "Колючка Server" /D "%~dp0" cmd /k "set PORT=!PORT!&& npm run dev -- --hostname 0.0.0.0 --port !PORT!"

echo [INFO] Жду запуска сервера...
set /a ATTEMPTS=0
:wait_for_server
timeout /t 1 /nobreak >nul
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:!PORT!/login' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    set /a ATTEMPTS+=1
    if !ATTEMPTS! LSS 30 goto wait_for_server
)

echo [INFO] Открываю приложение в браузере...
start "" "http://localhost:!PORT!/login"

echo.
echo Сервер запущен на порту !PORT! в отдельном окне.
echo Для телефона используйте адрес компьютера в локальной сети:
ipconfig | findstr /i "IPv4"
echo Например: http://192.168.1.25:!PORT!/login
echo Телефон и компьютер должны быть подключены к одной Wi-Fi сети.
echo Для остановки закройте окно "Колючка Server".
echo.
endlocal
