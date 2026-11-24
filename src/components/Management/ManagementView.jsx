import { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch, getDocs, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { compressImage, generateThumbnail, safeFilename } from '../../utils/imageCompressor';
import { sortPhotos, computeMove, ordersForNewBatch } from '../../utils/photoOrder';
import { colors, fonts, commonStyles } from '../../styles/theme';
import SearchBar from '../Common/SearchBar';
import TagFilter from '../Common/TagFilter';
import PhotoGrid from '../Gallery/PhotoGrid';
import PhotoViewer from '../Gallery/PhotoViewer';
import PhotoEditor from './PhotoEditor';
import UploadModal from './UploadModal';
import BatchTagger from './BatchTagger';
import { Upload, CheckSquare, X } from 'lucide-react';

export default function ManagementView({ categories }) {
  const { currentUser } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [editorPhoto, setEditorPhoto] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
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

  async function handleUpload(files, metadata, onProgress) {
    const total = files.length;
    // Tres subidas por foto: miniatura, pantalla y original.
    const stepsPerFile = 3;
    const totalSteps = total * stepsPerFile;
    let done = 0;
    // Toda la tanda entra arriba y en el orden en que se seleccionó.
    const orders = ordersForNewBatch(photos, total);
    const advance = () => {
      done += 1;
      onProgress((done / totalSteps) * 100);
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImage(file);
      const thumbnail = await generateThumbnail(file);

      const timestamp = Date.now();
      const cleanName = safeFilename(file.name);
      const base = `${timestamp}_${i}_${cleanName}`;

      const paths = {
        photo: `photos/${base}`,
        thumbnail: `thumbnails/${base}`,
        original: `originals/${base}`,
      };

      // Miniatura primero: es la que aparece antes en la galería.
      await uploadBytes(ref(storage, paths.thumbnail), thumbnail);
      advance();

      await uploadBytes(ref(storage, paths.photo), compressed);
      advance();

      // El original se marca como adjunto para que el navegador
      // lo descargue en lugar de abrirlo.
      await uploadBytes(ref(storage, paths.original), file, {
        contentType: file.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${cleanName}"`,
      });
      advance();

      const [thumbnailUrl, url, originalUrl] = await Promise.all([
        getDownloadURL(ref(storage, paths.thumbnail)),
        getDownloadURL(ref(storage, paths.photo)),
        getDownloadURL(ref(storage, paths.original)),
      ]);

      await addDoc(collection(db, 'photos'), {
        url,
        thumbnailUrl,
        originalUrl,
        storagePath: paths.photo,
        thumbnailPath: paths.thumbnail,
        originalPath: paths.original,
        originalName: file.name,
        originalSize: file.size,
        projectName: metadata.projectName || '',
        clientName: metadata.clientName || '',
        tags: metadata.tags || [],
        featured: false,
        deleted: false,
        order: orders[i],
        uploadedBy: currentUser.uid,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function handleSavePhoto(photoId, updates) {
    await updateDoc(doc(db, 'photos', photoId), updates);
  }

  async function handleDeletePhoto(photoId) {
    await updateDoc(doc(db, 'photos', photoId), {
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  }

  async function handleToggleFeatured(photoId) {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      await updateDoc(doc(db, 'photos', photoId), { featured: !photo.featured });
    }
  }

  // Arrastrar una foto sobre otra: se recoloca entre sus nuevas vecinas.
  async function handleReorder(draggedId, targetId) {
    const writes = computeMove(filteredPhotos, photos, draggedId, targetId);
    if (writes.length === 0) return;

    // Se refleja al instante; Firestore confirma después.
    const byId = new Map(writes.map((w) => [w.id, w.order]));
    setPhotos((prev) =>
      sortPhotos(prev.map((p) => (byId.has(p.id) ? { ...p, order: byId.get(p.id) } : p)))
    );

    try {
      for (let i = 0; i < writes.length; i += 400) {
        const batch = writeBatch(db);
        writes.slice(i, i + 400).forEach((w) => {
          batch.update(doc(db, 'photos', w.id), { order: w.order });
        });
        await batch.commit();
      }
    } catch (err) {
      console.error('No se pudo guardar el nuevo orden:', err);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleBatchTag(tags) {
    const batch = writeBatch(db);
    selectedIds.forEach((id) => {
      const photo = photos.find((p) => p.id === id);
      const existingTags = photo?.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];
      batch.update(doc(db, 'photos', id), { tags: newTags });
    });
    await batch.commit();
    setSelectMode(false);
    setSelectedIds([]);
  }

  const viewerIndex = viewerPhoto ? filteredPhotos.findIndex((p) => p.id === viewerPhoto.id) : -1;

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.searchRow}>
          <div style={{ flex: 1 }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{ ...commonStyles.button, ...commonStyles.buttonPrimary }}
          >
            <Upload size={16} />
            <span style={styles.btnLabel}>Subir</span>
          </button>
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedIds([]);
            }}
            style={{
              ...commonStyles.button,
              ...(selectMode ? commonStyles.buttonPrimary : commonStyles.buttonSecondary),
            }}
          >
            {selectMode ? <X size={16} /> : <CheckSquare size={16} />}
            <span style={styles.btnLabel}>{selectMode ? 'Cancelar' : 'Seleccionar'}</span>
          </button>
        </div>

        <TagFilter
          categories={categories}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          showFeatured={showFeatured}
          onToggleFeatured={() => setShowFeatured(!showFeatured)}
        />
      </div>

      {selectMode && selectedIds.length > 0 && (
        <BatchTagger
          selectedCount={selectedIds.length}
          categories={categories}
          onApplyTags={handleBatchTag}
          onCancel={() => {
            setSelectMode(false);
            setSelectedIds([]);
          }}
        />
      )}

      {loading ? (
        <div style={styles.loading}>Cargando fotos...</div>
      ) : filteredPhotos.length === 0 ? (
        <div style={styles.empty}>
          {photos.length === 0 ? 'No hay fotos todavía. ¡Sube la primera!' : 'No se encontraron fotos con esos filtros.'}
        </div>
      ) : (
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={(photo) => {
            if (selectMode) return;
            setEditorPhoto(photo);
          }}
          selectable={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          showManagement={true}
          onReorder={selectMode ? undefined : handleReorder}
        />
      )}

      {showUpload && (
        <UploadModal
          categories={categories}
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {editorPhoto && (
        <PhotoEditor
          photo={editorPhoto}
          categories={categories}
          onSave={handleSavePhoto}
          onDelete={handleDeletePhoto}
          onClose={() => setEditorPhoto(null)}
        />
      )}

      {viewerPhoto && viewerIndex >= 0 && (
        <PhotoViewer
          photos={filteredPhotos}
          currentIndex={viewerIndex}
          onClose={() => setViewerPhoto(null)}
          onToggleFeatured={handleToggleFeatured}
          showFeaturedToggle={true}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    fontFamily: fonts.primary,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btnLabel: {
    display: 'inline',
  },
  loading: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: '60px 0',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: '60px 0',
    fontSize: '14px',
  },
};
