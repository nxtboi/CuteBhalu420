// FIX: Implement the AI Code Editor component to resolve module import error.
import React, { useState, useEffect } from 'react';
import { generateResponseStream } from '../../services/geminiService';
import { SparklesIcon } from '../icons/Icons';

interface CodeEditorPageProps {
  projectFiles: Record<string, string>;
  onUpdateFiles: (updatedFiles: Record<string, { content: string }>) => void;
}

const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ projectFiles, onUpdateFiles }) => {
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!selectedFile) {
            const firstFile = Object.keys(projectFiles)[0];
            if (firstFile) {
                setSelectedFile(firstFile);
            }
        }
    }, [projectFiles, selectedFile]);

    useEffect(() => {
        if (selectedFile && projectFiles[selectedFile] !== undefined) {
            setFileContent(projectFiles[selectedFile]);
        } else {
            setFileContent('');
        }
    }, [selectedFile, projectFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFile(e.target.value);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFileContent(e.target.value);
    };

    const handleSaveChanges = () => {
        if (selectedFile) {
            onUpdateFiles({ [selectedFile]: { content: fileContent } });
            setSuccessMessage('File saved successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    const handleAiEdit = async () => {
        if (!aiPrompt.trim() || !selectedFile) return;
        setIsLoading(true);

        const fullPrompt = `
You are an expert programmer tasked with modifying a file.
Based on the user's instruction, you must output the COMPLETE, updated content of the file.
DO NOT output only the changed lines, a diff, or any explanations. Just the full, raw file content.

File Path: ${selectedFile}
User Instruction: "${aiPrompt}"

--- CURRENT FILE CONTENT ---
${fileContent}
--- END CURRENT FILE CONTENT ---

New file content:
`;

        try {
            let fullResponse = '';
            await generateResponseStream(
                fullPrompt,
                null,
                (chunk) => {
                    fullResponse += chunk;
                    setFileContent(fullResponse);
                },
                { model: 'gemini-3-pro-preview' } // Use a more powerful model for code
            );
        } catch (error: any) {
            alert(`Error from AI: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fileList = Object.keys(projectFiles);

    return (
        <div className="flex flex-col h-full space-y-4">
            {successMessage && <div className="bg-green-100 text-green-800 p-2 rounded text-center">{successMessage}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                {/* Editor Panel */}
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">File Editor</h3>
                    <select
                        value={selectedFile}
                        onChange={handleFileChange}
                        className="mb-4 p-2 border border-gray-300 rounded-md bg-gray-50"
                    >
                        {fileList.length > 0 ? (
                            fileList.map(path => <option key={path} value={path}>{path}</option>)
                        ) : (
                            <option>No files available</option>
                        )}
                    </select>
                    <textarea
                        value={fileContent}
                        onChange={handleContentChange}
                        className="flex-grow p-2 font-mono text-sm border border-gray-300 rounded-md resize-none w-full h-full"
                        spellCheck="false"
                        disabled={!selectedFile}
                    />
                </div>

                {/* AI Panel */}
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-purple-500" />
                        AI Code Assistant
                    </h3>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={5}
                        className="p-2 font-sans text-sm border border-gray-300 rounded-md resize-y"
                        placeholder="e.g., 'Refactor this component to use React Hooks' or 'Add error handling to the API call'"
                        disabled={isLoading || !selectedFile}
                    />
                    <div className="mt-auto pt-4 flex gap-4">
                         <button
                            onClick={handleSaveChanges}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold"
                            disabled={!selectedFile}
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleAiEdit}
                            disabled={isLoading || !selectedFile || !aiPrompt.trim()}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Generating...' : 'Apply AI Edit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorPage;
