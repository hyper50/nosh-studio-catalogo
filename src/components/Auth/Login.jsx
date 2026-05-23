import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import NoshWordmark from '../Common/NoshWordmark';

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
          <NoshWordmark color={colors.black} width={200} />
        </div>
        <p style={styles.subtitle}>PORTFOLIO MANAGER</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
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
            <label style={styles.label}>CONTRASEÑA</label>
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

        <p style={styles.tagline}>Crafted with quiet precision.</p>
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
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  logoSection: {
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.taupe,
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    marginBottom: '36px',
    marginTop: '4px',
    fontFamily: fonts.primary,
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
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: '0.1em',
    fontFamily: fonts.primary,
  },
  error: {
    backgroundColor: 'rgba(163, 56, 42, 0.08)',
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: '10px 14px',
    fontSize: '13px',
  },
  tagline: {
    color: colors.taupe,
    fontSize: '11px',
    letterSpacing: '0.02em',
    marginTop: '32px',
    fontFamily: fonts.primary,
  },
};
