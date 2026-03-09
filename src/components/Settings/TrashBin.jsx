import { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function TrashBin() {
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeleted();
  }, []);

  async function loadDeleted() {
    const q = query(collection(db, 'photos'), where('deleted', '==', true));
    const snap = await getDocs(q);
    const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Filter to last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = photos.filter(
      (p) => new Date(p.deletedAt) > thirtyDaysAgo
    );
    setDeletedPhotos(recent);
    setLoading(false);
  }

  async function handleRestore(photoId) {
    await updateDoc(doc(db, 'photos', photoId), {
      deleted: false,
      deletedAt: null,
    });
    setDeletedPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  async function handlePermanentDelete(photoId) {
    const photo = deletedPhotos.find((p) => p.id === photoId);
    if (!photo) return;

    try {
      if (photo.storagePath) {
        await deleteObject(ref(storage, photo.storagePath));
      }
      if (photo.thumbnailPath) {
        await deleteObject(ref(storage, photo.thumbnailPath));
      }
    } catch (e) {
      console.error('Error deleting from storage:', e);
    }

    await deleteDoc(doc(db, 'photos', photoId));
    setDeletedPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  if (loading) {
    return <div style={styles.loading}>Cargando papelera...</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={commonStyles.sectionTitle}>Papelera</h3>
      <p style={styles.subtitle}>
        Las fotos borradas se eliminan automáticamente después de 30 días.
      </p>

      {deletedPhotos.length === 0 ? (
        <div style={styles.empty}>
          <Trash2 size={32} color={colors.textMuted} />
          <p>La papelera está vacía</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {deletedPhotos.map((photo) => (
            <div key={photo.id} style={styles.item}>
              <img
                src={photo.thumbnailUrl || photo.url}
                alt=""
                style={styles.image}
              />
              <div style={styles.itemInfo}>
                <p style={styles.itemName}>{photo.projectName || 'Sin nombre'}</p>
                <p style={styles.itemDate}>
                  Borrada: {new Date(photo.deletedAt).toLocaleDateString('es-ES')}
                </p>
                <div style={styles.itemActions}>
                  <button
                    onClick={() => handleRestore(photo.id)}
                    style={{ ...commonStyles.button, ...commonStyles.buttonSecondary, ...commonStyles.buttonSmall }}
                  >
                    <RotateCcw size={12} /> Restaurar
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(photo.id)}
                    style={{ ...commonStyles.button, ...commonStyles.buttonDanger, ...commonStyles.buttonSmall }}
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: '13px',
    marginBottom: '16px',
  },
  loading: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: colors.textMuted,
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
  },
  item: {
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    opacity: 0.6,
  },
  itemInfo: {
    padding: '10px',
  },
  itemName: {
    color: colors.text,
    fontSize: '13px',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  itemDate: {
    color: colors.textMuted,
    fontSize: '11px',
    margin: '0 0 8px 0',
  },
  itemActions: {
    display: 'flex',
    gap: '6px',
  },
};
