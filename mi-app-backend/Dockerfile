# ===================================
# Dockerfile para Backend (Node.js)
# ===================================

# Usar imagen base de Node.js 20
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

    # Copiar package.json y package-lock.json
    COPY package*.json ./

    # Instalar dependencias
    RUN npm install --only=production

    # Copiar el resto del código
    COPY . .

# Exponer puerto 4000
EXPOSE 4000

# Variables de entorno por defecto (se pueden sobrescribir)
ENV NODE_ENV=production
ENV PORT=4000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
