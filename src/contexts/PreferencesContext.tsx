import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Currency = 'BRL' | 'USD' | 'EUR';
export type Language = 'pt-BR' | 'en-US' | 'es';

interface PreferencesContextType {
  currency: Currency;
  language: Language;
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};

const CURRENCY_CONFIG: Record<Currency, { locale: string; currency: string }> = {
  BRL: { locale: 'pt-BR', currency: 'BRL' },
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.habits': 'Hábitos',
    'nav.agenda': 'Agenda',
    'nav.finances': 'Finanças',
    'nav.community': 'Comunidade',
    'nav.selfcare': 'Autocuidado',
    'nav.achievements': 'Conquistas',
    'nav.ranking': 'Ranking',
    'nav.profile': 'Perfil',
    // Greeting
    'greeting.morning': 'Bom dia',
    'greeting.afternoon': 'Boa tarde',
    'greeting.evening': 'Boa noite',
    // Dashboard
    'dashboard.quickStats': 'Resumo Rápido',
    'dashboard.habits': 'Hábitos de Hoje',
    'dashboard.finances': 'Finanças',
    'dashboard.streak': 'Streak',
    'dashboard.days': 'dias',
    'dashboard.level': 'Nível',
    'dashboard.points': 'pontos',
    'dashboard.completed': 'completados',
    // Profile
    'profile.stats': 'Estatísticas',
    'profile.settings': 'Configurações',
    'profile.notifications': 'Notificações',
    'profile.publicProfile': 'Perfil Público',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Conte um pouco sobre você...',
    'profile.interests': 'Interesses',
    'profile.interestsPlaceholder': 'Ex: fitness, finanças, leitura (separados por vírgula)',
    'profile.interestsHelp': 'Seus interesses ajudam a encontrar conexões',
    'profile.preferences': 'Preferências',
    'profile.theme': 'Tema',
    'profile.themeDesc': 'Aparência do app',
    'profile.themeDark': 'Escuro',
    'profile.themeLight': 'Claro',
    'profile.themeSystem': 'Sistema',
    'profile.language': 'Idioma',
    'profile.languageDesc': 'Idioma da interface',
    'profile.currency': 'Moeda',
    'profile.currencyDesc': 'Moeda para exibição',
    'profile.logout': 'Sair da conta',
    'profile.memberSince': 'Membro desde',
    'profile.habitsCompleted': 'Hábitos completados',
    'profile.currentStreak': 'Streak atual',
    'profile.record': 'Recorde',
    'profile.achievements': 'Conquistas',
    'profile.totalXP': 'XP Total',
    'profile.habitProgress': 'Progresso de Hábitos',
    'profile.totalCompleted': 'Total completados',
    'profile.keepGoing': 'Continue completando hábitos para subir de nível!',
    'profile.unlocked': 'Desbloqueadas',
    'profile.of': 'de',
    'profile.completeActions': 'Complete ações para desbloquear conquistas!',
    'profile.characters': 'caracteres',
    'profile.themeUpdated': 'Tema atualizado!',
    'profile.preferenceSaved': 'Preferência salva!',
    'profile.goodbye': 'Até logo! 👋',
    // Notifications
    'notif.habitReminders': 'Lembretes de Hábitos',
    'notif.habitRemindersDesc': 'Receber lembretes',
    'notif.financeAlerts': 'Alertas Financeiros',
    'notif.financeAlertsDesc': 'Gastos e metas',
    'notif.achievements': 'Conquistas',
    'notif.achievementsDesc': 'Novas conquistas',
    'notif.streaksAtRisk': 'Streaks em Risco',
    'notif.streaksAtRiskDesc': 'Aviso de streak',
    'notif.community': 'Comunidade',
    'notif.communityDesc': 'Grupos e desafios',
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.add': 'Adicionar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.loading': 'Carregando...',
    'common.search': 'Buscar...',
    // Finance
    'finance.income': 'Receita',
    'finance.expense': 'Despesa',
    'finance.balance': 'Saldo',
    'finance.savings': 'economia',
  },
  'en-US': {
    'nav.dashboard': 'Dashboard',
    'nav.habits': 'Habits',
    'nav.agenda': 'Agenda',
    'nav.finances': 'Finances',
    'nav.community': 'Community',
    'nav.selfcare': 'Self Care',
    'nav.achievements': 'Achievements',
    'nav.ranking': 'Ranking',
    'nav.profile': 'Profile',
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',
    'dashboard.quickStats': 'Quick Stats',
    'dashboard.habits': "Today's Habits",
    'dashboard.finances': 'Finances',
    'dashboard.streak': 'Streak',
    'dashboard.days': 'days',
    'dashboard.level': 'Level',
    'dashboard.points': 'points',
    'dashboard.completed': 'completed',
    'profile.stats': 'Statistics',
    'profile.settings': 'Settings',
    'profile.notifications': 'Notifications',
    'profile.publicProfile': 'Public Profile',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Tell us about yourself...',
    'profile.interests': 'Interests',
    'profile.interestsPlaceholder': 'E.g.: fitness, finances, reading (comma-separated)',
    'profile.interestsHelp': 'Your interests help find connections',
    'profile.preferences': 'Preferences',
    'profile.theme': 'Theme',
    'profile.themeDesc': 'App appearance',
    'profile.themeDark': 'Dark',
    'profile.themeLight': 'Light',
    'profile.themeSystem': 'System',
    'profile.language': 'Language',
    'profile.languageDesc': 'Interface language',
    'profile.currency': 'Currency',
    'profile.currencyDesc': 'Display currency',
    'profile.logout': 'Sign out',
    'profile.memberSince': 'Member since',
    'profile.habitsCompleted': 'Habits completed',
    'profile.currentStreak': 'Current streak',
    'profile.record': 'Record',
    'profile.achievements': 'Achievements',
    'profile.totalXP': 'Total XP',
    'profile.habitProgress': 'Habit Progress',
    'profile.totalCompleted': 'Total completed',
    'profile.keepGoing': 'Keep completing habits to level up!',
    'profile.unlocked': 'Unlocked',
    'profile.of': 'of',
    'profile.completeActions': 'Complete actions to unlock achievements!',
    'profile.characters': 'characters',
    'profile.themeUpdated': 'Theme updated!',
    'profile.preferenceSaved': 'Preference saved!',
    'profile.goodbye': 'See you! 👋',
    'notif.habitReminders': 'Habit Reminders',
    'notif.habitRemindersDesc': 'Receive reminders',
    'notif.financeAlerts': 'Finance Alerts',
    'notif.financeAlertsDesc': 'Spending and goals',
    'notif.achievements': 'Achievements',
    'notif.achievementsDesc': 'New achievements',
    'notif.streaksAtRisk': 'Streaks at Risk',
    'notif.streaksAtRiskDesc': 'Streak warnings',
    'notif.community': 'Community',
    'notif.communityDesc': 'Groups and challenges',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.search': 'Search...',
    'finance.income': 'Income',
    'finance.expense': 'Expense',
    'finance.balance': 'Balance',
    'finance.savings': 'savings',
  },
  'es': {
    'nav.dashboard': 'Panel',
    'nav.habits': 'Hábitos',
    'nav.agenda': 'Agenda',
    'nav.finances': 'Finanzas',
    'nav.community': 'Comunidad',
    'nav.selfcare': 'Autocuidado',
    'nav.achievements': 'Logros',
    'nav.ranking': 'Ranking',
    'nav.profile': 'Perfil',
    'greeting.morning': 'Buenos días',
    'greeting.afternoon': 'Buenas tardes',
    'greeting.evening': 'Buenas noches',
    'dashboard.quickStats': 'Resumen Rápido',
    'dashboard.habits': 'Hábitos de Hoy',
    'dashboard.finances': 'Finanzas',
    'dashboard.streak': 'Racha',
    'dashboard.days': 'días',
    'dashboard.level': 'Nivel',
    'dashboard.points': 'puntos',
    'dashboard.completed': 'completados',
    'profile.stats': 'Estadísticas',
    'profile.settings': 'Configuraciones',
    'profile.notifications': 'Notificaciones',
    'profile.publicProfile': 'Perfil Público',
    'profile.bio': 'Bio',
    'profile.bioPlaceholder': 'Cuéntanos sobre ti...',
    'profile.interests': 'Intereses',
    'profile.interestsPlaceholder': 'Ej: fitness, finanzas, lectura (separados por coma)',
    'profile.interestsHelp': 'Tus intereses ayudan a encontrar conexiones',
    'profile.preferences': 'Preferencias',
    'profile.theme': 'Tema',
    'profile.themeDesc': 'Apariencia de la app',
    'profile.themeDark': 'Oscuro',
    'profile.themeLight': 'Claro',
    'profile.themeSystem': 'Sistema',
    'profile.language': 'Idioma',
    'profile.languageDesc': 'Idioma de la interfaz',
    'profile.currency': 'Moneda',
    'profile.currencyDesc': 'Moneda de visualización',
    'profile.logout': 'Cerrar sesión',
    'profile.memberSince': 'Miembro desde',
    'profile.habitsCompleted': 'Hábitos completados',
    'profile.currentStreak': 'Racha actual',
    'profile.record': 'Récord',
    'profile.achievements': 'Logros',
    'profile.totalXP': 'XP Total',
    'profile.habitProgress': 'Progreso de Hábitos',
    'profile.totalCompleted': 'Total completados',
    'profile.keepGoing': '¡Sigue completando hábitos para subir de nivel!',
    'profile.unlocked': 'Desbloqueados',
    'profile.of': 'de',
    'profile.completeActions': '¡Completa acciones para desbloquear logros!',
    'profile.characters': 'caracteres',
    'profile.themeUpdated': '¡Tema actualizado!',
    'profile.preferenceSaved': '¡Preferencia guardada!',
    'profile.goodbye': '¡Hasta luego! 👋',
    'notif.habitReminders': 'Recordatorios de Hábitos',
    'notif.habitRemindersDesc': 'Recibir recordatorios',
    'notif.financeAlerts': 'Alertas Financieras',
    'notif.financeAlertsDesc': 'Gastos y metas',
    'notif.achievements': 'Logros',
    'notif.achievementsDesc': 'Nuevos logros',
    'notif.streaksAtRisk': 'Rachas en Riesgo',
    'notif.streaksAtRiskDesc': 'Aviso de racha',
    'notif.community': 'Comunidad',
    'notif.communityDesc': 'Grupos y desafíos',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.add': 'Añadir',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar...',
    'finance.income': 'Ingreso',
    'finance.expense': 'Gasto',
    'finance.balance': 'Saldo',
    'finance.savings': 'ahorro',
  },
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('vidaflow_preferences');
      if (saved) return JSON.parse(saved).currency || 'BRL';
    } catch {}
    return 'BRL';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('vidaflow_preferences');
      if (saved) return JSON.parse(saved).language || 'pt-BR';
    } catch {}
    return 'pt-BR';
  });

  const persist = useCallback((key: string, value: string) => {
    try {
      const saved = localStorage.getItem('vidaflow_preferences');
      const prefs = saved ? JSON.parse(saved) : {};
      prefs[key] = value;
      localStorage.setItem('vidaflow_preferences', JSON.stringify(prefs));
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    persist('currency', c);
  }, [persist]);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    persist('language', l);
  }, [persist]);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations['pt-BR']?.[key] || key;
  }, [language]);

  const formatCurrencyFn = useCallback((value: number): string => {
    const config = CURRENCY_CONFIG[currency];
    return value.toLocaleString(config.locale, {
      style: 'currency',
      currency: config.currency,
    });
  }, [currency]);

  return (
    <PreferencesContext.Provider value={{ 
      currency, language, setCurrency, setLanguage, t, 
      formatCurrency: formatCurrencyFn 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};
