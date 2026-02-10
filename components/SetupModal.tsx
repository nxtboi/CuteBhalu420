import React, { useState } from 'react';
import { FarmDetails, Crop, SoilType, LanguageCode } from '../types';
import { LocationIcon } from './icons/Icons';
import translations from '../services/translations';

interface SetupModalProps {
  onComplete: (details: FarmDetails) => void;
  language: LanguageCode;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete, language }) => {
  const [crop, setCrop] = useState<Crop>(Crop.Rice);
  const [soil, setSoil] = useState<SoilType>(SoilType.Alluvial);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const t = (translations.setupModal as any)[language];

  const handleStart = () => {
    setError(null);
    setIsLocating(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onComplete({
          crop,
          soil,
          location: { latitude, longitude },
        });
        setIsLocating(false);
      },
      () => {
        setError(t.buttonError);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">{t.title}</h2>
        <p className="text-gray-600 mb-6 text-center">{t.description}</p>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-1">
              {t.cropLabel}
            </label>
            <select
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value as Crop)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
            >
              {Object.values(Crop).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="soil" className="block text-sm font-medium text-gray-700 mb-1">
              {t.soilLabel}
            </label>
            <select
              id="soil"
              value={soil}
              onChange={(e) => setSoil(e.target.value as SoilType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
            >
              {Object.values(SoilType).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-8">
          <button
            onClick={handleStart}
            disabled={isLocating}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLocating ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.buttonLocating}
                </>
            ) : (
                <>
                    <LocationIcon className="mr-2"/>
                    {t.buttonStart}
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;
