import { colors, fonts } from '../../styles/theme';
import { Menu } from 'lucide-react';
import NoshWordmark from '../Common/NoshWordmark';

export default function Navbar({ onMenuToggle, title }) {
  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <button onClick={onMenuToggle} style={styles.menuBtn}>
          <Menu size={20} />
        </button>
        <NoshWordmark color={colors.navText} width={110} />
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: '52px',
    backgroundColor: colors.navBg,
    borderBottom: 'none',
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
    gap: '14px',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: colors.navText,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
  },
};
