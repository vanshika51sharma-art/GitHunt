// GitHub Repository Ingestion Service for GitHunt
// Single-call tree extraction, heuristic candidate selection, and on-demand file streaming

import { FileNode, RepositoryMetadata, PresetIsland } from '../types/githunt';
import { PRESET_ISLANDS } from '../data/islandPresets';

const SOURCE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'go', 'rs', 'c', 'cpp',
  'h', 'hpp', 'cs', 'rb', 'php', 'swift', 'kt', 'dart', 'scala',
  'html', 'css', 'json', 'md', 'sh', 'sql'
]);

const IGNORED_PATHS = [
  'node_modules', '.git', '.github', 'dist', 'build', '.next', '.nuxt',
  'coverage', 'vendor', '__pycache__', '.venv', 'package-lock.json',
  'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock', 'composer.lock', '.min.js', '.min.css'
];

export interface ParsedRepoTarget {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(input: string): ParsedRepoTarget | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();

  // Pattern 1: Full URL https://github.com/owner/repo
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/;
  const urlMatch = clean.match(urlRegex);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, '')
    };
  }

  // Pattern 2: owner/repo
  const shortRegex = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/;
  const shortMatch = clean.match(shortRegex);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/, '')
    };
  }

  return null;
}

/**
 * Gets auth headers if user provided GitHub Personal Access Token
 */
function getGitHubHeaders(): HeadersInit {
  const token = localStorage.getItem('githunt_github_token');
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
}

/**
 * Validates repo exists and fetches metadata
 */
export async function fetchRepositoryMetadata(owner: string, repo: string): Promise<RepositoryMetadata> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: getGitHubHeaders() });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Uncharted territory! Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (res.status === 403) {
      throw new Error(`The GitHub Kraken rate-limited our ship! Add a GitHub Token in Settings or raid a Curated Preset Island.`);
    }
    throw new Error(`GitHub navigation failed (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return {
    owner: data.owner?.login || owner,
    repo: data.name || repo,
    fullName: data.full_name || `${owner}/${repo}`,
    description: data.description || 'An uncharted pirate repository.',
    stars: data.stargazers_count || 0,
    language: data.language || 'Code',
    defaultBranch: data.default_branch || 'main',
    isPreset: false,
  };
}

/**
 * Fetches the entire repository tree in ONE call via Git Trees API
 */
export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<FileNode[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(url, { headers: getGitHubHeaders() });

  if (!res.ok) {
    // If recursive tree fails, try default branch 'master' or fallback to contents
    if (branch === 'main') {
      return fetchRepositoryTree(owner, repo, 'master');
    }
    throw new Error(`Could not chart the island's tree: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Invalid tree payload from GitHub API.');
  }

  // Filter out unwanted files
  const filteredItems = data.tree.filter((item: { path: string; size?: number; type: string }) => {
    const p = item.path;
    // Check ignored paths
    for (const ign of IGNORED_PATHS) {
      if (p.includes(ign)) return false;
    }
    // If it's a blob, check file extension & size
    if (item.type === 'blob') {
      const ext = p.split('.').pop()?.toLowerCase();
      if (!ext || !SOURCE_EXTENSIONS.has(ext)) return false;
      if (item.size && item.size > 500000) return false; // skip > 500KB
    }
    return true;
  });

  return buildTreeStructure(filteredItems);
}

/**
 * Builds a hierarchical nested tree from a flat list of GitHub paths
 */
function buildTreeStructure(items: { path: string; type: string; size?: number }[]): FileNode[] {
  const rootNodes: FileNode[] = [];
  const map = new Map<string, FileNode>();

  // Sort paths so parents are processed before or properly structured
  items.sort((a, b) => a.path.localeCompare(b.path));

  for (const item of items) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const ext = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;

    const node: FileNode = {
      path: item.path,
      name,
      type: item.type === 'tree' ? 'tree' : 'blob',
      size: item.size,
      language: getLanguageFromExtension(ext),
      children: item.type === 'tree' ? [] : undefined,
    };

    map.set(item.path, node);

    if (parts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parentNode = map.get(parentPath);
      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  }

  return rootNodes;
}

/**
 * Converts a preset island into full file tree nodes
 */
export function buildPresetTree(island: PresetIsland): FileNode[] {
  const filePaths = Object.keys(island.files);
  const items = filePaths.map(p => ({
    path: p,
    type: 'blob',
    size: island.files[p].length,
  }));
  return buildTreeStructure(items);
}

/**
 * Fetches raw source code content for a single file on demand
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  filePath: string,
  branch: string = 'main',
  presetIsland?: PresetIsland
): Promise<string> {
  // If it's a preset island, return from virtual filesystem
  if (presetIsland && presetIsland.files[filePath]) {
    return presetIsland.files[filePath];
  }

  // Raw GitHub content URL is faster and avoids API rate limits
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  
  try {
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      return await rawRes.text();
    }
  } catch {
    // Fall back to API
  }

  // Fallback to GitHub contents API
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const apiRes = await fetch(apiUrl, { headers: getGitHubHeaders() });
  
  if (!apiRes.ok) {
    throw new Error(`Failed to load file contents for "${filePath}"`);
  }

  const apiData = await apiRes.json();
  if (apiData.content && apiData.encoding === 'base64') {
    return decodeURIComponent(
      atob(apiData.content.replace(/\s/g, ''))
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  throw new Error('Unsupported content format returned from repository.');
}

/**
 * Selects candidate treasure files from a file tree using heuristics
 */
export function selectCandidateFiles(nodes: FileNode[], limit: number = 5): string[] {
  const allBlobs: FileNode[] = [];

  function traverse(list: FileNode[]) {
    for (const node of list) {
      if (node.type === 'blob') {
        const ext = node.name.split('.').pop()?.toLowerCase();
        // Prioritize meaningful source files over config/doc files
        if (['ts', 'js', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'cs'].includes(ext || '')) {
          allBlobs.push(node);
        }
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);

  // Score candidate files by path heuristics (e.g. src/, lib/, utils/, algorithms/, core/)
  const scored = allBlobs.map(node => {
    let score = 0;
    const p = node.path.toLowerCase();
    if (p.startsWith('src/') || p.startsWith('lib/')) score += 30;
    if (p.includes('util') || p.includes('algo') || p.includes('service') || p.includes('helper')) score += 20;
    if (p.includes('core') || p.includes('engine') || p.includes('handler')) score += 15;
    if (p.includes('test') || p.includes('spec')) score -= 25; // deprioritize test files
    if (p.endsWith('.d.ts')) score -= 50;
    return { path: node.path, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.path);
}

export function getLanguageFromExtension(ext?: string): string {
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'cpp':
    case 'c':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'rb':
      return 'ruby';
    case 'php':
      return 'php';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'sql':
      return 'sql';
    default:
      return 'plaintext';
  }
}
