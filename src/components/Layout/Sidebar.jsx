import { colors, fonts, radius } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutGrid, Presentation, Settings, LogOut, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, currentView, onNavigate }) {
  const { logout, userProfile } = useAuth();

  const menuItems = [
    { id: 'management', label: 'Gestión', icon: LayoutGrid },
    { id: 'presentation', label: 'Presentación', icon: Presentation },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.logoText}>NOSH</h2>
            <p style={styles.logoSubtext}>STUDIO</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {(userProfile?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{userProfile?.displayName || 'Usuario'}</p>
            <p style={styles.userEmail}>{userProfile?.email}</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={styles.logoutBtn}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 998,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: colors.bgSecondary,
    borderRight: `1px solid ${colors.border}`,
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: fonts.primary,
    animation: 'slideIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 20px 16px',
    borderBottom: `1px solid ${colors.border}`,
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: colors.white,
    letterSpacing: '5px',
    margin: 0,
  },
  logoSubtext: {
    fontSize: '10px',
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: '4px',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '4px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    borderBottom: `1px solid ${colors.border}`,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.white,
    fontWeight: '600',
    fontSize: '16px',
    flexShrink: 0,
  },
  userName: {
    color: colors.white,
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: '2px 0 0 0',
  },
  nav: {
    flex: 1,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: radius.sm,
    border: 'none',
    background: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: fonts.primary,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: {
    backgroundColor: colors.bgTertiary,
    color: colors.white,
  },
  footer: {
    padding: '16px 10px',
    borderTop: `1px solid ${colors.border}`,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: radius.sm,
    border: 'none',
    background: 'none',
    color: colors.danger,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: fonts.primary,
    width: '100%',
    textAlign: 'left',
  },
};
