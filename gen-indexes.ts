import fs from 'fs';
import path from 'path';

const subDirs = ['crm', 'sla', 'integrations', 'ui', 'system', 'analytics', 'communication', 'business', 'gamification', 'inbox'];

for (const subDir of subDirs) {
    const dirPath = path.join('src/hooks', subDir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath);
    const exports = files
        .filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx') && f !== 'index.ts')
        .map(f => `export * from './${f.replace(/\.(ts|tsx)$/, '')}';`)
        .join('\n');
    
    fs.writeFileSync(path.join(dirPath, 'index.ts'), exports + '\n');
    console.log(`Created index.ts in ${dirPath}`);
}
