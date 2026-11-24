// Almacén de mentira. Un archivo cuyo nombre contenga "falla" es rechazado,
// para poder probar el aviso de error de subida.
const urls = new Map();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function getStorage() {
  return {};
}
export function ref(_storage, path) {
  return { path };
}
export async function uploadBytes(r, file) {
  await wait(120);
  if (/falla/i.test(r.path)) {
    const err = new Error('rechazado');
    err.code = 'storage/unauthorized';
    throw err;
  }
  urls.set(r.path, URL.createObjectURL(file));
  return {};
}
export async function getDownloadURL(r) {
  return urls.get(r.path) || '';
}
export async function deleteObject(r) {
  console.info('[mock] archivo borrado:', r.path);
  urls.delete(r.path);
}
