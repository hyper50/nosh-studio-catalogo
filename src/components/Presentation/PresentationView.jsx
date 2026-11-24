import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { colors, fonts } from '../../styles/theme';
import { sortPhotos } from '../../utils/photoOrder';
import { filterPhotos, photoCountLabel } from '../../utils/search';
import SearchBar from '../Common/SearchBar';
import TagFilter from '../Common/TagFilter';
import PhotoGrid from '../Gallery/PhotoGrid';
import PhotoViewer from '../Gallery/PhotoViewer';
import NoshWordmark from '../Common/NoshWordmark';

export default function PresentationView({ categories, studioSettings }) {
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .filter((d) => !d.data().deleted)
        .map((d) => ({ id: d.id, ...d.data() }));
      setPhotos(sortPhotos(data));
      setLoading(false);
    });
    return unsub;
  }, []);

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const filteredPhotos = filterPhotos(photos, { searchQuery, selectedTags, showFeatured });

  const viewerIndex = viewerPhoto ? filteredPhotos.findIndex((p) => p.id === viewerPhoto.id) : -1;

  return (
    <div style={styles.container}>
      {studioSettings?.logoUrl ? (
        <div style={styles.logoBar}>
          <img
            src={studioSettings.logoUrl}
            alt={studioSettings.name || 'Studio'}
            style={styles.logo}
          />
        </div>
      ) : (
        <div style={styles.logoBar}>
          <NoshWordmark color={colors.text} width={160} />
        </div>
      )}

      <div style={styles.toolbar}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar proyecto, cliente o etiqueta..."
        />
        <div style={styles.filterRow}>
          <TagFilter
            categories={categories}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            showFeatured={showFeatured}
            onToggleFeatured={() => setShowFeatured(!showFeatured)}
          />
          {!loading && (
            <span style={styles.count}>
              {photoCountLabel(filteredPhotos.length, photos.length)}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Cargando...</div>
      ) : filteredPhotos.length === 0 ? (
        <div style={styles.empty}>No se encontraron fotos.</div>
      ) : (
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={(photo) => setViewerPhoto(photo)}
          showManagement={false}
        />
      )}

      {viewerPhoto && viewerIndex >= 0 && (
        <PhotoViewer
          photos={filteredPhotos}
          currentIndex={viewerIndex}
          onClose={() => setViewerPhoto(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    fontFamily: fonts.primary,
    minHeight: '100vh',
  },
  logoBar: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0 20px',
    opacity: 0.6,
  },
  logo: {
    height: '32px',
    objectFit: 'contain',
    opacity: 0.7,
  },
  // Buscador y filtros se quedan a la vista, pegados bajo la barra superior.
  toolbar: {
    position: 'sticky',
    top: '52px',
    zIndex: 40,
    backgroundColor: colors.bg,
    margin: '0 -16px 16px',
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.borderLight}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },
  count: {
    flexShrink: 0,
    fontSize: '12px',
    color: colors.textMuted,
    paddingTop: '6px',
    whiteSpace: 'nowrap',
  },
  loading: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: '60px 0',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: '60px 0',
  },
};
