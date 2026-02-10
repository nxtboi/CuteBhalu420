import React, { useState } from 'react';
import { rawTranslations } from '../../services/translations';

const TranslationsEditor: React.FC = () => {
  const [jsonString, setJsonString] = useState(JSON.stringify(rawTranslations, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(e.target.value);
    try {
      JSON.parse(e.target.value);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format. Please correct the syntax.');
    }
  };

  const handleCopyToClipboard = () => {
    if (error) {
        alert("Cannot copy invalid JSON.");
        return;
    }
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy.');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleReset = () => {
      if(window.confirm("Are you sure you want to reset all changes?")) {
        setJsonString(JSON.stringify(rawTranslations, null, 2));
        setError(null);
      }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Translations Editor</h2>
      <p className="text-gray-600 mb-6">
        Edit the translations below. After making changes, copy the JSON and replace the content of the `services/translations.ts` file.
      </p>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <textarea
          value={jsonString}
          onChange={handleJsonChange}
          className={`w-full h-[60vh] p-4 font-mono text-sm border rounded-md focus:ring-2 focus:outline-none ${
            error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
          }`}
          spellCheck="false"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={handleCopyToClipboard}
          disabled={!!error}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {copySuccess ? copySuccess : 'Copy to Clipboard'}
        </button>
         <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default TranslationsEditor;
