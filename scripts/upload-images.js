// Script para subir imágenes a GitHub y generar URLs
// Usar con: node scripts/upload-images.js

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Personal Access Token
const OWNER = 'tu-usuario'; // Tu usuario de GitHub
const REPO = 'stock-images'; // Nombre del repo de imágenes
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

/**
 * Sube una imagen a GitHub y devuelve la URL raw
 */
async function uploadImage(localPath, remotePath) {
  try {
    const content = fs.readFileSync(localPath, { encoding: 'base64' });
    
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: remotePath,
      message: `Add product image: ${path.basename(remotePath)}`,
      content: content,
      branch: BRANCH
    });

    // URL raw de GitHub
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${remotePath}`;
    
    // URL con CDN (jsDelivr - más rápido)
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${remotePath}`;
    
    console.log(`✅ Imagen subida: ${remotePath}`);
    console.log(`   Raw URL: ${rawUrl}`);
    console.log(`   CDN URL: ${cdnUrl}`);
    
    return { rawUrl, cdnUrl };
  } catch (error) {
    console.error(`❌ Error subiendo ${remotePath}:`, error.message);
    throw error;
  }
}

/**
 * Ejemplo de uso: Subir imágenes de un producto
 */
async function uploadProductImages(productId, imageFiles) {
  const urls = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const localPath = imageFiles[i];
    const ext = path.extname(localPath);
    const remotePath = `productos/${productId}/${i + 1}${ext}`;
    
    const { cdnUrl } = await uploadImage(localPath, remotePath);
    urls.push({
      url: cdnUrl,
      esPrincipal: i === 0 // La primera imagen es principal
    });
  }
  
  return urls;
}

// Ejemplo de uso
// uploadProductImages(1, ['./temp/laptop-front.jpg', './temp/laptop-side.jpg'])
//   .then(urls => console.log('URLs generadas:', JSON.stringify(urls, null, 2)));

export { uploadImage, uploadProductImages };
