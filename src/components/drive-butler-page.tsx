"use client";

import { useState } from 'react';
import { FileSystemView } from '@/components/file-system-view';
import { ActionLog, type ActionLogItem } from '@/components/action-log';
import { ChatInterface, type Message } from '@/components/chat-interface';
import type { DriveFile } from '@/lib/mock-drive';
import { initialFiles, getFilesByPath, findItemByPath, deleteItem, moveItem } from '@/lib/mock-drive';
import { useToast } from "@/hooks/use-toast";
import { summarizeDocument } from '@/ai/flows/summarize-document';

type DeleteConfirmationState = {
    path: string;
} | null;

export function DriveButlerPage() {
    const [files, setFiles] = useState<DriveFile[]>(initialFiles);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'butler', content: 'Welcome to Drive Butler! How can I help you? You can use commands like LIST, MOVE, DELETE, and SUMMARY.' }
    ]);
    const [logs, setLogs] = useState<ActionLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>(null);
    const { toast } = useToast();

    const addMessage = (sender: 'user' | 'butler', content: React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender, content }]);
    };

    const addLog = (action: string) => {
        setLogs(prev => [{ timestamp: new Date().toLocaleString(), action }, ...prev]);
    };

    const handleCommand = async (command: string) => {
        addMessage('user', command);
        setIsLoading(true);

        if (deleteConfirmation) {
            if (command.toLowerCase() === 'yes') {
                const updatedFiles = deleteItem(files, deleteConfirmation.path);
                setFiles(updatedFiles);
                addMessage('butler', `Successfully deleted '${deleteConfirmation.path}'.`);
                addLog(`DELETE: ${deleteConfirmation.path}`);
            } else {
                addMessage('butler', 'Delete operation canceled.');
                addLog(`CANCEL DELETE: ${deleteConfirmation.path}`);
            }
            setDeleteConfirmation(null);
            setIsLoading(false);
            return;
        }

        const [action, ...args] = command.split(' ');
        const upperCaseAction = action.toUpperCase();
        
        try {
            switch (upperCaseAction) {
                case 'LIST': {
                    const [path = '/'] = args;
                    const items = getFilesByPath(files, path);
                    if (items.length > 0 || path === '/') {
                        const fileList = (
                            <div>
                                <p>Contents of {path}:</p>
                                <ul className="list-disc pl-5 mt-2">
                                    {items.map(item => (
                                        <li key={item.id}>{item.name} {item.type === 'folder' && '/'}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                        addMessage('butler', fileList);
                    } else {
                        addMessage('butler', `Folder '${path}' is empty or does not exist.`);
                    }
                    addLog(`LIST: ${path}`);
                    break;
                }
                case 'DELETE': {
                    const [path] = args;
                    if (!path) {
                        addMessage('butler', 'Please specify a file or folder to delete. Usage: DELETE /path/to/item');
                        break;
                    }
                    const item = findItemByPath(files, path);
                    if (!item) {
                        addMessage('butler', `Item '${path}' not found.`);
                        break;
                    }
                    setDeleteConfirmation({ path });
                    addMessage('butler', `Are you sure you want to delete '${path}'? This action cannot be undone. Type 'yes' to confirm.`);
                    break;
                }
                case 'MOVE': {
                    const [sourcePath, destPath] = args;
                    if (!sourcePath || !destPath) {
                         addMessage('butler', 'Please specify source and destination. Usage: MOVE /source/path /destination/path');
                         break;
                    }
                    const { files: updatedFiles, success, error } = moveItem(files, sourcePath, destPath);
                    if (success) {
                        setFiles(updatedFiles);
                        addMessage('butler', `Successfully moved '${sourcePath}' to '${destPath}'.`);
                        addLog(`MOVE: ${sourcePath} -> ${destPath}`);
                    } else {
                        addMessage('butler', `Error moving file: ${error}`);
                    }
                    break;
                }
                case 'SUMMARY': {
                    const [path] = args;
                    if (!path) {
                        addMessage('butler', 'Please specify a folder to summarize. Usage: SUMMARY /path/to/folder');
                        break;
                    }
                    const folder = findItemByPath(files, path);
                    if (!folder || folder.type !== 'folder') {
                        addMessage('butler', `Folder '${path}' not found.`);
                        break;
                    }

                    const itemsToSummarize = getFilesByPath(files, path).filter(f => f.type === 'file' && f.content);
                    
                    if(itemsToSummarize.length === 0) {
                        addMessage('butler', `No summarizable files found in '${path}'.`);
                        break;
                    }
                    
                    addMessage('butler', `Generating summaries for files in '${path}'...`);
                    
                    for (const item of itemsToSummarize) {
                        try {
                            const result = await summarizeDocument({ folderPath: path, fileContent: item.content! });
                            const summaryContent = (
                                <div className="space-y-2">
                                    <p className="font-bold">{item.name}:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.summary.split('\n').map((s, i) => s.trim().replace(/^\*/, '').trim() && <li key={i}>{s.trim().replace(/^\*/, '').trim()}</li>)}
                                    </ul>
                                </div>
                            );
                            addMessage('butler', summaryContent);
                        } catch (e) {
                            addMessage('butler', `Could not generate summary for ${item.name}.`);
                        }
                    }
                    addLog(`SUMMARY: ${path}`);
                    break;
                }
                default:
                    addMessage('butler', `Unknown command: '${upperCaseAction}'. Available commands are: LIST, DELETE, MOVE, SUMMARY.`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            addMessage('butler', `Error: ${errorMessage}`);
            toast({
                variant: 'destructive',
                title: 'Operation Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen w-screen bg-background text-foreground p-4 overflow-hidden">
            <header className="mb-4">
                <h1 className="text-3xl font-bold text-primary font-headline">Drive Butler</h1>
                <p className="text-muted-foreground">Your personal assistant for Google Drive, right from your chat.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
                <div className="lg:col-span-3 h-full hidden lg:block">
                    <FileSystemView files={files} />
                </div>
                <div className="lg:col-span-6 h-full">
                    <ChatInterface messages={messages} onSendMessage={handleCommand} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-3 h-full hidden lg:block">
                    <ActionLog logs={logs} />
                </div>
            </div>
        </main>
    );
}