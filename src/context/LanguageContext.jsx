import { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  en: {
    managePlatform: 'Manage your eco platform',
    signOut: 'Sign Out',
    language: 'Language',
    dashboard: 'Dashboard',
    userManagement: 'User Management',
    userDetail: 'User Detail',
    activityLogs: 'Activity Logs',
    leaderboard: 'Leaderboard',
    customGreenActions: 'Custom Green Actions',
    milestones: 'Milestones',
    ecoBadges: 'Eco Badges',
    quests: 'Quests',
    rankLogs: 'Rank Logs',
    rankHistory: 'Rank History',
    achieved: 'Achieved',
    locked: 'Locked',
    achievedOn: 'Achieved on',
    achievedByUsers: 'Achieved by {count} users',
    noRankLogs: 'No Rank Logs',
    noRankLogsDesc: 'No rank progression data available yet.',
    addQuest: 'Add Quest',
    createQuest: 'Create Quest',
    updateQuest: 'Update Quest',
    saving: 'Saving...',
    achievedBy: 'Achieved by',
    users: 'users',
    target: 'Target',
    reward: 'Reward',
  },
  id: {
    managePlatform: 'Kelola platform eco kamu',
    signOut: 'Keluar',
    language: 'Bahasa',
    dashboard: 'Dashboard',
    userManagement: 'Manajemen User',
    userDetail: 'Detail User',
    activityLogs: 'Log Aktivitas',
    leaderboard: 'Peringkat',
    customGreenActions: 'Aksi Hijau Custom',
    milestones: 'Milestone',
    ecoBadges: 'Eco Badge',
    quests: 'Misi',
    rankLogs: 'Log Rank',
    rankHistory: 'Riwayat Rank',
    achieved: 'Tercapai',
    locked: 'Terkunci',
    achievedOn: 'Dicapai pada',
    achievedByUsers: 'Dicapai oleh {count} user',
    noRankLogs: 'Belum Ada Log Rank',
    noRankLogsDesc: 'Belum ada data pencapaian rank.',
    addQuest: 'Tambah Misi',
    createQuest: 'Buat Misi',
    updateQuest: 'Perbarui Misi',
    saving: 'Menyimpan...',
    achievedBy: 'Dicapai oleh',
    users: 'user',
    target: 'Target',
    reward: 'Reward',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('admin_language') || 'en');

  const value = useMemo(() => ({
    language,
    setLanguage: (next) => {
      localStorage.setItem('admin_language', next);
      setLanguage(next);
    },
    t: (key, values = {}) => {
      let text = translations[language]?.[key] || translations.en[key] || key;
      Object.entries(values).forEach(([name, value]) => {
        text = text.replace(`{${name}}`, value);
      });
      return text;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAdminLanguage() {
  return useContext(LanguageContext);
}
