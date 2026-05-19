 import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { toast } from '@/hooks/use-toast';
 import { ContactService } from '@/services/contact.service';
 import { AuthService } from '@/services/auth.service';
 import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/logger';

export interface ContactNote {
  id: string;
  contact_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export function useContactNotes(contactId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

   const { profile } = useAuth();
 
   const { data: notes = [], isLoading, error, refetch } = useQuery({
     queryKey: ['contact-notes', contactId],
     queryFn: () => ContactService.fetchNotes(contactId),
     enabled: !!contactId,
   });

   const addNoteMutation = useMutation({
     mutationFn: (content: string) => {
       if (!profile?.id) throw new Error('Perfil não encontrado');
       return ContactService.addNote(contactId, profile.id, content);
     },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      toast({
        title: 'Nota adicionada',
        description: 'A nota foi salva com sucesso.',
      });
    },
    onError: (error) => {
      log.error('Error adding note:', error);
      toast({
        title: 'Erro ao adicionar nota',
        description: 'Não foi possível salvar a nota.',
        variant: 'destructive',
      });
    },
  });

   const deleteNoteMutation = useMutation({
     mutationFn: (noteId: string) => ContactService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      toast({
        title: 'Nota removida',
        description: 'A nota foi removida com sucesso.',
      });
    },
    onError: (error) => {
      log.error('Error deleting note:', error);
      toast({
        title: 'Erro ao remover nota',
        description: 'Não foi possível remover a nota.',
        variant: 'destructive',
      });
    },
  });

  const addNote = useCallback((content: string) => {
    return addNoteMutation.mutateAsync(content);
  }, [addNoteMutation]);

  const deleteNote = useCallback((noteId: string) => {
    return deleteNoteMutation.mutateAsync(noteId);
  }, [deleteNoteMutation]);

  return {
    notes,
    isLoading,
    error,
    refetch,
    addNote,
    deleteNote,
    isAdding: addNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    currentProfileId: profile?.id,
  };
}
