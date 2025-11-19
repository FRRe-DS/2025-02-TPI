# 📋 Integración Docker - Configuración por Grupo

## 🎯 Arquitectura General

Cada grupo tiene su propio Docker con:
- **Puerto interno del backend**: 8000 (dentro del contenedor)
- **Puerto externo del backend**: 
  - Grupo 1 (Compras): 4001
  - Grupo 2 (Stock): 4000
  - Grupo 3 (Logística): 4002

El **API Gateway (Nginx)** redirige según la ruta:
- `/compras/*` → Backend Grupo 1 (puerto 4001)
- `/stock/*` → Backend Grupo 2 (puerto 4000)
- `/logistica/*` → Backend Grupo 3 (puerto 4002)

---

## 🔧 Configuración Grupo 1 - COMPRAS

### En su `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "4001:8000"  # Puerto externo 4001, interno 8000
```

### En `api-gateway/nginx.conf` (líneas 25-28):

```nginx
upstream compras-backend {
    server host.docker.internal:4001;
    # O si están en la misma red Docker:
    # server backend-compras:8000;
}
```

---

## 🔧 Configuración Grupo 2 - STOCK (NOSOTROS)

### ✅ Ya configurado

**NO MODIFICAR** la sección de stock en `api-gateway/nginx.conf`

```nginx
upstream stock-backend {
    server backend-stock:4000;  # Usa nombre del contenedor
}
```

Nuestro `docker-compose.yml`:
```yaml
backend:
  container_name: backend-stock
  ports:
    - "4000:4000"
```

---

## 🔧 Configuración Grupo 3 - LOGÍSTICA

### En su `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "4002:8000"  # Puerto externo 4002, interno 8000
```

### En `api-gateway/nginx.conf` (líneas 37-40):

```nginx
upstream logistica-backend {
    server host.docker.internal:4002;
    # O si están en la misma red Docker:
    # server backend-logistica:8000;
}
```

---

## 🌐 Opciones de Integración

### Opción 1: Todos en una máquina (Desarrollo)

Cada grupo levanta su Docker en la misma máquina:

```powershell
# Grupo 1
cd ruta/grupo-compras
docker-compose up -d

# Grupo 2
cd ruta/grupo-stock
docker-compose up -d

# Grupo 3
cd ruta/grupo-logistica
docker-compose up -d

# API Gateway (lo levanta cualquier grupo o todos tienen la misma config)
cd ruta/api-gateway
docker-compose up -d
```

**Configuración de nginx.conf:**
```nginx
upstream compras-backend {
    server host.docker.internal:4001;
}
upstream stock-backend {
    server host.docker.internal:4000;
}
upstream logistica-backend {
    server host.docker.internal:4002;
}
```

---

### Opción 2: Cada grupo en su máquina (Producción/Demo)

Cada grupo levanta su Docker en su propia máquina y comparten IPs.

**Grupo 1 (IP: 192.168.1.10):**
```powershell
docker-compose up -d  # Backend en puerto 4001
```

**Grupo 2 (IP: 192.168.1.11):**
```powershell
docker-compose up -d  # Backend en puerto 4000
```

**Grupo 3 (IP: 192.168.1.12):**
```powershell
docker-compose up -d  # Backend en puerto 4002
```

**Configuración de nginx.conf (todos actualizan):**
```nginx
upstream compras-backend {
    server 192.168.1.10:4001;
}
upstream stock-backend {
    server 192.168.1.11:4000;
}
upstream logistica-backend {
    server 192.168.1.12:4002;
}
```

Cada grupo levanta el API Gateway con esta configuración.

---

### Opción 3: Docker Hub + Docker Compose unificado

Todos suben sus imágenes a Docker Hub y usan un único `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Grupo 1 - Compras
  backend-compras:
    image: usuario_dockerhub/compras-backend:latest
    ports:
      - "4001:8000"
    networks:
      - app-network

  # Grupo 2 - Stock
  backend-stock:
    image: usuario_dockerhub/stock-backend:latest
    ports:
      - "4000:4000"
    networks:
      - app-network

  # Grupo 3 - Logística
  backend-logistica:
    image: usuario_dockerhub/logistica-backend:latest
    ports:
      - "4002:8000"
    networks:
      - app-network

  # API Gateway
  api-gateway:
    image: usuario_dockerhub/api-gateway:latest
    ports:
      - "80:80"
    depends_on:
      - backend-compras
      - backend-stock
      - backend-logistica
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Configuración de nginx.conf:**
```nginx
upstream compras-backend {
    server backend-compras:8000;
}
upstream stock-backend {
    server backend-stock:4000;
}
upstream logistica-backend {
    server backend-logistica:8000;
}
```

---

## ✅ Testing

### Health checks:
```powershell
# API Gateway
curl http://localhost/health

# Compras
curl http://localhost/compras/health

# Stock
curl http://localhost/stock/

# Logística
curl http://localhost/logistica/health
```

---

## 📝 Checklist de Integración

- [ ] **Grupo 1**: Confirmar puerto externo 4001
- [ ] **Grupo 2**: ✅ Puerto 4000 configurado
- [ ] **Grupo 3**: Confirmar puerto externo 4002
- [ ] Todos: Actualizar `nginx.conf` con IPs o nombres de contenedor
- [ ] Todos: Subir imágenes a Docker Hub (opcional)
- [ ] Testing: Verificar que todas las rutas funcionan
- [ ] CORS: Verificar que cada backend acepte peticiones del API Gateway

---

## 🐛 Troubleshooting

### Backend no responde:
```powershell
# Ver logs
docker logs backend-compras
docker logs backend-stock
docker logs backend-logistica

# Verificar que el contenedor está corriendo
docker ps
```

### API Gateway no puede conectar:
```powershell
# Ver logs de nginx
docker logs api-gateway

# Verificar configuración
docker exec -it api-gateway cat /etc/nginx/nginx.conf

# Test de conectividad dentro del contenedor
docker exec -it api-gateway wget -O- http://backend-stock:4000
```

### Puerto en uso:
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :4000

# Cambiar puerto en docker-compose.yml
ports:
  - "4003:8000"  # Usar puerto diferente
```
