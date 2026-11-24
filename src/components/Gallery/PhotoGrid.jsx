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
  onReorder,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [overId, setOverId] = useState(null);

  const canReorder = typeof onReorder === 'function';
  const draggedIndex = draggedId ? photos.findIndex((p) => p.id === draggedId) : -1;

  function endDrag() {
    setDraggedId(null);
    setOverId(null);
  }

  return (
    <div style={styles.grid}>
      {photos.map((photo, index) => {
        const isSelected = selectedIds.includes(photo.id);
        const isHovered = hoveredId === photo.id;
        const isDragged = draggedId === photo.id;
        const isDropTarget = canReorder && draggedId && overId === photo.id && !isDragged;
        // La marca indica dónde caerá: detrás si viene de arriba, delante si viene de abajo.
        const dropAfter = isDropTarget && draggedIndex < index;

        const dragProps = canReorder
          ? {
              draggable: true,
              onDragStart: (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', photo.id);
                setDraggedId(photo.id);
              },
              onDragOver: (e) => {
                if (!draggedId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overId !== photo.id) setOverId(photo.id);
              },
              onDrop: (e) => {
                if (!draggedId) return;
                e.preventDefault();
                const from = draggedId;
                endDrag();
                if (from !== photo.id) onReorder(from, photo.id);
              },
              onDragEnd: endDrag,
            }
          : {};

        return (
          <div
            key={photo.id}
            {...dragProps}
            style={{
              ...styles.card,
              ...(isSelected ? styles.cardSelected : {}),
              ...(canReorder ? styles.cardDraggable : {}),
              ...(isDragged ? styles.cardDragged : {}),
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
            {isDropTarget && (
              <div
                style={{
                  ...styles.dropMarker,
                  ...(dropAfter ? { right: '-7px' } : { left: '-7px' }),
                }}
              />
            )}

            <div style={styles.imageWrapper}>
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.projectName || 'Foto'}
                style={styles.image}
                loading="lazy"
                draggable={false}
              />

              {(isHovered || isSelected) && !draggedId && (
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
    position: 'relative',
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'opacity 0.15s, border-color 0.2s',
  },
  cardSelected: {
    borderColor: colors.black,
  },
  cardDraggable: {
    cursor: 'grab',
  },
  cardDragged: {
    opacity: 0.35,
  },
  dropMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '3px',
    backgroundColor: colors.black,
    zIndex: 5,
    pointerEvents: 'none',
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
