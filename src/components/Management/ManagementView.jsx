import { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import { compressImage, generateThumbnail, safeFilename } from '../../utils/imageCompressor';
import { sortPhotos, computeMove, ordersForNewBatch } from '../../utils/photoOrder';
import { filterPhotos, photoCountLabel } from '../../utils/search';
import { downloadOriginals } from '../../utils/download';
import { colors, fonts, commonStyles } from '../../styles/theme';
import SearchBar from '../Common/SearchBar';
import TagFilter from '../Common/TagFilter';
import PhotoGrid from '../Gallery/PhotoGrid';
import PhotoViewer from '../Gallery/PhotoViewer';
import PhotoEditor from './PhotoEditor';
import UploadModal from './UploadModal';
import SelectionBar from './SelectionBar';
import { Upload, CheckSquare, X } from 'lucide-react';

// Firestore admite 500 escrituras por lote; se trocea con margen.
const BATCH_SIZE = 400;

// Explica un fallo de subida con palabras que sirvan a quien sube la foto.
function describeUploadError(err, file) {
  const name = `«${file.name}»`;
  if (/\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type)) {
    return `${name} está en formato HEIC (el de iPhone) y este navegador no puede procesarlo. Conviértela a JPG y vuelve a subirla.`;
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return `Se ha perdido la conexión al subir ${name}.`;
  }
  switch (err?.code) {
    case 'storage/unauthorized':
      return `El almacén ha rechazado ${name}: el formato o el tamaño no están permitidos (máximo 50 MB por foto).`;
    case 'storage/quota-exceeded':
      return `No queda espacio en el almacén para subir ${name}.`;
    case 'storage/retry-limit-exceeded':
    case 'storage/canceled':
      return `La conexión se ha cortado al subir ${name}.`;
    default:
      return `No se ha podido subir ${name}.`;
  }
}

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
  const [notice, setNotice] = useState('');

  // Mensaje breve en la barra de selección tras una acción.
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

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
  const selectedPhotos = photos.filter((p) => selectedIds.includes(p.id));

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
      const uploaded = [];
      try {
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
        uploaded.push(paths.thumbnail);
        advance();

        await uploadBytes(ref(storage, paths.photo), compressed);
        uploaded.push(paths.photo);
        advance();

        // El original se marca como adjunto para que el navegador
        // lo descargue en lugar de abrirlo.
        await uploadBytes(ref(storage, paths.original), file, {
          contentType: file.type || 'application/octet-stream',
          contentDisposition: `attachment; filename="${cleanName}"`,
        });
        uploaded.push(paths.original);
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
      } catch (err) {
        console.error('Error al subir', file.name, err);
        // La foto se quedó a medias: se retiran sus archivos para no dejar restos.
        await Promise.all(
          uploaded.map((path) => deleteObject(ref(storage, path)).catch(() => {}))
        );
        const failure = new Error(describeUploadError(err, file));
        // Las anteriores sí se subieron; el aviso lo cuenta y permite reintentar el resto.
        failure.uploadedCount = i;
        throw failure;
      }
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

  function closeSelection() {
    setSelectMode(false);
    setSelectedIds([]);
  }

  // Aplica el mismo cambio a todas las fotos elegidas, en lotes.
  async function updateSelected(buildUpdate) {
    const targets = selectedPhotos;
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      targets.slice(i, i + BATCH_SIZE).forEach((photo) => {
        batch.update(doc(db, 'photos', photo.id), buildUpdate(photo));
      });
      await batch.commit();
    }
    return targets.length;
  }

  const fotos = (n) => `${n} foto${n === 1 ? '' : 's'}`;

  async function runBatch(action, doneMessage) {
    try {
      const n = await action();
      setNotice(doneMessage(n));
      return true;
    } catch (err) {
      console.error('No se pudo aplicar el cambio:', err);
      setNotice('No se ha podido guardar el cambio. Inténtalo de nuevo.');
      return false;
    }
  }

  function handleBatchTag(tags) {
    return runBatch(
      () => updateSelected((photo) => ({ tags: [...new Set([...(photo.tags || []), ...tags])] })),
      (n) => `Etiquetas aplicadas a ${fotos(n)}`
    );
  }

  function handleBatchFeatured(featured) {
    return runBatch(
      () => updateSelected(() => ({ featured })),
      (n) => (featured ? `${fotos(n)} marcada${n === 1 ? '' : 's'} como destacada${n === 1 ? '' : 's'}` : `Destacada quitada de ${fotos(n)}`)
    );
  }

  async function handleBatchDelete() {
    const deletedAt = new Date().toISOString();
    const ok = await runBatch(
      () => updateSelected(() => ({ deleted: true, deletedAt })),
      (n) => `${fotos(n)} enviada${n === 1 ? '' : 's'} a la papelera`
    );
    if (ok) setSelectedIds([]);
  }

  function handleBatchDownload() {
    const { started, missing } = downloadOriginals(selectedPhotos);
    if (started === 0) {
      setNotice('Estas fotos no tienen original guardado');
    } else if (missing > 0) {
      setNotice(`Descargando ${fotos(started)}; ${missing} no tiene${missing === 1 ? '' : 'n'} original`);
    } else {
      setNotice(`Descargando ${fotos(started)}`);
    }
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

      {selectMode && (
        <>
          {/* Hueco para que la barra fija no tape la última fila. */}
          <div style={styles.barSpacer} />
          <SelectionBar
            selectedPhotos={selectedPhotos}
            categories={categories}
            notice={notice}
            onApplyTags={handleBatchTag}
            onSetFeatured={handleBatchFeatured}
            onDownload={handleBatchDownload}
            onDelete={handleBatchDelete}
            onCancel={closeSelection}
          />
        </>
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
  // Buscador y filtros se quedan a la vista, pegados bajo la barra superior.
  toolbar: {
    position: 'sticky',
    top: '52px',
    zIndex: 40,
    backgroundColor: colors.bg,
    margin: '-16px -16px 16px',
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
  barSpacer: {
    height: '72px',
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
