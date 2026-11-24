/**
 * Orden de las fotos en la galería.
 *
 * Cada foto tiene una clave numérica: su campo `order` si existe, o la
 * fecha de subida en milisegundos si es una foto antigua sin él.
 * Clave más alta = más arriba. Así las fotos anteriores a esta función
 * conservan su sitio sin tener que tocarlas.
 */

const STEP = 1000;

export function sortKey(photo) {
  if (typeof photo.order === 'number') return photo.order;
  const t = Date.parse(photo.createdAt);
  return Number.isNaN(t) ? 0 : t;
}

export function sortPhotos(photos) {
  return [...photos].sort((a, b) => sortKey(b) - sortKey(a));
}

/**
 * Claves para una tanda nueva: toda la tanda entra arriba del todo y
 * conserva el orden en que se seleccionaron los archivos.
 */
export function ordersForNewBatch(existingPhotos, count) {
  const top = existingPhotos.reduce((max, p) => Math.max(max, sortKey(p)), 0);
  const base = Math.max(Date.now(), top + STEP);
  return Array.from({ length: count }, (_, i) => base + (count - i));
}

/**
 * Calcula qué hay que escribir para mover `draggedId` a la posición de
 * `targetId` dentro de la lista visible (ya ordenada, quizá filtrada).
 *
 * Devuelve una lista de { id, order }. Lo normal es un único elemento:
 * la foto movida, con una clave a medio camino entre sus nuevas vecinas.
 * Si ya no queda hueco entre ellas, se renumeran todas.
 */
export function computeMove(visible, all, draggedId, targetId) {
  const from = visible.findIndex((p) => p.id === draggedId);
  const to = visible.findIndex((p) => p.id === targetId);
  if (from === -1 || to === -1 || from === to) return [];

  const rest = visible.filter((p) => p.id !== draggedId);
  const targetIdx = rest.findIndex((p) => p.id === targetId);
  // Hacia abajo se coloca detrás del destino; hacia arriba, delante.
  const insertAt = from < to ? targetIdx + 1 : targetIdx;

  const prev = rest[insertAt - 1];
  const next = rest[insertAt];

  if (!prev) return [{ id: draggedId, order: sortKey(next) + STEP }];
  if (!next) return [{ id: draggedId, order: sortKey(prev) - STEP }];

  const hi = sortKey(prev);
  const lo = sortKey(next);
  const mid = (hi + lo) / 2;
  if (mid < hi && mid > lo) return [{ id: draggedId, order: mid }];

  // Sin hueco: se renumera la lista completa con la foto ya recolocada.
  const dragged = all.find((p) => p.id === draggedId);
  const ordered = sortPhotos(all).filter((p) => p.id !== draggedId);
  const prevIdx = ordered.findIndex((p) => p.id === prev.id);
  ordered.splice(prevIdx + 1, 0, dragged);

  const base = Math.max(Date.now(), sortKey(ordered[0])) + STEP;
  return ordered.map((p, i) => ({ id: p.id, order: base - i * STEP }));
}
