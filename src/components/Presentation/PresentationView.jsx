import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { colors, fonts } from '../../styles/theme';
import SearchBar from '../Common/SearchBar';
import TagFilter from '../Common/TagFilter';
import PhotoGrid from '../Gallery/PhotoGrid';
import PhotoViewer from '../Gallery/PhotoViewer';

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
      setPhotos(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const filteredPhotos = photos.filter((photo) => {
    if (showFeatured && !photo.featured) return false;
    if (selectedTags.length > 0 && !selectedTags.some((t) => photo.tags?.includes(t))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = photo.projectName?.toLowerCase().includes(q);
      const matchClient = photo.clientName?.toLowerCase().includes(q);
      const matchTag = photo.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchClient && !matchTag) return false;
    }
    return true;
  });

  const viewerIndex = viewerPhoto ? filteredPhotos.findIndex((p) => p.id === viewerPhoto.id) : -1;

  return (
    <div style={styles.container}>
      {studioSettings?.logoUrl && (
        <div style={styles.logoBar}>
          <img
            src={studioSettings.logoUrl}
            alt={studioSettings.name || 'Studio'}
            style={styles.logo}
          />
        </div>
      )}

      {!studioSettings?.logoUrl && (
        <div style={styles.logoBar}>
          <div style={styles.textLogo}>
            <span style={styles.textLogoMain}>NOSH</span>
            <span style={styles.textLogoSub}>STUDIO</span>
          </div>
        </div>
      )}

      <div style={styles.toolbar}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar proyecto, cliente o etiqueta..."
        />
        <TagFilter
          categories={categories}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          showFeatured={showFeatured}
          onToggleFeatured={() => setShowFeatured(!showFeatured)}
        />
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
  },
  logo: {
    height: '32px',
    objectFit: 'contain',
    opacity: 0.7,
  },
  textLogo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    opacity: 0.5,
  },
  textLogoMain: {
    fontSize: '20px',
    fontWeight: '700',
    color: colors.white,
    letterSpacing: '6px',
  },
  textLogoSub: {
    fontSize: '10px',
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: '4px',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
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
