export const colors = {
  bg: '#0f0f0f',
  bgSecondary: '#1a1a1a',
  bgTertiary: '#242424',
  bgHover: '#2a2a2a',
  bgCard: '#1e1e1e',
  border: '#333',
  borderLight: '#444',
  text: '#e0e0e0',
  textSecondary: '#999',
  textMuted: '#666',
  white: '#fff',
  accent: '#888',
  accentLight: '#aaa',
  danger: '#e74c3c',
  dangerHover: '#c0392b',
  success: '#2ecc71',
  warning: '#f39c12',
  star: '#f1c40f',
  overlay: 'rgba(0,0,0,0.85)',
  overlayLight: 'rgba(0,0,0,0.5)',
};

export const fonts = {
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '50%',
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.3)',
  md: '0 4px 12px rgba(0,0,0,0.4)',
  lg: '0 8px 32px rgba(0,0,0,0.5)',
};

export const commonStyles = {
  input: {
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    color: colors.text,
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: fonts.primary,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '10px 20px',
    borderRadius: radius.sm,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: fonts.primary,
    fontWeight: '500',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonPrimary: {
    backgroundColor: colors.white,
    color: colors.bg,
  },
  buttonSecondary: {
    backgroundColor: colors.bgTertiary,
    color: colors.text,
    border: `1px solid ${colors.border}`,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    color: colors.white,
  },
  buttonSmall: {
    padding: '6px 12px',
    fontSize: '13px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    backgroundColor: colors.bgTertiary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    backgroundColor: colors.white,
    color: colors.bg,
    borderColor: colors.white,
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.white,
    marginBottom: '16px',
  },
};
