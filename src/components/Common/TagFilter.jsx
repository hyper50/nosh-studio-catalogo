import { useState } from 'react';
import { colors, radius, fonts, commonStyles } from '../../styles/theme';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

export default function TagFilter({ categories, selectedTags, onToggleTag, showFeatured, onToggleFeatured }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  function toggleGroup(groupName) {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  }

  return (
    <div style={styles.container}>
      <button
        onClick={onToggleFeatured}
        style={{
          ...commonStyles.chip,
          ...(showFeatured ? styles.featuredActive : {}),
        }}
      >
        <Star size={12} fill={showFeatured ? colors.bg : 'none'} />
        Destacadas
      </button>

      {categories.map((category) => {
        const isExpanded = expandedGroups[category.name];
        const activeCount = category.tags.filter((t) => selectedTags.includes(t)).length;

        return (
          <div key={category.name} style={styles.group}>
            <button
              onClick={() => toggleGroup(category.name)}
              style={styles.groupHeader}
            >
              <span>
                {category.name}
                {activeCount > 0 && (
                  <span style={styles.badge}>{activeCount}</span>
                )}
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
              <div style={styles.tags}>
                {category.tags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => onToggleTag(tag)}
                      style={{
                        ...commonStyles.chip,
                        ...(isActive ? commonStyles.chipActive : {}),
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {selectedTags.length > 0 && (
        <button
          onClick={() => selectedTags.forEach((t) => onToggleTag(t))}
          style={styles.clearAll}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'flex-start',
    fontFamily: fonts.primary,
  },
  featuredActive: {
    backgroundColor: colors.star,
    color: colors.bg,
    borderColor: colors.star,
  },
  group: {
    position: 'relative',
  },
  groupHeader: {
    ...commonStyles.chip,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: fonts.primary,
  },
  badge: {
    backgroundColor: colors.white,
    color: colors.bg,
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: '600',
    marginLeft: '4px',
  },
  tags: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    zIndex: 50,
    minWidth: '200px',
    maxWidth: '320px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  clearAll: {
    background: 'none',
    border: 'none',
    color: colors.danger,
    cursor: 'pointer',
    fontSize: '12px',
    padding: '6px 10px',
    fontFamily: fonts.primary,
  },
};
