import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AutoTicketClassifier } from '../AutoTicketClassifier';
import {
  CATEGORIES,
  PRIORITY_MAP,
  classifyTag,
  derivePriority,
  groupTagsIntoTickets,
} from '../ticketClassification';

const mockTags = [
  { id: 't1', contact_id: 'c1', tag_name: 'suporte técnico', confidence: 0.9, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'Maria', phone: '+5511999' } },
  { id: 't2', contact_id: 'c2', tag_name: 'venda consultiva', confidence: 0.85, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'João', phone: '+5511888' } },
  { id: 't3', contact_id: 'c3', tag_name: 'reclamação', confidence: 0.95, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'Ana', phone: '+5511777' } },
  { id: 't4', contact_id: 'c4', tag_name: 'pagamento boleto', confidence: 0.7, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'Pedro', phone: '+5511666' } },
  { id: 't5', contact_id: 'c5', tag_name: 'agendamento horário', confidence: 0.6, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'Lucas', phone: '+5511555' } },
  { id: 't6', contact_id: 'c6', tag_name: 'info geral', confidence: 0.5, source: 'ai', created_at: new Date().toISOString(), contacts: { name: 'Carla', phone: '+5511444' } },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: mockTags, error: null }),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    },
  },
}));

describe('AutoTicketClassifier', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===== RENDERING =====
  describe('Rendering', () => {
    it('renders title', async () => {
      render(<AutoTicketClassifier />);
      await waitFor(() => {
        expect(screen.getByText('Classificação Automática de Tickets')).toBeInTheDocument();
      });
    });

    it('renders auto-classify switch', () => {
      render(<AutoTicketClassifier />);
      expect(screen.getByText('Auto-classificar')).toBeInTheDocument();
    });

    it('renders batch classify button', () => {
      render(<AutoTicketClassifier />);
      expect(screen.getByText('Classificar em Lote')).toBeInTheDocument();
    });

    it('renders 6 category cards', async () => {
      render(<AutoTicketClassifier />);
      await waitFor(() => {
        expect(screen.getByText('Suporte Técnico')).toBeInTheDocument();
        expect(screen.getByText('Vendas')).toBeInTheDocument();
        expect(screen.getByText('Financeiro')).toBeInTheDocument();
        expect(screen.getByText('Reclamação')).toBeInTheDocument();
        expect(screen.getByText('Informação')).toBeInTheDocument();
        expect(screen.getByText('Agendamento')).toBeInTheDocument();
      });
    });

    it('renders tickets section', async () => {
      render(<AutoTicketClassifier />);
      await waitFor(() => {
        expect(screen.getByText(/Tickets Classificados/)).toBeInTheDocument();
      });
    });
  });

  // ===== CLASSIFICATION LOGIC =====
  describe('Classification logic (classifyTag)', () => {
    it('classifies suporte', () => expect(classifyTag('suporte técnico')).toBe('Suporte Técnico'));
    it('classifies bug as suporte', () => expect(classifyTag('bug report')).toBe('Suporte Técnico'));
    it('classifies erro as suporte', () => expect(classifyTag('erro no sistema')).toBe('Suporte Técnico'));
    it('classifies venda', () => expect(classifyTag('venda consultiva')).toBe('Vendas'));
    it('classifies preço as vendas', () => expect(classifyTag('preço produto')).toBe('Vendas'));
    it('classifies compra as vendas', () => expect(classifyTag('compra online')).toBe('Vendas'));
    it('classifies pagamento as financeiro', () => expect(classifyTag('pagamento pendente')).toBe('Financeiro'));
    it('classifies boleto as financeiro', () => expect(classifyTag('boleto vencido')).toBe('Financeiro'));
    it('classifies fatura as financeiro', () => expect(classifyTag('fatura mensal')).toBe('Financeiro'));
    it('classifies reclamação', () => expect(classifyTag('reclamação grave')).toBe('Reclamação'));
    it('classifies insatisfação as reclamação', () => expect(classifyTag('insatisfeito')).toBe('Reclamação'));
    it('classifies agendamento', () => expect(classifyTag('agendamento consulta')).toBe('Agendamento'));
    it('classifies horário as agendamento', () => expect(classifyTag('horário disponível')).toBe('Agendamento'));
    it('defaults to Informação', () => expect(classifyTag('dúvida geral')).toBe('Informação'));
    it('case insensitive', () => expect(classifyTag('SUPORTE URGENTE')).toBe('Suporte Técnico'));
  });

  // ===== PRIORITY DERIVATION =====
  describe('Priority derivation (derivePriority)', () => {
    it('urgent for reclamação', () => expect(derivePriority('reclamação', 0.5)).toBe('urgent'));
    it('urgent for urgent tag', () => expect(derivePriority('urgente', 0.3)).toBe('urgent'));
    it('high for bug with high confidence', () => expect(derivePriority('bug crítico', 0.9)).toBe('high'));
    it('high for erro with high confidence', () => expect(derivePriority('erro grave', 0.85)).toBe('high'));
    it('medium for moderate confidence', () => expect(derivePriority('info geral', 0.6)).toBe('medium'));
    it('low for low confidence', () => expect(derivePriority('info geral', 0.3)).toBe('low'));
    it('medium not high for bug with low confidence', () => expect(derivePriority('bug', 0.6)).toBe('medium'));
  });

  // ===== CATEGORY ICONS =====
  describe('Category config', () => {
    it('has 6 categories', () => expect(CATEGORIES.length).toBe(6));
    CATEGORIES.forEach(cat => {
      it(`${cat.name} has icon`, () => expect(cat.icon.length).toBeGreaterThan(0));
    });
  });

  // ===== PRIORITY MAP =====
  describe('Priority map', () => {
    it('has 4 priority levels', () => expect(Object.keys(PRIORITY_MAP).length).toBe(4));
    it('urgent label is correct', () => expect(PRIORITY_MAP.urgent.label).toBe('Urgente'));
    it('high label is correct', () => expect(PRIORITY_MAP.high.label).toBe('Alta'));
    it('medium label is correct', () => expect(PRIORITY_MAP.medium.label).toBe('Média'));
    it('low label is correct', () => expect(PRIORITY_MAP.low.label).toBe('Baixa'));
  });

  // ===== GROUPING LOGIC =====
  describe('Contact grouping (groupTagsIntoTickets)', () => {
    it('groups tags by contact_id', () => {
      const tickets = groupTagsIntoTickets([
        { contact_id: 'c1', tag_name: 'suporte', confidence: 0.9, contacts: { name: 'Maria' } },
        { contact_id: 'c1', tag_name: 'urgente', confidence: 0.8, contacts: { name: 'Maria' } },
        { contact_id: 'c2', tag_name: 'venda', confidence: 0.7, contacts: { name: 'João' } },
      ]);
      expect(tickets.length).toBe(2);
      expect(tickets.find(t => t.contactId === 'c1')?.tags).toEqual(['suporte', 'urgente']);
    });

    it('derives category and priority from the first tag', () => {
      const [ticket] = groupTagsIntoTickets([
        { contact_id: 'c1', tag_name: 'reclamação grave', confidence: 0.9, contacts: { name: 'Maria' } },
      ]);
      expect(ticket.category).toBe('Reclamação');
      expect(ticket.priority).toBe('urgent');
      expect(ticket.confidence).toBeCloseTo(90);
    });
  });

  // ===== EDGE CASES =====
  describe('Edge cases', () => {
    it('handles null contact', () => {
      const [ticket] = groupTagsIntoTickets([
        { contact_id: 'c1', tag_name: 'suporte', confidence: 0.9, contacts: null },
      ]);
      expect(ticket.contactName).toBe('Desconhecido');
    });

    it('falls back to 70% confidence when missing or zero', () => {
      const [missing] = groupTagsIntoTickets([
        { contact_id: 'c1', tag_name: 'suporte', confidence: null, contacts: { name: 'Maria' } },
      ]);
      const [zero] = groupTagsIntoTickets([
        { contact_id: 'c2', tag_name: 'suporte', confidence: 0, contacts: { name: 'João' } },
      ]);
      expect(missing.confidence).toBeCloseTo(70);
      expect(zero.confidence).toBeCloseTo(70);
    });

    it('handles empty tags list', () => {
      expect(groupTagsIntoTickets([])).toEqual([]);
    });

    it('renders with empty data', async () => {
      render(<AutoTicketClassifier />);
      expect(screen.getByText(/Classificação Automática/)).toBeInTheDocument();
    });
  });
});
