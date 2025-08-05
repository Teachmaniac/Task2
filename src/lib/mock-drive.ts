export interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  content?: string;
}

export const initialFiles: DriveFile[] = [
  {
    id: '1',
    name: 'ProjectX',
    type: 'folder',
    path: '/ProjectX',
  },
  { id: '1-1', name: 'report.pdf', type: 'file', path: '/ProjectX/report.pdf', content: 'This is the main project report for ProjectX. It contains an analysis of market trends and financial projections.' },
  { id: '1-2', name: 'meeting_notes.docx', type: 'file', path: '/ProjectX/meeting_notes.docx', content: 'Meeting on 2024-07-15: Discussed Q3 roadmap. Key takeaways: focus on user acquisition and improve onboarding flow.' },
  {
    id: '2',
    name: 'Archive',
    type: 'folder',
    path: '/Archive',
  },
  {
    id: '3',
    name: 'draft.txt',
    type: 'file',
    path: '/draft.txt',
    content: 'This is a draft document. It is still a work in progress.'
  }
];

export const getFilesByPath = (files: DriveFile[], path: string): DriveFile[] => {
  if (path === '/') {
    return files.filter(f => !f.path.substring(1).includes('/'));
  }
  return files.filter(f => f.path.startsWith(path + '/') && f.path.substring(path.length + 1).split('/').length === 1);
};

export const findItemByPath = (files: DriveFile[], path: string): DriveFile | undefined => {
  return files.find(f => f.path === path);
};

export const deleteItem = (files: DriveFile[], path: string): DriveFile[] => {
  const itemToDelete = findItemByPath(files, path);
  if (!itemToDelete) return files;

  if (itemToDelete.type === 'folder') {
    return files.filter(f => f.id !== itemToDelete.id && !f.path.startsWith(path + '/'));
  }
  
  return files.filter(f => f.id !== itemToDelete.id);
};

export const moveItem = (files: DriveFile[], sourcePath: string, destPath: string): { files: DriveFile[], success: boolean, error?: string } => {
  const itemToMove = findItemByPath(files, sourcePath);
  if (!itemToMove) return { files, success: false, error: `Source '${sourcePath}' not found.` };

  if (destPath !== '/' && (!findItemByPath(files, destPath) || findItemByPath(files, destPath)?.type !== 'folder')) {
    return { files, success: false, error: `Destination folder '${destPath}' not found or is not a folder.` };
  }
  
  const newPathBase = destPath === '/' ? '' : destPath;
  const newPath = `${newPathBase}/${itemToMove.name}`;
  
  if (findItemByPath(files, newPath)) {
    return { files, success: false, error: `An item with the name '${itemToMove.name}' already exists in '${destPath}'.` };
  }
  
  const newFiles = files.map(f => {
    if (f.path.startsWith(sourcePath)) {
      const updatedPath = f.path.replace(sourcePath, newPath);
      return { ...f, path: updatedPath };
    }
    return f;
  });

  return { files: newFiles, success: true };
};