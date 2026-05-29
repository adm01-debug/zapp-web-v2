import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const hookGroups = {
  auth: [
    'useAuth.tsx',
    'useAuthForm.ts',
    'useMFA.ts',
    'useReauthentication.ts',
    'useSecureProfile.ts',
    'useWebAuthn.ts'
  ],
  chat: [
    'useMessages.ts',
    'useRealtimeMessages.ts',
    'useMessageStatus.ts',
    'useMessageTemplates.ts',
    'useMessageReactions.ts',
    'useMessageSignature.ts',
    'useQuickReplies.ts',
    'useScheduledMessages.ts',
    'useTypingPresence.ts',
    'useForwardMessage.ts',
    'useChatSearch.ts',
    'useChatKeyboardNavigation.ts',
    'useNewConversation.ts',
    'useConversationActions.ts',
    'useConversationAnalyses.ts',
    'useLatestAnalysis.ts'
  ]
};

// Create directories
for (const group of Object.keys(hookGroups)) {
  const dir = path.join('src/hooks', group);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Move files and track changes
const changes = [];
for (const [group, files] of Object.entries(hookGroups)) {
  for (const file of files) {
    const oldPath = path.join('src/hooks', file);
    const newPath = path.join('src/hooks', group, file);
    if (fs.existsSync(oldPath)) {
      console.log(`Moving ${oldPath} to ${newPath}`);
      fs.renameSync(oldPath, newPath);
      changes.push({
        oldImport: `@/hooks/${file.replace(/\.(ts|tsx)$/, '')}`,
        newImport: `@/hooks/${group}/${file.replace(/\.(ts|tsx)$/, '')}`
      });
      // Also handle relative imports if any
    }
  }
}

// Update imports in all src files
const allFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)')
  .toString()
  .split('\n')
  .filter(f => f.trim() !== '');

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const change of changes) {
    if (content.includes(change.oldImport)) {
      console.log(`Updating import in ${file}: ${change.oldImport} -> ${change.newImport}`);
      content = content.split(change.oldImport).join(change.newImport);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
  }
}

console.log('Refactor complete for Auth and Chat hooks.');
