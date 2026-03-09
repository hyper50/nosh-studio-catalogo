import { useState, useEffect, useCallback } from 'react';
import { colors, fonts, radius } from '../../styles/theme';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function PhotoViewer({ photos, currentIndex, onClose, onToggleFeatured, showFeaturedToggle = false }) {
  const [index, setIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState(null);

  const photo = photos[index];

  const goNext = useCallback(() => {
    if (index < photos.length - 1) setIndex(index + 1);
  }, [index, photos.length]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  }

  if (!photo) return null;

  return (
    <div
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={styles.topBar}>
        <div style={styles.counter}>
          {index + 1} / {photos.length}
        </div>
        <div style={styles.topActions}>
          {showFeaturedToggle && onToggleFeatured && (
            <button
              onClick={() => onToggleFeatured(photo.id)}
              style={styles.actionBtn}
            >
              <Star
                size={20}
                fill={photo.featured ? colors.star : 'none'}
                color={photo.featured ? colors.star : colors.white}
              />
            </button>
          )}
          <button onClick={onClose} style={styles.actionBtn}>
            <X size={22} />
          </button>
        </div>
      </div>

      <div style={styles.imageArea}>
        {index > 0 && (
          <button onClick={goPrev} style={{ ...styles.navBtn, left: '16px' }}>
            <ChevronLeft size={28} />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.projectName || 'Foto'}
          style={styles.image}
        />

        {index < photos.length - 1 && (
          <button onClick={goNext} style={{ ...styles.navBtn, right: '16px' }}>
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {photo.projectName && (
        <div style={styles.bottomBar}>
          <p style={styles.projectLabel}>{photo.projectName}</p>
          {photo.clientName && (
            <p style={styles.clientLabel}>{photo.clientName}</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.primary,
    userSelect: 'none',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
  },
  counter: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
  topActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  imageArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    padding: '60px 20px',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
    zIndex: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    textAlign: 'center',
  },
  projectLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '15px',
    fontWeight: '500',
    margin: 0,
  },
  clientLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    margin: '4px 0 0 0',
  },
};
