// Búsqueda, filtros y orden de etiquetas, compartidos por Gestión y Presentación.

// Minúsculas y sin tildes, para comparar textos sin fijarse en cómo se escribieron.
export function normalize(text) {
  return (text ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Cada palabra se busca por separado y en cualquier orden: "poniente 95"
// encuentra "Poniente Villa 95". Proyecto, cliente y etiquetas cuentan juntos.
export function matchesSearch(photo, searchQuery) {
  const words = normalize(searchQuery).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(
    [photo.projectName, photo.clientName, ...(photo.tags || [])].join(' ')
  );
  return words.every((w) => haystack.includes(w));
}

// Las etiquetas marcadas se suman: la foto tiene que llevarlas todas.
export function filterPhotos(photos, { searchQuery = '', selectedTags = [], showFeatured = false }) {
  return photos.filter((photo) => {
    if (showFeatured && !photo.featured) return false;
    if (!selectedTags.every((t) => photo.tags?.includes(t))) return false;
    return matchesSearch(photo, searchQuery);
  });
}

export function sortTags(tags) {
  return [...(tags || [])].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })
  );
}

// Las categorías conservan su orden; las etiquetas de cada una van alfabéticas.
export function withSortedTags(categories) {
  return (categories || []).map((c) => ({ ...c, tags: sortTags(c.tags) }));
}

export function photoCountLabel(shown, total) {
  const noun = (n) => `foto${n === 1 ? '' : 's'}`;
  return shown === total ? `${total} ${noun(total)}` : `${shown} de ${total} ${noun(total)}`;
}
