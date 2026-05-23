/* ============================================================
   NOSH STUDIO — Design Tokens (Rebranding 2026)
   Paleta cromática oficial · IBM Plex Sans · Estilo geométrico
   ============================================================ */

export const colors = {
  // Paleta NS 2026
  bg: '#F3F2EF',             // Blanco Roto Cálido — fondo principal
  bgSecondary: '#FFFFFF',    // Blanco — superficies elevadas (cards, modals, sidebar)
  bgTertiary: '#FFFFFF',     // Blanco — inputs, formularios
  bgHover: '#EAE8E4',       // Hover sutil
  bgCard: '#FFFFFF',         // Cards
  border: '#C1B6A8',         // Piedra Clara — bordes, separadores
  borderLight: '#D9D2C9',   // Piedra más suave
  text: '#1C1C1A',           // Negro Cálido — texto principal
  textSecondary: '#4D4B46', // Gris Mineral — texto secundario, labels
  textMuted: '#8A8378',      // Taupe Profundo — texto terciario, hints
  white: '#1C1C1A',          // Color de énfasis (botones primarios, chips activos)
  accent: '#8A8378',         // Taupe — acento
  accentLight: '#C1B6A8',   // Piedra Clara
  danger: '#A3382A',         // Rojo cálido
  dangerHover: '#8A2E22',
  success: '#2D7A4A',        // Verde cálido
  warning: '#B87A14',        // Ámbar cálido
  star: '#B87A14',           // Estrella/destacado
  overlay: 'rgba(28,28,26,0.80)',
  overlayLight: 'rgba(28,28,26,0.40)',
  // Navbar (elemento oscuro)
  navBg: '#1C1C1A',
  navText: '#F3F2EF',
  navTextMuted: '#8A8378',
  // Aliases
  paper: '#F3F2EF',
  stone: '#C1B6A8',
  mineral: '#4D4B46',
  taupe: '#8A8378',
  black: '#1C1C1A',
};

export const fonts = {
  primary: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  sm: '0',
  md: '0',
  lg: '0',
  full: '50%',
};

export const shadows = {
  sm: '0 1px 3px rgba(28,28,26,0.08)',
  md: '0 4px 12px rgba(28,28,26,0.10)',
  lg: '0 8px 32px rgba(28,28,26,0.12)',
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
    backgroundColor: colors.black,
    color: colors.paper,
  },
  buttonSecondary: {
    backgroundColor: colors.bgTertiary,
    color: colors.text,
    border: `1px solid ${colors.border}`,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    color: '#F3F2EF',
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
    borderRadius: '0',
    fontSize: '12px',
    backgroundColor: colors.bgTertiary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    backgroundColor: colors.black,
    color: colors.paper,
    borderColor: colors.black,
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
    fontWeight: '500',
    color: colors.text,
    marginBottom: '16px',
    fontFamily: fonts.primary,
    letterSpacing: '0',
  },
};
