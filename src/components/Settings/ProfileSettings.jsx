import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { colors, fonts, commonStyles } from '../../styles/theme';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function ProfileSettings() {
  const { userProfile, updateUserProfile, changePassword } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSaveName() {
    setSaving(true);
    try {
      await updateUserProfile({ displayName });
      setMessage('Nombre actualizado');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await changePassword(newPassword);
      setMessage('Contraseña actualizada');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: necesitas volver a iniciar sesión para cambiar la contraseña');
    }
    setSaving(false);
  }

  return (
    <div style={styles.container}>
      <h3 style={commonStyles.sectionTitle}>Mi perfil</h3>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.section}>
        <label style={styles.label}>Nombre</label>
        <div style={styles.row}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ ...commonStyles.input, flex: 1 }}
          />
          <button
            onClick={handleSaveName}
            disabled={saving}
            style={{ ...commonStyles.button, ...commonStyles.buttonPrimary, ...commonStyles.buttonSmall }}
          >
            <Save size={14} />
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Email</label>
        <input
          value={userProfile?.email || ''}
          disabled
          style={{ ...commonStyles.input, opacity: 0.5 }}
        />
      </div>

      <div style={styles.divider} />

      <h4 style={styles.subtitle}>Cambiar contraseña</h4>

      <div style={styles.section}>
        <label style={styles.label}>Nueva contraseña</label>
        <div style={styles.row}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...commonStyles.input, flex: 1 }}
            placeholder="Min. 6 caracteres"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={styles.toggleBtn}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Confirmar contraseña</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={commonStyles.input}
          placeholder="Repite la contraseña"
        />
      </div>

      <button
        onClick={handleChangePassword}
        disabled={saving || !newPassword || !confirmPassword}
        style={{
          ...commonStyles.button,
          ...commonStyles.buttonPrimary,
          opacity: saving || !newPassword || !confirmPassword ? 0.5 : 1,
        }}
      >
        Cambiar contraseña
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
  },
  section: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: '6px',
    display: 'block',
  },
  row: {
    display: 'flex',
    gap: '8px',
  },
  message: {
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    padding: '10px',
    color: colors.text,
    fontSize: '13px',
    marginBottom: '16px',
  },
  subtitle: {
    color: colors.white,
    fontSize: '15px',
    fontWeight: '500',
    margin: '0 0 16px 0',
  },
  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: '20px 0',
  },
  toggleBtn: {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
  },
};
