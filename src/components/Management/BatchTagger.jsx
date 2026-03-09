import { useState } from 'react';
import { colors, fonts, commonStyles } from '../../styles/theme';
import { Tag, X } from 'lucide-react';

export default function BatchTagger({ selectedCount, categories, onApplyTags, onCancel }) {
  const [selectedTags, setSelectedTags] = useState([]);

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <Tag size={16} />
        <span>{selectedCount} foto{selectedCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}</span>
      </div>

      <div style={styles.tagArea}>
        {categories.map((cat) => (
          <div key={cat.name} style={styles.tagGroup}>
            <span style={styles.groupLabel}>{cat.name}:</span>
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
        ))}
      </div>

      <div style={styles.actions}>
        <button
          onClick={onCancel}
          style={{ ...commonStyles.button, ...commonStyles.buttonSecondary, ...commonStyles.buttonSmall }}
        >
          <X size={14} />
          Cancelar
        </button>
        <button
          onClick={() => onApplyTags(selectedTags)}
          disabled={selectedTags.length === 0}
          style={{
            ...commonStyles.button,
            ...commonStyles.buttonPrimary,
            ...commonStyles.buttonSmall,
            opacity: selectedTags.length === 0 ? 0.5 : 1,
          }}
        >
          <Tag size={14} />
          Aplicar etiquetas
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '16px',
    fontFamily: fonts.primary,
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.white,
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
  },
  tagArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  tagGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: '11px',
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginRight: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.border}`,
  },
};
