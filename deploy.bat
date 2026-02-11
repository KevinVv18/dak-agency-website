@echo off
echo.
echo ========================================
echo   DEPLOY DAK AGENCY A GITHUB
echo ========================================
echo.

echo [1/4] Verificando cambios...
git status

echo.
set /p commit_msg="Escribe el mensaje de commit: "

echo.
echo [2/4] Agregando archivos...
git add .

echo.
echo [3/4] Haciendo commit...
git commit -m "%commit_msg%"

echo.
echo [4/4] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo   DEPLOY COMPLETADO!
echo ========================================
echo.
echo Tu codigo esta en GitHub.
echo Si configuraste Git Deploy en Hostinger,
echo tu sitio se actualizara automaticamente en unos minutos.
echo.
echo Para verificar:
echo - GitHub: https://github.com/KevinVv18/dak-agency-website
echo - Hostinger: https://hpanel.hostinger.com/
echo.
pause
