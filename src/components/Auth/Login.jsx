import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <h1 style={styles.logoText}>NOSH</h1>
          <p style={styles.logoSubtext}>STUDIO</p>
        </div>
        <p style={styles.subtitle}>Portfolio Manager</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={commonStyles.input}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={commonStyles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...commonStyles.button,
              ...commonStyles.buttonPrimary,
              width: '100%',
              marginTop: '8px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: '20px',
    fontFamily: fonts.primary,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  logoSection: {
    marginBottom: '4px',
  },
  logoText: {
    fontSize: '36px',
    fontWeight: '700',
    color: colors.white,
    letterSpacing: '8px',
    margin: 0,
  },
  logoSubtext: {
    fontSize: '14px',
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: '6px',
    margin: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: '13px',
    marginBottom: '32px',
    marginTop: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  error: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: '10px 14px',
    borderRadius: radius.sm,
    fontSize: '13px',
  },
};
