import imageCompression from 'browser-image-compression';

/**
 * Tres versiones se generan de cada foto, todas en el navegador
 * antes de subir nada:
 *
 *   miniatura  400px  ~50KB   → cuadrícula de la galería
 *   pantalla  2560px  ~1.5MB  → visor y editor
 *   original  intacto         → descarga (no pasa por aquí)
 */

// Versión de pantalla: la que se ve al abrir una foto.
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2560,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.9,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error comprimiendo la imagen:', error);
    return file;
  }
}

// Miniatura: diminuta a propósito, para que la cuadrícula vuele.
export function generateThumbnail(file) {
  return imageCompression(file, {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}

// Limpia el nombre para que sea seguro en una cabecera HTTP.
export function safeFilename(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.\- ]/g, '_')
    .slice(0, 120);
}

// Tamaño legible: 8.4 MB, 512 KB...
export function formatBytes(bytes) {
  if (!bytes || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
