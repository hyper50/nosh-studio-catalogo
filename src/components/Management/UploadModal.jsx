import { useState, useRef } from 'react';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { Upload, X, Plus, Trash2, AlertTriangle } from 'lucide-react';

const MAX_ORIGINAL_BYTES = 50 * 1024 * 1024;

export default function UploadModal({ categories, onUpload, onClose }) {
  // Cada elemento lleva el archivo y su vista previa juntos, para que
  // quitar o reintentar no los descuadre.
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  const dragCounter = useRef(0);

  function addFiles(newFiles) {
    const images = newFiles.filter(
      (f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)
    );
    const tooBig = images.filter((f) => f.size > MAX_ORIGINAL_BYTES);
    const accepted = images.filter((f) => f.size <= MAX_ORIGINAL_BYTES);

    if (tooBig.length > 0) {
      setError(
        `${tooBig.map((f) => `«${f.name}»`).join(', ')} supera${tooBig.length === 1 ? '' : 'n'} los 50 MB y no se puede${tooBig.length === 1 ? '' : 'n'} subir.`
      );
    } else if (accepted.length > 0) {
      setError('');
    }
    if (accepted.length === 0) return;

    setItems((prev) => [
      ...prev,
      ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  }

  function handleFileSelect(e) {
    addFiles(Array.from(e.target.files));
    // Permite volver a elegir el mismo archivo tras un fallo.
    e.target.value = '';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }

  function removeFile(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleUpload() {
    if (items.length === 0) return;
    const total = items.length;
    setUploading(true);
    setError('');
    try {
      await onUpload(items.map((it) => it.file), {
        projectName,
        clientName,
        tags: selectedTags,
      }, (p) => setProgress(p));
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      const done = err?.uploadedCount || 0;
      const pending = total - done;
      const detail = err?.message || 'No se han podido subir las fotos.';
      setError(
        done > 0
          ? `${detail} Se ${done === 1 ? 'ha' : 'han'} subido ${done} de ${total}; ${pending === 1 ? 'la que falta sigue' : `las ${pending} que faltan siguen`} aquí para reintentarlo.`
          : `${detail} No se ha subido ninguna foto.`
      );
      // Las ya subidas salen de la lista: reintentar no las duplica.
      setItems((prev) => prev.slice(done));
      setProgress(0);
      setUploading(false);
    }
  }

  return (
    <div style={commonStyles.modal} onClick={onClose}>
      <div
        style={{ ...commonStyles.modalContent, maxWidth: '700px' }}
        onClick={(e) => e.stopPropagation()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Subir fotos</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            ...styles.dropZone,
            ...(isDragging ? styles.dropZoneActive : {}),
          }}
          onClick={() => fileInputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload size={32} color={isDragging ? colors.white : colors.textMuted} />
          <p style={styles.dropText}>
            {isDragging ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí o haz clic para seleccionar'}
          </p>
          <p style={styles.dropSubtext}>JPG, PNG — Se comprimirán automáticamente</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {items.length > 0 && (
          <div style={styles.previewGrid}>
            {items.map((item, i) => (
              <div key={i} style={styles.previewItem}>
                <img src={item.url} alt="" style={styles.previewImg} />
                <button
                  onClick={() => removeFile(i)}
                  style={styles.removeBtn}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              style={styles.addMoreBtn}
              onClick={() => fileInputRef.current.click()}
            >
              <Plus size={20} />
            </button>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Proyecto</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={commonStyles.input}
                placeholder="Nombre del proyecto"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={commonStyles.input}
                placeholder="Nombre del cliente"
              />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Etiquetas comunes para todas las fotos</label>
          <div style={styles.tagGroups}>
            {categories.map((cat) => (
              <div key={cat.name} style={styles.tagGroup}>
                <p style={styles.tagGroupName}>{cat.name}</p>
                <div style={styles.tagList}>
                  {cat.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        ...commonStyles.chip,
                        ...(selectedTags.includes(tag) ? commonStyles.chipActive : {}),
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            <span style={styles.progressText}>{Math.round(progress)}%</span>
          </div>
        )}

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...commonStyles.button, ...commonStyles.buttonSecondary }}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={items.length === 0 || uploading}
            style={{
              ...commonStyles.button,
              ...commonStyles.buttonPrimary,
              opacity: items.length === 0 || uploading ? 0.5 : 1,
            }}
          >
            <Upload size={16} />
            {uploading ? 'Subiendo...' : `Subir ${items.length} foto${items.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: colors.white,
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    fontFamily: fonts.primary,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
  },
  dropZone: {
    border: `2px dashed ${colors.border}`,
    borderRadius: radius.md,
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '16px',
  },
  dropZoneActive: {
    borderColor: colors.black,
    backgroundColor: 'rgba(28, 28, 26, 0.03)',
  },
  dropText: {
    color: colors.text,
    fontSize: '14px',
    margin: '12px 0 4px',
  },
  dropSubtext: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
    marginBottom: '20px',
  },
  previewItem: {
    position: 'relative',
    paddingTop: '100%',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  previewImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: 'rgba(28,28,26,0.6)',
    border: 'none',
    color: '#F3F2EF',
    cursor: 'pointer',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  addMoreBtn: {
    border: `2px dashed ${colors.border}`,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
  },
  section: {
    marginBottom: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: '6px',
    fontFamily: fonts.primary,
  },
  tagGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  tagGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  tagGroupName: {
    fontSize: '12px',
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  error: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    marginBottom: '16px',
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    fontSize: '13px',
    lineHeight: 1.45,
    fontFamily: fonts.primary,
  },
  progressContainer: {
    backgroundColor: colors.bgTertiary,
    borderRadius: '10px',
    height: '20px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '16px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: '10px',
    transition: 'width 0.3s',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: '600',
    color: colors.bg,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.border}`,
  },
};
