// Controlador para información de imágenes
// Ubicación: mi-app-backend/Controladores/imagenesController.js

/**
 * Devuelve información sobre el repositorio de imágenes
 * Útil para que otros equipos sepan dónde están las imágenes
 */
const obtenerInfoImagenes = async (req, res) => {
  try {
    const info = {
      repositorio: {
        owner: process.env.GITHUB_IMAGES_OWNER || 'tu-usuario',
        repo: process.env.GITHUB_IMAGES_REPO || 'stock-images',
        branch: process.env.GITHUB_IMAGES_BRANCH || 'main'
      },
      baseUrls: {
        raw: `https://raw.githubusercontent.com/${process.env.GITHUB_IMAGES_OWNER || 'tu-usuario'}/${process.env.GITHUB_IMAGES_REPO || 'stock-images'}/${process.env.GITHUB_IMAGES_BRANCH || 'main'}`,
        cdn: `https://cdn.jsdelivr.net/gh/${process.env.GITHUB_IMAGES_OWNER || 'tu-usuario'}/${process.env.GITHUB_IMAGES_REPO || 'stock-images'}@${process.env.GITHUB_IMAGES_BRANCH || 'main'}`
      },
      formatosAceptados: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      estructura: {
        productos: '/productos/{producto_id}/{numero}.{ext}',
        ejemplo: '/productos/1/1.jpg'
      },
      notas: [
        'Las URLs de productos ya incluyen la URL completa en el campo imagenes[]',
        'Se recomienda usar las URLs con CDN (cdn.jsdelivr.net) para mejor rendimiento',
        'Solo una imagen por producto puede tener esPrincipal: true'
      ]
    };

    res.status(200).json(info);
  } catch (error) {
    console.error('Error al obtener info de imágenes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

export default { obtenerInfoImagenes };
