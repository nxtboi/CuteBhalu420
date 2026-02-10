import React, { useState, useRef, useEffect } from 'react';
import { Language, LanguageCode } from '../types';
import { GlobeIcon } from './icons/Icons';
import { languages } from '../services/translations';

interface LanguageSelectorProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-sm font-medium p-2 rounded-md transition-colors text-inherit hover:bg-black/10"
      >
        <GlobeIcon className="w-5 h-5" />
        <span>{selectedLanguage.nativeName}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <ul className="py-1">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    language === lang.code
                      ? 'bg-lime-100 text-lime-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lang.nativeName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;