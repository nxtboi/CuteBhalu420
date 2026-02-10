// FIX: Create the AppContainer component to resolve module import error and manage app state.
import React, { useState, useCallback } from 'react';
import App from './App';

// A mock of what might come from a virtual file system.
// In a real app, this might be loaded asynchronously.
const initialProjectFiles: Record<string, string> = {
    'README.md': '# Welcome to the Krishi Mitra AI Project!\n\nThis is a sample file. Use the AI Code Editor in the Admin Panel to modify project files.',
};

const AppContainer: React.FC = () => {
    const [projectFiles, setProjectFiles] = useState<Record<string, string>>(initialProjectFiles);

    const handleUpdateFiles = useCallback((updatedFiles: Record<string, { content: string }>) => {
        setProjectFiles(prevFiles => {
            const newFiles = { ...prevFiles };
            for (const path in updatedFiles) {
                // This logic handles both updating existing files and adding new ones.
                newFiles[path] = updatedFiles[path].content;
            }
            // To handle file deletion, the payload would need a different structure.
            // For now, we only support add/update.
            return newFiles;
        });
    }, []);

    return <App projectFiles={projectFiles} onUpdateFiles={handleUpdateFiles} />;
};

export default AppContainer;
