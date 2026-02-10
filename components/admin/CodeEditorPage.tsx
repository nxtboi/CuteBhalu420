import React, { useState } from 'react';
import { generateCodeEditResponse } from '../../services/geminiService';
import { SparklesIcon } from '../icons/Icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yLight as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import PreviewModal from './PreviewModal';

interface CodeEditorPageProps {
    projectFiles: Record<string, string>;
    onUpdateFiles: (updatedFiles: Record<string, { content: string }>) => void;
}

const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ projectFiles, onUpdateFiles }) => {
    const [selectedFile, setSelectedFile] = useState<string>('App.tsx');
    const [prompt, setPrompt] = useState<string>('Change the footer copyright year to 2025 and make the text color lime green.');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string>('');
    const [isPreviewing, setIsPreviewing] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAiResponse('');

        try {
            const allFilesString = Object.entries(projectFiles)
                .map(([path, content]) => `--- START OF FILE ${path} ---\n\n${content}`)
                .join('\n\n');
            
            const fullPrompt = `You are a world-class senior frontend engineer acting as a code generation bot. The user wants to change the current application.
Your task is to generate the necessary code changes based on the user's prompt.
The current application's source code is provided below, with each file delimited by "--- START OF FILE [path] ---".
You MUST only return the full content of the file(s) that need to be changed, enclosed in the specified XML format. Do not add any conversational text or explanations outside of the XML block. Keep your changes minimal to satisfy the user's request.

<changes>
  <change>
    <file>[full_path_of_file_1]</file>
    <description>[description of change]</description>
    <content><![CDATA[Full content of file_1]]></content>
  </change>
</changes>

USER PROMPT:
"${prompt}"

CURRENT APP SOURCE CODE:
${allFilesString}
`;
            const result = await generateCodeEditResponse(fullPrompt);
            setAiResponse(result);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyChanges = () => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(aiResponse, "text/xml");
            const errorNode = xmlDoc.querySelector("parsererror");
            if (errorNode) {
                throw new Error("Failed to parse AI response as XML.");
            }

            const changeNodes = xmlDoc.getElementsByTagName('change');
            if (changeNodes.length === 0) {
                throw new Error("No valid <change> tags found in AI response.");
            }
            
            const updates: Record<string, { content: string }> = {};
            
            for (const node of Array.from(changeNodes)) {
                const file = node.getElementsByTagName('file')[0]?.textContent;
                const content = node.getElementsByTagName('content')[0]?.textContent; 
                if (file && content) {
                    updates[file] = { content };
                }
            }
            
            if (Object.keys(updates).length > 0) {
                onUpdateFiles(updates);
                setAiResponse('');
                setError(null);
                setNotification('Code changes applied successfully to the editor!');
                setTimeout(() => setNotification(''), 4000);
            } else {
                 throw new Error("Parsed XML contained no file content to apply.");
            }

        } catch (e: any) {
            console.error("Failed to parse or apply changes:", e);
            setError(`Failed to apply changes: ${e.message}. Please check the AI response format.`);
        }
    }
    
    const getLanguageForFile = (filename: string) => {
        const extension = filename.split('.').pop();
        switch (extension) {
            case 'tsx': return 'typescript';
            case 'ts': return 'typescript';
            case 'js': return 'javascript';
            case 'json': return 'json';
            case 'html': return 'xml';
            default: return 'plaintext';
        }
    }

    return (
        <div className="relative">
             {notification && (
                <div className="fixed top-24 right-6 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    {notification}
                </div>
            )}
            <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] gap-4">
                {/* File Browser */}
                <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto max-h-[30vh] lg:max-h-none">
                    <h3 className="text-lg font-semibold mb-3">Project Files</h3>
                    <ul>
                        {Object.keys(projectFiles).sort().map(file => (
                            <li key={file}>
                                <button
                                    onClick={() => setSelectedFile(file)}
                                    className={`w-full text-left p-2 rounded-md text-sm ${selectedFile === file ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'}`}
                                >
                                    {file}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Editor and Prompt */}
                <div className="w-full lg:w-3/4 flex flex-col gap-4 h-[70vh] lg:h-full">
                    <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col min-h-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-semibold text-gray-800">Viewing: <span className="font-mono text-blue-600">{selectedFile}</span></h3>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#f9fafb]">
                            <SyntaxHighlighter 
                                language={getLanguageForFile(selectedFile)} 
                                style={syntaxStyle} 
                                showLineNumbers={true}
                                lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#9ca3af', textAlign: 'right' }}
                                customStyle={{ margin: 0, padding: '1rem', background: 'transparent', minHeight: '100%' }} 
                                codeTagProps={{style:{fontFamily: 'monospace', fontSize: '14px'}}}
                            >
                                {projectFiles[selectedFile] || 'File not found.'}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                    <div className="h-2/5 lg:h-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0">
                        <h3 className="text-lg font-semibold mb-3">Prompt</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the changes you want to make..."
                            className="w-full flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none mb-3 text-sm"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 self-start"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Changes'}
                        </button>
                    </div>
                </div>

                {/* AI Response Modal */}
                {(isLoading || aiResponse || error) && (
                    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-xl font-semibold">AI Generated Response</h2>
                                <button onClick={() => { setAiResponse(''); setError(null); setIsLoading(false); }} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                {isLoading && <p className="text-center">Generating response...</p>}
                                {error && <div className="text-red-700 bg-red-100 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{error}</div>}
                                {aiResponse && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">Review the changes below. Click "Apply Changes" to update the editor content.</p>
                                        <div className="bg-gray-50 p-2 rounded-md">
                                            <SyntaxHighlighter language="xml" style={syntaxStyle} customStyle={{ margin: 0, background: 'transparent' }} codeTagProps={{style:{fontFamily: 'monospace'}}}>
                                                {aiResponse}
                                            </SyntaxHighlighter>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {aiResponse && !error && (
                                <div className="p-4 border-t bg-gray-50 flex space-x-4">
                                    <button onClick={handleApplyChanges} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                                        Apply Changes
                                    </button>
                                    <button onClick={() => setIsPreviewing(true)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                                        Preview Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {isPreviewing && (
                    <PreviewModal
                        projectFiles={projectFiles}
                        onClose={() => setIsPreviewing(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CodeEditorPage;