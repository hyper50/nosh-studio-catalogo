import { useState } from 'react';
import { colors, radius, fonts } from '../../styles/theme';
import { Star, Check } from 'lucide-react';

export default function PhotoGrid({
  photos,
  onPhotoClick,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  showManagement = false,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={styles.grid}>
      {photos.map((photo) => {
        const isSelected = selectedIds.includes(photo.id);
        const isHovered = hoveredId === photo.id;

        return (
          <div
            key={photo.id}
            style={{
              ...styles.card,
              ...(isSelected ? styles.cardSelected : {}),
            }}
            onMouseEnter={() => setHoveredId(photo.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              if (selectable) {
                onToggleSelect(photo.id);
              } else {
                onPhotoClick(photo);
              }
            }}
          >
            <div style={styles.imageWrapper}>
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.projectName || 'Foto'}
                style={styles.image}
                loading="lazy"
              />

              {(isHovered || isSelected) && (
                <div style={styles.overlay}>
                  {selectable && (
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxActive : {}),
                      }}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  )}
                </div>
              )}

              {photo.featured && (
                <div style={styles.starBadge}>
                  <Star size={14} fill={colors.star} color={colors.star} />
                </div>
              )}
            </div>

            {showManagement && photo.projectName && (
              <div style={styles.info}>
                <p style={styles.projectName}>{photo.projectName}</p>
                {photo.clientName && (
                  <p style={styles.clientName}>{photo.clientName}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    padding: '0',
  },
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardSelected: {
    borderColor: colors.black,
  },
  imageWrapper: {
    position: 'relative',
    paddingTop: '75%',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(28,28,26,0.25)',
    display: 'flex',
    padding: '8px',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #F3F2EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#F3F2EF',
    backgroundColor: 'rgba(28,28,26,0.4)',
  },
  checkboxActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
    color: '#F3F2EF',
  },
  starBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(28,28,26,0.6)',
    borderRadius: '50%',
    padding: '4px',
    display: 'flex',
  },
  info: {
    padding: '8px 4px',
  },
  projectName: {
    color: colors.text,
    fontSize: '12px',
    fontWeight: '500',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: fonts.primary,
  },
  clientName: {
    color: colors.textMuted,
    fontSize: '11px',
    margin: '2px 0 0 0',
    fontFamily: fonts.primary,
  },
};
