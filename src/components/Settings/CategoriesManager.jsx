import { useState } from 'react';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CategoriesManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, onAddTag, onDeleteTag }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newTagInputs, setNewTagInputs] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');

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
                  {cat.tags.map((tag) => (
                    <div key={tag} style={styles.tagItem}>
                      <span style={styles.tagText}>{tag}</span>
                      <button onClick={() => onDeleteTag(cat.name, tag)} style={styles.tagDeleteBtn}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
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
    color: colors.white,
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
    gap: '4px',
    padding: '4px 8px 4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    backgroundColor: colors.bgSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
  },
  tagText: {
    fontSize: '12px',
  },
  tagDeleteBtn: {
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
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
