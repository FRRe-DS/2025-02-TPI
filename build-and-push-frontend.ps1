# Script para construir y publicar el frontend a GitHub Container Registry
# Asegúrate de estar autenticado con: docker login ghcr.io

Write-Host "Construyendo imagen del frontend..." -ForegroundColor Cyan

# Construir la imagen
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost/stock/api --build-arg NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080 --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=ds-2025-realm --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=grupo-02 -t ghcr.io/frre-ds/frontend-stock-g02:latest -f .\frontend\Dockerfile .\frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Imagen construida exitosamente" -ForegroundColor Green
    Write-Host "Publicando imagen a GHCR..." -ForegroundColor Cyan
    
    docker push ghcr.io/frre-ds/frontend-stock-g02:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Imagen publicada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al publicar. Autentica con: docker login ghcr.io" -ForegroundColor Red
    }
} else {
    Write-Host "Error al construir la imagen" -ForegroundColor Red
}
