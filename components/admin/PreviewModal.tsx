import React, { useState, useEffect } from 'react';

declare const Babel: any; // Assuming Babel Standalone is loaded globally

interface PreviewModalProps {
  projectFiles: Record<string, string>;
  onClose: () => void;
}

// Simple path resolution utility
const resolvePath = (projectFiles: Record<string, string>, currentPath: string, relativePath: string): string => {
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove current file name to get directory
    
    const relativeParts = relativePath.split('/');
    for (const part of relativeParts) {
        if (part === '.') continue;
        if (part === '..') {
            if (pathParts.length > 0) pathParts.pop();
        } else {
            pathParts.push(part);
        }
    }
    
    let resolved = pathParts.join('/');
    // Add extension if missing (naive check)
    if (!/\.\w+$/.test(resolved)) {
        if (projectFiles[resolved + '.ts']) resolved += '.ts';
        else if (projectFiles[resolved + '.tsx']) resolved += '.tsx';
    }
    return resolved;
}

const generatePreviewHtml = (projectFiles: Record<string, string>): { html: string, cleanup: () => void } => {
    const importMap: Record<string, any> = { imports: {} };
    const blobUrlsToRevoke: string[] = [];

    // Base HTML structure
    let baseHtml = projectFiles['index.html'];

    try {
        // Transpile all files and rewrite imports
        const rewrittenCodeMap = new Map<string, string>();

        for (const path in projectFiles) {
            if (/\.(tsx|ts|js)$/.test(path)) {
                let content = projectFiles[path];
                 // Transpile using Babel
                let transpiledCode = Babel.transform(content, {
                    presets: ['react', 'typescript'],
                    filename: path,
                }).code;

                // Rewrite relative imports to use bare specifiers (which will be our paths)
                transpiledCode = transpiledCode.replace(/from\s+['"](\..*?)['"]/g, (_match: string, relativePath: string) => {
                    const absolutePath = resolvePath(projectFiles, path, relativePath);
                    return `from "${absolutePath}"`;
                });
                
                rewrittenCodeMap.set(path, transpiledCode);
            }
        }
        
        // Create Blob URLs and populate the import map
        for (const [path, rewrittenCode] of rewrittenCodeMap.entries()) {
             const blob = new Blob([rewrittenCode], { type: 'application/javascript' });
             const url = URL.createObjectURL(blob);
             blobUrlsToRevoke.push(url);
             importMap.imports[path] = url;
        }

        // Inject the new import map
        const importMapString = JSON.stringify(importMap, null, 2);
        baseHtml = baseHtml.replace(/<script type="importmap">[\s\S]*?<\/script>/, `<script type="importmap">${importMapString}</script>`);

        // Change the entry point to use the module system
        baseHtml = baseHtml.replace(/<script type="module" src="\/index.tsx"><\/script>/, `<script type="module">import "index.tsx";</script>`);

    } catch (e) {
        console.error("Preview generation failed:", e);
        baseHtml = `<body><h1>Preview Failed</h1><pre>${(e as Error).message}</pre></body>`;
    }

    const cleanup = () => {
        blobUrlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };

    return { html: baseHtml, cleanup };
};


const PreviewModal: React.FC<PreviewModalProps> = ({ projectFiles, onClose }) => {
  const [iframeContent, setIframeContent] = useState<string>('');
  
  useEffect(() => {
    const { html, cleanup } = generatePreviewHtml(projectFiles);
    setIframeContent(html);
    
    // Cleanup blob URLs when the component unmounts
    return () => {
        cleanup();
    };
  }, [projectFiles]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">App Preview</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="flex-1 p-2 bg-gray-200">
           <iframe
                srcDoc={iframeContent}
                title="App Preview"
                className="w-full h-full border-0 bg-white rounded-md"
                sandbox="allow-scripts allow-same-origin"
           />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;