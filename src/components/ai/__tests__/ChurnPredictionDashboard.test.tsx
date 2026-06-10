import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { subDays, formatISO } from 'date-fns';
import { ChurnPredictionDashboard } from '../ChurnPredictionDashboard';
import { computeChurnRisk, getRiskLevel, type ChurnContact } from '../churnRisk';

const mockContacts = [
  { id: 'c1', name: 'Maria Silva', phone: '+5511999990001', ai_sentiment: 'negative', updated_at: '2025-01-01T00:00:00Z', created_at: '2024-12-01T00:00:00Z' },
  { id: 'c2', name: 'João Santos', phone: '+5511999990002', ai_sentiment: 'positive', updated_at: new Date().toISOString(), created_at: '2024-06-01T00:00:00Z' },
  { id: 'c3', name: 'Ana Costa', phone: '+5511999990003', ai_sentiment: 'neutral', updated_at: '2025-11-01T00:00:00Z', created_at: '2025-10-28T00:00:00Z' },
  { id: 'c4', name: 'Pedro Lima', phone: '+5511999990004', ai_sentiment: null, updated_at: '2025-08-01T00:00:00Z', created_at: '2025-07-01T00:00:00Z' },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({ data: mockContacts, error: null }),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    },
  },
}));

const NOW = new Date('2026-01-15T12:00:00Z');

function makeContact(overrides: Partial<ChurnContact> = {}): ChurnContact {
  return {
    id: 'c0',
    name: 'Contato Teste',
    phone: '+5511999990000',
    ai_sentiment: null,
    updated_at: formatISO(NOW),
    created_at: formatISO(subDays(NOW, 365)),
    ...overrides,
  };
}

describe('ChurnPredictionDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===== RENDERING =====
  describe('Rendering', () => {
    it('renders title', async () => {
      render(<ChurnPredictionDashboard />);
      await waitFor(() => {
        expect(screen.getByText('Previsão de Churn')).toBeInTheDocument();
      });
    });

    it('renders subtitle', async () => {
      render(<ChurnPredictionDashboard />);
      expect(screen.getByText(/Análise preditiva/)).toBeInTheDocument();
    });

    it('renders update button', () => {
      render(<ChurnPredictionDashboard />);
      expect(screen.getByText('Atualizar')).toBeInTheDocument();
    });

    it('renders AI analysis button', () => {
      render(<ChurnPredictionDashboard />);
      expect(screen.getByText('Análise IA')).toBeInTheDocument();
    });

    it('renders stats cards', async () => {
      render(<ChurnPredictionDashboard />);
      await waitFor(() => {
        expect(screen.getByText('Total Analisados')).toBeInTheDocument();
        expect(screen.getByText('Crítico')).toBeInTheDocument();
        expect(screen.getByText('Alto')).toBeInTheDocument();
        expect(screen.getByText('Médio')).toBeInTheDocument();
        expect(screen.getByText('Baixo')).toBeInTheDocument();
      });
    });

    it('renders risk list section', async () => {
      render(<ChurnPredictionDashboard />);
      await waitFor(() => {
        expect(screen.getByText(/Contatos em Risco/)).toBeInTheDocument();
      });
    });

    it('shows loading skeletons while fetching', () => {
      const { container } = render(<ChurnPredictionDashboard />);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  // ===== RISK SCORE ALGORITHM =====
  describe('Risk score algorithm (computeChurnRisk)', () => {
    it('assigns higher score for negative sentiment', () => {
      const negative = computeChurnRisk(makeContact({ ai_sentiment: 'negative' }), NOW);
      const positive = computeChurnRisk(makeContact({ ai_sentiment: 'positive' }), NOW);
      expect(negative.riskScore).toBeGreaterThan(positive.riskScore);
      expect(negative.riskScore).toBe(30);
    });

    it('assigns lower score for positive sentiment than neutral', () => {
      const neutral = computeChurnRisk(makeContact({ ai_sentiment: 'neutral' }), NOW);
      const positive = computeChurnRisk(makeContact({ ai_sentiment: 'positive' }), NOW);
      expect(positive.riskScore).toBeLessThan(neutral.riskScore);
      expect(positive.riskScore).toBe(0);
    });

    it('caps score at 100', () => {
      const risk = computeChurnRisk(
        makeContact({
          ai_sentiment: 'negative',
          updated_at: formatISO(subDays(NOW, 90)),
          created_at: formatISO(subDays(NOW, 91)),
        }),
        NOW
      );
      expect(risk.riskScore).toBeLessThanOrEqual(100);
    });

    it('classifies critical when score >= 80', () => {
      expect(getRiskLevel(85)).toBe('critical');
      expect(getRiskLevel(80)).toBe('critical');
    });

    it('classifies high when score >= 60', () => {
      expect(getRiskLevel(65)).toBe('high');
      expect(getRiskLevel(79)).toBe('high');
    });

    it('classifies medium when score >= 30', () => {
      expect(getRiskLevel(45)).toBe('medium');
      expect(getRiskLevel(30)).toBe('medium');
    });

    it('classifies low when score < 30', () => {
      expect(getRiskLevel(15)).toBe('low');
      expect(getRiskLevel(0)).toBe('low');
    });

    it('adds inactivity reason when > 30 days', () => {
      const risk = computeChurnRisk(makeContact({ updated_at: formatISO(subDays(NOW, 45)) }), NOW);
      expect(risk.reasons).toContain('45 dias sem interação');
      expect(risk.riskScore).toBe(30); // (45 - 30) * 2
    });

    it('adds negative sentiment reason', () => {
      const risk = computeChurnRisk(makeContact({ ai_sentiment: 'negative' }), NOW);
      expect(risk.reasons).toContain('Sentimento negativo detectado');
    });

    it('adds no-followup reason for new contacts', () => {
      const risk = computeChurnRisk(
        makeContact({
          created_at: formatISO(subDays(NOW, 5)),
          updated_at: formatISO(subDays(NOW, 5)),
        }),
        NOW
      );
      expect(risk.reasons).toContain('Novo contato sem follow-up');
      expect(risk.riskScore).toBe(20);
    });

    it('adds long-term inactive reason', () => {
      const risk = computeChurnRisk(makeContact({ updated_at: formatISO(subDays(NOW, 65)) }), NOW);
      expect(risk.reasons).toContain('Inativo por mais de 60 dias');
      // inactivity capped at 40 + long-term 10
      expect(risk.riskScore).toBe(50);
    });

    it('defaults to "Engajamento regular" when no risk', () => {
      const risk = computeChurnRisk(makeContact({ ai_sentiment: 'positive' }), NOW);
      expect(risk.reasons).toEqual(['Engajamento regular']);
      expect(risk.riskScore).toBe(0);
      expect(risk.riskLevel).toBe('low');
    });

    it('maps contact fields into the risk payload', () => {
      const risk = computeChurnRisk(makeContact({ id: 'c9', name: 'Zé', phone: '+551188887777' }), NOW);
      expect(risk.contactId).toBe('c9');
      expect(risk.contactName).toBe('Zé');
      expect(risk.phone).toBe('+551188887777');
    });
  });

  // ===== AI ANALYSIS =====
  describe('AI analysis', () => {
    it('renders AI button', () => {
      render(<ChurnPredictionDashboard />);
      expect(screen.getByText('Análise IA')).toBeInTheDocument();
    });

    it('AI button is clickable', async () => {
      render(<ChurnPredictionDashboard />);
      const btn = screen.getByText('Análise IA');
      expect(btn.closest('button')).not.toBeDisabled();
    });
  });

  // ===== SORTING =====
  describe('Sorting', () => {
    it('computes sortable scores (negative + inactive ranks above fresh positive)', () => {
      const risky = computeChurnRisk(
        makeContact({ ai_sentiment: 'negative', updated_at: formatISO(subDays(NOW, 70)) }),
        NOW
      );
      const healthy = computeChurnRisk(makeContact({ ai_sentiment: 'positive' }), NOW);
      const sorted = [healthy, risky].sort((a, b) => b.riskScore - a.riskScore);
      expect(sorted[0]).toBe(risky);
      expect(sorted[0].riskScore).toBe(80);
      expect(sorted[0].riskLevel).toBe('critical');
    });
  });

  // ===== EDGE CASES =====
  describe('Edge cases', () => {
    it('handles null sentiment without sentiment points', () => {
      const risk = computeChurnRisk(makeContact({ ai_sentiment: null }), NOW);
      expect(risk.riskScore).toBe(0);
      expect(risk.sentiment).toBeNull();
    });

    it('does not flag recently active long-time contacts', () => {
      const risk = computeChurnRisk(makeContact({ updated_at: formatISO(subDays(NOW, 10)) }), NOW);
      expect(risk.reasons).toEqual(['Engajamento regular']);
    });

    it('reports days since last message', () => {
      const risk = computeChurnRisk(makeContact({ updated_at: formatISO(subDays(NOW, 33)) }), NOW);
      expect(risk.daysSinceLastMessage).toBe(33);
    });
  });
});
