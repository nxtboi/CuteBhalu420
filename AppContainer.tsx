import React, { useState } from 'react';
import App from './App';
import { initialProjectFiles } from './virtualFileSystem';

const AppContainer: React.FC = () => {
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>(initialProjectFiles);

  const handleUpdateFiles = (updatedFiles: Record<string, { content: string }>) => {
    setProjectFiles(prevFiles => {
      const newFiles = { ...prevFiles };
      for (const path in updatedFiles) {
        // Ensure we only update files that are part of our virtual system
        if (newFiles.hasOwnProperty(path)) {
          newFiles[path] = updatedFiles[path].content;
        }
      }
      return newFiles;
    });
  };

  return <App projectFiles={projectFiles} onUpdateFiles={handleUpdateFiles} />;
};

export default AppContainer;
