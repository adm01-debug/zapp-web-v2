import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const allFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)')
  .toString()
  .split('\n')
  .filter(f => f.trim() !== '');

const movedHooks = {
  'src/hooks/auth/useAuth.tsx': 'auth',
  'src/hooks/auth/useAuthForm.ts': 'auth',
  'src/hooks/auth/useMFA.ts': 'auth',
  'src/hooks/auth/useReauthentication.ts': 'auth',
  'src/hooks/auth/useSecureProfile.ts': 'auth',
  'src/hooks/auth/useWebAuthn.ts': 'auth',
  'src/hooks/chat/useMessages.ts': 'chat',
  'src/hooks/chat/useRealtimeMessages.ts': 'chat',
  'src/hooks/chat/useMessageStatus.ts': 'chat',
  'src/hooks/chat/useMessageTemplates.ts': 'chat',
  'src/hooks/chat/useMessageReactions.ts': 'chat',
  'src/hooks/chat/useMessageSignature.ts': 'chat',
  'src/hooks/chat/useQuickReplies.ts': 'chat',
  'src/hooks/chat/useScheduledMessages.ts': 'chat',
  'src/hooks/chat/useTypingPresence.ts': 'chat',
  'src/hooks/chat/useForwardMessage.ts': 'chat',
  'src/hooks/chat/useChatSearch.ts': 'chat',
  'src/hooks/chat/useChatKeyboardNavigation.ts': 'chat',
  'src/hooks/chat/useNewConversation.ts': 'chat',
  'src/hooks/chat/useConversationActions.ts': 'chat',
  'src/hooks/chat/useConversationAnalyses.ts': 'chat',
  'src/hooks/chat/useLatestAnalysis.ts': 'chat',
};

// Fix relative imports in moved files
for (const [filePath, group] of Object.entries(movedHooks)) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Change from './' to '../' for any import that was sibling but now is in a different folder
  // Or change it to use absolute @/hooks/... if preferred.
  // The errors show imports like: import { ... } from './reactions/...'
  // These were sibling folders in src/hooks. Now they are in src/hooks/chat/
  
  const relativePatterns = [
    { from: "from './reactions/", to: "from '../reactions/" },
    { from: 'from "./reactions/', to: 'from "../reactions/' },
    { from: "from './realtime/", to: "from '../realtime/" },
    { from: 'from "./realtime/', to: 'from "../realtime/' },
    { from: "from './useAuth'", to: "from '../auth/useAuth'" },
    { from: 'from "./useAuth"', to: 'from "../auth/useAuth"' },
    { from: "from './useRealtimeMessages'", to: "from '../chat/useRealtimeMessages'" },
    { from: 'from "./useRealtimeMessages"', to: 'from "../chat/useRealtimeMessages"' },
  ];

  for (const pattern of relativePatterns) {
    if (content.includes(pattern.from)) {
      content = content.split(pattern.from).join(pattern.to);
      changed = true;
    }
  }

  if (changed) {
    console.log(`Fixing relative imports in ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
}

// Fix imports in files that used relative paths to the old locations (like tests or sibling hooks)
for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix test imports: import { ... } from '../useAuth' -> '../auth/useAuth'
  if (file.includes('__tests__')) {
    const testPatterns = [
      { from: "from '../useAuth'", to: "from '../auth/useAuth'" },
      { from: 'from "../useAuth"', to: 'from "../auth/useAuth"' },
      { from: "from '../useChatSearch'", to: "from '../chat/useChatSearch'" },
      { from: 'from "../useChatSearch"', to: 'from "../chat/useChatSearch"' },
      { from: "from '../useMessages'", to: "from '../chat/useMessages'" },
      { from: 'from "../useMessages"', to: 'from "../chat/useMessages"' },
      { from: "from '../useRealtimeMessages'", to: "from '../chat/useRealtimeMessages'" },
      { from: 'from "../useRealtimeMessages"', to: 'from "../chat/useRealtimeMessages"' },
      { from: "from '../useMessageStatus'", to: "from '../chat/useMessageStatus'" },
      { from: 'from "../useMessageStatus"', to: 'from "../chat/useMessageStatus"' },
      { from: "from '../useMessageReactions'", to: "from '../chat/useMessageReactions'" },
      { from: 'from "../useMessageReactions"', to: 'from "../chat/useMessageReactions'" },
      { from: "from '../useConversationAnalyses'", to: "from '../chat/useConversationAnalyses'" },
      { from: 'from "../useConversationAnalyses"', to: 'from "../chat/useConversationAnalyses'" },
    ];
    for (const pattern of testPatterns) {
      if (content.includes(pattern.from)) {
        content = content.split(pattern.from).join(pattern.to);
        changed = true;
      }
    }
  }
  
  // Fix hooks that weren't moved but import moved ones relatively
  // e.g. src/hooks/useDeviceDetection.ts imports ./useAuth
  if (file.startsWith('src/hooks/') && !file.includes('/') && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const hookPatterns = [
          { from: "from './useAuth'", to: "from './auth/useAuth'" },
          { from: 'from "./useAuth"', to: 'from "./auth/useAuth"' },
      ];
      for (const pattern of hookPatterns) {
          if (content.includes(pattern.from)) {
              content = content.split(pattern.from).join(pattern.to);
              changed = true;
          }
      }
  }

  if (changed) {
    console.log(`Fixing imports in ${file}`);
    fs.writeFileSync(file, content);
  }
}

// Special case: src/hooks/realtime/useMessageUpdateBatcher.ts and useRealtimeNotifications.ts
const realtimeHooks = [
    'src/hooks/realtime/useMessageUpdateBatcher.ts',
    'src/hooks/realtime/useRealtimeNotifications.ts'
];
for (const rh of realtimeHooks) {
    if (fs.existsSync(rh)) {
        let content = fs.readFileSync(rh, 'utf8');
        if (content.includes("from '../useRealtimeMessages'")) {
            content = content.split("from '../useRealtimeMessages'").join("from '../chat/useRealtimeMessages'");
            fs.writeFileSync(rh, content);
            console.log(`Fixing realtime hook: ${rh}`);
        }
    }
}

console.log('Fixing build errors complete.');
