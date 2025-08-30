import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import all translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import bn from '../locales/bn.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import pa from '../locales/pa.json';
import or from '../locales/or.json';
import ur from '../locales/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  mr: { translation: mr },
  gu: { translation: gu },
  bn: { translation: bn },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Language configuration with RTL support
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', rtl: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', rtl: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', rtl: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', rtl: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
];

export const getCurrentLanguage = () => {
  return languages.find(lang => lang.code === i18n.language) || languages[0];
};

export const isRTL = () => {
  return getCurrentLanguage().rtl;
};
