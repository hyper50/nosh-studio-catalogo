import { db, storage } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

export const TRASH_DAYS = 30;

export function trashCutoff() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TRASH_DAYS);
  return cutoff;
}

// Borra definitivamente una foto: sus tres archivos de Storage y el documento.
// Un archivo que ya no existe cuenta como borrado. Si otro archivo falla, el
// documento se conserva para reintentarlo más tarde y no dejar archivos huérfanos,
// salvo que se pida `force` (borrado manual desde la papelera).
export async function deletePhotoForever(photo, { force = false } = {}) {
  let allFilesGone = true;
  for (const path of [photo.storagePath, photo.thumbnailPath, photo.originalPath]) {
    if (!path) continue;
    try {
      await deleteObject(ref(storage, path));
    } catch (e) {
      if (e?.code === 'storage/object-not-found') continue;
      allFilesGone = false;
      console.error(`No se pudo borrar ${path}:`, e);
    }
  }
  if (!allFilesGone && !force) return false;
  await deleteDoc(doc(db, 'photos', photo.id));
  return true;
}

// Elimina las fotos que llevan más de 30 días en la papelera.
// Se lanza una vez al iniciar sesión; no bloquea la carga de la app.
export async function purgeExpiredTrash() {
  const snap = await getDocs(query(collection(db, 'photos'), where('deleted', '==', true)));
  const cutoff = trashCutoff().getTime();
  const expired = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => {
      const t = new Date(p.deletedAt).getTime();
      return !Number.isNaN(t) && t <= cutoff;
    });

  let removed = 0;
  for (const photo of expired) {
    try {
      if (await deletePhotoForever(photo)) removed++;
    } catch (e) {
      console.error(`No se pudo eliminar la foto ${photo.id}:`, e);
    }
  }
  return removed;
}
