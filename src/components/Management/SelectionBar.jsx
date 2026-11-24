import { useState } from 'react';
import { colors, fonts, commonStyles } from '../../styles/theme';
import { Tag, Star, Download, Trash2, X, Check } from 'lucide-react';

/**
 * Barra fija al pie mientras se seleccionan fotos. Reúne todo lo que se
 * puede hacer con varias a la vez: etiquetar, destacar, descargar y eliminar.
 * El panel de etiquetas se abre encima de la barra.
 */
export default function SelectionBar({
  selectedPhotos,
  categories,
  notice,
  onApplyTags,
  onSetFeatured,
  onDownload,
  onDelete,
  onCancel,
}) {
  const [showTags, setShowTags] = useState(false);
  const [pickedTags, setPickedTags] = useState([]);
  // Se guarda para cuántas fotos se pidió confirmar: si la selección cambia, deja de valer.
  const [confirmFor, setConfirmFor] = useState(null);
  const [busy, setBusy] = useState(false);

  const count = selectedPhotos.length;
  const none = count === 0;
  const allFeatured = !none && selectedPhotos.every((p) => p.featured);
  const plural = count === 1 ? '' : 's';

  const confirmDelete = !none && confirmFor === count;

  function togglePicked(tag) {
    setPickedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function run(action) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function applyTags() {
    await run(() => onApplyTags(pickedTags));
    setPickedTags([]);
    setShowTags(false);
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmFor(count);
      return;
    }
    run(onDelete);
  }

  const disabled = none || busy;

  return (
    <div style={styles.wrapper}>
      {showTags && !none && (
        <div style={styles.panel}>
          <div style={styles.panelInner}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>
                Etiquetar {count} foto{plural}
              </h3>
              <div style={styles.panelHeaderActions}>
                <button
                  onClick={applyTags}
                  disabled={pickedTags.length === 0 || busy}
                  style={{
                    ...commonStyles.button,
                    ...commonStyles.buttonPrimary,
                    ...commonStyles.buttonSmall,
                    opacity: pickedTags.length === 0 || busy ? 0.4 : 1,
                  }}
                >
                  <Check size={14} />
                  {pickedTags.length === 0
                    ? 'Aplicar'
                    : `Aplicar ${pickedTags.length} etiqueta${pickedTags.length === 1 ? '' : 's'}`}
                </button>
                <button
                  onClick={() => setShowTags(false)}
                  style={styles.panelClose}
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={styles.sections}>
              {categories.map((cat) => (
                <div key={cat.name} style={styles.section}>
                  <span style={styles.sectionLabel}>{cat.name}</span>
                  <div style={styles.sectionTags}>
                    {cat.tags.length === 0 && (
                      <span style={styles.emptySection}>Sin etiquetas</span>
                    )}
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => togglePicked(tag)}
                        style={{
                          ...commonStyles.chip,
                          ...styles.tagChip,
                          ...(pickedTags.includes(tag) ? commonStyles.chipActive : {}),
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
        </div>
      )}

      <div style={styles.bar}>
        <div style={styles.barInner}>
          <span style={styles.count}>
            {notice
              ? notice
              : none
                ? 'Pulsa las fotos que quieras seleccionar'
                : `${count} foto${plural} seleccionada${plural}`}
          </span>

          <div style={styles.actions}>
            <button
              onClick={() => setShowTags(!showTags)}
              disabled={disabled}
              style={{
                ...styles.action,
                ...(showTags && !none ? styles.actionActive : {}),
                ...(disabled ? styles.actionDisabled : {}),
              }}
            >
              <Tag size={15} />
              Etiquetar
            </button>
            <button
              onClick={() => run(() => onSetFeatured(!allFeatured))}
              disabled={disabled}
              style={{ ...styles.action, ...(disabled ? styles.actionDisabled : {}) }}
            >
              <Star size={15} fill={allFeatured ? colors.navText : 'none'} />
              {allFeatured ? 'Quitar destacada' : 'Destacar'}
            </button>
            <button
              onClick={onDownload}
              disabled={disabled}
              style={{ ...styles.action, ...(disabled ? styles.actionDisabled : {}) }}
            >
              <Download size={15} />
              Descargar
            </button>
            <button
              onClick={handleDelete}
              disabled={disabled}
              style={{
                ...styles.action,
                ...(confirmDelete ? styles.actionDanger : {}),
                ...(disabled ? styles.actionDisabled : {}),
              }}
            >
              <Trash2 size={15} />
              {confirmDelete ? `¿Eliminar ${count} foto${plural}?` : 'Eliminar'}
            </button>

            <span style={styles.divider} />

            <button onClick={onCancel} style={styles.cancel}>
              <X size={15} />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    fontFamily: fonts.primary,
  },
  panel: {
    backgroundColor: colors.bgSecondary,
    borderTop: `1px solid ${colors.border}`,
    boxShadow: '0 -12px 32px rgba(28,28,26,0.10)',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  panelInner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px 8px',
  },
  panelHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: colors.bgSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '20px 0 16px',
    zIndex: 1,
  },
  panelTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500',
    color: colors.text,
  },
  panelHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  panelClose: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Cada categoría es una fila: su nombre a la izquierda y sus etiquetas a la derecha.
  section: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: '10px 24px',
    padding: '20px 0',
    borderTop: `1px solid ${colors.borderLight}`,
  },
  sectionLabel: {
    flex: '0 0 190px',
    fontSize: '11px',
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    paddingTop: '9px',
  },
  sectionTags: {
    flex: '1 1 320px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  emptySection: {
    fontSize: '13px',
    color: colors.textMuted,
    paddingTop: '7px',
  },
  tagChip: {
    padding: '7px 13px',
    fontSize: '13px',
    fontFamily: fonts.primary,
  },
  bar: {
    backgroundColor: colors.navBg,
    color: colors.navText,
  },
  barInner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 16px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px 20px',
  },
  count: {
    fontSize: '14px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
  },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: fonts.primary,
    color: colors.navText,
    backgroundColor: 'transparent',
    border: '1px solid rgba(243,242,239,0.32)',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap',
  },
  actionActive: {
    backgroundColor: colors.paper,
    border: `1px solid ${colors.paper}`,
    color: colors.black,
  },
  actionDanger: {
    backgroundColor: colors.danger,
    border: `1px solid ${colors.danger}`,
  },
  actionDisabled: {
    opacity: 0.35,
    cursor: 'default',
  },
  divider: {
    width: '1px',
    height: '22px',
    backgroundColor: 'rgba(243,242,239,0.22)',
    margin: '0 4px',
  },
  cancel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 6px',
    fontSize: '13px',
    fontFamily: fonts.primary,
    color: colors.navTextMuted,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
};
