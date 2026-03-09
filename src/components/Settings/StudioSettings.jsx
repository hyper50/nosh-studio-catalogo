import { useState, useRef } from 'react';
import { db, storage } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { colors, fonts, radius, commonStyles } from '../../styles/theme';
import { Upload, Save, Image } from 'lucide-react';

export default function StudioSettings({ settings, onUpdate }) {
  const [name, setName] = useState(settings?.name || 'Nosh Studio');
  const [logoPreview, setLogoPreview] = useState(settings?.logoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const logoRef = ref(storage, 'studio/logo');
      await uploadBytes(logoRef, file);
      const url = await getDownloadURL(logoRef);
      setLogoPreview(url);
      await onUpdate({ logoUrl: url });
      setMessage('Logo actualizado');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error al subir el logo');
    }
    setUploading(false);
  }

  async function handleSaveName() {
    setSaving(true);
    try {
      await onUpdate({ name });
      setMessage('Nombre actualizado');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error al guardar');
    }
    setSaving(false);
  }

  return (
    <div style={styles.container}>
      <h3 style={commonStyles.sectionTitle}>Datos del estudio</h3>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.section}>
        <label style={styles.label}>Nombre del estudio</label>
        <div style={styles.row}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <label style={styles.label}>Logo (se muestra en modo presentación)</label>
        <div style={styles.logoArea}>
          {logoPreview ? (
            <div style={styles.logoPreview}>
              <img src={logoPreview} alt="Logo" style={styles.logoImg} />
            </div>
          ) : (
            <div style={styles.noLogo}>
              <Image size={32} color={colors.textMuted} />
              <p style={styles.noLogoText}>Sin logo</p>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={{ ...commonStyles.button, ...commonStyles.buttonSecondary }}
          >
            <Upload size={16} />
            {uploading ? 'Subiendo...' : 'Subir logo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ display: 'none' }}
          />
        </div>
        <p style={styles.hint}>
          Recomendación: logo apaisado en formato PNG con fondo transparente, colores claros para que se vea bien sobre fondo oscuro.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '12px',
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: '8px',
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
    color: colors.success,
    fontSize: '13px',
    marginBottom: '16px',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.sm,
  },
  logoPreview: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
  },
  logoImg: {
    height: '48px',
    objectFit: 'contain',
  },
  noLogo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  noLogoText: {
    color: colors.textMuted,
    fontSize: '12px',
    margin: 0,
  },
  hint: {
    color: colors.textMuted,
    fontSize: '11px',
    marginTop: '8px',
    lineHeight: '1.4',
  },
};
