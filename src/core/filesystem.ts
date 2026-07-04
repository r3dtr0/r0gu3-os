// Virtual File System for Code Editor
export interface VfsNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: VfsNode[];
}

const defaultFiles: VfsNode[] = [
  {
    name: 'src',
    type: 'directory',
    children: [
      {
        name: 'components',
        type: 'directory',
        children: [
          { name: 'Button.tsx', type: 'file', content: 'import React from "react";\n\ninterface ButtonProps {\n  label: string;\n  onClick: () => void;\n}\n\nexport const Button: React.FC<ButtonProps> = ({ label, onClick }) => {\n  return (\n    <button\n      className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition"\n      onClick={onClick}\n    >\n      {label}\n    </button>\n  );\n};\n' },
          { name: 'Card.tsx', type: 'file', content: 'import React from "react";\n\nexport const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  return (\n    <div className="p-4 bg-gray-800 rounded-lg shadow">\n      {children}\n    </div>\n  );\n};\n' },
        ],
      },
      {
        name: 'hooks',
        type: 'directory',
        children: [
          { name: 'useCounter.ts', type: 'file', content: 'import { useState } from "react";\n\nexport function useCounter(initial = 0) {\n  const [count, setCount] = useState(initial);\n  const increment = () => setCount(c => c + 1);\n  const decrement = () => setCount(c => c - 1);\n  const reset = () => setCount(initial);\n  return { count, increment, decrement, reset };\n}\n' },
        ],
      },
      { name: 'App.tsx', type: 'file', content: 'import React from "react";\nimport { Button } from "./components/Button";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-gray-900 text-white p-8">\n      <h1 className="text-3xl font-bold mb-4">Hello R0GU3 OS</h1>\n      <Button label="Click me" onClick={() => alert("Hello!")} />\n    </div>\n  );\n}\n' },
      { name: 'main.tsx', type: 'file', content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n' },
      { name: 'index.css', type: 'file', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  background: #12121a;\n  color: #e8e8f0;\n}\n' },
      { name: 'utils.ts', type: 'file', content: 'export function formatDate(date: Date): string {\n  return new Intl.DateTimeFormat("en-US", {\n    year: "numeric",\n    month: "short",\n    day: "2-digit",\n  }).format(date);\n}\n\nexport function clamp(value: number, min: number, max: number): number {\n  return Math.min(Math.max(value, min), max);\n}\n\nexport function sleep(ms: number): Promise<void> {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}\n' },
    ],
  },
  { name: 'package.json', type: 'file', content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}\n' },
  { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>\n' },
  { name: 'README.md', type: 'file', content: '# My App\n\nA React application built for R0GU3 OS.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Scripts\n\n- `dev` - Start development server\n- `build` - Build for production\n' },
  { name: 'vite.config.ts', type: 'file', content: 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "tailwindcss";\n\nexport default defineConfig({\n  plugins: [react()],\n  css: {\n    postcss: {\n      plugins: [tailwindcss()],\n    },\n  },\n});\n' },
];

let vfs: VfsNode[] = [...defaultFiles];

try {
  const saved = localStorage.getItem('rogue_vfs');
  if (saved) vfs = JSON.parse(saved);
} catch { /* ignore */ }

function saveVfs() {
  localStorage.setItem('rogue_vfs', JSON.stringify(vfs));
}

export function getVfs(): VfsNode[] {
  return vfs;
}

export function findNode(path: string): VfsNode | null {
  if (path === '' || path === '/') return { name: 'root', type: 'directory', children: vfs };
  const parts = path.split('/').filter(Boolean);
  let current: VfsNode | undefined = { name: 'root', type: 'directory', children: vfs };
  for (const part of parts) {
    if (!current?.children) return null;
    current = current.children.find(c => c.name === part);
  }
  return current ?? null;
}

export function readFile(path: string): string | null {
  const node = findNode(path);
  return node?.type === 'file' ? (node.content ?? '') : null;
}

export function writeFile(path: string, content: string): boolean {
  const parts = path.split('/').filter(Boolean);
  const fileName = parts.pop()!;
  let current = vfs;
  for (const part of parts) {
    const dir = current.find(c => c.name === part && c.type === 'directory');
    if (!dir) return false;
    current = dir.children!;
  }
  const file = current.find(c => c.name === fileName);
  if (file) {
    file.content = content;
  } else {
    current.push({ name: fileName, type: 'file', content });
  }
  saveVfs();
  return true;
}

export function createDirectory(path: string): boolean {
  const parts = path.split('/').filter(Boolean);
  const dirName = parts.pop()!;
  let current = vfs;
  for (const part of parts) {
    const dir = current.find(c => c.name === part && c.type === 'directory');
    if (!dir) return false;
    current = dir.children!;
  }
  if (current.find(c => c.name === dirName)) return false;
  current.push({ name: dirName, type: 'directory', children: [] });
  saveVfs();
  return true;
}

export function deleteNode(path: string): boolean {
  const parts = path.split('/').filter(Boolean);
  const name = parts.pop()!;
  let current = vfs;
  for (const part of parts) {
    const dir = current.find(c => c.name === part && c.type === 'directory');
    if (!dir) return false;
    current = dir.children!;
  }
  const idx = current.findIndex(c => c.name === name);
  if (idx === -1) return false;
  current.splice(idx, 1);
  saveVfs();
  return true;
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot);
}

export function getLanguageFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript',
    '.tsx': 'typescript', '.html': 'html', '.css': 'css',
    '.json': 'json', '.py': 'python', '.md': 'markdown',
    '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml',
    '.sh': 'bash', '.bash': 'bash',
  };
  return map[ext] || 'text';
}
