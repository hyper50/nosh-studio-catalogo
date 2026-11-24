import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch,
} from 'firebase/firestore';
import { defaultCategories } from './utils/defaultCategories';
import { purgeExpiredTrash } from './utils/trashCleanup';
import { normalize, withSortedTags } from './utils/search';
import { colors, fonts } from './styles/theme';

import Login from './components/Auth/Login';
import NoshWordmark from './components/Common/NoshWordmark';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ManagementView from './components/Management/ManagementView';
import PresentationView from './components/Presentation/PresentationView';
import SettingsView from './components/Settings/SettingsView';

function AppContent() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('management');
  const [categories, setCategories] = useState([]);
  const [studioSettings, setStudioSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Lo que ven las pantallas: cada categoría con sus etiquetas en orden alfabético.
  const sortedCategories = useMemo(() => withSortedTags(categories), [categories]);

  useEffect(() => {
    if (currentUser) {
      loadAppData();
      // Vacía en segundo plano lo que lleva más de 30 días en la papelera.
      purgeExpiredTrash().catch((err) => console.error('Error limpiando la papelera:', err));
    }
  }, [currentUser]);

  async function loadAppData() {
    try {
      const catRef = doc(db, 'settings', 'categories');
      const catSnap = await getDoc(catRef);
      if (catSnap.exists()) {
        setCategories(catSnap.data().list || []);
      } else {
        await setDoc(catRef, { list: defaultCategories });
        setCategories(defaultCategories);
      }

      const studioRef = doc(db, 'settings', 'studio');
      const studioSnap = await getDoc(studioRef);
      if (studioSnap.exists()) {
        setStudioSettings(studioSnap.data());
      } else {
        const defaults = { name: 'Nosh Studio', logoUrl: '' };
        await setDoc(studioRef, defaults);
        setStudioSettings(defaults);
      }
    } catch (err) {
      console.error('Error loading app data:', err);
    }
    setLoading(false);
  }

  async function handleAddCategory(newCat) {
    const updated = [...categories, newCat];
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
  }

  async function handleUpdateCategory(oldName, newName) {
    const updated = categories.map((c) =>
      c.name === oldName ? { ...c, name: newName } : c
    );
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
  }

  async function handleDeleteCategory(name) {
    const updated = categories.filter((c) => c.name !== name);
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
  }

  async function handleAddTag(categoryName, tag) {
    const updated = categories.map((c) =>
      c.name === categoryName ? { ...c, tags: [...c.tags, tag] } : c
    );
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
  }

  // Corrige el nombre de una etiqueta en la lista y en todas las fotos que la
  // llevan (también las de la papelera). Primero las fotos: si algo falla a
  // medias, la etiqueta antigua sigue en la lista y se puede repetir.
  async function handleRenameTag(oldTag, newTag) {
    const name = newTag.trim();
    if (!name || name === oldTag) return 0;
    const taken = categories.some((c) =>
      c.tags.some((t) => t !== oldTag && normalize(t) === normalize(name))
    );
    if (taken) throw new Error(`Ya existe una etiqueta «${name}».`);

    const snap = await getDocs(
      query(collection(db, 'photos'), where('tags', 'array-contains', oldTag))
    );
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = writeBatch(db);
      snap.docs.slice(i, i + 400).forEach((d) => {
        const tags = [...new Set((d.data().tags || []).map((t) => (t === oldTag ? name : t)))];
        batch.update(doc(db, 'photos', d.id), { tags });
      });
      await batch.commit();
    }

    const updated = categories.map((c) => ({
      ...c,
      tags: [...new Set(c.tags.map((t) => (t === oldTag ? name : t)))],
    }));
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
    return snap.docs.length;
  }

  async function handleDeleteTag(categoryName, tag) {
    const updated = categories.map((c) =>
      c.name === categoryName
        ? { ...c, tags: c.tags.filter((t) => t !== tag) }
        : c
    );
    setCategories(updated);
    await updateDoc(doc(db, 'settings', 'categories'), { list: updated });
  }

  async function handleUpdateStudio(data) {
    const updated = { ...studioSettings, ...data };
    setStudioSettings(updated);
    await setDoc(doc(db, 'settings', 'studio'), updated, { merge: true });
  }

  if (!currentUser) {
    return <Login />;
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingInner}>
          <NoshWordmark color={colors.black} width={180} />
        </div>
      </div>
    );
  }

  const viewTitles = {
    management: 'Gestión',
    presentation: 'Presentación',
    settings: 'Ajustes',
  };

  return (
    <div style={styles.app}>
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        title={viewTitles[currentView]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <main style={styles.main}>
        {currentView === 'management' && (
          <ManagementView categories={sortedCategories} />
        )}
        {currentView === 'presentation' && (
          <PresentationView categories={sortedCategories} studioSettings={studioSettings} />
        )}
        {currentView === 'settings' && (
          <SettingsView
            categories={sortedCategories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
            onRenameTag={handleRenameTag}
            studioSettings={studioSettings}
            onUpdateStudio={handleUpdateStudio}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    fontFamily: fonts.primary,
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    fontFamily: fonts.primary,
    textAlign: 'center',
  },
  loadingInner: {
    display: 'flex',
    justifyContent: 'center',
    opacity: 0.85,
  },
};
