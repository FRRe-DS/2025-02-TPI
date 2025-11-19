FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto (nginx ya está configurado en la imagen base)
CMD ["nginx", "-g", "daemon off;"]
