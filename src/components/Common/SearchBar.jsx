import { Search, X } from 'lucide-react';
import { colors, radius, fonts } from '../../styles/theme';

export default function SearchBar({ value, onChange, placeholder = 'Buscar por proyecto, cliente o etiqueta...' }) {
  return (
    <div style={styles.container}>
      <Search size={18} style={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      {value && (
        <button onClick={() => onChange('')} style={styles.clearBtn}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    color: colors.textMuted,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 36px 10px 40px',
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: '14px',
    fontFamily: fonts.primary,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  clearBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    color: colors.textMuted,
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },
};
