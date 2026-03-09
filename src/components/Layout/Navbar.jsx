import { colors, fonts } from '../../styles/theme';
import { Menu, Search } from 'lucide-react';

export default function Navbar({ onMenuToggle, title }) {
  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <button onClick={onMenuToggle} style={styles.menuBtn}>
          <Menu size={22} />
        </button>
        <span style={styles.title}>{title}</span>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: '56px',
    backgroundColor: colors.bgSecondary,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    fontFamily: fonts.primary,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: '16px',
    fontWeight: '600',
  },
};
