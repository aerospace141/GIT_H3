import { useEffect, useState } from 'react';
import en from '../ui/en.json';
import hi from '../ui/hi.json';

const languages = { en, hi };

export const useTranslation = () => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const t = (key) => {
    return languages[lang][key] || key;
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return { t, lang, changeLanguage };
};
