import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const subDirs = ['auth', 'chat', 'crm', 'sla', 'integrations', 'ui', 'system', 'analytics', 'communication', 'business', 'gamification', 'inbox'];

for (const subDir of subDirs) {
    const dirPath = path.join('src/hooks', subDir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Fix imports like ./gamification/ -> ./
        const subDirPattern = `./${subDir}/`;
        if (content.includes(subDirPattern)) {
            content = content.split(subDirPattern).join('./');
            changed = true;
        }
        
        // Fix imports like ./sip/ -> ../sip/ (if it's a sibling of the hooks folder but now we are deeper)
        // Wait, if it's in src/hooks/communication, and it wants src/hooks/sip, it should be ../sip
        const otherSubDirs = subDirs.filter(s => s !== subDir);
        for (const other of otherSubDirs) {
            const pattern = `./${other}/`;
            if (content.includes(pattern)) {
                content = content.split(pattern).join(`../${other}/`);
                changed = true;
            }
        }
        
        // Fix other sibling folders in src/hooks that are not in the list but might be there
        const possibleSiblings = ['reactions', 'realtime', 'dashboard', 'performance', 'evolution', 'gmail', 'feedback', 'sip', 'voice', 'shortcuts', 'sticker-picker', 'team-chat'];
        for (const sib of possibleSiblings) {
            const pattern = `./${sib}/`;
            if (content.includes(pattern)) {
                content = content.split(pattern).join(`../${sib}/`);
                changed = true;
            }
        }

        if (changed) {
            console.log(`Fixing internal imports in ${filePath}`);
            fs.writeFileSync(filePath, content);
        }
    }
}
