# Instrucciones para ejecutar el proyecto

## Paso 1: Reiniciar el Backend

En la terminal del backend, presiona:
```
Ctrl + C
```

Luego ejecuta:
```bash
npm run dev
```

## Paso 2: Reiniciar el Frontend

En la terminal del frontend, presiona:
```
Ctrl + C
```

Luego ejecuta:
```bash
npm run dev
```

## Paso 3: Acceder a la aplicación

- **Frontend**: http://localhost:3001 (o el puerto que indique)
- **Backend**: http://localhost:3000
- **Keycloak**: http://localhost:8080

## Solución de Problemas

Si aún ves errores:

### Error: "Web Crypto API is not available"
- Asegúrate de acceder a `http://localhost:3001` (no a una IP diferente)
- Si accedes desde otra máquina, cambiar `NEXT_PUBLIC_API_URL` en `.env.local`

### Error: "Original file outside project"
- Este error generalmente se debe a problemas con rutas y espacios
- Los cambios realizados deberían haber solucionado esto

### Error: "Error al obtener productos"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Abre la consola del navegador (F12) y mira la pestaña "Network"
- Verifica que la petición a `/api/v1/productos` sea exitosa

## Pasos de verificación

1. Abre http://localhost:3000 en el navegador
   - Deberías ver: "¡El servidor esta vivo!"

2. Abre http://localhost:3001 en el navegador
   - Deberías ver la página de login

3. Inicia sesión con tus credenciales de Keycloak

4. Si ves la lista de productos, ¡todo funciona! 🎉
