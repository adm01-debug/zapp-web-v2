import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { rateThreshold, rateNetwork, computeOverallScore, type MetricStatus } from '../metricThresholds';

// Mock performance API
const mockNav = {
  startTime: 0,
  loadEventEnd: 1500,
  domContentLoadedEventEnd: 800,
  responseStart: 50,
  requestStart: 10,
};

Object.defineProperty(performance, 'getEntriesByType', {
  value: vi.fn((type: string) => type === 'navigation' ? [mockNav] : []),
  writable: true,
});

Object.defineProperty(performance, 'getEntriesByName', {
  value: vi.fn((name: string) => name === 'first-contentful-paint' ? [{ startTime: 450 }] : []),
  writable: true,
});

// Mock memory
Object.defineProperty(performance, 'memory', {
  value: { usedJSHeapSize: 50 * 1048576, totalJSHeapSize: 256 * 1048576 },
  writable: true,
  configurable: true,
});

// Mock navigator.connection
Object.defineProperty(navigator, 'connection', {
  value: { effectiveType: '4g', downlink: 10, rtt: 50 },
  writable: true,
  configurable: true,
});

// Mock useAuth (needed by usePerformanceSnapshots)
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ profile: { id: 'test-profile' }, user: { id: 'test-user' } }),
}));

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
  },
}));

// Mock sonner
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Mock formatters
vi.mock('@/lib/formatters', () => ({
  formatRelativeTime: vi.fn(() => '1min atrás'),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ===== RENDERING =====
  describe('Rendering', () => {
    it('renders title', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Monitor de Performance')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText(/Métricas em tempo real/)).toBeInTheDocument();
    });

    it('renders update button', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Atualizar')).toBeInTheDocument();
    });

    it('renders performance score section', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Score de Performance')).toBeInTheDocument();
    });

    it('renders FCP metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('FCP')).toBeInTheDocument());
    });

    it('renders page load time metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('Page Load')).toBeInTheDocument());
    });

    it('renders DOM Ready metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('DOM Ready')).toBeInTheDocument());
    });

    it('renders TTFB metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('TTFB')).toBeInTheDocument());
    });

    it('renders memory metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('Memória JS')).toBeInTheDocument());
    });

    it('renders DOM Nodes metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('DOM Nodes')).toBeInTheDocument());
    });

    it('renders RTT metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText(/RTT/)).toBeInTheDocument());
    });

    it('renders connection metric', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('Conexão')).toBeInTheDocument());
    });

    it('renders cache section', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Cache Inteligente')).toBeInTheDocument();
    });

    it('renders cache hits label', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Cache Hits')).toBeInTheDocument();
    });

    it('renders cache misses label', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('Cache Misses')).toBeInTheDocument();
    });

    it('renders entries cached label', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => expect(screen.getByText('Entradas Cached')).toBeInTheDocument());
    });
  });

  // ===== SCORE CALCULATION =====
  describe('Score calculation (computeOverallScore)', () => {
    it('calculates score as percentage of good metrics', () => {
      const metrics: Array<{ status: MetricStatus }> = [
        { status: 'good' }, { status: 'good' }, { status: 'warning' }, { status: 'critical' },
      ];
      expect(computeOverallScore(metrics)).toBe(50);
    });

    it('returns 100 when all metrics are good', () => {
      expect(computeOverallScore([{ status: 'good' }, { status: 'good' }])).toBe(100);
    });

    it('returns 0 when no metrics are good', () => {
      expect(computeOverallScore([{ status: 'critical' }, { status: 'warning' }])).toBe(0);
    });

    it('handles empty metrics without dividing by zero', () => {
      expect(computeOverallScore([])).toBe(0);
    });
  });

  // ===== STATUS THRESHOLDS =====
  describe('Status thresholds (rateThreshold/rateNetwork)', () => {
    it('FCP < 1800 is good', () => {
      expect(rateThreshold(450, 1800, 3000)).toBe('good');
    });

    it('FCP 2000 is warning', () => {
      expect(rateThreshold(2000, 1800, 3000)).toBe('warning');
    });

    it('FCP 4000 is critical', () => {
      expect(rateThreshold(4000, 1800, 3000)).toBe('critical');
    });

    it('boundary value goes to the worse bucket', () => {
      expect(rateThreshold(1800, 1800, 3000)).toBe('warning');
      expect(rateThreshold(3000, 1800, 3000)).toBe('critical');
    });

    it('TTFB < 200 is good', () => {
      expect(rateThreshold(40, 200, 500)).toBe('good');
    });

    it('DOM Nodes < 1500 is good', () => {
      expect(rateThreshold(500, 1500, 3000)).toBe('good');
    });

    it('DOM Nodes > 3000 is critical', () => {
      expect(rateThreshold(5000, 1500, 3000)).toBe('critical');
    });

    it('memory < 60% is good', () => {
      expect(rateThreshold(20, 60, 80)).toBe('good');
    });

    it('RTT < 100 is good', () => {
      expect(rateThreshold(50, 100, 300)).toBe('good');
    });

    it('4g network is good', () => {
      expect(rateNetwork('4g')).toBe('good');
    });

    it('3g network is warning', () => {
      expect(rateNetwork('3g')).toBe('warning');
    });

    it('2g/slow network is critical', () => {
      expect(rateNetwork('2g')).toBe('critical');
      expect(rateNetwork('slow-2g')).toBe('critical');
    });
  });

  // ===== STATUS BADGES =====
  describe('Status badges', () => {
    it('good badge shows Bom', async () => {
      render(<PerformanceMonitor />);
      // At least some metrics should be "good"
      await waitFor(() => {
        expect(screen.getAllByText('Bom').length).toBeGreaterThan(0);
      });
    });
  });

  // ===== INTERVAL =====
  describe('Auto-refresh interval', () => {
    it('collects metrics on mount', async () => {
      render(<PerformanceMonitor />);
      await waitFor(() => {
        expect(screen.getByText('Monitor de Performance')).toBeInTheDocument();
      });
    });

    it('sets up interval for auto-refresh', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<PerformanceMonitor />);
      await waitFor(() => {
        expect(screen.getByText('Monitor de Performance')).toBeInTheDocument();
      });
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
