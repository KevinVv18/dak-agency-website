# 🚀 Guía de Deploy - DAK Agency

## 📝 **PROBLEMA 1: LOGOS CORRUPTOS** ✅ SOLUCIONADO

Los logos del Hero estaban desactualizados. Ya están actualizados con los 6 clientes correctos:
- ✅ Berse Line
- ✅ Gran Oportunidad GO!
- ✅ Dra. Jenny
- ✅ Manuel Pardo
- ✅ Prosadis
- ✅ Spa Kreativos

---

## 🌐 **DEPLOY A HOSTINGER**

### **Opción 1: Deploy Manual (Más Seguro)**

#### **Paso 1: Hacer Build Local**
```bash
cd "c:\Users\kevin\OneDrive\Documents\PROJECTOS IA\dak-source"
npm run build
```

Esto crea la carpeta `dist/` con archivos optimizados.

#### **Paso 2: Subir a Hostinger**

**Método A - FTP/File Manager:**
1. Entra a **https://hpanel.hostinger.com/**
2. Ve a **Files** → **File Manager**
3. Navega a `public_html/`
4. Sube TODO el contenido de la carpeta `dist/`
5. ¡Listo! Tu sitio está actualizado

**Método B - Git Deploy (Automático):**
Ve a la Opción 2 abajo ↓

---

### **Opción 2: Deploy Automático con Git + GitHub Actions**

#### **Paso 1: Configurar Git Localmente**

```bash
cd "c:\Users\kevin\OneDrive\Documents\PROJECTOS IA\dak-source"

# Configurar tu identidad (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Inicializar repo (si no está inicializado)
git init

# Agregar remote (tu repositorio ya existe)
git remote add origin https://github.com/KevinVv18/dak-agency-website.git

# O si ya existe, actualizarlo:
git remote set-url origin https://github.com/KevinVv18/dak-agency-website.git
```

#### **Paso 2: Hacer Push a GitHub**

```bash
# Ver cambios
git status

# Agregar todos los archivos modificados
git add .

# Hacer commit
git commit -m "Actualización: Nueva sección de proyectos con carruseles"

# Push a GitHub
git push -u origin main
```

**Si te pide login:**
- GitHub ya no usa contraseñas en la terminal
- Necesitas un **Personal Access Token (PAT)**

**Crear PAT:**
1. Ve a: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Dale un nombre: "DAK Deploy"
4. Marca: `repo` (todos los permisos)
5. Click **Generate token**
6. **COPIA EL TOKEN** (solo lo verás una vez)
7. Úsalo como contraseña cuando hagas `git push`

---

### **Opción 3: Deploy Directo con Hostinger Git**

Hostinger tiene **Git Deploy** integrado:

#### **Paso 1: Configurar en Hostinger**

1. Entra a **https://hpanel.hostinger.com/**
2. Ve a tu sitio web
3. Click en **Git** (en el menú lateral)
4. Click **Connect to Git**
5. Conecta tu cuenta de GitHub
6. Selecciona el repo: `KevinVv18/dak-agency-website`
7. Branch: `main`
8. Deploy path: `/public_html`

#### **Paso 2: Configurar Build Commands**

En la configuración de Git en Hostinger:
```bash
# Build command:
npm install && npm run build

# Deploy path:
dist
```

#### **Paso 3: Deploy Automático**

Ahora cada vez que hagas `git push` a GitHub, Hostinger detectará el cambio y actualizará automáticamente tu sitio.

---

## 🔐 **CREDENCIALES DE HOSTINGER**

Para acceder a tu Hostinger:

1. **URL de login:** https://hpanel.hostinger.com/
2. **Email:** El que usaste al registrarte
3. **Contraseña:** Tu contraseña de Hostinger

Si olvidaste tu contraseña:
- Click en "Forgot Password"
- Te enviarán un link de recuperación

---

## 📦 **FLUJO DE TRABAJO RECOMENDADO**

### **Desarrollo Local:**
```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev  # http://localhost:3000

# 3. Hacer commit
git add .
git commit -m "Descripción de cambios"

# 4. Push a GitHub
git push origin main

# 5. (Opcional) Build y deploy manual
npm run build
# Subir dist/ a Hostinger vía File Manager
```

---

## 🛠️ **COMANDOS ÚTILES**

### **Ver estado de Git:**
```bash
git status
git log --oneline -5  # Últimos 5 commits
```

### **Ver remote configurado:**
```bash
git remote -v
```

### **Actualizar desde GitHub:**
```bash
git pull origin main
```

### **Deshacer cambios locales:**
```bash
git checkout .  # Deshacer cambios no guardados
git reset HEAD~1  # Deshacer último commit (mantiene cambios)
```

---

## ⚡ **SCRIPT RÁPIDO DE DEPLOY**

Crea este archivo: `deploy.bat` en la raíz del proyecto:

```batch
@echo off
echo.
echo ========================================
echo   DEPLOY DAK AGENCY
echo ========================================
echo.

echo [1/4] Verificando cambios...
git status

echo.
set /p commit_msg="Mensaje de commit: "

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
echo   DEPLOY COMPLETADO
echo ========================================
echo.
echo Si configuraste Git Deploy en Hostinger,
echo tu sitio se actualizara automaticamente.
echo.
pause
```

Luego solo haz **doble click en `deploy.bat`** para hacer todo automático.

---

## 🔍 **TROUBLESHOOTING**

### **Error: "git not found"**
```bash
# Verifica que git esté en el PATH
git --version

# Si no funciona, reinicia la terminal
```

### **Error: "Permission denied (publickey)"**
Usa HTTPS en lugar de SSH:
```bash
git remote set-url origin https://github.com/KevinVv18/dak-agency-website.git
```

### **Error: "failed to push"**
```bash
# Pull primero, luego push
git pull origin main --rebase
git push origin main
```

### **Archivos muy pesados**
```bash
# Ver tamaño del repo
git count-objects -vH

# Si es muy grande, limpia el historial o usa Git LFS
```

---

## 📞 **SOPORTE HOSTINGER**

- **Live Chat:** Disponible 24/7 en hpanel.hostinger.com
- **Email:** support@hostinger.com
- **Tutoriales:** https://support.hostinger.com/

---

**¡Listo para deploy!** 🚀
