// FIX: Implement the AI Playground component to resolve module import error.
import React, { useState } from 'react';
import { generateResponseStream } from '../../services/geminiService';

const PlaygroundPage: React.FC = () => {
    const [prompt, setPrompt] = useState('Write a short story about a farmer who finds a mysterious, glowing seed.');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('gemini-3-pro-preview');
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(40);
    const [topP, setTopP] = useState(0.95);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setResponse('');
        try {
            let fullResponse = '';
            await generateResponseStream(
                prompt,
                null,
                (chunk) => {
                    fullResponse += chunk;
                    setResponse(fullResponse);
                },
                { model, config: { temperature, topK, topP } }
            );
        } catch (error: any) {
            setResponse(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Playground</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                    <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="gemini-3-flash-preview">Gemini 3 Flash (Basic)</option>
                        <option value="gemini-3-pro-preview">Gemini 3 Pro (Advanced)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature: {temperature}</label>
                    <input
                        type="range" id="temperature" min="0" max="1" step="0.1" value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                 <div>
                    <label htmlFor="topP" className="block text-sm font-medium text-gray-700">Top-P: {topP}</label>
                    <input
                        type="range" id="topP" min="0" max="1" step="0.05" value={topP}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                <textarea
                    id="prompt"
                    rows={8}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
            >
                {isLoading ? 'Generating...' : 'Generate Response'}
            </button>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Response</h3>
                <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md min-h-[200px] whitespace-pre-wrap font-mono text-sm overflow-y-auto max-h-96">
                    {response || <span className="text-gray-400">AI response will appear here...</span>}
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;