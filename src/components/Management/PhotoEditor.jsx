import { useState, useEffect } from 'react';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { X, Save, Trash2, Star } from 'lucide-react';

export default function PhotoEditor({ photo, categories, onSave, onDelete, onClose }) {
  const [projectName, setProjectName] = useState(photo.projectName || '');
  const [clientName, setClientName] = useState(photo.clientName || '');
  const [selectedTags, setSelectedTags] = useState(photo.tags || []);
  const [featured, setFeatured] = useState(photo.featured || false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave() {
    setSaving(true);
    await onSave(photo.id, {
      projectName,
      clientName,
      tags: selectedTags,
      featured,
    });
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete(photo.id);
    onClose();
  }

  const modalContentStyle = isMobile
    ? { ...commonStyles.modalContent, maxWidth: '95vw', padding: '16px' }
    : {
        ...commonStyles.modalContent,
        maxWidth: '1100px',
        width: '95vw',
        display: 'flex',
        gap: '28px',
        padding: '0',
        overflow: 'hidden',
        maxHeight: '85vh',
      };

  return (
    <div style={commonStyles.modal} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={isMobile ? styles.imageSectionMobile : styles.imageSection}>
          <img
            src={photo.url || photo.thumbnailUrl}
            alt=""
            style={isMobile ? styles.imageMobile : styles.image}
          />
        </div>

        <div style={isMobile ? styles.formSectionMobile : styles.formSection}>
          <div style={styles.header}>
            <h3 style={styles.title}>Editar foto</h3>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PROYECTO</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>CLIENTE</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <button
            onClick={() => setFeatured(!featured)}
            style={{
              ...commonStyles.chip,
              ...(featured ? { backgroundColor: colors.star, color: '#F3F2EF', borderColor: colors.star } : {}),
            }}
          >
            <Star size={12} fill={featured ? '#F3F2EF' : 'none'} />
            Destacada
          </button>

          <div style={styles.tagSection}>
            <label style={styles.label}>ETIQUETAS</label>
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
                          ...commonStyles.buttonSmall,
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

          <div style={styles.actions}>
            <button
              onClick={handleDelete}
              style={{
                ...commonStyles.button,
                ...(confirmDelete ? commonStyles.buttonDanger : commonStyles.buttonSecondary),
                ...commonStyles.buttonSmall,
              }}
            >
              <Trash2 size={14} />
              {confirmDelete ? 'Confirmar borrar' : 'Borrar'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...commonStyles.button,
                ...commonStyles.buttonPrimary,
                ...commonStyles.buttonSmall,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Save size={14} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  imageSection: {
    flex: '0 0 55%',
    backgroundColor: colors.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    maxHeight: '85vh',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    maxHeight: '85vh',
  },
  imageSectionMobile: {
    width: '100%',
    maxHeight: '200px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  imageMobile: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  formSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
    padding: '24px 24px 24px 0',
    overflowY: 'auto',
    maxHeight: '85vh',
  },
  formSectionMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
    fontFamily: fonts.primary,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    color: colors.textSecondary,
    fontWeight: '600',
    fontFamily: fonts.primary,
    letterSpacing: '0.1em',
  },
  tagSection: {
    flex: 1,
    overflow: 'auto',
  },
  tagGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
    maxHeight: '250px',
    overflow: 'auto',
  },
  tagGroup: {},
  tagGroupName: {
    fontSize: '11px',
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 4px 0',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`,
  },
};
