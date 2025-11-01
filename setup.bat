@echo off
echo ========================================
echo   GameShelf - Setup Automático
echo ========================================
echo.

echo [1/4] Instalando dependencias del proyecto raíz...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del proyecto raíz
    pause
    exit /b 1
)
echo ✅ Dependencias del proyecto raíz instaladas
echo.

echo [2/4] Instalando dependencias del backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend instaladas
echo.

echo [3/4] Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del frontend instaladas
echo.

echo [4/4] Configurando variables de entorno...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Archivo .env creado en backend/
    echo ⚠️  RECUERDA configurar tus variables de entorno en backend/.env
) else (
    echo ✅ Archivo .env ya existe en backend/
)
echo.

echo ========================================
echo   ✅ Setup completado exitosamente!
echo ========================================
echo.
echo Para iniciar el proyecto:
echo   .\start.bat
echo.
echo Credenciales de prueba (con MongoDB):
echo   Email: admin@gameshelf.com
echo   Password: Admin123!
echo.
echo Para desplegar en producción, sigue las instrucciones en README.md
echo.
pause
