import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { UserPlus, Trash2, Copy, Check } from 'lucide-react';

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function handleCreateUser() {
    if (!newEmail || !newPassword || !newName) return;
    setCreating(true);
    setMessage('');

    try {
      // Note: Creating users requires Firebase Admin SDK or a Cloud Function
      // For now, we store the user info and they'll need to be created in Firebase Console
      // or through a Cloud Function endpoint
      setMessage(
        `Para crear el usuario, ve a Firebase Console > Authentication > Add user.\n` +
        `Email: ${newEmail}\n` +
        `Contraseña: ${newPassword}\n` +
        `Después el usuario podrá iniciar sesión y su perfil se creará automáticamente.`
      );
      setShowCreate(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
    } catch (err) {
      setMessage('Error al crear usuario: ' + err.message);
    }
    setCreating(false);
  }

  function copyCredentials() {
    const text = `Email: ${newEmail}\nContraseña: ${newPassword}`;
    navigator.clipboard.writeText(text);
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={commonStyles.sectionTitle}>Usuarios</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ ...commonStyles.button, ...commonStyles.buttonPrimary, ...commonStyles.buttonSmall }}
        >
          <UserPlus size={14} />
          Nuevo usuario
        </button>
      </div>

      {message && (
        <div style={styles.message}>
          <pre style={styles.messageText}>{message}</pre>
        </div>
      )}

      {showCreate && (
        <div style={styles.createForm}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={commonStyles.input}
              placeholder="Nombre del empleado"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={commonStyles.input}
              placeholder="empleado@email.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña temporal</label>
            <div style={styles.passRow}>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...commonStyles.input, flex: 1 }}
                placeholder="Contraseña"
              />
              <button
                onClick={generatePassword}
                style={{ ...commonStyles.button, ...commonStyles.buttonSecondary, ...commonStyles.buttonSmall }}
              >
                Generar
              </button>
            </div>
          </div>
          <div style={styles.formActions}>
            <button
              onClick={() => setShowCreate(false)}
              style={{ ...commonStyles.button, ...commonStyles.buttonSecondary, ...commonStyles.buttonSmall }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateUser}
              disabled={creating || !newEmail || !newPassword || !newName}
              style={{
                ...commonStyles.button,
                ...commonStyles.buttonPrimary,
                ...commonStyles.buttonSmall,
                opacity: creating || !newEmail || !newPassword || !newName ? 0.5 : 1,
              }}
            >
              Crear usuario
            </button>
          </div>
        </div>
      )}

      <div style={styles.userList}>
        {users.map((user) => (
          <div key={user.id} style={styles.userItem}>
            <div style={styles.userAvatar}>
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user.displayName || 'Sin nombre'}</p>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
            <p style={styles.userDate}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : ''}
            </p>
          </div>
        ))}

        {users.length === 0 && (
          <p style={styles.empty}>No hay usuarios registrados.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  message: {
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    padding: '12px',
    marginBottom: '16px',
  },
  messageText: {
    color: colors.text,
    fontSize: '13px',
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
  createForm: {
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.sm,
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  passRow: {
    display: 'flex',
    gap: '8px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '8px',
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.sm,
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.white,
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
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
  userDate: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
    flexShrink: 0,
  },
  empty: {
    color: colors.textMuted,
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px',
  },
};
