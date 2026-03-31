'use client';

import { File, Folder } from 'lucide-react';

interface FileNode {
  path: string;
  type: 'blob' | 'tree';
}

export default function FileTree({ tree }: { tree: FileNode[] }) {
  if (!tree || tree.length === 0) return <div className="text-gray-500">No files found.</div>;

  const displayTree = tree.slice(0, 20);

  return (
    <div className="p-4 pixel-border bg-retro-black/80 h-full overflow-y-auto">
      <h3 className="text-retro-purple mb-4 text-xl">FILE SYSTEM</h3>
      <ul className="space-y-2">
        {displayTree.map((node, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {node.type === 'tree' ? (
              <Folder className="w-4 h-4 text-retro-purple" />
            ) : (
              <File className="w-4 h-4 text-retro-green" />
            )}
            <span className="truncate">{node.path}</span>
          </li>
        ))}
        {tree.length > 20 && <li className="text-gray-500">...and {tree.length - 20} more</li>}
      </ul>
    </div>
  );
}
