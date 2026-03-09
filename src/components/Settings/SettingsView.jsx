import { useState } from 'react';
import { colors, fonts, radius } from '../../styles/theme';
import { Tags, Users, User, Trash2, Building2 } from 'lucide-react';
import CategoriesManager from './CategoriesManager';
import UsersManager from './UsersManager';
import ProfileSettings from './ProfileSettings';
import TrashBin from './TrashBin';
import StudioSettings from './StudioSettings';

const tabs = [
  { id: 'categories', label: 'Categorías', icon: Tags },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'profile', label: 'Mi perfil', icon: User },
  { id: 'trash', label: 'Papelera', icon: Trash2 },
  { id: 'studio', label: 'Datos estudio', icon: Building2 },
];

export default function SettingsView({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddTag,
  onDeleteTag,
  studioSettings,
  onUpdateStudio,
}) {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
            >
              <Icon size={16} />
              <span style={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.content}>
        {activeTab === 'categories' && (
          <CategoriesManager
            categories={categories}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onAddTag={onAddTag}
            onDeleteTag={onDeleteTag}
          />
        )}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'trash' && <TrashBin />}
        {activeTab === 'studio' && (
          <StudioSettings settings={studioSettings} onUpdate={onUpdateStudio} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: fonts.primary,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 56px)',
  },
  tabs: {
    display: 'flex',
    overflowX: 'auto',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.bgSecondary,
    padding: '0 8px',
    gap: '4px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 14px',
    border: 'none',
    background: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: fonts.primary,
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: colors.white,
    borderBottomColor: colors.white,
  },
  tabLabel: {},
  content: {
    flex: 1,
    padding: '20px 16px',
  },
};
