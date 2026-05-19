import { useState, useCallback } from 'react';

export function useInboxUIState() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [pipContact, setPipContact] = useState<{ name: string; avatar?: string; lastMessage?: string; contactId: string } | null>(null);
  const [pendingContactId, setPendingContactId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);

  const toggleDetails = useCallback(() => setShowDetails(prev => !prev), []);
  const toggleSound = useCallback(() => setSoundOn(prev => !prev), []);
  const toggleSearch = useCallback(() => setGlobalSearchOpen(prev => !prev), []);

  return {
    selectedContactId, setSelectedContactId,
    showDetails, setShowDetails, toggleDetails,
    pipContact, setPipContact,
    pendingContactId, setPendingContactId,
    soundOn, setSoundOn, toggleSound,
    globalSearchOpen, setGlobalSearchOpen, toggleSearch,
    showNewConversation, setShowNewConversation,
  };
}
