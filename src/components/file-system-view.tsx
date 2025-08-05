"use client";

import type { DriveFile } from '@/lib/mock-drive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, FileText, HardDrive } from 'lucide-react';
import React from 'react';
import { ScrollArea } from './ui/scroll-area';

interface FileSystemViewProps {
  files: DriveFile[];
}

const renderTree = (files: DriveFile[]) => {
  const tree: { [key:string]: any } = {};

  files.forEach(file => {
    let pathParts = file.path.split('/').filter(p => p.length > 0);
    let currentNode = tree;
    pathParts.forEach((part, index) => {
      if (!currentNode[part]) {
        currentNode[part] = { 
            _name: part, 
            _type: 'folder', 
            _children: {} 
        };
      }
      if (index === pathParts.length - 1) {
        currentNode[part]._type = file.type;
      }
      currentNode = currentNode[part]._children;
    });
  });

  const FileSystemNode = ({ name, node, level }: { name: string, node: any, level: number }) => {
    const isFolder = node._type === 'folder';
    const children = Object.keys(node._children).length > 0 ? Object.entries(node._children).map(([childName, childNode]) => (
        <FileSystemNode key={childName} name={childName} node={childNode as any} level={level + 1} />
    )) : null;

    return (
      <div style={{ paddingLeft: `${level * 1.25}rem`}}>
        <div className="flex items-center gap-2 py-1 text-sm">
          {isFolder ? <Folder className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
          <span>{name}</span>
        </div>
        {children}
      </div>
    );
  };
  
  return Object.entries(tree).map(([name, node]) => (
    <FileSystemNode key={name} name={name} node={node as any} level={0} />
  ));
};

export function FileSystemView({ files }: FileSystemViewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <span>My Drive</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
            <div className="flex items-center gap-2 py-1 text-sm">
                <Folder className="h-4 w-4 text-primary"/>
                <span className="font-medium">/</span>
            </div>
            {renderTree(files)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}