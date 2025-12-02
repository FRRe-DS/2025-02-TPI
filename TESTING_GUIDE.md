# 🧪 Scripts de Testing - API Stock

## Testing Manual de Endpoints

### 📦 Productos

```powershell
# Listar productos (paginado)
Invoke-WebRequest -Uri "http://localhost/api/v1/productos?page=1&limit=10" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Buscar productos por nombre
Invoke-WebRequest -Uri "http://localhost/api/v1/productos?q=laptop" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Obtener un producto específico
Invoke-WebRequest -Uri "http://localhost/api/v1/productos/1" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Filtrar por categoría
Invoke-WebRequest -Uri "http://localhost/api/v1/productos?categoriaId=1" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

### 🏷️ Categorías

```powershell
# Listar todas las categorías
Invoke-WebRequest -Uri "http://localhost/api/v1/categorias" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Obtener una categoría específica
Invoke-WebRequest -Uri "http://localhost/api/v1/categorias/1" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

### 📋 Reservas

```powershell
# Listar todas las reservas (requiere fechaInicio y fechaFin)
Invoke-WebRequest -Uri "http://localhost/api/v1/reservas?fechaInicio=2024-01-01&fechaFin=2024-12-31" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Obtener una reserva específica
Invoke-WebRequest -Uri "http://localhost/api/v1/reservas/1" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

## 🔍 Ver Logs en Tiempo Real

```powershell
# Ver logs del backend de Stock
docker logs -f stock-backend

# Ver logs del API Gateway
docker logs -f api-gateway

# Ver logs del backend de Compras
docker logs -f compras-backend

# Ver logs de Keycloak
docker logs -f keycloak
```

---

## 🐛 Debugging

### Ver última petición en el backend

```powershell
docker logs --tail 20 stock-backend
```

### Reiniciar un servicio específico

```powershell
# Reiniciar backend de Stock
docker-compose restart backend

# Reiniciar API Gateway
docker-compose restart api-gateway

# Reiniciar frontend
docker-compose restart frontend
```

### Reconstruir y reiniciar un servicio

```powershell
# Reconstruir backend
docker-compose up -d --build backend

# Reconstruir API Gateway
docker-compose up -d --build api-gateway
```

---

## 📊 Verificar estado de contenedores

```powershell
# Ver todos los contenedores
docker ps

# Ver contenedores detenidos
docker ps -a

# Ver uso de recursos
docker stats
```

---

## 🔥 Logs con formato en el backend

Ahora el backend de Stock tiene logging detallado. Cada request mostrará:

```javascript
🔥 INCOMING REQUEST: {
  method: 'GET',
  path: '/api/v1/productos',
  url: '/api/v1/productos?page=1&limit=3',
  headers: {
    authorization: undefined,
    'content-type': undefined,
    origin: undefined
  },
  query: { page: '1', limit: '3' },
  body: 'empty'
}
```

---

## 📝 Testing desde Compras

El backend de Compras debe hacer llamadas como:

```python
import requests

# ✅ CORRECTO
response = requests.get("http://api-gateway/api/v1/productos", params={"page": 1, "limit": 10})

# ❌ INCORRECTO (lo que están haciendo ahora)
response = requests.get("http://api-gateway/stock/api/product/", params={"page": 1, "limit": 10})
```

---

## 🎯 Quick Test

Para verificar rápidamente si todo funciona:

```powershell
# Test rápido de productos
Invoke-WebRequest -Uri "http://localhost/api/v1/productos?page=1&limit=3" -Method Get

# Si devuelve Status 200, está funcionando ✅
# Si devuelve Status 404, hay un problema de ruteo ❌
# Si devuelve Status 500, hay un error en el backend ❌
```
