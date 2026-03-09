import { useState } from 'react';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { X, Save, Trash2, Star } from 'lucide-react';

export default function PhotoEditor({ photo, categories, onSave, onDelete, onClose }) {
  const [projectName, setProjectName] = useState(photo.projectName || '');
  const [clientName, setClientName] = useState(photo.clientName || '');
  const [selectedTags, setSelectedTags] = useState(photo.tags || []);
  const [featured, setFeatured] = useState(photo.featured || false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <div style={commonStyles.modal} onClick={onClose}>
      <div
        style={{ ...commonStyles.modalContent, maxWidth: '700px', display: 'flex', gap: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.imageSection}>
          <img src={photo.thumbnailUrl || photo.url} alt="" style={styles.image} />
        </div>

        <div style={styles.formSection}>
          <div style={styles.header}>
            <h3 style={styles.title}>Editar foto</h3>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Proyecto</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={commonStyles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Cliente</label>
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
              ...(featured ? { backgroundColor: colors.star, color: colors.bg, borderColor: colors.star } : {}),
            }}
          >
            <Star size={12} fill={featured ? colors.bg : 'none'} />
            Destacada
          </button>

          <div style={styles.tagSection}>
            <label style={styles.label}>Etiquetas</label>
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
    flex: '0 0 220px',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderRadius: radius.sm,
  },
  formSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: '16px',
    fontWeight: '600',
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
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: fonts.primary,
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
    maxHeight: '180px',
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
