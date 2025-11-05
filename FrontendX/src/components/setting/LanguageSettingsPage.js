import React from 'react';
import { useTranslation } from './useTranslation';

const LanguageSettings = () => {
  const { t, lang, changeLanguage } = useTranslation();

  return (
    <div style={{ padding: 20 }}>
      <h2>{t('changeLanguage')}</h2>
      <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>

      <p>{t('greeting')}</p>
    </div>
  );
};

export default LanguageSettings;
