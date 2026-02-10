import React, { useState } from 'react';
import { generatePlaygroundResponse } from '../../services/geminiService';
import { SparklesIcon } from '../icons/Icons';

const PlaygroundPage: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Write a short story about a robot farmer in rural India who helps a village predict the monsoon.');
    const [systemInstruction, setSystemInstruction] = useState<string>('You are a creative storyteller who writes uplifting and imaginative stories.');
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(40);
    const [topP, setTopP] = useState(0.95);

    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResponse('');
        try {
            const result = await generatePlaygroundResponse({
                prompt,
                systemInstruction,
                temperature,
                topK,
                topP,
            });
            setResponse(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Playground</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col gap-4">
                    {/* System Prompt */}
                    <div>
                        <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-1">System Instruction</label>
                        <textarea
                            id="system-prompt"
                            rows={3}
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., You are a helpful assistant."
                        />
                    </div>

                    {/* User Prompt */}
                    <div>
                        <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 mb-1">User Prompt</label>
                        <textarea
                            id="user-prompt"
                            rows={8}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your prompt here..."
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 self-start"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            {/* Config & Response */}
            <div className="w-full lg:w-2/5 flex flex-col gap-6">
                {/* Config */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                    {/* Temperature */}
                    <div className="mb-4">
                        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature: <span className="font-bold">{temperature.toFixed(2)}</span></label>
                        <input
                            type="range"
                            id="temperature"
                            min="0" max="1" step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Top K */}
                    <div className="mb-4">
                         <label htmlFor="topK" className="block text-sm font-medium text-gray-700">Top-K: <span className="font-bold">{topK}</span></label>
                        <input
                            type="range"
                            id="topK"
                            min="1" max="100" step="1"
                            value={topK}
                            onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Top P */}
                    <div>
                         <label htmlFor="topP" className="block text-sm font-medium text-gray-700">Top-P: <span className="font-bold">{topP.toFixed(2)}</span></label>
                        <input
                            type="range"
                            id="topP"
                            min="0" max="1" step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Response */}
                <div className="bg-gray-900 p-6 rounded-lg shadow-md flex-1 overflow-y-auto">
                     <h3 className="text-lg font-semibold mb-4 text-white">Response</h3>
                     {isLoading && <p className="text-gray-400">Generating response...</p>}
                     {error && <p className="text-red-400">{error}</p>}
                     {response && !isLoading && (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">{response}</pre>
                     )}
                     {!isLoading && !response && !error && <p className="text-gray-500">AI response will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;
