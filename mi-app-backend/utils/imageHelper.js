// Helper para validar y procesar URLs de imágenes
// Ubicación: mi-app-backend/utils/imageHelper.js

/**
 * Valida que una URL de imagen sea válida
 */
export const validarUrlImagen = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Validar que sea una URL válida
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Validar que sea de GitHub o CDN permitido
  const dominiosPermitidos = [
    'raw.githubusercontent.com',
    'cdn.jsdelivr.net',
    'github.com',
    'githubusercontent.com'
  ];

  const urlObj = new URL(url);
  const esPermitido = dominiosPermitidos.some(dominio => 
    urlObj.hostname.includes(dominio)
  );

  if (!esPermitido) {
    return false;
  }

  // Validar extensión de archivo
  const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const tieneExtensionValida = extensionesPermitidas.some(ext => 
    url.toLowerCase().endsWith(ext)
  );

  return tieneExtensionValida;
};

/**
 * Valida un array de objetos de imagen según el schema de OpenAPI
 */
export const validarImagenes = (imagenes) => {
  if (!Array.isArray(imagenes)) {
    return { valido: false, error: 'imagenes debe ser un array' };
  }

  if (imagenes.length === 0) {
    return { valido: true }; // Array vacío es válido
  }

  // Verificar que haya exactamente una imagen principal
  const imagenesPrincipales = imagenes.filter(img => img.esPrincipal === true);
  if (imagenesPrincipales.length > 1) {
    return { 
      valido: false, 
      error: 'Solo puede haber una imagen marcada como principal' 
    };
  }

  // Validar cada imagen
  for (let i = 0; i < imagenes.length; i++) {
    const img = imagenes[i];

    // Validar estructura
    if (!img.url || typeof img.esPrincipal !== 'boolean') {
      return { 
        valido: false, 
        error: `Imagen ${i}: debe tener 'url' (string) y 'esPrincipal' (boolean)` 
      };
    }

    // Validar URL
    if (!validarUrlImagen(img.url)) {
      return { 
        valido: false, 
        error: `Imagen ${i}: URL inválida o no permitida: ${img.url}` 
      };
    }
  }

  return { valido: true };
};

/**
 * Convierte URL raw de GitHub a URL de CDN (más rápida)
 */
export const convertirACDN = (url) => {
  if (!url) return url;

  // Convertir raw.githubusercontent.com a cdn.jsdelivr.net
  // Ejemplo:
  // De: https://raw.githubusercontent.com/user/repo/main/image.jpg
  // A:  https://cdn.jsdelivr.net/gh/user/repo@main/image.jpg
  
  const regex = /^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;
  const match = url.match(regex);
  
  if (match) {
    const [, owner, repo, branch, path] = match;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
  }

  return url; // Si no es raw.githubusercontent.com, devolver original
};

/**
 * Procesa array de imágenes: valida y convierte a CDN
 */
export const procesarImagenes = (imagenes) => {
  if (!imagenes || !Array.isArray(imagenes)) {
    return [];
  }

  return imagenes.map(img => ({
    ...img,
    url: convertirACDN(img.url)
  }));
};
