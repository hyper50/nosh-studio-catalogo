import { useState } from 'react';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CategoriesManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, onAddTag, onDeleteTag, onRenameTag }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newTagInputs, setNewTagInputs] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');
  // Etiqueta que se está corrigiendo: { cat, tag }.
  const [editingTag, setEditingTag] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [tagBusy, setTagBusy] = useState(false);
  const [tagMessage, setTagMessage] = useState(null);

  function toggleGroup(name) {
    setExpandedGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function handleAddGroup() {
    if (!newGroupName.trim()) return;
    onAddCategory({ name: newGroupName.trim(), tags: [] });
    setNewGroupName('');
  }

  function handleAddTag(categoryName) {
    const tagName = newTagInputs[categoryName]?.trim();
    if (!tagName) return;
    onAddTag(categoryName, tagName);
    setNewTagInputs((prev) => ({ ...prev, [categoryName]: '' }));
  }

  function startEditGroup(name) {
    setEditingGroup(name);
    setEditName(name);
  }

  function saveEditGroup(oldName) {
    if (editName.trim() && editName.trim() !== oldName) {
      onUpdateCategory(oldName, editName.trim());
    }
    setEditingGroup(null);
  }

  function startEditTag(cat, tag) {
    setEditingTag({ cat, tag });
    setEditTagName(tag);
    setTagMessage(null);
  }

  async function saveEditTag() {
    if (!editingTag || tagBusy) return;
    const oldTag = editingTag.tag;
    const name = editTagName.trim();
    if (!name || name === oldTag) {
      setEditingTag(null);
      return;
    }
    setTagBusy(true);
    try {
      const changed = await onRenameTag(oldTag, name);
      setTagMessage({
        cat: editingTag.cat,
        text:
          changed > 0
            ? `«${oldTag}» ahora es «${name}». Actualizada en ${changed} foto${changed === 1 ? '' : 's'}.`
            : `«${oldTag}» ahora es «${name}». Ninguna foto la llevaba.`,
      });
      setEditingTag(null);
    } catch (err) {
      console.error('No se pudo renombrar la etiqueta:', err);
      setTagMessage({
        cat: editingTag.cat,
        error: true,
        text: err?.message?.startsWith('Ya existe')
          ? err.message
          : 'No se ha podido cambiar el nombre. Inténtalo de nuevo.',
      });
    }
    setTagBusy(false);
  }

  return (
    <div style={styles.container}>
      <h3 style={commonStyles.sectionTitle}>Categorias</h3>

      {categories.map((cat) => {
        const isExpanded = expandedGroups[cat.name];
        const isEditing = editingGroup === cat.name;

        return (
          <div key={cat.name} style={styles.group}>
            <div style={styles.groupHeader}>
              {isEditing ? (
                <div style={styles.editRow}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ ...commonStyles.input, flex: 1 }}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEditGroup(cat.name)}
                  />
                  <button onClick={() => saveEditGroup(cat.name)} style={styles.iconBtn}>
                    <Save size={14} color={colors.success} />
                  </button>
                  <button onClick={() => setEditingGroup(null)} style={styles.iconBtn}>
                    <X size={14} color={colors.textMuted} />
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => toggleGroup(cat.name)} style={styles.groupName}>
                    {cat.name}
                    <span style={styles.tagCount}>{cat.tags.length}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div style={styles.groupActions}>
                    <button onClick={() => startEditGroup(cat.name)} style={styles.iconBtn}>
                      <Edit3 size={14} color={colors.textMuted} />
                    </button>
                    <button onClick={() => onDeleteCategory(cat.name)} style={styles.iconBtn}>
                      <Trash2 size={14} color={colors.danger} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {isExpanded && (
              <div style={styles.tagSection}>
                <div style={styles.tagList}>
                  {cat.tags.map((tag) =>
                    editingTag?.cat === cat.name && editingTag.tag === tag ? (
                      <div key={tag} style={styles.tagEdit}>
                        <input
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          style={styles.tagEditInput}
                          autoFocus
                          disabled={tagBusy}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditTag();
                            if (e.key === 'Escape') setEditingTag(null);
                          }}
                        />
                        <button onClick={saveEditTag} disabled={tagBusy} style={styles.tagIconBtn} title="Guardar">
                          <Save size={13} color={colors.success} />
                        </button>
                        <button onClick={() => setEditingTag(null)} disabled={tagBusy} style={styles.tagIconBtn} title="Cancelar">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div key={tag} style={styles.tagItem}>
                        <span style={styles.tagText}>{tag}</span>
                        <button onClick={() => startEditTag(cat.name, tag)} style={styles.tagIconBtn} title="Cambiar nombre">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => onDeleteTag(cat.name, tag)} style={styles.tagIconBtn} title="Quitar etiqueta">
                          <X size={12} />
                        </button>
                      </div>
                    )
                  )}
                </div>
                {tagMessage?.cat === cat.name && (
                  <p style={{ ...styles.tagMessage, ...(tagMessage.error ? styles.tagMessageError : {}) }}>
                    {tagMessage.text}
                  </p>
                )}
                <div style={styles.addTagRow}>
                  <input
                    value={newTagInputs[cat.name] || ''}
                    onChange={(e) =>
                      setNewTagInputs((prev) => ({ ...prev, [cat.name]: e.target.value }))
                    }
                    placeholder="Nueva etiqueta..."
                    style={{ ...commonStyles.input, flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(cat.name)}
                  />
                  <button
                    onClick={() => handleAddTag(cat.name)}
                    style={{ ...commonStyles.button, ...commonStyles.buttonSecondary, ...commonStyles.buttonSmall }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={styles.addGroup}>
        <input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Nuevo grupo de categorias..."
          style={{ ...commonStyles.input, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
        />
        <button
          onClick={handleAddGroup}
          style={{ ...commonStyles.button, ...commonStyles.buttonPrimary, ...commonStyles.buttonSmall }}
        >
          <Plus size={14} /> Añadir grupo
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
  },
  group: {
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.sm,
    marginBottom: '8px',
    overflow: 'hidden',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
  },
  groupName: {
    background: 'none',
    border: 'none',
    color: colors.text,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: fonts.primary,
    flex: 1,
    textAlign: 'left',
  },
  tagCount: {
    backgroundColor: colors.border,
    color: colors.textSecondary,
    borderRadius: '10px',
    padding: '1px 8px',
    fontSize: '11px',
  },
  groupActions: {
    display: 'flex',
    gap: '4px',
  },
  editRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    borderRadius: '4px',
  },
  tagSection: {
    padding: '0 14px 14px',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '10px',
  },
  tagItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 6px 4px 10px',
    borderRadius: 0,
    fontSize: '12px',
    backgroundColor: colors.bgSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
  },
  tagText: {
    fontSize: '12px',
    marginRight: '4px',
  },
  tagIconBtn: {
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    padding: '3px',
    display: 'flex',
  },
  tagEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px 6px 2px 2px',
    border: `1px solid ${colors.black}`,
    backgroundColor: colors.bgSecondary,
  },
  tagEditInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12px',
    fontFamily: fonts.primary,
    color: colors.text,
    padding: '3px 8px',
    width: '160px',
    backgroundColor: 'transparent',
  },
  tagMessage: {
    fontSize: '12px',
    color: colors.success,
    margin: '0 0 10px 0',
  },
  tagMessageError: {
    color: colors.danger,
  },
  addTagRow: {
    display: 'flex',
    gap: '6px',
  },
  addGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
};
