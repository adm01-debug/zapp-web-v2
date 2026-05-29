import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const allFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)')
  .toString().split('\n').filter(f => f.trim() !== '');

const subDirs = ['auth', 'chat', 'crm', 'sla', 'integrations', 'ui', 'system', 'analytics', 'communication', 'business', 'gamification', 'inbox'];

// Fix @/hooks/system/usePrefetchOnHover -> @/hooks/ui/usePrefetchOnHover
for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/hooks/system/usePrefetchOnHover')) {
        content = content.split('@/hooks/system/usePrefetchOnHover').join('@/hooks/ui/usePrefetchOnHover');
        fs.writeFileSync(file, content);
    }
}

// Fix src/hooks/business/useWarRoomAlerts.ts(4,38): error TS2307: Cannot find module './usePushNotifications'
const warRoomAlerts = 'src/hooks/business/useWarRoomAlerts.ts';
if (fs.existsSync(warRoomAlerts)) {
    let content = fs.readFileSync(warRoomAlerts, 'utf8');
    content = content.replace("from './usePushNotifications'", "from '../system/usePushNotifications'");
    fs.writeFileSync(warRoomAlerts, content);
}

// Fix src/hooks/chat/useGroupsManager.ts(5,33): error TS2307: Cannot find module './groups/actions'
const groupsManager = 'src/hooks/chat/useGroupsManager.ts';
if (fs.existsSync(groupsManager)) {
    let content = fs.readFileSync(groupsManager, 'utf8');
    content = content.replace(/from '\.\/groups\//g, "from '../groups/");
    content = content.replace(/from "\.\/groups\//g, 'from "../groups/');
    fs.writeFileSync(groupsManager, content);
}

// Fix src/hooks/chat/useTeamChat.ts
const teamChat = 'src/hooks/chat/useTeamChat.ts';
if (fs.existsSync(teamChat)) {
    let content = fs.readFileSync(teamChat, 'utf8');
    content = content.replace(/from '\.\/team-chat\//g, "from '../team-chat/");
    content = content.replace(/from "\.\/team-chat\//g, 'from "../team-chat/');
    fs.writeFileSync(teamChat, content);
}

// Final check for @/hooks/ without subfolder
for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    // This is expensive but necessary if many missed
    const hooksDir = 'src/hooks';
    for (const subDir of subDirs) {
        const dirPath = path.join(hooksDir, subDir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            for (const h of files) {
                const hName = h.replace(/\.(ts|tsx)$/, '');
                const oldImport = `@/hooks/${hName}`;
                const newImport = `@/hooks/${subDir}/${hName}`;
                if (content.includes(oldImport) && !content.includes(newImport)) {
                    content = content.split(oldImport).join(newImport);
                    changed = true;
                }
            }
        }
    }
    if (changed) fs.writeFileSync(file, content);
}
