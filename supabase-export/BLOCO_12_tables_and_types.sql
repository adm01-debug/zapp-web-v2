-- ============================================================
-- BLOCO 12 — TABELAS + TIPOS (idempotente)
-- Schema: public
-- Aplicar: psql "$DESTINO_URL" -f BLOCO_12_tables_and_types.sql
-- Inclui: ENUMS + CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS
-- NÃO inclui: FKs (BLOCO 07), Indexes (BLOCO 06), RLS (BLOCO 09),
--             Triggers (BLOCO 05), Views (BLOCO 08), Functions (BLOCO 10)
-- ============================================================

-- ============================================================
-- PARTE 1 — ENUMS
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='ai_provider_type') THEN
    CREATE TYPE public.ai_provider_type AS ENUM ('lovable_ai','openai_compatible','google_gemini','custom_webhook','custom_agent');
  END IF;
END $$;
ALTER TYPE public.ai_provider_type ADD VALUE IF NOT EXISTS 'lovable_ai';
ALTER TYPE public.ai_provider_type ADD VALUE IF NOT EXISTS 'openai_compatible';
ALTER TYPE public.ai_provider_type ADD VALUE IF NOT EXISTS 'google_gemini';
ALTER TYPE public.ai_provider_type ADD VALUE IF NOT EXISTS 'custom_webhook';
ALTER TYPE public.ai_provider_type ADD VALUE IF NOT EXISTS 'custom_agent';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','supervisor','agent','special_agent');
  END IF;
END $$;
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'special_agent';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='channel_type') THEN
    CREATE TYPE public.channel_type AS ENUM ('whatsapp','instagram','telegram','messenger','webchat','email');
  END IF;
END $$;
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'instagram';
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'telegram';
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'messenger';
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'webchat';
ALTER TYPE public.channel_type ADD VALUE IF NOT EXISTS 'email';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='service_account_type') THEN
    CREATE TYPE public.service_account_type AS ENUM ('google_sheets','google_docs','google_calendar','google_drive','dropbox');
  END IF;
END $$;
ALTER TYPE public.service_account_type ADD VALUE IF NOT EXISTS 'google_sheets';
ALTER TYPE public.service_account_type ADD VALUE IF NOT EXISTS 'google_docs';
ALTER TYPE public.service_account_type ADD VALUE IF NOT EXISTS 'google_calendar';
ALTER TYPE public.service_account_type ADD VALUE IF NOT EXISTS 'google_drive';
ALTER TYPE public.service_account_type ADD VALUE IF NOT EXISTS 'dropbox';


-- ============================================================
-- PARTE 2 — TABELAS
-- ============================================================

-- ------------------------------------------------------------
-- TABLE: public.agent_achievements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_achievements ();
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS achievement_type text NOT NULL;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS achievement_name text NOT NULL;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS achievement_description text;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_achievements ADD COLUMN IF NOT EXISTS earned_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.agent_achievements'::regclass) THEN
    ALTER TABLE public.agent_achievements ADD CONSTRAINT agent_achievements_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.agent_achievements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.agent_skills
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_skills ();
ALTER TABLE public.agent_skills ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.agent_skills ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.agent_skills ADD COLUMN IF NOT EXISTS skill_name text NOT NULL;
ALTER TABLE public.agent_skills ADD COLUMN IF NOT EXISTS skill_level integer DEFAULT 1;
ALTER TABLE public.agent_skills ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.agent_skills'::regclass) THEN
    ALTER TABLE public.agent_skills ADD CONSTRAINT agent_skills_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='agent_skills_profile_id_skill_name_key' AND conrelid='public.agent_skills'::regclass) THEN
    ALTER TABLE public.agent_skills ADD CONSTRAINT agent_skills_profile_id_skill_name_key UNIQUE (profile_id, skill_name);
  END IF;
END $$;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.agent_stats
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_stats ();
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS level integer DEFAULT 1 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS achievements_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS messages_sent integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS messages_received integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS conversations_resolved integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS avg_response_time_seconds integer DEFAULT 0;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS customer_satisfaction_score numeric(3,2) DEFAULT 0;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS best_streak integer DEFAULT 0 NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.agent_stats ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.agent_stats'::regclass) THEN
    ALTER TABLE public.agent_stats ADD CONSTRAINT agent_stats_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='agent_stats_profile_id_key' AND conrelid='public.agent_stats'::regclass) THEN
    ALTER TABLE public.agent_stats ADD CONSTRAINT agent_stats_profile_id_key UNIQUE (profile_id);
  END IF;
END $$;
ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.agent_visibility_grants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_visibility_grants ();
ALTER TABLE public.agent_visibility_grants ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.agent_visibility_grants ADD COLUMN IF NOT EXISTS agent_id uuid NOT NULL;
ALTER TABLE public.agent_visibility_grants ADD COLUMN IF NOT EXISTS can_see_agent_id uuid NOT NULL;
ALTER TABLE public.agent_visibility_grants ADD COLUMN IF NOT EXISTS granted_by uuid;
ALTER TABLE public.agent_visibility_grants ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.agent_visibility_grants'::regclass) THEN
    ALTER TABLE public.agent_visibility_grants ADD CONSTRAINT agent_visibility_grants_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='agent_visibility_grants_agent_id_can_see_agent_id_key' AND conrelid='public.agent_visibility_grants'::regclass) THEN
    ALTER TABLE public.agent_visibility_grants ADD CONSTRAINT agent_visibility_grants_agent_id_can_see_agent_id_key UNIQUE (agent_id, can_see_agent_id);
  END IF;
END $$;
ALTER TABLE public.agent_visibility_grants ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.ai_conversation_tags
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversation_tags ();
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS tag_name text NOT NULL;
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS confidence numeric DEFAULT 0.0;
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS source text DEFAULT 'ai'::text;
ALTER TABLE public.ai_conversation_tags ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.ai_conversation_tags'::regclass) THEN
    ALTER TABLE public.ai_conversation_tags ADD CONSTRAINT ai_conversation_tags_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.ai_conversation_tags ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.ai_providers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_providers ();
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS provider_type ai_provider_type DEFAULT 'lovable_ai'::ai_provider_type NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS api_endpoint text;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS api_key_secret_name text;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS system_prompt text;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS use_for text[] DEFAULT ARRAY['copilot'::text] NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.ai_providers ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.ai_providers'::regclass) THEN
    ALTER TABLE public.ai_providers ADD CONSTRAINT ai_providers_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.ai_usage_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_logs ();
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS function_name text NOT NULL;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS input_tokens integer DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS output_tokens integer DEFAULT 0;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS total_tokens integer DEFAULT (input_tokens + output_tokens);
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS duration_ms integer;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS status text DEFAULT 'success'::text NOT NULL;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.ai_usage_logs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.ai_usage_logs'::regclass) THEN
    ALTER TABLE public.ai_usage_logs ADD CONSTRAINT ai_usage_logs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.allowed_countries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.allowed_countries ();
ALTER TABLE public.allowed_countries ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.allowed_countries ADD COLUMN IF NOT EXISTS country_code text NOT NULL;
ALTER TABLE public.allowed_countries ADD COLUMN IF NOT EXISTS country_name text NOT NULL;
ALTER TABLE public.allowed_countries ADD COLUMN IF NOT EXISTS added_by uuid;
ALTER TABLE public.allowed_countries ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.allowed_countries'::regclass) THEN
    ALTER TABLE public.allowed_countries ADD CONSTRAINT allowed_countries_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='allowed_countries_country_code_key' AND conrelid='public.allowed_countries'::regclass) THEN
    ALTER TABLE public.allowed_countries ADD CONSTRAINT allowed_countries_country_code_key UNIQUE (country_code);
  END IF;
END $$;
ALTER TABLE public.allowed_countries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.audio_memes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audio_memes ();
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS audio_url text NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS category text DEFAULT 'outros'::text NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS duration_seconds numeric(6,2);
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS uploaded_by uuid;
ALTER TABLE public.audio_memes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.audio_memes'::regclass) THEN
    ALTER TABLE public.audio_memes ADD CONSTRAINT audio_memes_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.audio_memes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.audit_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs ();
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action text NOT NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_type text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id uuid;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.audit_logs'::regclass) THEN
    ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.auto_close_config
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auto_close_config ();
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS inactivity_hours integer DEFAULT 24 NOT NULL;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS close_message text DEFAULT 'Conversa encerrada automaticamente por inatividade.'::text;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.auto_close_config ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.auto_close_config'::regclass) THEN
    ALTER TABLE public.auto_close_config ADD CONSTRAINT auto_close_config_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.auto_close_config ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.automations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automations ();
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS description text DEFAULT ''::text;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'new_message'::text NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS trigger_config jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS actions jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS last_triggered_at timestamp with time zone;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS trigger_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.automations'::regclass) THEN
    ALTER TABLE public.automations ADD CONSTRAINT automations_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.away_messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.away_messages ();
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid NOT NULL;
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS content text DEFAULT 'Estamos fora do horário de atendimento. Retornaremos em breve!'::text;
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT true;
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.away_messages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.away_messages'::regclass) THEN
    ALTER TABLE public.away_messages ADD CONSTRAINT away_messages_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='away_messages_whatsapp_connection_id_key' AND conrelid='public.away_messages'::regclass) THEN
    ALTER TABLE public.away_messages ADD CONSTRAINT away_messages_whatsapp_connection_id_key UNIQUE (whatsapp_connection_id);
  END IF;
END $$;
ALTER TABLE public.away_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.blocked_countries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_countries ();
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS country_code text NOT NULL;
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS country_name text NOT NULL;
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS blocked_by uuid;
ALTER TABLE public.blocked_countries ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.blocked_countries'::regclass) THEN
    ALTER TABLE public.blocked_countries ADD CONSTRAINT blocked_countries_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blocked_countries_country_code_key' AND conrelid='public.blocked_countries'::regclass) THEN
    ALTER TABLE public.blocked_countries ADD CONSTRAINT blocked_countries_country_code_key UNIQUE (country_code);
  END IF;
END $$;
ALTER TABLE public.blocked_countries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.blocked_ips
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_ips ();
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS ip_address text NOT NULL;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS reason text NOT NULL;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS blocked_by uuid;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS is_permanent boolean DEFAULT false;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS request_count integer DEFAULT 0;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS last_attempt_at timestamp with time zone;
ALTER TABLE public.blocked_ips ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.blocked_ips'::regclass) THEN
    ALTER TABLE public.blocked_ips ADD CONSTRAINT blocked_ips_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blocked_ips_ip_address_key' AND conrelid='public.blocked_ips'::regclass) THEN
    ALTER TABLE public.blocked_ips ADD CONSTRAINT blocked_ips_ip_address_key UNIQUE (ip_address);
  END IF;
END $$;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.business_hours
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_hours ();
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid NOT NULL;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS day_of_week integer NOT NULL;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS open_time time without time zone DEFAULT '09:00:00'::time without time zone;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS close_time time without time zone DEFAULT '18:00:00'::time without time zone;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.business_hours ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.business_hours'::regclass) THEN
    ALTER TABLE public.business_hours ADD CONSTRAINT business_hours_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='business_hours_whatsapp_connection_id_day_of_week_key' AND conrelid='public.business_hours'::regclass) THEN
    ALTER TABLE public.business_hours ADD CONSTRAINT business_hours_whatsapp_connection_id_day_of_week_key UNIQUE (whatsapp_connection_id, day_of_week);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='business_hours_day_of_week_check' AND conrelid='public.business_hours'::regclass) THEN
    ALTER TABLE public.business_hours ADD CONSTRAINT business_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)));
  END IF;
END $$;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.calls
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calls ();
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS direction text NOT NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS status text DEFAULT 'ringing'::text NOT NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS started_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS answered_at timestamp with time zone;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.calls'::regclass) THEN
    ALTER TABLE public.calls ADD CONSTRAINT calls_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='calls_direction_check' AND conrelid='public.calls'::regclass) THEN
    ALTER TABLE public.calls ADD CONSTRAINT calls_direction_check CHECK ((direction = ANY (ARRAY['inbound'::text, 'outbound'::text])));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='calls_status_check' AND conrelid='public.calls'::regclass) THEN
    ALTER TABLE public.calls ADD CONSTRAINT calls_status_check CHECK ((status = ANY (ARRAY['ringing'::text, 'answered'::text, 'ended'::text, 'missed'::text, 'busy'::text, 'failed'::text])));
  END IF;
END $$;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.campaign_ab_variants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_ab_variants ();
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS campaign_id uuid NOT NULL;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS variant_name text DEFAULT 'A'::text NOT NULL;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS message_content text NOT NULL;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS send_count integer DEFAULT 0;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS delivered_count integer DEFAULT 0;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS read_count integer DEFAULT 0;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS response_count integer DEFAULT 0;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS is_winner boolean DEFAULT false;
ALTER TABLE public.campaign_ab_variants ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.campaign_ab_variants'::regclass) THEN
    ALTER TABLE public.campaign_ab_variants ADD CONSTRAINT campaign_ab_variants_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.campaign_ab_variants ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.campaign_contacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_contacts ();
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS campaign_id uuid NOT NULL;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.campaign_contacts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.campaign_contacts'::regclass) THEN
    ALTER TABLE public.campaign_contacts ADD CONSTRAINT campaign_contacts_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='campaign_contacts_status_check' AND conrelid='public.campaign_contacts'::regclass) THEN
    ALTER TABLE public.campaign_contacts ADD CONSTRAINT campaign_contacts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])));
  END IF;
END $$;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.campaigns
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns ();
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS message_content text NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text'::text NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'::text NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS total_contacts integer DEFAULT 0 NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS sent_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS delivered_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS read_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS failed_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_type text DEFAULT 'all'::text NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_filter jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS send_interval_seconds integer DEFAULT 5;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.campaigns'::regclass) THEN
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='campaigns_status_check' AND conrelid='public.campaigns'::regclass) THEN
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'sending'::text, 'completed'::text, 'cancelled'::text, 'paused'::text])));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='campaigns_target_type_check' AND conrelid='public.campaigns'::regclass) THEN
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_target_type_check CHECK ((target_type = ANY (ARRAY['all'::text, 'tag'::text, 'queue'::text, 'custom'::text])));
  END IF;
END $$;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.channel_connections
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.channel_connections ();
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS channel_type channel_type NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS status text DEFAULT 'disconnected'::text NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS credentials jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS external_account_id text;
ALTER TABLE public.channel_connections ADD COLUMN IF NOT EXISTS external_page_id text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.channel_connections'::regclass) THEN
    ALTER TABLE public.channel_connections ADD CONSTRAINT channel_connections_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.channel_routing_rules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.channel_routing_rules ();
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS channel_type channel_type NOT NULL;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS channel_connection_id uuid;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS queue_id uuid;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.channel_routing_rules ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.channel_routing_rules'::regclass) THEN
    ALTER TABLE public.channel_routing_rules ADD CONSTRAINT channel_routing_rules_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.channel_routing_rules ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.chatbot_executions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chatbot_executions ();
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS flow_id uuid NOT NULL;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS current_node_id text;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS status text DEFAULT 'running'::text NOT NULL;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS variables jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS started_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.chatbot_executions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.chatbot_executions'::regclass) THEN
    ALTER TABLE public.chatbot_executions ADD CONSTRAINT chatbot_executions_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chatbot_executions_status_check' AND conrelid='public.chatbot_executions'::regclass) THEN
    ALTER TABLE public.chatbot_executions ADD CONSTRAINT chatbot_executions_status_check CHECK ((status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'paused'::text, 'cancelled'::text])));
  END IF;
END $$;
ALTER TABLE public.chatbot_executions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.chatbot_flows
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chatbot_flows ();
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS trigger_type text DEFAULT 'keyword'::text NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS trigger_value text;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS nodes jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS edges jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS variables jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS execution_count integer DEFAULT 0;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS last_executed_at timestamp with time zone;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.chatbot_flows ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.chatbot_flows'::regclass) THEN
    ALTER TABLE public.chatbot_flows ADD CONSTRAINT chatbot_flows_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chatbot_flows_trigger_type_check' AND conrelid='public.chatbot_flows'::regclass) THEN
    ALTER TABLE public.chatbot_flows ADD CONSTRAINT chatbot_flows_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['keyword'::text, 'first_message'::text, 'menu'::text, 'webhook'::text, 'schedule'::text])));
  END IF;
END $$;
ALTER TABLE public.chatbot_flows ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.client_wallet_rules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_wallet_rules ();
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS agent_id uuid NOT NULL;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.client_wallet_rules ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.client_wallet_rules'::regclass) THEN
    ALTER TABLE public.client_wallet_rules ADD CONSTRAINT client_wallet_rules_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.client_wallet_rules ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.connection_health_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connection_health_logs ();
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS connection_id uuid NOT NULL;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS instance_id text NOT NULL;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS status text DEFAULT 'unknown'::text NOT NULL;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS response_time_ms integer;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.connection_health_logs ADD COLUMN IF NOT EXISTS checked_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.connection_health_logs'::regclass) THEN
    ALTER TABLE public.connection_health_logs ADD CONSTRAINT connection_health_logs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.connection_health_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.contact_custom_fields
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_custom_fields ();
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS field_name text NOT NULL;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS field_value text;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS field_type text DEFAULT 'text'::text NOT NULL;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.contact_custom_fields ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.contact_custom_fields'::regclass) THEN
    ALTER TABLE public.contact_custom_fields ADD CONSTRAINT contact_custom_fields_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.contact_custom_fields ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.contact_notes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_notes ();
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS author_id uuid NOT NULL;
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS content text NOT NULL;
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.contact_notes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.contact_notes'::regclass) THEN
    ALTER TABLE public.contact_notes ADD CONSTRAINT contact_notes_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.contact_purchases
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_purchases ();
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS amount numeric(12,2);
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL'::text;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS purchase_type text DEFAULT 'purchase'::text;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS deal_id uuid;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS purchased_at timestamp with time zone;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.contact_purchases ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.contact_purchases'::regclass) THEN
    ALTER TABLE public.contact_purchases ADD CONSTRAINT contact_purchases_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.contact_purchases ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.contact_tags
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_tags ();
ALTER TABLE public.contact_tags ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.contact_tags ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.contact_tags ADD COLUMN IF NOT EXISTS tag_id uuid NOT NULL;
ALTER TABLE public.contact_tags ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.contact_tags'::regclass) THEN
    ALTER TABLE public.contact_tags ADD CONSTRAINT contact_tags_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contact_tags_contact_id_tag_id_key' AND conrelid='public.contact_tags'::regclass) THEN
    ALTER TABLE public.contact_tags ADD CONSTRAINT contact_tags_contact_id_tag_id_key UNIQUE (contact_id, tag_id);
  END IF;
END $$;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.contacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts ();
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS phone text NOT NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS assigned_to uuid;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS surname text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS queue_id uuid;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS contact_type text DEFAULT 'cliente'::text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS ai_priority text DEFAULT 'normal'::text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS ai_sentiment text DEFAULT 'neutral'::text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS channel_type text DEFAULT 'whatsapp'::text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS channel_connection_id uuid;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS group_category text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS lead_origin text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS consent_status text DEFAULT 'unknown'::text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.contacts'::regclass) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contacts_phone_key' AND conrelid='public.contacts'::regclass) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT contacts_phone_key UNIQUE (phone);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contacts_phone_unique' AND conrelid='public.contacts'::regclass) THEN
    ALTER TABLE public.contacts ADD CONSTRAINT contacts_phone_unique UNIQUE (phone);
  END IF;
END $$;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_analyses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_analyses ();
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS analyzed_by uuid;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS summary text NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente'::text NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS key_points text[] DEFAULT '{}'::text[];
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS next_steps text[] DEFAULT '{}'::text[];
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS sentiment text DEFAULT 'neutro'::text NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS sentiment_score integer DEFAULT 50;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}'::text[];
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'media'::text;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS customer_satisfaction integer DEFAULT 3;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS department text DEFAULT 'outros'::text;
ALTER TABLE public.conversation_analyses ADD COLUMN IF NOT EXISTS relationship_type text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_analyses'::regclass) THEN
    ALTER TABLE public.conversation_analyses ADD CONSTRAINT conversation_analyses_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_analyses ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_closures
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_closures ();
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS closed_by uuid;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS close_reason text NOT NULL;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS classification text;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.conversation_closures ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_closures'::regclass) THEN
    ALTER TABLE public.conversation_closures ADD CONSTRAINT conversation_closures_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_closures ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_events ();
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS event_type text NOT NULL;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS from_agent_id uuid;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS to_agent_id uuid;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS from_queue_id uuid;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS to_queue_id uuid;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS performed_by uuid;
ALTER TABLE public.conversation_events ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_events'::regclass) THEN
    ALTER TABLE public.conversation_events ADD CONSTRAINT conversation_events_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_memory
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_memory ();
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS facts jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS objections_handled jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS promises_made jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS pending_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS commercial_summary text;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS cumulative_summary text;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.conversation_memory ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_memory'::regclass) THEN
    ALTER TABLE public.conversation_memory ADD CONSTRAINT conversation_memory_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversation_memory_contact_id_key' AND conrelid='public.conversation_memory'::regclass) THEN
    ALTER TABLE public.conversation_memory ADD CONSTRAINT conversation_memory_contact_id_key UNIQUE (contact_id);
  END IF;
END $$;
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_sla
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_sla ();
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS sla_configuration_id uuid;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS first_message_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS first_response_at timestamp with time zone;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS first_response_breached boolean DEFAULT false;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS resolution_breached boolean DEFAULT false;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.conversation_sla ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_sla'::regclass) THEN
    ALTER TABLE public.conversation_sla ADD CONSTRAINT conversation_sla_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_sla ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_snoozes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_snoozes ();
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS snoozed_by uuid NOT NULL;
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS snooze_until timestamp with time zone NOT NULL;
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.conversation_snoozes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_snoozes'::regclass) THEN
    ALTER TABLE public.conversation_snoozes ADD CONSTRAINT conversation_snoozes_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_snoozes ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.conversation_tasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_tasks ();
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS assigned_to uuid;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'::text NOT NULL;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.conversation_tasks ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.conversation_tasks'::regclass) THEN
    ALTER TABLE public.conversation_tasks ADD CONSTRAINT conversation_tasks_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.conversation_tasks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.crisis_room_alerts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crisis_room_alerts ();
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS severity text DEFAULT 'warning'::text NOT NULL;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS metric_name text NOT NULL;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS metric_value numeric;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS threshold numeric;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS message text NOT NULL;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS acknowledged_by uuid;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone;
ALTER TABLE public.crisis_room_alerts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.crisis_room_alerts'::regclass) THEN
    ALTER TABLE public.crisis_room_alerts ADD CONSTRAINT crisis_room_alerts_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.crisis_room_alerts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.csat_auto_config
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.csat_auto_config ();
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS is_enabled boolean DEFAULT false;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS delay_minutes integer DEFAULT 5;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS message_template text DEFAULT 'Olá {name}! Como foi seu atendimento? Avalie de 1 a 5 ⭐'::text;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.csat_auto_config ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.csat_auto_config'::regclass) THEN
    ALTER TABLE public.csat_auto_config ADD CONSTRAINT csat_auto_config_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.csat_auto_config ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.csat_surveys
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.csat_surveys ();
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS agent_id uuid NOT NULL;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS rating integer NOT NULL;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS feedback text;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS conversation_resolved_at timestamp with time zone;
ALTER TABLE public.csat_surveys ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.csat_surveys'::regclass) THEN
    ALTER TABLE public.csat_surveys ADD CONSTRAINT csat_surveys_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.csat_surveys ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.custom_emojis
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_emojis ();
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS image_url text NOT NULL;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS category text DEFAULT 'outros'::text;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS uploaded_by uuid;
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.custom_emojis ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.custom_emojis'::regclass) THEN
    ALTER TABLE public.custom_emojis ADD CONSTRAINT custom_emojis_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.custom_emojis ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.deal_activities
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deal_activities ();
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS deal_id uuid NOT NULL;
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS activity_type text NOT NULL;
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS performed_by uuid;
ALTER TABLE public.deal_activities ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.deal_activities'::regclass) THEN
    ALTER TABLE public.deal_activities ADD CONSTRAINT deal_activities_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.email_labels
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_labels ();
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS gmail_account_id uuid NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS gmail_label_id text NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS label_type text DEFAULT 'user'::text NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.email_labels ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.email_labels'::regclass) THEN
    ALTER TABLE public.email_labels ADD CONSTRAINT email_labels_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_labels_gmail_account_id_gmail_label_id_key' AND conrelid='public.email_labels'::regclass) THEN
    ALTER TABLE public.email_labels ADD CONSTRAINT email_labels_gmail_account_id_gmail_label_id_key UNIQUE (gmail_account_id, gmail_label_id);
  END IF;
END $$;
ALTER TABLE public.email_labels ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.email_messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_messages ();
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS thread_id uuid NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS gmail_message_id text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS gmail_account_id uuid NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS from_address text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS from_name text;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS to_addresses text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS cc_addresses text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS bcc_addresses text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS reply_to_address text;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS subject text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS body_text text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS body_html text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS snippet text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS label_ids text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS is_starred boolean DEFAULT false NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS has_attachments boolean DEFAULT false NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS in_reply_to text;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS references_header text;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS internal_date timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS direction text DEFAULT 'inbound'::text NOT NULL;
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.email_messages'::regclass) THEN
    ALTER TABLE public.email_messages ADD CONSTRAINT email_messages_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_messages_gmail_account_id_gmail_message_id_key' AND conrelid='public.email_messages'::regclass) THEN
    ALTER TABLE public.email_messages ADD CONSTRAINT email_messages_gmail_account_id_gmail_message_id_key UNIQUE (gmail_account_id, gmail_message_id);
  END IF;
END $$;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.email_threads
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_threads ();
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS gmail_account_id uuid NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS gmail_thread_id text NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS subject text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS snippet text DEFAULT ''::text NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS label_ids text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS is_unread boolean DEFAULT true NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS is_starred boolean DEFAULT false NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS is_important boolean DEFAULT false NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS last_message_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS assigned_to uuid;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS status text DEFAULT 'open'::text NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'::text NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.email_threads ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.email_threads'::regclass) THEN
    ALTER TABLE public.email_threads ADD CONSTRAINT email_threads_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_threads_gmail_account_id_gmail_thread_id_key' AND conrelid='public.email_threads'::regclass) THEN
    ALTER TABLE public.email_threads ADD CONSTRAINT email_threads_gmail_account_id_gmail_thread_id_key UNIQUE (gmail_account_id, gmail_thread_id);
  END IF;
END $$;
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.entity_versions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entity_versions ();
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS entity_type text NOT NULL;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS entity_id uuid NOT NULL;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS version_number integer NOT NULL;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS changed_by uuid;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS change_summary text;
ALTER TABLE public.entity_versions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.entity_versions'::regclass) THEN
    ALTER TABLE public.entity_versions ADD CONSTRAINT entity_versions_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='entity_versions_entity_type_entity_id_version_number_key' AND conrelid='public.entity_versions'::regclass) THEN
    ALTER TABLE public.entity_versions ADD CONSTRAINT entity_versions_entity_type_entity_id_version_number_key UNIQUE (entity_type, entity_id, version_number);
  END IF;
END $$;
ALTER TABLE public.entity_versions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.favorite_contacts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorite_contacts ();
ALTER TABLE public.favorite_contacts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.favorite_contacts ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.favorite_contacts ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.favorite_contacts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.favorite_contacts'::regclass) THEN
    ALTER TABLE public.favorite_contacts ADD CONSTRAINT favorite_contacts_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='favorite_contacts_contact_id_user_id_key' AND conrelid='public.favorite_contacts'::regclass) THEN
    ALTER TABLE public.favorite_contacts ADD CONSTRAINT favorite_contacts_contact_id_user_id_key UNIQUE (contact_id, user_id);
  END IF;
END $$;
ALTER TABLE public.favorite_contacts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.followup_executions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.followup_executions ();
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS sequence_id uuid NOT NULL;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 0;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS started_at timestamp with time zone DEFAULT now();
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS next_step_at timestamp with time zone;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;
ALTER TABLE public.followup_executions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.followup_executions'::regclass) THEN
    ALTER TABLE public.followup_executions ADD CONSTRAINT followup_executions_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.followup_executions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.followup_sequences
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.followup_sequences ();
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS trigger_event text DEFAULT 'ticket_resolved'::text NOT NULL;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.followup_sequences ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.followup_sequences'::regclass) THEN
    ALTER TABLE public.followup_sequences ADD CONSTRAINT followup_sequences_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.followup_sequences ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.followup_steps
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.followup_steps ();
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS sequence_id uuid NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS step_order integer DEFAULT 1 NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS delay_hours integer DEFAULT 24 NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS message_template text NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text'::text NOT NULL;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.followup_steps ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.followup_steps'::regclass) THEN
    ALTER TABLE public.followup_steps ADD CONSTRAINT followup_steps_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.followup_steps ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.geo_blocking_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.geo_blocking_settings ();
ALTER TABLE public.geo_blocking_settings ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.geo_blocking_settings ADD COLUMN IF NOT EXISTS mode text DEFAULT 'disabled'::text NOT NULL;
ALTER TABLE public.geo_blocking_settings ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.geo_blocking_settings ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.geo_blocking_settings ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.geo_blocking_settings'::regclass) THEN
    ALTER TABLE public.geo_blocking_settings ADD CONSTRAINT geo_blocking_settings_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='geo_blocking_settings_mode_check' AND conrelid='public.geo_blocking_settings'::regclass) THEN
    ALTER TABLE public.geo_blocking_settings ADD CONSTRAINT geo_blocking_settings_mode_check CHECK ((mode = ANY (ARRAY['disabled'::text, 'whitelist'::text, 'blacklist'::text])));
  END IF;
END $$;
ALTER TABLE public.geo_blocking_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.global_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_settings ();
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS key text NOT NULL;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS value text;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.global_settings ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.global_settings'::regclass) THEN
    ALTER TABLE public.global_settings ADD CONSTRAINT global_settings_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='global_settings_key_key' AND conrelid='public.global_settings'::regclass) THEN
    ALTER TABLE public.global_settings ADD CONSTRAINT global_settings_key_key UNIQUE (key);
  END IF;
END $$;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.gmail_accounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gmail_accounts ();
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS email_address text NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS access_token_encrypted bytea;
ALTER TABLE public.gmail_accounts ADD COLUMN IF NOT EXISTS refresh_token_encrypted bytea;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.gmail_accounts'::regclass) THEN
    ALTER TABLE public.gmail_accounts ADD CONSTRAINT gmail_accounts_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='gmail_accounts_email_address_key' AND conrelid='public.gmail_accounts'::regclass) THEN
    ALTER TABLE public.gmail_accounts ADD CONSTRAINT gmail_accounts_email_address_key UNIQUE (email_address);
  END IF;
END $$;
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.goals_configurations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals_configurations ();
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS profile_id uuid;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS queue_id uuid;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS goal_type text NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS daily_target integer DEFAULT 0 NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS weekly_target integer DEFAULT 0 NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS monthly_target integer DEFAULT 0 NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.goals_configurations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.goals_configurations'::regclass) THEN
    ALTER TABLE public.goals_configurations ADD CONSTRAINT goals_configurations_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='goals_configurations_profile_id_goal_type_key' AND conrelid='public.goals_configurations'::regclass) THEN
    ALTER TABLE public.goals_configurations ADD CONSTRAINT goals_configurations_profile_id_goal_type_key UNIQUE (profile_id, goal_type);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='goals_configurations_queue_id_goal_type_key' AND conrelid='public.goals_configurations'::regclass) THEN
    ALTER TABLE public.goals_configurations ADD CONSTRAINT goals_configurations_queue_id_goal_type_key UNIQUE (queue_id, goal_type);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='goal_owner_check' AND conrelid='public.goals_configurations'::regclass) THEN
    ALTER TABLE public.goals_configurations ADD CONSTRAINT goal_owner_check CHECK ((((profile_id IS NOT NULL) AND (queue_id IS NULL)) OR ((profile_id IS NULL) AND (queue_id IS NOT NULL))));
  END IF;
END $$;
ALTER TABLE public.goals_configurations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.ip_whitelist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ip_whitelist ();
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS ip_address text NOT NULL;
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS added_by uuid;
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.ip_whitelist'::regclass) THEN
    ALTER TABLE public.ip_whitelist ADD CONSTRAINT ip_whitelist_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ip_whitelist_ip_address_key' AND conrelid='public.ip_whitelist'::regclass) THEN
    ALTER TABLE public.ip_whitelist ADD CONSTRAINT ip_whitelist_ip_address_key UNIQUE (ip_address);
  END IF;
END $$;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.knowledge_base_articles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_base_articles ();
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS content text NOT NULL;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'::text;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS embedding_status text DEFAULT 'pending'::text;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.knowledge_base_articles ADD COLUMN IF NOT EXISTS search_vector tsvector DEFAULT ((setweight(to_tsvector('portuguese'::regconfig, COALESCE(title, ''::text)), 'A'::"char") || setweight(to_tsvector('portuguese'::regconfig, COALESCE(category, ''::text)), 'B'::"char")) || setweight(to_tsvector('portuguese'::regconfig, COALESCE(content, ''::text)), 'C'::"char"));
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.knowledge_base_articles'::regclass) THEN
    ALTER TABLE public.knowledge_base_articles ADD CONSTRAINT knowledge_base_articles_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.knowledge_base_files
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_base_files ();
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS article_id uuid;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS file_name text NOT NULL;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS file_url text NOT NULL;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS file_size integer;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending'::text;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS extracted_text text;
ALTER TABLE public.knowledge_base_files ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.knowledge_base_files'::regclass) THEN
    ALTER TABLE public.knowledge_base_files ADD CONSTRAINT knowledge_base_files_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.login_attempts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_attempts ();
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS email text NOT NULL;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS attempt_count integer DEFAULT 1 NOT NULL;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS last_attempt_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.login_attempts'::regclass) THEN
    ALTER TABLE public.login_attempts ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='login_attempts_email_key' AND conrelid='public.login_attempts'::regclass) THEN
    ALTER TABLE public.login_attempts ADD CONSTRAINT login_attempts_email_key UNIQUE (email);
  END IF;
END $$;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.message_reactions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_reactions ();
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS message_id uuid NOT NULL;
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS emoji text NOT NULL;
ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.message_reactions'::regclass) THEN
    ALTER TABLE public.message_reactions ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='message_reactions_message_id_contact_id_emoji_key' AND conrelid='public.message_reactions'::regclass) THEN
    ALTER TABLE public.message_reactions ADD CONSTRAINT message_reactions_message_id_contact_id_emoji_key UNIQUE (message_id, contact_id, emoji);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='message_reactions_message_id_user_id_emoji_key' AND conrelid='public.message_reactions'::regclass) THEN
    ALTER TABLE public.message_reactions ADD CONSTRAINT message_reactions_message_id_user_id_emoji_key UNIQUE (message_id, user_id, emoji);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='reaction_author_check' AND conrelid='public.message_reactions'::regclass) THEN
    ALTER TABLE public.message_reactions ADD CONSTRAINT reaction_author_check CHECK (((user_id IS NOT NULL) OR (contact_id IS NOT NULL)));
  END IF;
END $$;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.message_templates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_templates ();
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS content text NOT NULL;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS shortcut text;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'::text;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS is_global boolean DEFAULT false;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.message_templates'::regclass) THEN
    ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages ();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender text NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content text NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text'::text NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS transcription text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS transcription_status text DEFAULT 'pending'::text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent'::text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status_updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_type text DEFAULT 'whatsapp'::text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_connection_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.messages'::regclass) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='messages_message_type_check' AND conrelid='public.messages'::regclass) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'audio'::text, 'video'::text, 'document'::text, 'sticker'::text, 'location'::text, 'contact'::text, 'poll'::text, 'button'::text, 'list'::text, 'reaction'::text, 'vcard'::text, 'ptt'::text, 'link'::text, 'template'::text, 'interactive'::text, 'order'::text, 'product'::text, 'catalog'::text])));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='messages_sender_check' AND conrelid='public.messages'::regclass) THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_check CHECK ((sender = ANY (ARRAY['agent'::text, 'contact'::text])));
  END IF;
END $$;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.meta_capi_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meta_capi_events ();
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS event_name text NOT NULL;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS event_time timestamp with time zone DEFAULT now();
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS pixel_id text;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS event_source_url text;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS action_source text DEFAULT 'chat'::text;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS custom_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS sent_to_meta boolean DEFAULT false;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS meta_response jsonb;
ALTER TABLE public.meta_capi_events ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.meta_capi_events'::regclass) THEN
    ALTER TABLE public.meta_capi_events ADD CONSTRAINT meta_capi_events_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.meta_capi_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.mfa_sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mfa_sessions ();
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS factor_id text NOT NULL;
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.mfa_sessions ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + '00:05:00'::interval) NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.mfa_sessions'::regclass) THEN
    ALTER TABLE public.mfa_sessions ADD CONSTRAINT mfa_sessions_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications ();
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message text NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text DEFAULT 'info'::text NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.notifications'::regclass) THEN
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.nps_surveys
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nps_surveys ();
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS score integer NOT NULL;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS feedback text;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS survey_type text DEFAULT 'manual'::text NOT NULL;
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.nps_surveys'::regclass) THEN
    ALTER TABLE public.nps_surveys ADD CONSTRAINT nps_surveys_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='nps_surveys_score_check' AND conrelid='public.nps_surveys'::regclass) THEN
    ALTER TABLE public.nps_surveys ADD CONSTRAINT nps_surveys_score_check CHECK (((score >= 0) AND (score <= 10)));
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='nps_surveys_survey_type_check' AND conrelid='public.nps_surveys'::regclass) THEN
    ALTER TABLE public.nps_surveys ADD CONSTRAINT nps_surveys_survey_type_check CHECK ((survey_type = ANY (ARRAY['periodic'::text, 'post_resolution'::text, 'manual'::text])));
  END IF;
END $$;
ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.number_reputation
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.number_reputation ();
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 100 NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS messages_sent_today integer DEFAULT 0 NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS failures_today integer DEFAULT 0 NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS complaints_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS warmup_status text DEFAULT 'none'::text NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS warmup_day integer DEFAULT 0;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS daily_limit integer DEFAULT 200;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS last_reset_at timestamp with time zone DEFAULT now();
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.number_reputation ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.number_reputation'::regclass) THEN
    ALTER TABLE public.number_reputation ADD CONSTRAINT number_reputation_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='number_reputation_whatsapp_connection_id_key' AND conrelid='public.number_reputation'::regclass) THEN
    ALTER TABLE public.number_reputation ADD CONSTRAINT number_reputation_whatsapp_connection_id_key UNIQUE (whatsapp_connection_id);
  END IF;
END $$;
ALTER TABLE public.number_reputation ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.passkey_credentials
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.passkey_credentials ();
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS credential_id text NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS public_key text NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS counter bigint DEFAULT 0 NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS backed_up boolean DEFAULT false;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS transports text[];
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS friendly_name text;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.passkey_credentials'::regclass) THEN
    ALTER TABLE public.passkey_credentials ADD CONSTRAINT passkey_credentials_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='passkey_credentials_credential_id_key' AND conrelid='public.passkey_credentials'::regclass) THEN
    ALTER TABLE public.passkey_credentials ADD CONSTRAINT passkey_credentials_credential_id_key UNIQUE (credential_id);
  END IF;
END $$;
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.password_reset_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.password_reset_requests ();
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS email text NOT NULL;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS reviewed_by uuid;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.password_reset_requests'::regclass) THEN
    ALTER TABLE public.password_reset_requests ADD CONSTRAINT password_reset_requests_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='password_reset_requests_status_check' AND conrelid='public.password_reset_requests'::regclass) THEN
    ALTER TABLE public.password_reset_requests ADD CONSTRAINT password_reset_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
  END IF;
END $$;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.payment_links
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_links ();
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS amount numeric(12,2) NOT NULL;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL'::text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'::text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix'::text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS payment_url text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS deal_id uuid;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.payment_links ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.payment_links'::regclass) THEN
    ALTER TABLE public.payment_links ADD CONSTRAINT payment_links_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.performance_snapshots
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.performance_snapshots ();
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS fcp integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS page_load integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS dom_ready integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS ttfb integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS memory_used integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS memory_total integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS dom_nodes integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS network_type text DEFAULT '4g'::text;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS rtt integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS overall_score integer DEFAULT 0;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.performance_snapshots ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.performance_snapshots'::regclass) THEN
    ALTER TABLE public.performance_snapshots ADD CONSTRAINT performance_snapshots_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.performance_snapshots ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.permissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions ();
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'::text NOT NULL;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.permissions'::regclass) THEN
    ALTER TABLE public.permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='permissions_name_key' AND conrelid='public.permissions'::regclass) THEN
    ALTER TABLE public.permissions ADD CONSTRAINT permissions_name_key UNIQUE (name);
  END IF;
END $$;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.pinned_conversations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pinned_conversations ();
ALTER TABLE public.pinned_conversations ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.pinned_conversations ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.pinned_conversations ADD COLUMN IF NOT EXISTS pinned_by uuid NOT NULL;
ALTER TABLE public.pinned_conversations ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;
ALTER TABLE public.pinned_conversations ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.pinned_conversations'::regclass) THEN
    ALTER TABLE public.pinned_conversations ADD CONSTRAINT pinned_conversations_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pinned_conversations_contact_id_pinned_by_key' AND conrelid='public.pinned_conversations'::regclass) THEN
    ALTER TABLE public.pinned_conversations ADD CONSTRAINT pinned_conversations_contact_id_pinned_by_key UNIQUE (contact_id, pinned_by);
  END IF;
END $$;
ALTER TABLE public.pinned_conversations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.playbooks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playbooks ();
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'::text NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS steps jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.playbooks ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.playbooks'::regclass) THEN
    ALTER TABLE public.playbooks ADD CONSTRAINT playbooks_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products ();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL'::text NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retailer_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.products'::regclass) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='products_sku_key' AND conrelid='public.products'::regclass) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_sku_key UNIQUE (sku);
  END IF;
END $$;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles ();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'agent'::text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_chats integer DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'basic'::text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS session_invalidated_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS can_download boolean DEFAULT false NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.profiles'::regclass) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_user_id_key' AND conrelid='public.profiles'::regclass) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_role_check' AND conrelid='public.profiles'::regclass) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'supervisor'::text, 'agent'::text])));
  END IF;
END $$;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.query_telemetry
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.query_telemetry ();
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS operation text DEFAULT 'select'::text NOT NULL;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS table_name text;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS rpc_name text;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS duration_ms integer DEFAULT 0 NOT NULL;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS record_count integer;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS query_limit integer;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS query_offset integer;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS count_mode text;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS severity text DEFAULT 'normal'::text NOT NULL;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.query_telemetry'::regclass) THEN
    ALTER TABLE public.query_telemetry ADD CONSTRAINT query_telemetry_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.query_telemetry ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.queue_goals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queue_goals ();
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS queue_id uuid NOT NULL;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS max_waiting_contacts integer DEFAULT 10;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS max_avg_wait_minutes integer DEFAULT 15;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS min_assignment_rate integer DEFAULT 80;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS max_messages_pending integer DEFAULT 50;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS alerts_enabled boolean DEFAULT true;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.queue_goals ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.queue_goals'::regclass) THEN
    ALTER TABLE public.queue_goals ADD CONSTRAINT queue_goals_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='queue_goals_queue_id_key' AND conrelid='public.queue_goals'::regclass) THEN
    ALTER TABLE public.queue_goals ADD CONSTRAINT queue_goals_queue_id_key UNIQUE (queue_id);
  END IF;
END $$;
ALTER TABLE public.queue_goals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.queue_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queue_members ();
ALTER TABLE public.queue_members ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.queue_members ADD COLUMN IF NOT EXISTS queue_id uuid NOT NULL;
ALTER TABLE public.queue_members ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.queue_members ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.queue_members ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.queue_members'::regclass) THEN
    ALTER TABLE public.queue_members ADD CONSTRAINT queue_members_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='queue_members_queue_id_profile_id_key' AND conrelid='public.queue_members'::regclass) THEN
    ALTER TABLE public.queue_members ADD CONSTRAINT queue_members_queue_id_profile_id_key UNIQUE (queue_id, profile_id);
  END IF;
END $$;
ALTER TABLE public.queue_members ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.queue_positions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queue_positions ();
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS queue_id uuid NOT NULL;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS estimated_wait_minutes integer;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS entered_at timestamp with time zone DEFAULT now();
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS notified boolean DEFAULT false;
ALTER TABLE public.queue_positions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.queue_positions'::regclass) THEN
    ALTER TABLE public.queue_positions ADD CONSTRAINT queue_positions_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.queue_positions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.queue_skill_requirements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queue_skill_requirements ();
ALTER TABLE public.queue_skill_requirements ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.queue_skill_requirements ADD COLUMN IF NOT EXISTS queue_id uuid NOT NULL;
ALTER TABLE public.queue_skill_requirements ADD COLUMN IF NOT EXISTS skill_name text NOT NULL;
ALTER TABLE public.queue_skill_requirements ADD COLUMN IF NOT EXISTS min_level integer DEFAULT 1;
ALTER TABLE public.queue_skill_requirements ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.queue_skill_requirements'::regclass) THEN
    ALTER TABLE public.queue_skill_requirements ADD CONSTRAINT queue_skill_requirements_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='queue_skill_requirements_queue_id_skill_name_key' AND conrelid='public.queue_skill_requirements'::regclass) THEN
    ALTER TABLE public.queue_skill_requirements ADD CONSTRAINT queue_skill_requirements_queue_id_skill_name_key UNIQUE (queue_id, skill_name);
  END IF;
END $$;
ALTER TABLE public.queue_skill_requirements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.queues
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queues ();
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6'::text NOT NULL;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS max_wait_time_minutes integer DEFAULT 30;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.queues ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.queues'::regclass) THEN
    ALTER TABLE public.queues ADD CONSTRAINT queues_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.rate_limit_configs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_configs ();
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS endpoint_pattern text NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS max_requests integer DEFAULT 100 NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS window_seconds integer DEFAULT 60 NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS block_duration_minutes integer DEFAULT 15 NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.rate_limit_configs ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.rate_limit_configs'::regclass) THEN
    ALTER TABLE public.rate_limit_configs ADD CONSTRAINT rate_limit_configs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.rate_limit_configs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.rate_limit_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_logs ();
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS ip_address text NOT NULL;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS endpoint text NOT NULL;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS request_count integer DEFAULT 1 NOT NULL;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.rate_limit_logs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.rate_limit_logs'::regclass) THEN
    ALTER TABLE public.rate_limit_logs ADD CONSTRAINT rate_limit_logs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.reminders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders ();
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS profile_id uuid NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS remind_at timestamp with time zone NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS is_dismissed boolean DEFAULT false NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.reminders'::regclass) THEN
    ALTER TABLE public.reminders ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.role_permissions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions ();
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS role app_role NOT NULL;
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS permission_id uuid NOT NULL;
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.role_permissions'::regclass) THEN
    ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='role_permissions_role_permission_id_key' AND conrelid='public.role_permissions'::regclass) THEN
    ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_permission_id_key UNIQUE (role, permission_id);
  END IF;
END $$;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.sales_deals
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_deals ();
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS value numeric(12,2) DEFAULT 0;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL'::text;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS stage_id uuid;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS assigned_to uuid;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'::text;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS expected_close_date date;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS status text DEFAULT 'open'::text;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS won_at timestamp with time zone;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS lost_at timestamp with time zone;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS lost_reason text;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.sales_deals'::regclass) THEN
    ALTER TABLE public.sales_deals ADD CONSTRAINT sales_deals_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.sales_pipeline_stages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_pipeline_stages ();
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS color text DEFAULT '#3b82f6'::text NOT NULL;
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.sales_pipeline_stages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.sales_pipeline_stages'::regclass) THEN
    ALTER TABLE public.sales_pipeline_stages ADD CONSTRAINT sales_pipeline_stages_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.sales_pipeline_stages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.saved_filters
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_filters ();
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS entity_type text NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS filters jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.saved_filters'::regclass) THEN
    ALTER TABLE public.saved_filters ADD CONSTRAINT saved_filters_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.scheduled_messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_messages ();
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS content text NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text'::text NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'::text NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS whatsapp_connection_id uuid;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.scheduled_messages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.scheduled_messages'::regclass) THEN
    ALTER TABLE public.scheduled_messages ADD CONSTRAINT scheduled_messages_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.scheduled_report_configs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_report_configs ();
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'dashboard'::text NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'weekly'::text NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS recipients text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS next_send_at timestamp with time zone;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS config jsonb DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.scheduled_report_configs ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.scheduled_report_configs'::regclass) THEN
    ALTER TABLE public.scheduled_report_configs ADD CONSTRAINT scheduled_report_configs_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.scheduled_report_configs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.scheduled_reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_reports ();
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'dashboard_summary'::text NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'weekly'::text NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS recipients text[] DEFAULT '{}'::text[] NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS format text DEFAULT 'pdf'::text NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS next_send_at timestamp with time zone;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS last_sent_at timestamp with time zone;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.scheduled_reports'::regclass) THEN
    ALTER TABLE public.scheduled_reports ADD CONSTRAINT scheduled_reports_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.security_alerts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_alerts ();
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS alert_type text NOT NULL;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium'::text NOT NULL;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS is_resolved boolean DEFAULT false;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS resolved_by uuid;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
ALTER TABLE public.security_alerts ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.security_alerts'::regclass) THEN
    ALTER TABLE public.security_alerts ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.sicoob_contact_mapping
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sicoob_contact_mapping ();
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS contact_id uuid NOT NULL;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS sicoob_user_id text NOT NULL;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS sicoob_vendedor_id text NOT NULL;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS sicoob_singular_id text NOT NULL;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS zappweb_agent_id uuid;
ALTER TABLE public.sicoob_contact_mapping ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.sicoob_contact_mapping'::regclass) THEN
    ALTER TABLE public.sicoob_contact_mapping ADD CONSTRAINT sicoob_contact_mapping_pkey PRIMARY KEY (id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sicoob_contact_mapping_sicoob_user_id_sicoob_singular_id_key' AND conrelid='public.sicoob_contact_mapping'::regclass) THEN
    ALTER TABLE public.sicoob_contact_mapping ADD CONSTRAINT sicoob_contact_mapping_sicoob_user_id_sicoob_singular_id_key UNIQUE (sicoob_user_id, sicoob_singular_id);
  END IF;
END $$;
ALTER TABLE public.sicoob_contact_mapping ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.sla_configurations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sla_configurations ();
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS first_response_minutes integer DEFAULT 5 NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS resolution_minutes integer DEFAULT 60 NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'::text NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.sla_configurations ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.sla_configurations'::regclass) THEN
    ALTER TABLE public.sla_configurations ADD CONSTRAINT sla_configurations_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.sla_rules
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sla_rules ();
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS name text NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS first_response_minutes integer DEFAULT 5 NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS resolution_minutes integer DEFAULT 60 NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0 NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS contact_id uuid;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS contact_type text;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS queue_id uuid;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.sla_rules ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='' AND conrelid='public.sla_rules'::regclass) THEN
    ALTER TABLE public.sla_rules ADD CONSTRAINT sla_rules_pkey PRIMARY KEY (id);
  END IF;
END $$;
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- TABLE: public.stickers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stickers ();
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS image_url text NOT NULL;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS category text DEFAULT 'geral'::text;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS uploaded_by text;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.stickers ADD COLUMN IF NOT EXISTS owner_id uuid;
