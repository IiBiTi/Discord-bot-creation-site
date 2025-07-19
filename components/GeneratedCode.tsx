
import React, { useState, useMemo, useEffect } from 'react';
import { GeneratedCodeProps } from '../types';
import { generateFileContent as generateProjectFiles } from './code-generators/all';
import { CopyIcon } from './icons/CopyIcon';
import { FolderIcon } from './icons/FolderIcon';
import { JavaScriptIcon } from './icons/JavaScriptIcon';
import { TypeScriptIcon } from './icons/TypeScriptIcon';
import { PythonIcon } from './icons/PythonIcon';
import { CodeIcon } from './icons/CodeIcon';
import { FileIcon } from './icons/FileIcon';


// =======================================================================================
// UI COMPONENTS
// =======================================================================================

const getIconForFile = (fileName: string) => {
    const lowerCaseName = fileName.toLowerCase();
    if (lowerCaseName.endsWith('.js')) return <JavaScriptIcon className="w-5 h-5 flex-shrink-0" />;
    if (lowerCaseName.endsWith('.ts')) return <TypeScriptIcon className="w-5 h-5 flex-shrink-0" />;
    if (lowerCaseName.endsWith('.py')) return <PythonIcon className="w-5 h-5 flex-shrink-0" />;
    if (lowerCaseName.endsWith('.json')) return <CodeIcon className="w-5 h-5 flex-shrink-0" />;
    if (lowerCaseName.includes('readme')) return <FileIcon className="w-5 h-5 flex-shrink-0 text-blue-400" />;
    if (lowerCaseName.includes('.env')) return <FileIcon className="w-5 h-5 flex-shrink-0 text-yellow-400" />;
    return <FileIcon className="w-5 h-5 flex-shrink-0" />;
};


const CodeViewer: React.FC<{ path: string; code: string }> = ({ path, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = useMemo(() => code.split('\n'), [code]);

    return (
        <div className="flex flex-col h-full bg-gray-900/60">
            <div className="flex-shrink-0 flex justify-between items-center p-3 bg-gray-800/70 border-b border-gray-700">
                <p className="font-mono text-sm text-gray-400">{path}</p>
                <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <span className="text-xs text-green-400">Copied!</span>
                    ) : (
                        <CopyIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
            <div className="flex-grow overflow-auto font-mono text-sm">
                <div className="flex">
                    <div className="line-numbers text-right pr-4 text-gray-600 sticky top-0 ltr:left-0 rtl:right-0 bg-gray-900/60 pt-4 select-none">
                        {lines.map((_, i) => (
                            <div key={i} className="h-[20px] leading-[20px]">{i + 1}</div>
                        ))}
                    </div>
                    <pre className="p-4 whitespace-pre text-gray-300">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

interface FileTree {
    rootFiles: string[];
    directories: Record<string, string[]>;
}

export const GeneratedCode: React.FC<GeneratedCodeProps> = (props) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const { files, fileTree } = useMemo(() => {
        const { generatedFiles, ...otherFiles } = generateProjectFiles(props);
        const allFiles: Record<string, string> = {
            ...(otherFiles as Record<string, string>),
            ...Object.fromEntries(generatedFiles.map(f => [f.name, f.content]))
        };

        const tree: FileTree = { rootFiles: [], directories: {} };
        const directoriesSet = new Set<string>();

        Object.keys(allFiles).forEach(path => {
            if (path.includes('/')) {
                const parts = path.split('/');
                const dir = parts[0];
                const fileName = parts.slice(1).join('/');
                if (!tree.directories[dir]) {
                    tree.directories[dir] = [];
                    directoriesSet.add(dir);
                }
                tree.directories[dir].push(fileName || path); // handle case like 'cogs/'
            } else {
                tree.rootFiles.push(path);
            }
        });
        
        tree.rootFiles.sort((a, b) => a.localeCompare(b));
        Object.values(tree.directories).forEach(files => files.sort((a,b) => a.localeCompare(b)));

        setExpandedFolders(new Set(directoriesSet));

        return { files: allFiles, fileTree: tree };
    }, [props]);

    useEffect(() => {
        const filePaths = Object.keys(files);
        if (!selectedFile || !filePaths.includes(selectedFile)) {
            setSelectedFile(filePaths.includes('README.md') ? 'README.md' : filePaths[0] || null);
        }
    }, [files, selectedFile]);

    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderName)) {
                newSet.delete(folderName);
            } else {
                newSet.add(folderName);
            }
            return newSet;
        });
    };
    
    const FileItem: React.FC<{ path: string, fullPath: string, level?: number }> = ({ path, fullPath, level = 0 }) => (
        <button
            onClick={() => setSelectedFile(fullPath)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors text-left ${
                selectedFile === fullPath ? 'bg-purple-600/30 text-white' : 'text-gray-300 hover:bg-gray-700/50'
            }`}
            style={{ paddingInlineStart: `${12 + level * 16}px` }}
        >
            {getIconForFile(path)}
            <span>{path}</span>
        </button>
    );

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-lg mt-8 animate-fade-in min-h-[60vh] flex flex-col md:flex-row overflow-hidden">
            {/* File Explorer */}
            <div className="w-full md:w-1/3 md:max-w-xs p-3 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto max-h-64 md:max-h-full">
                <div className="space-y-1">
                    {/* Render Directories First */}
                     {Object.entries(fileTree.directories).sort(([a], [b]) => a.localeCompare(b)).map(([dirName, filesInDir]) => (
                        <div key={dirName}>
                            <button
                                onClick={() => toggleFolder(dirName)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-gray-200 hover:bg-gray-700/50 text-left"
                            >
                                <FolderIcon className="w-5 h-5 flex-shrink-0 text-purple-400" />
                                <span className="font-semibold">{dirName}</span>
                            </button>
                            {expandedFolders.has(dirName) && (
                                <div className="mt-1 space-y-1">
                                    {filesInDir.map(file => (
                                        <FileItem key={`${dirName}/${file}`} path={file} fullPath={`${dirName}/${file}`} level={1} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Render Root Files */}
                    {fileTree.rootFiles.map(file => (
                        <FileItem key={file} path={file} fullPath={file} />
                    ))}
                </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 min-w-0">
                {selectedFile && files[selectedFile] !== undefined ? (
                    <CodeViewer path={selectedFile} code={files[selectedFile].trim()} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a file to view its content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const downloadProjectAsZip = async (props: GeneratedCodeProps) => {
    const { downloadProjectAsZip: download } = await import('./code-generators/all');
    return download(props);
};
