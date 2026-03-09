import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { defaultCategories } from './utils/defaultCategories';
import { colors, fonts } from './styles/theme';

import Login from './components/Auth/Login';
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

  useEffect(() => {
    if (currentUser) {
      loadAppData();
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
        <div>
          <h1 style={styles.loadingText}>NOSH</h1>
          <p style={styles.loadingSubtext}>STUDIO</p>
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
          <ManagementView categories={categories} />
        )}
        {currentView === 'presentation' && (
          <PresentationView categories={categories} studioSettings={studioSettings} />
        )}
        {currentView === 'settings' && (
          <SettingsView
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
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
  loadingText: {
    fontSize: '36px',
    fontWeight: '700',
    color: colors.white,
    letterSpacing: '8px',
    margin: 0,
  },
  loadingSubtext: {
    fontSize: '14px',
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: '6px',
    margin: 0,
  },
};
