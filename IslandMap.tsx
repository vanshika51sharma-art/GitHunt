import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Compass, 
  Flame, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { FileNode, Temperature } from '../types/githunt';
import { calculateSonarState } from '../utils/sonarRadar';

interface IslandMapProps {
  tree: FileNode[];
  selectedFilePath: string | null;
  targetFilePath: string;
  onSelectFile: (path: string) => void;
}

interface TreeNodeItemProps {
  node: FileNode;
  depth: number;
  selectedFilePath: string | null;
  targetFilePath: string;
  onSelectFile: (path: string) => void;
  searchTerm: string;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  selectedFilePath,
  targetFilePath,
  onSelectFile,
  searchTerm,
}) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // Expand top-level by default
  const isSelected = selectedFilePath === node.path;
  const isFolder = node.type === 'tree';

  // Calculate live proximity for this node
  const proximity = useMemo(() => {
    return calculateSonarState(node.path, targetFilePath);
  }, [node.path, targetFilePath]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  };

  const getTempDot = (temp: Temperature) => {
    switch (temp) {
      case 'hot':
        return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50 shrink-0" title="🔥 Hot Cove" />;
      case 'warm':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="🌡️ Warm Cove" />;
      case 'cold':
        return <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 dark:bg-cyan-500/60 light:bg-sky-500 shrink-0" title="❄️ Cold" />;
      default:
        return null;
    }
  };

  return (
    <div className="select-none font-mono text-xs">
      {/* Node Row */}
      <div
        onClick={handleToggle}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        className={`group flex items-center justify-between gap-1.5 py-1.5 pr-2 rounded-lg cursor-pointer transition-all duration-150 ${
          isSelected
            ? 'bg-amber-500/20 dark:bg-amber-500/20 light:bg-amber-100 text-amber-400 dark:text-amber-300 light:text-amber-900 border border-amber-500/40 dark:border-amber-500/40 light:border-amber-400 shadow-sm'
            : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-ocean-bridge/80 dark:hover:bg-ocean-bridge/80 light:hover:bg-slate-100 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Folder expand/collapse chevron */}
          {isFolder ? (
            <button className="text-slate-400 group-hover:text-amber-400 p-0.5">
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Icon */}
          {isFolder ? (
            isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 shrink-0" />
            )
          ) : (
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-cyan-400 dark:text-cyan-400 light:text-sky-600'}`} />
          )}

          {/* Name */}
          <span className={`truncate ${isSelected ? 'font-bold' : ''}`}>
            {node.name}
          </span>
        </div>

        {/* Right side proximity badge / size */}
        <div className="flex items-center gap-1.5 shrink-0">
          {getTempDot(proximity.temperature)}
          {node.language && !isFolder && (
            <span className="text-[10px] text-slate-400 opacity-60 group-hover:opacity-100 uppercase">
              {node.language}
            </span>
          )}
        </div>
      </div>

      {/* Children */}
      {isFolder && isOpen && node.children && (
        <div className="relative border-l border-ocean-border/40 dark:border-ocean-border/40 light:border-slate-200 ml-3">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFilePath={selectedFilePath}
              targetFilePath={targetFilePath}
              onSelectFile={onSelectFile}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const IslandMap: React.FC<IslandMapProps> = ({
  tree,
  selectedFilePath,
  targetFilePath,
  onSelectFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return tree;

    const term = searchTerm.toLowerCase();

    function filterNode(node: FileNode): FileNode | null {
      if (node.type === 'blob') {
        return node.name.toLowerCase().includes(term) || node.path.toLowerCase().includes(term)
          ? node
          : null;
      }

      if (node.children) {
        const filteredChildren = node.children
          .map(filterNode)
          .filter(Boolean) as FileNode[];

        if (filteredChildren.length > 0 || node.name.toLowerCase().includes(term)) {
          return { ...node, children: filteredChildren };
        }
      }

      return null;
    }

    return tree.map(filterNode).filter(Boolean) as FileNode[];
  }, [tree, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-ocean-deck/90 dark:bg-ocean-deck/90 light:bg-white border border-ocean-border dark:border-ocean-border light:border-slate-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md transition-colors">
      
      {/* Explorer Header */}
      <div className="p-3 border-b border-ocean-border dark:border-ocean-border light:border-slate-200 flex items-center justify-between gap-2 bg-ocean-hull/60 dark:bg-ocean-hull/60 light:bg-slate-50">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400 dark:text-amber-400 light:text-amber-600" />
          <span className="font-cinzel text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 tracking-wider">
            Island Map & Coves
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600 px-1.5 py-0.5 rounded bg-ocean-deck dark:bg-ocean-deck light:bg-slate-100 border border-ocean-border dark:border-ocean-border light:border-slate-300">
          {tree.length} Root Nodes
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-200 bg-ocean-void/30 dark:bg-ocean-void/30 light:bg-slate-50/50">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coves & files..."
            className="w-full bg-ocean-deck dark:bg-ocean-deck light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-mono pl-8 pr-3 py-1.5 rounded-lg border border-ocean-border dark:border-ocean-border light:border-slate-300 focus:border-amber-500/60 outline-none"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            No coves matching "{searchTerm}"
          </div>
        ) : (
          filteredTree.map((node) => (
            <TreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              selectedFilePath={selectedFilePath}
              targetFilePath={targetFilePath}
              onSelectFile={onSelectFile}
              searchTerm={searchTerm}
            />
          ))
        )}
      </div>

      {/* Footer Legend */}
      <div className="p-2 border-t border-ocean-border/60 dark:border-ocean-border/60 light:border-slate-200 bg-ocean-hull/40 dark:bg-ocean-hull/40 light:bg-slate-50 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Hot Cove
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Warm
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">Click file to explore</span>
      </div>

    </div>
  );
};
