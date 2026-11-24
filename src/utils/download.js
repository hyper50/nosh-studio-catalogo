// Descarga de varios originales seguidos.
//
// Los originales se guardaron con `Content-Disposition: attachment`, así que
// basta con cargar cada enlace en un marco oculto para que el navegador lo
// descargue, sin salir de la app y sin configurar CORS en el almacén. El
// navegador pregunta una vez si permite varias descargas desde esta página.
const GAP_MS = 700;

export function downloadOriginals(photos) {
  const withOriginal = photos.filter((p) => p.originalUrl);
  withOriginal.forEach((photo, i) => {
    setTimeout(() => {
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.src = photo.originalUrl;
      document.body.appendChild(frame);
      setTimeout(() => frame.remove(), 120000);
    }, i * GAP_MS);
  });
  return { started: withOriginal.length, missing: photos.length - withOriginal.length };
}
