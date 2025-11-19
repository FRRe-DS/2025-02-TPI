# Guía de Docker Hub - Integración Grupos

## 📦 Subir imágenes a Docker Hub

### Paso 1: Login en Docker Hub
```powershell
docker login
# Ingresar usuario y password de Docker Hub
```

### Paso 2: Etiquetar las imágenes

```powershell
# Backend Stock (Grupo 2)
docker tag 2025-02-tpi-backend TU_USUARIO_DOCKERHUB/stock-backend:latest

# Frontend Stock (Grupo 2)
docker tag 2025-02-tpi-frontend TU_USUARIO_DOCKERHUB/stock-frontend:latest

# API Gateway (compartido)
docker tag 2025-02-tpi-api-gateway TU_USUARIO_DOCKERHUB/api-gateway:latest
```

### Paso 3: Push a Docker Hub

```powershell
# Subir Backend
docker push TU_USUARIO_DOCKERHUB/stock-backend:latest

# Subir Frontend
docker push TU_USUARIO_DOCKERHUB/stock-frontend:latest

# Subir API Gateway
docker push TU_USUARIO_DOCKERHUB/api-gateway:latest
```

## 🔄 Para que otros grupos usen tus imágenes

En su `docker-compose.yml` reemplazarán:
```yaml
backend:
  build:
    context: ./mi-app-backend
  # Por:
  image: TU_USUARIO_DOCKERHUB/stock-backend:latest
```

## 📋 Información para compartir con otros grupos

**Usuario Docker Hub:** [TU_USUARIO_DOCKERHUB]

**Imágenes disponibles:**
- `TU_USUARIO_DOCKERHUB/stock-backend:latest`
- `TU_USUARIO_DOCKERHUB/stock-frontend:latest`
- `TU_USUARIO_DOCKERHUB/api-gateway:latest`

**Puertos usados:**
- Backend: 4000
- Frontend: 3000
- Keycloak: 8081

**Configuración necesaria:**

Variables de entorno en `.env`:
```env
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_key
SESSION_SECRET=tu_secret
KEYCLOAK_CLIENT_SECRET=tu_secret
```

## 🌐 Arquitectura integrada

```
                    API Gateway (Puerto 80)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   /compras/*          /stock/*          /logistica/*
        │                   │                   │
        ▼                   ▼                   ▼
  Backend G1          Backend G2          Backend G3
  (Puerto 4001)       (Puerto 4000)       (Puerto 4002)
```

## 🔧 Para otros grupos: Configurar el API Gateway

1. **Grupo 1 (Compras)**: Editar `api-gateway/nginx.conf` línea 25-28
   ```nginx
   upstream compras-backend {
       server IP_GRUPO_1:4001;
   }
   ```

2. **Grupo 3 (Logística)**: Editar `api-gateway/nginx.conf` línea 37-40
   ```nginx
   upstream logistica-backend {
       server IP_GRUPO_3:4002;
   }
   ```

## ✅ Verificar funcionamiento

```powershell
# Health check del API Gateway
curl http://localhost/health

# Test endpoint de Stock
curl http://localhost/stock/api/v1/productos

# Test endpoint de Compras
curl http://localhost/compras/...

# Test endpoint de Logística
curl http://localhost/logistica/...
```
