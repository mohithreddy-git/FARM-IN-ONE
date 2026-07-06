import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import mr from './locales/mr.json';

export const languageOptions = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'hi', label: 'हिन्दी', flag: 'HI' },
  { code: 'te', label: 'తెలుగు', flag: 'TE' },
  { code: 'ta', label: 'தமிழ்', flag: 'TA' },
  { code: 'mr', label: 'मराठी', flag: 'MR' }
] as const;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
    ta: { translation: ta },
    mr: { translation: mr }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: true
  }
});

export default i18n;
