import { createClient } from '@supabase/supabase-js';

/**
 * GESTÃO DE CLIENTES — CRM Promobrindes
 * Supabase Cloud: pgxfvjmuubtbowutlide
 *
 * Tabelas principais:
 * - companies    (57.728 empresas, 71 colunas)
 * - customers    (48.623 clientes, 37 colunas)
 * - contacts     (4.747 contatos, 49 colunas)
 * - interactions (10.460 interações, 42 colunas)
 * - deals        (negócios/oportunidades)
 * - whatsapp_messages, whatsapp_instances
 * - profiles, users, salespeople
 * - rfm_analysis, company_rfm_scores
 * - interactions, activities, tasks
 */

const CLIENTES_URL =
  import.meta.env.VITE_CLIENTES_SUPABASE_URL ||
  'https://pgxfvjmuubtbowutlide.supabase.co';

const CLIENTES_ANON_KEY =
  import.meta.env.VITE_CLIENTES_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneGZ2am11dWJ0Ym93dXRsaWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjcwMTIsImV4cCI6MjA4NTcwMzAxMn0.sW9N_LChqwVNUvMmQWXx87Vhs3eoTI2OKg2TT_Cg4V0';

export const clientesSupabase = createClient(CLIENTES_URL, CLIENTES_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-app-name': 'zapp-web',
      'x-app-version': '2.0.1',
    },
  },
});

// Helpers tipados para as tabelas mais usadas no ZAPP
export const clientesDB = {
  companies: () => clientesSupabase.from('companies'),
  customers: () => clientesSupabase.from('customers'),
  contacts: () => clientesSupabase.from('contacts'),
  interactions: () => clientesSupabase.from('interactions'),
  deals: () => clientesSupabase.from('deals'),
  profiles: () => clientesSupabase.from('profiles'),
  whatsappMessages: () => clientesSupabase.from('whatsapp_messages'),
  rfmScores: () => clientesSupabase.from('company_rfm_scores'),
  activities: () => clientesSupabase.from('activities'),
  tasks: () => clientesSupabase.from('tasks'),
  alerts: () => clientesSupabase.from('alerts'),
  proposals: () => clientesSupabase.from('proposals'),
};

export type ClientesSupabase = typeof clientesSupabase;
