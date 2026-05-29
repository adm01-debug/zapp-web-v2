import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const hookGroups = {
  auth: ['useAuth.tsx', 'useAuthForm.ts', 'useMFA.ts', 'useReauthentication.ts', 'useSecureProfile.ts', 'useWebAuthn.ts'],
  chat: ['useMessages.ts', 'useRealtimeMessages.ts', 'useMessageStatus.ts', 'useMessageTemplates.ts', 'useMessageReactions.ts', 'useMessageSignature.ts', 'useQuickReplies.ts', 'useScheduledMessages.ts', 'useTypingPresence.ts', 'useForwardMessage.ts', 'useChatSearch.ts', 'useChatKeyboardNavigation.ts', 'useNewConversation.ts', 'useConversationActions.ts', 'useConversationAnalyses.ts', 'useLatestAnalysis.ts', 'useTeamChat.ts', 'useTeamChatDraft.ts', 'useTeamChatNotifications.ts', 'useGroupsManager.ts', 'useSavedFilters.ts', 'useScheduledReports.ts'],
  crm: ['useContactsSearch.ts', 'useContactAssignment.ts', 'useContactCustomFields.ts', 'useContactEnrichedData.ts', 'useContactIntelligence.ts', 'useContactNotes.ts', 'useContactStats.ts', 'useAdvancedContactSearch.ts', 'useExternalContact360.ts', 'useExternalContact360Batch.ts', 'useTags.ts', 'useAgents.ts', 'useAgentReassignment.ts', 'useVisibleAgents.ts', 'useTeamProfiles.ts', 'useExternalEmpresas.ts', 'useExternalCargos.ts'],
  sla: ['useApplicableSLA.ts', 'useSLACalculation.ts', 'useSLAConfigurations.ts', 'useSLAHistory.ts', 'useSLAMetrics.ts', 'useSLANotifications.ts', 'useSLARules.ts'],
  integrations: ['useEvolutionApi.ts', 'useExternalEvolution.ts', 'useGmail.ts', 'useGmailOAuth.ts', 'useWhatsAppStatus.ts', 'useWhatsAppTemplates.ts', 'useBitrixApi.ts', 'useSyncToCRM.ts', 'useTalkX.ts', 'useChatbotFlows.ts', 'useKnowledgeBase.ts', 'useKnowledgeBaseSearch.ts', 'useExternalDB.ts', 'useCustomEmojis.ts', 'usePersonalStickers.ts', 'useExternalCatalog.ts'],
  ui: ['useTheme.ts', 'useSidebarCollapse.ts', 'useSidebarFavorites.ts', 'useLoadingState.ts', 'useKeyboardShortcuts.ts', 'useGlobalKeyboardShortcuts.ts', 'useGlobalSearchShortcut.ts', 'useDeviceDetection.ts', 'useScreenProtection.ts', 'useViewTransition.ts', 'useParallax.ts', 'usePullToRefresh.ts', 'useSwipeGesture.ts', 'useSwipeNavigation.ts', 'useDensity.ts', 'useDocumentTitle.ts', 'useZenMode.ts', 'use-mobile.tsx', 'use-toast.ts', 'useKeyboardHeight.ts', 'useKeyboardNavigation.ts', 'usePrefetchOnHover.ts', 'useAmbientColor.ts', 'useAriaAnnouncer.ts', 'useDeepLinks.ts', 'useActionFeedback.ts', 'useOnboarding.ts', 'useOnboardingChecklist.ts', 'useCustomShortcuts.ts', 'useUniversityHelp.ts'],
  system: ['useDebounce.ts', 'useInfiniteScroll.ts', 'useNetworkStatus.ts', 'useServiceWorker.ts', 'useOfflineCache.ts', 'useCRUD.ts', 'useDuplicate.ts', 'useUndoableAction.ts', 'useVersions.ts', 'useExportData.ts', 'useImportData.ts', 'useIdleCallback.ts', 'usePrefetch.ts', 'useResourcePrefetch.ts', 'usePermissions.ts', 'useUserRole.ts', 'useUserSettings.ts', 'useGlobalSettings.ts', 'useNotifications.ts', 'usePushNotifications.ts', 'useSecurityPushNotifications.ts', 'useNotificationSettings.ts', 'useDownloadPermission.ts', 'useSupabaseMutation.ts', 'useNavigationHistory.ts', 'useUrlFilters.ts', 'useSearch.ts', 'useSearchHistory.ts', 'useCurrentModule.ts', 'useDiagnosticsData.ts', 'useGeoBlocking.ts', 'useRateLimitLogs.ts', 'useSkillBasedAssign.ts'],
  analytics: ['useDashboardData.ts', 'useDashboardWidgets.ts', 'useRealtimeDashboard.ts', 'useAIStats.ts', 'useAIUsageDashboard.ts', 'useGoalNotifications.ts', 'useGoalsDashboard.ts', 'usePerformance.ts', 'usePerformanceSnapshots.ts', 'usePerformanceOptimizations.ts'],
  communication: ['useCalls.ts', 'useCampaigns.ts', 'useSipClient.ts', 'useVoiceAgent.ts', 'useIncomingCallListener.ts', 'useAudioPlayer.ts', 'useAudioRecorder.ts', 'useAudioMemes.ts', 'useSpeechToText.ts', 'useTextToSpeech.ts', 'useTranscriptionNotifications.ts'],
  business: ['useBusinessHours.ts', 'useBusinessHoursCheck.ts', 'useCSAT.ts', 'useNPSSurveys.ts', 'useDemandPrediction.ts', 'useQueueAnalytics.ts', 'useQueueGoals.ts', 'useQueues.ts', 'useQueuesComparison.ts', 'useWarRoomAlerts.ts', 'useWarRoomData.ts', 'useClientWallet.ts', 'useShoppingCart.ts'],
  gamification: ['useLeaderboard.ts', 'useAgentGamification.ts'],
  inbox: ['useInboxBulkActions.ts', 'useInboxFilters.ts', 'useRealtimeInbox.ts', 'useRealtimeSentimentAlerts.ts', 'useSentimentAlerts.ts', 'useObjectionDetector.ts', 'useAutoCloseConversations.ts', 'useBulkActions.ts', 'useConnectionQueues.ts', 'useConnectionsManager.ts']
};

for (const group of Object.keys(hookGroups)) {
  const dir = path.join('src/hooks', group);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const changes = [];
for (const [group, files] of Object.entries(hookGroups)) {
  for (const file of files) {
    const oldPath = path.join('src/hooks', file);
    const newPath = path.join('src/hooks', group, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      changes.push({
        oldImport: `@/hooks/${file.replace(/\.(ts|tsx)$/, '')}`,
        newImport: `@/hooks/${group}/${file.replace(/\.(ts|tsx)$/, '')}`
      });
    }
  }
}

const allFiles = execSync('find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)')
  .toString().split('\n').filter(f => f.trim() !== '');

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const change of changes) {
    if (content.includes(change.oldImport)) {
      content = content.split(change.oldImport).join(change.newImport);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, content);
}
if (fs.existsSync('src/hooks/evolutionApi.types.ts')) {
    fs.renameSync('src/hooks/evolutionApi.types.ts', 'src/hooks/integrations/evolutionApi.types.ts');
}
console.log('Refactor complete.');
