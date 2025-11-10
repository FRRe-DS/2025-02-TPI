# 🔐 Guía de Configuración de Keycloak - Para Compañeros

## 📋 Pre-requisitos

- Docker Desktop instalado y corriendo

---

## 🚀 Paso 1: Levantar Keycloak

1. Abre PowerShell o Git Bash

2. Ve a la carpeta de Keycloak:
```bash
cd c:\repo\2025-02-TPI\2025-TPI\keycloak
```

3. Levanta el contenedor de Keycloak:
```bash
docker-compose up -d
```

4. Espera 1-2 minutos a que Keycloak inicie completamente

5. Verifica que esté corriendo:
```bash
docker ps
```
Deberías ver un contenedor con puerto `8080`

6. Abre en el navegador:
```
http://localhost:8080
```

---

## 🔑 Paso 2: Acceder al Admin Console

1. Click en **"Administration Console"**

2. Login con credenciales por defecto:
   - **Usuario:** `admin`
   - **Password:** `admin`

---

## 🏗️ Paso 3: Crear el Realm

1. En la esquina superior izquierda, click en el **dropdown** donde dice "master"

2. Click en **"Create realm"**

3. En el campo **"Realm name"**, escribe: `ds-2025-realm`

4. Click en **"Create"**

---

## 👥 Paso 4: Crear Roles

1. En el menú lateral izquierdo, click en **"Realm roles"**

2. Click en **"Create role"**

3. Crear el primer rol:
   - **Role name:** `compras-be`
   - Click **"Save"**

4. Repetir para crear los otros roles:
   - Click en **"Create role"** nuevamente
   - **Role name:** `logistica-be`
   - Click **"Save"**

5. Crear el tercer rol:
   - Click en **"Create role"** nuevamente
   - **Role name:** `stock-be`
   - Click **"Save"**

---

## 🔧 Paso 5: Crear el Cliente

1. En el menú lateral izquierdo, click en **"Clients"**

2. Click en **"Create client"**

3. En la pestaña **"General Settings"**:
   - **Client type:** `OpenID Connect`
   - **Client ID:** `grupo-02`
   - Click **"Next"**

4. En la pestaña **"Capability config"**:
   - ✅ **Client authentication:** OFF
   - ✅ **Authorization:** OFF
   - ✅ **Standard flow:** ON (checked)
   - ✅ **Direct access grants:** ON (checked)
   - Click **"Next"**

5. En la pestaña **"Login settings"**:
   - **Valid redirect URIs:** `http://localhost:3000/*`
   - **Valid post logout redirect URIs:** `http://localhost:3000/*`
   - **Web origins:** `http://localhost:3000`
   - Click **"Save"**

---

## 👤 Paso 6: Crear Usuarios

### Usuario 1: kraken (Admin/Stock)

1. En el menú lateral, click en **"Users"**

2. Click en **"Create new user"**

3. Llenar los campos:
   - **Username:** `kraken`
   - ✅ **Email verified:** ON
   - Click **"Create"**

4. Asignar contraseña:
   - Ve a la pestaña **"Credentials"**
   - Click en **"Set password"**
   - **Password:** `password`
   - **Password confirmation:** `password`
   - ⚠️ **Temporary:** OFF (desactivado)
   - Click **"Save"**
   - Confirmar en el diálogo

5. Asignar rol:
   - Ve a la pestaña **"Role mappings"**
   - Click en **"Assign role"**
   - Busca y selecciona `stock-be`
   - Click **"Assign"**

### Usuario 2: pesuti (Compras)

1. Click en **"Users"** en el menú lateral

2. Click en **"Create new user"**

3. Llenar:
   - **Username:** `pesuti`
   - ✅ **Email verified:** ON
   - Click **"Create"**

4. Asignar contraseña:
   - Pestaña **"Credentials"**
   - **Set password**
   - **Password:** `password`
   - **Temporary:** OFF
   - **Save**

5. Asignar rol:
   - Pestaña **"Role mappings"**
   - **Assign role**
   - Seleccionar `compras-be`
   - **Assign**

### Usuario 3: test-user (Logística)

1. Click en **"Users"** → **"Create new user"**

2. Llenar:
   - **Username:** `test-user`
   - ✅ **Email verified:** ON
   - Click **"Create"**

3. Asignar contraseña:
   - Pestaña **"Credentials"**
   - **Set password**
   - **Password:** `password`
   - **Temporary:** OFF
   - **Save**

4. Asignar rol:
   - Pestaña **"Role mappings"**
   - **Assign role**
   - Seleccionar `logistica-be`
   - **Assign**

---

## ⏰ Paso 7 (Opcional): Aumentar Duración de Tokens

Por defecto los tokens expiran en 5 minutos, lo cual es muy poco para desarrollo:

1. En el menú lateral, click en **"Realm settings"**

2. Ve a la pestaña **"Tokens"**

3. Cambiar:
   - **Access Token Lifespan:** de `5 minutes` a `30 minutes` o `1 hour`

4. Click **"Save"**

---

## ✅ Paso 8: Verificar la Configuración

### Verificar Roles:

1. En el menú lateral izquierdo, click en **"Realm roles"**
2. Deberías ver:
   - `compras-be`
   - `logistica-be`
   - `stock-be`

### Verificar Usuarios:

1. En el menú lateral, click en **"Users"**
2. Deberías ver los usuarios:
   - `kraken` (password: `password`) → rol `stock-be`
   - `pesuti` (password: `password`) → rol `compras-be`
   - `test-user` (password: `password`) → rol `logistica-be`

### Verificar Cliente:

1. En el menú lateral, click en **"Clients"**
2. Busca el cliente **"grupo-02"**
3. Click en él y verifica:
   - **Valid redirect URIs:** `http://localhost:3000/*`
   - **Web origins:** `http://localhost:3000`

---

## 🔧 Paso 5: Configurar Variables de Entorno

### Frontend:

Abre `frontend/.env.local` y verifica que tenga:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ds-2025-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=grupo-02
```

### Backend:

Abre `mi-app-backend/.env` y verifica que tenga:

```bash
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ds-2025-realm
KEYCLOAK_CLIENT_ID=grupo-02
```

---

## 🧪 Paso 6: Probar que Funciona

### Iniciar Backend:

```bash
cd c:\repo\2025-02-TPI\mi-app-backend
npm run dev
```

Deberías ver: `Servidor corriendo en http://localhost:4000`

### Iniciar Frontend:

```bash
cd c:\repo\2025-02-TPI\frontend
npm run dev
```

Deberías ver: `Ready on http://localhost:3000`

### Probar Login:

1. Abre `http://localhost:3000`
2. Click en **"Ingresar con Keycloak"**
3. Login con:
   - Usuario: `kraken`
   - Password: `password`
4. Deberías ser redirigido a `/admin` (Portal de Administración)

---

## 🔄 Opcional: Cambiar Duración de Tokens

Si los tokens expiran muy rápido (5 minutos):

1. En Keycloak Admin Console
2. **Realm settings** → Pestaña **"Tokens"**
3. Cambiar **"Access Token Lifespan"**: de `5 minutes` a `30 minutes` o `1 hour`
4. Click **"Save"**

---

## ❓ Problemas Comunes

### Error: "Failed to fetch" en el frontend

**Solución:**
- Verifica que Keycloak esté corriendo: `docker ps`
- Verifica que puedas acceder a `http://localhost:8080`

### Error: "Access denied" en el backend

**Solución:**
- Verifica que el usuario tenga el rol asignado en Keycloak
- Regenera el token (los tokens expiran)

### Error: "Cannot connect to Keycloak"

**Solución:**
- Reinicia el contenedor de Keycloak:
```bash
cd c:\repo\2025-02-TPI\2025-TPI\keycloak
docker-compose restart
```

---

## 📞 Necesitas Ayuda?

Si algo no funciona:

1. Verifica que Docker esté corriendo
2. Verifica que todos los servicios estén en los puertos correctos:
   - Keycloak: `8080`
   - Backend: `4000`
   - Frontend: `3000`
3. Revisa los logs:
```bash
docker-compose logs keycloak
```

---

¡Listo para trabajar! 🚀
