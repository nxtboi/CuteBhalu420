import React, { useState } from 'react';
import { LanguageCode, Crop, SoilType } from '../types';
import { generateResponseStream } from '../services/geminiService';
import translations, { languages } from '../services/translations';
import { WaterDropIcon } from './icons/Icons';

interface IrrigationPlannerPageProps {
  language: LanguageCode;
}

const renderTextWithFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g).filter(part => part);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-200 text-sm rounded px-1 font-mono">{part.slice(1, -1)}</code>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>;
    });
};

const IrrigationPlannerPage: React.FC<IrrigationPlannerPageProps> = ({ language }) => {
  const [crop, setCrop] = useState<Crop>(Crop.Rice);
  const [age, setAge] = useState<string>('30');
  const [soil, setSoil] = useState<SoilType>(SoilType.Alluvial);
  const [weather, setWeather] = useState<'Sunny' | 'Cloudy' | 'Rainy'>('Sunny');

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (translations.irrigationPlannerPage as any)[language];

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPlan(''); // Use empty string to start accumulating chunks
    setError(null);
    
    const langName = languages.find(l => l.code === language)?.name || 'English';

    const prompt = `
        You are an agricultural expert providing advice to Indian farmers. Your response must be in ${langName}.

        Create a detailed and practical irrigation plan for the following situation:
        - Crop: ${crop}
        - Age of Crop: ${age} days
        - Soil Type: ${soil}
        - Current Weather: ${weather}

        Your response should be easy to understand and formatted with the following sections using markdown-style bolding for titles:

        **1. Irrigation Frequency:** How often should the farmer irrigate (e.g., every X days)?
        **2. Water Amount:** How much water is needed per irrigation session (e.g., in inches, or liters per plant/area)? Be specific.
        **3. Best Time to Irrigate:** What is the most effective time of day to water the crop?
        **4. Key Considerations & Tips:** Provide 2-3 important tips specific to this crop, soil, and weather combination. For example, mention signs of over/under-watering or specific techniques.
    `;
    
    try {
        await generateResponseStream(
            prompt, 
            null, 
            (chunk) => {
              setPlan(prevPlan => (prevPlan || '') + chunk);
            },
            { model: 'gemini-3-flash-preview' } // Use the faster model for planning
        );
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        setPlan(null);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-inherit h-full">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">{t.title}</h1>
          <p className="text-gray-600 mb-6">{t.description}</p>
          
          <form onSubmit={handleGeneratePlan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crop Selection */}
              <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700">{t.cropLabel}</label>
                <select id="crop" value={crop} onChange={e => setCrop(e.target.value as Crop)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 bg-white text-gray-900">
                  {Object.values(Crop).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Crop Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">{t.ageLabel}</label>
                <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} required min="1" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 bg-white text-gray-900" />
              </div>

              {/* Soil Type */}
              <div>
                <label htmlFor="soil" className="block text-sm font-medium text-gray-700">{t.soilLabel}</label>
                <select id="soil" value={soil} onChange={e => setSoil(e.target.value as SoilType)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 bg-white text-gray-900">
                  {Object.values(SoilType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Weather Condition */}
              <div>
                <label htmlFor="weather" className="block text-sm font-medium text-gray-700">{t.weatherLabel}</label>
                <select id="weather" value={weather} onChange={e => setWeather(e.target.value as any)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 bg-white text-gray-900">
                  <option value="Sunny">{t.weatherSunny}</option>
                  <option value="Cloudy">{t.weatherCloudy}</option>
                  <option value="Rainy">{t.weatherRainy}</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 text-sm font-medium text-white bg-lime-600 rounded-md shadow-sm hover:bg-lime-700 disabled:bg-gray-400">
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.generatingButton}
                    </>
                ) : t.generateButton}
              </button>
            </div>
          </form>
        </div>

        {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <p>{error}</p>
            </div>
        )}

        {plan && (
            <div className="mt-6 bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-4">
                        <WaterDropIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{t.resultTitle}</h2>
                </div>
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap max-w-none">
                    {renderTextWithFormatting(plan)}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default IrrigationPlannerPage;