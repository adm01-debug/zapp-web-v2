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
  'src/hooks/crm/useContactsSearch.ts': 'crm',
  'src/hooks/crm/useContactAssignment.ts': 'crm',
  'src/hooks/crm/useContactCustomFields.ts': 'crm',
  'src/hooks/crm/useContactEnrichedData.ts': 'crm',
  'src/hooks/crm/useContactIntelligence.ts': 'crm',
  'src/hooks/crm/useContactNotes.ts': 'crm',
  'src/hooks/crm/useContactStats.ts': 'crm',
  'src/hooks/crm/useAdvancedContactSearch.ts': 'crm',
  'src/hooks/crm/useExternalContact360.ts': 'crm',
  'src/hooks/crm/useExternalContact360Batch.ts': 'crm',
  'src/hooks/crm/useTags.ts': 'crm',
  'src/hooks/crm/useAgents.ts': 'crm',
  'src/hooks/crm/useAgentReassignment.ts': 'crm',
  'src/hooks/crm/useVisibleAgents.ts': 'crm',
  'src/hooks/crm/useTeamProfiles.ts': 'crm',
  'src/hooks/crm/useExternalEmpresas.ts': 'crm',
  'src/hooks/crm/useExternalCargos.ts': 'crm',
  'src/hooks/sla/useApplicableSLA.ts': 'sla',
  'src/hooks/sla/useSLACalculation.ts': 'sla',
  'src/hooks/sla/useSLAConfigurations.ts': 'sla',
  'src/hooks/sla/useSLAHistory.ts': 'sla',
  'src/hooks/sla/useSLAMetrics.ts': 'sla',
  'src/hooks/sla/useSLANotifications.ts': 'sla',
  'src/hooks/sla/useSLARules.ts': 'sla',
  'src/hooks/integrations/useEvolutionApi.ts': 'integrations',
  'src/hooks/integrations/useExternalEvolution.ts': 'integrations',
  'src/hooks/integrations/useGmail.ts': 'integrations',
  'src/hooks/integrations/useGmailOAuth.ts': 'integrations',
  'src/hooks/integrations/useWhatsAppStatus.ts': 'integrations',
  'src/hooks/integrations/useWhatsAppTemplates.ts': 'integrations',
  'src/hooks/integrations/useBitrixApi.ts': 'integrations',
  'src/hooks/integrations/useSyncToCRM.ts': 'integrations',
  'src/hooks/integrations/useTalkX.ts': 'integrations',
  'src/hooks/integrations/useChatbotFlows.ts': 'integrations',
  'src/hooks/integrations/useKnowledgeBase.ts': 'integrations',
  'src/hooks/integrations/useKnowledgeBaseSearch.ts': 'integrations',
  'src/hooks/integrations/useExternalDB.ts': 'integrations',
  'src/hooks/ui/useTheme.ts': 'ui',
  'src/hooks/ui/useSidebarCollapse.ts': 'ui',
  'src/hooks/ui/useSidebarFavorites.ts': 'ui',
  'src/hooks/ui/useLoadingState.ts': 'ui',
  'src/hooks/ui/useKeyboardShortcuts.ts': 'ui',
  'src/hooks/ui/useGlobalKeyboardShortcuts.ts': 'ui',
  'src/hooks/ui/useGlobalSearchShortcut.ts': 'ui',
  'src/hooks/ui/useDeviceDetection.ts': 'ui',
  'src/hooks/ui/useScreenProtection.ts': 'ui',
  'src/hooks/ui/useViewTransition.ts': 'ui',
  'src/hooks/ui/useParallax.ts': 'ui',
  'src/hooks/ui/usePullToRefresh.ts': 'ui',
  'src/hooks/ui/useSwipeGesture.ts': 'ui',
  'src/hooks/ui/useSwipeNavigation.ts': 'ui',
  'src/hooks/ui/useDensity.ts': 'ui',
  'src/hooks/ui/useDocumentTitle.ts': 'ui',
  'src/hooks/ui/useZenMode.ts': 'ui',
  'src/hooks/ui/use-mobile.tsx': 'ui',
  'src/hooks/ui/use-toast.ts': 'ui',
  'src/hooks/system/useDebounce.ts': 'system',
  'src/hooks/system/useInfiniteScroll.ts': 'system',
  'src/hooks/system/useNetworkStatus.ts': 'system',
  'src/hooks/system/useServiceWorker.ts': 'system',
  'src/hooks/system/useOfflineCache.ts': 'system',
  'src/hooks/system/useCRUD.ts': 'system',
  'src/hooks/system/useDuplicate.ts': 'system',
  'src/hooks/system/useUndoableAction.ts': 'system',
  'src/hooks/system/useVersions.ts': 'system',
  'src/hooks/system/useExportData.ts': 'system',
  'src/hooks/system/useImportData.ts': 'system',
  'src/hooks/system/useIdleCallback.ts': 'system',
  'src/hooks/system/usePrefetch.ts': 'system',
  'src/hooks/system/useResourcePrefetch.ts': 'system',
  'src/hooks/analytics/useDashboardData.ts': 'analytics',
  'src/hooks/analytics/useDashboardWidgets.ts': 'analytics',
  'src/hooks/analytics/useRealtimeDashboard.ts': 'analytics',
  'src/hooks/analytics/useAIStats.ts': 'analytics',
  'src/hooks/analytics/useAIUsageDashboard.ts': 'analytics',
  'src/hooks/analytics/useGoalNotifications.ts': 'analytics',
  'src/hooks/analytics/useGoalsDashboard.ts': 'analytics',
  'src/hooks/analytics/usePerformance.ts': 'analytics',
  'src/hooks/analytics/usePerformanceSnapshots.ts': 'analytics',
};

// Fix relative imports in moved files
for (const [filePath, group] of Object.entries(movedHooks)) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

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

// Fix imports in files that used relative paths to the old locations
for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

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
      { from: 'from "../useMessageReactions"', to: 'from "../chat/useMessageReactions"' },
      { from: "from '../useConversationAnalyses'", to: "from '../chat/useConversationAnalyses'" },
      { from: 'from "../useConversationAnalyses"', to: 'from "../chat/useConversationAnalyses"' },
    ];
    for (const pattern of testPatterns) {
      if (content.includes(pattern.from)) {
        content = content.split(pattern.from).join(pattern.to);
        changed = true;
      }
    }
  }
  
  if (file.startsWith('src/hooks/') && !file.includes('/', 10) && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      if (content.includes("from './useAuth'")) {
          content = content.split("from './useAuth'").join("from './auth/useAuth'");
          changed = true;
      }
      if (content.includes('from "./useAuth"')) {
          content = content.split('from "./useAuth"').join('from "./auth/useAuth"');
          changed = true;
      }
  }

  if (changed) {
    console.log(`Fixing imports in ${file}`);
    fs.writeFileSync(file, content);
  }
}

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
