import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const allFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)')
  .toString()
  .split('\n')
  .filter(f => f.trim() !== '');

// Helper to get all files in a directory recursively
function getFiles(dir: string): string[] {
    const results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results.push(...getFiles(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const hooksDir = 'src/hooks';
const subDirs = ['auth', 'chat', 'crm', 'sla', 'integrations', 'ui', 'system', 'analytics', 'communication', 'business', 'gamification', 'inbox'];

const movedHooksMap: Record<string, string> = {};
for (const subDir of subDirs) {
    const dirPath = path.join(hooksDir, subDir);
    if (fs.existsSync(dirPath)) {
        const files = getFiles(dirPath);
        for (const file of files) {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                movedHooksMap[file] = subDir;
            }
        }
    }
}

// Fix relative imports in ALL moved files
for (const [filePath, group] of Object.entries(movedHooksMap)) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const patterns = [
    { from: "from './reactions/", to: "from '../reactions/" },
    { from: 'from "./reactions/', to: 'from "../reactions/' },
    { from: "from './realtime/", to: "from '../realtime/" },
    { from: 'from "./realtime/', to: 'from "../realtime/' },
    { from: "from './dashboard/", to: "from '../dashboard/" },
    { from: 'from "./dashboard/', to: 'from "../dashboard/' },
    { from: "from './performance/", to: "from '../performance/" },
    { from: 'from "./performance/', to: 'from "../performance/' },
    { from: "from './evolution/", to: "from '../evolution/" },
    { from: 'from "./evolution/', to: 'from "../evolution/' },
    { from: "from './gmail/", to: "from '../gmail/" },
    { from: 'from "./gmail/', to: 'from "../gmail/' },
    { from: "from './useAuth'", to: "from '../auth/useAuth'" },
    { from: 'from "./useAuth"', to: 'from "../auth/useAuth"' },
    { from: "from './useRealtimeMessages'", to: "from '../chat/useRealtimeMessages'" },
    { from: 'from "./useRealtimeMessages"', to: 'from "../chat/useRealtimeMessages"' },
    { from: "from './usePerformance'", to: "from '../analytics/usePerformance'" },
    { from: 'from "./usePerformance"', to: 'from "../analytics/usePerformance"' },
    { from: "from './evolutionApi.types'", to: "from './integrations/evolutionApi.types'" }, // This might need careful check
    { from: "from './useCustomShortcuts'", to: "from '../shortcuts/useCustomShortcuts'" },
  ];

  for (const pattern of patterns) {
    if (content.includes(pattern.from)) {
      content = content.split(pattern.from).join(pattern.to);
      changed = true;
    }
  }
  
  // Handle some specific missing ones
  if (content.includes("from './evolutionApi.types'") && filePath.includes('integrations')) {
       content = content.split("from './evolutionApi.types'").join("from './evolutionApi.types'"); // stay same if sibling
  }

  if (changed) {
    console.log(`Fixing relative imports in ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
}

// Fix imports in ALL files for renamed/moved hooks
for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [hookPath, group] of Object.entries(movedHooksMap)) {
      const hookName = path.basename(hookPath).replace(/\.(ts|tsx)$/, '');
      
      // Fix relative imports: from '../useHookName' -> '../group/useHookName'
      const relFrom = `from '../${hookName}'`;
      const relTo = `from '../${group}/${hookName}'`;
      if (content.includes(relFrom)) {
          content = content.split(relFrom).join(relTo);
          changed = true;
      }
      const relFrom2 = `from "../${hookName}"`;
      const relTo2 = `from "../${group}/${hookName}"`;
      if (content.includes(relFrom2)) {
          content = content.split(relFrom2).join(relTo2);
          changed = true;
      }
      
      // Fix sibling imports in src/hooks: from './useHookName' -> './group/useHookName'
      if (file.startsWith('src/hooks/') && !file.includes('/', 10)) {
          const sibFrom = `from './${hookName}'`;
          const sibTo = `from './${group}/${hookName}'`;
          if (content.includes(sibFrom)) {
              content = content.split(sibFrom).join(sibTo);
              changed = true;
          }
      }
  }

  if (changed) {
    console.log(`Fixing imports in ${file}`);
    fs.writeFileSync(file, content);
  }
}

console.log('Fixing build errors complete.');
