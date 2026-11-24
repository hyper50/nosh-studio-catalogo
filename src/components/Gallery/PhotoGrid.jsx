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

              {showManagement && photo.projectName && (
                <div style={styles.info}>
                  <p style={styles.projectName}>{photo.projectName}</p>
                  {photo.clientName && (
                    <p style={styles.clientName}>{photo.clientName}</p>
                  )}
                </div>
              )}

              {(selectable || isHovered) && !draggedId && (
                <div
                  style={{
                    ...styles.overlay,
                    ...(isHovered ? styles.overlayHover : {}),
                    ...(isSelected ? styles.overlaySelected : {}),
                  }}
                >
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
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    // 180 px de mínimo: siete columnas en el ancho completo de la app.
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '10px',
    padding: '0',
  },
  card: {
    position: 'relative',
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
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
    display: 'flex',
    padding: '8px',
  },
  overlayHover: {
    background: 'rgba(28,28,26,0.18)',
  },
  // El marco de la foto elegida se dibuja por dentro para no mover la cuadrícula.
  overlaySelected: {
    background: 'rgba(28,28,26,0.10)',
    boxShadow: `inset 0 0 0 3px ${colors.black}`,
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
    borderColor: '#F3F2EF',
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
  // Nombre del proyecto sobre la propia foto, en una franja oscura que se funde.
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '30px 10px 9px',
    background:
      'linear-gradient(to top, rgba(28,28,26,0.88) 0%, rgba(28,28,26,0.62) 55%, rgba(28,28,26,0) 100%)',
    pointerEvents: 'none',
  },
  projectName: {
    color: '#F3F2EF',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.01em',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: fonts.primary,
  },
  clientName: {
    color: 'rgba(243,242,239,0.72)',
    fontSize: '11px',
    margin: '2px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: fonts.primary,
  },
};
